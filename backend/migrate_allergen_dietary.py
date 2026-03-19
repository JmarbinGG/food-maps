#!/usr/bin/env python3
"""
Migration script to add allergen and dietary information columns to food_resources table
"""

from sqlalchemy import create_engine, text
import os

# Database connection
DATABASE_URL = os.getenv('DATABASE_URL', 'mysql+pymysql://admin:rtp6HQD8emudbf5bdw@foodapitest.cj8ia4gu0tvd.us-west-1.rds.amazonaws.com:3306/foodapitest')
engine = create_engine(DATABASE_URL.strip('"'))

def migrate():
    """Add allergen and dietary information columns"""
    print("Starting migration: add allergen and dietary columns...")
    
    columns_to_add = [
        ("allergens", "TEXT NULL", "Allergen list (JSON array)"),
        ("contamination_warning", "VARCHAR(100) NULL", "Cross-contamination warning"),
        ("dietary_tags", "TEXT NULL", "Dietary tags (JSON array)"),
        ("ingredients_list", "TEXT NULL", "Full ingredients list")
    ]
    
    with engine.connect() as conn:
        for col_name, col_type, description in columns_to_add:
            # Check if column exists
            result = conn.execute(text(f"""
                SELECT COUNT(*) as count 
                FROM information_schema.COLUMNS 
                WHERE TABLE_SCHEMA = 'foodapitest' 
                AND TABLE_NAME = 'food_resources' 
                AND COLUMN_NAME = '{col_name}'
            """))
            
            exists = result.fetchone()[0] > 0
            
            if exists:
                print(f"✓ Column '{col_name}' already exists")
                continue
            
            # Add the column
            print(f"Adding '{col_name}' column ({description})...")
            conn.execute(text(f"""
                ALTER TABLE food_resources 
                ADD COLUMN {col_name} {col_type}
            """))
            conn.commit()
            
            print(f"✓ Successfully added '{col_name}' column")
        
        # Verify all columns
        print("\nVerifying columns...")
        result = conn.execute(text("""
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = 'foodapitest' 
            AND TABLE_NAME = 'food_resources' 
            AND COLUMN_NAME IN ('allergens', 'contamination_warning', 'dietary_tags', 'ingredients_list')
            ORDER BY COLUMN_NAME
        """))
        
        print("\nColumn details:")
        for row in result:
            print(f"  {row[0]} ({row[1]}) - Nullable: {row[2]}")
    
    print("\n✅ Migration completed successfully!")

if __name__ == "__main__":
    try:
        migrate()
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        raise
