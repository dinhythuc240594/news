-- Dữ liệu mẫu cho bảng categories
INSERT INTO categories (name, slug, description, icon, order_display, parent_id, visible) VALUES
('Công nghệ', 'cong-nghe', 'Tin tức về công nghệ, phần mềm, ứng dụng', 'tech', 1, NULL, TRUE),
('Kinh tế', 'kinh-te', 'Tin tức kinh tế, tài chính, đầu tư', 'economy', 2, NULL, TRUE),
('Thể thao', 'the-thao', 'Tin tức thể thao trong nước và quốc tế', 'sports', 3, NULL, TRUE),
('Giải trí', 'giai-tri', 'Tin tức giải trí, phim ảnh, ca nhạc', 'entertainment', 4, NULL, TRUE),
('Giáo dục', 'giao-duc', 'Tin tức giáo dục, đào tạo', 'education', 5, NULL, TRUE),
('Sức khỏe', 'suc-khoe', 'Tin tức về sức khỏe, y tế', 'health', 6, NULL, TRUE),
('Điện thoại', 'dien-thoai', 'Tin tức về điện thoại, smartphone', 'phone', 1, 1, TRUE),
('Máy tính', 'may-tinh', 'Tin tức về máy tính, laptop', 'laptop', 2, 1, TRUE),
('Bóng đá', 'bong-da', 'Tin tức bóng đá', 'football', 1, 3, TRUE),
('Bóng rổ', 'bong-ro', 'Tin tức bóng rổ', 'basketball', 2, 3, TRUE);

-- Dữ liệu mẫu cho bảng users
INSERT INTO users (username, email, password_hash, full_name, role, is_active) VALUES
-- username: admin, password: admin123
('admin', 'admin@news.com', 'scrypt:32768:8:1$1LWacKEBH7fGhhYY$8f3f1aa0bb1c1877df77e440d2b42925e7a31fcc22f8234dcf320357808d5011a687e23ae703644fe9de7ec6a0536f42bc4cf5f13c4ca1e40cef8b1592e7f572', 'Quản trị viên', 'admin', TRUE),
-- username: editor, password: editor123
('editor', 'editor@news.com', 'scrypt:32768:8:1$1LWacKEBH7fGhhYY$8f3f1aa0bb1c1877df77e440d2b42925e7a31fcc22f8234dcf320357808d5011a687e23ae703644fe9de7ec6a0536f42bc4cf5f13c4ca1e40cef8b1592e7f572', 'Biên tập viên 1', 'editor', TRUE),


-- Dữ liệu mẫu cho bảng tags
INSERT INTO tags (name, slug) VALUES
('iPhone', 'iphone'),
('Android', 'android'),
('AI', 'ai'),
('Blockchain', 'blockchain'),
('Startup', 'startup'),
('Chứng khoán', 'chung-khoan'),
('Bất động sản', 'bat-dong-san'),
('World Cup', 'world-cup'),
('Premier League', 'premier-league'),
('Phim Việt Nam', 'phim-viet-nam'),
('Nhạc Việt', 'nhac-viet'),
('Đại học', 'dai-hoc'),
('Y tế', 'y-te'),
('Dinh dưỡng', 'dinh-duong');

-- Dữ liệu mẫu cho bảng news
-- Lưu ý: thumbnail và images để NULL hoặc rỗng theo yêu cầu
INSERT INTO news (title, slug, summary, content, thumbnail, images, category_id, created_by, approved_by, status, is_featured, is_hot, view_count, meta_title, meta_description, meta_keywords, published_at) VALUES
('iPhone 15 Pro Max ra mắt với chip A17 Pro mạnh mẽ', 'iphone-15-pro-max-ra-mat-voi-chip-a17-pro-manh-me', 
 'Apple vừa chính thức ra mắt iPhone 15 Pro Max với chip A17 Pro mới nhất, mang lại hiệu năng vượt trội.', 
 'Apple đã chính thức ra mắt iPhone 15 Pro Max tại sự kiện đặc biệt. Chiếc smartphone mới được trang bị chip A17 Pro với hiệu năng mạnh mẽ hơn 20% so với thế hệ trước. Camera được nâng cấp với khả năng quay video 4K và chụp ảnh chuyên nghiệp. Pin có thời lượng sử dụng lên đến 2 ngày với sạc nhanh 30W.',
 NULL, NULL, 7, 2, 1, 'published', TRUE, TRUE, 1250, 
 'iPhone 15 Pro Max - Chip A17 Pro mạnh mẽ', 
 'iPhone 15 Pro Max với chip A17 Pro, camera nâng cấp và pin bền bỉ', 
 'iPhone 15, A17 Pro, Apple, smartphone', 
 '2024-01-15 10:00:00'),

('Thị trường chứng khoán tăng điểm mạnh trong phiên giao dịch hôm nay', 'thi-truong-chung-khoan-tang-diem-manh-trong-phien-giao-dich-hom-nay',
 'VN-Index tăng hơn 20 điểm trong phiên giao dịch hôm nay, đạt mức cao nhất trong 3 tháng qua.',
 'Thị trường chứng khoán Việt Nam ghi nhận phiên giao dịch tích cực với VN-Index tăng 20.5 điểm, đạt mức 1,245 điểm. Các cổ phiếu ngân hàng và bất động sản dẫn đầu đà tăng. Chuyên gia nhận định xu hướng tích cực sẽ tiếp tục trong các phiên tới.',
 NULL, NULL, 2, 2, 1, 'published', FALSE, FALSE, 890,
 'Thị trường chứng khoán tăng điểm mạnh',
 'VN-Index tăng 20.5 điểm, đạt mức cao nhất trong 3 tháng',
 'chứng khoán, VN-Index, đầu tư, tài chính',
 '2024-01-16 14:30:00'),

('Đội tuyển Việt Nam giành chiến thắng 3-1 trước Thái Lan', 'doi-tuyen-viet-nam-gianh-chien-thang-3-1-truoc-thai-lan',
 'Đội tuyển bóng đá Việt Nam đã có chiến thắng thuyết phục 3-1 trước Thái Lan tại vòng loại World Cup.',
 'Trong trận đấu diễn ra tối nay, đội tuyển Việt Nam đã thể hiện phong độ xuất sắc với chiến thắng 3-1 trước đối thủ Thái Lan. Các bàn thắng được ghi bởi Nguyễn Văn Toàn, Phạm Đức Huy và Nguyễn Quang Hải. Chiến thắng này giúp Việt Nam tăng cơ hội đi tiếp tại vòng loại World Cup.',
 NULL, NULL, 9, 3, 1, 'published', TRUE, TRUE, 2150,
 'Việt Nam thắng Thái Lan 3-1 tại vòng loại World Cup',
 'Đội tuyển Việt Nam giành chiến thắng thuyết phục trước Thái Lan',
 'bóng đá, Việt Nam, Thái Lan, World Cup',
 '2024-01-17 20:00:00'),

('Phim "Mai" của đạo diễn Trấn Thành đạt doanh thu kỷ lục', 'phim-mai-cua-dao-dien-tran-thanh-dat-doanh-thu-ky-luc',
 'Bộ phim "Mai" đã cán mốc 200 tỷ đồng doanh thu, trở thành phim Việt Nam có doanh thu cao nhất mọi thời đại.',
 'Phim "Mai" của đạo diễn Trấn Thành tiếp tục gây sốt phòng vé với doanh thu vượt mốc 200 tỷ đồng. Bộ phim kể về câu chuyện cảm động của một người phụ nữ tên Mai, đã chạm đến trái tim của hàng triệu khán giả. Đây là thành tích đáng tự hào của điện ảnh Việt Nam.',
 NULL, NULL, 4, 3, 1, 'published', FALSE, TRUE, 1850,
 'Phim "Mai" đạt doanh thu 200 tỷ đồng',
 'Phim "Mai" của Trấn Thành trở thành phim Việt Nam có doanh thu cao nhất',
 'phim Mai, Trấn Thành, điện ảnh Việt Nam',
 '2024-01-18 09:00:00'),

('Chính phủ công bố chương trình hỗ trợ sinh viên mới', 'chinh-phu-cong-bo-chuong-trinh-ho-tro-sinh-vien-moi',
 'Chính phủ vừa công bố gói hỗ trợ 500 tỷ đồng cho sinh viên có hoàn cảnh khó khăn.',
 'Chương trình hỗ trợ mới sẽ cung cấp học bổng và hỗ trợ chi phí sinh hoạt cho sinh viên có hoàn cảnh khó khăn. Tổng giá trị gói hỗ trợ lên đến 500 tỷ đồng, dự kiến sẽ giúp đỡ hơn 50,000 sinh viên trên cả nước. Đơn đăng ký sẽ được mở từ tháng 2/2024.',
 NULL, NULL, 5, 2, 1, 'published', FALSE, FALSE, 650,
 'Chương trình hỗ trợ sinh viên 500 tỷ đồng',
 'Chính phủ công bố gói hỗ trợ 500 tỷ đồng cho sinh viên khó khăn',
 'hỗ trợ sinh viên, học bổng, giáo dục',
 '2024-01-19 11:00:00'),

('Nghiên cứu mới về tác dụng của trà xanh đối với sức khỏe', 'nghien-cuu-moi-ve-tac-dung-cua-tra-xanh-doi-voi-suc-khoe',
 'Các nhà khoa học phát hiện trà xanh có thể giúp giảm nguy cơ mắc bệnh tim mạch.',
 'Nghiên cứu mới được công bố trên tạp chí y khoa quốc tế cho thấy uống 3-4 tách trà xanh mỗi ngày có thể giảm 20% nguy cơ mắc bệnh tim mạch. Trà xanh chứa nhiều chất chống oxy hóa, đặc biệt là EGCG, có tác dụng bảo vệ tim mạch và cải thiện sức khỏe tổng thể.',
 NULL, NULL, 6, 2, 1, 'published', FALSE, FALSE, 420,
 'Trà xanh giúp giảm nguy cơ bệnh tim mạch',
 'Nghiên cứu cho thấy trà xanh có tác dụng tích cực đối với sức khỏe tim mạch',
 'trà xanh, sức khỏe, tim mạch, dinh dưỡng',
 '2024-01-20 08:00:00'),

('Samsung Galaxy S24 Ultra với AI tích hợp sẵn', 'samsung-galaxy-s24-ultra-voi-ai-tich-hop-san',
 'Samsung ra mắt Galaxy S24 Ultra với nhiều tính năng AI thông minh, hỗ trợ dịch thuật và chỉnh sửa ảnh.',
 'Galaxy S24 Ultra là flagship mới nhất của Samsung với chip Snapdragon 8 Gen 3 và nhiều tính năng AI tích hợp. Điện thoại có khả năng dịch cuộc gọi real-time, chỉnh sửa ảnh bằng AI, và tối ưu hóa hiệu năng thông minh. Camera 200MP cho chất lượng ảnh chuyên nghiệp.',
 NULL, NULL, 7, 3, 1, 'published', TRUE, FALSE, 980,
 'Samsung Galaxy S24 Ultra - AI tích hợp',
 'Galaxy S24 Ultra với chip Snapdragon 8 Gen 3 và tính năng AI thông minh',
 'Samsung, Galaxy S24, AI, smartphone',
 '2024-01-21 15:00:00'),

('Laptop gaming mới với card đồ họa RTX 4090', 'laptop-gaming-moi-voi-card-do-hoa-rtx-4090',
 'Các hãng laptop gaming hàng đầu ra mắt dòng sản phẩm mới với card đồ họa RTX 4090 mạnh mẽ.',
 'Nhiều hãng laptop gaming như ASUS, MSI, và Razer đã ra mắt các mẫu laptop mới trang bị card đồ họa RTX 4090. Đây là card đồ họa mạnh nhất hiện tại, cho phép chơi game 4K mượt mà và render video nhanh chóng. Giá bán từ 50-80 triệu đồng tùy cấu hình.',
 NULL, NULL, 8, 2, 1, 'published', FALSE, FALSE, 750,
 'Laptop gaming RTX 4090 ra mắt',
 'Các hãng laptop gaming ra mắt sản phẩm mới với RTX 4090',
 'laptop gaming, RTX 4090, ASUS, MSI',
 '2024-01-22 10:00:00'),

('Giải bóng rổ chuyên nghiệp Việt Nam khởi tranh', 'giai-bong-ro-chuyen-nghiep-viet-nam-khoi-tranh',
 'VBA 2024 chính thức khởi tranh với sự tham gia của 8 đội bóng trên cả nước.',
 'Giải bóng rổ chuyên nghiệp Việt Nam (VBA) mùa giải 2024 đã chính thức khởi tranh. 8 đội bóng sẽ thi đấu vòng tròn để tìm ra nhà vô địch. Nhiều cầu thủ ngoại binh chất lượng cao được các đội tuyển mời về, hứa hẹn một mùa giải hấp dẫn.',
 NULL, NULL, 10, 3, 1, 'published', FALSE, FALSE, 580,
 'VBA 2024 chính thức khởi tranh',
 'Giải bóng rổ chuyên nghiệp Việt Nam mùa giải 2024 bắt đầu',
 'bóng rổ, VBA, thể thao',
 '2024-01-23 19:00:00'),

('Ca sĩ Sơn Tùng M-TP phát hành MV mới', 'ca-si-son-tung-mtp-phat-hanh-mv-moi',
 'Sơn Tùng M-TP vừa ra mắt MV "Chúng ta của tương lai" với concept độc đáo.',
 'MV mới của Sơn Tùng M-TP đã thu hút hàng triệu lượt xem chỉ sau vài giờ phát hành. MV có concept về tương lai với hình ảnh và âm thanh hiện đại. Đây là sản phẩm âm nhạc đầu tiên của nam ca sĩ trong năm 2024.',
 NULL, NULL, 4, 3, 1, 'published', FALSE, TRUE, 3200,
 'Sơn Tùng M-TP ra mắt MV mới',
 'MV "Chúng ta của tương lai" của Sơn Tùng M-TP thu hút triệu lượt xem',
 'Sơn Tùng M-TP, MV, âm nhạc',
 '2024-01-24 20:00:00'),

('Tin tức đang chờ duyệt', 'tin-tuc-dang-cho-duyet',
 'Đây là một bài viết đang ở trạng thái chờ duyệt.',
 'Nội dung bài viết này đang được biên tập viên xem xét và chờ phê duyệt từ quản trị viên. Bài viết sẽ được xuất bản sau khi được duyệt.',
 NULL, NULL, 1, 2, NULL, 'pending', FALSE, FALSE, 0,
 NULL, NULL, NULL, NULL),

('Bản nháp bài viết', 'ban-nhap-bai-viet',
 'Đây là một bản nháp bài viết chưa hoàn thiện.',
 'Nội dung bài viết này đang được soạn thảo và chưa sẵn sàng để xuất bản. Tác giả đang tiếp tục chỉnh sửa và bổ sung thông tin.',
 NULL, NULL, 2, 4, NULL, 'draft', FALSE, FALSE, 0,
 NULL, NULL, NULL, NULL);

-- Dữ liệu mẫu cho bảng news_tags (liên kết giữa news và tags)
INSERT INTO news_tags (news_id, tag_id) VALUES
(1, 1),  -- iPhone 15 Pro Max - iPhone
(1, 3),  -- iPhone 15 Pro Max - AI
(2, 6),  -- Chứng khoán - Chứng khoán
(2, 7),  -- Chứng khoán - Bất động sản
(3, 8),  -- Bóng đá Việt Nam - World Cup
(4, 10), -- Phim Mai - Phim Việt Nam
(5, 12), -- Hỗ trợ sinh viên - Đại học
(6, 13), -- Trà xanh - Y tế
(6, 14), -- Trà xanh - Dinh dưỡng
(7, 2),  -- Galaxy S24 - Android
(7, 3),  -- Galaxy S24 - AI
(8, 3),  -- Laptop gaming - AI
(9, 9),  -- Bóng rổ - Premier League (ví dụ)
(10, 11); -- Sơn Tùng M-TP - Nhạc Việt

INSERT INTO menu_items (name, slug, icon, order_display, parent_id, visible, level) VALUES
('Công nghệ', 'cong-nghe', 'tech', 1, NULL, TRUE, 1),
('Kinh tế', 'kinh-te', 'economy', 2, NULL, TRUE, 1),
('Thể thao', 'the-thao', 'sports', 3, NULL, TRUE, 1),
('Giải trí', 'giai-tri', 'entertainment', 4, NULL, TRUE, 1),
('Giáo dục', 'giao-duc', 'education', 5, NULL, TRUE, 1),
('Sức khỏe', 'suc-khoe', 'health', 6, NULL, TRUE, 1),
('Điện thoại', 'dien-thoai', 'phone', 1, 1, TRUE, 2),
('Máy tính', 'may-tinh', 'laptop', 2, 1, TRUE, 2),
('Bóng đá', 'bong-da', 'football', 1, 3, TRUE, 2),
('Bóng rổ', 'bong-ro', 'basketball', 2, 3, TRUE, 2);