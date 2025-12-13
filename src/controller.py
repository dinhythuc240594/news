from flask import Blueprint, render_template, request, jsonify, abort, redirect, url_for, flash, session
from sqlalchemy.orm import Session
from typing import Optional
from functools import wraps
from database import get_session, NewsStatus, UserRole
from models import NewsModel, CategoryModel, UserModel

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
    
    def login(self):
        """
        Trang đăng nhập admin
        Route: GET /admin/login
        Route: POST /admin/login
        """
        if request.method == 'POST':
            username = request.form.get('username')
            password = request.form.get('password')
            
            user = self.user_model.authenticate(username, password)
            
            if user and user.is_active and user.role in [UserRole.ADMIN, UserRole.EDITOR]:
                session['user_id'] = user.id
                session['username'] = user.username
                session['role'] = user.role.value
                
                flash('Đăng nhập thành công', 'success')
                
                if user.role == UserRole.ADMIN:
                    return redirect(url_for('admin.dashboard'))
                else:
                    return redirect(url_for('admin.editor_dashboard'))
            else:
                flash('Tên đăng nhập hoặc mật khẩu không đúng', 'error')
        
        return render_template('admin/login.html')
    
    def logout(self):
        """Đăng xuất"""
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
        
        return render_template('admin/dashboard.html',
                             total_news=total_news,
                             published_news=published_news,
                             pending_news=pending_news,
                             draft_news=draft_news,
                             pending_list=pending_list,
                             latest_news=latest_news)
    
    def editor_dashboard(self):
        """
        Dashboard editor - Quản lý bài viết của biên tập viên
        Route: GET /admin/editor-dashboard
        """
        user_id = session.get('user_id')
        
        # Lấy bài viết của editor
        all_news = self.news_model.get_all()
        my_news = [n for n in all_news if n.created_by == user_id]
        
        draft_news = [n for n in my_news if n.status == NewsStatus.DRAFT]
        pending_news = [n for n in my_news if n.status == NewsStatus.PENDING]
        published_news = [n for n in my_news if n.status == NewsStatus.PUBLISHED]
        
        return render_template('admin/editor-dashboard.html',
                             draft_news=draft_news,
                             pending_news=pending_news,
                             published_news=published_news)
    
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
        news = self.news_model.reject(news_id, user_id)
        
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
    
    def _news_to_dict(self, news) -> dict:
        """Chuyển đổi News object thành dictionary"""
        return {
            'id': news.id,
            'title': news.title,
            'slug': news.slug,
            'status': news.status.value,
            'category': {
                'id': news.category.id,
                'name': news.category.name
            },
            'created_by': news.creator.username if news.creator else None,
            'approved_by': news.approver.username if news.approver else None,
            'created_at': news.created_at.isoformat(),
            'published_at': news.published_at.isoformat() if news.published_at else None
        }


class ClientController:
    """Quản lý các route của client"""
    
    def __init__(self):
        self.db_session = get_session()
        self.news_model = NewsModel(self.db_session)
        self.category_model = CategoryModel(self.db_session)
        self.user_model = UserModel(self.db_session)
    
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
        
        # Lấy category của news dựa trên category_id
        category = self.category_model.get_by_id(news.category_id)
        
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
                             category=category,
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
        return redirect(url_for('client.index'))