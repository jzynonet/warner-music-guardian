"""
Web Scraper Service for Artist Song Import
Scrapes discography from public web sources (Genius, Wikipedia)
No API keys required - bypasses Spotify restrictions completely.
"""

import requests
import re
import time
from typing import List, Dict, Optional
from urllib.parse import quote, urljoin
from html.parser import HTMLParser


class SimpleHTMLTextExtractor(HTMLParser):
    """Simple HTML parser to extract text content"""
    def __init__(self):
        super().__init__()
        self.text = []
        self.skip_tags = {'script', 'style', 'noscript'}
        self._skip = False

    def handle_starttag(self, tag, attrs):
        if tag in self.skip_tags:
            self._skip = True

    def handle_endtag(self, tag):
        if tag in self.skip_tags:
            self._skip = False

    def handle_data(self, data):
        if not self._skip:
            self.text.append(data.strip())

    def get_text(self):
        return ' '.join(t for t in self.text if t)


class WebScraperService:
    """
    Scrapes artist discography from public web sources.
    No API keys, no authentication, no rate limits (beyond politeness).
    
    Sources:
    1. Genius.com - great for song lyrics/titles
    2. Wikipedia - great for complete discography
    3. Deezer API - free, no auth needed, great metadata
    """

    def __init__(self):
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5"
        }
        self.deezer_base = "https://api.deezer.com"
        self.last_request_time = 0

    def _rate_limit(self, delay=0.5):
        """Polite rate limiting"""
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        if time_since_last < delay:
            time.sleep(delay - time_since_last)
        self.last_request_time = time.time()

    # =========================================================================
    # DEEZER API (Free, No Auth, Great Metadata)
    # =========================================================================

    def search_artist_deezer(self, artist_name: str) -> Optional[Dict]:
        """
        Search for an artist on Deezer (free API, no auth).

        Returns:
            dict with id, name, picture, nb_fan, nb_album, link
        """
        try:
            self._rate_limit(0.3)
            response = requests.get(
                f"{self.deezer_base}/search/artist",
                params={"q": artist_name, "limit": 5},
                headers={"User-Agent": self.headers["User-Agent"]},
                timeout=10
            )
            response.raise_for_status()
            data = response.json()

            if data.get("data"):
                # Find best match
                for artist in data["data"]:
                    if artist["name"].lower() == artist_name.lower():
                        return {
                            "id": artist["id"],
                            "name": artist["name"],
                            "picture": artist.get("picture_medium"),
                            "fans": artist.get("nb_fan", 0),
                            "albums": artist.get("nb_album", 0),
                            "link": artist.get("link"),
                            "source": "deezer"
                        }
                # If no exact match, return first result
                artist = data["data"][0]
                return {
                    "id": artist["id"],
                    "name": artist["name"],
                    "picture": artist.get("picture_medium"),
                    "fans": artist.get("nb_fan", 0),
                    "albums": artist.get("nb_album", 0),
                    "link": artist.get("link"),
                    "source": "deezer"
                }
            return None
        except Exception as e:
            print(f"Deezer artist search failed: {e}")
            return None

    def get_artist_songs_deezer(self, artist_name: str) -> Dict:
        """
        Get artist's top tracks + full album tracklists from Deezer.
        Free API, no authentication needed!

        Returns:
            dict with artist_info, main_songs, featured_songs, albums, source
        """
        try:
            # Step 1: Find the artist
            artist = self.search_artist_deezer(artist_name)
            if not artist:
                return {
                    "success": False,
                    "error": f"Artist '{artist_name}' not found on Deezer",
                    "main_songs": [],
                    "featured_songs": []
                }

            artist_id = artist["id"]
            all_songs = {}  # name -> song data (deduplicated)
            featured_songs = {}
            albums_found = []

            # Step 2: Get top tracks (most popular songs)
            self._rate_limit(0.3)
            top_response = requests.get(
                f"{self.deezer_base}/artist/{artist_id}/top",
                params={"limit": 100},
                headers={"User-Agent": self.headers["User-Agent"]},
                timeout=10
            )
            if top_response.ok:
                top_data = top_response.json()
                for track in top_data.get("data", []):
                    name = track.get("title", "").strip()
                    if name:
                        all_songs[name] = {
                            "name": name,
                            "duration_ms": track.get("duration", 0) * 1000,
                            "release_date": None,
                            "popularity": track.get("rank", 0)
                        }

            # Step 3: Get all albums
            self._rate_limit(0.3)
            albums_response = requests.get(
                f"{self.deezer_base}/artist/{artist_id}/albums",
                params={"limit": 100},
                headers={"User-Agent": self.headers["User-Agent"]},
                timeout=10
            )
            if albums_response.ok:
                albums_data = albums_response.json()
                for album in albums_data.get("data", []):
                    album_info = {
                        "id": album["id"],
                        "name": album.get("title"),
                        "release_date": album.get("release_date"),
                        "type": album.get("record_type", "album")
                    }
                    albums_found.append(album_info)

                    # Get tracks for each album
                    self._rate_limit(0.3)
                    tracks_response = requests.get(
                        f"{self.deezer_base}/album/{album['id']}/tracks",
                        params={"limit": 100},
                        headers={"User-Agent": self.headers["User-Agent"]},
                        timeout=10
                    )
                    if tracks_response.ok:
                        tracks_data = tracks_response.json()
                        for track in tracks_data.get("data", []):
                            name = track.get("title", "").strip()
                            if not name:
                                continue

                            track_artist = track.get("artist", {})
                            track_artist_name = track_artist.get("name", "")

                            # Check if this is a main artist song or featured
                            is_main = track_artist_name.lower() == artist["name"].lower()

                            song_data = {
                                "name": name,
                                "duration_ms": track.get("duration", 0) * 1000,
                                "release_date": album.get("release_date"),
                                "popularity": track.get("rank", 0)
                            }

                            if is_main:
                                if name not in all_songs:
                                    all_songs[name] = song_data
                            else:
                                if name not in featured_songs:
                                    featured_songs[name] = song_data

            # Convert to lists
            main_songs_list = sorted(all_songs.values(), key=lambda x: x.get("popularity", 0), reverse=True)
            featured_songs_list = sorted(featured_songs.values(), key=lambda x: x.get("popularity", 0), reverse=True)

            artist_info = {
                "name": artist["name"],
                "deezer_id": artist["id"],
                "image_url": artist.get("picture"),
                "followers": artist.get("fans", 0),
                "genres": [],
                "deezer_link": artist.get("link")
            }

            return {
                "success": True,
                "artist_info": artist_info,
                "main_songs": main_songs_list,
                "featured_songs": featured_songs_list,
                "albums": albums_found,
                "total_main_songs": len(main_songs_list),
                "total_featured_songs": len(featured_songs_list),
                "source": "deezer"
            }

        except Exception as e:
            return {
                "success": False,
                "error": f"Deezer lookup failed: {str(e)}",
                "main_songs": [],
                "featured_songs": []
            }

    # =========================================================================
    # TEXT PASTE PARSER  
    # =========================================================================

    def parse_pasted_songs(self, text: str, artist_name: str) -> Dict:
        """
        Parse a pasted text block of song names.
        
        Handles formats:
        - One song per line
        - Numbered lists (1. Song Name, 2. Song Name)
        - Bullet lists (- Song Name, • Song Name, * Song Name)
        - Tab-separated (Song Name\tArtist Name)
        - Comma-separated if single line
        - "Song Name - Artist Name" format
        - "Artist Name - Song Name" format
        
        Returns:
            dict with parsed songs
        """
        if not text or not text.strip():
            return {
                "success": False,
                "error": "No text provided",
                "songs": []
            }

        lines = text.strip().split('\n')
        songs = []
        seen = set()

        for line in lines:
            line = line.strip()
            if not line:
                continue

            # Remove common list prefixes
            # Numbered: "1. ", "1) ", "01. ", etc.
            line = re.sub(r'^\d+[\.\)]\s*', '', line)
            # Bullet points: "- ", "• ", "* ", "→ ", "> "
            line = re.sub(r'^[-•\*→>]\s*', '', line)
            # Track numbers: "Track 1: ", "Track 01 - "
            line = re.sub(r'^[Tt]rack\s*\d+[\s:\-–—]+', '', line)

            line = line.strip()
            if not line:
                continue

            # Try to extract song name and optional artist
            song_name = line
            song_artist = artist_name

            # Check for tab-separated format (Song\tArtist)
            if '\t' in line:
                parts = line.split('\t')
                song_name = parts[0].strip()
                if len(parts) > 1 and parts[1].strip():
                    song_artist = parts[1].strip()
            # Check for " - " separator (could be "Song - Artist" or "Artist - Song")
            elif ' - ' in line or ' – ' in line or ' — ' in line:
                separator = ' - ' if ' - ' in line else (' – ' if ' – ' in line else ' — ')
                parts = line.split(separator, 1)
                left = parts[0].strip()
                right = parts[1].strip()

                # Remove quotes if present
                left = left.strip('"\'')
                right = right.strip('"\'')

                # If one part matches the artist name, the other is the song
                if left.lower() == artist_name.lower():
                    song_name = right
                    song_artist = left
                elif right.lower() == artist_name.lower():
                    song_name = left
                    song_artist = right
                else:
                    # Default: first part is song name
                    song_name = left
                    # Don't override artist_name with right unless it looks like an artist
            # Check for " by " format
            elif ' by ' in line.lower():
                match = re.match(r'^(.+?)\s+by\s+(.+)$', line, re.IGNORECASE)
                if match:
                    song_name = match.group(1).strip().strip('"\'')
                    song_artist = match.group(2).strip().strip('"\'')

            # Clean up song name
            song_name = song_name.strip().strip('"\'')
            
            # Remove duration info like "(3:45)" or "[3:45]" or "3:45"
            song_name = re.sub(r'\s*[\(\[]\d+:\d+[\)\]]\s*$', '', song_name)
            song_name = re.sub(r'\s+\d+:\d+\s*$', '', song_name)

            if song_name and song_name.lower() not in seen:
                seen.add(song_name.lower())
                songs.append({
                    "name": song_name,
                    "artist_name": song_artist,
                    "duration_ms": None,
                    "release_date": None
                })

        return {
            "success": True,
            "songs": songs,
            "total_songs": len(songs),
            "artist_name": artist_name
        }

    # =========================================================================
    # CSV/EXCEL PARSER
    # =========================================================================

    def parse_csv_songs(self, content: str, artist_name: str = None) -> Dict:
        """
        Parse CSV content for song import.
        
        Expected columns (flexible):
        - song_name / title / song / track / name
        - artist_name / artist (optional, uses provided artist_name as default)
        
        Returns:
            dict with parsed songs
        """
        import csv
        import io

        try:
            reader = csv.DictReader(io.StringIO(content))
            songs = []
            seen = set()

            # Map flexible column names
            name_columns = ['song_name', 'title', 'song', 'track', 'name', 'track_name', 'song_title']
            artist_columns = ['artist_name', 'artist', 'performer', 'band']

            for row in reader:
                # Find the song name column
                song_name = None
                for col in name_columns:
                    for key in row:
                        if key.lower().strip() == col:
                            song_name = row[key].strip()
                            break
                    if song_name:
                        break

                if not song_name:
                    # Try first column as song name
                    first_key = list(row.keys())[0] if row else None
                    if first_key:
                        song_name = row[first_key].strip()

                if not song_name:
                    continue

                # Find artist name
                song_artist = artist_name or ''
                for col in artist_columns:
                    for key in row:
                        if key.lower().strip() == col:
                            val = row[key].strip()
                            if val:
                                song_artist = val
                            break

                if song_name.lower() not in seen:
                    seen.add(song_name.lower())
                    songs.append({
                        "name": song_name,
                        "artist_name": song_artist,
                        "duration_ms": None,
                        "release_date": None
                    })

            return {
                "success": True,
                "songs": songs,
                "total_songs": len(songs),
                "artist_name": artist_name
            }

        except Exception as e:
            return {
                "success": False,
                "error": f"CSV parsing failed: {str(e)}",
                "songs": []
            }


# Example usage / test
if __name__ == "__main__":
    scraper = WebScraperService()

    print("=" * 60)
    print("🎵 Web Scraper Service - No API Keys Needed!")
    print("=" * 60)

    # Test Deezer (free API)
    print("\n🔵 Testing Deezer API (free, no auth)...")
    result = scraper.get_artist_songs_deezer("Drake")
    if result["success"]:
        print(f"  ✅ Artist: {result['artist_info']['name']}")
        print(f"  📀 Main songs: {result['total_main_songs']}")
        print(f"  🤝 Featured: {result['total_featured_songs']}")
        print(f"  First 5 songs:")
        for song in result["main_songs"][:5]:
            print(f"    - {song['name']}")
    else:
        print(f"  ❌ {result['error']}")

    # Test text parser
    print("\n📝 Testing Text Parser...")
    test_text = """
    1. Hotline Bling
    2. God's Plan
    3. One Dance
    4. In My Feelings
    5. Started From The Bottom
    """
    parsed = scraper.parse_pasted_songs(test_text, "Drake")
    print(f"  Parsed {parsed['total_songs']} songs from text")
    for song in parsed["songs"]:
        print(f"    - {song['name']}")
