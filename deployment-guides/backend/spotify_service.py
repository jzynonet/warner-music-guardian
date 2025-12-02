"""
Spotify Integration Service
Fetches artist discography automatically
"""

import requests
import base64
from typing import List, Dict, Optional
import os
from datetime import datetime, timedelta


class SpotifyService:
    """
    Spotify API integration for fetching artist songs
    Uses Client Credentials flow (no user login needed)
    """
    
    def __init__(self, client_id: str = None, client_secret: str = None):
        self.client_id = client_id or os.getenv('SPOTIFY_CLIENT_ID')
        self.client_secret = client_secret or os.getenv('SPOTIFY_CLIENT_SECRET')
        self.access_token = None
        self.token_expiry = None
        self.base_url = "https://api.spotify.com/v1"
    
    def _get_access_token(self) -> str:
        """Get or refresh Spotify access token"""
        # Return cached token if still valid
        if self.access_token and self.token_expiry and datetime.now() < self.token_expiry:
            return self.access_token
        
        if not self.client_id or not self.client_secret:
            raise ValueError("Spotify API credentials not configured. Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env")
        
        # Request new token
        auth_string = f"{self.client_id}:{self.client_secret}"
        auth_bytes = auth_string.encode("utf-8")
        auth_base64 = base64.b64encode(auth_bytes).decode("utf-8")
        
        url = "https://accounts.spotify.com/api/token"
        headers = {
            "Authorization": f"Basic {auth_base64}",
            "Content-Type": "application/x-www-form-urlencoded"
        }
        data = {"grant_type": "client_credentials"}
        
        response = requests.post(url, headers=headers, data=data)
        response.raise_for_status()
        
        result = response.json()
        self.access_token = result["access_token"]
        # Token expires in 3600 seconds, refresh 5 min early
        self.token_expiry = datetime.now() + timedelta(seconds=result["expires_in"] - 300)
        
        return self.access_token
    
    def _make_request(self, endpoint: str, params: dict = None) -> dict:
        """Make authenticated request to Spotify API"""
        token = self._get_access_token()
        headers = {"Authorization": f"Bearer {token}"}
        
        response = requests.get(f"{self.base_url}/{endpoint}", headers=headers, params=params)
        response.raise_for_status()
        
        return response.json()
    
    def search_artist(self, artist_name: str) -> Optional[Dict]:
        """
        Search for artist and return Spotify artist object
        
        Returns:
            dict with keys: id, name, genres, popularity, image_url
        """
        try:
            data = self._make_request("search", {
                "q": artist_name,
                "type": "artist",
                "limit": 1
            })
            
            if data["artists"]["items"]:
                artist = data["artists"]["items"][0]
                return {
                    "id": artist["id"],
                    "name": artist["name"],
                    "genres": artist.get("genres", []),
                    "popularity": artist.get("popularity", 0),
                    "image_url": artist["images"][0]["url"] if artist.get("images") else None,
                    "followers": artist.get("followers", {}).get("total", 0)
                }
            
            return None
            
        except Exception as e:
            print(f"Error searching artist: {str(e)}")
            return None
    
    def get_artist_albums(self, artist_id: str) -> List[Dict]:
        """
        Get all albums for an artist
        
        Returns:
            List of dicts with keys: id, name, release_date, total_tracks, album_type
        """
        try:
            albums = []
            offset = 0
            limit = 50
            
            while True:
                data = self._make_request(f"artists/{artist_id}/albums", {
                    "include_groups": "album,single",
                    "limit": limit,
                    "offset": offset
                })
                
                for album in data["items"]:
                    albums.append({
                        "id": album["id"],
                        "name": album["name"],
                        "release_date": album.get("release_date"),
                        "total_tracks": album.get("total_tracks", 0),
                        "album_type": album.get("album_type")
                    })
                
                # Check if there are more albums
                if len(data["items"]) < limit:
                    break
                
                offset += limit
            
            return albums
            
        except Exception as e:
            print(f"Error getting albums: {str(e)}")
            return []
    
    def get_album_tracks(self, album_id: str, artist_name: str = None, release_date: str = None) -> List[dict]:
        """
        Get all track names from an album with artist info
        
        Args:
            album_id: Spotify album ID
            artist_name: Main artist name to filter
            release_date: Album release date to attach to tracks
        
        Returns:
            List of dicts with keys: name, is_main_artist, all_artists, release_date
        """
        try:
            tracks = []
            offset = 0
            limit = 50
            
            while True:
                data = self._make_request(f"albums/{album_id}/tracks", {
                    "limit": limit,
                    "offset": offset
                })
                
                for track in data["items"]:
                    track_artists = [artist["name"] for artist in track.get("artists", [])]
                    is_main_artist = True
                    
                    # Check if this is a main artist song or featured
                    if artist_name and track_artists:
                        # Main artist should be first in the list
                        is_main_artist = track_artists[0].lower() == artist_name.lower()
                    
                    tracks.append({
                        "name": track["name"],
                        "is_main_artist": is_main_artist,
                        "all_artists": track_artists,
                        "duration_ms": track.get("duration_ms"),
                        "release_date": release_date
                    })
                
                if len(data["items"]) < limit:
                    break
                
                offset += limit
            
            return tracks
            
        except Exception as e:
            print(f"Error getting tracks: {str(e)}")
            return []
    
    def extract_artist_id_from_url(self, spotify_url: str) -> Optional[str]:
        """
        Extract Spotify artist ID from URL
        
        Supports formats:
        - https://open.spotify.com/artist/06HL4z0CvFAxyc27GXpf02
        - spotify:artist:06HL4z0CvFAxyc27GXpf02
        - 06HL4z0CvFAxyc27GXpf02 (just the ID)
        
        Returns:
            Artist ID string or None
        """
        import re
        
        # Pattern 1: https://open.spotify.com/artist/ID or /artist/ID?params
        match = re.search(r'artist/([a-zA-Z0-9]+)', spotify_url)
        if match:
            return match.group(1)
        
        # Pattern 2: spotify:artist:ID
        match = re.search(r'spotify:artist:([a-zA-Z0-9]+)', spotify_url)
        if match:
            return match.group(1)
        
        # Pattern 3: Just the ID (22 characters)
        if re.match(r'^[a-zA-Z0-9]{22}$', spotify_url):
            return spotify_url
        
        return None
    
    def get_artist_by_id(self, artist_id: str) -> Optional[Dict]:
        """
        Get artist info by Spotify ID
        
        Returns:
            dict with keys: id, name, genres, popularity, image_url, followers
        """
        try:
            artist = self._make_request(f"artists/{artist_id}")
            
            return {
                "id": artist["id"],
                "name": artist["name"],
                "genres": artist.get("genres", []),
                "popularity": artist.get("popularity", 0),
                "image_url": artist["images"][0]["url"] if artist.get("images") else None,
                "followers": artist.get("followers", {}).get("total", 0),
                "spotify_url": artist.get("external_urls", {}).get("spotify")
            }
            
        except Exception as e:
            print(f"Error getting artist by ID: {str(e)}")
            return None
    
    def get_artist_from_url(self, spotify_url: str) -> Optional[Dict]:
        """
        Get artist info from Spotify URL
        
        Args:
            spotify_url: Spotify artist URL or ID
        
        Returns:
            Artist info dict or None
        """
        artist_id = self.extract_artist_id_from_url(spotify_url)
        if not artist_id:
            return None
        
        return self.get_artist_by_id(artist_id)
    
    def get_artist_all_songs(self, artist_name: str, include_features: bool = False) -> Dict:
        """
        Get complete discography for an artist
        
        Args:
            artist_name: Name of the artist
            include_features: Include songs where artist is featured
        
        Returns:
            dict with keys:
                - artist_info: Artist metadata
                - songs: List of unique song titles
                - albums: List of album info
                - total_songs: Count
        """
        try:
            # Search for artist
            artist = self.search_artist(artist_name)
            if not artist:
                return {
                    "error": f"Artist '{artist_name}' not found on Spotify",
                    "songs": [],
                    "total_songs": 0
                }
            
            # Get all albums
            albums = self.get_artist_albums(artist["id"])
            
            # Get all tracks from all albums
            all_songs = set()  # Use set to avoid duplicates
            
            for album in albums:
                tracks = self.get_album_tracks(album["id"])
                all_songs.update(tracks)
            
            # Convert to sorted list
            songs_list = sorted(list(all_songs))
            
            return {
                "artist_info": artist,
                "songs": songs_list,
                "albums": albums,
                "total_songs": len(songs_list),
                "source": "spotify"
            }
            
        except Exception as e:
            return {
                "error": str(e),
                "songs": [],
                "total_songs": 0
            }
    
    def get_artist_all_songs_by_url(self, spotify_url: str, main_artist_only: bool = True) -> Dict:
        """
        Get complete discography for an artist from their Spotify URL
        
        Args:
            spotify_url: Spotify artist URL
            main_artist_only: If True, only return songs where artist is the main artist
        
        Returns:
            dict with keys:
                - artist_info: Artist metadata
                - main_songs: List of songs where artist is main
                - featured_songs: List of songs where artist is featured
                - albums: List of album info
                - total_songs: Count
        """
        try:
            # Get artist from URL
            artist = self.get_artist_from_url(spotify_url)
            if not artist:
                return {
                    "error": "Invalid Spotify artist URL",
                    "main_songs": [],
                    "featured_songs": [],
                    "total_songs": 0
                }
            
            # Get all albums
            albums = self.get_artist_albums(artist["id"])
            
            # Get all tracks from all albums with artist filtering
            main_songs = {}  # song_name -> {duration_ms, release_date}
            featured_songs = {}
            
            for album in albums:
                tracks = self.get_album_tracks(album["id"], artist["name"], album.get("release_date"))
                for track in tracks:
                    if track["is_main_artist"]:
                        # Keep the first occurrence (usually the original release)
                        if track["name"] not in main_songs:
                            main_songs[track["name"]] = {
                                "duration_ms": track.get("duration_ms"),
                                "release_date": track.get("release_date")
                            }
                    else:
                        if track["name"] not in featured_songs:
                            featured_songs[track["name"]] = {
                                "duration_ms": track.get("duration_ms"),
                                "release_date": track.get("release_date")
                            }
            
            # Convert to lists with duration and release date info, sorted by newest first
            main_songs_list = [
                {"name": name, "duration_ms": data["duration_ms"], "release_date": data["release_date"]} 
                for name, data in main_songs.items()
            ]
            # Sort by release_date descending (newest first), then by name
            main_songs_list.sort(key=lambda x: (x["release_date"] or "", x["name"]), reverse=True)
            
            featured_songs_list = [
                {"name": name, "duration_ms": data["duration_ms"], "release_date": data["release_date"]} 
                for name, data in featured_songs.items()
            ]
            # Sort by release_date descending (newest first), then by name
            featured_songs_list.sort(key=lambda x: (x["release_date"] or "", x["name"]), reverse=True)
            
            return {
                "artist_info": artist,
                "main_songs": main_songs_list,
                "featured_songs": featured_songs_list,
                "albums": albums,
                "total_main_songs": len(main_songs),
                "total_featured_songs": len(featured_songs),
                "total_songs": len(main_songs) + len(featured_songs),
                "source": "spotify"
            }
            
        except Exception as e:
            return {
                "error": str(e),
                "main_songs": [],
                "featured_songs": [],
                "total_songs": 0
            }
    
    def test_credentials(self) -> bool:
        """Test if Spotify credentials are valid"""
        try:
            self._get_access_token()
            return True
        except:
            return False


# Example usage
if __name__ == "__main__":
    # Test the service
    spotify = SpotifyService()
    
    if spotify.test_credentials():
        print("✅ Spotify credentials valid")
        
        # Test fetching an artist
        result = spotify.get_artist_all_songs("Taylor Swift")
        
        if "error" not in result:
            print(f"\n🎵 Artist: {result['artist_info']['name']}")
            print(f"📀 Total albums: {len(result['albums'])}")
            print(f"🎤 Total songs: {result['total_songs']}")
            print(f"\nFirst 10 songs:")
            for song in result['songs'][:10]:
                print(f"  - {song}")
        else:
            print(f"❌ Error: {result['error']}")
    else:
        print("❌ Spotify credentials not configured")
