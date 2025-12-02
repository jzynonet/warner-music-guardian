#!/usr/bin/env python
"""Test if all imports work"""

print("Testing imports...")

try:
    print("1. Testing database_enhanced...")
    from database_enhanced import Database
    print("   OK - database_enhanced imported successfully")
except Exception as e:
    print(f"   ERROR: {e}")
    exit(1)

try:
    print("2. Testing models...")
    from models import Video, Artist, Keyword
    print("   OK - models imported successfully")
except Exception as e:
    print(f"   ERROR: {e}")
    exit(1)

try:
    print("3. Testing bulk_import...")
    from bulk_import import BulkImporter
    print("   OK - bulk_import imported successfully")
except Exception as e:
    print(f"   ERROR: {e}")
    exit(1)

try:
    print("4. Testing email_service...")
    from email_service import EmailService
    print("   OK - email_service imported successfully")
except Exception as e:
    print(f"   ERROR: {e}")
    exit(1)

try:
    print("5. Testing youtube_service...")
    from youtube_service import YouTubeService
    print("   OK - youtube_service imported successfully")
except Exception as e:
    print(f"   ERROR: {e}")
    exit(1)

print("\nOK - All imports successful!")
print("\nNow testing database initialization...")

try:
    db = Database("test.db")
    print("OK - Database initialized successfully")
    
    # Clean up test db
    import os
    if os.path.exists("test.db"):
        os.remove("test.db")
    print("OK - Test database cleaned up")
    
except Exception as e:
    print(f"ERROR initializing database: {e}")
    import traceback
    traceback.print_exc()
    exit(1)

print("\n" + "="*50)
print("ALL TESTS PASSED! Backend should work.")
print("="*50)
print("\nYou can now run: python app.py")
