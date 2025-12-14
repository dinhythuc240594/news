from flask import Blueprint, render_template, request, jsonify, abort, redirect, url_for, flash, session, current_app
from sqlalchemy.orm import Session
from typing import Optional
from functools import wraps
import os
from datetime import datetime
from werkzeug.utils import secure_filename
from database import get_session, NewsStatus, UserRole, SavedNews, ViewedNews, Comment, MenuItem, News, Category
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
        """API lấy danh sách bài viết quốc tế (đã duyệt)"""
        # Giả sử bài quốc tế có category với slug 'international' hoặc 'the-gioi'
        from sqlalchemy import or_
        articles = self.db_session.query(News).join(Category).filter(
            News.status == NewsStatus.PUBLISHED,
            or_(
                Category.slug.ilike('%international%'),
                Category.slug.ilike('%the-gioi%'),
                Category.slug.ilike('%world%')
            )
        ).order_by(News.published_at.desc()).limit(100).all()
        
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
        """API lấy danh sách bài viết quốc tế chờ duyệt"""
        from sqlalchemy import or_
        articles = self.db_session.query(News).join(Category).filter(
            News.status == NewsStatus.PENDING,
            or_(
                Category.slug.ilike('%international%'),
                Category.slug.ilike('%the-gioi%'),
                Category.slug.ilike('%world%')
            )
        ).order_by(News.created_at.desc()).limit(100).all()
        
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
        """API lấy bài viết mới từ API bên ngoài (chỉ lấy dữ liệu, không lưu)"""
        import requests
        from datetime import datetime, timedelta
        
        try:
            # Lấy thông tin từ request
            data = request.json if request.is_json else {}
            api_key = data.get('api_key')
            api_url = data.get('api_url', 'https://newsapi.org/v2/top-headlines')
            country = data.get('country', '')
            category = data.get('category', '')
            limit = data.get('limit', 20)
            start_date = data.get('start_date')
            end_date = data.get('end_date')
            
            articles = []
            
            # Nếu có API key và URL, fetch từ API thật
            if api_key and api_url:
                try:
                    # Ví dụ với NewsAPI.org
                    params = {
                        'apiKey': api_key
                    }
                    if country:
                        params['country'] = country
                    if category:
                        params['category'] = category
                    if limit:
                        params['pageSize'] = min(limit, 100)  # Max 100 per request
                    
                    # Nếu có ngày, sử dụng everything endpoint
                    if start_date or end_date:
                        api_url = 'https://newsapi.org/v2/everything'
                        if start_date:
                            params['from'] = start_date
                        if end_date:
                            params['to'] = end_date
                        if not category and not country:
                            params['q'] = 'news'  # Default query
                    
                    response = requests.get(api_url, params=params, timeout=10)
                    if response.status_code == 200:
                        api_data = response.json()
                        articles = api_data.get('articles', [])
                    elif response.status_code == 401:
                        return jsonify({
                            'success': False,
                            'error': 'API key không hợp lệ hoặc đã hết hạn'
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
            
            # Nếu không có API key hoặc không fetch được, dùng mock data
            if not articles:
                # Tạo mock data với số lượng và ngày tháng phù hợp
                mock_count = min(limit, 50)
                articles = []
                base_date = datetime.utcnow()
                
                for i in range(mock_count):
                    published_date = base_date - timedelta(days=i % 7, hours=i % 24)
                    if start_date:
                        try:
                            start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
                            if published_date < start_dt:
                                continue
                        except:
                            pass
                    if end_date:
                        try:
                            end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
                            if published_date > end_dt:
                                continue
                        except:
                            pass
                    
                    sources = ['TechCrunch', 'Reuters', 'ESPN', 'BBC', 'CNN', 'The Guardian']
                    categories_list = ['Technology', 'Business', 'Sports', 'Entertainment', 'Health', 'Science']
                    authors_list = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Williams', 'David Brown']
                    
                    articles.append({
                        'title': f'Breaking News {i+1}: Major development in {categories_list[i % len(categories_list)]}',
                        'description': f'This is a detailed description of the news article number {i+1}...',
                        'url': f'https://example.com/news{i+1}',
                        'urlToImage': f'https://via.placeholder.com/400x300?text=News+{i+1}',
                        'source': {'name': sources[i % len(sources)]},
                        'author': authors_list[i % len(authors_list)],
                        'publishedAt': published_date.isoformat(),
                        'content': f'Full content of article {i+1}. This is a comprehensive news article covering important topics...'
                    })
            
            # Format dữ liệu để trả về
            formatted_articles = []
            for idx, article in enumerate(articles):
                source_name = article.get('source', {}).get('name', 'Unknown') if isinstance(article.get('source'), dict) else str(article.get('source', 'Unknown'))
                published_at = article.get('publishedAt', datetime.utcnow().isoformat())
                
                formatted_articles.append({
                    'id': f'api_{idx}_{datetime.utcnow().timestamp()}',  # Temporary ID
                    'title': article.get('title', 'No title'),
                    'summary': article.get('description', ''),
                    'content': article.get('content', article.get('description', '')),
                    'thumbnail': article.get('urlToImage', ''),
                    'source': source_name,
                    'source_url': article.get('url', ''),
                    'author': article.get('author', 'Unknown'),
                    'published_at': published_at,
                    'category_name': category or 'General'
                })
            
            # Lưu vào session để sử dụng sau (tạm thời)
            session['api_articles_cache'] = formatted_articles
            
            return jsonify({
                'success': True,
                'message': f'Đã lấy {len(formatted_articles)} bài viết từ API',
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
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'success': False, 'error': 'Chưa đăng nhập'}), 401
        
        data = request.json if request.is_json else request.form
        
        # Lấy dữ liệu bài viết từ request
        article_data = data.get('article')
        if not article_data:
            return jsonify({'success': False, 'error': 'Thiếu dữ liệu bài viết'}), 400
        
        # Lấy thông tin từ request
        category_id = data.get('category_id', type=int)
        status = data.get('status', NewsStatus.DRAFT.value)
        
        if not category_id:
            return jsonify({'success': False, 'error': 'Vui lòng chọn danh mục'}), 400
        
        try:
            news_status = NewsStatus(status)
        except ValueError:
            news_status = NewsStatus.DRAFT
        
        # Kiểm tra category tồn tại
        category = self.db_session.query(Category).filter(Category.id == category_id).first()
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
        
        self.db_session.add(news)
        self.db_session.commit()
        self.db_session.refresh(news)
        
        return jsonify({
            'success': True,
            'message': f'Đã lưu bài viết với trạng thái {news_status.value}',
            'news_id': news.id
        })
    
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
    
    def _generate_slug(self, title: str) -> str:
        """Tạo slug từ tiêu đề"""
        import re
        slug = title.lower()
        slug = re.sub(r'[^\w\s-]', '', slug)
        slug = re.sub(r'[-\s]+', '-', slug)
        return slug.strip('-')
    
    def api_menu_items(self):
        """API lấy danh sách menu items"""
        menu_items = self.db_session.query(MenuItem).order_by(
            MenuItem.order_display, MenuItem.parent_id
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
                'visible': item.visible
            } for item in menu_items]
        })
    
    def api_create_menu_item(self):
        """API tạo menu item mới"""
        data = request.json if request.is_json else request.form
        
        name = data.get('name')
        slug = data.get('slug')
        icon = data.get('icon')
        order = data.get('order', 0)
        parent_id = data.get('parent_id')
        visible = data.get('visible', True)
        
        if not name:
            return jsonify({'success': False, 'error': 'Tên menu không được để trống'}), 400
        
        if not slug:
            # Tự động tạo slug
            slug = self._generate_slug(name)
        
        # Kiểm tra slug trùng
        existing = self.db_session.query(MenuItem).filter(MenuItem.slug == slug).first()
        if existing:
            return jsonify({'success': False, 'error': 'Slug đã tồn tại'}), 400
        
        menu_item = MenuItem(
            name=name,
            slug=slug,
            icon=icon if icon else None,
            order_display=order,
            parent_id=int(parent_id) if parent_id else None,
            visible=visible
        )
        
        self.db_session.add(menu_item)
        self.db_session.commit()
        self.db_session.refresh(menu_item)
        
        return jsonify({
            'success': True,
            'message': 'Đã tạo menu mới',
            'data': {
                'id': menu_item.id,
                'name': menu_item.name,
                'slug': menu_item.slug
            }
        })
    
    def api_update_menu_item(self, menu_id: int):
        """API cập nhật menu item"""
        menu_item = self.db_session.query(MenuItem).filter(MenuItem.id == menu_id).first()
        if not menu_item:
            return jsonify({'success': False, 'error': 'Không tìm thấy menu'}), 404
        
        data = request.json if request.is_json else request.form
        
        if 'name' in data:
            menu_item.name = data['name']
        if 'slug' in data:
            # Kiểm tra slug trùng (trừ chính nó)
            existing = self.db_session.query(MenuItem).filter(
                MenuItem.slug == data['slug'],
                MenuItem.id != menu_id
            ).first()
            if existing:
                return jsonify({'success': False, 'error': 'Slug đã tồn tại'}), 400
            menu_item.slug = data['slug']
        if 'icon' in data:
            menu_item.icon = data['icon'] if data['icon'] else None
        if 'order' in data:
            menu_item.order_display = int(data['order'])
        if 'parent_id' in data:
            parent_id = data['parent_id']
            # Kiểm tra không được set parent là chính nó
            if parent_id == menu_id:
                return jsonify({'success': False, 'error': 'Không thể set parent là chính nó'}), 400
            menu_item.parent_id = int(parent_id) if parent_id else None
        if 'visible' in data:
            menu_item.visible = bool(data['visible'])
        
        menu_item.updated_at = datetime.utcnow()
        self.db_session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Đã cập nhật menu',
            'data': {
                'id': menu_item.id,
                'name': menu_item.name
            }
        })
    
    def api_delete_menu_item(self, menu_id: int):
        """API xóa menu item"""
        menu_item = self.db_session.query(MenuItem).filter(MenuItem.id == menu_id).first()
        if not menu_item:
            return jsonify({'success': False, 'error': 'Không tìm thấy menu'}), 404
        
        # Xóa các menu con trước (cascade)
        children = self.db_session.query(MenuItem).filter(MenuItem.parent_id == menu_id).all()
        for child in children:
            self.db_session.delete(child)
        
        self.db_session.delete(menu_item)
        self.db_session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Đã xóa menu'
        })


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
        
        # Xử lý cho user đã đăng nhập
        is_saved = False
        user_id = None
        if 'user_id' in session:
            user_id = session['user_id']
            # Lưu vào tin đã xem
            existing_viewed = self.db_session.query(ViewedNews).filter(
                ViewedNews.user_id == user_id,
                ViewedNews.news_id == news.id
            ).first()
            
            if not existing_viewed:
                viewed_news = ViewedNews(
                    user_id=user_id,
                    news_id=news.id
                )
                self.db_session.add(viewed_news)
                self.db_session.commit()
            else:
                # Cập nhật thời gian xem
                existing_viewed.viewed_at = datetime.utcnow()
                self.db_session.commit()
            
            # Kiểm tra xem tin đã được lưu chưa
            saved_news = self.db_session.query(SavedNews).filter(
                SavedNews.user_id == user_id,
                SavedNews.news_id == news.id
            ).first()
            is_saved = saved_news is not None
        
        # Lấy bình luận
        from sqlalchemy.orm import joinedload
        comments = self.db_session.query(Comment).options(
            joinedload(Comment.user)
        ).filter(
            Comment.news_id == news.id,
            Comment.is_active == True,
            Comment.parent_id == None  # Chỉ lấy comment gốc, không lấy reply
        ).order_by(Comment.created_at.desc()).all()
        
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
                             categories=categories,
                             is_saved=is_saved,
                             comments=comments,
                             user_id=user_id)
    
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
        return redirect(url_for('client.index'))
    
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
            SavedNews.user_id == user.id
        ).order_by(SavedNews.created_at.desc()).limit(20).all()
        
        # Lấy tin đã xem
        viewed_news = self.db_session.query(ViewedNews).filter(
            ViewedNews.user_id == user.id
        ).order_by(ViewedNews.viewed_at.desc()).limit(20).all()
        
        # Lấy bình luận
        comments = self.db_session.query(Comment).filter(
            Comment.user_id == user.id
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
                news_id=news_id
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