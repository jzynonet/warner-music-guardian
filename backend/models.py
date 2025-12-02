from dataclasses import dataclass
from datetime import datetime
from typing import Optional, List

@dataclass
class Artist:
    id: Optional[int]
    name: str
    email: Optional[str]
    contact_person: Optional[str]
    notes: Optional[str]
    active: bool
    created_at: str
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'contact_person': self.contact_person,
            'notes': self.notes,
            'active': self.active,
            'created_at': self.created_at
        }

@dataclass
class Video:
    id: Optional[int]
    video_id: str
    title: str
    channel_name: str
    channel_id: str
    publish_date: str
    thumbnail_url: str
    video_url: str
    matched_keyword: str
    status: str  # "Pending", "Reviewed", "Flagged for Takedown"
    priority: str  # "Low", "Medium", "High", "Critical"
    artist_id: Optional[int]
    auto_flagged: bool
    ai_risk_score: int = 0
    ai_risk_level: Optional[str] = None
    ai_reason: Optional[str] = None
    created_at: str = ''
    
    def to_dict(self):
        return {
            'id': self.id,
            'video_id': self.video_id,
            'title': self.title,
            'channel_name': self.channel_name,
            'channel_id': self.channel_id,
            'publish_date': self.publish_date,
            'thumbnail_url': self.thumbnail_url,
            'video_url': self.video_url,
            'matched_keyword': self.matched_keyword,
            'status': self.status,
            'priority': self.priority,
            'artist_id': self.artist_id,
            'auto_flagged': self.auto_flagged,
            'ai_risk_score': self.ai_risk_score,
            'ai_risk_level': self.ai_risk_level,
            'ai_reason': self.ai_reason,
            'created_at': self.created_at
        }

@dataclass
class Keyword:
    id: Optional[int]
    keyword: str
    active: bool
    artist_id: Optional[int]
    auto_flag: bool  # Auto-flag videos matching this keyword
    priority: str  # "Low", "Medium", "High", "Critical"
    created_at: str
    
    def to_dict(self):
        return {
            'id': self.id,
            'keyword': self.keyword,
            'active': self.active,
            'artist_id': self.artist_id,
            'auto_flag': self.auto_flag,
            'priority': self.priority,
            'created_at': self.created_at
        }

@dataclass
class Song:
    id: Optional[int]
    song_name: str
    artist_name: str
    active: bool
    artist_id: Optional[int]
    auto_flag: bool
    priority: str  # "Low", "Medium", "High", "Critical"
    created_at: str
    duration_ms: Optional[int] = None  # Song duration in milliseconds
    
    def to_dict(self):
        return {
            'id': self.id,
            'song_name': self.song_name,
            'artist_name': self.artist_name,
            'active': self.active,
            'artist_id': self.artist_id,
            'auto_flag': self.auto_flag,
            'priority': self.priority,
            'created_at': self.created_at,
            'duration_ms': self.duration_ms
        }

@dataclass
class AutoFlagRule:
    id: Optional[int]
    name: str
    description: Optional[str]
    conditions: str  # JSON string with conditions
    action: str  # "flag", "high_priority", "notify"
    active: bool
    created_at: str
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'conditions': self.conditions,
            'action': self.action,
            'active': self.active,
            'created_at': self.created_at
        }

@dataclass
class SearchLog:
    id: Optional[int]
    keyword: str
    results_count: int
    timestamp: str
    success: bool
    error_message: Optional[str]
    
    def to_dict(self):
        return {
            'id': self.id,
            'keyword': self.keyword,
            'results_count': self.results_count,
            'timestamp': self.timestamp,
            'success': self.success,
            'error_message': self.error_message
        }
