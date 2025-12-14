-- Thêm cột phone vào bảng users
ALTER TABLE public.users ADD COLUMN phone VARCHAR(20);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar VARCHAR(255);