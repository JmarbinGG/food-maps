"""
Database Migration: Add SMS Consent Fields
Adds Twilio-compliant SMS consent tracking to users table
"""
import mysql.connector
import os
import re
from dotenv import load_dotenv

# Load .env from project root (absolute path)
project_root = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
env_path = os.path.join(project_root, '.env')
print(f"Loading .env from: {env_path}")
load_dotenv(env_path)

def parse_database_url(database_url):
    """Parse DATABASE_URL into connection parameters"""
    # Format: mysql+pymysql://user:password@host:port/database
    pattern = r'mysql\+pymysql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)'
    match = re.match(pattern, database_url)
    if match:
        return {
            'user': match.group(1),
            'password': match.group(2),
            'host': match.group(3),
            'port': int(match.group(4)),
            'database': match.group(5)
        }
    return None

def migrate():
    """Add SMS consent fields to users table"""
    
    # Get database connection info from DATABASE_URL
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("ERROR: DATABASE_URL not found in .env file")
        return
    
    db_params = parse_database_url(database_url)
    if not db_params:
        print(f"ERROR: Could not parse DATABASE_URL: {database_url}")
        return
    
    print(f"Connecting to database: {db_params['database']} at {db_params['host']}")
    
    conn = mysql.connector.connect(**db_params)
    cursor = conn.cursor()
    
    print("Starting SMS consent migration...")
    
    try:
        # Add sms_consent_given column (explicit user consent)
        print("Adding sms_consent_given column...")
        try:
            cursor.execute("""
                ALTER TABLE users 
                ADD COLUMN sms_consent_given BOOLEAN DEFAULT FALSE
            """)
            print("✓ sms_consent_given column added")
        except mysql.connector.Error as e:
            if "Duplicate column name" in str(e):
                print("  (sms_consent_given column already exists)")
            else:
                raise
        
        # Add sms_consent_date column (when consent was given)
        print("Adding sms_consent_date column...")
        try:
            cursor.execute("""
                ALTER TABLE users 
                ADD COLUMN sms_consent_date DATETIME NULL
            """)
            print("✓ sms_consent_date column added")
        except mysql.connector.Error as e:
            if "Duplicate column name" in str(e):
                print("  (sms_consent_date column already exists)")
            else:
                raise
        
        # Add sms_notification_types column (JSON: which notifications user wants)
        print("Adding sms_notification_types column...")
        try:
            cursor.execute("""
                ALTER TABLE users 
                ADD COLUMN sms_notification_types TEXT NULL
            """)
            print("✓ sms_notification_types column added")
        except mysql.connector.Error as e:
            if "Duplicate column name" in str(e):
                print("  (sms_notification_types column already exists)")
            else:
                raise
        
        # Add sms_opt_out_date column (when user opted out, if ever)
        print("Adding sms_opt_out_date column...")
        try:
            cursor.execute("""
                ALTER TABLE users 
                ADD COLUMN sms_opt_out_date DATETIME NULL
            """)
            print("✓ sms_opt_out_date column added")
        except mysql.connector.Error as e:
            if "Duplicate column name" in str(e):
                print("  (sms_opt_out_date column already exists)")
            else:
                raise
        
        # Add sms_consent_ip column (IP address when consent given - for legal compliance)
        print("Adding sms_consent_ip column...")
        try:
            cursor.execute("""
                ALTER TABLE users 
                ADD COLUMN sms_consent_ip VARCHAR(50) NULL
            """)
            print("✓ sms_consent_ip column added")
        except mysql.connector.Error as e:
            if "Duplicate column name" in str(e):
                print("  (sms_consent_ip column already exists)")
            else:
                raise
        
        conn.commit()
        print("\n✅ SMS consent migration completed successfully!")
        
        # Show sample data structure
        print("\nSMS Consent Fields Added:")
        print("- sms_consent_given: BOOLEAN (default FALSE)")
        print("- sms_consent_date: DATETIME (when consent was given)")
        print("- sms_notification_types: TEXT (JSON array of notification types)")
        print("- sms_opt_out_date: DATETIME (when user opted out)")
        print("- sms_consent_ip: VARCHAR(50) (IP address for compliance)")
        
    except Exception as e:
        print(f"\n❌ Error during migration: {e}")
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    migrate()
