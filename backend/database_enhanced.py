import sqlite3
from datetime import datetime
from typing import List, Optional
from models import Video, Keyword, SearchLog, Artist, AutoFlagRule, Song
import os
import json

class Database:
    def __init__(self, db_path: str = "videos.db"):
        self.db_path = db_path
        self.init_db()
        self.migrate_db()
    
    def get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    def init_db(self):
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Artists table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS artists (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                email TEXT,
                contact_person TEXT,
                notes TEXT,
                active BOOLEAN DEFAULT 1,
                created_at TEXT NOT NULL
            )
        ''')
        
        # Videos table (enhanced)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS videos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                video_id TEXT UNIQUE NOT NULL,
                title TEXT NOT NULL,
                channel_name TEXT NOT NULL,
                channel_id TEXT NOT NULL,
                publish_date TEXT NOT NULL,
                thumbnail_url TEXT,
                video_url TEXT NOT NULL,
                matched_keyword TEXT NOT NULL,
                status TEXT DEFAULT 'Pending',
                priority TEXT DEFAULT 'Medium',
                artist_id INTEGER,
                auto_flagged BOOLEAN DEFAULT 0,
                ai_risk_score INTEGER DEFAULT 0,
                ai_risk_level TEXT,
                ai_reason TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY (artist_id) REFERENCES artists(id)
            )
        ''')
        
        # Keywords table (enhanced)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS keywords (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                keyword TEXT NOT NULL,
                active BOOLEAN DEFAULT 1,
                artist_id INTEGER,
                auto_flag BOOLEAN DEFAULT 0,
                priority TEXT DEFAULT 'Medium',
                created_at TEXT NOT NULL,
                FOREIGN KEY (artist_id) REFERENCES artists(id),
                UNIQUE(keyword, artist_id)
            )
        ''')
        
        # Songs table (song + artist combinations)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS songs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                song_name TEXT NOT NULL,
                artist_name TEXT NOT NULL,
                active BOOLEAN DEFAULT 1,
                artist_id INTEGER,
                auto_flag BOOLEAN DEFAULT 0,
                priority TEXT DEFAULT 'Medium',
                created_at TEXT NOT NULL,
                duration_ms INTEGER,
                FOREIGN KEY (artist_id) REFERENCES artists(id),
                UNIQUE(song_name, artist_name)
            )
        ''')
        
        # Auto-flag rules table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS auto_flag_rules (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                description TEXT,
                conditions TEXT NOT NULL,
                action TEXT NOT NULL,
                active BOOLEAN DEFAULT 1,
                created_at TEXT NOT NULL
            )
        ''')
        
        # Search logs table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS search_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                keyword TEXT NOT NULL,
                results_count INTEGER DEFAULT 0,
                timestamp TEXT NOT NULL,
                success BOOLEAN DEFAULT 1,
                error_message TEXT,
                artist_id INTEGER,
                FOREIGN KEY (artist_id) REFERENCES artists(id)
            )
        ''')
        
        # Email notifications queue
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS email_queue (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                recipient TEXT NOT NULL,
                subject TEXT NOT NULL,
                body TEXT NOT NULL,
                sent BOOLEAN DEFAULT 0,
                created_at TEXT NOT NULL,
                sent_at TEXT
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def migrate_db(self):
        """Migrate existing database to new schema"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            # Check if priority column exists in videos
            cursor.execute("PRAGMA table_info(videos)")
            columns = [row[1] for row in cursor.fetchall()]
            
            if 'priority' not in columns:
                cursor.execute("ALTER TABLE videos ADD COLUMN priority TEXT DEFAULT 'Medium'")
            if 'artist_id' not in columns:
                cursor.execute("ALTER TABLE videos ADD COLUMN artist_id INTEGER")
            if 'auto_flagged' not in columns:
                cursor.execute("ALTER TABLE videos ADD COLUMN auto_flagged BOOLEAN DEFAULT 0")
            if 'ai_risk_score' not in columns:
                cursor.execute("ALTER TABLE videos ADD COLUMN ai_risk_score INTEGER DEFAULT 0")
            if 'ai_risk_level' not in columns:
                cursor.execute("ALTER TABLE videos ADD COLUMN ai_risk_level TEXT")
            if 'ai_reason' not in columns:
                cursor.execute("ALTER TABLE videos ADD COLUMN ai_reason TEXT")
            
            # Check if songs table exists and add duration_ms if needed
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='songs'")
            if cursor.fetchone():
                cursor.execute("PRAGMA table_info(songs)")
                song_columns = [row[1] for row in cursor.fetchall()]
                if 'duration_ms' not in song_columns:
                    cursor.execute("ALTER TABLE songs ADD COLUMN duration_ms INTEGER")
            
            # Check keywords table
            cursor.execute("PRAGMA table_info(keywords)")
            columns = [row[1] for row in cursor.fetchall()]
            
            if 'artist_id' not in columns:
                cursor.execute("ALTER TABLE keywords ADD COLUMN artist_id INTEGER")
            if 'auto_flag' not in columns:
                cursor.execute("ALTER TABLE keywords ADD COLUMN auto_flag BOOLEAN DEFAULT 0")
            if 'priority' not in columns:
                cursor.execute("ALTER TABLE keywords ADD COLUMN priority TEXT DEFAULT 'Medium'")
            
            # Check search_logs table
            cursor.execute("PRAGMA table_info(search_logs)")
            columns = [row[1] for row in cursor.fetchall()]
            
            if 'artist_id' not in columns:
                cursor.execute("ALTER TABLE search_logs ADD COLUMN artist_id INTEGER")
            
            conn.commit()
        except Exception as e:
            print(f"Migration warning: {str(e)}")
        finally:
            conn.close()
    
    # Artist operations
    def add_artist(self, name: str, email: str = None, contact_person: str = None, notes: str = None) -> Optional[int]:
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT INTO artists (name, email, contact_person, notes, active, created_at)
                VALUES (?, ?, ?, ?, 1, ?)
            ''', (name, email, contact_person, notes, datetime.now().isoformat()))
            
            conn.commit()
            return cursor.lastrowid
        except sqlite3.IntegrityError:
            return None
        finally:
            conn.close()
    
    def get_all_artists(self) -> List[Artist]:
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM artists ORDER BY name")
        rows = cursor.fetchall()
        conn.close()
        
        return [Artist(
            id=row['id'],
            name=row['name'],
            email=row['email'],
            contact_person=row['contact_person'],
            notes=row['notes'],
            active=bool(row['active']),
            created_at=row['created_at']
        ) for row in rows]
    
    def get_artist(self, artist_id: int) -> Optional[Artist]:
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM artists WHERE id = ?", (artist_id,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return Artist(
                id=row['id'],
                name=row['name'],
                email=row['email'],
                contact_person=row['contact_person'],
                notes=row['notes'],
                active=bool(row['active']),
                created_at=row['created_at']
            )
        return None
    
    def update_artist(self, artist_id: int, name: str = None, email: str = None, 
                     contact_person: str = None, notes: str = None, active: bool = None) -> bool:
        conn = self.get_connection()
        cursor = conn.cursor()
        
        updates = []
        params = []
        
        if name is not None:
            updates.append("name = ?")
            params.append(name)
        if email is not None:
            updates.append("email = ?")
            params.append(email)
        if contact_person is not None:
            updates.append("contact_person = ?")
            params.append(contact_person)
        if notes is not None:
            updates.append("notes = ?")
            params.append(notes)
        if active is not None:
            updates.append("active = ?")
            params.append(int(active))
        
        if not updates:
            return False
        
        params.append(artist_id)
        query = f"UPDATE artists SET {', '.join(updates)} WHERE id = ?"
        
        cursor.execute(query, params)
        conn.commit()
        success = cursor.rowcount > 0
        conn.close()
        
        return success
    
    def delete_artist(self, artist_id: int) -> bool:
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM artists WHERE id = ?", (artist_id,))
        conn.commit()
        success = cursor.rowcount > 0
        conn.close()
        
        return success
    
    # Enhanced video operations
    def add_video(self, video: Video) -> Optional[int]:
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT INTO videos (video_id, title, channel_name, channel_id, 
                                  publish_date, thumbnail_url, video_url, 
                                  matched_keyword, status, priority, artist_id, 
                                  auto_flagged, ai_risk_score, ai_risk_level, ai_reason, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (video.video_id, video.title, video.channel_name, video.channel_id,
                  video.publish_date, video.thumbnail_url, video.video_url,
                  video.matched_keyword, video.status, video.priority, video.artist_id,
                  int(video.auto_flagged), video.ai_risk_score, video.ai_risk_level, 
                  video.ai_reason, video.created_at))
            
            conn.commit()
            return cursor.lastrowid
        except sqlite3.IntegrityError:
            return None
        finally:
            conn.close()
    
    def get_all_videos(self, filters: dict = None) -> List[Video]:
        conn = self.get_connection()
        cursor = conn.cursor()
        
        query = "SELECT * FROM videos WHERE 1=1"
        params = []
        
        if filters:
            if filters.get('keyword'):
                query += " AND matched_keyword = ?"
                params.append(filters['keyword'])
            if filters.get('status'):
                query += " AND status = ?"
                params.append(filters['status'])
            if filters.get('priority'):
                query += " AND priority = ?"
                params.append(filters['priority'])
            if filters.get('artist_id'):
                query += " AND artist_id = ?"
                params.append(filters['artist_id'])
            if filters.get('auto_flagged') is not None:
                query += " AND auto_flagged = ?"
                params.append(int(filters['auto_flagged']))
            if filters.get('date_from'):
                query += " AND publish_date >= ?"
                params.append(filters['date_from'])
            if filters.get('date_to'):
                query += " AND publish_date <= ?"
                params.append(filters['date_to'])
        
        # Sort by priority first (Critical/High at top), then by creation date
        query += """ ORDER BY 
            CASE priority
                WHEN 'Critical' THEN 4
                WHEN 'High' THEN 3
                WHEN 'Medium' THEN 2
                WHEN 'Low' THEN 1
                ELSE 0
            END DESC,
            created_at DESC
        """
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        conn.close()
        
        videos = []
        for row in rows:
            # Handle new AI columns that might not exist in older databases
            try:
                ai_risk_score = row['ai_risk_score'] if 'ai_risk_score' in row.keys() else 0
                ai_risk_level = row['ai_risk_level'] if 'ai_risk_level' in row.keys() else None
                ai_reason = row['ai_reason'] if 'ai_reason' in row.keys() else None
            except (KeyError, IndexError):
                ai_risk_score = 0
                ai_risk_level = None
                ai_reason = None
            
            videos.append(Video(
                id=row['id'],
                video_id=row['video_id'],
                title=row['title'],
                channel_name=row['channel_name'],
                channel_id=row['channel_id'],
                publish_date=row['publish_date'],
                thumbnail_url=row['thumbnail_url'],
                video_url=row['video_url'],
                matched_keyword=row['matched_keyword'],
                status=row['status'],
                priority=row['priority'],
                artist_id=row['artist_id'],
                auto_flagged=bool(row['auto_flagged']),
                ai_risk_score=ai_risk_score,
                ai_risk_level=ai_risk_level,
                ai_reason=ai_reason,
                created_at=row['created_at']
            ))
        
        return videos
    
    def update_video_status(self, video_id: int, status: str) -> bool:
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("UPDATE videos SET status = ? WHERE id = ?", (status, video_id))
        conn.commit()
        success = cursor.rowcount > 0
        conn.close()
        
        return success
    
    def update_video_priority(self, video_id: int, priority: str) -> bool:
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("UPDATE videos SET priority = ? WHERE id = ?", (priority, video_id))
        conn.commit()
        success = cursor.rowcount > 0
        conn.close()
        
        return success
    
    def batch_update_videos(self, video_ids: List[int], status: str = None, priority: str = None) -> int:
        """Batch update multiple videos"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        updates = []
        if status:
            updates.append(f"status = '{status}'")
        if priority:
            updates.append(f"priority = '{priority}'")
        
        if not updates:
            return 0
        
        placeholders = ','.join('?' * len(video_ids))
        query = f"UPDATE videos SET {', '.join(updates)} WHERE id IN ({placeholders})"
        
        cursor.execute(query, video_ids)
        conn.commit()
        count = cursor.rowcount
        conn.close()
        
        return count
    
    def delete_video(self, video_id: int) -> bool:
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM videos WHERE id = ?", (video_id,))
        conn.commit()
        success = cursor.rowcount > 0
        conn.close()
        
        return success
    
    # Enhanced keyword operations
    def add_keyword(self, keyword: str, artist_id: int = None, auto_flag: bool = False, 
                   priority: str = "Medium") -> Optional[int]:
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT INTO keywords (keyword, active, artist_id, auto_flag, priority, created_at)
                VALUES (?, 1, ?, ?, ?, ?)
            ''', (keyword, artist_id, int(auto_flag), priority, datetime.now().isoformat()))
            
            conn.commit()
            return cursor.lastrowid
        except sqlite3.IntegrityError:
            return None
        finally:
            conn.close()
    
    def bulk_add_keywords(self, keywords: List[dict]) -> dict:
        """Bulk import keywords from list"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        added = 0
        skipped = 0
        errors = []
        
        for kw in keywords:
            try:
                cursor.execute('''
                    INSERT INTO keywords (keyword, active, artist_id, auto_flag, priority, created_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (
                    kw.get('keyword'),
                    int(kw.get('active', True)),
                    kw.get('artist_id'),
                    int(kw.get('auto_flag', False)),
                    kw.get('priority', 'Medium'),
                    datetime.now().isoformat()
                ))
                added += 1
            except sqlite3.IntegrityError:
                skipped += 1
            except Exception as e:
                errors.append(f"{kw.get('keyword')}: {str(e)}")
        
        conn.commit()
        conn.close()
        
        return {
            'added': added,
            'skipped': skipped,
            'errors': errors
        }
    
    def get_all_keywords(self, artist_id: int = None) -> List[Keyword]:
        conn = self.get_connection()
        cursor = conn.cursor()
        
        if artist_id:
            cursor.execute("SELECT * FROM keywords WHERE artist_id = ? ORDER BY created_at DESC", (artist_id,))
        else:
            cursor.execute("SELECT * FROM keywords ORDER BY created_at DESC")
        
        rows = cursor.fetchall()
        conn.close()
        
        return [Keyword(
            id=row['id'],
            keyword=row['keyword'],
            active=bool(row['active']),
            artist_id=row['artist_id'],
            auto_flag=bool(row['auto_flag']),
            priority=row['priority'],
            created_at=row['created_at']
        ) for row in rows]
    
    def get_active_keywords(self, artist_id: int = None) -> List[str]:
        conn = self.get_connection()
        cursor = conn.cursor()
        
        if artist_id:
            cursor.execute("SELECT keyword FROM keywords WHERE active = 1 AND artist_id = ?", (artist_id,))
        else:
            cursor.execute("SELECT keyword FROM keywords WHERE active = 1")
        
        rows = cursor.fetchall()
        conn.close()
        
        return [row['keyword'] for row in rows]
    
    def update_keyword(self, keyword_id: int, active: bool = None, auto_flag: bool = None, 
                      priority: str = None) -> bool:
        conn = self.get_connection()
        cursor = conn.cursor()
        
        updates = []
        params = []
        
        if active is not None:
            updates.append("active = ?")
            params.append(int(active))
        if auto_flag is not None:
            updates.append("auto_flag = ?")
            params.append(int(auto_flag))
        if priority is not None:
            updates.append("priority = ?")
            params.append(priority)
        
        if not updates:
            return False
        
        params.append(keyword_id)
        query = f"UPDATE keywords SET {', '.join(updates)} WHERE id = ?"
        
        cursor.execute(query, params)
        conn.commit()
        success = cursor.rowcount > 0
        conn.close()
        
        return success
    
    def delete_keyword(self, keyword_id: int) -> bool:
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM keywords WHERE id = ?", (keyword_id,))
        conn.commit()
        success = cursor.rowcount > 0
        conn.close()
        
        return success
    
    # Song operations
    def add_song(self, song_name: str, artist_name: str, artist_id: int = None, 
                auto_flag: bool = False, priority: str = "Medium", duration_ms: int = None) -> Optional[int]:
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT INTO songs (song_name, artist_name, active, artist_id, auto_flag, priority, created_at, duration_ms)
                VALUES (?, ?, 1, ?, ?, ?, ?, ?)
            ''', (song_name, artist_name, artist_id, int(auto_flag), priority, datetime.now().isoformat(), duration_ms))
            
            conn.commit()
            return cursor.lastrowid
        except sqlite3.IntegrityError:
            return None
        finally:
            conn.close()
    
    def get_all_songs(self, artist_id: int = None) -> List[Song]:
        conn = self.get_connection()
        cursor = conn.cursor()
        
        if artist_id:
            cursor.execute("SELECT * FROM songs WHERE artist_id = ? ORDER BY created_at DESC", (artist_id,))
        else:
            cursor.execute("SELECT * FROM songs ORDER BY created_at DESC")
        
        rows = cursor.fetchall()
        conn.close()
        
        return [Song(
            id=row['id'],
            song_name=row['song_name'],
            artist_name=row['artist_name'],
            active=bool(row['active']),
            artist_id=row['artist_id'],
            auto_flag=bool(row['auto_flag']),
            priority=row['priority'],
            created_at=row['created_at'],
            duration_ms=row['duration_ms'] if 'duration_ms' in row.keys() else None
        ) for row in rows]
    
    def get_active_songs(self, artist_id: int = None) -> List[Song]:
        conn = self.get_connection()
        cursor = conn.cursor()
        
        if artist_id:
            cursor.execute("SELECT * FROM songs WHERE active = 1 AND artist_id = ?", (artist_id,))
        else:
            cursor.execute("SELECT * FROM songs WHERE active = 1")
        
        rows = cursor.fetchall()
        conn.close()
        
        return [Song(
            id=row['id'],
            song_name=row['song_name'],
            artist_name=row['artist_name'],
            active=bool(row['active']),
            artist_id=row['artist_id'],
            auto_flag=bool(row['auto_flag']),
            priority=row['priority'],
            created_at=row['created_at'],
            duration_ms=row['duration_ms'] if 'duration_ms' in row.keys() else None
        ) for row in rows]
    
    def update_song(self, song_id: int, active: bool = None, auto_flag: bool = None, 
                   priority: str = None) -> bool:
        conn = self.get_connection()
        cursor = conn.cursor()
        
        updates = []
        params = []
        
        if active is not None:
            updates.append("active = ?")
            params.append(int(active))
        if auto_flag is not None:
            updates.append("auto_flag = ?")
            params.append(int(auto_flag))
        if priority is not None:
            updates.append("priority = ?")
            params.append(priority)
        
        if not updates:
            return False
        
        params.append(song_id)
        query = f"UPDATE songs SET {', '.join(updates)} WHERE id = ?"
        
        cursor.execute(query, params)
        conn.commit()
        success = cursor.rowcount > 0
        conn.close()
        
        return success
    
    def delete_song(self, song_id: int) -> bool:
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM songs WHERE id = ?", (song_id,))
        conn.commit()
        success = cursor.rowcount > 0
        conn.close()
        
        return success
    
    def bulk_add_songs(self, songs: List[dict]) -> dict:
        """Bulk import songs from list"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        added = 0
        skipped = 0
        errors = []
        
        for song in songs:
            try:
                cursor.execute('''
                    INSERT INTO songs (song_name, artist_name, active, artist_id, auto_flag, priority, created_at, duration_ms)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    song.get('song_name'),
                    song.get('artist_name'),
                    int(song.get('active', True)),
                    song.get('artist_id'),
                    int(song.get('auto_flag', False)),
                    song.get('priority', 'Medium'),
                    datetime.now().isoformat(),
                    song.get('duration_ms')
                ))
                added += 1
            except sqlite3.IntegrityError:
                skipped += 1
            except Exception as e:
                errors.append(f"{song.get('song_name')} - {song.get('artist_name')}: {str(e)}")
        
        conn.commit()
        conn.close()
        
        return {
            'added': added,
            'skipped': skipped,
            'errors': errors
        }
    
    # Auto-flag rules operations
    def add_auto_flag_rule(self, name: str, conditions: dict, action: str, description: str = None) -> Optional[int]:
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT INTO auto_flag_rules (name, description, conditions, action, active, created_at)
                VALUES (?, ?, ?, ?, 1, ?)
            ''', (name, description, json.dumps(conditions), action, datetime.now().isoformat()))
            
            conn.commit()
            return cursor.lastrowid
        except sqlite3.IntegrityError:
            return None
        finally:
            conn.close()
    
    def get_active_auto_flag_rules(self) -> List[AutoFlagRule]:
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM auto_flag_rules WHERE active = 1")
        rows = cursor.fetchall()
        conn.close()
        
        return [AutoFlagRule(
            id=row['id'],
            name=row['name'],
            description=row['description'],
            conditions=row['conditions'],
            action=row['action'],
            active=bool(row['active']),
            created_at=row['created_at']
        ) for row in rows]
    
    def get_auto_flag_rule_by_name(self, name: str) -> Optional[AutoFlagRule]:
        """Get an auto-flag rule by name"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM auto_flag_rules WHERE name = ?", (name,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return AutoFlagRule(
                id=row['id'],
                name=row['name'],
                description=row['description'],
                conditions=row['conditions'],
                action=row['action'],
                active=bool(row['active']),
                created_at=row['created_at']
            )
        return None
    
    def apply_auto_flag_rules(self, video: Video) -> tuple:
        """Check and apply auto-flag rules to a video"""
        rules = self.get_active_auto_flag_rules()
        should_flag = False
        priority = video.priority
        
        for rule in rules:
            conditions = json.loads(rule.conditions)
            
            # Check if conditions match
            if self._check_conditions(video, conditions):
                if rule.action == 'flag':
                    should_flag = True
                elif rule.action == 'high_priority':
                    priority = 'High'
                elif rule.action == 'critical':
                    priority = 'Critical'
                    should_flag = True
        
        return (should_flag, priority)
    
    def _check_conditions(self, video: Video, conditions: dict) -> bool:
        """Check if video matches conditions"""
        for key, value in conditions.items():
            if key == 'channel_name_contains':
                if value.lower() not in video.channel_name.lower():
                    return False
            elif key == 'title_contains':
                if value.lower() not in video.title.lower():
                    return False
            elif key == 'keyword_exact_match':
                if value.lower() != video.matched_keyword.lower():
                    return False
        return True
    
    # Search log operations
    def add_search_log(self, keyword: str, results_count: int, success: bool, 
                      error_message: Optional[str] = None, artist_id: int = None):
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO search_logs (keyword, results_count, timestamp, success, error_message, artist_id)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (keyword, results_count, datetime.now().isoformat(), int(success), error_message, artist_id))
        
        conn.commit()
        conn.close()
    
    def get_search_logs(self, limit: int = 50, artist_id: int = None) -> List[SearchLog]:
        conn = self.get_connection()
        cursor = conn.cursor()
        
        if artist_id:
            cursor.execute("SELECT * FROM search_logs WHERE artist_id = ? ORDER BY timestamp DESC LIMIT ?", (artist_id, limit))
        else:
            cursor.execute("SELECT * FROM search_logs ORDER BY timestamp DESC LIMIT ?", (limit,))
        
        rows = cursor.fetchall()
        conn.close()
        
        return [SearchLog(
            id=row['id'],
            keyword=row['keyword'],
            results_count=row['results_count'],
            timestamp=row['timestamp'],
            success=bool(row['success']),
            error_message=row['error_message']
        ) for row in rows]
    
    def get_stats(self, artist_id: int = None) -> dict:
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Build queries with optional artist filter
        artist_filter = f"WHERE artist_id = {artist_id}" if artist_id else ""
        
        # Total videos
        cursor.execute(f"SELECT COUNT(*) as count FROM videos {artist_filter}")
        total_videos = cursor.fetchone()['count']
        
        # Videos by status
        cursor.execute(f"SELECT status, COUNT(*) as count FROM videos {artist_filter} GROUP BY status")
        status_counts = {row['status']: row['count'] for row in cursor.fetchall()}
        
        # Videos by priority
        cursor.execute(f"SELECT priority, COUNT(*) as count FROM videos {artist_filter} GROUP BY priority")
        priority_counts = {row['priority']: row['count'] for row in cursor.fetchall()}
        
        # Auto-flagged count
        cursor.execute(f"SELECT COUNT(*) as count FROM videos {f'{artist_filter} AND' if artist_filter else 'WHERE'} auto_flagged = 1")
        auto_flagged = cursor.fetchone()['count']
        
        # Last search time
        cursor.execute(f"SELECT timestamp FROM search_logs {artist_filter} ORDER BY timestamp DESC LIMIT 1")
        last_search_row = cursor.fetchone()
        last_search = last_search_row['timestamp'] if last_search_row else None
        
        conn.close()
        
        return {
            'total_videos': total_videos,
            'pending': status_counts.get('Pending', 0),
            'reviewed': status_counts.get('Reviewed', 0),
            'flagged': status_counts.get('Flagged for Takedown', 0),
            'priority_low': priority_counts.get('Low', 0),
            'priority_medium': priority_counts.get('Medium', 0),
            'priority_high': priority_counts.get('High', 0),
            'priority_critical': priority_counts.get('Critical', 0),
            'auto_flagged': auto_flagged,
            'last_search': last_search
        }
