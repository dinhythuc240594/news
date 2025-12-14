
from flask import Blueprint, render_template, request, jsonify, abort
# from sqlalchemy.orm import Session
# from typing import Optional
# from database import get_session, NewsStatus
# from models import NewsModel, CategoryModel

from controller import ClientController

# Tạo Blueprint cho client để chỉ đường dẫn file tĩnh trong dự án
client_bp = Blueprint('client', __name__, 
                     url_prefix='',
                     template_folder='templates/client')

# Khởi tạo client controller
client_controller = ClientController()

@client_bp.route('/')
def index():
    """Trang chủ"""
    return client_controller.index()


@client_bp.route('/category/<category_slug>')
def category(category_slug: str):
    """Trang danh mục"""
    return client_controller.category(category_slug)


@client_bp.route('/news/<news_slug>')
def news_detail(news_slug: str):
    """Trang chi tiết bài viết"""
    return client_controller.news_detail(news_slug)


@client_bp.route('/search')
def search():
    """Tìm kiếm tin tức"""
    return client_controller.search()


# API Routes
@client_bp.route('/api/latest-news')
def api_latest_news():
    """API lấy tin tức mới nhất"""
    return client_controller.api_latest_news()


@client_bp.route('/api/featured-news')
def api_featured_news():
    """API lấy tin nổi bật"""
    return client_controller.api_featured_news()


@client_bp.route('/api/hot-news')
def api_hot_news():
    """API lấy tin nóng"""
    return client_controller.api_hot_news()


@client_bp.route('/api/categories')
def api_categories():
    """API lấy danh sách danh mục"""
    return client_controller.api_categories()


@client_bp.route('/login', methods=['GET', 'POST'])
def user_login():
    """Trang đăng nhập cho user"""
    return client_controller.user_login()


@client_bp.route('/register', methods=['GET', 'POST'])
def register():
    """Trang đăng ký cho user"""
    return client_controller.register()


@client_bp.route('/logout')
def user_logout():
    """Đăng xuất user"""
    return client_controller.user_logout()


@client_bp.route('/profile')
def profile():
    """Trang thông tin cá nhân của user"""
    return client_controller.profile()


@client_bp.route('/profile/update', methods=['POST'])
def update_profile():
    """Cập nhật thông tin cá nhân, avatar, hoặc đổi mật khẩu"""
    return client_controller.update_profile()