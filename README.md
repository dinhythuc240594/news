# news
``Mở cmd tại folder có chứa folder src``
``Chạy các lệnh bên dưới``

``1. Cài môi trường Flask framework``
pip install -r requirements.txt

``2. Tạo database trên postgresql with file postgresql_news.sql``
``3. Tạo data mẫu trên postgresql with file insert_news.sql``

``4. Config database của postgresql with file database.py``
DATABASE_URL = os.environ.get('DATABASE_URL') or 'postgresql://postgres:123456789@localhost:5432/newsdb'

``5. Chạy lệnh dưới để khởi động flask``
python src\main.py
