#!/usr/bin/env python3
"""
Fix verification_status enum values in database
Convert string values to match enum expectations
"""

from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import os

# Database connection
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is required")
engine = create_engine(DATABASE_URL.strip('"'))

def fix_verification_status():
    """Update verification_status column type and values"""
    print("Fixing verification_status values...")
    
    with engine.connect() as conn:
        # Check current column type
        result = conn.execute(text("""
            SELECT COLUMN_TYPE
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = 'foodapitest' 
            AND TABLE_NAME = 'food_resources' 
            AND COLUMN_NAME = 'verification_status'
        """))
        
        col_type = result.fetchone()
        if col_type:
            print(f"Current column type: {col_type[0]}")
        
        # Get count of each value
        result = conn.execute(text("""
            SELECT verification_status, COUNT(*) as count
            FROM food_resources
            GROUP BY verification_status
        """))
        
        print("\nCurrent values:")
        for row in result:
            print(f"  {row[0]}: {row[1]} rows")
        
        # Change column to VARCHAR if it's ENUM
        print("\nChanging column to VARCHAR...")
        conn.execute(text("""
            ALTER TABLE food_resources 
            MODIFY COLUMN verification_status VARCHAR(50) NULL DEFAULT 'not_required'
        """))
        conn.commit()
        
        print("✓ Column changed to VARCHAR")
        
        # Verify
        result = conn.execute(text("""
            SELECT verification_status, COUNT(*) as count
            FROM food_resources
            GROUP BY verification_status
        """))
        
        print("\nFinal values:")
        for row in result:
            print(f"  {row[0]}: {row[1]} rows")
    
    print("\n✅ Fix completed successfully!")

if __name__ == "__main__":
    try:
        fix_verification_status()
    except Exception as e:
        print(f"\n❌ Fix failed: {e}")
        import traceback
        traceback.print_exc()
        raise
