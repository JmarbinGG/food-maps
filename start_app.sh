#!/bin/bash

# Start the backend API server
echo "Starting Food Maps backend server..."
cd /home/ec2-user/project/backend
python3 -m uvicorn app:app --host 0.0.0.0 --port 8001 &
BACKEND_PID=$!

echo "Backend server started with PID: $BACKEND_PID"
echo "Backend API available at: http://localhost:8001"
echo "Frontend available at: http://localhost:8001 (served by FastAPI)"

# Keep the script running
wait $BACKEND_PID