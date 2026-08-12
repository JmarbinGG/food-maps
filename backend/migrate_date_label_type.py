#!/usr/bin/env python3
"""
Migration script to add date_label_type column to food_resources table
This supports the expiration education feature
"""

from sqlalchemy import create_engine, Column, String, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

# Database connection
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is required")
engine = create_engine(DATABASE_URL.strip('"'))  # Strip quotes if present
Session = sessionmaker(bind=engine)

def migrate():
    """Add date_label_type column to food_resources table"""
    print("Starting migration: add date_label_type column...")
    
    with engine.connect() as conn:
        # Check if column already exists
        result = conn.execute(text("""
            SELECT COUNT(*) as count 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = 'foodapitest' 
            AND TABLE_NAME = 'food_resources' 
            AND COLUMN_NAME = 'date_label_type'
        """))
        
        exists = result.fetchone()[0] > 0
        
        if exists:
            print("✓ Column 'date_label_type' already exists")
            return
        
        # Add the column
        print("Adding 'date_label_type' column to food_resources table...")
        conn.execute(text("""
            ALTER TABLE food_resources 
            ADD COLUMN date_label_type VARCHAR(50) NULL 
            AFTER expiration_date
        """))
        conn.commit()
        
        print("✓ Successfully added 'date_label_type' column")
        
        # Verify
        result = conn.execute(text("""
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = 'foodapitest' 
            AND TABLE_NAME = 'food_resources' 
            AND COLUMN_NAME = 'date_label_type'
        """))
        
        row = result.fetchone()
        if row:
            print(f"  Column details: {row[0]} ({row[1]}) - Nullable: {row[2]}")
        
    print("\n✅ Migration completed successfully!")

if __name__ == "__main__":
    try:
        migrate()
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        raise
