# VnNews Project

Dự án website tin tức VnNews với hệ thống quản trị hoàn chỉnh.

## 📁 Cấu trúc thư mục

```
v3/
├── client/                 # Trang tin tức công khai
│   ├── index.html         # Trang chủ tin tức
│   ├── styles.css         # CSS cho trang client
│   └── script.js          # JavaScript cho trang client
│
├── admin/                  # Hệ thống quản trị
│   ├── login.html         # Trang đăng nhập admin
│   ├── dashboard.html     # Dashboard admin (duyệt bài)
│   ├── editor-dashboard.html  # Dashboard biên tập viên
│   ├── styles.css         # CSS cho admin
│   ├── admin.js           # JavaScript cho admin
│   └── editor.js          # JavaScript cho biên tập viên
│
└── README.md              # File này
```

## 🚀 Cách sử dụng

### Trang Client (Tin tức công khai)
```bash
# Mở trình duyệt
start client/index.html
```
Hoặc truy cập: `file:///path/to/v3/client/index.html`

### Trang Admin
```bash
# Mở trang đăng nhập admin
start admin/login.html
```
Hoặc truy cập: `file:///path/to/v3/admin/login.html`

## 🔐 Tài khoản đăng nhập

### Admin (Quản trị viên)
- **Username:** admin
- **Password:** admin123
- **Quyền hạn:**
  - Duyệt bài viết từ biên tập viên
  - Lấy bài từ API
  - Xem thống kê
  - Quản lý toàn bộ hệ thống

### Editor (Biên tập viên)
- **Username:** editor
- **Password:** editor123
- **Quyền hạn:**
  - Tạo bài viết mới
  - Chỉnh sửa bài viết
  - Ẩn/Hiện bài viết
  - Lưu bản nháp
  - Gửi bài để admin duyệt

## ✨ Tính năng

### Trang Client
- Hiển thị tin tức với layout giống VnExpress
- Menu chuyên mục đa dạng
- Tìm kiếm tin tức
- Responsive design
- Tin nổi bật, tin mới nhất
- Sidebar: Xem nhiều, Video, Thời tiết

### Trang Admin
- **Dashboard:** Thống kê tổng quan, biểu đồ
- **Quản lý bài viết:** Thêm, sửa, xóa, ẩn/hiện
- **Phê duyệt:** Xem trước, duyệt hoặc từ chối bài
- **API Integration:** Lấy tin tức từ API bên ngoài
- **Rich Text Editor:** Summernote WYSIWYG editor
- **Trạng thái bài:** Draft, Pending, Published, Hidden

## 🛠️ Công nghệ sử dụng

- **Frontend:** HTML5, CSS3, JavaScript
- **Framework:** Bootstrap 5.3
- **Library:** jQuery 3.6
- **Icons:** Font Awesome 6.4
- **Editor:** Summernote 0.8.18
- **Charts:** Chart.js

## 📝 Lưu ý

- Dự án hiện tại chạy hoàn toàn trên client-side
- Dữ liệu được lưu trong localStorage
- Chưa có backend API thực tế
- Phù hợp cho demo và prototype

## 🔄 Phát triển tiếp

- [ ] Tích hợp backend API (Node.js, Python Flask/Django)
- [ ] Database thực tế (MySQL, MongoDB)
- [ ] Upload ảnh lên server
- [ ] Xác thực JWT
- [ ] Phân quyền nâng cao
- [ ] Tích hợp API tin tức thật (NewsAPI, RSS)
- [ ] SEO optimization
- [ ] PWA support

## 📞 Liên hệ

Dự án học tập - SPKT - HK2 Python
