"""
Add test videos to the database for testing delete functionality
"""
from database import Database
from datetime import datetime

def add_test_videos():
    print("=" * 60)
    print("ADDING TEST VIDEOS")
    print("=" * 60)
    
    db = Database('videos.db')
    
    test_videos = [
        {
            'video_id': 'TEST001',
            'title': 'Test Video 1 - Delete Test',
            'channel_name': 'Test Channel',
            'channel_id': 'UC_TEST',
            'publish_date': '2024-01-01',
            'thumbnail_url': 'https://example.com/thumb1.jpg',
            'video_url': 'https://youtube.com/watch?v=TEST001',
            'matched_keyword': 'test keyword',
            'status': 'Pending',
            'priority': 'Medium'
        },
        {
            'video_id': 'TEST002',
            'title': 'Test Video 2 - Batch Delete Test',
            'channel_name': 'Test Channel',
            'channel_id': 'UC_TEST',
            'publish_date': '2024-01-01',
            'thumbnail_url': 'https://example.com/thumb2.jpg',
            'video_url': 'https://youtube.com/watch?v=TEST002',
            'matched_keyword': 'test keyword',
            'status': 'Pending',
            'priority': 'High'
        },
        {
            'video_id': 'TEST003',
            'title': 'Test Video 3 - Batch Delete Test',
            'channel_name': 'Test Channel',
            'channel_id': 'UC_TEST',
            'publish_date': '2024-01-01',
            'thumbnail_url': 'https://example.com/thumb3.jpg',
            'video_url': 'https://youtube.com/watch?v=TEST003',
            'matched_keyword': 'test keyword',
            'status': 'Pending',
            'priority': 'Low'
        },
        {
            'video_id': 'TEST004',
            'title': 'Test Video 4 - Clear All Test',
            'channel_name': 'Test Channel',
            'channel_id': 'UC_TEST',
            'publish_date': '2024-01-01',
            'thumbnail_url': 'https://example.com/thumb4.jpg',
            'video_url': 'https://youtube.com/watch?v=TEST004',
            'matched_keyword': 'test keyword',
            'status': 'Reviewed',
            'priority': 'Critical'
        },
        {
            'video_id': 'TEST005',
            'title': 'Test Video 5 - Clear All Test',
            'channel_name': 'Test Channel 2',
            'channel_id': 'UC_TEST2',
            'publish_date': '2024-01-01',
            'thumbnail_url': 'https://example.com/thumb5.jpg',
            'video_url': 'https://youtube.com/watch?v=TEST005',
            'matched_keyword': 'test keyword 2',
            'status': 'Flagged for Takedown',
            'priority': 'High'
        }
    ]
    
    conn = db.get_connection()
    cursor = conn.cursor()
    
    added = 0
    for video in test_videos:
        try:
            cursor.execute('''
                INSERT INTO videos (
                    video_id, title, channel_name, channel_id, 
                    publish_date, thumbnail_url, video_url, 
                    matched_keyword, status, priority, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                video['video_id'],
                video['title'],
                video['channel_name'],
                video['channel_id'],
                video['publish_date'],
                video['thumbnail_url'],
                video['video_url'],
                video['matched_keyword'],
                video['status'],
                video['priority'],
                datetime.now().isoformat()
            ))
            added += 1
            print(f"Added: {video['title']}")
        except Exception as e:
            print(f"Skipped {video['title']}: {e}")
    
    conn.commit()
    
    # Get total count
    cursor.execute('SELECT COUNT(*) FROM videos')
    total = cursor.fetchone()[0]
    
    conn.close()
    
    print(f"\n{added} test videos added successfully!")
    print(f"Total videos in database: {total}")
    print("=" * 60)

if __name__ == '__main__':
    add_test_videos()
