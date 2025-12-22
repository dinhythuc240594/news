
from flask import Blueprint, render_template, request, jsonify, redirect, url_for, flash, session
# from sqlalchemy.orm import Session
# from functools import wraps
# from typing import Optional
# from database import get_session, NewsStatus, UserRole
# from models import NewsModel, CategoryModel, UserModel
import controller
from controller import AdminController

# Tạo Blueprint cho admin để chỉ đường dẫn file tĩnh trong dự án
admin_bp = Blueprint('admin', __name__,
                    url_prefix='/admin',
                    template_folder='templates/admin')


# Khởi tạo admin controller
admin_controller = AdminController()

@admin_bp.route('/login', methods=['GET', 'POST'])
def login():
    """Trang đăng nhập"""
    return admin_controller.login()


@admin_bp.route('/logout')
def logout():
    """Đăng xuất"""
    return admin_controller.logout()


@admin_bp.route('/dashboard')
@controller.admin_required
def dashboard():
    """Dashboard admin"""
    return admin_controller.dashboard()


@admin_bp.route('/editor-dashboard')
@controller.editor_required
def editor_dashboard():
    """Dashboard editor"""
    return admin_controller.editor_dashboard()


@admin_bp.route('/news')
@controller.editor_required
def news_list():
    """Danh sách bài viết"""
    return admin_controller.news_list()


@admin_bp.route('/news/create', methods=['GET', 'POST'])
@controller.editor_required
def news_create():
    """Tạo bài viết mới"""
    return admin_controller.news_create()


@admin_bp.route('/news/<int:news_id>/edit', methods=['GET', 'POST'])
@controller.editor_required
def news_edit(news_id: int):
    """Chỉnh sửa bài viết"""
    return admin_controller.news_edit(news_id)


@admin_bp.route('/news/<int:news_id>/approve', methods=['POST'])
@controller.admin_required
def news_approve(news_id: int):
    """Duyệt bài viết"""
    return admin_controller.news_approve(news_id)


@admin_bp.route('/news/<int:news_id>/reject', methods=['POST'])
@controller.admin_required
def news_reject(news_id: int):
    """Từ chối bài viết"""
    return admin_controller.news_reject(news_id)


@admin_bp.route('/news/<int:news_id>/delete', methods=['POST'])
@controller.editor_required
def news_delete(news_id: int):
    """Xóa bài viết"""
    return admin_controller.news_delete(news_id)


# International News Routes
@admin_bp.route('/international/<int:news_id>/approve', methods=['POST'])
@controller.admin_required
def international_news_approve(news_id: int):
    """Duyệt bài viết quốc tế"""
    return admin_controller.international_news_approve(news_id)


@admin_bp.route('/international/<int:news_id>/reject', methods=['POST'])
@controller.admin_required
def international_news_reject(news_id: int):
    """Từ chối bài viết quốc tế"""
    return admin_controller.international_news_reject(news_id)


# API Routes
@admin_bp.route('/api/news')
@controller.editor_required
def api_news_list():
    """API lấy danh sách bài viết"""
    return admin_controller.api_news_list()


@admin_bp.route('/api/my-articles')
@controller.editor_required
def api_my_articles():
    """API lấy danh sách bài viết của editor hiện tại"""
    return admin_controller.api_my_articles()


@admin_bp.route('/api/editor-notifications')
@controller.editor_required
def api_editor_notifications():
    """API lấy các bài viết được duyệt/từ chối gần đây của editor"""
    return admin_controller.api_editor_notifications()


@admin_bp.route('/api/current-user')
def api_current_user():
    """API lấy thông tin user hiện tại từ session"""
    return admin_controller.api_current_user()


@admin_bp.route('/api/statistics')
@controller.admin_required
def api_statistics():
    """API lấy thống kê dashboard"""
    return admin_controller.api_statistics()


@admin_bp.route('/api/pending-articles')
@controller.admin_required
def api_pending_articles():
    """API lấy danh sách bài viết chờ duyệt"""
    return admin_controller.api_pending_articles()


@admin_bp.route('/api/approved-articles')
@controller.admin_required
def api_approved_articles():
    """API lấy danh sách bài viết đã duyệt"""
    return admin_controller.api_approved_articles()


@admin_bp.route('/api/rejected-articles')
@controller.admin_required
def api_rejected_articles():
    """API lấy danh sách bài viết bị từ chối"""
    return admin_controller.api_rejected_articles()


@admin_bp.route('/api/api-articles')
@controller.admin_required
def api_api_articles():
    """API lấy danh sách bài viết từ API"""
    return admin_controller.api_api_articles()


@admin_bp.route('/api/international-articles')
@controller.admin_required
def api_international_articles():
    """API lấy danh sách bài viết quốc tế"""
    return admin_controller.api_international_articles()


@admin_bp.route('/api/international-pending')
@controller.admin_required
def api_international_pending():
    """API lấy danh sách bài viết quốc tế chờ duyệt"""
    return admin_controller.api_international_pending()


@admin_bp.route('/api/international-drafts')
@controller.admin_required
def api_international_drafts():
    """API lấy danh sách bài viết quốc tế nháp"""
    return admin_controller.api_international_drafts()


@admin_bp.route('/api/fetch-api-news', methods=['POST'])
@controller.admin_required
def api_fetch_api_news():
    """API lấy bài viết mới từ API bên ngoài"""
    return admin_controller.api_fetch_api_news()


@admin_bp.route('/api/save-api-article', methods=['POST'])
@controller.admin_required
def api_save_api_article():
    """API lưu bài viết từ API vào bảng news với trạng thái được chọn"""
    return admin_controller.api_save_api_article()


@admin_bp.route('/api/chart-data')
@controller.admin_required
def api_chart_data():
    """API lấy dữ liệu cho biểu đồ"""
    return admin_controller.api_chart_data()


@admin_bp.route('/api/hot-articles')
@controller.admin_required
def api_hot_articles():
    """API lấy danh sách bài viết hot nhất"""
    return admin_controller.api_hot_articles()


@admin_bp.route('/api/article/<int:article_id>')
@controller.editor_required
def api_article_detail(article_id: int):
    """API lấy chi tiết bài viết theo ID"""
    return admin_controller.api_article_detail(article_id)


@admin_bp.route('/api/international-article/<int:article_id>')
@controller.admin_required
def api_international_article_detail(article_id: int):
    """API lấy chi tiết bài viết quốc tế theo ID"""
    return admin_controller.api_international_article_detail(article_id)


@admin_bp.route('/api/create-article', methods=['POST'])
@controller.editor_required
def api_create_article():
    """API tạo bài viết mới từ editor form"""
    return admin_controller.api_create_article()

@admin_bp.route('/api/edit-article/<int:article_id>', methods=['POST'])
@controller.editor_required
def api_edit_article(article_id: int):
    """API chỉnh sửa bài viết theo ID"""
    return admin_controller.api_edit_article(article_id)

@admin_bp.route('/api/upload-image', methods=['POST'])
@controller.editor_required
def api_upload_image():
    """API upload ảnh cho bài viết"""
    return admin_controller.api_upload_image()


@admin_bp.route('/api/categories')
@controller.admin_required
def api_categories():
    """API lấy danh sách danh mục"""
    return admin_controller.api_categories()


@admin_bp.route('/api/tags')
@controller.editor_required
def api_tags():
    """API lấy danh sách tags để autocomplete"""
    return admin_controller.api_tags()


@admin_bp.route('/api/tags', methods=['POST'])
@controller.admin_required
def api_create_tag():
    """API tạo hashtag mới"""
    return admin_controller.api_create_tag()


@admin_bp.route('/api/tags/<int:tag_id>', methods=['PUT'])
@controller.admin_required
def api_update_tag(tag_id: int):
    """API cập nhật hashtag"""
    return admin_controller.api_update_tag(tag_id)


@admin_bp.route('/api/tags/<int:tag_id>', methods=['DELETE'])
@controller.admin_required
def api_delete_tag(tag_id: int):
    """API xóa hashtag"""
    return admin_controller.api_delete_tag(tag_id)


@admin_bp.route('/api/international-categories')
@controller.admin_required
def api_international_categories():
    """API lấy danh sách danh mục tin quốc tế (categories_international)"""
    return admin_controller.api_international_categories()


@admin_bp.route('/api/external-categories')
@controller.admin_required
def api_external_categories():
    """Proxy API lấy danh sách danh mục từ external API (tránh CORS)"""
    import requests
    from database import Setting, get_session
    
    # Lấy source từ query params
    source = request.args.get('source', '')
    # Lấy token từ query params hoặc header
    api_token = request.args.get('token', '') or request.headers.get('X-API-Token', '')
    
    # Nếu không có token, lấy từ settings
    if not api_token:
        db = get_session()
        try:
            token_setting = db.query(Setting).filter(
                Setting.key == 'api_token'
            ).first()
            api_token = token_setting.value if token_setting else None
        finally:
            db.close()
    
    if not api_token:
        return jsonify({
            'success': False,
            'error': 'API token is required. Vui lòng cài đặt token trong phần Cài đặt'
        }), 400
    
    try:
        # Call external API với Bearer token
        api_url = 'https://news-api.techreview.pro/categories'
        if source:
            api_url += f'?source={source}'
        
        headers = {
            'Authorization': f'Bearer {api_token}'
        }
        
        response = requests.get(api_url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            return jsonify(response.json())
        else:
            return jsonify({
                'success': False,
                'error': f'API error: {response.status_code}'
            }), response.status_code
            
    except requests.exceptions.RequestException as e:
        return jsonify({
            'success': False,
            'error': f'Connection error: {str(e)}'
        }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@admin_bp.route('/api/menu-items')
@controller.admin_required
def api_menu_items():
    """API lấy danh sách menu items"""
    return admin_controller.api_menu_items()


@admin_bp.route('/api/menu-items', methods=['POST'])
@controller.admin_required
def api_create_menu_item():
    """API tạo menu item mới"""
    return admin_controller.api_create_menu_item()


@admin_bp.route('/api/menu-items/<int:menu_id>', methods=['PUT'])
@controller.admin_required
def api_update_menu_item(menu_id: int):
    """API cập nhật menu item"""
    return admin_controller.api_update_menu_item(menu_id)


@admin_bp.route('/api/menu-items/<int:menu_id>', methods=['DELETE'])
@controller.admin_required
def api_delete_menu_item(menu_id: int):
    """API xóa menu item"""
    return admin_controller.api_delete_menu_item(menu_id)


@admin_bp.route('/api/menu-items/init-default', methods=['POST'])
@controller.admin_required
def api_init_default_menu_items():
    """API khởi tạo menu items mặc định"""
    return admin_controller.api_init_default_menu_items()


@admin_bp.route('/api/menu-items/update-order', methods=['POST'])
@controller.admin_required
def api_update_menu_order():
    """API cập nhật thứ tự menu items (drag & drop)"""
    return admin_controller.api_update_menu_order()


# International Menu Items API Routes
@admin_bp.route('/api/international-menu-items')
@controller.admin_required
def api_international_menu_items():
    """API lấy danh sách international menu items"""
    return admin_controller.api_international_menu_items()


@admin_bp.route('/api/international-menu-items', methods=['POST'])
@controller.admin_required
def api_create_international_menu_item():
    """API tạo international menu item mới"""
    return admin_controller.api_create_international_menu_item()


@admin_bp.route('/api/international-menu-items/<int:menu_id>', methods=['PUT'])
@controller.admin_required
def api_update_international_menu_item(menu_id: int):
    """API cập nhật international menu item"""
    return admin_controller.api_update_international_menu_item(menu_id)


@admin_bp.route('/api/international-menu-items/<int:menu_id>', methods=['DELETE'])
@controller.admin_required
def api_delete_international_menu_item(menu_id: int):
    """API xóa international menu item"""
    return admin_controller.api_delete_international_menu_item(menu_id)


@admin_bp.route('/api/international-menu-items/init-default', methods=['POST'])
@controller.admin_required
def api_init_default_international_menu_items():
    """API khởi tạo international menu items mặc định"""
    return admin_controller.api_init_default_international_menu_items()


@admin_bp.route('/api/international-menu-items/update-order', methods=['POST'])
@controller.admin_required
def api_update_international_menu_order():
    """API cập nhật thứ tự international menu items (drag & drop)"""
    return admin_controller.api_update_international_menu_order()

@admin_bp.route('/profile')
@controller.editor_required
def profile():
    print("=== DEBUG profile ===")
    print(f"Session: {session}")
    """Trang thông tin cá nhân của admin/editor"""
    return admin_controller.profile()

# User Management Routes
@admin_bp.route('/api/users')
@controller.admin_required
def api_users_list():
    """API lấy danh sách users"""
    return admin_controller.api_users_list()

@admin_bp.route('/api/users', methods=['POST'])
@controller.admin_required
def api_create_user():
    """API tạo user mới"""
    return admin_controller.api_create_user()

@admin_bp.route('/api/users/<int:user_id>', methods=['GET', 'PUT'])
@controller.admin_required
def api_update_user(user_id: int):
    """API lấy thông tin hoặc cập nhật user"""
    return admin_controller.api_update_user(user_id)

@admin_bp.route('/api/users/<int:user_id>/toggle-status', methods=['POST'])
@controller.admin_required
def api_toggle_user_status(user_id: int):
    """API khóa/mở khóa user"""
    return admin_controller.api_toggle_user_status(user_id)

# Settings Routes
@admin_bp.route('/api/settings')
@controller.admin_required
def api_get_settings():
    """API lấy settings"""
    return admin_controller.api_get_settings()

@admin_bp.route('/api/settings', methods=['POST'])
@controller.admin_required
def api_update_settings():
    """API cập nhật settings"""
    return admin_controller.api_update_settings()

@admin_bp.route('/api/test-email', methods=['POST'])
@controller.admin_required
def api_test_email():
    """API test gửi email"""
    return admin_controller.api_test_email()