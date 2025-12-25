"""
Main application file - Khởi tạo Flask app và đăng ký routes
"""
from flask import Flask, request
from admin_routes import admin_bp
from client_routes import client_bp
from database import init_db, get_session
from models import CategoryModel
from config import Config
from datetime import datetime, timezone
import pytz
import re


def create_app(config_class=Config):
    """
    Factory function để tạo Flask application
    
    Args:
        config_class: Class chứa cấu hình
        
    Returns:
        Flask app instance
    """
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Khởi tạo database
    init_db()
    
    # Đăng ký Blueprints
    app.register_blueprint(client_bp)
    app.register_blueprint(admin_bp)
    
    # Debug: Log mọi request
    @app.before_request
    def log_request():
        print(f"\n>>> INCOMING REQUEST: {request.method} {request.path}")
        # print(f">>> Endpoint: {request.endpoint}")
        # print(f">>> View args: {request.view_args}\n")
    
    # # Debug: In ra tất cả routes
    # print("\n" + "="*50)
    # print("REGISTERED ROUTES:")
    # print("="*50)
    # for rule in app.url_map.iter_rules():
    #     print(f"{rule.rule} -> {rule.endpoint} [{', '.join(rule.methods)}]")
    # print("="*50 + "\n")
    
    # Helper function để xác định site từ request path
    def _get_site_from_request():
        """Xác định site (vn/en) từ request path"""
        path = request.path if request else ''
        if path.startswith('/en'):
            return 'en'
        return 'vn'
    
    # Đăng ký Jinja2 filters
    @app.template_filter('datetime_format')
    def datetime_format_filter(dt):
        """Format datetime theo site: vn hoặc en"""
        if dt is None:
            return ''
        
        # Xác định site từ request path
        site = _get_site_from_request()
        
        # Thiết lập time_format và time_zone theo site
        time_format = '%d-%m-%Y %H:%M'
        if site == 'vn':
            time_zone = 'Asia/Ho_Chi_Minh'
        else:  # en
            time_zone = 'UTC'
        
        # Đảm bảo datetime có timezone
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        
        # Chuyển sang timezone tương ứng và format
        tz = pytz.timezone(time_zone)
        dt = dt.astimezone(tz)
        return dt.strftime(time_format)
    
    @app.template_filter('timeago')
    def timeago_filter(dt):
        """Format datetime thành 'X giờ trước', 'X ngày trước'"""
        if dt is None:
            return "Vừa xong" if _get_site_from_request() == 'vn' else "Just now"
        
        # Xác định site từ request path
        site = _get_site_from_request()
        
        # Đảm bảo datetime có timezone
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        
        # Chuyển sang timezone tương ứng
        if site == 'vn':
            tz = pytz.timezone('Asia/Ho_Chi_Minh')
            now = datetime.now(tz)
            dt = dt.astimezone(tz)
        else:  # en
            tz = pytz.timezone('UTC')
            now = datetime.now(tz)
            dt = dt.astimezone(tz)
        
        diff = now - dt
        
        # Format theo ngôn ngữ
        if site == 'vn':
            if diff.days > 0:
                return f"{diff.days} ngày trước"
            elif diff.seconds >= 3600:
                hours = diff.seconds // 3600
                return f"{hours} giờ trước"
            elif diff.seconds >= 60:
                minutes = diff.seconds // 60
                return f"{minutes} phút trước"
            else:
                return "Vừa xong"
        else:  # en
            if diff.days > 0:
                return f"{diff.days} days ago"
            elif diff.seconds >= 3600:
                hours = diff.seconds // 3600
                return f"{hours} hours ago"
            elif diff.seconds >= 60:
                minutes = diff.seconds // 60
                return f"{minutes} minutes ago"
            else:
                return "Just now"
    
    @app.template_filter('format_view')
    def format_view_filter(count):
        """Format số lượt xem: 1500 -> 1.5K"""
        if count is None:
            return "0"
        if count >= 1000000:
            return f"{count/1000000:.1f}M"
        elif count >= 1000:
            return f"{count/1000:.1f}K"
        return str(count)
    
    @app.template_filter('default_image')
    def default_image_filter(image_url):
        """Trả về ảnh mặc định nếu không có thumbnail"""
        if image_url:
            return image_url
        return "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800"
    
    @app.template_filter('nl2br')
    def nl2br_filter(text):
        """Chuyển đổi newline thành <br> tag"""
        if not text:
            return ''
        return text.replace('\n', '<br>')
    
    @app.template_filter('get_description')
    def get_description_filter(content):
        """
        Lấy mô tả từ content: loại bỏ HTML tags và lấy 200 từ đầu
        Nếu content là None hoặc rỗng, trả về chuỗi rỗng
        """
        if not content:
            return ''
        
        # Loại bỏ HTML tags
        text = re.sub(r'<[^>]+>', '', content)
        
        # Loại bỏ các ký tự đặc biệt và normalize whitespace
        text = re.sub(r'&nbsp;', ' ', text)
        text = re.sub(r'\s+', ' ', text)
        text = text.strip()
        
        # Chia thành các từ
        words = text.split()
        
        # Lấy 200 từ đầu
        if len(words) > 100:
            return ' '.join(words[:100]) + '...'
        else:
            return text
    
    # Context processor để categories có sẵn trong tất cả templates
    @app.context_processor
    def inject_categories():
        """Inject categories vào tất cả templates để dùng cho navigation menu"""
        try:
            db_session = get_session()
            category_model = CategoryModel(db_session)
            categories = category_model.get_all()  # Đã lọc visible=True và sắp xếp theo order_display
            db_session.close()
            return dict(categories=categories)
        except Exception:
            # Nếu có lỗi (ví dụ: database chưa khởi tạo), trả về list rỗng
            return dict(categories=[])
    
    return app


if __name__ == '__main__':
    app = create_app()
    print("\n" + "="*50)
    print("  Website News - Flask Server")
    print("="*50)
    print(f"  Server đang chạy tại: http://localhost:5000")
    print(f"  Trang chủ: http://localhost:5000/")
    print(f"  Admin: http://localhost:5000/admin/login")
    print("="*50 + "\n")
    app.run(debug=True, host='0.0.0.0', port=5000)

