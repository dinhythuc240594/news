"""
Main application file - Khởi tạo Flask app và đăng ký routes
"""
from flask import Flask
from admin_routes import admin_bp
from client_routes import client_bp
from database import init_db
from config import Config


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

