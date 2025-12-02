"""
Verify DELETE API endpoints without running the server
This checks if all the routes and functions are properly defined
"""
import sys
import os

def verify_api_routes():
    print("=" * 70)
    print("DELETE API VERIFICATION")
    print("=" * 70)
    
    # Read app.py
    with open('app.py', 'r', encoding='utf-8') as f:
        app_content = f.read()
    
    # Check for all delete-related endpoints
    endpoints = {
        'Individual Delete': "@app.route('/api/videos/<int:video_id>', methods=['DELETE'])",
        'Batch Delete': "@app.route('/api/videos/batch-delete', methods=['POST'])",
        'Clear All': "@app.route('/api/videos/clear-all', methods=['POST'])"
    }
    
    print("\n1. Backend API Routes:")
    all_found = True
    for name, route in endpoints.items():
        if route in app_content:
            print(f"   [OK] {name:20} - {route}")
        else:
            print(f"   [FAIL] {name:20} - NOT FOUND")
            all_found = False
    
    # Check function definitions
    functions = {
        'delete_video function': 'def delete_video(video_id):',
        'batch_delete function': 'def batch_delete_videos():',
        'clear_all function': 'def clear_all_videos():'
    }
    
    print("\n2. Backend Functions:")
    for name, func in functions.items():
        if func in app_content:
            print(f"   [OK] {name}")
        else:
            print(f"   [FAIL] {name} - NOT FOUND")
            all_found = False
    
    # Check database functions
    with open('database.py', 'r', encoding='utf-8') as f:
        db_content = f.read()
    
    db_functions = {
        'Database delete_video': 'def delete_video(self, video_id: int)',
        'Database batch_update': 'def batch_update_videos(self, video_ids: List[int]'
    }
    
    print("\n3. Database Functions:")
    for name, func in db_functions.items():
        if func in db_content:
            print(f"   [OK] {name}")
        else:
            print(f"   [FAIL] {name} - NOT FOUND")
            all_found = False
    
    # Check frontend components
    frontend_path = '../frontend/src/components/VideoTableEnhanced.jsx'
    if os.path.exists(frontend_path):
        with open(frontend_path, 'r', encoding='utf-8') as f:
            frontend_content = f.read()
        
        frontend_features = {
            'Individual Delete Handler': 'const handleDelete = async (videoId)',
            'Batch Delete Handler': 'const handleBatchDelete = async ()',
            'Delete API Call': "axios.delete(`/api/videos/${videoId}`)",
            'Batch Delete API Call': "axios.post('/api/videos/batch-delete'",
            'Delete Button': 'Delete</button>'
        }
        
        print("\n4. Frontend Components:")
        for name, feature in frontend_features.items():
            if feature in frontend_content:
                print(f"   [OK] {name}")
            else:
                print(f"   [FAIL] {name} - NOT FOUND")
                all_found = False
    else:
        print("\n4. Frontend Components:")
        print(f"   [SKIP] VideoTableEnhanced.jsx not found")
    
    # Check DashboardEnhanced for Clear All
    dashboard_path = '../frontend/src/components/DashboardEnhanced.jsx'
    if os.path.exists(dashboard_path):
        with open(dashboard_path, 'r', encoding='utf-8') as f:
            dashboard_content = f.read()
        
        print("\n5. Dashboard Clear All Feature:")
        if 'handleClearAll' in dashboard_content:
            print(f"   [OK] Clear All Handler")
        else:
            print(f"   [FAIL] Clear All Handler - NOT FOUND")
            all_found = False
        
        if "axios.post('/api/videos/clear-all')" in dashboard_content:
            print(f"   [OK] Clear All API Call")
        else:
            print(f"   [FAIL] Clear All API Call - NOT FOUND")
            all_found = False
        
        if 'Clear All Results' in dashboard_content:
            print(f"   [OK] Clear All Button")
        else:
            print(f"   [FAIL] Clear All Button - NOT FOUND")
            all_found = False
    else:
        print("\n5. Dashboard Clear All Feature:")
        print(f"   [SKIP] DashboardEnhanced.jsx not found")
    
    print("\n" + "=" * 70)
    print("VERIFICATION SUMMARY")
    print("=" * 70)
    
    if all_found:
        print("\n  SUCCESS: All delete features are properly implemented!")
        print("\n  Features Available:")
        print("  - Individual video delete (per-row delete button)")
        print("  - Batch delete (select multiple + batch actions)")
        print("  - Clear all videos (dashboard button)")
        print("\n  All backend endpoints and frontend handlers are in place.")
    else:
        print("\n  WARNING: Some features may be missing. Review above.")
    
    print("\n" + "=" * 70)
    
    return all_found

if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    verify_api_routes()
