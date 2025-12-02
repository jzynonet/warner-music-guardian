"""
Auto-Update Service
Automatically checks for new releases and updates keywords
"""

from datetime import datetime, timedelta
from typing import List, Dict
import json


class AutoUpdateService:
    """
    Manages automatic updates for artist releases
    Checks Spotify/MusicBrainz for new songs weekly
    """
    
    def __init__(self, database, spotify_service=None, musicbrainz_service=None):
        self.db = database
        self.spotify = spotify_service
        self.musicbrainz = musicbrainz_service
    
    def get_auto_update_config(self, artist_id: int) -> Dict:
        """Get auto-update configuration for an artist"""
        conn = self.db.get_connection()
        cursor = conn.cursor()
        
        # Check if config table exists, create if not
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS auto_update_config (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                artist_id INTEGER UNIQUE NOT NULL,
                enabled BOOLEAN DEFAULT 1,
                frequency TEXT DEFAULT 'weekly',
                last_check TEXT,
                last_update TEXT,
                songs_count INTEGER DEFAULT 0,
                source TEXT DEFAULT 'spotify',
                FOREIGN KEY (artist_id) REFERENCES artists(id)
            )
        """)
        
        cursor.execute("SELECT * FROM auto_update_config WHERE artist_id = ?", (artist_id,))
        result = cursor.fetchone()
        conn.close()
        
        if result:
            return dict(result)
        
        return None
    
    def enable_auto_update(self, artist_id: int, frequency: str = 'weekly', source: str = 'spotify') -> bool:
        """
        Enable auto-update for an artist
        
        Args:
            artist_id: Artist ID
            frequency: 'daily', 'weekly', 'monthly'
            source: 'spotify' or 'musicbrainz'
        """
        conn = self.db.get_connection()
        cursor = conn.cursor()
        
        # Ensure table exists
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS auto_update_config (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                artist_id INTEGER UNIQUE NOT NULL,
                enabled BOOLEAN DEFAULT 1,
                frequency TEXT DEFAULT 'weekly',
                last_check TEXT,
                last_update TEXT,
                songs_count INTEGER DEFAULT 0,
                source TEXT DEFAULT 'spotify',
                FOREIGN KEY (artist_id) REFERENCES artists(id)
            )
        """)
        
        try:
            cursor.execute("""
                INSERT OR REPLACE INTO auto_update_config 
                (artist_id, enabled, frequency, source, last_check)
                VALUES (?, 1, ?, ?, ?)
            """, (artist_id, frequency, source, datetime.now().isoformat()))
            
            conn.commit()
            success = True
        except Exception as e:
            print(f"Error enabling auto-update: {e}")
            success = False
        finally:
            conn.close()
        
        return success
    
    def disable_auto_update(self, artist_id: int) -> bool:
        """Disable auto-update for an artist"""
        conn = self.db.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE auto_update_config 
            SET enabled = 0 
            WHERE artist_id = ?
        """, (artist_id,))
        
        conn.commit()
        success = cursor.rowcount > 0
        conn.close()
        
        return success
    
    def check_if_update_needed(self, artist_id: int) -> bool:
        """
        Check if an artist needs to be updated based on schedule
        """
        config = self.get_auto_update_config(artist_id)
        
        if not config or not config['enabled']:
            return False
        
        if not config['last_check']:
            return True
        
        last_check = datetime.fromisoformat(config['last_check'])
        now = datetime.now()
        
        # Calculate next check time based on frequency
        if config['frequency'] == 'daily':
            next_check = last_check + timedelta(days=1)
        elif config['frequency'] == 'weekly':
            next_check = last_check + timedelta(weeks=1)
        elif config['frequency'] == 'monthly':
            next_check = last_check + timedelta(days=30)
        else:
            next_check = last_check + timedelta(weeks=1)
        
        return now >= next_check
    
    def update_artist_songs(self, artist_id: int) -> Dict:
        """
        Fetch latest songs for artist and add new ones as keywords
        
        Returns:
            dict with keys: success, new_songs, total_songs, error
        """
        # Get artist info
        artist = self.db.get_artist(artist_id)
        if not artist:
            return {"success": False, "error": "Artist not found"}
        
        config = self.get_auto_update_config(artist_id)
        source = config['source'] if config else 'spotify'
        
        # Fetch songs from external service
        if source == 'spotify' and self.spotify:
            result = self.spotify.get_artist_all_songs(artist.name)
        elif source == 'musicbrainz' and self.musicbrainz:
            result = self.musicbrainz.get_artist_all_songs(artist.name)
        else:
            return {"success": False, "error": f"Service '{source}' not available"}
        
        if "error" in result:
            return {"success": False, "error": result["error"]}
        
        # Get existing keywords for this artist
        existing_keywords = set()
        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT keyword FROM keywords WHERE artist_id = ?", (artist_id,))
        existing_keywords = {row['keyword'] for row in cursor.fetchall()}
        conn.close()
        
        # Find new songs
        new_songs = [song for song in result['songs'] if song not in existing_keywords]
        
        # Add new songs as keywords
        added_count = 0
        for song in new_songs:
            try:
                self.db.add_keyword(song, artist_id=artist_id, auto_flag=False, priority='Medium')
                added_count += 1
            except Exception as e:
                print(f"Error adding keyword '{song}': {e}")
        
        # Update config
        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE auto_update_config 
            SET last_check = ?,
                last_update = ?,
                songs_count = ?
            WHERE artist_id = ?
        """, (datetime.now().isoformat(), 
              datetime.now().isoformat() if added_count > 0 else config.get('last_update'),
              result['total_songs'],
              artist_id))
        conn.commit()
        conn.close()
        
        return {
            "success": True,
            "new_songs": added_count,
            "total_songs": result['total_songs'],
            "artist": artist.name,
            "source": source
        }
    
    def update_all_artists(self) -> List[Dict]:
        """
        Check and update all artists that have auto-update enabled
        
        Returns:
            List of update results for each artist
        """
        # Get all artists with auto-update enabled
        conn = self.db.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT artist_id 
            FROM auto_update_config 
            WHERE enabled = 1
        """)
        
        artist_ids = [row['artist_id'] for row in cursor.fetchall()]
        conn.close()
        
        results = []
        
        for artist_id in artist_ids:
            # Check if update is needed
            if self.check_if_update_needed(artist_id):
                result = self.update_artist_songs(artist_id)
                results.append(result)
        
        return results
    
    def get_update_status(self) -> Dict:
        """
        Get status of auto-update system
        
        Returns:
            dict with overall status and artist statuses
        """
        conn = self.db.get_connection()
        cursor = conn.cursor()
        
        # Get all auto-update configs
        cursor.execute("""
            SELECT 
                auc.*,
                a.name as artist_name
            FROM auto_update_config auc
            JOIN artists a ON auc.artist_id = a.id
            ORDER BY auc.last_check DESC
        """)
        
        configs = []
        for row in cursor.fetchall():
            config_dict = dict(row)
            
            # Calculate time until next check
            if config_dict['last_check']:
                last_check = datetime.fromisoformat(config_dict['last_check'])
                
                if config_dict['frequency'] == 'daily':
                    next_check = last_check + timedelta(days=1)
                elif config_dict['frequency'] == 'weekly':
                    next_check = last_check + timedelta(weeks=1)
                elif config_dict['frequency'] == 'monthly':
                    next_check = last_check + timedelta(days=30)
                else:
                    next_check = last_check + timedelta(weeks=1)
                
                config_dict['next_check'] = next_check.isoformat()
                config_dict['needs_update'] = datetime.now() >= next_check
            else:
                config_dict['next_check'] = None
                config_dict['needs_update'] = True
            
            configs.append(config_dict)
        
        conn.close()
        
        # Count enabled vs disabled
        enabled_count = sum(1 for c in configs if c['enabled'])
        needs_update_count = sum(1 for c in configs if c.get('needs_update', False))
        
        return {
            "total_artists": len(configs),
            "enabled": enabled_count,
            "disabled": len(configs) - enabled_count,
            "needs_update": needs_update_count,
            "artists": configs
        }


# Example usage
if __name__ == "__main__":
    from database_enhanced import Database
    from spotify_service import SpotifyService
    
    db = Database()
    spotify = SpotifyService()
    auto_update = AutoUpdateService(db, spotify_service=spotify)
    
    print("🔄 Auto-Update Service Test\n")
    
    # Get status
    status = auto_update.get_update_status()
    print(f"📊 Status:")
    print(f"  - Total artists: {status['total_artists']}")
    print(f"  - Enabled: {status['enabled']}")
    print(f"  - Needs update: {status['needs_update']}")
    
    if status['artists']:
        print(f"\n📋 Artist Schedules:")
        for artist in status['artists'][:5]:
            print(f"  - {artist['artist_name']}: {artist['frequency']} (Next: {artist.get('next_check', 'Soon')})")
