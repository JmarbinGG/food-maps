#!/usr/bin/env python3
import sqlite3
import os

# Connect to database
db_path = "/home/ec2-user/project/food_maps.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Get current columns
    cursor.execute("PRAGMA table_info(users)")
    existing_cols = {row[1] for row in cursor.fetchall()}
    print("Existing columns:", existing_cols)
    
    # Add missing columns
    missing_cols = [
        ("vehicle_capacity_kg", "FLOAT"),
        ("has_refrigeration", "BOOLEAN DEFAULT 0"),
        ("reset_token", "VARCHAR(10)"),
        ("reset_token_expiry", "DATETIME")
    ]
    
    for col_name, col_type in missing_cols:
        if col_name not in existing_cols:
            try:
                cursor.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}")
                print(f"Added column: {col_name}")
            except Exception as e:
                print(f"Error adding {col_name}: {e}")
    
    conn.commit()
    print("Database updated successfully!")
    
except Exception as e:
    print(f"Error: {e}")
finally:
    conn.close()