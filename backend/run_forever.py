#!/usr/bin/env python3
"""
Wrapper script to run the FastAPI server with auto-restart on crashes.
This ensures the server keeps running even if it encounters errors.

Background jobs that live inside the FastAPI process (and therefore are
kept alive by this wrapper):

  * backend.ai.routes.reminder_loop       - SMS reminder delivery
  * backend.ai.notifications.broadcast_loop - hourly scan of new food
      listings; drafts personalised SMS / in-app messages that an
      admin reviews and approves at /api/ai/broadcasts

Both loops are scheduled in ``backend.ai.routes.start_background_jobs``
which is invoked from the FastAPI startup event in ``backend.app``.
"""

import subprocess
import sys
import time
import logging
from datetime import datetime

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/home/ec2-user/project/backend/server.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

def run_server():
    """Run the FastAPI server with auto-restart on crashes."""
    restart_count = 0
    max_rapid_restarts = 5
    rapid_restart_window = 60  # seconds
    restart_times = []
    
    logger.info("Starting Food Maps API server with auto-restart...")
    
    while True:
        try:
            current_time = time.time()
            
            # Check for rapid restarts
            restart_times = [t for t in restart_times if current_time - t < rapid_restart_window]
            
            if len(restart_times) >= max_rapid_restarts:
                logger.error(f"Server crashed {max_rapid_restarts} times in {rapid_restart_window}s. Waiting 60s before retry...")
                time.sleep(60)
                restart_times.clear()
            
            # Start the server
            logger.info(f"Starting server (restart #{restart_count})...")
            
            process = subprocess.Popen(
                [
                    sys.executable, '-m', 'uvicorn',
                    'app:app',
                    '--host', '0.0.0.0',
                    '--port', '8000',
                    '--workers', '4',
                    '--log-level', 'info'
                ],
                cwd='/home/ec2-user/project/backend',
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                universal_newlines=True
            )
            
            # Stream output
            for line in process.stdout:
                print(line, end='')
                sys.stdout.flush()
            
            # Wait for process to exit
            exit_code = process.wait()
            
            if exit_code == 0:
                logger.info("Server stopped gracefully.")
                break
            else:
                logger.warning(f"Server exited with code {exit_code}. Restarting in 5 seconds...")
                restart_times.append(current_time)
                restart_count += 1
                time.sleep(5)
                
        except KeyboardInterrupt:
            logger.info("Received shutdown signal. Stopping server...")
            if process:
                process.terminate()
                process.wait(timeout=10)
            break
            
        except Exception as e:
            logger.error(f"Unexpected error: {e}. Restarting in 10 seconds...")
            restart_times.append(time.time())
            restart_count += 1
            time.sleep(10)

if __name__ == '__main__':
    run_server()
