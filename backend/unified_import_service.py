"""
Unified Artist & Song Import Service
Combines Spotify + MusicBrainz + Deezer for reliable song fetching.
Falls back gracefully when one source fails.
Now includes Deezer (free, no auth) to bypass Spotify API restrictions.
"""

import time
from typing import List, Dict, Optional


class UnifiedImportService:
    """
    Unified import that tries multiple sources:
    1. Spotify (if configured) - better metadata, album grouping
    2. Deezer (always available, free) - excellent metadata, no auth needed
    3. MusicBrainz (always available) - free, comprehensive, no auth needed
    """
    
    def __init__(self, spotify_service=None, musicbrainz_service=None, web_scraper_service=None):
        self.spotify = spotify_service
        self.musicbrainz = musicbrainz_service
        self.web_scraper = web_scraper_service
    
    def search_artist(self, artist_name: str) -> Dict:
        """
        Search for an artist by name across all available sources.
        
        Returns:
            dict with artist info and source used
        """
        result = {
            'found': False,
            'artist_info': None,
            'source': None,
            'spotify_available': self.spotify is not None and self._test_spotify(),
            'deezer_available': self.web_scraper is not None,
            'musicbrainz_available': self.musicbrainz is not None
        }
        
        # Try Spotify first (better metadata)
        if self.spotify and self._test_spotify():
            try:
                artist = self.spotify.search_artist(artist_name)
                if artist:
                    result['found'] = True
                    result['artist_info'] = {
                        'name': artist['name'],
                        'spotify_id': artist['id'],
                        'genres': artist.get('genres', []),
                        'popularity': artist.get('popularity', 0),
                        'image_url': artist.get('image_url'),
                        'followers': artist.get('followers', 0)
                    }
                    result['source'] = 'spotify'
                    return result
            except Exception as e:
                print(f"Spotify artist search failed: {e}")
        
        # Try Deezer (free, no auth, great metadata)
        if self.web_scraper:
            try:
                artist = self.web_scraper.search_artist_deezer(artist_name)
                if artist:
                    result['found'] = True
                    result['artist_info'] = {
                        'name': artist['name'],
                        'deezer_id': artist['id'],
                        'image_url': artist.get('picture'),
                        'followers': artist.get('fans', 0),
                        'genres': [],
                        'deezer_link': artist.get('link')
                    }
                    result['source'] = 'deezer'
                    return result
            except Exception as e:
                print(f"Deezer artist search failed: {e}")
        
        # Fallback to MusicBrainz
        if self.musicbrainz:
            try:
                artist = self.musicbrainz.search_artist(artist_name)
                if artist:
                    result['found'] = True
                    result['artist_info'] = {
                        'name': artist['name'],
                        'musicbrainz_id': artist['id'],
                        'country': artist.get('country'),
                        'type': artist.get('type'),
                        'disambiguation': artist.get('disambiguation', ''),
                        'followers': 0,
                        'genres': [],
                        'image_url': None
                    }
                    result['source'] = 'musicbrainz'
                    return result
            except Exception as e:
                print(f"MusicBrainz artist search failed: {e}")
        
        return result
    
    def get_artist_songs(self, artist_name: str, spotify_url: str = None, preferred_source: str = None) -> Dict:
        """
        Get all songs for an artist, trying multiple sources.
        
        Args:
            artist_name: Artist name to search for
            spotify_url: Optional Spotify artist URL for direct lookup
            preferred_source: Optional preferred source ('deezer', 'spotify', 'musicbrainz')
            
        Returns:
            dict with:
                - artist_info: Artist metadata
                - main_songs: List of song dicts [{name, duration_ms, release_date}]
                - featured_songs: List of featured song dicts 
                - source: Which service provided the data
                - sources_tried: List of sources attempted
                - error: Error message if all sources failed
        """
        sources_tried = []
        last_error = None
        
        # If preferred source is specified, try it first
        if preferred_source == 'deezer' and artist_name and self.web_scraper:
            result = self._try_deezer(artist_name, sources_tried)
            if result:
                return result
        
        # Strategy 1: Try Spotify with URL (most precise)
        if spotify_url and self.spotify and self._test_spotify():
            sources_tried.append('spotify_url')
            try:
                result = self.spotify.get_artist_all_songs_by_url(spotify_url)
                if 'error' not in result:
                    main_songs = result.get('main_songs', [])
                    featured_songs = result.get('featured_songs', [])
                    
                    # Check if we actually got songs
                    if len(main_songs) > 0 or len(featured_songs) > 0:
                        return {
                            'success': True,
                            'artist_info': result['artist_info'],
                            'main_songs': main_songs,
                            'featured_songs': featured_songs,
                            'albums': result.get('albums', []),
                            'total_main_songs': len(main_songs),
                            'total_featured_songs': len(featured_songs),
                            'source': 'spotify',
                            'sources_tried': sources_tried
                        }
                    else:
                        last_error = "Spotify returned artist info but no songs (API restriction)"
                        print(f"⚠️ {last_error}")
                else:
                    last_error = result['error']
            except Exception as e:
                last_error = str(e)
                print(f"Spotify URL lookup failed: {e}")
        
        # Strategy 2: Try Spotify with artist name search
        if artist_name and self.spotify and self._test_spotify() and preferred_source != 'deezer':
            sources_tried.append('spotify_search')
            try:
                result = self.spotify.get_artist_all_songs(artist_name)
                if 'error' not in result:
                    songs = result.get('songs', [])
                    if isinstance(songs, list) and len(songs) > 0:
                        # Convert simple string list to dict format
                        main_songs = []
                        for song in songs:
                            if isinstance(song, str):
                                main_songs.append({
                                    'name': song,
                                    'duration_ms': None,
                                    'release_date': None
                                })
                            elif isinstance(song, dict):
                                main_songs.append(song)
                        
                        return {
                            'success': True,
                            'artist_info': result.get('artist_info', {'name': artist_name}),
                            'main_songs': main_songs,
                            'featured_songs': [],
                            'albums': result.get('albums', []),
                            'total_main_songs': len(main_songs),
                            'total_featured_songs': 0,
                            'source': 'spotify',
                            'sources_tried': sources_tried
                        }
                    else:
                        last_error = "Spotify returned no songs for this artist"
                else:
                    last_error = result['error']
            except Exception as e:
                last_error = str(e)
                print(f"Spotify search failed: {e}")
        
        # Strategy 3: Deezer (free, no auth, great metadata)
        if artist_name and self.web_scraper and preferred_source != 'deezer':
            result = self._try_deezer(artist_name, sources_tried)
            if result:
                # If we had Spotify artist info from earlier attempt, merge it
                if spotify_url and self.spotify:
                    try:
                        sp_artist = self.spotify.get_artist_from_url(spotify_url)
                        if sp_artist:
                            result['artist_info']['spotify_url'] = sp_artist.get('spotify_url')
                            if sp_artist.get('genres'):
                                result['artist_info']['genres'] = sp_artist['genres']
                    except:
                        pass
                return result
        
        # Strategy 4: MusicBrainz (always available, no auth)
        if artist_name and self.musicbrainz:
            sources_tried.append('musicbrainz')
            try:
                result = self.musicbrainz.get_artist_all_songs(artist_name)
                if 'error' not in result:
                    songs = result.get('songs', [])
                    if len(songs) > 0:
                        # Convert MusicBrainz song list to our format
                        main_songs = []
                        for song in songs:
                            if isinstance(song, str):
                                main_songs.append({
                                    'name': song,
                                    'duration_ms': None,
                                    'release_date': None
                                })
                            elif isinstance(song, dict):
                                main_songs.append(song)
                        
                        # Build artist_info from MusicBrainz data
                        mb_artist = result.get('artist_info', {})
                        artist_info = {
                            'name': mb_artist.get('name', artist_name),
                            'musicbrainz_id': mb_artist.get('id'),
                            'country': mb_artist.get('country'),
                            'genres': [],
                            'followers': 0,
                            'image_url': None
                        }
                        
                        # If we had Spotify artist info from earlier attempt, merge it
                        if spotify_url and self.spotify:
                            try:
                                sp_artist = self.spotify.get_artist_from_url(spotify_url)
                                if sp_artist:
                                    artist_info['name'] = sp_artist.get('name', artist_info['name'])
                                    artist_info['genres'] = sp_artist.get('genres', [])
                                    artist_info['followers'] = sp_artist.get('followers', 0)
                                    artist_info['image_url'] = sp_artist.get('image_url')
                                    artist_info['spotify_url'] = sp_artist.get('spotify_url')
                            except:
                                pass
                        
                        return {
                            'success': True,
                            'artist_info': artist_info,
                            'main_songs': main_songs,
                            'featured_songs': [],
                            'albums': [],
                            'total_main_songs': len(main_songs),
                            'total_featured_songs': 0,
                            'source': 'musicbrainz',
                            'sources_tried': sources_tried
                        }
                    else:
                        last_error = "MusicBrainz returned no songs for this artist"
                else:
                    last_error = result['error']
            except Exception as e:
                last_error = str(e)
                print(f"MusicBrainz lookup failed: {e}")
        
        # All sources failed
        return {
            'success': False,
            'error': last_error or "No song sources available. Please check your configuration.",
            'artist_info': None,
            'main_songs': [],
            'featured_songs': [],
            'total_main_songs': 0,
            'total_featured_songs': 0,
            'sources_tried': sources_tried
        }
    
    def _try_deezer(self, artist_name: str, sources_tried: list) -> Optional[Dict]:
        """Try fetching from Deezer. Returns result dict or None."""
        sources_tried.append('deezer')
        try:
            result = self.web_scraper.get_artist_songs_deezer(artist_name)
            if result.get('success'):
                main_songs = result.get('main_songs', [])
                featured_songs = result.get('featured_songs', [])
                
                if len(main_songs) > 0 or len(featured_songs) > 0:
                    return {
                        'success': True,
                        'artist_info': result['artist_info'],
                        'main_songs': main_songs,
                        'featured_songs': featured_songs,
                        'albums': result.get('albums', []),
                        'total_main_songs': len(main_songs),
                        'total_featured_songs': len(featured_songs),
                        'source': 'deezer',
                        'sources_tried': sources_tried
                    }
        except Exception as e:
            print(f"Deezer lookup failed: {e}")
        return None
    
    def _test_spotify(self) -> bool:
        """Test if Spotify credentials are valid"""
        try:
            return self.spotify.test_credentials()
        except:
            return False


# Example usage
if __name__ == "__main__":
    from spotify_service import SpotifyService
    from musicbrainz_service import MusicBrainzService
    from web_scraper_service import WebScraperService
    
    # Initialize services
    try:
        spotify = SpotifyService()
        spotify_ok = spotify.test_credentials()
    except:
        spotify = None
        spotify_ok = False
    
    musicbrainz = MusicBrainzService()
    web_scraper = WebScraperService()
    
    # Create unified service
    importer = UnifiedImportService(
        spotify_service=spotify if spotify_ok else None,
        musicbrainz_service=musicbrainz,
        web_scraper_service=web_scraper
    )
    
    print("🔍 Testing Unified Import Service\n")
    print(f"  Spotify: {'✅ Available' if spotify_ok else '❌ Not configured'}")
    print(f"  Deezer: ✅ Always available (free, no auth)")
    print(f"  MusicBrainz: ✅ Always available\n")
    
    # Test with an artist
    test_artist = "Drake"
    print(f"🎵 Searching for: {test_artist}")
    
    result = importer.get_artist_songs(test_artist)
    
    if result['success']:
        print(f"\n✅ Found via {result['source']}")
        print(f"  Artist: {result['artist_info']['name']}")
        print(f"  Main songs: {result['total_main_songs']}")
        print(f"  Featured songs: {result['total_featured_songs']}")
        print(f"  Sources tried: {', '.join(result['sources_tried'])}")
        print(f"\n  First 10 songs:")
        for song in result['main_songs'][:10]:
            name = song['name'] if isinstance(song, dict) else song
            print(f"    - {name}")
    else:
        print(f"\n❌ Failed: {result['error']}")
        print(f"  Sources tried: {', '.join(result['sources_tried'])}")
