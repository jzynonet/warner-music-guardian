"""
MusicBrainz Integration Service
Free music database - no API key required
"""

import requests
import time
from typing import List, Dict, Optional
from urllib.parse import quote


class MusicBrainzService:
    """
    MusicBrainz API integration for fetching artist songs
    Completely free, no authentication required
    Rate limit: 1 request per second
    """
    
    def __init__(self):
        self.base_url = "https://musicbrainz.org/ws/2"
        self.headers = {
            "User-Agent": "UGC-Monitor/1.0 (music.copyright.monitor@example.com)",
            "Accept": "application/json"
        }
        self.last_request_time = 0
    
    def _rate_limit(self):
        """Ensure we don't exceed 1 request per second"""
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        
        if time_since_last < 1.0:
            time.sleep(1.0 - time_since_last)
        
        self.last_request_time = time.time()
    
    def _make_request(self, endpoint: str, params: dict = None) -> dict:
        """Make request to MusicBrainz API with rate limiting"""
        self._rate_limit()
        
        response = requests.get(
            f"{self.base_url}/{endpoint}",
            headers=self.headers,
            params=params
        )
        response.raise_for_status()
        
        return response.json()
    
    def search_artist(self, artist_name: str) -> Optional[Dict]:
        """
        Search for artist and return MusicBrainz artist object
        
        Returns:
            dict with keys: id, name, country, type, disambiguation
        """
        try:
            data = self._make_request("artist", {
                "query": f'artist:"{artist_name}"',
                "limit": 1,
                "fmt": "json"
            })
            
            if data.get("artists"):
                artist = data["artists"][0]
                return {
                    "id": artist["id"],
                    "name": artist["name"],
                    "country": artist.get("country"),
                    "type": artist.get("type"),
                    "disambiguation": artist.get("disambiguation", ""),
                    "score": artist.get("score", 0)
                }
            
            return None
            
        except Exception as e:
            print(f"Error searching artist: {str(e)}")
            return None
    
    def get_artist_recordings(self, artist_id: str, limit: int = 500) -> List[str]:
        """
        Get all recordings (songs) for an artist
        
        Args:
            artist_id: MusicBrainz artist ID
            limit: Max recordings to fetch (default 500)
        
        Returns:
            List of unique song titles
        """
        try:
            all_recordings = set()
            offset = 0
            batch_size = 100  # MusicBrainz max is 100
            
            while offset < limit:
                data = self._make_request("recording", {
                    "query": f'arid:{artist_id}',
                    "limit": min(batch_size, limit - offset),
                    "offset": offset,
                    "fmt": "json"
                })
                
                recordings = data.get("recordings", [])
                if not recordings:
                    break
                
                for recording in recordings:
                    title = recording.get("title")
                    if title:
                        all_recordings.add(title)
                
                # Check if there are more results
                if len(recordings) < batch_size:
                    break
                
                offset += batch_size
            
            return sorted(list(all_recordings))
            
        except Exception as e:
            print(f"Error getting recordings: {str(e)}")
            return []
    
    def get_artist_releases(self, artist_id: str) -> List[Dict]:
        """
        Get all releases (albums) for an artist
        
        Returns:
            List of dicts with keys: id, title, date, type, status
        """
        try:
            releases = []
            offset = 0
            batch_size = 100
            
            while True:
                data = self._make_request(f"artist/{artist_id}", {
                    "inc": "releases",
                    "limit": batch_size,
                    "offset": offset,
                    "fmt": "json"
                })
                
                release_list = data.get("releases", [])
                if not release_list:
                    break
                
                for release in release_list:
                    releases.append({
                        "id": release["id"],
                        "title": release.get("title"),
                        "date": release.get("date"),
                        "status": release.get("status"),
                        "country": release.get("country")
                    })
                
                if len(release_list) < batch_size:
                    break
                
                offset += batch_size
            
            return releases
            
        except Exception as e:
            print(f"Error getting releases: {str(e)}")
            return []
    
    def get_artist_all_songs(self, artist_name: str) -> Dict:
        """
        Get complete discography for an artist
        
        Args:
            artist_name: Name of the artist
        
        Returns:
            dict with keys:
                - artist_info: Artist metadata
                - songs: List of unique song titles
                - releases: List of release info
                - total_songs: Count
        """
        try:
            # Search for artist
            artist = self.search_artist(artist_name)
            if not artist:
                return {
                    "error": f"Artist '{artist_name}' not found on MusicBrainz",
                    "songs": [],
                    "total_songs": 0
                }
            
            # Get all recordings (songs)
            songs = self.get_artist_recordings(artist["id"])
            
            # Get all releases (albums) - optional, can be slow
            # releases = self.get_artist_releases(artist["id"])
            
            return {
                "artist_info": artist,
                "songs": songs,
                "releases": [],  # Disabled for speed
                "total_songs": len(songs),
                "source": "musicbrainz"
            }
            
        except Exception as e:
            return {
                "error": str(e),
                "songs": [],
                "total_songs": 0
            }


# Example usage
if __name__ == "__main__":
    # Test the service
    mb = MusicBrainzService()
    
    print("🎵 Testing MusicBrainz (free, no API key needed)")
    print("⏳ Note: This may take 10-30 seconds due to rate limiting...\n")
    
    result = mb.get_artist_all_songs("Drake")
    
    if "error" not in result:
        print(f"✅ Artist: {result['artist_info']['name']}")
        print(f"🎤 Total songs: {result['total_songs']}")
        print(f"\nFirst 10 songs:")
        for song in result['songs'][:10]:
            print(f"  - {song}")
    else:
        print(f"❌ Error: {result['error']}")
