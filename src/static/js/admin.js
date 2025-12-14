$(document).ready(function() {
    // Check authentication
    checkAuth();
    
    // Load user info
    loadUserInfo();
    
    // Initialize chart
    initializeChart();
    
    // Load initial data
    loadPendingArticles();
    // loadAPIArticles(); // Không tự động load API articles
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
    
    // Clear API filters
    $('#clearApiFilters').click(function() {
        clearAPIFilters();
    });
    
    // Apply filters on change
    $('#apiSource, #apiSearchInput, #apiSortBy, #apiPageSize').on('input change', function() {
        if (apiArticlesData.length > 0) {
            $('#apiCurrentPage').val(1);
            applyAPIFilters();
        }
    });
    
    // Pagination click
    $(document).on('click', '#apiPagination .page-link', function(e) {
        e.preventDefault();
        const page = parseInt($(this).data('page'));
        if (page && page > 0) {
            $('#apiCurrentPage').val(page);
            applyAPIFilters();
        }
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
        // Lấy thông tin từ form
        const limit = parseInt($('#apiLimit').val()) || 20;
        const startDate = $('#apiStartDate').val();
        const endDate = $('#apiEndDate').val();
        const country = $('#apiCountry').val();
        const category = $('#apiCategory').val();
        
        // Có thể thêm form để nhập API key và URL
        const apiKey = prompt('Nhập API Key (để trống nếu dùng mock data):') || '';
        const apiUrl = 'https://newsapi.org/v2/top-headlines';
        
        const response = await fetch('/admin/api/fetch-api-news', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                api_key: apiKey,
                api_url: apiUrl,
                limit: limit,
                start_date: startDate,
                end_date: endDate,
                country: country,
                category: category
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Thành công', result.message || 'Đã lấy bài viết mới từ API', 'success');
            // Hiển thị kết quả và áp dụng filter
            displayAPIArticles(result.data);
            $('#apiFilterResults').show();
            applyAPIFilters();
        } else {
            showToast('Lỗi', result.error || 'Không thể lấy bài viết từ API', 'warning');
        }
    } catch (error) {
        console.error('Lỗi fetch API:', error);
        showToast('Lỗi', 'Có lỗi xảy ra khi lấy bài viết từ API', 'warning');
    } finally {
        btn.prop('disabled', false);
        btn.html('<i class="fas fa-sync-alt"></i> Lấy dữ liệu từ API');
    }
}

// Store API articles data
let apiArticlesData = [];

// Display API articles
function displayAPIArticles(articles) {
    apiArticlesData = articles;
    applyAPIFilters();
}

// Apply filters to API articles
function applyAPIFilters() {
    let filtered = [...apiArticlesData];
    
    // Filter by source
    const sourceFilter = $('#apiSource').val().toLowerCase();
    if (sourceFilter) {
        filtered = filtered.filter(article => 
            article.source.toLowerCase().includes(sourceFilter)
        );
    }
    
    // Filter by keyword
    const keywordFilter = $('#apiSearchInput').val().toLowerCase();
    if (keywordFilter) {
        filtered = filtered.filter(article => 
            article.title.toLowerCase().includes(keywordFilter) ||
            (article.summary && article.summary.toLowerCase().includes(keywordFilter)) ||
            (article.content && article.content.toLowerCase().includes(keywordFilter))
        );
    }
    
    // Sort
    const sortBy = $('#apiSortBy').val();
    switch(sortBy) {
        case 'published_desc':
            filtered.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
            break;
        case 'published_asc':
            filtered.sort((a, b) => new Date(a.published_at) - new Date(b.published_at));
            break;
        case 'title_asc':
            filtered.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'title_desc':
            filtered.sort((a, b) => b.title.localeCompare(a.title));
            break;
        case 'source_asc':
            filtered.sort((a, b) => a.source.localeCompare(b.source));
            break;
    }
    
    // Pagination
    const pageSize = parseInt($('#apiPageSize').val()) || 20;
    const currentPage = parseInt($('#apiCurrentPage').val()) || 1;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginated = filtered.slice(startIndex, endIndex);
    
    // Display
    renderAPIArticlesTable(paginated);
    
    // Update info
    $('#apiResultsInfo').text(`Hiển thị ${startIndex + 1}-${Math.min(endIndex, filtered.length)} trong tổng số ${filtered.length} bài viết`);
    
    // Pagination
    renderAPIPagination(filtered.length, pageSize, currentPage);
}

// Render API articles table
function renderAPIArticlesTable(articles) {
    let html = '';
    
    if (articles.length === 0) {
        html = '<tr><td colspan="7" class="text-center text-muted">Không có bài viết nào phù hợp</td></tr>';
    } else {
        articles.forEach((article, index) => {
            const date = article.published_at ? new Date(article.published_at).toLocaleString('vi-VN') : 'N/A';
            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td><strong>${article.title}</strong></td>
                    <td><span class="badge bg-info">${article.source}</span></td>
                    <td><span class="badge bg-primary">${article.category_name || 'N/A'}</span></td>
                    <td>${article.author || 'N/A'}</td>
                    <td>${date}</td>
                    <td>
                        <button class="btn btn-sm btn-info btn-action btn-preview-api" data-article='${JSON.stringify(article).replace(/'/g, "&#39;")}' title="Xem trước">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-success btn-action btn-save-api" data-article='${JSON.stringify(article).replace(/'/g, "&#39;")}' title="Lưu bài viết">
                            <i class="fas fa-save"></i> Lưu
                        </button>
                    </td>
                </tr>
            `;
        });
    }
    
    $('#apiArticlesTable').html(html);
}

// Render pagination
function renderAPIPagination(total, pageSize, currentPage) {
    const totalPages = Math.ceil(total / pageSize);
    let html = '';
    
    if (totalPages <= 1) {
        $('#apiPagination').html('');
        return;
    }
    
    // Previous button
    html += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="${currentPage - 1}">Trước</a>
    </li>`;
    
    // Page numbers
    const maxPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);
    
    if (endPage - startPage < maxPages - 1) {
        startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    if (startPage > 1) {
        html += `<li class="page-item"><a class="page-link" href="#" data-page="1">1</a></li>`;
        if (startPage > 2) {
            html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        html += `<li class="page-item ${i === currentPage ? 'active' : ''}">
            <a class="page-link" href="#" data-page="${i}">${i}</a>
        </li>`;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
        html += `<li class="page-item"><a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a></li>`;
    }
    
    // Next button
    html += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="${currentPage + 1}">Sau</a>
    </li>`;
    
    $('#apiPagination').html(html);
    
    // Store current page
    $('<input>').attr({
        type: 'hidden',
        id: 'apiCurrentPage',
        value: currentPage
    }).appendTo('body');
}

// Clear API filters
function clearAPIFilters() {
    $('#apiSource').val('');
    $('#apiSearchInput').val('');
    $('#apiSortBy').val('published_desc');
    $('#apiPageSize').val(20);
    $('#apiCurrentPage').val(1);
    applyAPIFilters();
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

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Preview article
async function previewArticle(articleId) {
    try {

        var htmlState = '';
        htmlState += '<div class="text-center py-5">';
        htmlState += '<div class="spinner-border text-primary" role="status">';
        htmlState += '<span class="visually-hidden">Đang tải...</span>';
        htmlState += '</div>';
        htmlState += '<p class="mt-3 text-muted">Đang tải bài viết...</p>';
        htmlState += '</div>';

        // Show loading state
        $('#previewContent').html(htmlState);
        
        // Get modal element and show it
        var modalElement = document.getElementById('previewModal');
        var modal = bootstrap.Modal.getOrCreateInstance(modalElement);
        modal.show();
        
        // Fetch article data from API
        const response = await fetch(`/admin/api/article/${articleId}`);
        const result = await response.json();
        
        if (!result.success || !result.data) {
            var errorHtml = '';
            errorHtml += '<div class="alert alert-danger">';
            errorHtml += '<i class="fas fa-exclamation-circle"></i> Không thể tải bài viết. Vui lòng thử lại.';
            errorHtml += '</div>';
            $('#previewContent').html(errorHtml);
            return;
        }
        
        const article = result.data;
        
        // Format status badge
        const statusBadges = {
            'draft': '<span class="badge bg-secondary">Bản nháp</span>',
            'pending': '<span class="badge bg-warning">Chờ duyệt</span>',
            'published': '<span class="badge bg-success">Đã xuất bản</span>',
            'rejected': '<span class="badge bg-danger">Đã từ chối</span>',
            'hidden': '<span class="badge bg-dark">Đã ẩn</span>'
        };
        const statusBadge = statusBadges[article.status] || '';
        
        // Build content HTML
        var content = '';
        content += '<div class="article-preview-container">';
        
        // Thumbnail (only if exists)
        if (article.thumbnail) {
            content += '<div class="article-preview-thumbnail mb-4">';
            content += '<img src="' + escapeHtml(article.thumbnail) + '" alt="' + escapeHtml(article.title || '') + '" class="img-fluid rounded shadow-sm" onerror="this.src=\'https://via.placeholder.com/800x400?text=No+Image\'">';
            content += '</div>';
        }
        
        // Header
        content += '<div class="article-preview-header mb-4">';
        content += '<h2 class="article-preview-title mb-3">' + escapeHtml(article.title || 'Không có tiêu đề') + '</h2>';
        
        // Meta badges
        content += '<div class="article-preview-meta d-flex flex-wrap align-items-center gap-3 mb-3">';
        content += '<span class="badge bg-primary fs-6">' + escapeHtml(article.category || 'N/A') + '</span>';
        content += statusBadge;
        if (article.is_featured) {
            content += '<span class="badge bg-warning"><i class="fas fa-star"></i> Nổi bật</span>';
        }
        if (article.is_hot) {
            content += '<span class="badge bg-danger"><i class="fas fa-fire"></i> Tin nóng</span>';
        }
        content += '</div>';
        
        // Info
        content += '<div class="article-preview-info text-muted small">';
        content += '<div class="d-flex flex-wrap gap-4">';
        content += '<span><i class="fas fa-user me-1"></i> <strong>Tác giả:</strong> ' + escapeHtml(article.author_full_name || article.author || 'N/A') + '</span>';
        if (article.published_at) {
            content += '<span><i class="fas fa-calendar-alt me-1"></i> <strong>Xuất bản:</strong> ' + escapeHtml(article.published_at) + '</span>';
        }
        if (article.created_at) {
            content += '<span><i class="fas fa-clock me-1"></i> <strong>Tạo lúc:</strong> ' + escapeHtml(article.created_at) + '</span>';
        }
        if (article.view_count !== undefined && article.view_count !== null) {
            content += '<span><i class="fas fa-eye me-1"></i> <strong>Lượt xem:</strong> ' + article.view_count.toLocaleString('vi-VN') + '</span>';
        }
        content += '</div>';
        content += '</div>';
        content += '</div>';
        
        // Summary (only if exists)
        if (article.summary) {
            content += '<div class="article-preview-summary mb-4 p-3 bg-light rounded">';
            content += '<h5 class="mb-2"><i class="fas fa-quote-left text-primary me-2"></i>Tóm tắt:</h5>';
            content += '<p class="mb-0 text-muted">' + escapeHtml(article.summary) + '</p>';
            content += '</div>';
        }
        
        // Content
        content += '<div class="article-preview-content">';
        content += '<h5 class="mb-3"><i class="fas fa-align-left text-primary me-2"></i>Nội dung:</h5>';
        content += '<div class="article-content-body">';
        content += article.content ? article.content : '<p class="text-muted">Chưa có nội dung</p>';
        content += '</div>';
        content += '</div>';
        content += '</div>';
        $('#previewContent').html(content);
        $('#approveBtn').data('id', articleId);
        $('#rejectBtn').data('id', articleId);
        
        // Show/hide approve/reject buttons based on status
        if (article.status === 'pending') {
            $('#approveBtn').show();
            $('#rejectBtn').show();
        } else {
            $('#approveBtn').hide();
            $('#rejectBtn').hide();
        }
    } catch (error) {
        console.error('Error loading article preview:', error);
        var errorHtml = '';
        errorHtml += '<div class="alert alert-danger">';
        errorHtml += '<i class="fas fa-exclamation-circle"></i> Có lỗi xảy ra khi tải bài viết: ' + escapeHtml(error.message || 'Lỗi không xác định');
        errorHtml += '</div>';
        $('#previewContent').html(errorHtml);
    } 
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
