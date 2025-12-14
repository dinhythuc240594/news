$(document).ready(function() {
    // Check authentication
    checkAuth();
    
    // Load user info
    loadUserInfo();
    
    // Initialize chart
    initializeChart();
    
    // Load initial data
    loadPendingArticles();
    loadAPIArticles();
    loadStatistics();
    loadHotArticles();
    
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
        
        // Load data for the section
        loadSectionData(section);
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
    
    // Fetch API articles
    $('#fetchAPIBtn').click(function() {
        fetchAPIArticles();
    });
    
    // Approve article
    $(document).on('click', '.btn-approve', function() {
        const articleId = $(this).data('id');
        approveArticle(articleId);
    });
    
    // Save API article
    $(document).on('click', '.btn-save-api', function() {
        const articleData = JSON.parse($(this).data('article'));
        openSaveAPIArticleModal(articleData);
    });
    
    // Preview API article
    $(document).on('click', '.btn-preview-api', function() {
        const articleData = JSON.parse($(this).data('article'));
        previewAPIArticle(articleData);
    });
    
    // Save API article form submit
    $('#saveAPIArticleBtn').click(function() {
        saveAPIArticle();
    });
    
    // Reject article
    $(document).on('click', '.btn-reject', function() {
        const articleId = $(this).data('id');
        const reason = prompt('Lý do từ chối:');
        if (reason) {
            rejectArticle(articleId, reason);
        }
    });
    
    // Preview article
    $(document).on('click', '.btn-preview', function() {
        const articleId = $(this).data('id');
        previewArticle(articleId);
    });
    
    // Modal approve/reject
    $('#approveBtn').click(function() {
        const articleId = $(this).data('id');
        approveArticle(articleId);
        $('#previewModal').modal('hide');
    });
    
    $('#rejectBtn').click(function() {
        const articleId = $(this).data('id');
        const reason = prompt('Lý do từ chối:');
        if (reason) {
            rejectArticle(articleId, reason);
            $('#previewModal').modal('hide');
        }
    });
});

// Check authentication
async function checkAuth() {
    try {
        const response = await fetch('/admin/api/current-user');
        const result = await response.json();
        
        if (!result.success || result.data.role !== 'admin') {
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
        'pending': 'Bài viết chờ duyệt',
        'approved': 'Bài viết đã duyệt',
        'rejected': 'Bài viết bị từ chối',
        'api': 'Bài viết từ API',
        'international': 'Bài báo Quốc tế',
        'international-pending': 'Quốc tế chờ duyệt',
        'users': 'Quản lý người dùng',
        'statistics': 'Thống kê'
    };
    $('#pageTitle').text(titles[section] || 'Dashboard');
}

// Load data for specific section
async function loadSectionData(section) {
    switch(section) {
        case 'pending':
            loadPendingArticles();
            break;
        case 'approved':
            loadApprovedArticles();
            break;
        case 'rejected':
            loadRejectedArticles();
            break;
        case 'api':
            loadAPIArticles();
            break;
        case 'international':
            loadInternationalArticles();
            break;
        case 'international-pending':
            loadInternationalPending();
            break;
        case 'dashboard':
            loadStatistics();
            loadHotArticles();
            break;
    }
}

// Load approved articles
async function loadApprovedArticles() {
    try {
        const response = await fetch('/admin/api/approved-articles');
        const result = await response.json();
        
        if (result.success && result.data) {
            let html = '';
            result.data.forEach((article, index) => {
                html += `
                    <tr>
                        <td>${index + 1}</td>
                        <td><strong>${article.title}</strong></td>
                        <td>${article.author}</td>
                        <td><span class="badge bg-primary">${article.category}</span></td>
                        <td>${article.date}</td>
                        <td><span class="badge bg-success">${article.views} lượt xem</span></td>
                        <td>
                            <button class="btn btn-sm btn-info btn-action" title="Xem">
                                <i class="fas fa-eye"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            if (result.data.length === 0) {
                html = '<tr><td colspan="7" class="text-center text-muted">Không có bài viết nào</td></tr>';
            }
            
            $('#approved').find('tbody').html(html);
        }
    } catch (error) {
        console.error('Lỗi tải bài viết đã duyệt:', error);
    }
}

// Load rejected articles
async function loadRejectedArticles() {
    try {
        const response = await fetch('/admin/api/rejected-articles');
        const result = await response.json();
        
        if (result.success && result.data) {
            let html = '';
            result.data.forEach((article, index) => {
                html += `
                    <tr>
                        <td>${index + 1}</td>
                        <td><strong>${article.title}</strong></td>
                        <td>${article.author}</td>
                        <td><span class="badge bg-primary">${article.category}</span></td>
                        <td>${article.date}</td>
                        <td>
                            <button class="btn btn-sm btn-info btn-action" title="Xem">
                                <i class="fas fa-eye"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            if (result.data.length === 0) {
                html = '<tr><td colspan="6" class="text-center text-muted">Không có bài viết nào</td></tr>';
            }
            
            $('#rejected').find('tbody').html(html);
        }
    } catch (error) {
        console.error('Lỗi tải bài viết bị từ chối:', error);
    }
}

// Load international articles
async function loadInternationalArticles() {
    try {
        const response = await fetch('/admin/api/international-articles');
        const result = await response.json();
        
        if (result.success && result.data) {
            let html = '';
            result.data.forEach((article, index) => {
                html += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${article.title}</td>
                        <td><span class="badge bg-info">${article.category}</span></td>
                        <td>${article.author}</td>
                        <td><span class="badge bg-success">${article.status}</span></td>
                        <td>${article.views}</td>
                        <td>${article.published}</td>
                        <td>
                            <button class="btn btn-sm btn-primary"><i class="fas fa-eye"></i></button>
                            <button class="btn btn-sm btn-warning"><i class="fas fa-edit"></i></button>
                            <button class="btn btn-sm btn-danger"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `;
            });
            
            if (result.data.length === 0) {
                html = '<tr><td colspan="8" class="text-center text-muted">Không có bài viết nào</td></tr>';
            }
            
            $('#international').find('tbody').html(html);
        }
    } catch (error) {
        console.error('Lỗi tải bài viết quốc tế:', error);
    }
}

// Load international pending
async function loadInternationalPending() {
    try {
        const response = await fetch('/admin/api/international-pending');
        const result = await response.json();
        
        if (result.success && result.data) {
            let html = '';
            result.data.forEach((article, index) => {
                html += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${article.title}</td>
                        <td><span class="badge bg-warning">${article.category}</span></td>
                        <td>${article.author}</td>
                        <td>${article.submitted}</td>
                        <td>
                            <button class="btn btn-sm btn-primary btn-preview" data-id="${article.id}"><i class="fas fa-eye"></i> Review</button>
                            <button class="btn btn-sm btn-success btn-approve" data-id="${article.id}"><i class="fas fa-check"></i> Approve</button>
                            <button class="btn btn-sm btn-danger btn-reject" data-id="${article.id}"><i class="fas fa-times"></i> Reject</button>
                        </td>
                    </tr>
                `;
            });
            
            if (result.data.length === 0) {
                html = '<tr><td colspan="6" class="text-center text-muted">Không có bài viết nào</td></tr>';
            }
            
            $('#international-pending').find('tbody').html(html);
        }
    } catch (error) {
        console.error('Lỗi tải bài viết quốc tế chờ duyệt:', error);
    }
}

// Load hot articles
async function loadHotArticles() {
    try {
        const response = await fetch('/admin/api/hot-articles');
        const result = await response.json();
        
        if (result.success && result.data) {
            let html = '';
            result.data.forEach((article, index) => {
                html += `
                    <div class="hot-article">
                        <h6>${article.title}</h6>
                        <small class="text-muted"><i class="far fa-eye"></i> ${article.views.toLocaleString()} lượt xem</small>
                    </div>
                `;
            });
            
            if (result.data.length === 0) {
                html = '<p class="text-muted">Chưa có bài viết hot</p>';
            }
            
            $('#hotArticlesContainer').html(html);
        }
    } catch (error) {
        console.error('Lỗi tải bài viết hot:', error);
    }
}

// Load statistics
async function loadStatistics() {
    try {
        const response = await fetch('/admin/api/statistics');
        const result = await response.json();
        
        if (result.success && result.data) {
            $('#statPending').text(result.data.pending);
            $('#statApproved').text(result.data.approved);
            $('#statRejected').text(result.data.rejected);
            $('#statAPI').text(result.data.api);
            $('#pendingCount').text(result.data.pending);
        }
    } catch (error) {
        console.error('Lỗi tải thống kê:', error);
    }
}

// Load pending articles
async function loadPendingArticles() {
    try {
        const response = await fetch('/admin/api/pending-articles');
        const result = await response.json();
        
        if (result.success && result.data) {
            let html = '';
            result.data.forEach((article, index) => {
                html += `
                    <tr>
                        <td>${index + 1}</td>
                        <td><strong>${article.title}</strong></td>
                        <td>${article.author}</td>
                        <td><span class="badge bg-primary">${article.category}</span></td>
                        <td>${article.date}</td>
                        <td>
                            <button class="btn btn-sm btn-info btn-action btn-preview" data-id="${article.id}" title="Xem trước">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-success btn-action btn-approve" data-id="${article.id}" title="Duyệt">
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="btn btn-sm btn-danger btn-action btn-reject" data-id="${article.id}" title="Từ chối">
                                <i class="fas fa-times"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            if (result.data.length === 0) {
                html = '<tr><td colspan="6" class="text-center text-muted">Không có bài viết nào chờ duyệt</td></tr>';
            }
            
            $('#pendingArticlesTable').html(html);
        }
    } catch (error) {
        console.error('Lỗi tải bài viết chờ duyệt:', error);
        $('#pendingArticlesTable').html('<tr><td colspan="6" class="text-center text-danger">Lỗi tải dữ liệu</td></tr>');
    }
}

// Load API articles
async function loadAPIArticles() {
    try {
        const response = await fetch('/admin/api/api-articles');
        const result = await response.json();
        
        if (result.success && result.data) {
            let html = '';
            result.data.forEach((article, index) => {
                const date = article.published_at ? new Date(article.published_at).toLocaleString('vi-VN') : 'N/A';
                html += `
                    <tr>
                        <td>${index + 1}</td>
                        <td><strong>${article.title}</strong></td>
                        <td><span class="badge bg-info">${article.source}</span></td>
                        <td><span class="badge bg-primary">${article.category_name || 'N/A'}</span></td>
                        <td>${date}</td>
                        <td>
                            <button class="btn btn-sm btn-info btn-action btn-preview-api" data-article='${JSON.stringify(article)}' title="Xem trước">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-success btn-action btn-save-api" data-article='${JSON.stringify(article)}' title="Lưu bài viết">
                                <i class="fas fa-save"></i> Lưu
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            if (result.data.length === 0) {
                html = '<tr><td colspan="6" class="text-center text-muted">Chưa có bài viết nào từ API. Nhấn "Lấy bài mới từ API" để tải.</td></tr>';
            }
            
            $('#apiArticlesTable').html(html);
        }
    } catch (error) {
        console.error('Lỗi tải bài viết từ API:', error);
        $('#apiArticlesTable').html('<tr><td colspan="6" class="text-center text-danger">Lỗi tải dữ liệu</td></tr>');
    }
}

// Fetch API articles
async function fetchAPIArticles() {
    const btn = $('#fetchAPIBtn');
    btn.prop('disabled', true);
    btn.html('<i class="fas fa-spinner fa-spin"></i> Đang tải...');
    
    try {
        // Có thể thêm form để nhập API key và URL
        const apiKey = prompt('Nhập API Key (để trống nếu dùng mock data):') || '';
        const apiUrl = prompt('Nhập API URL (để trống nếu dùng mock data):') || '';
        
        const response = await fetch('/admin/api/fetch-api-news', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                api_key: apiKey,
                api_url: apiUrl || 'https://newsapi.org/v2/top-headlines'
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Thành công', result.message || 'Đã lấy bài viết mới từ API', 'success');
            loadAPIArticles();
            loadStatistics(); // Reload stats
        } else {
            showToast('Lỗi', result.error || 'Không thể lấy bài viết từ API', 'warning');
        }
    } catch (error) {
        console.error('Lỗi fetch API:', error);
        showToast('Lỗi', 'Có lỗi xảy ra khi lấy bài viết từ API', 'warning');
    } finally {
        btn.prop('disabled', false);
        btn.html('<i class="fas fa-sync-alt"></i> Lấy bài mới từ API');
    }
}

// Approve article
async function approveArticle(articleId) {
    if (confirm('Bạn có chắc muốn duyệt bài viết này?')) {
        showSpinner();
        
        try {
            const response = await fetch(`/admin/news/${articleId}/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const result = await response.json();
            
            hideSpinner();
            
            if (response.ok) {
                showToast('Thành công', 'Bài viết đã được duyệt và xuất bản', 'success');
                
                // Remove from table
                $(`button[data-id="${articleId}"]`).closest('tr').fadeOut(function() {
                    $(this).remove();
                });
                
                // Reload stats
                loadStatistics();
            } else {
                showToast('Lỗi', result.error || 'Không thể duyệt bài viết', 'warning');
            }
        } catch (error) {
            hideSpinner();
            console.error('Lỗi duyệt bài viết:', error);
            showToast('Lỗi', 'Có lỗi xảy ra khi duyệt bài viết', 'warning');
        }
    }
}

// Open save API article modal
async function openSaveAPIArticleModal(articleData) {
    // Load categories
    try {
        const response = await fetch('/admin/api/categories');
        const result = await response.json();
        
        let categoryOptions = '<option value="">-- Chọn danh mục --</option>';
        if (result.success && result.data) {
            result.data.forEach(cat => {
                categoryOptions += `<option value="${cat.id}">${cat.name}</option>`;
            });
        }
        
        $('#saveAPICategory').html(categoryOptions);
    } catch (error) {
        console.error('Lỗi tải danh mục:', error);
    }
    
    // Set article data
    $('#saveAPIArticleData').val(JSON.stringify(articleData));
    $('#saveAPITitle').val(articleData.title);
    $('#saveAPISummary').val(articleData.summary || '');
    $('#saveAPIStatus').val('draft'); // Default to draft
    
    const modal = new bootstrap.Modal(document.getElementById('saveAPIArticleModal'));
    modal.show();
}

// Save API article
async function saveAPIArticle() {
    const articleData = JSON.parse($('#saveAPIArticleData').val());
    const categoryId = $('#saveAPICategory').val();
    const status = $('#saveAPIStatus').val();
    
    if (!categoryId) {
        alert('Vui lòng chọn danh mục!');
        return;
    }
    
    showSpinner();
    
    try {
        const response = await fetch('/admin/api/save-api-article', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                article: articleData,
                category_id: parseInt(categoryId),
                status: status
            })
        });
        
        const result = await response.json();
        
        hideSpinner();
        
        if (result.success) {
            showToast('Thành công', result.message || 'Đã lưu bài viết', 'success');
            
            // Close modal
            bootstrap.Modal.getInstance(document.getElementById('saveAPIArticleModal')).hide();
            
            // Remove from table (find by title since we don't have persistent ID)
            $(`tr:contains("${articleData.title}")`).fadeOut(function() {
                $(this).remove();
            });
            
            // Reload stats
            loadStatistics();
            loadAPIArticles();
        } else {
            showToast('Lỗi', result.error || 'Không thể lưu bài viết', 'warning');
        }
    } catch (error) {
        hideSpinner();
        console.error('Lỗi lưu bài viết API:', error);
        showToast('Lỗi', 'Có lỗi xảy ra khi lưu bài viết', 'warning');
    }
}

// Preview API article
function previewAPIArticle(articleData) {
    const content = `
        <div class="article-preview">
            ${articleData.thumbnail ? `<img src="${articleData.thumbnail}" alt="${articleData.title}" style="width: 100%; border-radius: 8px; margin-bottom: 20px;">` : ''}
            <h3>${articleData.title}</h3>
            <div class="mb-3">
                <span class="badge bg-info">${articleData.source}</span>
                <small class="text-muted ms-2">Bởi ${articleData.author || 'Unknown'} - ${new Date(articleData.published_at).toLocaleString('vi-VN')}</small>
            </div>
            <div class="mb-3">
                <strong>Tóm tắt:</strong>
                <p>${articleData.summary || 'N/A'}</p>
            </div>
            <div>
                <strong>Nội dung:</strong>
                <div>${articleData.content || articleData.summary || 'N/A'}</div>
            </div>
            ${articleData.source_url ? `<div class="mt-3"><a href="${articleData.source_url}" target="_blank" class="btn btn-sm btn-outline-primary">Xem bài gốc</a></div>` : ''}
        </div>
    `;
    
    $('#previewContent').html(content);
    
    const modal = new bootstrap.Modal(document.getElementById('previewModal'));
    modal.show();
}

// Reject article
async function rejectArticle(articleId, reason) {
    showSpinner();
    
    try {
        const response = await fetch(`/admin/news/${articleId}/reject`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Reason': reason
            }
        });
        
        hideSpinner();
        
        if (response.ok) {
            showToast('Thông báo', 'Bài viết đã bị từ chối. Lý do: ' + reason, 'warning');
            
            // Remove from table
            $(`button[data-id="${articleId}"]`).closest('tr').fadeOut(function() {
                $(this).remove();
            });
            
            // Reload stats
            loadStatistics();
        } else {
            const result = await response.json();
            showToast('Lỗi', result.error || 'Không thể từ chối bài viết', 'warning');
        }
    } catch (error) {
        hideSpinner();
        console.error('Lỗi từ chối bài viết:', error);
        showToast('Lỗi', 'Có lỗi xảy ra khi từ chối bài viết', 'warning');
    }
}


// Preview article
function previewArticle(articleId) {
    // Simulate loading article data
    const article = {
        id: articleId,
        title: 'Thủ tướng phát biểu tại hội nghị kinh tế quốc tế',
        author: 'Nguyễn Văn A',
        category: 'Thời sự',
        date: '2024-12-13 14:30',
        image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800',
        content: `
            <p>Thủ tướng Chính phủ Phạm Minh Chính đã có bài phát biểu quan trọng tại Hội nghị Kinh tế Quốc tế...</p>
            <p>Trong bài phát biểu, Thủ tướng nhấn mạnh vai trò của Việt Nam trong khu vực và cam kết tạo môi trường đầu tư thuận lợi...</p>
            <p>Các nhà đầu tư quốc tế đánh giá cao những nỗ lực của Chính phủ Việt Nam trong cải thiện môi trường kinh doanh...</p>
        `
    };
    
    const content = `
        <div class="article-preview">
            <img src="${article.image}" alt="${article.title}" style="width: 100%; border-radius: 8px; margin-bottom: 20px;">
            <h3>${article.title}</h3>
            <div class="mb-3">
                <span class="badge bg-primary">${article.category}</span>
                <small class="text-muted ms-2">Bởi ${article.author} - ${article.date}</small>
            </div>
            <div>${article.content}</div>
        </div>
    `;
    
    $('#previewContent').html(content);
    $('#approveBtn').data('id', articleId);
    $('#rejectBtn').data('id', articleId);
    
    const modal = new bootstrap.Modal(document.getElementById('previewModal'));
    modal.show();
}

// Initialize chart
async function initializeChart() {
    const ctx = document.getElementById('articleChart');
    if (ctx) {
        try {
            const response = await fetch('/admin/api/chart-data');
            const result = await response.json();
            
            if (result.success && result.data) {
                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: result.data.labels,
                        datasets: result.data.datasets.map((dataset, index) => ({
                            label: dataset.label,
                            data: dataset.data,
                            borderColor: index === 0 ? '#c00' : '#27ae60',
                            backgroundColor: index === 0 ? 'rgba(192, 0, 0, 0.1)' : 'rgba(39, 174, 96, 0.1)',
                            tension: 0.4
                        }))
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'bottom'
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Lỗi tải dữ liệu biểu đồ:', error);
            // Fallback to default chart
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
                    datasets: [{
                        label: 'Bài viết mới',
                        data: [0, 0, 0, 0, 0, 0, 0],
                        borderColor: '#c00',
                        backgroundColor: 'rgba(192, 0, 0, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }
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
