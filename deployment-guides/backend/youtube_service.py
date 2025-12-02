from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from typing import List, Dict, Optional
from datetime import datetime
from models import Video
import os

class YouTubeService:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.youtube = None
        self._initialize_service()
    
    def _initialize_service(self):
        if not self.api_key or self.api_key == "your_youtube_api_key_here":
            raise ValueError("YouTube API key is not configured. Please set YOUTUBE_API_KEY in .env file")
        
        try:
            self.youtube = build('youtube', 'v3', developerKey=self.api_key)
        except Exception as e:
            raise ValueError(f"Failed to initialize YouTube service: {str(e)}")
    
    def search_videos(self, keyword: str, max_results: int = 50) -> List[Video]:
        """
        Search YouTube for videos matching the keyword
        """
        if not self.youtube:
            raise ValueError("YouTube service not initialized")
        
        videos = []
        
        try:
            # Search for videos
            search_response = self.youtube.search().list(
                q=keyword,
                part='id,snippet',
                maxResults=min(max_results, 50),  # YouTube API limit per request
                type='video',
                order='date'
            ).execute()
            
            for item in search_response.get('items', []):
                video_id = item['id']['videoId']
                snippet = item['snippet']
                
                video = Video(
                    id=None,
                    video_id=video_id,
                    title=snippet['title'],
                    channel_name=snippet['channelTitle'],
                    channel_id=snippet['channelId'],
                    publish_date=snippet['publishedAt'],
                    thumbnail_url=snippet['thumbnails']['medium']['url'],
                    video_url=f"https://www.youtube.com/watch?v={video_id}",
                    matched_keyword=keyword,
                    status='Pending',
                    priority='Medium',
                    artist_id=None,
                    auto_flagged=False,
                    ai_risk_score=0,
                    ai_risk_level=None,
                    ai_reason=None,
                    created_at=datetime.now().isoformat()
                )
                
                videos.append(video)
            
            return videos
        
        except HttpError as e:
            error_msg = str(e)
            if 'quotaExceeded' in error_msg:
                raise Exception("YouTube API quota exceeded. Please wait or use a different API key.")
            elif 'keyInvalid' in error_msg:
                raise Exception("Invalid YouTube API key. Please check your configuration.")
            else:
                raise Exception(f"YouTube API error: {error_msg}")
        except Exception as e:
            raise Exception(f"Error searching YouTube: {str(e)}")
    
    def get_video_details(self, video_id: str) -> Optional[Dict]:
        """
        Get detailed information about a specific video
        """
        try:
            response = self.youtube.videos().list(
                part='snippet,statistics,contentDetails',
                id=video_id
            ).execute()
            
            if response['items']:
                return response['items'][0]
            return None
        except Exception as e:
            print(f"Error getting video details: {str(e)}")
            return None
    
    def search_song(self, song_name: str, artist_name: str, max_results: int = 50, duration_ms: int = None) -> List[Video]:
        """
        Search YouTube for song + artist combination with STRICT matching
        Format: "{song_name}" "{artist_name}" to ensure both are present
        
        Features:
        - REQUIRES both song and artist name in title/channel
        - Filters out YouTube Shorts and significantly shorter videos
        - Prioritizes exact duration matches (highest priority)
        - Filters out "featuring" results (only main artist)
        - Filters out covers, remixes, reactions, etc.
        - Scores and sorts by match quality
        - Minimum quality threshold of 50/100
        """
        # Use quotes around both song and artist for stricter matching
        search_query = f'"{song_name}" "{artist_name}"'
        matched_identifier = f"{song_name} - {artist_name}"
        
        if not self.youtube:
            raise ValueError("YouTube service not initialized")
        
        videos = []
        video_ids = []
        
        # Calculate original song duration in seconds if provided
        original_duration_sec = duration_ms / 1000 if duration_ms else None
        
        # Duration tolerance: videos can be up to 60 seconds shorter
        # This filters out covers, remixes, or clips that are significantly shorter
        duration_tolerance_sec = 60
        
        try:
            # Search for videos
            search_response = self.youtube.search().list(
                q=search_query,
                part='id,snippet',
                maxResults=min(max_results, 50),
                type='video',
                order='relevance',
                videoDuration='medium'  # Excludes shorts (>4 min, <20 min)
            ).execute()
            
            # Collect video IDs for batch details request
            for item in search_response.get('items', []):
                video_ids.append(item['id']['videoId'])
            
            if not video_ids:
                return []
            
            # Get video details including duration in batch
            details_response = self.youtube.videos().list(
                part='snippet,contentDetails',
                id=','.join(video_ids)
            ).execute()
            
            # Parse durations and create video objects with quality scoring
            for item in details_response.get('items', []):
                video_id = item['id']
                snippet = item['snippet']
                content_details = item['contentDetails']
                
                # Parse ISO 8601 duration (PT#M#S) to seconds
                duration_str = content_details['duration']
                video_duration_sec = self._parse_duration(duration_str)
                
                # Filter out YouTube Shorts (< 60 seconds)
                if video_duration_sec < 60:
                    continue
                
                # Duration-based filtering if we have the original song duration
                if original_duration_sec:
                    # Calculate how much shorter the video is compared to original
                    duration_diff = original_duration_sec - video_duration_sec
                    
                    # Filter out videos that are significantly shorter (more than tolerance)
                    # But keep videos that are longer (negative diff is OK)
                    if duration_diff > duration_tolerance_sec:
                        continue
                
                title = snippet['title']
                channel_name = snippet['channelTitle']
                title_lower = title.lower()
                
                # CRITICAL: BOTH song name AND artist name MUST be in title or channel
                song_lower = song_name.lower()
                artist_lower = artist_name.lower()
                channel_lower = channel_name.lower()
                
                # EXCLUDE OFFICIAL ARTIST CHANNELS
                # We want to find COPYRIGHT VIOLATIONS, not official content
                # Skip if channel name contains the full artist name (official channel)
                if artist_lower in channel_lower:
                    continue  # Skip official artist channel
                
                # EXCLUDE VEVO CHANNELS (all official music content)
                if 'vevo' in channel_lower:
                    continue  # Skip VEVO channels (official music)
                
                # EXCLUDE channels with "official" in the name combined with artist
                if 'official' in channel_lower and any(word in channel_lower for word in artist_lower.split()):
                    continue  # Skip official channels
                
                # Check if song name is in title (with some flexibility for punctuation)
                song_in_title = song_lower in title_lower
                
                # Check if artist name is in title
                artist_in_title = artist_lower in title_lower
                
                # STRICT REQUIREMENT: We need both song and artist in TITLE
                # (Not checking channel anymore since we excluded official channels)
                if not song_in_title:
                    continue  # Skip if song name not in title
                
                if not artist_in_title:
                    continue  # Skip if artist not in title
                
                # FILTER OUT UNWANTED VIDEO TYPES COMPLETELY
                unwanted_keywords = [
                    'cover', 'remix', 'instrumental', 'karaoke', 
                    'lyrics only', 'lyric video', 'lyrics video',
                    'reaction', 'reacting to', 'react to', 'review',
                    'slowed', 'reverb', 'sped up', 'nightcore', 
                    '8d audio', 'bass boosted', 'speed up', 'boosted',
                    'tutorial', 'how to play', 'dance video', 
                    'choreography', 'dance practice', 'lesson',
                    'amapiano', 'remix', 'mashup', 'vs', 'versus'
                ]
                
                # Check if title contains any unwanted keywords - if yes, skip completely
                if any(unwanted in title_lower for unwanted in unwanted_keywords):
                    continue
                
                # FILTER OUT "FEATURING" RESULTS
                # Skip videos where artist is only featured, not main artist
                if self._is_featured_not_main(title, channel_name, artist_name):
                    continue
                
                video = Video(
                    id=None,
                    video_id=video_id,
                    title=title,
                    channel_name=channel_name,
                    channel_id=snippet['channelId'],
                    publish_date=snippet['publishedAt'],
                    thumbnail_url=snippet['thumbnails']['medium']['url'],
                    video_url=f"https://www.youtube.com/watch?v={video_id}",
                    matched_keyword=matched_identifier,
                    status='Pending',
                    priority='Medium',
                    artist_id=None,
                    auto_flagged=False,
                    ai_risk_score=0,
                    ai_risk_level=None,
                    ai_reason=None,
                    created_at=datetime.now().isoformat()
                )
                
                # Calculate match quality score (0-100, higher is better)
                score = self._calculate_match_score(
                    title, channel_name, song_name, artist_name, 
                    video_duration_sec, original_duration_sec
                )
                
                # FILTER OUT LOW QUALITY MATCHES
                # If score is too low, skip this video entirely
                # Raised threshold to ensure only high-quality matches
                if score < 50:  # Minimum acceptable match quality (was 30)
                    continue
                
                # Store metadata for sorting
                video._duration_sec = video_duration_sec
                video._match_score = score
                
                # Set priority based on match score
                if score >= 90:
                    video.priority = 'Critical'  # Excellent match
                elif score >= 75:
                    video.priority = 'High'      # Very good match
                elif score >= 50:
                    video.priority = 'Medium'    # Good match
                else:
                    video.priority = 'Low'       # Weak match
                
                videos.append(video)
            
            # Sort by PRIORITY first (Critical/High at top), then by match score, then duration
            if videos:
                # Define priority ranking (higher number = higher priority)
                priority_rank = {
                    'Critical': 4,
                    'High': 3,
                    'Medium': 2,
                    'Low': 1
                }
                
                videos.sort(key=lambda v: (
                    -priority_rank.get(v.priority, 0),  # Priority first (Critical/High at top)
                    -v._match_score,  # Then by match score (highest first)
                    abs(v._duration_sec - original_duration_sec) if original_duration_sec else 0  # Then by duration accuracy
                ))
            
            # Clean up temp attributes
            for video in videos:
                if hasattr(video, '_duration_sec'):
                    delattr(video, '_duration_sec')
                if hasattr(video, '_match_score'):
                    delattr(video, '_match_score')
            
            return videos
        
        except HttpError as e:
            error_msg = str(e)
            if 'quotaExceeded' in error_msg:
                raise Exception("YouTube API quota exceeded. Please wait or use a different API key.")
            elif 'keyInvalid' in error_msg:
                raise Exception("Invalid YouTube API key. Please check your configuration.")
            else:
                raise Exception(f"YouTube API error: {error_msg}")
        except Exception as e:
            raise Exception(f"Error searching YouTube: {str(e)}")
    
    def _parse_duration(self, duration_str: str) -> int:
        """
        Parse ISO 8601 duration (PT#H#M#S) to seconds
        Example: PT3M45S = 225 seconds
        """
        import re
        
        pattern = r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?'
        match = re.match(pattern, duration_str)
        
        if not match:
            return 0
        
        hours = int(match.group(1)) if match.group(1) else 0
        minutes = int(match.group(2)) if match.group(2) else 0
        seconds = int(match.group(3)) if match.group(3) else 0
        
        return hours * 3600 + minutes * 60 + seconds
    
    def _is_featured_not_main(self, title: str, channel_name: str, artist_name: str) -> bool:
        """
        Check if the artist is only featured (not main artist)
        
        Returns True if artist appears ONLY as featured artist (should be filtered out)
        Returns False if artist is main artist (should be kept)
        
        Examples that should be FILTERED (return True):
        - "Drake feat. Nkosazana Daughter" (artist is featured, not main)
        - "Someone ft. Artist Name"
        - "Song (feat. Artist Name)"
        - "Someone x Artist Name" (artist is second)
        
        Examples that should be KEPT (return False):
        - "Nkosazana Daughter - Song Name"
        - "Song Name - Nkosazana Daughter" (common format)
        - "Nkosazana Daughter feat. Drake" (artist is FIRST/main)
        """
        import re
        
        title_lower = title.lower()
        artist_lower = artist_name.lower()
        
        # If artist name not in title, allow it through (might be in description/channel)
        if artist_lower not in title_lower:
            return False
        
        # If artist is at the very beginning, definitely keep
        if title_lower.strip().startswith(artist_lower):
            return False
        
        # Check for "feat/ft" pattern explicitly before artist name
        # This is the most reliable indicator of featuring
        featuring_before_artist = re.search(
            r'(feat\.|ft\.|feat|ft|featuring)\s+' + re.escape(artist_lower),
            title_lower,
            re.IGNORECASE
        )
        if featuring_before_artist:
            # Artist appears after "feat/ft" = featured artist, FILTER
            return True
        
        # Check if in parentheses with featuring: "(feat. Artist)"
        parentheses_featuring = re.search(
            r'[()\[\]]\s*(feat\.|ft\.|featuring)\s+' + re.escape(artist_lower),
            title_lower,
            re.IGNORECASE
        )
        if parentheses_featuring:
            return True  # Featured in parens, FILTER
        
        # Check for collaboration markers and artist position
        # Split on common separators to find artist position
        collab_pattern = r'(\s+&\s+|\s+and\s+|\s+x\s+|\s+vs\.?\s+|\s+feat\.?\s+|\s+ft\.?\s+)'
        parts = re.split(collab_pattern, title_lower, flags=re.IGNORECASE)
        
        # Find which part contains our artist
        artist_part_index = -1
        for i, part in enumerate(parts):
            if artist_lower in part:
                artist_part_index = i
                break
        
        if artist_part_index > 0:
            # Artist is not in the first part
            # Check if the separator before it indicates featuring
            separator_before = parts[artist_part_index - 1].strip() if artist_part_index > 0 else ""
            if any(word in separator_before for word in ['feat', 'ft', 'featuring']):
                return True  # After "feat", FILTER
            
            # If artist is in a later part with "x", "&", etc. (not first)
            # and it's NOT a "Song - Artist" format, filter it
            if re.search(r'[x&]', separator_before):
                # Check if this is a simple "Song - Artist" format
                # In that case, artist can be second part (after dash) and still be main
                if '-' in title_lower:
                    # Format might be "Song Name - Artist Name"
                    dash_parts = title_lower.split('-')
                    if len(dash_parts) == 2 and artist_lower in dash_parts[1]:
                        return False  # "Song - Artist" format, KEEP
                
                # Otherwise, artist is second in collaboration, FILTER
                return True
        
        # Artist is in first part or format is ambiguous, KEEP
        return False
    
    def _calculate_match_score(self, title: str, channel_name: str, 
                               song_name: str, artist_name: str,
                               video_duration_sec: int, original_duration_sec: int = None) -> int:
        """
        Calculate match quality score (0-100)
        
        Scoring factors:
        - Exact duration match: +40 points
        - Close duration match (±5 sec): +30 points
        - Song name in title (exact): +25 points
        - Song name in title (partial): +15 points
        - Artist name in title (exact): +20 points
        - Artist name in channel: +10 points
        - Artist at beginning of title: +5 points
        """
        import re
        
        score = 0
        title_lower = title.lower()
        channel_lower = channel_name.lower()
        song_lower = song_name.lower()
        artist_lower = artist_name.lower()
        
        # DURATION SCORING (most important for exact matches)
        if original_duration_sec:
            duration_diff = abs(video_duration_sec - original_duration_sec)
            
            if duration_diff == 0:
                score += 40  # Perfect duration match
            elif duration_diff <= 2:
                score += 35  # Within 2 seconds
            elif duration_diff <= 5:
                score += 30  # Within 5 seconds
            elif duration_diff <= 10:
                score += 20  # Within 10 seconds
            elif duration_diff <= 30:
                score += 10  # Within 30 seconds
        
        # SONG NAME SCORING (now more important)
        # Exact song name match (whole words)
        if re.search(r'\b' + re.escape(song_lower) + r'\b', title_lower):
            score += 35  # Increased from 25
        # Partial song name match
        elif song_lower in title_lower:
            score += 20  # Increased from 15
        
        # ARTIST NAME SCORING (more important)
        # Exact artist name match (whole words)
        if re.search(r'\b' + re.escape(artist_lower) + r'\b', title_lower):
            score += 30  # Increased from 20
        # Partial artist name match
        elif artist_lower in title_lower:
            score += 15  # Increased from 10
        
        # REMOVED: Official channel bonuses
        # We're now looking for COPYRIGHT VIOLATIONS, not official content
        # Official channels are already filtered out
        
        # PENALTY for "official" markers (these slipped through somehow)
        official_markers = ['official audio', 'official video', 'official music video', 'official lyric video']
        for marker in official_markers:
            if marker in title_lower:
                score -= 20  # Penalize official markers (shouldn't be here)
                break
        
        # Bonus for likely infringement indicators
        # Videos from random channels re-uploading artist content
        # These are what we WANT to catch
        
        # Artist name at beginning suggests potential re-upload
        if title_lower.strip().startswith(artist_lower):
            score += 5  # Slight bonus - might be infringement
        
        # HEAVY PENALTY for unwanted terms (these should already be filtered, but double-check)
        unwanted_terms = [
            'cover', 'remix', 'instrumental', 'karaoke', 'live', 'acoustic',
            'lyrics', 'lyric video', 'reaction', 'react', 'tutorial', 'how to',
            'slowed', 'reverb', 'sped up', 'nightcore', '8d audio', 'bass boosted',
            'behind the scenes', 'making of', 'dance video', 'choreography',
            'mashup', 'vs', 'versus', 'parody'
        ]
        for term in unwanted_terms:
            if term in title_lower:
                score -= 50  # Massive penalty (essentially disqualifies)
                break
        
        # Ensure score is between 0-100
        return max(0, min(100, score))
    
    def test_api_key(self) -> bool:
        """
        Test if the API key is valid
        """
        try:
            self.youtube.search().list(
                q='test',
                part='id',
                maxResults=1
            ).execute()
            return True
        except:
            return False
