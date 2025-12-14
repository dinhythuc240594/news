
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


# API Routes
@admin_bp.route('/api/news')
@controller.editor_required
def api_news_list():
    """API lấy danh sách bài viết"""
    return admin_controller.api_news_list()


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


@admin_bp.route('/api/categories')
@controller.admin_required
def api_categories():
    """API lấy danh sách danh mục"""
    return admin_controller.api_categories()


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