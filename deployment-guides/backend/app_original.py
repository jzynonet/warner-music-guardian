from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from dotenv import load_dotenv
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
import os
import csv
import io
from openpyxl import Workbook

from database import Database
from youtube_service import YouTubeService
from models import Video

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', 'dev-secret-key')
CORS(app)

# Initialize database
db = Database(os.getenv('DATABASE_PATH', 'videos.db'))

# Initialize YouTube service
try:
    youtube_service = YouTubeService(os.getenv('YOUTUBE_API_KEY', ''))
    API_CONFIGURED = True
except ValueError as e:
    youtube_service = None
    API_CONFIGURED = False
    print(f"WARNING: {str(e)}")

# Admin password
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'admin123')

# Debug: Print loaded password on startup
print("=" * 50)
print(f"ADMIN PASSWORD LOADED: '{ADMIN_PASSWORD}'")
print("=" * 50)

# Scheduler for automatic searches
scheduler = BackgroundScheduler()
scheduler.start()

# Auth middleware
def check_auth(password):
    return password == ADMIN_PASSWORD

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok',
        'api_configured': API_CONFIGURED,
        'database_ok': os.path.exists(db.db_path)
    })

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    password = data.get('password', '')
    
    # Debug logging
    print(f"Login attempt - Received password: '{password}'")
    print(f"Expected password: '{ADMIN_PASSWORD}'")
    print(f"Passwords match: {password == ADMIN_PASSWORD}")
    
    if check_auth(password):
        return jsonify({'success': True, 'message': 'Authentication successful'})
    else:
        return jsonify({'success': False, 'message': 'Invalid password'}), 401

# Keywords endpoints
@app.route('/api/keywords', methods=['GET'])
def get_keywords():
    keywords = db.get_all_keywords()
    return jsonify([k.to_dict() for k in keywords])

@app.route('/api/keywords', methods=['POST'])
def add_keyword():
    data = request.json
    keyword = data.get('keyword', '').strip()
    
    if not keyword:
        return jsonify({'error': 'Keyword is required'}), 400
    
    keyword_id = db.add_keyword(keyword)
    
    if keyword_id:
        return jsonify({'success': True, 'id': keyword_id, 'message': 'Keyword added'})
    else:
        return jsonify({'error': 'Keyword already exists'}), 400

@app.route('/api/keywords/<int:keyword_id>', methods=['PUT'])
def update_keyword(keyword_id):
    data = request.json
    active = data.get('active', True)
    
    success = db.update_keyword(keyword_id, active)
    
    if success:
        return jsonify({'success': True, 'message': 'Keyword updated'})
    else:
        return jsonify({'error': 'Keyword not found'}), 404

@app.route('/api/keywords/<int:keyword_id>', methods=['DELETE'])
def delete_keyword(keyword_id):
    success = db.delete_keyword(keyword_id)
    
    if success:
        return jsonify({'success': True, 'message': 'Keyword deleted'})
    else:
        return jsonify({'error': 'Keyword not found'}), 404

# Search endpoint
@app.route('/api/search', methods=['POST'])
def run_search():
    if not API_CONFIGURED or not youtube_service:
        return jsonify({'error': 'YouTube API is not configured'}), 500
    
    data = request.json
    keywords = data.get('keywords', [])
    
    if not keywords:
        # Use all active keywords
        keywords = db.get_active_keywords()
    
    if not keywords:
        return jsonify({'error': 'No keywords to search'}), 400
    
    results = {
        'total_found': 0,
        'total_new': 0,
        'keywords': []
    }
    
    for keyword in keywords:
        try:
            videos = youtube_service.search_videos(keyword)
            new_count = 0
            
            for video in videos:
                video_id = db.add_video(video)
                if video_id:
                    new_count += 1
            
            results['total_found'] += len(videos)
            results['total_new'] += new_count
            results['keywords'].append({
                'keyword': keyword,
                'found': len(videos),
                'new': new_count
            })
            
            db.add_search_log(keyword, len(videos), True)
            
        except Exception as e:
            error_msg = str(e)
            results['keywords'].append({
                'keyword': keyword,
                'error': error_msg
            })
            db.add_search_log(keyword, 0, False, error_msg)
    
    return jsonify(results)

# Videos endpoints
@app.route('/api/videos', methods=['GET'])
def get_videos():
    filters = {}
    
    if request.args.get('keyword'):
        filters['keyword'] = request.args.get('keyword')
    if request.args.get('status'):
        filters['status'] = request.args.get('status')
    if request.args.get('date_from'):
        filters['date_from'] = request.args.get('date_from')
    if request.args.get('date_to'):
        filters['date_to'] = request.args.get('date_to')
    
    videos = db.get_all_videos(filters)
    return jsonify([v.to_dict() for v in videos])

@app.route('/api/videos/<int:video_id>', methods=['PUT'])
def update_video(video_id):
    data = request.json
    status = data.get('status')
    
    if status not in ['Pending', 'Reviewed', 'Flagged for Takedown']:
        return jsonify({'error': 'Invalid status'}), 400
    
    success = db.update_video_status(video_id, status)
    
    if success:
        return jsonify({'success': True, 'message': 'Video status updated'})
    else:
        return jsonify({'error': 'Video not found'}), 404

@app.route('/api/videos/<int:video_id>', methods=['DELETE'])
def delete_video(video_id):
    success = db.delete_video(video_id)
    
    if success:
        return jsonify({'success': True, 'message': 'Video deleted'})
    else:
        return jsonify({'error': 'Video not found'}), 404

# Statistics endpoint
@app.route('/api/stats', methods=['GET'])
def get_stats():
    stats = db.get_stats()
    return jsonify(stats)

# Search logs endpoint
@app.route('/api/logs', methods=['GET'])
def get_logs():
    limit = request.args.get('limit', 50, type=int)
    logs = db.get_search_logs(limit)
    return jsonify([log.to_dict() for log in logs])

# Export endpoints
@app.route('/api/export/csv', methods=['GET'])
def export_csv():
    filters = {}
    if request.args.get('keyword'):
        filters['keyword'] = request.args.get('keyword')
    if request.args.get('status'):
        filters['status'] = request.args.get('status')
    
    videos = db.get_all_videos(filters)
    
    # Create CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow(['ID', 'Video ID', 'Title', 'Channel Name', 'Channel ID', 
                     'Publish Date', 'Video URL', 'Matched Keyword', 'Status', 'Created At'])
    
    # Write data
    for video in videos:
        writer.writerow([
            video.id, video.video_id, video.title, video.channel_name,
            video.channel_id, video.publish_date, video.video_url,
            video.matched_keyword, video.status, video.created_at
        ])
    
    output.seek(0)
    
    return send_file(
        io.BytesIO(output.getvalue().encode('utf-8')),
        mimetype='text/csv',
        as_attachment=True,
        download_name=f'ugc_videos_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
    )

@app.route('/api/export/excel', methods=['GET'])
def export_excel():
    filters = {}
    if request.args.get('keyword'):
        filters['keyword'] = request.args.get('keyword')
    if request.args.get('status'):
        filters['status'] = request.args.get('status')
    
    videos = db.get_all_videos(filters)
    
    # Create Excel workbook
    wb = Workbook()
    ws = wb.active
    ws.title = "UGC Videos"
    
    # Write header
    headers = ['ID', 'Video ID', 'Title', 'Channel Name', 'Channel ID', 
               'Publish Date', 'Video URL', 'Matched Keyword', 'Status', 'Created At']
    ws.append(headers)
    
    # Write data
    for video in videos:
        ws.append([
            video.id, video.video_id, video.title, video.channel_name,
            video.channel_id, video.publish_date, video.video_url,
            video.matched_keyword, video.status, video.created_at
        ])
    
    # Save to BytesIO
    output = io.BytesIO()
    wb.save(output)
    output.seek(0)
    
    return send_file(
        output,
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        as_attachment=True,
        download_name=f'ugc_videos_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx'
    )

# Scheduler endpoint
@app.route('/api/schedule', methods=['POST'])
def setup_schedule():
    data = request.json
    enabled = data.get('enabled', False)
    interval_hours = data.get('interval_hours', 24)
    
    if enabled:
        # Remove existing jobs
        for job in scheduler.get_jobs():
            job.remove()
        
        # Add new job
        def scheduled_search():
            with app.app_context():
                keywords = db.get_active_keywords()
                for keyword in keywords:
                    try:
                        videos = youtube_service.search_videos(keyword)
                        for video in videos:
                            db.add_video(video)
                        db.add_search_log(keyword, len(videos), True)
                    except Exception as e:
                        db.add_search_log(keyword, 0, False, str(e))
        
        scheduler.add_job(
            scheduled_search,
            'interval',
            hours=interval_hours,
            id='auto_search'
        )
        
        return jsonify({'success': True, 'message': f'Automatic search scheduled every {interval_hours} hours'})
    else:
        # Remove all jobs
        for job in scheduler.get_jobs():
            job.remove()
        return jsonify({'success': True, 'message': 'Automatic search disabled'})

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
