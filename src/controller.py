from flask import Blueprint, render_template, request, jsonify, abort, redirect, url_for, flash, session, current_app
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from typing import Optional
from functools import wraps
import os
from datetime import datetime
from werkzeug.utils import secure_filename
from database import (
    get_session,
    NewsStatus,
    UserRole,
    SavedNews,
    ViewedNews,
    Comment,
    News,
    Category,
    NewsInternational,
    CategoryInternational,
    Tag,
    NewsTag,
)
from models import (
    NewsModel,
    CategoryModel,
    UserModel,
    InternationalNewsModel,
    InternationalCategoryModel,
)

def admin_required(f):
    """Decorator yêu cầu quyền admin"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('admin.login'))
        
        user_model = UserModel(get_session())
        user = user_model.get_by_id(session['user_id'])
        
        if not user or user.role != UserRole.ADMIN:
            flash('Bạn không có quyền truy cập', 'error')
            return redirect(url_for('admin.login'))
        
        return f(*args, **kwargs)
    return decorated_function


def editor_required(f):
    """Decorator yêu cầu quyền editor hoặc admin"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('admin.login'))
        
        user_model = UserModel(get_session())
        user = user_model.get_by_id(session['user_id'])
        
        if not user or user.role not in [UserRole.ADMIN, UserRole.EDITOR]:
            flash('Bạn không có quyền truy cập', 'error')
            return redirect(url_for('admin.login'))
        
        return f(*args, **kwargs)
    return decorated_function


class AdminController:
    """Controller class quản lý các route của admin"""
    
    def __init__(self):
        """Khởi tạo controller"""
        self.db_session = get_session()
        self.news_model = NewsModel(self.db_session)
        self.category_model = CategoryModel(self.db_session)
        self.user_model = UserModel(self.db_session)
        # Model cho tin tức quốc tế
        self.int_news_model = InternationalNewsModel(self.db_session)
        self.int_category_model = InternationalCategoryModel(self.db_session)
    
    def login(self):
        """
        Trang đăng nhập admin
        Route: GET /admin/login
        Route: POST /admin/login
        """
        # Nếu đã đăng nhập, redirect đến dashboard tương ứng
        if 'user_id' in session and 'role' in session:
            if session['role'] == UserRole.ADMIN.value:
                return redirect(url_for('admin.dashboard'))
            elif session['role'] == UserRole.EDITOR.value:
                return redirect(url_for('admin.editor_dashboard'))
        
        if request.method == 'POST':
            username = request.form.get('username')
            password = request.form.get('password')
            remember = request.form.get('remember') == 'on'
            
            user = self.user_model.authenticate(username, password)
            
            if user and user.is_active and user.role in [UserRole.ADMIN, UserRole.EDITOR]:
                # Lưu session đăng nhập
                session['user_id'] = user.id
                session['username'] = user.username
                session['role'] = user.role.value
                
                # Nếu chọn "Ghi nhớ đăng nhập", set session permanent
                if remember:
                    session.permanent = True
                else:
                    session.permanent = False
                
                flash('Đăng nhập thành công', 'success')
                
                # Kiểm tra role và redirect đến đúng dashboard
                if user.role == UserRole.ADMIN:
                    return redirect(url_for('admin.dashboard'))
                else:
                    return redirect(url_for('admin.editor_dashboard'))
            else:
                flash('Tên đăng nhập hoặc mật khẩu không đúng', 'error')
        
        return render_template('admin/login.html')
    
    def logout(self):
        """Đăng xuất - Xóa session đăng nhập"""
        # Xóa toàn bộ session
        session.clear()
        flash('Đã đăng xuất', 'success')
        return redirect(url_for('admin.login'))
    
    def dashboard(self):
        """
        Dashboard admin - Thống kê và quản lý
        Route: GET /admin/dashboard
        """
        # Thống kê
        total_news = len(self.news_model.get_all())
        published_news = len(self.news_model.get_all(status=NewsStatus.PUBLISHED))
        pending_news = len(self.news_model.get_all(status=NewsStatus.PENDING))
        draft_news = len(self.news_model.get_all(status=NewsStatus.DRAFT))
        
        # Bài viết chờ duyệt
        pending_list = self.news_model.get_all(status=NewsStatus.PENDING, limit=10)
        
        # Bài viết mới nhất
        latest_news = self.news_model.get_all(limit=10)
        
        user = self.user_model.get_by_id(session['user_id'])

        return render_template('admin/admin.html',
                             total_news=total_news,
                             published_news=published_news,
                             pending_news=pending_news,
                             draft_news=draft_news,
                             pending_list=pending_list,
                             latest_news=latest_news,
                             user=user)
    
    def editor_dashboard(self):
        """
        Dashboard editor - Quản lý bài viết của biên tập viên
        Route: GET /admin/editor-dashboard
        """
        user_id = session.get('user_id')
        
        # Lấy bài viết của editor (chỉ dùng để thống kê nhanh)
        all_news = self.news_model.get_all()
        my_news = [n for n in all_news if n.created_by == user_id]
        
        draft_news = [n for n in my_news if n.status == NewsStatus.DRAFT]
        pending_news = [n for n in my_news if n.status == NewsStatus.PENDING]
        published_news = [n for n in my_news if n.status == NewsStatus.PUBLISHED]
        categories = self.category_model.get_all()
        
        user = self.user_model.get_by_id(user_id)

        return render_template('editor/editor.html',
                             draft_news=draft_news,
                             pending_news=pending_news,
                             published_news=published_news,
                             categories=categories,
                             stat_total=len(my_news),
                             stat_draft=len(draft_news),
                             stat_pending=len(pending_news),
                             stat_published=len(published_news),
                             user=user)
    
    def news_list(self):
        """
        Danh sách bài viết
        Route: GET /admin/news
        """
        status_filter = request.args.get('status', None)
        page = request.args.get('page', 1, type=int)
        per_page = 20
        offset = (page - 1) * per_page
        
        status = None
        if status_filter:
            try:
                status = NewsStatus(status_filter)
            except ValueError:
                status = None
        
        news_list = self.news_model.get_all(
            limit=per_page,
            offset=offset,
            status=status
        )
        
        categories = self.category_model.get_all()
        
        return render_template('admin/news_list.html',
                             news_list=news_list,
                             categories=categories,
                             current_status=status_filter,
                             page=page)
    
    def news_create(self):
        """
        Tạo bài viết mới
        Route: GET /admin/news/create
        Route: POST /admin/news/create
        """
        if request.method == 'POST':
            title = request.form.get('title')
            content = request.form.get('content')
            category_id = request.form.get('category_id', type=int)
            summary = request.form.get('summary')
            thumbnail = request.form.get('thumbnail')
            status = request.form.get('status', NewsStatus.DRAFT.value)
            
            user_id = session.get('user_id')
            
            try:
                news_status = NewsStatus(status)
            except ValueError:
                news_status = NewsStatus.DRAFT
            
            news = self.news_model.create(
                title=title,
                content=content,
                category_id=category_id,
                created_by=user_id,
                summary=summary,
                thumbnail=thumbnail,
                status=news_status
            )
            
            flash('Tạo bài viết thành công', 'success')
            return redirect(url_for('admin.news_edit', news_id=news.id))
        
        categories = self.category_model.get_all()
        return render_template('admin/news_create.html', categories=categories)
    
    def news_edit(self, news_id: int):
        """
        Chỉnh sửa bài viết
        Route: GET /admin/news/<news_id>/edit
        Route: POST /admin/news/<news_id>/edit
        """
        news = self.news_model.get_by_id(news_id)
        if not news:
            flash('Không tìm thấy bài viết', 'error')
            return redirect(url_for('admin.news_list'))
        
        # Kiểm tra quyền
        user_id = session.get('user_id')
        user = self.user_model.get_by_id(user_id)
        
        if user.role != UserRole.ADMIN and news.created_by != user_id:
            flash('Bạn không có quyền chỉnh sửa bài viết này', 'error')
            return redirect(url_for('admin.news_list'))
        
        if request.method == 'POST':
            title = request.form.get('title')
            content = request.form.get('content')
            category_id = request.form.get('category_id', type=int)
            summary = request.form.get('summary')
            thumbnail = request.form.get('thumbnail')
            status = request.form.get('status')
            
            try:
                news_status = NewsStatus(status) if status else news.status
            except ValueError:
                news_status = news.status
            
            self.news_model.update(
                news_id,
                title=title,
                content=content,
                category_id=category_id,
                summary=summary,
                thumbnail=thumbnail,
                status=news_status
            )
            
            flash('Cập nhật bài viết thành công', 'success')
            return redirect(url_for('admin.news_edit', news_id=news_id))
        
        categories = self.category_model.get_all()
        return render_template('admin/news_edit.html',
                             news=news,
                             categories=categories)
    
    def news_approve(self, news_id: int):
        """
        Duyệt bài viết
        Route: POST /admin/news/<news_id>/approve
        """
        user_id = session.get('user_id')
        news = self.news_model.approve(news_id, user_id)
        
        if request.is_json or request.headers.get('Content-Type') == 'application/json':
            if news:
                return jsonify({'success': True, 'message': 'Đã duyệt bài viết'})
            else:
                return jsonify({'success': False, 'error': 'Không tìm thấy bài viết'}), 404
        
        if news:
            flash('Đã duyệt bài viết', 'success')
        else:
            flash('Không tìm thấy bài viết', 'error')
        
        return redirect(request.referrer or url_for('admin.dashboard'))
    
    def news_reject(self, news_id: int):
        """
        Từ chối bài viết
        Route: POST /admin/news/<news_id>/reject
        """
        user_id = session.get('user_id')
        reason = request.headers.get('X-Reason') or request.json.get('reason') if request.is_json else None
        news = self.news_model.reject(news_id, user_id)
        
        if request.is_json or request.headers.get('Content-Type') == 'application/json':
            if news:
                return jsonify({'success': True, 'message': 'Đã từ chối bài viết', 'reason': reason})
            else:
                return jsonify({'success': False, 'error': 'Không tìm thấy bài viết'}), 404
        
        if news:
            flash('Đã từ chối bài viết', 'success')
        else:
            flash('Không tìm thấy bài viết', 'error')
        
        return redirect(request.referrer or url_for('admin.dashboard'))
    
    def news_delete(self, news_id: int):
        """
        Xóa bài viết
        Route: POST /admin/news/<news_id>/delete
        """
        success = self.news_model.delete(news_id)
        
        if success:
            flash('Đã xóa bài viết', 'success')
        else:
            flash('Không tìm thấy bài viết', 'error')
        
        return redirect(url_for('admin.news_list'))
    
    def api_news_list(self):
        """
        API lấy danh sách bài viết (JSON)
        Route: GET /admin/api/news
        """
        status_filter = request.args.get('status', None)
        limit = request.args.get('limit', 20, type=int)
        offset = request.args.get('offset', 0, type=int)
        
        status = None
        if status_filter:
            try:
                status = NewsStatus(status_filter)
            except ValueError:
                pass
        
        news_list = self.news_model.get_all(limit=limit, offset=offset, status=status)
        
        return jsonify({
            'success': True,
            'data': [self._news_to_dict(news) for news in news_list]
        })

    def api_my_articles(self):
        """
        API lấy danh sách bài viết của editor hiện tại (JSON)
        Route: GET /admin/api/my-articles
        Query params:
            status: draft|pending|published|rejected|all (mặc định: all)
            page: trang hiện tại (mặc định: 1)
            per_page: số bài mỗi trang (mặc định: 10)
            search: từ khóa tìm kiếm
        """
        if "user_id" not in session:
            return jsonify({"success": False, "error": "Chưa đăng nhập"}), 401

        user_id = session["user_id"]

        status_str = request.args.get("status", "all")
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)
        search = request.args.get("search", None)

        # Chuẩn hóa tham số
        if page < 1:
            page = 1
        if per_page < 1 or per_page > 100:
            per_page = 10

        status = None
        if status_str and status_str != "all":
            try:
                status = NewsStatus(status_str)
            except ValueError:
                status = None

        offset = (page - 1) * per_page

        items, total = self.news_model.get_by_creator(
            creator_id=user_id,
            limit=per_page,
            offset=offset,
            status=status,
            search=search,
        )

        total_pages = (total + per_page - 1) // per_page if total > 0 else 1

        return jsonify(
            {
                "success": True,
                "data": [self._news_to_dict(news) for news in items],
                "pagination": {
                    "page": page,
                    "per_page": per_page,
                    "total": total,
                    "pages": total_pages,
                },
            }
        )
    
    def api_current_user(self):
        """
        API lấy thông tin user hiện tại từ session (JSON)
        Route: GET /admin/api/current-user
        """
        if 'user_id' not in session:
            return jsonify({
                'success': False,
                'error': 'Chưa đăng nhập'
            }), 401
        
        user = self.user_model.get_by_id(session['user_id'])
        if not user:
            return jsonify({
                'success': False,
                'error': 'Không tìm thấy user'
            }), 404
        
        return jsonify({
            'success': True,
            'data': {
                'id': user.id,
                'username': user.username,
                'name': user.full_name or user.username,
                'role': user.role.value,
                'email': user.email
            }
        })
    
    def api_editor_notifications(self):
        """
        API lấy các bài viết được duyệt/từ chối gần đây của editor hiện tại (JSON)
        Route: GET /admin/api/editor-notifications
        Query params:
            limit: số lượng bài viết tối đa (mặc định: 20)
        """
        if "user_id" not in session:
            return jsonify({"success": False, "error": "Chưa đăng nhập"}), 401

        user_id = session["user_id"]
        limit = request.args.get("limit", 20, type=int)
        
        if limit < 1 or limit > 100:
            limit = 20

        # Lấy các bài viết được duyệt hoặc từ chối gần đây của editor này
        # Sắp xếp theo published_at (nếu có) hoặc updated_at (khi bị từ chối)
        from sqlalchemy import or_, desc
        
        items = self.db_session.query(News).filter(
            News.created_by == user_id,
            or_(
                News.status == NewsStatus.PUBLISHED,
                News.status == NewsStatus.REJECTED
            )
        ).order_by(
            desc(News.published_at),
            desc(News.updated_at)
        ).limit(limit).all()

        notifications = []
        for news in items:
            notification = {
                'id': news.id,
                'title': news.title,
                'status': news.status.value,
                'category_name': news.category.name if getattr(news, "category", None) else None,
                'published_at': news.published_at.isoformat() if news.published_at else None,
                'updated_at': news.updated_at.isoformat() if news.updated_at else None,
                'approved_by': news.approver.username if getattr(news, "approver", None) else None,
            }
            notifications.append(notification)

        return jsonify({
            "success": True,
            "data": notifications,
            "count": len(notifications)
        })
    
    def _news_to_dict(self, news) -> dict:
        """Chuyển đổi News object thành dictionary"""
        return {
            'id': news.id,
            'title': news.title,
            'slug': news.slug,
            'status': news.status.value,
            'category': {
                'id': news.category.id if getattr(news, "category", None) else None,
                'name': news.category.name if getattr(news, "category", None) else None,
            },
            # Các field phẳng phục vụ cho UI editor
            'category_name': news.category.name if getattr(news, "category", None) else None,
            'visible': getattr(news, "visible", True),
            'created_by': news.creator.username if getattr(news, "creator", None) else None,
            'approved_by': news.approver.username if getattr(news, "approver", None) else None,
            'created_at': news.created_at.isoformat() if getattr(news, "created_at", None) else None,
            'published_at': news.published_at.isoformat() if getattr(news, "published_at", None) else None,
        }
    
    def api_statistics(self):
        """API lấy thống kê dashboard"""
        from sqlalchemy import func
        
        # Đếm số lượng bài viết theo trạng thái
        pending_count = self.db_session.query(func.count(News.id)).filter(
            News.status == NewsStatus.PENDING
        ).scalar() or 0
        
        approved_count = self.db_session.query(func.count(News.id)).filter(
            News.status == NewsStatus.PUBLISHED
        ).scalar() or 0
        
        rejected_count = self.db_session.query(func.count(News.id)).filter(
            News.status == NewsStatus.REJECTED
        ).scalar() or 0
        
        # Đếm số bài viết từ API trong cache (tạm thời)
        api_articles = session.get('api_articles_cache', [])
        api_count = len(api_articles)
        
        return jsonify({
            'success': True,
            'data': {
                'pending': pending_count,
                'approved': approved_count,
                'rejected': rejected_count,
                'api': api_count
            }
        })
    
    def api_pending_articles(self):
        """API lấy danh sách bài viết chờ duyệt"""
        articles = self.news_model.get_all(status=NewsStatus.PENDING, limit=100)
        
        return jsonify({
            'success': True,
            'data': [{
                'id': article.id,
                'title': article.title,
                'author': article.creator.username if article.creator else 'N/A',
                'category': article.category.name if article.category else 'N/A',
                'date': article.created_at.strftime('%d/%m/%Y %H:%M') if article.created_at else '',
                'status': article.status.value
            } for article in articles]
        })
    
    def api_approved_articles(self):
        """API lấy danh sách bài viết đã duyệt"""
        articles = self.news_model.get_all(status=NewsStatus.PUBLISHED, limit=100)
        
        return jsonify({
            'success': True,
            'data': [{
                'id': article.id,
                'title': article.title,
                'author': article.creator.username if article.creator else 'N/A',
                'category': article.category.name if article.category else 'N/A',
                'date': article.published_at.strftime('%d/%m/%Y %H:%M') if article.published_at else '',
                'views': article.view_count
            } for article in articles]
        })
    
    def api_rejected_articles(self):
        """API lấy danh sách bài viết bị từ chối"""
        articles = self.news_model.get_all(status=NewsStatus.REJECTED, limit=100)
        
        return jsonify({
            'success': True,
            'data': [{
                'id': article.id,
                'title': article.title,
                'author': article.creator.username if article.creator else 'N/A',
                'category': article.category.name if article.category else 'N/A',
                'date': article.created_at.strftime('%d/%m/%Y %H:%M') if article.created_at else ''
            } for article in articles]
        })
    
    def api_api_articles(self):
        """API lấy danh sách bài viết từ API bên ngoài (chỉ hiển thị, không lưu)"""
        # Lấy dữ liệu từ session hoặc cache (tạm thời lưu trong session)
        # Hoặc fetch lại từ API nếu cần
        api_articles = session.get('api_articles_cache', [])
        
        return jsonify({
            'success': True,
            'data': api_articles
        })
    
    def api_international_articles(self):
        """API lấy danh sách bài viết quốc tế (đã duyệt) từ bảng NewsInternational"""
        articles = (
            self.db_session.query(NewsInternational)
            .join(CategoryInternational)
            .filter(NewsInternational.status == NewsStatus.PUBLISHED)
            .order_by(NewsInternational.published_at.desc())
            .limit(100)
            .all()
        )

        return jsonify({
            'success': True,
            'data': [{
                'id': article.id,
                'title': article.title,
                'category': article.category.name if article.category else 'N/A',
                'author': article.creator.username if article.creator else 'N/A',
                'status': 'Approved',
                'views': article.view_count,
                'published': article.published_at.strftime('%d/%m/%Y') if article.published_at else ''
            } for article in articles]
        })
    
    def api_international_pending(self):
        """API lấy danh sách bài viết quốc tế chờ duyệt từ bảng NewsInternational"""
        articles = (
            self.db_session.query(NewsInternational)
            .join(CategoryInternational)
            .filter(NewsInternational.status == NewsStatus.PENDING)
            .order_by(NewsInternational.created_at.desc())
            .limit(100)
            .all()
        )

        return jsonify({
            'success': True,
            'data': [{
                'id': article.id,
                'title': article.title,
                'category': article.category.name if article.category else 'N/A',
                'author': article.creator.username if article.creator else 'N/A',
                'submitted': article.created_at.strftime('%d/%m/%Y %H:%M') if article.created_at else ''
            } for article in articles]
        })
    
    def api_fetch_api_news(self):
        """API lấy bài viết mới từ RSS Feed hoặc API bên ngoài"""
        import feedparser
        import requests
        from datetime import datetime, timedelta
        import re
        
        try:
            # Lấy thông tin từ request
            data = request.json if request.is_json else {}
            source_type = data.get('source_type', 'rss')  # 'rss' hoặc 'api'
            rss_url = data.get('rss_url', 'https://vnexpress.net/rss/tin-moi-nhat.rss')
            api_token = data.get('api_key')  # Đổi tên từ api_key thành api_token
            urls = data.get('urls', [])  # Danh sách URLs để fetch
            region = data.get('region', 'domestic')  # 'domestic' hoặc 'international'
            category_id = data.get('category_id', '')  # ID danh mục
            limit = data.get('limit', 20)
            
            articles = []
            
            # Nếu là RSS feed
            if source_type == 'rss' and rss_url:
                try:
                    feed = feedparser.parse(rss_url)
                    
                    if feed.bozo and feed.bozo_exception:
                        return jsonify({
                            'success': False,
                            'error': f'Lỗi parse RSS: {feed.bozo_exception}'
                        }), 400
                    
                    for entry in feed.entries[:limit]:
                        # Extract image từ description hoặc enclosure
                        image_url = ''
                        if 'enclosures' in entry and entry.enclosures:
                            image_url = entry.enclosures[0].get('url', '')
                        elif 'media_content' in entry and entry.media_content:
                            image_url = entry.media_content[0].get('url', '')
                        else:
                            # Try to extract image from description HTML
                            desc = entry.get('description', '')
                            img_match = re.search(r'<img[^>]+src="([^"]+)"', desc)
                            if img_match:
                                image_url = img_match.group(1)
                        
                        # Clean description HTML tags
                        description = entry.get('description', '')
                        description = re.sub(r'<[^>]+>', '', description)
                        description = description.replace('&nbsp;', ' ').strip()
                        
                        articles.append({
                            'title': entry.get('title', 'No title'),
                            'description': description[:500] if description else 'No description',
                            'url': entry.get('link', ''),
                            'urlToImage': image_url,
                            'source': {'name': feed.feed.get('title', 'RSS Feed')},
                            'author': entry.get('author', 'Unknown'),
                            'publishedAt': entry.get('published', datetime.utcnow().isoformat()),
                            'content': description
                        })
                    
                except Exception as e:
                    return jsonify({
                        'success': False,
                        'error': f'Lỗi fetch RSS: {str(e)}'
                    }), 500
            
            # Nếu là API với token
            elif source_type == 'api' and api_token:
                try:
                    # Kiểm tra mode
                    mode = data.get('mode', 'urls')
                    headers = {
                        'Authorization': f'Bearer {api_token}',
                        'Content-Type': 'application/json'
                    }
                    
                    if mode == 'category':
                        # Mode: Theo khu vực & danh mục - Gọi 2 endpoints tuần tự
                        if not category_id:
                            return jsonify({
                                'success': False,
                                'error': 'Vui lòng chọn danh mục'
                            }), 400
                        
                        # Bước 1: Gọi endpoint để lấy danh sách URLs
                        rss_endpoint = f'https://news-api.techreview.pro/rss/{category_id}/urls'
                        rss_params = {'limit': limit}
                        if region == 'international':
                            rss_params['source'] = 'en'
                        
                        rss_response = requests.get(rss_endpoint, headers=headers, params=rss_params, timeout=30)
                        
                        if rss_response.status_code != 200:
                            return jsonify({
                                'success': False,
                                'error': f'Lỗi lấy danh sách URLs: {rss_response.status_code}'
                            }), rss_response.status_code
                        
                        rss_data = rss_response.json()
                        if not rss_data.get('success') or not rss_data.get('data', {}).get('urls'):
                            return jsonify({
                                'success': False,
                                'error': 'Không tìm thấy URLs từ danh mục này'
                            }), 400
                        
                        # Lấy danh sách URLs từ response
                        urls = rss_data['data']['urls']
                        
                        # Bước 2: Gọi endpoint articles với URLs vừa lấy được
                        api_endpoint = 'https://news-api.techreview.pro/articles'
                        payload = {'urls': urls}
                        
                    elif mode == 'urls':
                        # Mode: Theo danh sách URL
                        if not urls:
                            return jsonify({
                                'success': False,
                                'error': 'Vui lòng cung cấp danh sách URLs'
                            }), 400
                        
                        api_endpoint = 'https://news-api.techreview.pro/articles'
                        payload = {'urls': urls}
                        
                    else:
                        return jsonify({
                            'success': False,
                            'error': 'Mode không hợp lệ'
                        }), 400
                    
                    response = requests.post(api_endpoint, json=payload, headers=headers)
                    
                    if response.status_code == 200:
                        api_data = response.json()
                        
                        # Kiểm tra response format
                        if api_data.get('success') and api_data.get('data', {}).get('articles'):
                            api_articles = api_data['data']['articles']
                            
                            # Format articles theo cấu trúc mới
                            for api_article in api_articles[:limit]:
                                # Join description array thành string
                                description_text = ' '.join(api_article.get('description', []))
                                
                                # Lấy main image hoặc first image
                                main_image = api_article.get('mainImage', '')
                                if not main_image and api_article.get('images'):
                                    main_image = api_article['images'][0]
                                
                                articles.append({
                                    'title': api_article.get('title', 'No title'),
                                    'description': api_article.get('summary', description_text[:500]),
                                    'url': api_article.get('link', ''),
                                    'urlToImage': main_image,
                                    'source': {'name': 'Custom API'},
                                    'author': api_article.get('author', 'Unknown'),
                                    'publishedAt': api_article.get('pubDate', datetime.utcnow().isoformat()),
                                    'content': description_text,
                                    'images': api_article.get('images', [])
                                })
                        else:
                            return jsonify({
                                'success': False,
                                'error': f"API trả về lỗi: {api_data.get('message', 'Unknown error')}"
                            }), 400
                            
                    elif response.status_code == 401:
                        return jsonify({
                            'success': False,
                            'error': 'API token không hợp lệ hoặc đã hết hạn'
                        }), 401
                    else:
                        return jsonify({
                            'success': False,
                            'error': f'Lỗi API: {response.status_code} - {response.text}'
                        }), response.status_code
                        
                except requests.exceptions.RequestException as e:
                    return jsonify({
                        'success': False,
                        'error': f'Lỗi kết nối API: {str(e)}'
                    }), 500
                except Exception as e:
                    return jsonify({
                        'success': False,
                        'error': f'Lỗi khi fetch từ API: {str(e)}'
                    }), 500
            
            # Nếu không có articles
            elif not articles:
                return jsonify({
                    'success': False,
                    'error': 'Không có bài viết nào được tìm thấy'
                }), 400
            
            # Format dữ liệu để trả về
            formatted_articles = []
            for idx, article in enumerate(articles):
                source_name = article.get('source', {}).get('name', 'Unknown') if isinstance(article.get('source'), dict) else str(article.get('source', 'Unknown'))
                published_at = article.get('publishedAt', datetime.utcnow().isoformat())
                
                # Lấy content, nếu là RSS thì fetch full content từ URL
                content = article.get('content', article.get('description', ''))
                article_url = article.get('url', '')
                
                # Nếu là RSS và có URL, fetch full content
                if source_type == 'rss' and article_url:
                    full_content = self._fetch_article_content(article_url)
                    if full_content:
                        content = full_content
                
                # Nếu là API, content đã có đầy đủ rồi
                formatted_articles.append({
                    'id': f'api_{idx}_{datetime.utcnow().timestamp()}',  # Temporary ID
                    'title': article.get('title', 'No title'),
                    'summary': article.get('description', ''),
                    'content': content,
                    'thumbnail': article.get('urlToImage', ''),
                    'source': source_name,
                    'source_url': article_url,
                    'author': article.get('author', 'Unknown'),
                    'published_at': published_at,
                    'images': article.get('images', [])  # Thêm images array cho API articles
                })
            
            # Lưu vào session để sử dụng sau (tạm thời)
            session['api_articles_cache'] = formatted_articles
            
            return jsonify({
                'success': True,
                'message': f'Đã lấy {len(formatted_articles)} bài viết',
                'count': len(formatted_articles),
                'data': formatted_articles
            })
            
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500
    
    def api_save_api_article(self):
        """API lưu bài viết từ API vào bảng news với trạng thái được chọn"""
        # Tạo session mới để tránh lỗi "transaction closed"
        db_session = get_session()
        
        try:
            user_id = session.get('user_id')
            if not user_id:
                return jsonify({'success': False, 'error': 'Chưa đăng nhập'}), 401
            
            data = request.json if request.is_json else request.form
            
            # Lấy dữ liệu bài viết từ request
            article_data = data.get('article')
            if not article_data:
                return jsonify({'success': False, 'error': 'Thiếu dữ liệu bài viết'}), 400
            
            # Lấy thông tin từ request
            category_id = data.get('category_id')
            if category_id:
                category_id = int(category_id)
            
            status = data.get('status', NewsStatus.DRAFT.value)
            
            if not category_id:
                return jsonify({'success': False, 'error': 'Vui lòng chọn danh mục'}), 400
            
            try:
                news_status = NewsStatus(status)
            except ValueError:
                news_status = NewsStatus.DRAFT
            
            # Kiểm tra category tồn tại
            category = db_session.query(Category).filter(Category.id == category_id).first()
            if not category:
                return jsonify({'success': False, 'error': 'Danh mục không tồn tại'}), 400
            
            # Parse published_at nếu có
            published_at = None
            if article_data.get('published_at'):
                try:
                    from dateutil import parser
                    published_at = parser.parse(article_data['published_at'])
                except:
                    published_at = datetime.utcnow()
            
            # Tạo bài viết mới từ API article
            news = News(
                title=article_data.get('title', ''),
                slug=self._generate_slug(article_data.get('title', 'Untitled')),
                summary=article_data.get('summary', ''),
                content=article_data.get('content', article_data.get('summary', '')),
                thumbnail=article_data.get('thumbnail'),
                category_id=category_id,
                created_by=user_id,
                approved_by=user_id if news_status == NewsStatus.PUBLISHED else None,
                status=news_status,
                is_api=True,  # Đánh dấu bài từ API
                published_at=published_at if news_status == NewsStatus.PUBLISHED else None
            )
            
            db_session.add(news)
            db_session.commit()
            
            news_id = news.id
            
            return jsonify({
                'success': True,
                'message': f'Đã lưu bài viết với trạng thái {news_status.value}',
                'news_id': news_id
            })
            
        except Exception as e:
            db_session.rollback()
            return jsonify({
                'success': False,
                'error': f'Lỗi khi lưu bài viết: {str(e)}'
            }), 500
        finally:
            db_session.close()
    
    def api_chart_data(self):
        """API lấy dữ liệu cho biểu đồ"""
        from sqlalchemy import func, extract
        from datetime import datetime, timedelta
        
        # Lấy dữ liệu 7 ngày gần nhất
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=7)
        
        # Đếm bài viết mới theo ngày
        new_articles = self.db_session.query(
            func.date(News.created_at).label('date'),
            func.count(News.id).label('count')
        ).filter(
            News.created_at >= start_date
        ).group_by(func.date(News.created_at)).all()
        
        # Đếm bài được duyệt theo ngày
        approved_articles = self.db_session.query(
            func.date(News.published_at).label('date'),
            func.count(News.id).label('count')
        ).filter(
            News.published_at >= start_date,
            News.status == NewsStatus.PUBLISHED
        ).group_by(func.date(News.published_at)).all()
        
        # Tạo dictionary cho dễ truy cập
        new_dict = {str(item.date): item.count for item in new_articles}
        approved_dict = {str(item.date): item.count for item in approved_articles}
        
        # Tạo labels và data cho 7 ngày
        labels = []
        new_data = []
        approved_data = []
        
        for i in range(7):
            date = (start_date + timedelta(days=i)).date()
            date_str = str(date)
            labels.append(date.strftime('%d/%m'))
            new_data.append(new_dict.get(date_str, 0))
            approved_data.append(approved_dict.get(date_str, 0))
        
        return jsonify({
            'success': True,
            'data': {
                'labels': labels,
                'datasets': [
                    {
                        'label': 'Bài viết mới',
                        'data': new_data
                    },
                    {
                        'label': 'Bài được duyệt',
                        'data': approved_data
                    }
                ]
            }
        })
    
    def api_hot_articles(self):
        """API lấy danh sách bài viết hot nhất"""
        articles = self.news_model.get_hot(limit=10)
        
        return jsonify({
            'success': True,
            'data': [{
                'title': article.title,
                'views': article.view_count
            } for article in articles]
        })
    
    def api_article_detail(self, article_id: int):
        """API lấy chi tiết bài viết theo ID"""
        article = self.news_model.get_by_id(article_id)
        
        if not article:
            return jsonify({
                'success': False,
                'message': 'Bài viết không tồn tại'
            }), 404
        
        # Lấy tags từ NewsTag relationship
        news_tags = self.db_session.query(NewsTag).filter(NewsTag.news_id == article.id).all()
        tag_ids = [nt.tag_id for nt in news_tags]
        tags = self.db_session.query(Tag).filter(Tag.id.in_(tag_ids)).all() if tag_ids else []
        tags_list = [f"#{tag.name}" for tag in tags]
        tags_string = ' '.join(tags_list) if tags_list else ''
        
        return jsonify({
            'success': True,
            'data': {
                'id': article.id,
                'title': article.title,
                'slug': article.slug,
                'summary': article.summary or '',
                'content': article.content or '',
                'thumbnail': article.thumbnail or '',
                'category': article.category.name if article.category else 'N/A',
                'category_id': article.category_id,
                'author': article.creator.username if article.creator else 'N/A',
                'author_full_name': article.creator.full_name if article.creator and article.creator.full_name else article.creator.username if article.creator else 'N/A',
                'status': article.status.value,
                'created_at': article.created_at.strftime('%d/%m/%Y %H:%M') if article.created_at else '',
                'published_at': article.published_at.strftime('%d/%m/%Y %H:%M') if article.published_at else '',
                'updated_at': article.updated_at.strftime('%d/%m/%Y %H:%M') if article.updated_at else '',
                'view_count': article.view_count,
                'is_featured': article.is_featured if hasattr(article, 'is_featured') else False,
                'is_hot': article.is_hot if hasattr(article, 'is_hot') else False,
                'is_deleted': article.is_deleted if hasattr(article, 'is_deleted') else False,
                'tags': tags_string
            }
        })
    
    def api_categories(self):
        """API lấy danh sách danh mục"""
        categories = self.category_model.get_all()
        
        return jsonify({
            'success': True,
            'data': [{
                'id': cat.id,
                'name': cat.name,
                'slug': cat.slug
            } for cat in categories]
        })
    
    def api_tags(self):
        """API lấy danh sách tags để autocomplete"""
        search = request.args.get('search', '').strip()
        
        query = self.db_session.query(Tag).order_by(Tag.name)
        
        if search:
            # Tìm tags có tên chứa search term (không phân biệt hoa thường)
            query = query.filter(Tag.name.ilike(f'%{search}%'))
        
        tags = query.limit(20).all()
        
        return jsonify({
            'success': True,
            'data': [{
                'id': tag.id,
                'name': tag.name,
                'slug': tag.slug
            } for tag in tags]
        })

    def api_create_tag(self):
        """API tạo hashtag mới"""
        data = request.get_json(silent=True) or {}
        name = (data.get('name') or '').strip()
        slug = (data.get('slug') or '').strip() or None

        if not name:
            return jsonify({'success': False, 'error': 'Tên hashtag không được để trống'}), 400

        # Chuẩn hóa: bỏ dấu # nếu có
        if name.startswith('#'):
            name = name[1:]

        # Nếu không truyền slug, tự sinh từ name
        if not slug:
            slug = self._generate_slug(name)

        try:
            # Kiểm tra trùng slug
            existing = self.db_session.query(Tag).filter(Tag.slug == slug).first()
            if existing:
                return jsonify({'success': False, 'error': 'Hashtag đã tồn tại'}), 400

            tag = Tag(name=name, slug=slug)
            self.db_session.add(tag)
            self.db_session.commit()

            return jsonify({
                'success': True,
                'data': {
                    'id': tag.id,
                    'name': tag.name,
                    'slug': tag.slug
                }
            })
        except SQLAlchemyError as e:
            self.db_session.rollback()
            current_app.logger.exception('Lỗi tạo hashtag: %s', e)
            return jsonify({'success': False, 'error': 'Không thể tạo hashtag'}), 500

    def api_update_tag(self, tag_id: int):
        """API cập nhật hashtag"""
        data = request.get_json(silent=True) or {}
        name = (data.get('name') or '').strip()
        slug = (data.get('slug') or '').strip() or None

        if not name:
            return jsonify({'success': False, 'error': 'Tên hashtag không được để trống'}), 400

        if name.startswith('#'):
            name = name[1:]

        if not slug:
            slug = self._generate_slug(name)

        try:
            tag = self.db_session.query(Tag).filter(Tag.id == tag_id).first()
            if not tag:
                return jsonify({'success': False, 'error': 'Không tìm thấy hashtag'}), 404

            # Kiểm tra slug trùng với tag khác
            existing = self.db_session.query(Tag).filter(Tag.slug == slug, Tag.id != tag_id).first()
            if existing:
                return jsonify({'success': False, 'error': 'Slug đã được dùng bởi hashtag khác'}), 400

            tag.name = name
            tag.slug = slug
            self.db_session.commit()

            return jsonify({
                'success': True,
                'data': {
                    'id': tag.id,
                    'name': tag.name,
                    'slug': tag.slug
                }
            })
        except SQLAlchemyError as e:
            self.db_session.rollback()
            current_app.logger.exception('Lỗi cập nhật hashtag: %s', e)
            return jsonify({'success': False, 'error': 'Không thể cập nhật hashtag'}), 500

    def api_delete_tag(self, tag_id: int):
        """API xóa hashtag"""
        try:
            tag = self.db_session.query(Tag).filter(Tag.id == tag_id).first()
            if not tag:
                return jsonify({'success': False, 'error': 'Không tìm thấy hashtag'}), 404

            # Xóa liên kết NewsTag trước khi xóa tag
            self.db_session.query(NewsTag).where(NewsTag.tag_id == tag_id).delete()
            self.db_session.delete(tag)
            self.db_session.commit()

            return jsonify({'success': True})
        except SQLAlchemyError as e:
            self.db_session.rollback()
            current_app.logger.exception('Lỗi xóa hashtag: %s', e)
            return jsonify({'success': False, 'error': 'Không thể xóa hashtag'}), 500

    def api_international_categories(self):
        """API lấy danh sách danh mục tin quốc tế (categories_international)"""
        categories = self.int_category_model.get_all()

        return jsonify({
            'success': True,
            'data': [{
                'id': cat.id,
                'name': cat.name,
                'slug': cat.slug,
            } for cat in categories]
        })
    
    def _parse_tags(self, tags_string: str) -> list:
        """Parse tags từ string có thể chứa hashtag format (#tag_name), comma-separated hoặc cách nhau bằng khoảng trắng"""
        import re
        tag_names = []

        if not tags_string:
            return []
        
        # Tách theo dấu phẩy, dấu chấm phẩy HOẶC khoảng trắng
        parts = re.split(r'[,\s;]+', tags_string)
        
        for part in parts:
            part = part.strip()
            if not part:
                continue
            
            # Nếu có dấu # ở đầu, loại bỏ nó
            if part.startswith('#'):
                part = part[1:]
            
            # Loại bỏ các ký tự đặc biệt không hợp lệ
            part = re.sub(r'[^\w\s-]', '', part)
            part = part.strip()
            
            if part:
                tag_names.append(part)
        
        # Loại bỏ trùng lặp và trả về
        return list(dict.fromkeys(tag_names))
    
    def _generate_slug(self, title: str, status: str = None) -> str:
        """Tạo slug từ tiêu đề và trạng thái"""
        import re
        
        # Mapping tiếng Việt sang không dấu
        vietnamese_map = {
            'à': 'a', 'á': 'a', 'ạ': 'a', 'ả': 'a', 'ã': 'a', 'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ậ': 'a', 'ẩ': 'a', 'ẫ': 'a',
            'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ặ': 'a', 'ẳ': 'a', 'ẵ': 'a',
            'è': 'e', 'é': 'e', 'ẹ': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ê': 'e', 'ề': 'e', 'ế': 'e', 'ệ': 'e', 'ể': 'e', 'ễ': 'e',
            'ì': 'i', 'í': 'i', 'ị': 'i', 'ỉ': 'i', 'ĩ': 'i',
            'ò': 'o', 'ó': 'o', 'ọ': 'o', 'ỏ': 'o', 'õ': 'o', 'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ộ': 'o', 'ổ': 'o', 'ỗ': 'o',
            'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ợ': 'o', 'ở': 'o', 'ỡ': 'o',
            'ù': 'u', 'ú': 'u', 'ụ': 'u', 'ủ': 'u', 'ũ': 'u', 'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ự': 'u', 'ử': 'u', 'ữ': 'u',
            'ỳ': 'y', 'ý': 'y', 'ỵ': 'y', 'ỷ': 'y', 'ỹ': 'y',
            'đ': 'd',
            'À': 'a', 'Á': 'a', 'Ạ': 'a', 'Ả': 'a', 'Ã': 'a', 'Â': 'a', 'Ầ': 'a', 'Ấ': 'a', 'Ậ': 'a', 'Ẩ': 'a', 'Ẫ': 'a',
            'Ă': 'a', 'Ằ': 'a', 'Ắ': 'a', 'Ặ': 'a', 'Ẳ': 'a', 'Ẵ': 'a',
            'È': 'e', 'É': 'e', 'Ẹ': 'e', 'Ẻ': 'e', 'Ẽ': 'e', 'Ê': 'e', 'Ề': 'e', 'Ế': 'e', 'Ệ': 'e', 'Ể': 'e', 'Ễ': 'e',
            'Ì': 'i', 'Í': 'i', 'Ị': 'i', 'Ỉ': 'i', 'Ĩ': 'i',
            'Ò': 'o', 'Ó': 'o', 'Ọ': 'o', 'Ỏ': 'o', 'Õ': 'o', 'Ô': 'o', 'Ồ': 'o', 'Ố': 'o', 'Ộ': 'o', 'Ổ': 'o', 'Ỗ': 'o',
            'Ơ': 'o', 'Ờ': 'o', 'Ớ': 'o', 'Ợ': 'o', 'Ở': 'o', 'Ỡ': 'o',
            'Ù': 'u', 'Ú': 'u', 'Ụ': 'u', 'Ủ': 'u', 'Ũ': 'u', 'Ư': 'u', 'Ừ': 'u', 'Ứ': 'u', 'Ự': 'u', 'Ử': 'u', 'Ữ': 'u',
            'Ỳ': 'y', 'Ý': 'y', 'Ỵ': 'y', 'Ỷ': 'y', 'Ỹ': 'y',
            'Đ': 'd'
        }
        
        slug = title.lower()
        
        # Chuyển đổi tiếng Việt có dấu sang không dấu
        for viet_char, eng_char in vietnamese_map.items():
            slug = slug.replace(viet_char, eng_char)
        
        # Loại bỏ ký tự đặc biệt, chỉ giữ chữ, số, khoảng trắng và dấu gạch ngang
        slug = re.sub(r'[^\w\s-]', '', slug)
        # Thay nhiều khoảng trắng hoặc dấu gạch ngang bằng một dấu gạch ngang
        slug = re.sub(r'[-\s]+', '-', slug)
        # Loại bỏ dấu gạch ngang ở đầu và cuối
        slug = slug.strip('-')
        
        # Thêm prefix trạng thái nếu cần (tùy chọn)
        if status and status != 'published':
            slug = f"{slug}-{status}"
        
        return slug
    
    def api_create_article(self):
        """API tạo bài viết mới từ editor form"""
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'success': False, 'error': 'Chưa đăng nhập'}), 401
        
        data = request.json if request.is_json else request.form
        
        # Lấy dữ liệu từ form
        title = data.get('title', '').strip()
        content = data.get('content', '').strip()
        category_id = data.get('category_id') or data.get('category')
        summary = data.get('summary') or data.get('description', '').strip()
        thumbnail = data.get('thumbnail', '').strip()
        tags = data.get('tags', '').strip()
        status = data.get('status', NewsStatus.DRAFT.value)
        
        # Validation
        if not title:
            return jsonify({'success': False, 'error': 'Vui lòng nhập tiêu đề bài viết'}), 400
        
        if not content:
            return jsonify({'success': False, 'error': 'Vui lòng nhập nội dung bài viết'}), 400
        
        if not category_id:
            return jsonify({'success': False, 'error': 'Vui lòng chọn danh mục'}), 400
        
        try:
            category_id = int(category_id)
        except (ValueError, TypeError):
            return jsonify({'success': False, 'error': 'Danh mục không hợp lệ'}), 400
        
        # Kiểm tra category tồn tại
        category = self.db_session.query(Category).filter(Category.id == category_id).first()
        if not category:
            return jsonify({'success': False, 'error': 'Danh mục không tồn tại'}), 400
        
        try:
            news_status = NewsStatus(status)
        except ValueError:
            news_status = NewsStatus.DRAFT
        
        # Tạo slug từ tiêu đề và trạng thái
        base_slug = self._generate_slug(title, status)
        slug = base_slug
        
        # Kiểm tra slug trùng và thêm số nếu cần
        counter = 1
        while self.db_session.query(News).filter(News.slug == slug).first():
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        # Extract images từ HTML content
        import re
        image_urls = []
        img_pattern = r'<img[^>]+src=["\']([^"\']+)["\']'
        matches = re.findall(img_pattern, content)
        for img_url in matches:
            if img_url and img_url not in image_urls:
                image_urls.append(img_url)
        
        # Lưu images dưới dạng JSON
        images_json = None
        if image_urls:
            import json
            images_json = json.dumps(image_urls)
        
        try:
            # Tạo bài viết mới
            article = News(
                title=title,
                slug=slug,
                content=content,
                summary=summary,
                thumbnail=thumbnail,
                images=images_json,
                category_id=category_id,
                created_by=user_id,
                status=news_status,
                published_at=datetime.utcnow() if news_status == NewsStatus.PUBLISHED else None
            )
            
            self.db_session.add(article)
            self.db_session.commit()
            self.db_session.refresh(article)
            
            # Di chuyển ảnh từ temp folder sang folder của bài viết nếu có
            if article.id:
                temp_folder = os.path.join('src', 'static', 'uploads', 'news', 'vn', 'temp')
                news_folder = os.path.join('src', 'static', 'uploads', 'news', 'vn', f'news_{article.id}')
                
                if os.path.exists(temp_folder):
                    os.makedirs(news_folder, exist_ok=True)
                    # Di chuyển các file từ temp sang news folder
                    import shutil
                    for filename in os.listdir(temp_folder):
                        src_path = os.path.join(temp_folder, filename)
                        dst_path = os.path.join(news_folder, filename)
                        if os.path.isfile(src_path):
                            shutil.move(src_path, dst_path)
                            # Cập nhật URL trong thumbnail và content nếu cần
                            if thumbnail and 'temp' in thumbnail:
                                thumbnail = thumbnail.replace('temp', f'news_{article.id}')
                                article.thumbnail = thumbnail
                            if images_json:
                                import json
                                images = json.loads(images_json)
                                updated_images = [img.replace('temp', f'news_{article.id}') if 'temp' in img else img for img in images]
                                article.images = json.dumps(updated_images)
                                # Cập nhật content với URL mới
                                for old_url, new_url in zip(images, updated_images):
                                    if old_url != new_url:
                                        content = content.replace(old_url, new_url)
                                        article.content = content
                    self.db_session.commit()
            
            # Xử lý tags nếu có - CHỈ chấp nhận tags có sẵn trong bảng tags
            if tags:
                # Xóa các tags cũ của bài viết (nếu có)
                self.db_session.query(NewsTag).filter(NewsTag.news_id == article.id).delete()
                
                tag_names = self._parse_tags(tags)
                invalid_tags = []
                
                for tag_name in tag_names:
                    # CHỈ tìm tag có sẵn, KHÔNG tự tạo mới
                    tag = self.db_session.query(Tag).filter(Tag.name == tag_name).first()
                    if not tag:
                        invalid_tags.append(tag_name)
                        continue
                    
                    # Tạo NewsTag mới
                    news_tag = NewsTag(news_id=article.id, tag_id=tag.id)
                    self.db_session.add(news_tag)
                
                # Nếu có tags không hợp lệ, trả về lỗi
                if invalid_tags:
                    self.db_session.rollback()
                    return jsonify({
                        'success': False, 
                        'error': f'Các tags sau không tồn tại trong hệ thống: {", ".join(invalid_tags)}. Vui lòng chỉ sử dụng tags có sẵn.'
                    }), 400
            
            self.db_session.commit()
        except IntegrityError as e:
            self.db_session.rollback()
            # Trả về thông điệp lỗi gốc từ DB (ví dụ: Key (slug)=... already exists.)
            message = getattr(e, "orig", None)
            message = str(message) if message else str(e)
            return jsonify({'success': False, 'error': message}), 400
        except SQLAlchemyError as e:
            self.db_session.rollback()
            return jsonify({'success': False, 'error': str(e)}), 500

        return jsonify({
            'success': True,
            'message': 'Tạo bài viết thành công',
            'data': {
                'id': article.id,
                'slug': article.slug,
                'title': article.title
            }
        })

    def api_edit_article(self, article_id: int):
        """API chỉnh sửa bài viết theo ID"""
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'success': False, 'error': 'Chưa đăng nhập'}), 401
        
        data = request.json if request.is_json else request.form
        article = self.db_session.query(News).filter(News.id == article_id).first()
        if not article:
            return jsonify({'success': False, 'error': 'Bài viết không tồn tại'}), 400
        
        # Lấy dữ liệu từ form
        title = data.get('title', '').strip()
        content = data.get('content', '').strip()
        category_id = data.get('category_id') or data.get('category')
        summary = data.get('summary') or data.get('description', '').strip()
        thumbnail = data.get('thumbnail', '').strip()
        tags = data.get('tags', '').strip()
        status = data.get('status', article.status.value)
        
        # Validation
        if not title:
            return jsonify({'success': False, 'error': 'Vui lòng nhập tiêu đề bài viết'}), 400
        
        if not content:
            return jsonify({'success': False, 'error': 'Vui lòng nhập nội dung bài viết'}), 400
        
        if not category_id:
            return jsonify({'success': False, 'error': 'Vui lòng chọn danh mục'}), 400
        
        try:
            category_id = int(category_id)
        except (ValueError, TypeError):
            return jsonify({'success': False, 'error': 'Danh mục không hợp lệ'}), 400
        
        # Kiểm tra category tồn tại
        category = self.db_session.query(Category).filter(Category.id == category_id).first()
        if not category:
            return jsonify({'success': False, 'error': 'Danh mục không tồn tại'}), 400
        
        try:
            news_status = NewsStatus(status)
        except ValueError:
            news_status = article.status
        
        # Tạo slug từ tiêu đề và trạng thái
        base_slug = self._generate_slug(title, status)
        slug = base_slug
        
        # Kiểm tra slug trùng và thêm số nếu cần (nhưng không trùng với chính nó)
        counter = 1
        while self.db_session.query(News).filter(News.slug == slug, News.id != article_id).first():
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        # Extract images từ HTML content
        import re
        image_urls = []
        img_pattern = r'<img[^>]+src=["\']([^"\']+)["\']'
        matches = re.findall(img_pattern, content)
        for img_url in matches:
            if img_url and img_url not in image_urls:
                image_urls.append(img_url)
        
        # Lưu images dưới dạng JSON
        images_json = None
        if image_urls:
            import json
            images_json = json.dumps(image_urls)
        
        try:
            # Cập nhật bài viết
            article.title = title
            article.slug = slug
            article.content = content
            article.summary = summary
            article.thumbnail = thumbnail
            article.images = images_json
            article.category_id = category_id
            article.status = news_status
            article.published_at = datetime.utcnow() if news_status == NewsStatus.PUBLISHED else article.published_at
            
            self.db_session.commit()
            self.db_session.refresh(article)
            
            # Di chuyển ảnh từ temp folder sang folder của bài viết nếu có
            if article.id:
                temp_folder = os.path.join('src', 'static', 'uploads', 'news', 'vn', 'temp')
                news_folder = os.path.join('src', 'static', 'uploads', 'news', 'vn', f'news_{article.id}')
                
                if os.path.exists(temp_folder):
                    os.makedirs(news_folder, exist_ok=True)
                    # Di chuyển các file từ temp sang news folder
                    import shutil
                    for filename in os.listdir(temp_folder):
                        src_path = os.path.join(temp_folder, filename)
                        dst_path = os.path.join(news_folder, filename)
                        if os.path.isfile(src_path):
                            shutil.move(src_path, dst_path)
                            # Cập nhật URL trong thumbnail và content nếu cần
                            if thumbnail and 'temp' in thumbnail:
                                thumbnail = thumbnail.replace('temp', f'news_{article.id}')
                                article.thumbnail = thumbnail
                            if images_json:
                                import json
                                images = json.loads(images_json)
                                updated_images = [img.replace('temp', f'news_{article.id}') if 'temp' in img else img for img in images]
                                article.images = json.dumps(updated_images)
                                # Cập nhật content với URL mới
                                for old_url, new_url in zip(images, updated_images):
                                    if old_url != new_url:
                                        content = content.replace(old_url, new_url)
                                        article.content = content
                    self.db_session.commit()
            
            # Xử lý tags nếu có - CHỈ chấp nhận tags có sẵn trong bảng tags
            if tags:
                # Xóa các tags cũ của bài viết
                self.db_session.query(NewsTag).filter(NewsTag.news_id == article.id).delete()
                
                tag_names = self._parse_tags(tags)
                invalid_tags = []
                
                for tag_name in tag_names:
                    # CHỈ tìm tag có sẵn, KHÔNG tự tạo mới
                    tag = self.db_session.query(Tag).filter(Tag.name == tag_name).first()
                    if not tag:
                        invalid_tags.append(tag_name)
                        continue
                    
                    # Tạo NewsTag mới
                    news_tag = NewsTag(news_id=article.id, tag_id=tag.id)
                    self.db_session.add(news_tag)
                
                # Nếu có tags không hợp lệ, trả về lỗi
                if invalid_tags:
                    self.db_session.rollback()
                    return jsonify({
                        'success': False, 
                        'error': f'Các tags sau không tồn tại trong hệ thống: {", ".join(invalid_tags)}. Vui lòng chỉ sử dụng tags có sẵn.'
                    }), 400
            
            self.db_session.commit()
        except IntegrityError as e:
            self.db_session.rollback()
            message = getattr(e, "orig", None)
            message = str(message) if message else str(e)
            return jsonify({'success': False, 'error': message}), 400
        except SQLAlchemyError as e:
            self.db_session.rollback()
            return jsonify({'success': False, 'error': str(e)}), 500
        
        return jsonify({
            'success': True,
            'message': 'Cập nhật bài viết thành công',
            'data': {
                'id': article.id,
                'slug': article.slug,
                'title': article.title
            }
        })
    
    def api_upload_image(self):
        """API upload ảnh cho bài viết"""
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'success': False, 'error': 'Chưa đăng nhập'}), 401
        
        if 'image' not in request.files:
            return jsonify({'success': False, 'error': 'Không có file được chọn'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'Không có file được chọn'}), 400
        
        # Kiểm tra file hợp lệ
        if not self._allowed_file(file.filename):
            return jsonify({'success': False, 'error': 'File không hợp lệ. Chỉ chấp nhận: png, jpg, jpeg, gif, webp'}), 400
        
        # Lấy news_id từ request (nếu có) để lưu vào thư mục tương ứng
        news_id = request.form.get('news_id')
        
        # Tạo thư mục lưu ảnh
        if news_id:
            upload_folder = os.path.join('src', 'static', 'uploads', 'news', 'vn', f'news_{news_id}')
        else:
            # Nếu chưa có news_id, lưu vào thư mục temp
            upload_folder = os.path.join('src', 'static', 'uploads', 'news', 'vn', 'temp')
        
        os.makedirs(upload_folder, exist_ok=True)
        
        # Tạo tên file an toàn
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{timestamp}_{filename}"
        filepath = os.path.join(upload_folder, filename)
        
        # Lưu file
        file.save(filepath)
        
        # Tạo URL trả về (relative to static folder)
        image_url = f"static/uploads/news/vn/{'news_' + str(news_id) if news_id else 'temp'}/{filename}"
        
        return jsonify({
            'success': True,
            'message': 'Upload ảnh thành công',
            'url': f'/{image_url}',
            'image_url': image_url
        })

    def _generate_slug(self, title: str) -> str:
        """Tạo slug từ tiêu đề - chuyển tiếng Việt có dấu thành không dấu"""
        import re
        import unicodedata
        
        # Chuyển thành chữ thường
        slug = title.lower()
        
        # Bảng chuyển đổi tiếng Việt có dấu sang không dấu
        vietnamese_map = {
            'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
            'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
            'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
            'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
            'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
            'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
            'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
            'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
            'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
            'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
            'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
            'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
            'đ': 'd',
        }
        
        # Thay thế các ký tự tiếng Việt
        for viet, latin in vietnamese_map.items():
            slug = slug.replace(viet, latin)
        
        # Xóa các ký tự không phải chữ cái, số, khoảng trắng, dấu gạch ngang
        slug = re.sub(r'[^\w\s-]', '', slug)
        
        # Thay thế nhiều khoảng trắng hoặc dấu gạch ngang liên tiếp bằng một dấu gạch ngang
        slug = re.sub(r'[-\s]+', '-', slug)
        
        return slug.strip('-')
    
    def api_menu_items(self):
        """API lấy danh sách categories (menu items)"""
        categories = self.db_session.query(Category).order_by(
            Category.order_display, Category.parent_id
        ).all()
        
        return jsonify({
            'success': True,
            'data': [{
                'id': item.id,
                'name': item.name,
                'slug': item.slug,
                'icon': item.icon,
                'order': item.order_display,
                'parent_id': item.parent_id,
                'level': item.level if hasattr(item, 'level') else 1,
                'visible': item.visible
            } for item in categories]
        })
    
    def _calculate_level(self, parent_id):
        """Tính toán level dựa trên parent_id"""
        if not parent_id:
            return 1
        
        parent = self.db_session.query(Category).filter(Category.id == parent_id).first()
        if not parent:
            return 1
        
        return parent.level + 1
    
    def api_create_menu_item(self):
        """API tạo category mới (menu item)"""
        data = request.json if request.is_json else request.form
        
        name = data.get('name')
        slug = data.get('slug')
        icon = data.get('icon')
        order = data.get('order', 0)
        parent_id = data.get('parent_id')
        visible = data.get('visible', True)
        description = data.get('description')
        
        if not name:
            return jsonify({'success': False, 'error': 'Tên danh mục không được để trống'}), 400
        
        if not slug:
            # Tự động tạo slug
            slug = self._generate_slug(name)
        
        # Kiểm tra slug trùng
        existing = self.db_session.query(Category).filter(Category.slug == slug).first()
        if existing:
            return jsonify({'success': False, 'error': 'Slug đã tồn tại'}), 400
        
        # Tính toán level
        level = self._calculate_level(parent_id)
        
        # Kiểm tra level không được vượt quá 4
        if level > 4:
            return jsonify({'success': False, 'error': 'Không thể tạo menu quá 4 cấp. Menu hiện tại đã đạt cấp tối đa.'}), 400
        
        category = Category(
            name=name,
            slug=slug,
            icon=icon if icon else None,
            order_display=order,
            parent_id=int(parent_id) if parent_id else None,
            level=level,
            visible=visible,
            description=description if description else None
        )
        
        self.db_session.add(category)
        self.db_session.commit()
        self.db_session.refresh(category)
        
        return jsonify({
            'success': True,
            'message': 'Đã tạo danh mục mới',
            'data': {
                'id': category.id,
                'name': category.name,
                'slug': category.slug,
                'level': category.level
            }
        })
    
    def api_update_menu_item(self, menu_id: int):
        """API cập nhật category (menu item)"""
        category = self.db_session.query(Category).filter(Category.id == menu_id).first()
        if not category:
            return jsonify({'success': False, 'error': 'Không tìm thấy danh mục'}), 404
        
        data = request.json if request.is_json else request.form
        
        if 'name' in data:
            category.name = data['name']
        if 'slug' in data:
            # Kiểm tra slug trùng (trừ chính nó)
            existing = self.db_session.query(Category).filter(
                Category.slug == data['slug'],
                Category.id != menu_id
            ).first()
            if existing:
                return jsonify({'success': False, 'error': 'Slug đã tồn tại'}), 400
            category.slug = data['slug']
        if 'icon' in data:
            category.icon = data['icon'] if data['icon'] else None
        if 'order' in data:
            category.order_display = int(data['order'])
        if 'parent_id' in data:
            parent_id = data['parent_id']
            # Kiểm tra không được set parent là chính nó
            if parent_id == menu_id:
                return jsonify({'success': False, 'error': 'Không thể set parent là chính nó'}), 400
            
            # Kiểm tra không được set parent là con cháu của chính nó (tránh vòng lặp)
            if parent_id:
                # Kiểm tra xem parent_id có phải là con cháu của menu_id không
                def is_descendant(parent_candidate_id, ancestor_id):
                    if parent_candidate_id == ancestor_id:
                        return True
                    parent_candidate = self.db_session.query(Category).filter(Category.id == parent_candidate_id).first()
                    if not parent_candidate or not parent_candidate.parent_id:
                        return False
                    return is_descendant(parent_candidate.parent_id, ancestor_id)
                
                if is_descendant(int(parent_id), menu_id):
                    return jsonify({'success': False, 'error': 'Không thể set parent là con cháu của chính nó'}), 400
            
            category.parent_id = int(parent_id) if parent_id else None
            
            # Tính toán lại level khi parent_id thay đổi
            new_level = self._calculate_level(category.parent_id)
            if new_level > 4:
                return jsonify({'success': False, 'error': 'Không thể tạo menu quá 4 cấp. Menu hiện tại đã đạt cấp tối đa.'}), 400
            category.level = new_level
        if 'visible' in data:
            category.visible = bool(data['visible'])
        if 'description' in data:
            category.description = data['description'] if data['description'] else None
        
        category.updated_at = datetime.utcnow()
        self.db_session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Đã cập nhật danh mục',
            'data': {
                'id': category.id,
                'name': category.name,
                'level': category.level
            }
        })
    
    def api_delete_menu_item(self, menu_id: int):
        """API xóa category (menu item)"""
        category = self.db_session.query(Category).filter(Category.id == menu_id).first()
        if not category:
            return jsonify({'success': False, 'error': 'Không tìm thấy danh mục'}), 404
        
        # Kiểm tra xem có tin tức nào đang sử dụng category này không
        news_count = self.db_session.query(News).filter(News.category_id == menu_id).count()
        if news_count > 0:
            return jsonify({
                'success': False,
                'error': f'Không thể xóa danh mục vì có {news_count} tin tức đang sử dụng'
            }), 400
        
        # Xóa các category con trước (cascade)
        children = self.db_session.query(Category).filter(Category.parent_id == menu_id).all()
        for child in children:
            # Kiểm tra tin tức của child category
            child_news_count = self.db_session.query(News).filter(News.category_id == child.id).count()
            if child_news_count == 0:
                self.db_session.delete(child)
        
        self.db_session.delete(category)
        self.db_session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Đã xóa danh mục'
        })
    
    def api_init_default_menu_items(self):
        """API khởi tạo categories mặc định (menu items)"""
        # Kiểm tra xem đã có categories chưa
        count = self.db_session.query(Category).count()
        if count > 0:
            return jsonify({
                'success': False,
                'error': 'Đã có categories trong database'
            }), 400
        
        # Sử dụng DEFAULT_CATEGORIES từ database.py
        from database import DEFAULT_CATEGORIES
        
        # Tạo categories (tạo parent trước)
        created_items = {}  # Map slug -> real_id
        
        # Tạo parent categories trước
        parent_categories = [c for c in DEFAULT_CATEGORIES if c['parent_id'] is None]
        parent_categories.sort(key=lambda x: x['order_display'])
        
        for cat_data in parent_categories:
            category = Category(
                name=cat_data['name'],
                slug=cat_data['slug'],
                icon=cat_data['icon'],
                order_display=cat_data['order_display'],
                parent_id=None,
                visible=True
            )
            self.db_session.add(category)
            self.db_session.flush()  # Để lấy ID
            created_items[cat_data['slug']] = category.id
        
        # Tạo child categories (nếu có trong DEFAULT_CATEGORIES)
        child_categories = [c for c in DEFAULT_CATEGORIES if c['parent_id'] is not None]
        child_categories.sort(key=lambda x: (x['parent_id'], x['order_display']))
        
        for cat_data in child_categories:
            # Tìm parent_id từ slug của parent
            parent_slug = None
            for parent_cat in DEFAULT_CATEGORIES:
                if parent_cat.get('id') == cat_data['parent_id']:
                    parent_slug = parent_cat['slug']
                    break
            
            if parent_slug and parent_slug in created_items:
                parent_id = created_items[parent_slug]
                category = Category(
                    name=cat_data['name'],
                    slug=cat_data['slug'],
                    icon=cat_data['icon'],
                    order_display=cat_data['order_display'],
                    parent_id=parent_id,
                    visible=True
                )
                self.db_session.add(category)
                self.db_session.flush()
                created_items[cat_data['slug']] = category.id
        
        self.db_session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Đã khởi tạo {len(DEFAULT_CATEGORIES)} categories mặc định',
            'count': len(DEFAULT_CATEGORIES)
        })
    
    def api_update_menu_order(self):
        """API cập nhật thứ tự categories (drag & drop)"""
        data = request.json if request.is_json else {}
        items = data.get('items', [])
        
        if not items:
            return jsonify({'success': False, 'error': 'Thiếu dữ liệu'}), 400
        
        try:
            for item_data in items:
                category_id = item_data.get('id')
                new_order = item_data.get('order', 0)
                parent_id = item_data.get('parent_id')
                
                category = self.db_session.query(Category).filter(Category.id == category_id).first()
                if category:
                    category.order_display = new_order
                    if parent_id is not None:
                        # Kiểm tra không được set parent là chính nó
                        if parent_id == category_id:
                            continue
                        category.parent_id = int(parent_id) if parent_id else None
                    else:
                        category.parent_id = None
                    category.updated_at = datetime.utcnow()
            
            self.db_session.commit()
            
            return jsonify({
                'success': True,
                'message': 'Đã cập nhật thứ tự danh mục'
            })
        except Exception as e:
            self.db_session.rollback()
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500
    
    def api_international_menu_items(self):
        """API lấy danh sách international categories (menu items)"""
        categories = self.db_session.query(CategoryInternational).order_by(
            CategoryInternational.order_display, CategoryInternational.parent_id
        ).all()
        
        return jsonify({
            'success': True,
            'data': [{
                'id': item.id,
                'name': item.name,
                'slug': item.slug,
                'icon': item.icon,
                'order': item.order_display,
                'parent_id': item.parent_id,
                'level': item.level if hasattr(item, 'level') else 1,
                'visible': item.visible
            } for item in categories]
        })
    
    def api_create_international_menu_item(self):
        """API tạo international category mới (menu item)"""
        data = request.json if request.is_json else request.form
        
        name = data.get('name')
        slug = data.get('slug')
        icon = data.get('icon')
        order = data.get('order', 0)
        parent_id = data.get('parent_id')
        visible = data.get('visible', True)
        description = data.get('description')
        
        if not name:
            return jsonify({'success': False, 'error': 'Tên danh mục không được để trống'}), 400
        
        if not slug:
            # Tự động tạo slug
            slug = self._generate_slug(name)
        
        # Kiểm tra slug trùng
        existing = self.db_session.query(CategoryInternational).filter(CategoryInternational.slug == slug).first()
        if existing:
            return jsonify({'success': False, 'error': 'Slug đã tồn tại'}), 400
        
        # Tính toán level
        level = self._calculate_international_level(parent_id)
        
        # Kiểm tra level không được vượt quá 4
        if level > 4:
            return jsonify({'success': False, 'error': 'Không thể tạo menu quá 4 cấp. Menu hiện tại đã đạt cấp tối đa.'}), 400
        
        category = CategoryInternational(
            name=name,
            slug=slug,
            icon=icon if icon else None,
            order_display=order,
            parent_id=int(parent_id) if parent_id else None,
            level=level,
            visible=visible,
            description=description if description else None
        )
        
        self.db_session.add(category)
        self.db_session.commit()
        self.db_session.refresh(category)
        
        return jsonify({
            'success': True,
            'message': 'Đã tạo danh mục mới',
            'data': {
                'id': category.id,
                'name': category.name,
                'slug': category.slug,
                'level': category.level
            }
        })
    
    def api_update_international_menu_item(self, menu_id: int):
        """API cập nhật international category (menu item)"""
        category = self.db_session.query(CategoryInternational).filter(CategoryInternational.id == menu_id).first()
        if not category:
            return jsonify({'success': False, 'error': 'Không tìm thấy danh mục'}), 404
        
        data = request.json if request.is_json else request.form
        
        if 'name' in data:
            category.name = data['name']
        if 'slug' in data:
            # Kiểm tra slug trùng (trừ chính nó)
            existing = self.db_session.query(CategoryInternational).filter(
                CategoryInternational.slug == data['slug'],
                CategoryInternational.id != menu_id
            ).first()
            if existing:
                return jsonify({'success': False, 'error': 'Slug đã tồn tại'}), 400
            category.slug = data['slug']
        if 'icon' in data:
            category.icon = data['icon'] if data['icon'] else None
        if 'order' in data:
            category.order_display = int(data['order'])
        if 'parent_id' in data:
            parent_id = data['parent_id']
            # Kiểm tra không được set parent là chính nó
            if parent_id == menu_id:
                return jsonify({'success': False, 'error': 'Không thể set parent là chính nó'}), 400
            
            # Kiểm tra không được set parent là con cháu của chính nó (tránh vòng lặp)
            if parent_id:
                # Kiểm tra xem parent_id có phải là con cháu của menu_id không
                def is_descendant(parent_candidate_id, ancestor_id):
                    if parent_candidate_id == ancestor_id:
                        return True
                    parent_candidate = self.db_session.query(CategoryInternational).filter(CategoryInternational.id == parent_candidate_id).first()
                    if not parent_candidate or not parent_candidate.parent_id:
                        return False
                    return is_descendant(parent_candidate.parent_id, ancestor_id)
                
                if is_descendant(int(parent_id), menu_id):
                    return jsonify({'success': False, 'error': 'Không thể set parent là con cháu của chính nó'}), 400
            
            category.parent_id = int(parent_id) if parent_id else None
            
            # Tính toán lại level khi parent_id thay đổi
            new_level = self._calculate_international_level(category.parent_id)
            if new_level > 4:
                return jsonify({'success': False, 'error': 'Không thể tạo menu quá 4 cấp. Menu hiện tại đã đạt cấp tối đa.'}), 400
            category.level = new_level
        if 'visible' in data:
            category.visible = bool(data['visible'])
        if 'description' in data:
            category.description = data['description'] if data['description'] else None
        
        category.updated_at = datetime.utcnow()
        self.db_session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Đã cập nhật danh mục',
            'data': {
                'id': category.id,
                'name': category.name,
                'level': category.level
            }
        })
    
    def api_delete_international_menu_item(self, menu_id: int):
        """API xóa international category (menu item)"""
        category = self.db_session.query(CategoryInternational).filter(CategoryInternational.id == menu_id).first()
        if not category:
            return jsonify({'success': False, 'error': 'Không tìm thấy danh mục'}), 404
        
        # Kiểm tra xem có tin tức nào đang sử dụng category này không
        news_count = self.db_session.query(NewsInternational).filter(NewsInternational.category_id == menu_id).count()
        if news_count > 0:
            return jsonify({
                'success': False,
                'error': f'Không thể xóa danh mục vì có {news_count} tin tức đang sử dụng'
            }), 400
        
        # Xóa các category con trước (cascade)
        children = self.db_session.query(CategoryInternational).filter(CategoryInternational.parent_id == menu_id).all()
        for child in children:
            # Kiểm tra tin tức của child category
            child_news_count = self.db_session.query(NewsInternational).filter(NewsInternational.category_id == child.id).count()
            if child_news_count == 0:
                self.db_session.delete(child)
        
        self.db_session.delete(category)
        self.db_session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Đã xóa danh mục'
        })
    
    def _calculate_international_level(self, parent_id):
        """Tính toán level dựa trên parent_id cho international categories"""
        if not parent_id:
            return 1
        
        parent = self.db_session.query(CategoryInternational).filter(CategoryInternational.id == parent_id).first()
        if not parent:
            return 1
        
        return parent.level + 1
    
    def api_init_default_international_menu_items(self):
        """API khởi tạo international categories mặc định (menu items)"""
        # Kiểm tra xem đã có categories chưa
        count = self.db_session.query(CategoryInternational).count()
        if count > 0:
            return jsonify({
                'success': False,
                'error': 'Đã có categories trong database'
            }), 400
        
        # Sử dụng DEFAULT_CATEGORIES_EN từ database.py
        from database import DEFAULT_CATEGORIES_EN
        
        # Tạo categories (tạo parent trước)
        created_items = {}  # Map slug -> real_id
        
        # Tạo parent categories trước
        parent_categories = [c for c in DEFAULT_CATEGORIES_EN if c['parent_id'] is None]
        parent_categories.sort(key=lambda x: x['order_display'])
        
        for cat_data in parent_categories:
            category = CategoryInternational(
                name=cat_data['name'],
                slug=cat_data['slug'],
                icon=cat_data['icon'],
                order_display=cat_data['order_display'],
                parent_id=None,
                level=1,
                visible=True
            )
            self.db_session.add(category)
            self.db_session.flush()  # Để lấy ID
            created_items[cat_data['slug']] = category.id
        
        # Tạo child categories (nếu có trong DEFAULT_CATEGORIES_EN)
        child_categories = [c for c in DEFAULT_CATEGORIES_EN if c['parent_id'] is not None]
        child_categories.sort(key=lambda x: (x['parent_id'], x['order_display']))
        
        for cat_data in child_categories:
            # Tìm parent_id từ slug của parent
            parent_slug = None
            for parent_cat in DEFAULT_CATEGORIES_EN:
                if parent_cat.get('id') == cat_data['parent_id']:
                    parent_slug = parent_cat['slug']
                    break
            
            if parent_slug and parent_slug in created_items:
                parent_id = created_items[parent_slug]
                parent_category = self.db_session.query(CategoryInternational).filter(CategoryInternational.id == parent_id).first()
                level = parent_category.level + 1 if parent_category else 2
                
                category = CategoryInternational(
                    name=cat_data['name'],
                    slug=cat_data['slug'],
                    icon=cat_data['icon'],
                    order_display=cat_data['order_display'],
                    parent_id=parent_id,
                    level=level,
                    visible=True
                )
                self.db_session.add(category)
                self.db_session.flush()
                created_items[cat_data['slug']] = category.id
        
        self.db_session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Đã khởi tạo {len(DEFAULT_CATEGORIES_EN)} categories mặc định',
            'count': len(DEFAULT_CATEGORIES_EN)
        })
    
    def api_update_international_menu_order(self):
        """API cập nhật thứ tự international categories (drag & drop)"""
        data = request.json if request.is_json else {}
        items = data.get('items', [])
        
        if not items:
            return jsonify({'success': False, 'error': 'Thiếu dữ liệu'}), 400
        
        try:
            for item_data in items:
                category_id = item_data.get('id')
                new_order = item_data.get('order', 0)
                parent_id = item_data.get('parent_id')
                
                category = self.db_session.query(CategoryInternational).filter(CategoryInternational.id == category_id).first()
                if category:
                    category.order_display = new_order
                    if parent_id is not None:
                        # Kiểm tra không được set parent là chính nó
                        if parent_id == category_id:
                            continue
                        category.parent_id = int(parent_id) if parent_id else None
                        # Tính toán lại level
                        category.level = self._calculate_international_level(category.parent_id)
                    else:
                        category.parent_id = None
                        category.level = 1
                    category.updated_at = datetime.utcnow()
            
            self.db_session.commit()
            
            return jsonify({
                'success': True,
                'message': 'Đã cập nhật thứ tự danh mục'
            })
        except Exception as e:
            self.db_session.rollback()
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500

    def _allowed_file(self, filename):
        """Kiểm tra file có được phép upload không"""
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in current_app.config.get('ALLOWED_EXTENSIONS', {'png', 'jpg', 'jpeg', 'gif', 'webp'})

    def profile(self):
        """
        Trang thông tin cá nhân của user
        Route: GET /profile
        """
        print(f"=== DEBUG profile ===")
        print(f"Session: {session}")
        if 'user_id' not in session:
            flash('Vui lòng đăng nhập để xem thông tin cá nhân', 'error')
            return redirect(url_for('admin.login'))
        
        user = self.user_model.get_by_id(session['user_id'])
        if not user:
            flash('Không tìm thấy thông tin người dùng', 'error')
            session.clear()
            return redirect(url_for('admin.login'))
        
        # Lấy tin đã lưu
        saved_news = self.db_session.query(SavedNews).filter(
            SavedNews.user_id == user.id,
            (SavedNews.site == 'vn') | (SavedNews.site.is_(None))
        ).order_by(SavedNews.created_at.desc()).limit(20).all()
        
        # Lấy tin đã xem
        viewed_news = self.db_session.query(ViewedNews).filter(
            ViewedNews.user_id == user.id,
            (ViewedNews.site == 'vn') | (ViewedNews.site.is_(None))
        ).order_by(ViewedNews.viewed_at.desc()).limit(20).all()
        
        # Lấy bình luận
        comments = self.db_session.query(Comment).filter(
            Comment.user_id == user.id,
            (Comment.site == 'vn') | (Comment.site.is_(None))
        ).order_by(Comment.created_at.desc()).limit(20).all()
        
        # Tính số bình luận cho mỗi bài viết
        comment_counts = {}
        if comments:
            news_ids = list(set([comment.news_id for comment in comments]))
            from sqlalchemy import func
            counts = self.db_session.query(
                Comment.news_id,
                func.count(Comment.id).label('count')
            ).filter(
                Comment.news_id.in_(news_ids),
                Comment.is_active == True
            ).group_by(Comment.news_id).all()
            
            comment_counts = {news_id: count for news_id, count in counts}
        
        # Tính tổng số bình luận của cá nhân
        total_comments = self.db_session.query(Comment).filter(
            Comment.user_id == user.id,
            Comment.is_active == True
        ).count()

        categories = self.category_model.get_all()
        return render_template('admin/profile.html', 
                             user=user, 
                             categories=categories,
                             saved_news=saved_news,
                             viewed_news=viewed_news,
                             comments=comments,
                             comment_counts=comment_counts,
                             total_comments=total_comments)

class ClientController:
    """Quản lý các route của client"""
    
    def __init__(self):
        """Khởi tạo controller"""
        self.db_session = get_session()
        self.news_model = NewsModel(self.db_session)
        self.category_model = CategoryModel(self.db_session)
        self.user_model = UserModel(self.db_session)
        # Model cho tin tức quốc tế
        self.int_news_model = InternationalNewsModel(self.db_session)
        self.int_category_model = InternationalCategoryModel(self.db_session)
    
    def index(self):
        """
        Trang chủ - Hiển thị tin tức mới nhất và nổi bật
        Route: GET /
        """
        db_session = get_session()
        try:
            news_model = NewsModel(db_session)
            category_model = CategoryModel(db_session)
            
            featured_news = news_model.get_featured(limit=5)
            latest_news = news_model.get_published(limit=10)
            hot_news = news_model.get_hot(limit=5)
            categories = category_model.get_all()

            return render_template('client/vn/index.html',
                                 featured_news=featured_news,
                                 latest_news=latest_news,
                                 hot_news=hot_news,
                                 categories=categories)
        finally:
            db_session.close()
    
    def category(self, category_slug: str):
        """
        Trang danh mục - Hiển thị tin tức theo danh mục
        Route: GET /category/<category_slug>
        """
        db_session = get_session()
        try:
            print(f"=== DEBUG category ===")
            print(f"Category slug received: {category_slug}")
            
            category_model = CategoryModel(db_session)
            news_model = NewsModel(db_session)
            
            category = category_model.get_by_slug(category_slug)
            print(f"Category found: {category}")
            
            if not category:
                print("Category not found, aborting with 404")
                abort(404)
            
            page = request.args.get('page', 1, type=int)
            per_page = 20
            offset = (page - 1) * per_page
            
            print(f"Getting news for category_id={category.id}, page={page}")
            news_list = news_model.get_by_category(
                category_id=category.id,
                limit=per_page,
                offset=offset
            )
            print(f"Found {len(news_list)} news articles")

            categories = category_model.get_all()
            print(f"Total categories: {len(categories)}")

            return render_template('client/vn/category.html',
                                 category=category,
                                 news_list=news_list,
                                 page=page,
                                 categories=categories)
        except Exception as e:
            print(f"ERROR in category(): {str(e)}")
            print(f"Exception type: {type(e).__name__}")
            import traceback
            traceback.print_exc()
            db_session.rollback()
            abort(404)
        finally:
            db_session.close()
    
    def news_detail(self, news_slug: str):
        """
        Trang chi tiết bài viết
        Route: GET /news/<news_slug>
        """
        db_session = get_session()
        try:
            print(f"=== DEBUG news_detail ===")
            print(f"Slug received: {news_slug}")
            
            news_model = NewsModel(db_session)
            category_model = CategoryModel(db_session)
            
            news = news_model.get_by_slug(news_slug)
            print(f"News found: {news}")
            
            if not news:
                print(f"News not found for slug: {news_slug}")
                abort(404)
            
            print(f"News status: {news.status}")
            if news.status != NewsStatus.PUBLISHED:
                print(f"News not published, status: {news.status}")
                abort(404)
            
            # Lấy category của news dựa trên category_id
            category = category_model.get_by_id(news.category_id)
            
            # Tăng số lượt xem
            news_model.increment_view(news.id)
            
            # Xử lý cho user đã đăng nhập
            is_saved = False
            user_id = None
            if 'user_id' in session:
                user_id = session['user_id']
                # Lưu vào tin đã xem
                existing_viewed = db_session.query(ViewedNews).filter(
                    ViewedNews.user_id == user_id,
                    ViewedNews.news_id == news.id
                ).first()
                
                if not existing_viewed:
                    viewed_news = ViewedNews(
                        user_id=user_id,
                        news_id=news.id,
                        site='vn'
                    )
                    db_session.add(viewed_news)
                    db_session.commit()
                else:
                    # Cập nhật thời gian xem
                    existing_viewed.viewed_at = datetime.utcnow()
                    db_session.commit()
                
                # Kiểm tra xem tin đã được lưu chưa
                saved_news = db_session.query(SavedNews).filter(
                    SavedNews.user_id == user_id,
                    SavedNews.news_id == news.id
                ).first()
                is_saved = saved_news is not None
            
            # Lấy bình luận
            from sqlalchemy.orm import joinedload
            comments = db_session.query(Comment).options(
                joinedload(Comment.user)
            ).filter(
                Comment.news_id == news.id,
                Comment.is_active == True,
                Comment.parent_id == None  # Chỉ lấy comment gốc, không lấy reply
            ).order_by(Comment.created_at.desc()).all()
            
            # Lấy bài viết liên quan
            related_news = news_model.get_by_category(
                category_id=news.category_id,
                limit=5
            )
            related_news = [n for n in related_news if n.id != news.id][:5]
            
            categories = category_model.get_all()
            
            return render_template('client/vn/news_detail.html',
                                 news=news,
                                 category=category,
                                 related_news=related_news,
                                 categories=categories,
                                 is_saved=is_saved,
                                 comments=comments,
                                 user_id=user_id)
        except Exception as e:
            # Rollback nếu có lỗi database
            db_session.rollback()
            
            # Log lỗi
            import traceback
            print(f"Error in news_detail: {str(e)}")
            traceback.print_exc()
            
            # Trả về 404 thay vì 500 để user-friendly hơn
            abort(404)
        finally:
            db_session.close()
    
    def search(self):
        """
        Tìm kiếm tin tức
        Route: GET /search?q=<keyword>
        """
        db_session = get_session()
        try:
            keyword = request.args.get('q', '').strip()
            page = request.args.get('page', 1, type=int)
            
            news_model = NewsModel(db_session)
            category_model = CategoryModel(db_session)
            
            categories = category_model.get_all()
            
            if not keyword:
                return render_template('client/vn/search.html',
                                     keyword='',
                                     news_list=[],
                                     page=1,
                                     categories=categories)
            
            per_page = 20
            offset = (page - 1) * per_page
            
            news_list = news_model.search(keyword, limit=per_page + offset)
            news_list = news_list[offset:offset + per_page]
            
            return render_template('client/vn/search.html',
                                 keyword=keyword,
                                 news_list=news_list,
                                 page=page,
                                 categories=categories)
        finally:
            db_session.close()
    
    def api_latest_news(self):
        """
        API lấy tin tức mới nhất (JSON)
        Route: GET /api/latest-news
        """
        db_session = get_session()
        try:
            limit = request.args.get('limit', 10, type=int)
            offset = request.args.get('offset', 0, type=int)
            
            news_model = NewsModel(db_session)
            news_list = news_model.get_published(limit=limit, offset=offset)
            
            return jsonify({
                'success': True,
                'data': [self._news_to_dict(news) for news in news_list]
            })
        finally:
            db_session.close()
    
    def api_featured_news(self):
        """
        API lấy tin nổi bật (JSON)
        Route: GET /api/featured-news
        """
        db_session = get_session()
        try:
            limit = request.args.get('limit', 5, type=int)
            news_model = NewsModel(db_session)
            news_list = news_model.get_featured(limit=limit)
            
            return jsonify({
                'success': True,
                'data': [self._news_to_dict(news) for news in news_list]
            })
        finally:
            db_session.close()
    
    def api_hot_news(self):
        """
        API lấy tin nóng (JSON)
        Route: GET /api/hot-news
        """
        db_session = get_session()
        try:
            limit = request.args.get('limit', 5, type=int)
            news_model = NewsModel(db_session)
            news_list = news_model.get_hot(limit=limit)
        
            return jsonify({
                'success': True,
                'data': [self._news_to_dict(news) for news in news_list]
            })
        finally:
            db_session.close()
    
    def api_categories(self):
        """
        API lấy danh sách danh mục (JSON)
        Route: GET /api/categories
        """
        db_session = get_session()
        try:
            category_model = CategoryModel(db_session)
            categories = category_model.get_all()
            
            return jsonify({
                'success': True,
                'data': [self._category_to_dict(cat) for cat in categories]
            })
        finally:
            db_session.close()
    
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
    
    def user_login(self):
        """
        Trang đăng nhập cho user
        Route: GET /login
        Route: POST /login
        """
        categories = self.category_model.get_all()
        
        if request.method == 'POST':
            username = request.form.get('username')
            password = request.form.get('password')
            
            user = self.user_model.authenticate(username, password)
            
            if user and user.is_active and user.role == UserRole.USER:
                session['user_id'] = user.id
                session['username'] = user.username
                session['full_name'] = user.full_name or user.username
                session['role'] = user.role.value
                
                flash('Đăng nhập thành công', 'success')
                return redirect(url_for('client.index'))
            else:
                flash('Tên đăng nhập hoặc mật khẩu không đúng', 'error')
        
        return render_template('client/login.html', categories=categories)
    
    def register(self):
        """
        Trang đăng ký cho user
        Route: GET /register
        Route: POST /register
        """
        categories = self.category_model.get_all()
        
        if request.method == 'POST':
            username = request.form.get('username', '').strip()
            email = request.form.get('email', '').strip()
            password = request.form.get('password', '')
            confirm_password = request.form.get('confirm_password', '')
            full_name = request.form.get('full_name', '').strip()
            phone = request.form.get('phone', '').strip()
            
            from auth_utils import validate_email, validate_password, validate_phone
            
            # Validation
            errors = []
            
            # Validate username
            if not username:
                errors.append('Tên đăng nhập không được để trống')
            elif len(username) < 3:
                errors.append('Tên đăng nhập phải có ít nhất 3 ký tự')
            elif self.user_model.get_by_username(username):
                errors.append('Tên đăng nhập đã tồn tại')
            
            # Validate email
            if not validate_email(email):
                errors.append('Email không đúng định dạng')
            elif self.user_model.get_by_email(email):
                errors.append('Email đã được sử dụng')
            
            # Validate phone
            phone_valid, phone_error = validate_phone(phone)
            if not phone_valid:
                errors.append(phone_error)
            
            # Validate password
            password_valid, password_error = validate_password(password)
            if not password_valid:
                errors.append(password_error)
            elif password != confirm_password:
                errors.append('Mật khẩu xác nhận không khớp')
            
            if errors:
                for error in errors:
                    flash(error, 'error')
            else:
                try:
                    # Clean phone number
                    phone_clean = phone.replace(' ', '').replace('-', '').replace('(', '').replace(')', '')
                    
                    user = self.user_model.create(
                        username=username,
                        email=email,
                        password=password,
                        full_name=full_name if full_name else None,
                        phone=phone_clean,
                        role=UserRole.USER
                    )
                    
                    flash('Đăng ký thành công! Vui lòng đăng nhập', 'success')
                    return redirect(url_for('client.user_login'))
                except Exception as e:
                    flash('Có lỗi xảy ra khi đăng ký. Vui lòng thử lại', 'error')
        
        return render_template('client/register.html', categories=categories)
    
    def user_logout(self):
        """Đăng xuất user"""
        session.clear()
        flash('Đã đăng xuất', 'success')
        site = request.path.split('/')[1]
        return redirect(url_for(f'client.{site}_index'))
    
    def profile(self):
        """
        Trang thông tin cá nhân của user
        Route: GET /profile
        """
        if 'user_id' not in session:
            flash('Vui lòng đăng nhập để xem thông tin cá nhân', 'error')
            return redirect(url_for('client.user_login'))
        
        user = self.user_model.get_by_id(session['user_id'])
        if not user:
            flash('Không tìm thấy thông tin người dùng', 'error')
            session.clear()
            return redirect(url_for('client.user_login'))
        
        # Lấy tin đã lưu
        saved_news = self.db_session.query(SavedNews).filter(
            SavedNews.user_id == user.id,
            (SavedNews.site == 'vn') | (SavedNews.site.is_(None))
        ).order_by(SavedNews.created_at.desc()).limit(20).all()
        
        # Lấy tin đã xem
        viewed_news = self.db_session.query(ViewedNews).filter(
            ViewedNews.user_id == user.id,
            (ViewedNews.site == 'vn') | (ViewedNews.site.is_(None))
        ).order_by(ViewedNews.viewed_at.desc()).limit(20).all()
        
        # Lấy bình luận
        comments = self.db_session.query(Comment).filter(
            Comment.user_id == user.id,
            (Comment.site == 'vn') | (Comment.site.is_(None))
        ).order_by(Comment.created_at.desc()).limit(20).all()
        
        # Tính số bình luận cho mỗi bài viết
        comment_counts = {}
        if comments:
            news_ids = list(set([comment.news_id for comment in comments]))
            from sqlalchemy import func
            counts = self.db_session.query(
                Comment.news_id,
                func.count(Comment.id).label('count')
            ).filter(
                Comment.news_id.in_(news_ids),
                Comment.is_active == True
            ).group_by(Comment.news_id).all()
            
            comment_counts = {news_id: count for news_id, count in counts}
        
        # Tính tổng số bình luận của cá nhân
        total_comments = self.db_session.query(Comment).filter(
            Comment.user_id == user.id,
            Comment.is_active == True
        ).count()

        categories = self.category_model.get_all()
        return render_template('client/profile.html', 
                             user=user, 
                             categories=categories,
                             saved_news=saved_news,
                             viewed_news=viewed_news,
                             comments=comments,
                             comment_counts=comment_counts,
                             total_comments=total_comments)
    
    def update_profile(self):
        """
        Cập nhật thông tin cá nhân, avatar, hoặc đổi mật khẩu
        Route: POST /profile/update
        """
        if 'user_id' not in session:
            if request.is_json:
                return jsonify({'success': False, 'message': 'Vui lòng đăng nhập'}), 401
            flash('Vui lòng đăng nhập', 'error')
            return redirect(url_for('client.user_login'))
        
        user = self.user_model.get_by_id(session['user_id'])
        if not user:
            if request.is_json:
                return jsonify({'success': False, 'message': 'Không tìm thấy người dùng'}), 404
            flash('Không tìm thấy thông tin người dùng', 'error')
            session.clear()
            return redirect(url_for('client.user_login'))
        
        action = request.form.get('action')
        
        if action == 'update_avatar':
            # Xử lý upload avatar
            if 'avatar' not in request.files:
                return jsonify({'success': False, 'message': 'Không có file được chọn'}), 400
            
            file = request.files['avatar']
            if file.filename == '':
                return jsonify({'success': False, 'message': 'Không có file được chọn'}), 400
            
            if file and self._allowed_file(file.filename):
                filename = secure_filename(f"avatar_{user.id}_{file.filename}")
                # Tạo đường dẫn upload folder
                upload_folder = os.path.join('src', 'static', 'uploads', 'avatars')
                os.makedirs(upload_folder, exist_ok=True)
                filepath = os.path.join(upload_folder, filename)
                file.save(filepath)
                
                # Xóa avatar cũ nếu có
                if user.avatar:
                    old_path = user.avatar.lstrip('/')
                    old_path = os.path.join('src', old_path) if not old_path.startswith('src') else old_path
                    if os.path.exists(old_path):
                        try:
                            os.remove(old_path)
                        except:
                            pass
                
                # Lưu đường dẫn avatar (relative to static folder)
                avatar_url = f"static/uploads/avatars/{filename}"
                user.avatar = avatar_url
                self.db_session.commit()
                
                # Cập nhật session
                session['avatar'] = avatar_url
                
                return jsonify({'success': True, 'message': 'Cập nhật avatar thành công', 'avatar_url': f'/{avatar_url}'})
            else:
                return jsonify({'success': False, 'message': 'File không hợp lệ. Chỉ chấp nhận: png, jpg, jpeg, gif, webp'}), 400
        
        elif action == 'update_info':
            # Cập nhật thông tin cá nhân
            full_name = request.form.get('full_name', '').strip()
            email = request.form.get('email', '').strip()
            phone = request.form.get('phone', '').strip()
            
            # Kiểm tra email trùng
            if email and email != user.email:
                existing_user = self.user_model.get_by_email(email)
                if existing_user and existing_user.id != user.id:
                    flash('Email này đã được sử dụng', 'error')
                    return redirect(url_for('client.profile'))
            
            user.full_name = full_name if full_name else None
            user.email = email
            user.phone = phone if phone else None
            self.db_session.commit()
            
            # Cập nhật session
            session['full_name'] = user.full_name or user.username
            
            flash('Cập nhật thông tin thành công', 'success')
            return redirect(url_for('client.profile'))
        
        elif action == 'change_password':
            # Đổi mật khẩu
            from auth_utils import verify_password, hash_password
            
            current_password = request.form.get('current_password')
            new_password = request.form.get('new_password')
            confirm_password = request.form.get('confirm_password')
            
            if not verify_password(user.password_hash, current_password):
                flash('Mật khẩu hiện tại không đúng', 'error')
                return redirect(url_for('client.profile'))
            
            if new_password != confirm_password:
                flash('Mật khẩu mới và xác nhận không khớp', 'error')
                return redirect(url_for('client.profile'))
            
            if len(new_password) < 6:
                flash('Mật khẩu phải có ít nhất 6 ký tự', 'error')
                return redirect(url_for('client.profile'))
            
            user.password_hash = hash_password(new_password)
            self.db_session.commit()
            
            flash('Đổi mật khẩu thành công', 'success')
            return redirect(url_for('client.profile'))
        
        flash('Hành động không hợp lệ', 'error')
        return redirect(url_for('client.profile'))
    
    def _allowed_file(self, filename):
        """Kiểm tra file có được phép upload không"""
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in current_app.config.get('ALLOWED_EXTENSIONS', {'png', 'jpg', 'jpeg', 'gif', 'webp'})
    
    def save_news(self, news_id: int):
        """
        API lưu/bỏ lưu tin tức
        Route: POST /api/save-news/<news_id>
        """
        if 'user_id' not in session:
            return jsonify({'success': False, 'message': 'Vui lòng đăng nhập'}), 401
        
        user_id = session['user_id']
        news = self.news_model.get_by_id(news_id)
        
        if not news:
            return jsonify({'success': False, 'message': 'Không tìm thấy tin tức'}), 404
        
        # Kiểm tra xem đã lưu chưa
        saved_news = self.db_session.query(SavedNews).filter(
            SavedNews.user_id == user_id,
            SavedNews.news_id == news_id
        ).first()
        
        if saved_news:
            # Bỏ lưu
            self.db_session.delete(saved_news)
            self.db_session.commit()
            return jsonify({'success': True, 'message': 'Đã bỏ lưu tin tức', 'is_saved': False})
        else:
            # Lưu
            new_saved = SavedNews(
                user_id=user_id,
                news_id=news_id,
                site='vn'
            )
            self.db_session.add(new_saved)
            self.db_session.commit()
            return jsonify({'success': True, 'message': 'Đã lưu tin tức', 'is_saved': True})
    
    def submit_comment(self, news_id: int):
        """
        API gửi bình luận
        Route: POST /api/comment/<news_id>
        """
        if 'user_id' not in session:
            return jsonify({'success': False, 'message': 'Vui lòng đăng nhập để bình luận'}), 401
        
        user_id = session['user_id']
        news = self.news_model.get_by_id(news_id)
        
        if not news:
            return jsonify({'success': False, 'message': 'Không tìm thấy tin tức'}), 404
        
        content = request.json.get('content', '').strip() if request.is_json else request.form.get('content', '').strip()
        parent_id = request.json.get('parent_id') if request.is_json else request.form.get('parent_id')
        
        if not content:
            return jsonify({'success': False, 'message': 'Vui lòng nhập nội dung bình luận'}), 400
        
        if len(content) > 1000:
            return jsonify({'success': False, 'message': 'Bình luận không được vượt quá 1000 ký tự'}), 400
        
        # Tạo bình luận
        comment = Comment(
            user_id=user_id,
            news_id=news_id,
            content=content,
            parent_id=int(parent_id) if parent_id else None,
            site='vn',
            is_active=True
        )
        self.db_session.add(comment)
        self.db_session.commit()
        self.db_session.refresh(comment)
        
        # Lấy thông tin user để trả về
        user = self.user_model.get_by_id(user_id)
        
        return jsonify({
            'success': True,
            'message': 'Bình luận đã được gửi',
            'comment': {
                'id': comment.id,
                'content': comment.content,
                'created_at': comment.created_at.strftime('%d/%m/%Y %H:%M'),
                'user': {
                    'full_name': user.full_name or user.username,
                    'avatar': user.avatar
                }
            }
        })

    def en_index(self):
        """Trang chủ quốc tế viết bằng tiếng Anh - sử dụng bảng NewsInternational"""
        featured_news = self.int_news_model.get_featured(limit=5)
        latest_news = self.int_news_model.get_published(limit=10)
        hot_news = self.int_news_model.get_hot(limit=5)
        categories = self.int_category_model.get_all()

        return render_template(
            'client/en/index.html',
            featured_news=featured_news,
            latest_news=latest_news,
            hot_news=hot_news,
            categories=categories,
        )

    def en_category(self, category_slug: str):
        """Trang danh mục quốc tế viết bằng tiếng Anh"""
        category = self.int_category_model.get_by_slug(category_slug)
        if not category:
            abort(404)

        page = request.args.get('page', 1, type=int)
        per_page = 20
        offset = (page - 1) * per_page

        news_list = self.int_news_model.get_by_category(
            category_id=category.id,
            limit=per_page,
            offset=offset,
        )

        categories = self.int_category_model.get_all()

        return render_template(
            'client/en/category.html',
            category=category,
            news_list=news_list,
            page=page,
            categories=categories,
        )

    def en_news_detail(self, news_slug: str):
        """Trang chi tiết bài viết quốc tế (tiếng Anh)"""
        news = self.int_news_model.get_by_slug(news_slug)
        if not news or news.status != NewsStatus.PUBLISHED:
            abort(404)

        category = self.int_category_model.get_by_id(news.category_id)

        # Tăng lượt xem
        news.view_count += 1
        self.db_session.commit()

        # Bài viết liên quan trong cùng danh mục
        related_news = self.int_news_model.get_by_category(
            category_id=news.category_id,
            limit=5,
        )
        related_news = [n for n in related_news if n.id != news.id][:5]

        categories = self.int_category_model.get_all()

        return render_template(
            'client/en/news_detail.html',
            news=news,
            category=category,
            related_news=related_news,
            categories=categories,
        )

    def en_search(self):
        """Tìm kiếm tin tức quốc tế (tiếng Anh)"""
        keyword = request.args.get('q', '').strip()
        page = request.args.get('page', 1, type=int)
        categories = self.int_category_model.get_all()

        if not keyword:
            return render_template(
                'client/en/search.html',
                keyword='',
                news_list=[],
                page=1,
                categories=categories,
            )

        per_page = 20
        offset = (page - 1) * per_page

        # Tìm kiếm đơn giản theo title/summary/content
        from sqlalchemy import or_

        query = self.db_session.query(NewsInternational).filter(
            NewsInternational.status == NewsStatus.PUBLISHED,
            or_(
                NewsInternational.title.ilike(f'%{keyword}%'),
                NewsInternational.summary.ilike(f'%{keyword}%'),
                NewsInternational.content.ilike(f'%{keyword}%'),
            ),
        ).order_by(NewsInternational.created_at.desc())

        news_list = query.limit(per_page + offset).all()
        news_list = news_list[offset:offset + per_page]

        return render_template(
            'client/en/search.html',
            keyword=keyword,
            news_list=news_list,
            page=page,
            categories=categories,
        )

    def en_api_latest_news(self):
        """API lấy tin tức quốc tế mới nhất (tiếng Anh)"""
        limit = request.args.get('limit', 10, type=int)
        offset = request.args.get('offset', 0, type=int)

        news_list = self.int_news_model.get_published(limit=limit, offset=offset)

        return jsonify({
            'success': True,
            'data': [self._news_to_dict(news) for news in news_list],
        })

    def en_api_featured_news(self):
        """API lấy tin quốc tế nổi bật (tiếng Anh)"""
        limit = request.args.get('limit', 5, type=int)
        news_list = self.int_news_model.get_featured(limit=limit)

        return jsonify({
            'success': True,
            'data': [self._news_to_dict(news) for news in news_list],
        })

    def en_api_hot_news(self):
        """API lấy tin quốc tế nóng (tiếng Anh)"""
        limit = request.args.get('limit', 5, type=int)
        news_list = self.int_news_model.get_hot(limit=limit)

        return jsonify({
            'success': True,
            'data': [self._news_to_dict(news) for news in news_list],
        })

    def en_api_categories(self):
        """API lấy danh sách danh mục quốc tế (tiếng Anh)"""
        categories = self.int_category_model.get_all()

        return jsonify({
            'success': True,
            'data': [self._category_to_dict(cat) for cat in categories],
        })

    def en_api_article_detail(self, article_id: int):
        """API lấy chi tiết bài viết quốc tế (tiếng Anh)"""
        article = self.db_session.query(NewsInternational).filter(
            NewsInternational.id == article_id
        ).first()

        if not article:
            return jsonify({
                'success': False,
                'message': 'Article not found',
            }), 404

        return jsonify({
            'success': True,
            'data': {
                'id': article.id,
                'title': article.title,
                'slug': article.slug,
                'summary': article.summary or '',
                'content': article.content or '',
                'thumbnail': article.thumbnail or '',
                'category': article.category.name if article.category else 'N/A',
                'category_id': article.category_id,
                'status': article.status.value,
                'created_at': article.created_at.strftime('%d/%m/%Y %H:%M') if article.created_at else '',
                'published_at': article.published_at.strftime('%d/%m/%Y %H:%M') if article.published_at else '',
                'updated_at': article.updated_at.strftime('%d/%m/%Y %H:%M') if article.updated_at else '',
                'view_count': article.view_count,
                'is_featured': article.is_featured,
                'is_hot': article.is_hot,
            },
        })


class ClientControllerCommon:

    """Quản lý các route chung của client"""
    def __init__(self): 
        """Khởi tạo controller"""

    def _init_models(self, site: str):
        self.db_session = get_session()
        if site == 'en':
            self.news_model = InternationalNewsModel(self.db_session)
            self.category_model = InternationalCategoryModel(self.db_session)
        else:
            self.news_model = NewsModel(self.db_session)
            self.category_model = CategoryModel(self.db_session)

    def getDictCommon(self):
        """Lấy dictionary chung"""
        return {
            'categories': self.category_model.get_all(),
            'featured_news': self.news_model.get_featured(limit=5),
            'latest_news': self.news_model.get_published(limit=10),
            'hot_news': self.news_model.get_hot(limit=5),
        }

    def _get_site(self):
        """Lấy site từ đường dẫn"""
        return request.path.split('/')[1]

    def contact(self):
        """Trang liên hệ"""
        site = self._get_site()
        self._init_models(site)
        if site == 'en':
            return render_template('client/en/contact.html', **self.getDictCommon())
        else:
            return render_template('client/vn/contact.html', **self.getDictCommon())
    
    def guide(self):
        """Trang hướng dẫn"""
        site = self._get_site()
        self._init_models(site)
        if site == 'en':
            return render_template('client/en/guide.html', **self.getDictCommon())
        else:
            return render_template('client/vn/guide.html', **self.getDictCommon())
    
    def introducing(self):
        """Trang giới thiệu"""
        site = self._get_site()
        self._init_models(site)
        if site == 'en':
            return render_template('client/en/introducing.html', **self.getDictCommon())
        else:
            return render_template('client/vn/introducing.html', **self.getDictCommon())
    
    def security(self):
        """Trang chính sách bảo mật"""
        site = self._get_site()
        self._init_models(site)
        if site == 'en':
            return render_template('client/en/security.html', **self.getDictCommon())
        else:
            return render_template('client/vn/security.html', **self.getDictCommon())
    
    def term_of_service(self):
        """Trang điều khoản sử dụng"""
        site = self._get_site()
        self._init_models(site)
        if site == 'en':
            return render_template('client/en/term_of_service.html', **self.getDictCommon())
        else:
            return render_template('client/vn/term_of_service.html', **self.getDictCommon())