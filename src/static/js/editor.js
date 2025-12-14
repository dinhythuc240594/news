$(document).ready(function() {
    // Check authentication
    checkAuth();
    
    // Load user info
    loadUserInfo();
    
    // Initialize Summernote editor
    $('#articleContent, #editArticleContent').summernote({
        height: 400,
        placeholder: 'Nhập nội dung bài viết...',
        toolbar: [
            ['style', ['style']],
            ['font', ['bold', 'italic', 'underline', 'clear']],
            ['fontname', ['fontname']],
            ['color', ['color']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['table', ['table']],
            ['insert', ['link', 'picture', 'video']],
            ['view', ['fullscreen', 'codeview', 'help']]
        ]
    });
    
    // Initialize International Article editor
    $('#intArticleContent').summernote({
        height: 400,
        placeholder: 'Enter article content in English...',
        toolbar: [
            ['style', ['style']],
            ['font', ['bold', 'italic', 'underline', 'clear']],
            ['fontname', ['fontname']],
            ['color', ['color']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['table', ['table']],
            ['insert', ['link', 'picture', 'video']],
            ['view', ['fullscreen', 'codeview', 'help']]
        ]
    });
    
    // Load initial data
    loadMyArticles();
    loadStatistics();
    
    // Menu navigation
    $('.sidebar-menu a[data-section]').click(function(e) {
        e.preventDefault();
        const section = $(this).data('section');
        
        // Update active menu
        $('.sidebar-menu li').removeClass('active');
        $(this).parent().addClass('active');
        
        // Show section
        $('.content-section').removeClass('active');
        $('#' + section).addClass('active');
        
        // Update page title
        updatePageTitle(section);
    });
    
    // Header create button
    $('.header-actions button[data-section="create"]').click(function() {
        $('.sidebar-menu li').removeClass('active');
        $('.sidebar-menu a[data-section="create"]').parent().addClass('active');
        $('.content-section').removeClass('active');
        $('#create').addClass('active');
        $('#pageTitle').text('Tạo bài viết mới');
    });
    
    // Logout
    $('#logoutBtn').click(function(e) {
        e.preventDefault();
        if (confirm('Bạn có chắc muốn đăng xuất?')) {
            // Xóa localStorage nếu có
            localStorage.removeItem('userInfo');
            // Redirect đến endpoint logout để xóa session trên server và quay về trang đăng nhập
            window.location.href = '/admin/logout';
        }
    });
    
    // Image preview
    $('#articleImage').change(function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                $('#imagePreview').html(`<img src="${e.target.result}" style="max-width: 100%; border-radius: 8px;">`);
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Save draft
    $('#saveDraftBtn').click(function() {
        saveDraft();
    });
    
    // Submit article
    $('#articleForm').submit(function(e) {
        e.preventDefault();
        submitArticle();
    });
    
    // International article form handlers
    $('#internationalArticleForm').submit(function(e) {
        e.preventDefault();
        submitInternationalArticle();
    });
    
    $('#saveIntDraftBtn').click(function() {
        saveInternationalDraft();
    });
    
    $('#previewIntBtn').click(function() {
        previewInternationalArticle();
    });
    
    // Filter articles
    $('#filterStatus').change(function() {
        const status = $(this).val();
        filterArticles(status);
    });
    
    // Edit article
    $(document).on('click', '.btn-edit', function() {
        const articleId = $(this).data('id');
        editArticle(articleId);
    });
    
    // Delete article
    $(document).on('click', '.btn-delete', function() {
        const articleId = $(this).data('id');
        if (confirm('Bạn có chắc muốn xóa bài viết này?')) {
            deleteArticle(articleId);
        }
    });
    
    // Toggle visibility
    $(document).on('change', '.visibility-toggle', function() {
        const articleId = $(this).data('id');
        const visible = $(this).prop('checked');
        toggleVisibility(articleId, visible);
    });
    
    // Save edit
    $('#saveEditBtn').click(function() {
        saveEdit();
    });
});

// Check authentication
async function checkAuth() {
    try {
        const response = await fetch('/admin/api/current-user');
        const result = await response.json();
        
        if (!result.success || (result.data.role !== 'editor' && result.data.role !== 'admin')) {
            window.location.href = 'login.html';
            return;
        }
    } catch (error) {
        console.error('Lỗi kiểm tra đăng nhập:', error);
        window.location.href = 'login.html';
    }
}

// Load user info
async function loadUserInfo() {
    try {
        const response = await fetch('/admin/api/current-user');
        const result = await response.json();
        
        if (result.success && result.data) {
            $('#userName').text(result.data.name);
        }
    } catch (error) {
        console.error('Lỗi tải thông tin user:', error);
    }
}

// Update page title
function updatePageTitle(section) {
    const titles = {
        'dashboard': 'Dashboard',
        'my-articles': 'Bài viết của tôi',
        'create': 'Tạo bài viết mới',
        'drafts': 'Bản nháp',
        'pending': 'Chờ duyệt',
        'published': 'Đã xuất bản'
    };
    $('#pageTitle').text(titles[section] || 'Dashboard');
}

// Load statistics
function loadStatistics() {
    const stats = {
        total: 24,
        pending: 5,
        published: 16,
        drafts: 3
    };
    
    $('#statTotal').text(stats.total);
    $('#statPending').text(stats.pending);
    $('#statPublished').text(stats.published);
    $('#statDrafts').text(stats.drafts);
    $('#pendingCount').text(stats.pending);
    $('#draftCount').text(stats.drafts);
}

// Load my articles
function loadMyArticles() {
    const articles = [
        {
            id: 1,
            title: 'Thủ tướng phát biểu tại hội nghị kinh tế quốc tế',
            category: 'Thời sự',
            status: 'pending',
            visible: true,
            date: '2024-12-13 14:30'
        },
        {
            id: 2,
            title: 'Giá vàng trong nước tăng cao kỷ lục',
            category: 'Kinh doanh',
            status: 'published',
            visible: true,
            date: '2024-12-12 10:15'
        },
        {
            id: 3,
            title: 'Top 10 địa điểm du lịch hấp dẫn nhất mùa đông',
            category: 'Du lịch',
            status: 'published',
            visible: true,
            date: '2024-12-11 16:45'
        },
        {
            id: 4,
            title: 'Công nghệ AI đang thay đổi cách chúng ta làm việc',
            category: 'Công nghệ',
            status: 'draft',
            visible: false,
            date: '2024-12-13 09:20'
        },
        {
            id: 5,
            title: '5 thói quen buổi sáng giúp tăng cường sức khỏe',
            category: 'Sức khỏe',
            status: 'published',
            visible: false,
            date: '2024-12-10 13:30'
        },
        {
            id: 6,
            title: 'Phim Việt gây sốt phòng vé dịp cuối năm',
            category: 'Giải trí',
            status: 'pending',
            visible: true,
            date: '2024-12-13 11:00'
        }
    ];
    
    displayArticles(articles);
}

// Display articles
function displayArticles(articles) {
    let html = '';
    articles.forEach((article, index) => {
        const statusBadge = getStatusBadge(article.status);
        const checked = article.visible ? 'checked' : '';
        
        html += `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${article.title}</strong></td>
                <td><span class="badge bg-primary">${article.category}</span></td>
                <td>${statusBadge}</td>
                <td>
                    <label class="visibility-switch">
                        <input type="checkbox" class="visibility-toggle" data-id="${article.id}" ${checked}>
                        <span class="visibility-slider"></span>
                    </label>
                </td>
                <td>${article.date}</td>
                <td>
                    <button class="btn btn-sm btn-info btn-action btn-edit" data-id="${article.id}" title="Chỉnh sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${article.status === 'draft' ? `
                        <button class="btn btn-sm btn-success btn-action btn-submit" data-id="${article.id}" title="Gửi duyệt">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    ` : ''}
                    <button class="btn btn-sm btn-danger btn-action btn-delete" data-id="${article.id}" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    $('#myArticlesTable').html(html);
}

// Get status badge
function getStatusBadge(status) {
    const badges = {
        'draft': '<span class="status-badge status-draft">Bản nháp</span>',
        'pending': '<span class="status-badge status-pending">Chờ duyệt</span>',
        'published': '<span class="status-badge status-published">Đã xuất bản</span>',
        'rejected': '<span class="status-badge status-rejected">Bị từ chối</span>'
    };
    return badges[status] || status;
}

// Filter articles
function filterArticles(status) {
    // In a real application, this would filter the articles
    showToast('Thông báo', `Lọc bài viết: ${status}`, 'info');
}

// Save draft
function saveDraft() {
    const title = $('#articleTitle').val();
    const content = $('#articleContent').summernote('code');
    const category = $('#articleCategory').val();
    
    // if (!title) {
    //     alert('Vui lòng nhập tiêu đề bài viết!');
    //     return;
    // }
    
    showSpinner();
    
    // Simulate API call
    setTimeout(function() {
        hideSpinner();
        showToast('Thành công', 'Bài viết đã được lưu vào bản nháp', 'success');
        
        // Clear form
        $('#articleForm')[0].reset();
        $('#articleContent').summernote('code', '');
        $('#imagePreview').html('');
        
        // Update stats
        const drafts = parseInt($('#statDrafts').text()) + 1;
        $('#statDrafts').text(drafts);
        $('#draftCount').text(drafts);
    }, 1000);
}

// Submit article
function submitArticle() {
    const title = $('#articleTitle').val();
    const content = $('#articleContent').summernote('code');
    const category = $('#articleCategory').val();
    const description = $('#articleDescription').val();
    const tags = $('#articleTags').val();
    
    // if (!title || !content || !category) {
    //     alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
    //     return;
    // }
    
    showSpinner();
    
    // Simulate API call
    setTimeout(function() {
        hideSpinner();
        showToast('Thành công', 'Bài viết đã được gửi để duyệt', 'success');
        
        // Clear form
        $('#articleForm')[0].reset();
        $('#articleContent').summernote('code', '');
        $('#imagePreview').html('');
        
        // Update stats
        const pending = parseInt($('#statPending').text()) + 1;
        const total = parseInt($('#statTotal').text()) + 1;
        $('#statPending').text(pending);
        $('#statTotal').text(total);
        $('#pendingCount').text(pending);
        
        // Reload articles
        loadMyArticles();
    }, 1500);
}

// Edit article
function editArticle(articleId) {
    // Simulate loading article data
    const article = {
        id: articleId,
        title: 'Thủ tướng phát biểu tại hội nghị kinh tế quốc tế',
        content: '<p>Nội dung bài viết...</p>',
        category: 'thoi-su'
    };
    
    $('#editArticleId').val(article.id);
    $('#editArticleTitle').val(article.title);
    $('#editArticleContent').summernote('code', article.content);
    $('#editArticleCategory').val(article.category);
    
    const modal = new bootstrap.Modal(document.getElementById('editModal'));
    modal.show();
}

// Save edit
function saveEdit() {
    const articleId = $('#editArticleId').val();
    const title = $('#editArticleTitle').val();
    const content = $('#editArticleContent').summernote('code');
    const category = $('#editArticleCategory').val();
    
    showSpinner();
    
    // Simulate API call
    setTimeout(function() {
        hideSpinner();
        showToast('Thành công', 'Bài viết đã được cập nhật', 'success');
        
        // Close modal
        bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
        
        // Reload articles
        loadMyArticles();
    }, 1000);
}

// Delete article
function deleteArticle(articleId) {
    showSpinner();
    
    // Simulate API call
    setTimeout(function() {
        hideSpinner();
        showToast('Thành công', 'Bài viết đã được xóa', 'success');
        
        // Remove from table
        $('button[data-id="' + articleId + '"]').closest('tr').fadeOut(function() {
            $(this).remove();
        });
        
        // Update stats
        const total = parseInt($('#statTotal').text()) - 1;
        $('#statTotal').text(total);
    }, 1000);
}

// Toggle visibility
function toggleVisibility(articleId, visible) {
    const status = visible ? 'hiện' : 'ẩn';
    
    showSpinner();
    
    // Simulate API call
    setTimeout(function() {
        hideSpinner();
        showToast('Thành công', `Bài viết đã được ${status}`, 'success');
    }, 500);
}

// Show spinner
function showSpinner() {
    $('body').append('<div class="spinner-overlay"><div class="spinner-border-custom"></div></div>');
}

// Hide spinner
function hideSpinner() {
    $('.spinner-overlay').fadeOut(function() {
        $(this).remove();
    });
}

// ===== International Article Functions =====

function submitInternationalArticle() {
    const title = $('#intArticleTitle').val();
    const content = $('#intArticleContent').summernote('code');
    const category = $('#intArticleCategory').val();
    const summary = $('#intArticleSummary').val();
    const image = $('#intArticleImage').val();
    const author = $('#intArticleAuthor').val();
    const tags = $('#intArticleTags').val();
    
    if (!title || !content || !category) {
        showToast('Error', 'Please fill in all required fields', 'warning');
        return;
    }
    
    showSpinner();
    
    // Simulate API call
    setTimeout(function() {
        hideSpinner();
        showToast('Success', 'International article submitted for review', 'success');
        
        // Reset form
        $('#internationalArticleForm')[0].reset();
        $('#intArticleContent').summernote('reset');
        
        // Switch to international articles view
        $('.sidebar-menu a[data-section="international-articles"]').click();
    }, 1500);
}

function saveInternationalDraft() {
    const title = $('#intArticleTitle').val();
    
    if (!title) {
        showToast('Error', 'Please enter article title', 'warning');
        return;
    }
    
    showSpinner();
    
    setTimeout(function() {
        hideSpinner();
        showToast('Success', 'Draft saved successfully', 'success');
    }, 1000);
}

function previewInternationalArticle() {
    const title = $('#intArticleTitle').val();
    const content = $('#intArticleContent').summernote('code');
    const category = $('#intArticleCategory').val();
    
    if (!title || !content) {
        showToast('Warning', 'Please add title and content to preview', 'warning');
        return;
    }
    
    // Open preview in new window
    const previewWindow = window.open('', 'Article Preview', 'width=800,height=600');
    previewWindow.document.write(`
        <html>
        <head>
            <title>${title}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                h1 { color: #333; margin-bottom: 10px; }
                .meta { color: #666; font-size: 14px; margin-bottom: 20px; }
                .category { background: #0066cc; color: white; padding: 5px 10px; border-radius: 3px; font-size: 12px; }
                .content { line-height: 1.8; color: #444; }
            </style>
        </head>
        <body>
            <span class="category">${category}</span>
            <h1>${title}</h1>
            <div class="meta">Preview - ${new Date().toLocaleString()}</div>
            <div class="content">${content}</div>
        </body>
        </html>
    `);
}

// Show toast notification
function showToast(title, message, type) {
    const bgClass = type === 'success' ? 'bg-success' : type === 'warning' ? 'bg-warning' : 'bg-info';
    const toast = `
        <div class="toast custom-toast" role="alert">
            <div class="toast-header ${bgClass} text-white">
                <strong class="me-auto">${title}</strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;
    
    if (!$('.toast-container').length) {
        $('body').append('<div class="toast-container"></div>');
    }
    
    $('.toast-container').append(toast);
    const toastEl = $('.toast-container .toast:last');
    const bsToast = new bootstrap.Toast(toastEl[0]);
    bsToast.show();
    
    setTimeout(function() {
        toastEl.remove();
    }, 5000);
}
