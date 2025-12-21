
from flask import Blueprint, render_template, request, jsonify, abort
# from sqlalchemy.orm import Session
# from typing import Optional
# from database import get_session, NewsStatus
# from models import NewsModel, CategoryModel

from controller import ClientController, ClientControllerCommon

# Tạo Blueprint cho client để chỉ đường dẫn file tĩnh trong dự án
client_bp = Blueprint('client', __name__, 
                     url_prefix='',
                     template_folder='templates')

# Khởi tạo client controller
client_controller = ClientController()
client_controller_common = ClientControllerCommon()

# Trang chủ viết bằng tiếng Việt
@client_bp.route('/')
def index():
    """Trang chủ"""
    return client_controller.index()

@client_bp.route('/category/<category_slug>')
def category(category_slug: str):
    """Trang danh mục"""
    print(f"=== ROUTE CALLED: /category/{category_slug} ===")
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


@client_bp.route('/api/save-news/<int:news_id>', methods=['POST'])
def save_news(news_id: int):
    """API lưu/bỏ lưu tin tức"""
    return client_controller.save_news(news_id)


@client_bp.route('/api/comment/<int:news_id>', methods=['POST'])
def submit_comment(news_id: int):
    """API gửi bình luận"""
    return client_controller.submit_comment(news_id)

@client_bp.route('/contact')
def contact():
    """Trang liên hệ"""
    return client_controller_common.contact()

@client_bp.route('/guide')
def guide():
    """Trang hướng dẫn"""
    return client_controller_common.guide()

@client_bp.route('/introducing')
def introducing():
    """Trang giới thiệu"""
    return client_controller_common.introducing()

@client_bp.route('/security')
def security():
    """Trang chính sách bảo mật"""
    return client_controller_common.security()

@client_bp.route('/term_of_service')
def term_of_service():
    """Trang điều khoản sử dụng"""
    return client_controller_common.term_of_service()

# Trang chủ viết bằng tiếng Anh
@client_bp.route('/en')
def en_index():
    """Trang chủ viết bằng tiếng Anh"""
    return client_controller.en_index()

@client_bp.route('/en/category/<category_slug>')
def en_category(category_slug: str):
    """Trang danh mục"""
    return client_controller.en_category(category_slug)

@client_bp.route('/en/news/<news_slug>')
def en_news_detail(news_slug: str):
    """Trang chi tiết bài viết"""
    return client_controller.en_news_detail(news_slug)

@client_bp.route('/en/search')
def en_search():
    """Tìm kiếm tin tức"""
    return client_controller.en_search()


@client_bp.route('/en/api/latest-news')
def en_api_latest_news():
    """API lấy tin tức mới nhất"""
    return client_controller.en_api_latest_news()

@client_bp.route('/en/api/featured-news')
def en_api_featured_news():
    """API lấy tin nổi bật"""
    return client_controller.en_api_featured_news()

@client_bp.route('/en/api/hot-news')
def en_api_hot_news():
    """API lấy tin nóng"""
    return client_controller.en_api_hot_news()

@client_bp.route('/en/api/categories')
def en_api_categories():
    """API lấy danh sách danh mục"""
    return client_controller.en_api_categories()

@client_bp.route('/en/contact')
def en_contact():
    """Trang liên hệ"""
    return client_controller_common.contact()

@client_bp.route('/en/guide')
def en_guide():
    """Trang hướng dẫn"""
    return client_controller_common.guide()

@client_bp.route('/en/introducing')
def en_introducing():
    """Trang giới thiệu"""
    return client_controller_common.introducing()

@client_bp.route('/en/security')
def en_security():
    """Trang chính sách bảo mật"""
    return client_controller_common.security()

@client_bp.route('/en/term_of_service')
def en_term_of_service():
    """Trang điều khoản sử dụng"""
    return client_controller_common.term_of_service()

@client_bp.route('/en/login', methods=['GET', 'POST'])
def en_user_login():
    """Trang đăng nhập cho user"""
    return client_controller.user_login(site='en')


@client_bp.route('/en/register', methods=['GET', 'POST'])
def en_register():
    """Trang đăng ký cho user"""
    return client_controller.register(site='en')

@client_bp.route('/en/profile')
def en_profile():
    """Trang thông tin cá nhân của user"""
    return client_controller.profile(site='en')