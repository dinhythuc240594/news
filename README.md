# news
``Mở cmd tại folder có chứa folder src``
``Chạy các lệnh bên dưới``

``1. Copy env.example thanh .env``
copy env.example .env

``2. Cấu hình .env``
# Secret Key - Thay đổi giá trị này trong production!
# Sử dụng: python -c "import secrets; print(secrets.token_hex(32))" để tạo secret key an toàn
SECRET_KEY=123456789

# Database Configuration
# Format: postgresql://username:password@host:port/database
DATABASE_URL=postgresql://postgres:1@localhost:5432/newsdb

# Email Configuration (SMTP)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USE_SSL=False
MAIL_USERNAME=mail@gmail
MAIL_PASSWORD=password
MAIL_DEFAULT_SENDER=mail@gmail.com
MAIL_SUBJECT_PREFIX=[VnNews ] 

``3. Chạy file setup.bat``
Để bắt đầu chạy web demo