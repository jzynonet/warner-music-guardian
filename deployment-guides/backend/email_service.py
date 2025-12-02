import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional
from datetime import datetime
import os

class EmailService:
    """Email notification service for UGC monitoring"""
    
    def __init__(self):
        self.smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', '587'))
        self.smtp_username = os.getenv('SMTP_USERNAME', '')
        self.smtp_password = os.getenv('SMTP_PASSWORD', '')
        self.from_email = os.getenv('FROM_EMAIL', self.smtp_username)
        self.enabled = self.smtp_username and self.smtp_password
    
    def send_email(self, to_email: str, subject: str, body: str, html: bool = False) -> bool:
        """Send an email"""
        if not self.enabled:
            print("Email service not configured")
            return False
        
        try:
            msg = MIMEMultipart('alternative')
            msg['From'] = self.from_email
            msg['To'] = to_email
            msg['Subject'] = subject
            
            if html:
                msg.attach(MIMEText(body, 'html'))
            else:
                msg.attach(MIMEText(body, 'plain'))
            
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.smtp_username, self.smtp_password)
            server.send_message(msg)
            server.quit()
            
            return True
        except Exception as e:
            print(f"Email send failed: {str(e)}")
            return False
    
    def send_new_findings_alert(self, to_email: str, videos: List[dict], artist_name: str = None) -> bool:
        """Send alert for new findings"""
        subject = f"New UGC Findings Alert{f' - {artist_name}' if artist_name else ''}"
        
        body = f"""
New videos have been found matching your keywords:

Total new videos: {len(videos)}

"""
        
        for video in videos[:10]:  # Include first 10
            body += f"""
Title: {video['title']}
Channel: {video['channel_name']}
Keyword: {video['matched_keyword']}
Priority: {video.get('priority', 'Medium')}
URL: {video['video_url']}
{'⚠️ AUTO-FLAGGED' if video.get('auto_flagged') else ''}

---
"""
        
        if len(videos) > 10:
            body += f"\n... and {len(videos) - 10} more videos.\n"
        
        body += "\n\nLogin to the UGC Monitor to review all findings."
        
        return self.send_email(to_email, subject, body)
    
    def send_weekly_report(self, to_email: str, stats: dict, artist_name: str = None) -> bool:
        """Send weekly summary report"""
        subject = f"Weekly UGC Report{f' - {artist_name}' if artist_name else ''}"
        
        body = f"""
Weekly UGC Monitoring Report
Period: Last 7 days

SUMMARY:
- Total videos found: {stats.get('total_videos', 0)}
- Pending review: {stats.get('pending', 0)}
- Reviewed: {stats.get('reviewed', 0)}
- Flagged for takedown: {stats.get('flagged', 0)}

PRIORITY BREAKDOWN:
- Critical: {stats.get('priority_critical', 0)}
- High: {stats.get('priority_high', 0)}
- Medium: {stats.get('priority_medium', 0)}
- Low: {stats.get('priority_low', 0)}

Auto-flagged videos: {stats.get('auto_flagged', 0)}

---
Login to the UGC Monitor for detailed information.
"""
        
        return self.send_email(to_email, subject, body)
    
    def send_critical_alert(self, to_email: str, video: dict, reason: str) -> bool:
        """Send immediate alert for critical findings"""
        subject = f"⚠️ CRITICAL UGC ALERT - Immediate Review Required"
        
        body = f"""
CRITICAL FINDING DETECTED

A video has been automatically flagged as critical priority.

Reason: {reason}

VIDEO DETAILS:
Title: {video['title']}
Channel: {video['channel_name']}
Matched Keyword: {video['matched_keyword']}
Published: {video['publish_date']}
URL: {video['video_url']}

This video requires immediate review and possible takedown action.

Login to the UGC Monitor now: [YOUR_APP_URL]
"""
        
        return self.send_email(to_email, subject, body)
    
    def generate_html_report(self, videos: List[dict], stats: dict) -> str:
        """Generate HTML email report"""
        html = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; }}
        .header {{ background-color: #3b82f6; color: white; padding: 20px; }}
        .stats {{ display: flex; gap: 20px; margin: 20px 0; }}
        .stat-box {{ padding: 15px; background-color: #f3f4f6; border-radius: 5px; }}
        .video {{ border: 1px solid #e5e7eb; padding: 15px; margin: 10px 0; border-radius: 5px; }}
        .priority-high {{ border-left: 4px solid #ef4444; }}
        .priority-critical {{ border-left: 4px solid #991b1b; background-color: #fee2e2; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>UGC Monitoring Report</h1>
        <p>Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
    </div>
    
    <div class="stats">
        <div class="stat-box">
            <h3>{stats.get('total_videos', 0)}</h3>
            <p>Total Videos</p>
        </div>
        <div class="stat-box">
            <h3>{stats.get('pending', 0)}</h3>
            <p>Pending</p>
        </div>
        <div class="stat-box">
            <h3>{stats.get('flagged', 0)}</h3>
            <p>Flagged</p>
        </div>
        <div class="stat-box">
            <h3>{stats.get('priority_critical', 0)}</h3>
            <p>Critical Priority</p>
        </div>
    </div>
    
    <h2>Recent Findings</h2>
"""
        
        for video in videos[:20]:
            priority_class = f"priority-{video.get('priority', 'medium').lower()}" if video.get('priority') in ['High', 'Critical'] else ''
            html += f"""
    <div class="video {priority_class}">
        <h3>{video['title']}</h3>
        <p><strong>Channel:</strong> {video['channel_name']}</p>
        <p><strong>Keyword:</strong> {video['matched_keyword']}</p>
        <p><strong>Priority:</strong> {video.get('priority', 'Medium')}</p>
        <p><a href="{video['video_url']}" target="_blank">View on YouTube</a></p>
    </div>
"""
        
        html += """
</body>
</html>
"""
        return html
