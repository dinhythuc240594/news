-- Thêm cột phone vào bảng users
ALTER TABLE public.users ADD COLUMN phone VARCHAR(20);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar VARCHAR(255);
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS is_api BOOLEAN DEFAULT FALSE;