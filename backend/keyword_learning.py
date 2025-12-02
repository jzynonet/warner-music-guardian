"""
AI Learning System
Analyzes existing video matches to suggest new keywords
"""

from typing import List, Dict
from collections import Counter
import re


class KeywordLearning:
    """
    Learns from existing video matches to suggest new keywords
    Analyzes patterns in titles, channels, and matched keywords
    """
    
    def __init__(self, database):
        self.db = database
    
    def extract_patterns_from_title(self, title: str) -> List[str]:
        """
        Extract potential keywords from a video title
        Removes common words, extracts meaningful phrases
        """
        # Common words to ignore
        stop_words = {
            'official', 'video', 'audio', 'music', 'hd', 'hq', 'ft', 'feat',
            'featuring', 'prod', 'by', 'the', 'a', 'an', 'and', 'or', 'but',
            'in', 'on', 'at', 'to', 'for', 'of', 'with', 'from', 'full',
            'lyrics', 'lyric', 'version', 'remix', 'cover'
        }
        
        # Clean and tokenize title
        title_lower = title.lower()
        
        # Remove special characters but keep hyphens and spaces
        title_clean = re.sub(r'[^\w\s\-]', ' ', title_lower)
        
        # Split into words
        words = title_clean.split()
        
        # Extract meaningful words/phrases
        keywords = []
        
        # Single words (longer than 3 chars, not stop words)
        for word in words:
            if len(word) > 3 and word not in stop_words:
                keywords.append(word)
        
        # Two-word phrases
        for i in range(len(words) - 1):
            if words[i] not in stop_words or words[i+1] not in stop_words:
                phrase = f"{words[i]} {words[i+1]}"
                if len(phrase) > 6:
                    keywords.append(phrase)
        
        return keywords
    
    def analyze_flagged_videos(self, artist_id: int = None, min_score: int = 50) -> Dict:
        """
        Analyze videos that were flagged (especially AI-flagged with high scores)
        to understand what patterns indicate piracy
        
        Returns:
            dict with common patterns found in flagged videos
        """
        conn = self.db.get_connection()
        cursor = conn.cursor()
        
        # Query flagged videos with high AI scores
        query = """
            SELECT title, channel_name, matched_keyword, ai_risk_score, ai_reason
            FROM videos
            WHERE status = 'Flagged for Takedown' 
            AND ai_risk_score >= ?
        """
        params = [min_score]
        
        if artist_id:
            query += " AND artist_id = ?"
            params.append(artist_id)
        
        cursor.execute(query, params)
        videos = cursor.fetchall()
        conn.close()
        
        # Extract patterns
        title_patterns = []
        channel_patterns = []
        
        for video in videos:
            title = video['title']
            channel = video['channel_name']
            
            # Extract from titles
            title_patterns.extend(self.extract_patterns_from_title(title))
            
            # Extract from channels
            channel_words = re.findall(r'\w+', channel.lower())
            channel_patterns.extend([w for w in channel_words if len(w) > 3])
        
        # Count frequency
        title_counter = Counter(title_patterns)
        channel_counter = Counter(channel_patterns)
        
        return {
            "total_analyzed": len(videos),
            "common_title_patterns": title_counter.most_common(20),
            "common_channel_patterns": channel_counter.most_common(10)
        }
    
    def suggest_keywords_from_videos(self, artist_id: int = None, limit: int = 20) -> List[Dict]:
        """
        Suggest new keywords based on what videos were found
        
        Returns:
            List of suggested keywords with metadata
        """
        conn = self.db.get_connection()
        cursor = conn.cursor()
        
        # Get all videos for artist
        query = "SELECT title, channel_name, matched_keyword, ai_risk_score FROM videos WHERE 1=1"
        params = []
        
        if artist_id:
            query += " AND artist_id = ?"
            params.append(artist_id)
        
        cursor.execute(query, params)
        videos = cursor.fetchall()
        conn.close()
        
        # Extract all potential keywords
        potential_keywords = []
        
        for video in videos:
            title_keywords = self.extract_patterns_from_title(video['title'])
            
            for kw in title_keywords:
                potential_keywords.append({
                    "keyword": kw,
                    "source_title": video['title'],
                    "ai_risk_score": video['ai_risk_score']
                })
        
        # Count frequency and calculate average risk score
        keyword_data = {}
        for item in potential_keywords:
            kw = item["keyword"]
            if kw not in keyword_data:
                keyword_data[kw] = {
                    "keyword": kw,
                    "count": 0,
                    "total_risk": 0,
                    "examples": []
                }
            
            keyword_data[kw]["count"] += 1
            keyword_data[kw]["total_risk"] += item["ai_risk_score"]
            
            if len(keyword_data[kw]["examples"]) < 2:
                keyword_data[kw]["examples"].append(item["source_title"])
        
        # Calculate average risk and sort
        suggestions = []
        for kw, data in keyword_data.items():
            avg_risk = data["total_risk"] / data["count"] if data["count"] > 0 else 0
            
            suggestions.append({
                "keyword": kw,
                "frequency": data["count"],
                "avg_risk_score": round(avg_risk, 1),
                "examples": data["examples"],
                "reason": f"Found in {data['count']} videos (avg risk: {round(avg_risk, 1)})"
            })
        
        # Sort by frequency and risk
        suggestions.sort(key=lambda x: (x["frequency"], x["avg_risk_score"]), reverse=True)
        
        return suggestions[:limit]
    
    def suggest_artist_variations(self, artist_name: str) -> List[str]:
        """
        Generate variations of artist name for search
        
        Returns:
            List of keyword variations
        """
        variations = []
        
        # Basic variations
        variations.append(artist_name)
        variations.append(f"{artist_name} official")
        variations.append(f"{artist_name} music")
        variations.append(f"{artist_name} songs")
        
        # Piracy patterns
        piracy_patterns = [
            f"{artist_name} full album",
            f"{artist_name} discography",
            f"{artist_name} all songs",
            f"{artist_name} download",
            f"{artist_name} mp3",
            f"{artist_name} free download",
            f"{artist_name} leaked",
            f"{artist_name} unreleased",
            f"{artist_name} bootleg",
            f"{artist_name} concert",
            f"{artist_name} live",
            f"{artist_name} mixtape",
            f"{artist_name} album zip"
        ]
        
        variations.extend(piracy_patterns)
        
        return variations
    
    def get_keyword_performance(self, keyword: str) -> Dict:
        """
        Analyze how well a keyword performs
        
        Returns:
            dict with stats: total_found, flagged_count, avg_risk, channels
        """
        conn = self.db.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'Flagged for Takedown' THEN 1 ELSE 0 END) as flagged,
                AVG(ai_risk_score) as avg_risk,
                GROUP_CONCAT(DISTINCT channel_name) as channels
            FROM videos
            WHERE matched_keyword = ?
        """, (keyword,))
        
        result = cursor.fetchone()
        conn.close()
        
        return {
            "keyword": keyword,
            "total_found": result['total'] or 0,
            "flagged_count": result['flagged'] or 0,
            "avg_risk_score": round(result['avg_risk'] or 0, 1),
            "flag_rate": round((result['flagged'] or 0) / (result['total'] or 1) * 100, 1),
            "channels": result['channels'].split(',')[:5] if result['channels'] else []
        }
    
    def get_all_keywords_performance(self, artist_id: int = None) -> List[Dict]:
        """
        Get performance stats for all keywords
        
        Returns:
            List of keyword performance dicts sorted by effectiveness
        """
        conn = self.db.get_connection()
        cursor = conn.cursor()
        
        # Get unique keywords
        query = "SELECT DISTINCT matched_keyword FROM videos WHERE 1=1"
        params = []
        
        if artist_id:
            query += " AND artist_id = ?"
            params.append(artist_id)
        
        cursor.execute(query, params)
        keywords = [row['matched_keyword'] for row in cursor.fetchall()]
        conn.close()
        
        # Get performance for each
        performances = []
        for kw in keywords:
            perf = self.get_keyword_performance(kw)
            if perf['total_found'] > 0:
                performances.append(perf)
        
        # Sort by flag rate (most effective at finding violations)
        performances.sort(key=lambda x: (x['flag_rate'], x['total_found']), reverse=True)
        
        return performances


# Example usage
if __name__ == "__main__":
    from database_enhanced import Database
    
    db = Database()
    learner = KeywordLearning(db)
    
    print("🤖 AI Learning System Test\n")
    
    # Test artist variations
    print("📝 Artist Variations:")
    variations = learner.suggest_artist_variations("Drake")
    for v in variations[:5]:
        print(f"  - {v}")
    
    print("\n💡 Suggested Keywords from Existing Videos:")
    suggestions = learner.suggest_keywords_from_videos(limit=10)
    for s in suggestions:
        print(f"  - {s['keyword']} (found {s['frequency']}x, risk: {s['avg_risk_score']})")
    
    print("\n📊 Keyword Performance:")
    performances = learner.get_all_keywords_performance()
    for p in performances[:5]:
        print(f"  - {p['keyword']}: {p['total_found']} found, {p['flagged_count']} flagged ({p['flag_rate']}%)")
