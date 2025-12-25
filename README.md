# news
``Mở cmd tại folder có chứa folder src``
``Chạy các lệnh bên dưới``

``1. Cài thư viện tạo môi trường ảo``
pip install virtualenv

``2. Tạo môi trường ảo``
virtualenv venv

``3. Truy cập vào folder venv/script và gõ lệnh``
activate

``4. Cài môi trường Flask framework``
pip install -r requirements.txt

``5. Tạo database trên postgresql with file postgresql_news.sql``
Mở pgAdmin của postgresql để tạo database bằng file "postgresql_news.sql"

``6. Cấu hình database của postgresql with file database.py``
DATABASE_URL = os.environ.get('DATABASE_URL') or 'postgresql://postgres:123456789@localhost:5432/newsdb'

``7. Chạy lệnh dưới để khởi động flask``
python src/main.py
