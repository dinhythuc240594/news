-- Migration script: Thêm column author vào bảng news
-- Chạy script này để cập nhật database schema

-- Thêm column author
ALTER TABLE news ADD COLUMN author VARCHAR(255) DEFAULT NULL;

-- Thêm comment cho column
COMMENT ON COLUMN news.author IS 'Tên tác giả gốc từ nguồn bên ngoài (cho bài viết từ API)';

-- Kiểm tra kết quả
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'news' AND column_name = 'author';
