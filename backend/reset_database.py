#!/usr/bin/env python
"""Reset database - create fresh tables"""

import os
from database_enhanced import Database

print("="*50)
print("DATABASE RESET UTILITY")
print("="*50)
print()

db_path = "videos.db"

if os.path.exists(db_path):
    print(f"Found existing database: {db_path}")
    print("Creating backup...")
    
    # Create backup with timestamp
    from datetime import datetime
    backup_name = f"videos.db.backup.{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    import shutil
    shutil.copy(db_path, backup_name)
    print(f"✓ Backup created: {backup_name}")
    
    print()
    print("Deleting old database...")
    os.remove(db_path)
    print("✓ Old database deleted")
else:
    print("No existing database found")

print()
print("Creating fresh database...")
db = Database(db_path)
print("✓ Fresh database created!")

print()
print("="*50)
print("DATABASE RESET COMPLETE!")
print("="*50)
print()
print("Fresh database with:")
print("  - 0 videos")
print("  - 0 keywords")
print("  - 0 artists")
print("  - 0 auto-flag rules")
print("  - 0 search logs")
print()
print("Start backend and begin fresh!")
print()
