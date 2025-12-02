"""
Quick script to add a test artist for demo
"""
from database import Database

# Initialize database
db = Database()

# Add Drake as a test artist
print("Adding test artist...")
artist_id = db.add_artist(
    name="Drake",
    email="drake@ovo.com",
    contact_person="OVO Sound Manager",
    notes="Test artist for auto-update demonstration"
)

if artist_id:
    print(f"SUCCESS! Artist added with ID: {artist_id}")
else:
    print("Artist already exists or error occurred")

# Show all artists
print("\nCurrent artists in database:")
artists = db.get_all_artists()
if artists:
    for artist in artists:
        print(f"  - ID {artist.id}: {artist.name} ({artist.email or 'no email'})")
else:
    print("  No artists found")

print("\nYou can now:")
print("1. Go to the frontend")
print("2. Click the Auto-Update tab")
print("3. You should see Drake listed")
print("4. Click 'Enable Auto-Update'")
print("5. Click 'Update Now' to fetch all his songs!")
