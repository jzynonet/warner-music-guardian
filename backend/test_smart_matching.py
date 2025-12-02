"""
Test the new smart matching and filtering features
"""
from youtube_service import YouTubeService

# Create a mock service instance to test the helper methods
class TestYouTubeService(YouTubeService):
    def __init__(self):
        # Skip API initialization for testing
        self.api_key = "test"
        self.youtube = None

# Create test instance
service = TestYouTubeService()

print("=" * 80)
print("TESTING: Featuring Filter (_is_featured_not_main)")
print("=" * 80)

# Test cases for featuring detection
test_cases = [
    # (title, channel, artist, should_filter, description)
    ("Nkosazana Daughter - Song Name", "Official", "Nkosazana Daughter", False, "Main artist at start"),
    ("Song Name - Nkosazana Daughter", "Channel", "Nkosazana Daughter", False, "Main artist after dash"),
    ("Drake feat. Nkosazana Daughter", "Channel", "Nkosazana Daughter", True, "Featured artist (should filter)"),
    ("Artist ft. Nkosazana Daughter", "Channel", "Nkosazana Daughter", True, "Featured artist ft. (should filter)"),
    ("Song (feat. Nkosazana Daughter)", "Channel", "Nkosazana Daughter", True, "Featured in parens (should filter)"),
    ("Nkosazana Daughter feat. Drake", "Channel", "Nkosazana Daughter", False, "Main artist with feature"),
    ("Nkosazana Daughter & Other Artist", "Channel", "Nkosazana Daughter", False, "Main in collaboration"),
    ("Someone x Nkosazana Daughter", "Channel", "Nkosazana Daughter", True, "Second in collab (should filter)"),
]

print("\nTest Results:")
print("-" * 80)
for title, channel, artist, expected_filter, description in test_cases:
    result = service._is_featured_not_main(title, channel, artist)
    status = "[PASS]" if result == expected_filter else "[FAIL]"
    action = "FILTER OUT" if result else "KEEP"
    
    print(f"{status} | {action:12} | {description}")
    print(f"      Title: \"{title}\"")
    if result != expected_filter:
        print(f"      ERROR: Expected {expected_filter}, got {result}")
    print()

print("=" * 80)
print("TESTING: Match Quality Scoring (_calculate_match_score)")
print("=" * 80)

# Test match scoring
scoring_tests = [
    {
        "title": "Nkosazana Daughter - Happiness (Official Audio)",
        "channel": "Nkosazana Daughter",
        "song": "Happiness",
        "artist": "Nkosazana Daughter",
        "video_duration": 240,
        "original_duration": 240,
        "description": "Perfect match (exact duration + exact names)"
    },
    {
        "title": "Happiness - Nkosazana Daughter Official Music Video",
        "channel": "Some Channel",
        "song": "Happiness",
        "artist": "Nkosazana Daughter",
        "video_duration": 242,
        "original_duration": 240,
        "description": "Very good match (2 sec difference)"
    },
    {
        "title": "Happiness cover by someone",
        "channel": "Random",
        "song": "Happiness",
        "artist": "Nkosazana Daughter",
        "video_duration": 200,
        "original_duration": 240,
        "description": "Cover (should have low score - penalty)"
    },
    {
        "title": "Some Random Video",
        "channel": "Channel",
        "song": "Happiness",
        "artist": "Nkosazana Daughter",
        "video_duration": 180,
        "original_duration": 240,
        "description": "No match (very low score)"
    },
]

print("\nScoring Results:")
print("-" * 80)
for test in scoring_tests:
    score = service._calculate_match_score(
        test["title"],
        test["channel"],
        test["song"],
        test["artist"],
        test["video_duration"],
        test["original_duration"]
    )
    
    # Determine priority based on score
    if score >= 90:
        priority = "CRITICAL"
    elif score >= 75:
        priority = "HIGH"
    elif score >= 50:
        priority = "MEDIUM"
    else:
        priority = "LOW"
    
    print(f"Score: {score:3d}/100 | Priority: {priority:8} | {test['description']}")
    print(f"       Title: \"{test['title']}\"")
    print()

print("=" * 80)
print("SUMMARY")
print("=" * 80)
print("""
[+] Featuring Filter: Removes videos where your artist is only featured (not main)
[+] Smart Scoring: Scores matches 0-100 based on:
  - Exact duration match: Up to 40 points (HIGHEST PRIORITY)
  - Song name exact match: 25 points
  - Artist name exact match: 20 points
  - Official markers: 5 points
  - Penalties for covers/remixes: -10 points

[+] Auto Priority Assignment:
  - Critical (90-100): Perfect matches (exact duration + exact names)
  - High (75-89): Very good matches
  - Medium (50-74): Good matches
  - Low (0-49): Weak matches

[+] Results are sorted by match score (highest first)
""")
