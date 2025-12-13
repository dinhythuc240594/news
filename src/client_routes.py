"""
URL routing cho Client (Trang tin tức công khai)
Sử dụng Flask Blueprint theo chuẩn OOP
"""
from flask import Blueprint, render_template, request, jsonify, abort
from sqlalchemy.orm import Session
from typing import Optional
from database import get_session, NewsStatus
from models import NewsModel, CategoryModel

# Tạo Blueprint cho client để chỉ đường dẫn file tĩnh trong dự án
client_bp = Blueprint('client', __name__, 
                     url_prefix='',
                     template_folder='templates/client')


class ClientController:
    """Quản lý các route của client"""
    
    def __init__(self):

        self.db_session = get_session()
        self.news_model = NewsModel(self.db_session)
        self.category_model = CategoryModel(self.db_session)
    
    def index(self):
        """
        Trang chủ - Hiển thị tin tức mới nhất và nổi bật
        Route: GET /
        """
        featured_news = self.news_model.get_featured(limit=5)
        latest_news = self.news_model.get_published(limit=10)
        hot_news = self.news_model.get_hot(limit=5)
        categories = self.category_model.get_all()

        return render_template('client/index.html',
                             featured_news=featured_news,
                             latest_news=latest_news,
                             hot_news=hot_news,
                             categories=categories)
    
    def category(self, category_slug: str):
        """
        Trang danh mục - Hiển thị tin tức theo danh mục
        Route: GET /category/<category_slug>
        """
        category = self.category_model.get_by_slug(category_slug)
        if not category:
            abort(404)
        
        page = request.args.get('page', 1, type=int)
        per_page = 20
        offset = (page - 1) * per_page
        
        news_list = self.news_model.get_by_category(
            category_id=category.id,
            limit=per_page,
            offset=offset
        )

        categories = self.category_model.get_all()

        return render_template('client/category.html',
                             category=category,
                             news_list=news_list,
                             page=page,
                             categories=categories)
    
    def news_detail(self, news_slug: str):
        """
        Trang chi tiết bài viết
        Route: GET /news/<news_slug>
        """
        news = self.news_model.get_by_slug(news_slug)
        if not news or news.status != NewsStatus.PUBLISHED:
            abort(404)
        
        # Tăng số lượt xem
        self.news_model.increment_view(news.id)
        
        # Lấy bài viết liên quan
        related_news = self.news_model.get_by_category(
            category_id=news.category_id,
            limit=5
        )
        related_news = [n for n in related_news if n.id != news.id][:5]
        
        categories = self.category_model.get_all()
        
        return render_template('client/news_detail.html',
                             news=news,
                             related_news=related_news,
                             categories=categories)
    
    def search(self):
        """
        Tìm kiếm tin tức
        Route: GET /search?q=<keyword>
        """
        keyword = request.args.get('q', '').strip()
        page = request.args.get('page', 1, type=int)
        
        categories = self.category_model.get_all()
        
        if not keyword:
            return render_template('client/search.html',
                                 keyword='',
                                 news_list=[],
                                 page=1,
                                 categories=categories)
        
        per_page = 20
        offset = (page - 1) * per_page
        
        news_list = self.news_model.search(keyword, limit=per_page + offset)
        news_list = news_list[offset:offset + per_page]
        
        return render_template('client/search.html',
                             keyword=keyword,
                             news_list=news_list,
                             page=page,
                             categories=categories)
    
    def api_latest_news(self):
        """
        API lấy tin tức mới nhất (JSON)
        Route: GET /api/latest-news
        """
        limit = request.args.get('limit', 10, type=int)
        offset = request.args.get('offset', 0, type=int)
        
        news_list = self.news_model.get_published(limit=limit, offset=offset)
        
        return jsonify({
            'success': True,
            'data': [self._news_to_dict(news) for news in news_list]
        })
    
    def api_featured_news(self):
        """
        API lấy tin nổi bật (JSON)
        Route: GET /api/featured-news
        """
        limit = request.args.get('limit', 5, type=int)
        news_list = self.news_model.get_featured(limit=limit)
        
        return jsonify({
            'success': True,
            'data': [self._news_to_dict(news) for news in news_list]
        })
    
    def api_hot_news(self):
        """
        API lấy tin nóng (JSON)
        Route: GET /api/hot-news
        """
        limit = request.args.get('limit', 5, type=int)
        news_list = self.news_model.get_hot(limit=limit)
        
        return jsonify({
            'success': True,
            'data': [self._news_to_dict(news) for news in news_list]
        })
    
    def api_categories(self):
        """
        API lấy danh sách danh mục (JSON)
        Route: GET /api/categories
        """
        categories = self.category_model.get_all()
        
        return jsonify({
            'success': True,
            'data': [self._category_to_dict(cat) for cat in categories]
        })
    
    def _news_to_dict(self, news) -> dict:
        """Chuyển đổi News object thành dictionary"""
        return {
            'id': news.id,
            'title': news.title,
            'slug': news.slug,
            'summary': news.summary,
            'thumbnail': news.thumbnail,
            'category': {
                'id': news.category.id,
                'name': news.category.name,
                'slug': news.category.slug
            },
            'view_count': news.view_count,
            'is_featured': news.is_featured,
            'is_hot': news.is_hot,
            'published_at': news.published_at.isoformat() if news.published_at else None,
            'created_at': news.created_at.isoformat()
        }
    
    def _category_to_dict(self, category) -> dict:
        """Chuyển đổi Category object thành dictionary"""
        return {
            'id': category.id,
            'name': category.name,
            'slug': category.slug,
            'icon': category.icon,
            'parent_id': category.parent_id
        }


# Khởi tạo controller
client_controller = ClientController()

# Đăng ký routes
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

