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
        ],
        callbacks: {
            onImageUpload: function(files) {
                // Upload image when inserted into editor
                for (let i = 0; i < files.length; i++) {
                    uploadImageToEditor(files[i]);
                }
            }
        }
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
    
    // Image preview and upload
    $('#articleImage').change(function() {
        const file = this.files[0];
        if (file) {
            // Show preview
            const reader = new FileReader();
            reader.onload = function(e) {
                $('#imagePreview').html(`
                    <img src="${e.target.result}" style="max-width: 100%; border-radius: 8px; margin-bottom: 10px;">
                    <div class="upload-progress" style="display: block;">
                        <div class="progress">
                            <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: 100%">Đang upload...</div>
                        </div>
                    </div>
                `);
            };
            reader.readAsDataURL(file);
            
            // Upload image immediately
            uploadArticleImage(file).then(function(url) {
                if (url) {
                    $('#imagePreview .upload-progress').html('<div class="alert alert-success mt-2"><i class="fas fa-check"></i> Upload thành công</div>');
                } else {
                    $('#imagePreview .upload-progress').html('<div class="alert alert-danger mt-2"><i class="fas fa-times"></i> Upload thất bại</div>');
                }
            });
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

// Load my articles from API (database, joined with categories)
async function loadMyArticles() {
    try {
        showSpinner();

        const response = await fetch('/api/my-articles', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        const result = await response.json();
        hideSpinner();

        if (!result.success) {
            showToast('Lỗi', result.error || 'Không thể tải danh sách bài viết', 'warning');
            return;
        }

        // Chuẩn hóa dữ liệu trả về để phù hợp với displayArticles
        const articles = (result.data || []).map(item => ({
            id: item.id,
            title: item.title,
            // Ưu tiên tên danh mục lấy từ bảng categories (category_name / category_title...),
            // fallback về slug hoặc chuỗi rỗng nếu không có
            category: item.category_name || item.category_title || item.category || '',
            status: item.status, // ví dụ: 'draft' | 'pending' | 'published'
            visible: item.visible !== undefined ? item.visible : true,
            // Chuyển ngày về string hiển thị
            date: item.created_at || item.updated_at || ''
        }));

        displayArticles(articles);
    } catch (error) {
        console.error('Lỗi tải bài viết:', error);
        hideSpinner();
        showToast('Lỗi', 'Có lỗi xảy ra khi tải danh sách bài viết', 'warning');
    }
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

// Upload article image
async function uploadArticleImage(file, newsId = null) {
    const formData = new FormData();
    formData.append('image', file);
    if (newsId) {
        formData.append('news_id', newsId);
    }
    
    try {
        const response = await fetch('/admin/api/upload-image', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Update thumbnail input with URL
            $('#articleImageUrl').val(result.url);
            showToast('Thành công', 'Upload ảnh thành công', 'success');
            return result.url;
        } else {
            showToast('Lỗi', result.error || 'Upload ảnh thất bại', 'warning');
            return null;
        }
    } catch (error) {
        console.error('Lỗi upload ảnh:', error);
        showToast('Lỗi', 'Có lỗi xảy ra khi upload ảnh', 'warning');
        return null;
    }
}

// Upload image to editor (for Summernote)
async function uploadImageToEditor(file) {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
        const response = await fetch('/admin/api/upload-image', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Insert image into editor
            $('#articleContent').summernote('insertImage', result.url);
        } else {
            showToast('Lỗi', result.error || 'Upload ảnh thất bại', 'warning');
        }
    } catch (error) {
        console.error('Lỗi upload ảnh:', error);
        showToast('Lỗi', 'Có lỗi xảy ra khi upload ảnh', 'warning');
    }
}

// Save draft
async function saveDraft() {
    const title = $('#articleTitle').val().trim();
    const content = $('#articleContent').summernote('code');
    const category = $('#articleCategory').val();
    const description = $('#articleDescription').val().trim();
    const thumbnail = $('#articleImageUrl').val() || '';
    const tags = $('#articleTags').val().trim();
    
    if (!title) {
        showToast('Cảnh báo', 'Vui lòng nhập tiêu đề bài viết!', 'warning');
        return;
    }
    
    if (!content || content.trim() === '' || content === '<p><br></p>') {
        showToast('Cảnh báo', 'Vui lòng nhập nội dung bài viết!', 'warning');
        return;
    }
    
    if (!category) {
        showToast('Cảnh báo', 'Vui lòng chọn danh mục!', 'warning');
        return;
    }
    
    showSpinner();
    
    try {
        const response = await fetch('/admin/api/create-article', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: title,
                content: content,
                category_id: parseInt(category),
                summary: description,
                thumbnail: thumbnail,
                tags: tags,
                status: 'draft'
            })
        });
        
        const result = await response.json();
        
        hideSpinner();
        
        if (result.success) {
            showToast('Thành công', 'Bài viết đã được lưu vào bản nháp', 'success');
            
            // Clear form
            $('#articleForm')[0].reset();
            $('#articleContent').summernote('code', '');
            $('#imagePreview').html('');
            $('#articleImageUrl').val('');
            
            // Update stats
            const drafts = parseInt($('#statDrafts').text()) + 1;
            $('#statDrafts').text(drafts);
            $('#draftCount').text(drafts);
            
            // Reload articles
            loadMyArticles();
        } else {
            showToast('Lỗi', result.error || 'Không thể lưu bài viết', 'warning');
        }
    } catch (error) {
        hideSpinner();
        console.error('Lỗi lưu bài viết:', error);
        showToast('Lỗi', 'Có lỗi xảy ra khi lưu bài viết', 'warning');
    }
}

// Submit article
async function submitArticle() {
    const title = $('#articleTitle').val().trim();
    const content = $('#articleContent').summernote('code');
    const category = $('#articleCategory').val();
    const description = $('#articleDescription').val().trim();
    const thumbnail = $('#articleImageUrl').val() || '';
    const tags = $('#articleTags').val().trim();
    
    // Validation
    if (!title) {
        showToast('Cảnh báo', 'Vui lòng nhập tiêu đề bài viết!', 'warning');
        return;
    }
    
    if (!content || content.trim() === '' || content === '<p><br></p>') {
        showToast('Cảnh báo', 'Vui lòng nhập nội dung bài viết!', 'warning');
        return;
    }
    
    if (!category) {
        showToast('Cảnh báo', 'Vui lòng chọn danh mục!', 'warning');
        return;
    }
    
    showSpinner();
    
    try {
        const response = await fetch('/admin/api/create-article', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: title,
                content: content,
                category_id: parseInt(category),
                summary: description,
                thumbnail: thumbnail,
                tags: tags,
                status: 'pending'
            })
        });
        
        const result = await response.json();
        
        hideSpinner();
        
        if (result.success) {
            showToast('Thành công', 'Bài viết đã được gửi để duyệt', 'success');
            
            // Clear form
            $('#articleForm')[0].reset();
            $('#articleContent').summernote('code', '');
            $('#imagePreview').html('');
            $('#articleImageUrl').val('');
            
            // Update stats
            const pending = parseInt($('#statPending').text()) + 1;
            const total = parseInt($('#statTotal').text()) + 1;
            $('#statPending').text(pending);
            $('#statTotal').text(total);
            $('#pendingCount').text(pending);
            
            // Reload articles
            loadMyArticles();
        } else {
            showToast('Lỗi', result.error || 'Không thể gửi bài viết', 'warning');
        }
    } catch (error) {
        hideSpinner();
        console.error('Lỗi gửi bài viết:', error);
        showToast('Lỗi', 'Có lỗi xảy ra khi gửi bài viết', 'warning');
    }
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

// RSS Feed handlers
$(document).on('click', '.rss-preset', function(e) {
    e.preventDefault();
    $('#rssFeedUrl').val($(this).data('url'));
});

$('#fetchRssBtn').click(function() {
    const rssUrl = $('#rssFeedUrl').val().trim();
    const limit = $('#rssLimit').val() || 20;
    
    if (!rssUrl) {
        alert('Vui lòng nhập URL RSS feed');
        return;
    }
    
    $(this).prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Đang tải...');
    
    $.ajax({
        url: '/admin/api/fetch-api-news',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            source_type: 'rss',
            rss_url: rssUrl,
            limit: parseInt(limit)
        }),
        success: function(response) {
            if (response.success) {
                displayRssArticles(response.data);
                showToast('Thành công', `Đã tải ${response.count} bài viết từ RSS`, 'success');
            } else {
                alert('Lỗi: ' + response.error);
            }
        },
        error: function(xhr) {
            const error = xhr.responseJSON ? xhr.responseJSON.error : 'Không thể kết nối đến server';
            alert('Lỗi: ' + error);
        },
        complete: function() {
            $('#fetchRssBtn').prop('disabled', false).html('<i class="fas fa-download"></i> Tải bài');
        }
    });
});

function displayRssArticles(articles) {
    if (!articles || articles.length === 0) {
        $('#rssArticlesList').html('<p class="text-muted text-center">Không có bài viết nào</p>');
        return;
    }
    
    let html = '<div class="row">';
    articles.forEach((article, index) => {
        html += `
            <div class="col-md-6 mb-3">
                <div class="card">
                    <div class="card-body">
                        <h6 class="card-title">${article.title}</h6>
                        <p class="card-text small text-muted">${article.summary.substring(0, 150)}...</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted"><i class="fas fa-calendar"></i> ${new Date(article.published_at).toLocaleString('vi-VN')}</small>
                            <button class="btn btn-sm btn-primary save-rss-article" data-index="${index}">
                                <i class="fas fa-save"></i> Lưu
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    $('#rssArticlesList').html(html);
    window.rssArticlesData = articles;
}

// API News handlers
$('#fetchApiBtn').click(function() {
    const apiUrl = $('#apiUrl').val().trim();
    const apiKey = $('#apiKey').val().trim();
    const country = $('#apiCountry').val();
    const category = $('#apiCategory').val();
    const limit = $('#apiLimit').val() || 20;
    
    if (!apiKey) {
        alert('Vui lòng nhập API key');
        return;
    }
    
    $(this).prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Đang tải...');
    
    $.ajax({
        url: '/admin/api/fetch-api-news',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            source_type: 'api',
            api_url: apiUrl,
            api_key: apiKey,
            country: country,
            category: category,
            limit: parseInt(limit)
        }),
        success: function(response) {
            if (response.success) {
                displayApiArticles(response.data);
                showToast('Thành công', `Đã tải ${response.count} bài viết từ API`, 'success');
            } else {
                alert('Lỗi: ' + response.error);
            }
        },
        error: function(xhr) {
            const error = xhr.responseJSON ? xhr.responseJSON.error : 'Không thể kết nối đến server';
            alert('Lỗi: ' + error);
        },
        complete: function() {
            $('#fetchApiBtn').prop('disabled', false).html('<i class="fas fa-download"></i> Tải bài từ API');
        }
    });
});

function displayApiArticles(articles) {
    if (!articles || articles.length === 0) {
        $('#apiArticlesList').html('<p class="text-muted text-center">Không có bài viết nào</p>');
        return;
    }
    
    let html = '<div class="row">';
    articles.forEach((article, index) => {
        html += `
            <div class="col-md-6 mb-3">
                <div class="card">
                    ${article.thumbnail ? `<img src="${article.thumbnail}" class="card-img-top" alt="thumbnail" style="height: 200px; object-fit: cover;">` : ''}
                    <div class="card-body">
                        <h6 class="card-title">${article.title}</h6>
                        <p class="card-text small text-muted">${article.summary.substring(0, 150)}...</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted"><i class="fas fa-calendar"></i> ${new Date(article.published_at).toLocaleString('vi-VN')}</small>
                            <button class="btn btn-sm btn-primary save-api-article" data-index="${index}">
                                <i class="fas fa-save"></i> Lưu
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    $('#apiArticlesList').html(html);
    window.apiArticlesData = articles;
}

// Save RSS article
$(document).on('click', '.save-rss-article', function() {
    const index = $(this).data('index');
    const article = window.rssArticlesData[index];
    
    if (!article) {
        alert('Không tìm thấy bài viết');
        return;
    }
    
    // TODO: Show modal to select category and status, then save
    console.log('Save RSS article:', article);
    alert('Chức năng lưu bài sẽ được hoàn thiện sau. Bài viết: ' + article.title);
});

// Save API article
$(document).on('click', '.save-api-article', function() {
    const index = $(this).data('index');
    const article = window.apiArticlesData[index];
    
    if (!article) {
        alert('Không tìm thấy bài viết');
        return;
    }
    
    // TODO: Show modal to select category and status, then save
    console.log('Save API article:', article);
    alert('Chức năng lưu bài sẽ được hoàn thiện sau. Bài viết: ' + article.title);
});
