"""
Advanced Music Copyright Detection System
Uses pattern matching, keyword analysis, and intelligent scoring to detect unauthorized music uploads
"""

import re
from typing import Dict, List, Tuple


class MusicDetector:
    """
    Intelligent music copyright violation detector
    Analyzes video metadata to identify potential unauthorized music content
    """
    
    # High-risk patterns that strongly indicate piracy
    HIGH_RISK_PATTERNS = {
        'title': [
            r'\b(full\s+album)\b',
            r'\b(complete\s+album)\b',
            r'\b(entire\s+album)\b',
            r'\b(all\s+songs)\b',
            r'\b(discography)\b',
            r'\b(mp3\s+download)\b',
            r'\b(free\s+download)\b',
            r'\b(download\s+free)\b',
            r'\b(flac\s+download)\b',
            r'\b(320kbps)\b',
            r'\b(high\s+quality\s+audio)\b',
            r'\b(leaked\s+album)\b',
            r'\b(unreleased)\b',
            r'\b(bootleg)\b',
            r'\b(pirated)\b',
            r'\b(unofficial\s+release)\b',
            r'\b(ripped\s+from)\b',
            r'\(\d{4}\)\s*full',  # (2023) full
            r'full\s+concert\s+recording',
            r'entire\s+concert',
            r'complete\s+concert',
        ],
        'channel': [
            r'\b(free\s*music)\b',
            r'\b(mp3\s*downloads?)\b',
            r'\b(music\s*pirate)\b',
            r'\b(bootleg)\b',
            r'\b(leaked\s*music)\b',
            r'\b(unofficial)\b',
            r'\b(album\s*uploads?)\b',
            r'\b(full\s*albums?)\b',
            r'pirat[ae]',
            r'\b(torrent)\b',
            r'\b(rip(ped)?)\b',
        ],
        'description': [
            r'\b(download\s+link)\b',
            r'\b(mega\.nz)\b',
            r'\b(mediafire)\b',
            r'\b(dropbox\.com/s/)\b',
            r'\b(bit\.ly/)\b',
            r'\b(free\s+mp3)\b',
            r'\b(tracklist):?\s*\n',
            r'\b(320\s*kbps)\b',
            r'\b(flac)\b',
            r'\b(wav\s+file)\b',
        ]
    }
    
    # Medium-risk patterns that may indicate violations
    MEDIUM_RISK_PATTERNS = {
        'title': [
            r'\b(live\s+concert)\b',
            r'\b(live\s+performance)\b',
            r'\b(live\s+at)\b',
            r'\b(concert\s+\d{4})\b',
            r'\b(tour\s+\d{4})\b',
            r'\b(remastered)\b',
            r'\b(extended\s+version)\b',
            r'\b(full\s+version)\b',
            r'\b(original\s+version)\b',
            r'\b(audio\s+only)\b',
            r'\b(lyrics?\s+video)\b',
            r'\b(official\s+audio)\b(?!.*\b(vevo|records?|music)\b)',  # "official" without legit markers
        ],
        'channel': [
            r'\b(music\s+archive)\b',
            r'\b(rare\s+music)\b',
            r'\b(old\s+music)\b',
            r'\b(classic\s+songs?)\b',
            r'\b(audio\s+collection)\b',
            r'\b(full\s+songs?)\b',
        ]
    }
    
    # Trusted channel indicators (legitimate sources)
    TRUSTED_INDICATORS = [
        r'\bvevo\b',
        r'\bofficial\s+artist\s+channel\b',
        r'\brecords?\b',
        r'\bentertainment\b',
        r'\bmusic\s+group\b',
        r'\b(warner|sony|universal)\b',
        r'\b(atlantic|columbia|republic)\b',
        r'\btopic\b$',  # YouTube auto-generated artist channels end with "Topic"
    ]
    
    # Suspicious channel patterns
    SUSPICIOUS_CHANNEL_PATTERNS = [
        r'^\d+[a-z]+\d+$',  # Random alphanumeric: 123abc456
        r'^[a-z]+\d{4,}$',  # Letters + many numbers: music12345
        r'\b(uploads?|uploader)\d+\b',
        r'\b(music|songs?|audio)\s*\d{2,}\b',
    ]
    
    # Copyright claim keywords
    COPYRIGHT_KEYWORDS = [
        'copyright', 'dmca', 'takedown', 'infringement', 
        'unauthorized', 'illegal', 'stolen', 'pirated'
    ]
    
    def __init__(self):
        """Initialize the detector with compiled regex patterns"""
        self.high_risk_compiled = {
            field: [re.compile(pattern, re.IGNORECASE) 
                   for pattern in patterns]
            for field, patterns in self.HIGH_RISK_PATTERNS.items()
        }
        
        self.medium_risk_compiled = {
            field: [re.compile(pattern, re.IGNORECASE) 
                   for pattern in patterns]
            for field, patterns in self.MEDIUM_RISK_PATTERNS.items()
        }
        
        self.trusted_compiled = [
            re.compile(pattern, re.IGNORECASE) 
            for pattern in self.TRUSTED_INDICATORS
        ]
        
        self.suspicious_channel_compiled = [
            re.compile(pattern, re.IGNORECASE) 
            for pattern in self.SUSPICIOUS_CHANNEL_PATTERNS
        ]
    
    def analyze_video(self, title: str, channel_name: str, 
                     description: str = "", view_count: int = 0,
                     duration: int = 0) -> Dict:
        """
        Analyze a video for copyright violation indicators
        
        Returns:
            dict with keys:
                - risk_score (0-100): Overall risk score
                - risk_level (str): 'critical', 'high', 'medium', 'low'
                - should_flag (bool): Whether to auto-flag
                - indicators (list): Specific violations found
                - reason (str): Summary of detection reason
        """
        indicators = []
        risk_score = 0
        
        # Check if channel is trusted
        is_trusted = self._is_trusted_channel(channel_name)
        if is_trusted:
            return {
                'risk_score': 0,
                'risk_level': 'low',
                'should_flag': False,
                'indicators': ['Trusted channel (VEVO/Official)'],
                'reason': 'Trusted official source'
            }
        
        # Check high-risk title patterns
        for pattern in self.high_risk_compiled['title']:
            matches = pattern.findall(title)
            if matches:
                risk_score += 25
                indicators.append(f'High-risk title: "{matches[0]}"')
        
        # Check high-risk channel patterns
        for pattern in self.high_risk_compiled['channel']:
            matches = pattern.findall(channel_name)
            if matches:
                risk_score += 30
                indicators.append(f'High-risk channel: "{matches[0]}"')
        
        # Check high-risk description patterns
        if description:
            for pattern in self.high_risk_compiled['description']:
                matches = pattern.findall(description)
                if matches:
                    risk_score += 20
                    indicators.append(f'High-risk description: "{matches[0]}"')
        
        # Check medium-risk patterns
        for pattern in self.medium_risk_compiled['title']:
            matches = pattern.findall(title)
            if matches:
                risk_score += 10
                indicators.append(f'Medium-risk title: "{matches[0]}"')
        
        for pattern in self.medium_risk_compiled['channel']:
            matches = pattern.findall(channel_name)
            if matches:
                risk_score += 15
                indicators.append(f'Medium-risk channel: "{matches[0]}"')
        
        # Check for suspicious channel naming patterns
        if self._is_suspicious_channel(channel_name):
            risk_score += 15
            indicators.append('Suspicious channel name pattern')
        
        # Duration analysis (very long videos may be full albums)
        if duration > 3600:  # Over 1 hour
            risk_score += 10
            indicators.append(f'Long duration ({duration//60} minutes)')
        
        # Multiple violations = higher risk
        if len(indicators) >= 3:
            risk_score += 20
            indicators.append('Multiple violation indicators')
        
        # Cap risk score at 100
        risk_score = min(risk_score, 100)
        
        # Determine risk level and action
        if risk_score >= 70:
            risk_level = 'critical'
            should_flag = True
            reason = 'Critical: Multiple strong piracy indicators'
        elif risk_score >= 50:
            risk_level = 'high'
            should_flag = True
            reason = 'High risk: Strong piracy indicators'
        elif risk_score >= 30:
            risk_level = 'medium'
            should_flag = False
            reason = 'Medium risk: Some piracy indicators'
        else:
            risk_level = 'low'
            should_flag = False
            reason = 'Low risk: Minimal indicators'
        
        return {
            'risk_score': risk_score,
            'risk_level': risk_level,
            'should_flag': should_flag,
            'indicators': indicators,
            'reason': reason
        }
    
    def _is_trusted_channel(self, channel_name: str) -> bool:
        """Check if channel is a trusted official source"""
        for pattern in self.trusted_compiled:
            if pattern.search(channel_name):
                return True
        return False
    
    def _is_suspicious_channel(self, channel_name: str) -> bool:
        """Check if channel has suspicious naming patterns"""
        for pattern in self.suspicious_channel_compiled:
            if pattern.search(channel_name):
                return True
        return False
    
    def get_recommended_rules(self) -> List[Dict]:
        """
        Get recommended pre-built auto-flag rules for music copyright
        
        Returns:
            List of rule configurations ready to be added to database
        """
        return [
            {
                'name': 'Full Album Uploads',
                'description': 'Auto-detect full album uploads (very high piracy indicator)',
                'conditions': {
                    'title_contains': 'full album'
                },
                'action': 'critical',
                'active': True
            },
            {
                'name': 'Download Links in Description',
                'description': 'Detect videos offering MP3/FLAC downloads',
                'conditions': {
                    'title_contains': 'download'
                },
                'action': 'critical',
                'active': True
            },
            {
                'name': 'Bootleg Concert Recordings',
                'description': 'Unauthorized live concert recordings',
                'conditions': {
                    'title_contains': 'bootleg'
                },
                'action': 'flag',
                'active': True
            },
            {
                'name': 'Pirate Music Channels',
                'description': 'Channels known for uploading unauthorized music',
                'conditions': {
                    'channel_name_contains': 'free music'
                },
                'action': 'critical',
                'active': True
            },
            {
                'name': 'Leaked/Unreleased Content',
                'description': 'Pre-release or leaked music',
                'conditions': {
                    'title_contains': 'leaked'
                },
                'action': 'critical',
                'active': True
            },
            {
                'name': 'Complete Discography',
                'description': 'Full artist discography uploads',
                'conditions': {
                    'title_contains': 'discography'
                },
                'action': 'flag',
                'active': True
            },
            {
                'name': 'High Quality Rips',
                'description': 'Videos advertising HQ audio rips (320kbps, FLAC)',
                'conditions': {
                    'title_contains': '320kbps'
                },
                'action': 'flag',
                'active': True
            },
            {
                'name': 'Unofficial Music Archives',
                'description': 'Channels acting as unauthorized music libraries',
                'conditions': {
                    'channel_name_contains': 'music archive'
                },
                'action': 'high_priority',
                'active': True
            }
        ]


# Global detector instance
detector = MusicDetector()


def analyze_video_for_piracy(title: str, channel_name: str, 
                             description: str = "", view_count: int = 0,
                             duration: int = 0) -> Dict:
    """
    Convenience function to analyze a video
    
    Args:
        title: Video title
        channel_name: Channel name
        description: Video description (optional)
        view_count: Number of views (optional)
        duration: Video duration in seconds (optional)
    
    Returns:
        Analysis results dict with risk_score, risk_level, should_flag, indicators, reason
    """
    return detector.analyze_video(title, channel_name, description, view_count, duration)


def get_smart_rules() -> List[Dict]:
    """Get pre-built smart detection rules"""
    return detector.get_recommended_rules()
