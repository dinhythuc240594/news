-- Script: Đồng bộ hóa news_id và news_international_id giữa site vn và en
-- Mục đích: Cập nhật các bảng comments, saved_news, viewed_news để liên kết
-- giữa news_international_id (site en) và news_id (site vn) dựa trên slug

-- ============================================
-- PHẦN 1: CẬP NHẬT SAVED_NEWS
-- ============================================

-- Cập nhật news_international_id cho các bản ghi saved_news có news_id nhưng chưa có news_international_id
-- Tìm bài viết tương ứng trong news_international dựa trên slug
UPDATE saved_news sn
SET news_international_id = ni.id
FROM news n
INNER JOIN news_international ni ON n.slug = ni.slug
WHERE sn.news_id = n.id
  AND sn.news_international_id IS NULL
  AND sn.news_id IS NOT NULL
  AND sn.site = 'vn';

-- Cập nhật news_id cho các bản ghi saved_news có news_international_id nhưng chưa có news_id
-- Tìm bài viết tương ứng trong news dựa trên slug
UPDATE saved_news sn
SET news_id = n.id
FROM news_international ni
INNER JOIN news n ON ni.slug = n.slug
WHERE sn.news_international_id = ni.id
  AND sn.news_id IS NULL
  AND sn.news_international_id IS NOT NULL
  AND sn.site = 'en';

-- ============================================
-- PHẦN 2: CẬP NHẬT VIEWED_NEWS
-- ============================================

-- Cập nhật news_international_id cho các bản ghi viewed_news có news_id nhưng chưa có news_international_id
UPDATE viewed_news vn
SET news_international_id = ni.id
FROM news n
INNER JOIN news_international ni ON n.slug = ni.slug
WHERE vn.news_id = n.id
  AND vn.news_international_id IS NULL
  AND vn.news_id IS NOT NULL
  AND vn.site = 'vn';

-- Cập nhật news_id cho các bản ghi viewed_news có news_international_id nhưng chưa có news_id
UPDATE viewed_news vn
SET news_id = n.id
FROM news_international ni
INNER JOIN news n ON ni.slug = n.slug
WHERE vn.news_international_id = ni.id
  AND vn.news_id IS NULL
  AND vn.news_international_id IS NOT NULL
  AND vn.site = 'en';

-- ============================================
-- PHẦN 3: CẬP NHẬT COMMENTS
-- ============================================

-- Cập nhật news_international_id cho các bản ghi comments có news_id nhưng chưa có news_international_id
UPDATE comments c
SET news_international_id = ni.id
FROM news n
INNER JOIN news_international ni ON n.slug = ni.slug
WHERE c.news_id = n.id
  AND c.news_international_id IS NULL
  AND c.news_id IS NOT NULL
  AND c.site = 'vn';

-- Cập nhật news_id cho các bản ghi comments có news_international_id nhưng chưa có news_id
UPDATE comments c
SET news_id = n.id
FROM news_international ni
INNER JOIN news n ON ni.slug = n.slug
WHERE c.news_international_id = ni.id
  AND c.news_id IS NULL
  AND c.news_international_id IS NOT NULL
  AND c.site = 'en';

-- ============================================
-- PHẦN 4: KIỂM TRA KẾT QUẢ
-- ============================================

-- Hiển thị số lượng bản ghi đã được cập nhật trong saved_news
SELECT 
    'saved_news' as table_name,
    COUNT(*) FILTER (WHERE news_id IS NOT NULL AND news_international_id IS NOT NULL) as records_with_both_ids,
    COUNT(*) FILTER (WHERE news_id IS NOT NULL AND news_international_id IS NULL) as records_with_news_id_only,
    COUNT(*) FILTER (WHERE news_id IS NULL AND news_international_id IS NOT NULL) as records_with_news_international_id_only,
    COUNT(*) as total_records
FROM saved_news
UNION ALL
-- Hiển thị số lượng bản ghi đã được cập nhật trong viewed_news
SELECT 
    'viewed_news' as table_name,
    COUNT(*) FILTER (WHERE news_id IS NOT NULL AND news_international_id IS NOT NULL) as records_with_both_ids,
    COUNT(*) FILTER (WHERE news_id IS NOT NULL AND news_international_id IS NULL) as records_with_news_id_only,
    COUNT(*) FILTER (WHERE news_id IS NULL AND news_international_id IS NOT NULL) as records_with_news_international_id_only,
    COUNT(*) as total_records
FROM viewed_news
UNION ALL
-- Hiển thị số lượng bản ghi đã được cập nhật trong comments
SELECT 
    'comments' as table_name,
    COUNT(*) FILTER (WHERE news_id IS NOT NULL AND news_international_id IS NOT NULL) as records_with_both_ids,
    COUNT(*) FILTER (WHERE news_id IS NOT NULL AND news_international_id IS NULL) as records_with_news_id_only,
    COUNT(*) FILTER (WHERE news_id IS NULL AND news_international_id IS NOT NULL) as records_with_news_international_id_only,
    COUNT(*) as total_records
FROM comments;

-- ============================================
-- LƯU Ý:
-- ============================================
-- Script này giả định rằng các bài viết trong news và news_international
-- có cùng slug để liên kết với nhau. Nếu không, bạn cần điều chỉnh
-- điều kiện JOIN (ví dụ: sử dụng title, hoặc một trường liên kết khác).
--
-- Nếu bạn có một trường liên kết trực tiếp giữa news và news_international,
-- hãy sửa đổi các câu lệnh UPDATE để sử dụng trường đó thay vì slug.

