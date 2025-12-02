"""
Test Duration Filtering Logic
Demonstrates how videos are filtered based on original song duration
"""

def test_duration_filter():
    # Example: Original song is 3 minutes 30 seconds (210 seconds)
    original_song_duration_ms = 210000  # 3:30 in milliseconds
    original_duration_sec = original_song_duration_ms / 1000  # 210 seconds
    
    duration_tolerance_sec = 60  # 1 minute tolerance
    
    # Example YouTube search results with different durations
    test_videos = [
        {"title": "Original Song", "duration_sec": 210},      # Exact match
        {"title": "Official Audio", "duration_sec": 212},     # 2 sec longer - KEEP
        {"title": "Lyric Video", "duration_sec": 215},        # 5 sec longer - KEEP
        {"title": "Extended Mix", "duration_sec": 300},       # 90 sec longer - KEEP
        {"title": "Radio Edit", "duration_sec": 180},         # 30 sec shorter - KEEP (within tolerance)
        {"title": "Short Clip", "duration_sec": 120},         # 90 sec shorter - FILTER OUT (beyond tolerance)
        {"title": "YouTube Short", "duration_sec": 45},       # Very short - FILTER OUT
        {"title": "Cover Version", "duration_sec": 140},      # 70 sec shorter - FILTER OUT
    ]
    
    print(f"Original Song Duration: {original_duration_sec} seconds ({original_duration_sec/60:.1f} minutes)")
    print(f"Duration Tolerance: {duration_tolerance_sec} seconds\n")
    print("=" * 80)
    print("VIDEO FILTERING RESULTS")
    print("=" * 80)
    
    kept_videos = []
    filtered_videos = []
    
    for video in test_videos:
        video_duration = video["duration_sec"]
        duration_diff = original_duration_sec - video_duration
        
        # Apply filters
        if video_duration < 60:
            status = "FILTERED OUT (YouTube Short)"
            filtered_videos.append(video)
        elif duration_diff > duration_tolerance_sec:
            status = f"FILTERED OUT (Too short by {duration_diff:.0f}s)"
            filtered_videos.append(video)
        else:
            if duration_diff < 0:
                status = f"KEPT (Longer by {abs(duration_diff):.0f}s)"
            elif duration_diff == 0:
                status = "KEPT (Exact match)"
            else:
                status = f"KEPT (Shorter by {duration_diff:.0f}s, within tolerance)"
            kept_videos.append((video, abs(duration_diff)))
    
        print(f"{video['title']:20s} | {video_duration:3d}s ({video_duration/60:.1f}m) | {status}")
    
    print("\n" + "=" * 80)
    print(f"SUMMARY: {len(kept_videos)} videos kept, {len(filtered_videos)} filtered out")
    print("=" * 80)
    
    # Sort kept videos by duration match (closest first)
    kept_videos.sort(key=lambda x: x[1])
    
    print("\nFINAL RESULTS (sorted by duration match):")
    print("-" * 80)
    for video, diff in kept_videos:
        print(f"  {video['title']:20s} | Duration: {video['duration_sec']:3d}s | Diff: {diff:.0f}s")
    
    print("\n✓ Videos that are longer than the original: KEPT")
    print("✓ Videos within 60 seconds shorter: KEPT")
    print("✗ Videos more than 60 seconds shorter: FILTERED OUT")
    print("✗ Videos under 60 seconds total: FILTERED OUT (YouTube Shorts)")

if __name__ == "__main__":
    test_duration_filter()
