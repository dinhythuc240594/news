"""
Main application file - Khởi tạo Flask app và đăng ký routes
"""
from flask import Flask
from admin_routes import admin_bp
from client_routes import client_bp
from database import init_db
from config import Config
from datetime import datetime, timezone
import pytz


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
    
    # Đăng ký Jinja2 filters
    @app.template_filter('timeago')
    def timeago_filter(dt):
        """Format datetime thành 'X giờ trước', 'X ngày trước'"""
        if dt is None:
            return "Vừa xong"
        
        # Đảm bảo datetime có timezone
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        
        # Chuyển sang timezone Việt Nam
        vn_tz = pytz.timezone('Asia/Ho_Chi_Minh')
        now = datetime.now(vn_tz)
        dt = dt.astimezone(vn_tz)
        
        diff = now - dt
        
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

