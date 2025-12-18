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
    loadMyArticles(); // Bài viết của tôi (tất cả trạng thái, trang 1)
    
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

        // Lazy load dữ liệu cho các tab khi được mở
        if (section === 'my-articles') {
            loadMyArticles(1, $('#filterStatus').val(), $('#searchMyArticles').val().trim());
        } else if (section === 'drafts') {
            loadDrafts();
        } else if (section === 'pending') {
            loadPendingArticlesEditor();
        } else if (section === 'published') {
            loadPublishedArticles();
        }
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
    
    // Filter articles trong tab "Bài viết của tôi"
    $('#filterStatus').change(function() {
        const status = $(this).val();
        loadMyArticles(1, status, $('#searchMyArticles').val().trim());
    });

    // Tìm kiếm trong "Bài viết của tôi"
    $('#searchMyArticles').on('keypress', function (e) {
        if (e.which === 13) { // Enter
            e.preventDefault();
            loadMyArticles(1, $('#filterStatus').val(), $(this).val().trim());
        }
    });

    // Tìm kiếm ở tab Bản nháp
    $('#searchDrafts').on('keypress', function (e) {
        if (e.which === 13) {
            e.preventDefault();
            loadDrafts(1);
        }
    });

    // Tìm kiếm ở tab Chờ duyệt
    $('#searchPending').on('keypress', function (e) {
        if (e.which === 13) {
            e.preventDefault();
            loadPendingArticlesEditor(1);
        }
    });

    // Tìm kiếm ở tab Đã xuất bản
    $('#searchPublished').on('keypress', function (e) {
        if (e.which === 13) {
            e.preventDefault();
            loadPublishedArticles(1);
        }
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
    
    // Edit article image upload handler
    $('#editArticleImage').change(function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                $('#editArticleImagePreview').attr('src', e.target.result);
            };
            reader.readAsDataURL(file);
            
            // Upload image immediately
            uploadArticleImage(file, $('#editArticleId').val()).then(function(url) {
                if (url) {
                    $('#editArticleImageUrl').val(url);
                    $('#editArticleImagePreview').attr('src', url);
                }
            });
        }
    });
    
    // Initialize tag autocomplete for all tag inputs
    initTagAutocomplete('#articleTags', '#tagSuggestions');
    initTagAutocomplete('#editArticleTags', '#editTagSuggestions');
    initTagAutocomplete('#intArticleTags', '#intTagSuggestions');
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

// Load my articles from API (database, joined with categories) với phân trang & lọc
async function loadMyArticles(page = 1, status = null, search = null) {
    try {
        showSpinner();

        const params = new URLSearchParams();
        params.append('page', page);
        params.append('per_page', 10);
        if (status && status !== 'all') {
            params.append('status', status);
        }
        if (search) {
            params.append('search', search);
        }

        const response = await fetch(`/admin/api/my-articles?${params.toString()}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
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
            date: item.created_at || item.published_at || ''
        }));

        const pagination = result.pagination || {};
        displayArticles(articles, 'myArticlesTable');
        updatePagination(
            pagination,
            'myArticlesPagination',
            (newPage) => loadMyArticles(newPage, $('#filterStatus').val(), $('#searchMyArticles').val().trim())
        );
        updateInfoText(pagination, 'myArticlesInfo');
    } catch (error) {
        console.error('Lỗi tải bài viết:', error);
        hideSpinner();
        showToast('Lỗi', 'Có lỗi xảy ra khi tải danh sách bài viết', 'warning');
    }
}

// Load danh sách bản nháp
function loadDrafts(page = 1) {
    const search = $('#searchDrafts').val() ? $('#searchDrafts').val().trim() : null;
    fetchMyArticlesForSection('draft', page, search, 'draftsTable', 'draftsPagination', 'draftsInfo');
}

// Load danh sách chờ duyệt
function loadPendingArticlesEditor(page = 1) {
    const search = $('#searchPending').val() ? $('#searchPending').val().trim() : null;
    fetchMyArticlesForSection('pending', page, search, 'pendingTable', 'pendingPagination', 'pendingInfo');
}

// Load danh sách đã xuất bản
function loadPublishedArticles(page = 1) {
    const search = $('#searchPublished').val() ? $('#searchPublished').val().trim() : null;
    fetchMyArticlesForSection('published', page, search, 'publishedTable', 'publishedPagination', 'publishedInfo');
}

// Hàm dùng chung để load bài viết cho từng section
async function fetchMyArticlesForSection(status, page, search, tableId, paginationId, infoId) {
    try {
        showSpinner();

        const params = new URLSearchParams();
        params.append('page', page);
        params.append('per_page', 10);
        if (status) {
            params.append('status', status);
        }
        if (search) {
            params.append('search', search);
        }

        const response = await fetch(`/admin/api/my-articles?${params.toString()}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        const result = await response.json();
        hideSpinner();

        if (!result.success) {
            showToast('Lỗi', result.error || 'Không thể tải danh sách bài viết', 'warning');
            return;
        }

        const articles = (result.data || []).map(item => ({
            id: item.id,
            title: item.title,
            category: item.category_name || (item.category && item.category.name) || '',
            status: item.status,
            visible: item.visible !== undefined ? item.visible : true,
            date: item.created_at || item.published_at || ''
        }));

        const pagination = result.pagination || {};
        displayArticles(articles, tableId);
        updatePagination(
            pagination,
            paginationId,
            (newPage) => fetchMyArticlesForSection(status, newPage, search, tableId, paginationId, infoId)
        );
        updateInfoText(pagination, infoId);
    } catch (error) {
        console.error('Lỗi tải bài viết:', error);
        hideSpinner();
        showToast('Lỗi', 'Có lỗi xảy ra khi tải danh sách bài viết', 'warning');
    }
}

// Display articles vào bảng theo ID
function displayArticles(articles, tableBodyId) {
    let html = '';
    articles.forEach((article, index) => {
        const statusBadge = getStatusBadge(article.status);
        const checked = article.visible ? 'checked' : '';
        
        const date = new Date(article.date + 'Z');

        const dateVN = date.toLocaleString('sv-SE', {
            timeZone: 'Asia/Ho_Chi_Minh', // Chuyển sang múi giờ VN
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false // Sử dụng định dạng 24h
        });

        html += '';
        html += '<tr>';
        // html += '<td>' + (index + 1) + '</td>';
        html += '<td><strong>' + article.title + '</strong></td>';
        html += '<td><span class="badge bg-primary">' + article.category + '</span></td>';
        if (tableBodyId != 'draftsTable' && tableBodyId != 'publishedTable') {
            html += '<td>' + statusBadge + '</td>';
        } else {
            html += '<td style="display: none;">'+ statusBadge +'</td>';
        }
        html += '<td style="display: none;">';
        html += '<label class="visibility-switch">';
        html += '<input type="checkbox" class="visibility-toggle" data-id="' + article.id + '" ' + checked + '>';
        html += '<span class="visibility-slider"></span>';
        html += '</label>';
        html += '</td>';
        html += '<td>' + (dateVN) + '</td>';
        html += '<td>';
        if (article.status === 'draft') {
            html += '<button class="btn btn-sm btn-info btn-action btn-edit" data-id="' + article.id + '" title="Chỉnh sửa">';
            html += '<i class="fas fa-edit"></i>';
            html += '</button>';
        }
        html += '<button class="btn btn-sm btn-danger btn-action btn-delete" data-id="' + article.id + '" title="Xóa">';
        html += '<i class="fas fa-trash"></i>';
        html += '</button>';
        html += '</td>';
        html += '</tr>';
    });
    
    $('#' + tableBodyId).html(html);
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

// Cập nhật thanh phân trang
function updatePagination(pagination, containerId, onPageClick) {
    const container = $('#' + containerId);
    container.empty();

    const page = pagination.page || 1;
    const totalPages = pagination.pages || 1;

    if (totalPages <= 1) {
        return;
    }

    const createPageItem = (p, label = null, disabled = false, active = false) => {
        const li = $('<li>').addClass('page-item');
        if (disabled) li.addClass('disabled');
        if (active) li.addClass('active');

        const a = $('<a>')
            .addClass('page-link')
            .attr('href', '#')
            .attr('data-page', p)
            .text(label || p);

        a.on('click', function (e) {
            e.preventDefault();
            if (!disabled && !active) {
                onPageClick(p);
            }
        });

        li.append(a);
        container.append(li);
    };

    createPageItem(page - 1, '«', page <= 1, false);

    for (let p = 1; p <= totalPages; p++) {
        createPageItem(p, null, false, p === page);
    }

    createPageItem(page + 1, '»', page >= totalPages, false);
}

// Hiển thị thông tin phân trang
function updateInfoText(pagination, infoElementId) {
    const infoEl = $('#' + infoElementId);
    const page = pagination.page || 1;
    const perPage = pagination.per_page || 10;
    const total = pagination.total || 0;

    if (!total) {
        infoEl.text('Không có bản ghi nào.');
        return;
    }

    const start = (page - 1) * perPage + 1;
    const end = Math.min(page * perPage, total);
    infoEl.text(`Hiển thị ${start}-${end} trên tổng ${total} bài viết`);
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
    const tags = normalizeTagString($('#articleTags').val());
    
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

function normalizeTagString(tagsString) {
    return tagsString.trim().replace(/[,;]+/g, ',');
}

// Submit article
async function submitArticle() {
    const title = $('#articleTitle').val().trim();
    const content = $('#articleContent').summernote('code');
    const category = $('#articleCategory').val();
    const description = $('#articleDescription').val().trim();
    const thumbnail = $('#articleImageUrl').val() || '';
    const tags = normalizeTagString($('#articleTags').val());
    
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
async function editArticle(articleId) {
    try {
        const response = await fetch(`/admin/api/article/${articleId}`);
        const result = await response.json();
        if (result.success) {
            const article = result.data;
            
            // Load categories if not already loaded
            if ($('#editArticleCategory option').length <= 1) {
                try {
                    const catResponse = await fetch('/admin/api/categories');
                    const catResult = await catResponse.json();
                    if (catResult.success && catResult.data) {
                        let categoryOptions = '<option value="">Chọn danh mục</option>';
                        catResult.data.forEach(cat => {
                            categoryOptions += `<option value="${cat.id}">${cat.name}</option>`;
                        });
                        $('#editArticleCategory').html(categoryOptions);
                    }
                } catch (error) {
                    console.error('Lỗi tải danh mục:', error);
                }
            }
            
            $('#editArticleId').val(article.id);
            $('#editArticleTitle').val(article.title);
            $('#editArticleContent').summernote('code', article.content);
            $('#editArticleCategory').val(article.category_id);
            $('#editArticleDescription').val(article.summary);
            $('#editArticleImageUrl').val(article.thumbnail || '');
            $('#editArticleImagePreview').attr('src', article.thumbnail || '/static/images/default-image.jpg');
            $('#editArticleTags').val(article.tags || '');
            
            const modal = new bootstrap.Modal(document.getElementById('editModal'));
            modal.show();
        } else {
            showToast('Lỗi', result.error || 'Không thể tải bài viết', 'warning');
        }
    } catch (error) {
        console.error('Lỗi tải bài viết:', error);
        showToast('Lỗi', 'Có lỗi xảy ra khi tải bài viết', 'warning');
    }
}

// Save edit
async function saveEdit() {
    const articleId = $('#editArticleId').val();
    const title = $('#editArticleTitle').val();
    const content = $('#editArticleContent').summernote('code');
    const category = $('#editArticleCategory').val();
    const description = $('#editArticleDescription').val();
    const image = $('#editArticleImageUrl').val();
    const tags = $('#editArticleTags').val();
    if (!title) {
        showToast('Cảnh báo', 'Vui lòng nhập tiêu đề bài viết!', 'warning');
        return;
    }
    
    if (!content) {
        showToast('Cảnh báo', 'Vui lòng nhập nội dung bài viết!', 'warning');
        return;
    }
    if (!category) {
        showToast('Cảnh báo', 'Vui lòng chọn danh mục!', 'warning');
        return;
    }
    if (!description) {
        showToast('Cảnh báo', 'Vui lòng nhập mô tả ngắn gọn về bài viết!', 'warning');
        return;
    }
    if (!image) {
        showToast('Cảnh báo', 'Vui lòng chọn ảnh đại diện!', 'warning');
        return;
    }
    if (!tags) {
        showToast('Cảnh báo', 'Vui lòng nhập tags!', 'warning');
        return;
    }
    try {
        const response = await fetch(`/admin/api/edit-article/${articleId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: articleId,
                title: title,
                content: content,
                category_id: parseInt(category),
                summary: description,
                thumbnail: image,
                tags: tags
            })
        });
        const result = await response.json();
        if (result.success) {
            showToast('Thành công', 'Bài viết đã được cập nhật', 'success');
            bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
            loadMyArticles();
        } else {
            showToast('Lỗi', result.error || 'Không thể cập nhật bài viết', 'warning');
        }
    } catch (error) {
        hideSpinner();
        console.error('Lỗi cập nhật bài viết:', error);
        showToast('Lỗi', 'Có lỗi xảy ra khi cập nhật bài viết', 'warning');
    }
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

// ===== Tag Autocomplete Functionality =====

let tagSuggestionsCache = [];

// Initialize tag autocomplete for an input
function initTagAutocomplete(inputSelector, suggestionsSelector) {
    const $input = $(inputSelector);
    const $suggestions = $(suggestionsSelector);
    
    // Load all tags on first use
    if (tagSuggestionsCache.length === 0) {
        loadAllTags();
    }
    
    $input.on('input', function() {
        const value = $(this).val();
        const cursorPos = this.selectionStart;
        const textBeforeCursor = value.substring(0, cursorPos);
        
        // Check if user is typing after a #
        const lastHashIndex = textBeforeCursor.lastIndexOf('#');
        if (lastHashIndex !== -1) {
            const textAfterHash = textBeforeCursor.substring(lastHashIndex + 1);
            // Check if there's no space or comma after the #
            if (!textAfterHash.match(/[\s,]/)) {
                const searchTerm = textAfterHash.toLowerCase();
                showTagSuggestions($input, $suggestions, searchTerm, lastHashIndex);
                return;
            }
        }
        
        // Hide suggestions if not typing after #
        hideTagSuggestions($suggestions);
    });
    
    $input.on('keydown', function(e) {
        const $activeSuggestion = $suggestions.find('.suggestion-item.active');
        
        if ($suggestions.is(':visible') && $activeSuggestion.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                const $next = $activeSuggestion.next('.suggestion-item');
                if ($next.length) {
                    $activeSuggestion.removeClass('active');
                    $next.addClass('active');
                } else {
                    $suggestions.find('.suggestion-item').first().addClass('active');
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const $prev = $activeSuggestion.prev('.suggestion-item');
                if ($prev.length) {
                    $activeSuggestion.removeClass('active');
                    $prev.addClass('active');
                } else {
                    $suggestions.find('.suggestion-item').last().addClass('active');
                }
            } else if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                const tagName = $activeSuggestion.data('tag');
                if (tagName) {
                    insertTag($input, tagName);
                    hideTagSuggestions($suggestions);
                }
            } else if (e.key === 'Escape') {
                hideTagSuggestions($suggestions);
            }
        }
    });
    
    // Hide suggestions when clicking outside
    $(document).on('click', function(e) {
        if (!$(e.target).closest(inputSelector).length && !$(e.target).closest(suggestionsSelector).length) {
            hideTagSuggestions($suggestions);
        }
    });
}

// Load all tags from API
async function loadAllTags() {
    try {
        const response = await fetch('/admin/api/tags');
        const result = await response.json();
        if (result.success) {
            tagSuggestionsCache = result.data.map(tag => tag.name);
        }
    } catch (error) {
        console.error('Lỗi tải tags:', error);
    }
}

// Show tag suggestions
function showTagSuggestions($input, $suggestions, searchTerm, hashIndex) {
    if (!searchTerm) {
        // Show all tags if no search term
        const filteredTags = tagSuggestionsCache.slice(0, 10);
        renderSuggestions($input, $suggestions, filteredTags, hashIndex);
        return;
    }
    
    // Filter tags by search term
    const filteredTags = tagSuggestionsCache
        .filter(tag => tag.toLowerCase().includes(searchTerm))
        .slice(0, 10);
    
    renderSuggestions($input, $suggestions, filteredTags, hashIndex);
}

// Render suggestions
function renderSuggestions($input, $suggestions, tags, hashIndex) {
    if (tags.length === 0) {
        hideTagSuggestions($suggestions);
        return;
    }
    
    let html = '<div class="suggestion-list">';
    tags.forEach((tag, index) => {
        html += `<div class="suggestion-item ${index === 0 ? 'active' : ''}" data-tag="${tag}">#${tag}</div>`;
    });
    html += '</div>';
    
    $suggestions.html(html).show();
    
    // Handle click on suggestion
    $suggestions.off('click', '.suggestion-item').on('click', '.suggestion-item', function() {
        const tagName = $(this).data('tag');
        insertTag($input, tagName);
        hideTagSuggestions($suggestions);
    });
}

// Insert tag into input
function insertTag($input, tagName) {
    const value = $input.val();
    const cursorPos = $input[0].selectionStart;
    const textBeforeCursor = value.substring(0, cursorPos);
    
    const lastHashIndex = textBeforeCursor.lastIndexOf('#');
    if (lastHashIndex !== -1) {
        const beforeHash = value.substring(0, lastHashIndex);
        const afterCursor = value.substring(cursorPos);
        const newValue = beforeHash + '#' + tagName + ' ' + afterCursor;
        $input.val(newValue);
        
        // Set cursor position after inserted tag
        const newCursorPos = beforeHash.length + tagName.length + 2;
        $input[0].setSelectionRange(newCursorPos, newCursorPos);
        $input.focus();
    }
}

// Hide tag suggestions
function hideTagSuggestions($suggestions) {
    $suggestions.hide();
}
