$(document).ready(function() {
    const path = window.location.pathname;

    // Nếu đang ở trang editor dashboard thì không chạy logic dashboard admin,
    // để tránh gọi các API chỉ dành cho admin (vd: /admin/api/pending-articles)
    if (path.startsWith('/admin/editor-dashboard')) {
        return;
    }

    // Check authentication
    checkAuth();
    
    // Load user info
    loadUserInfo();
    
    // Initialize chart
    initializeChart();

    // Load initial data cho dashboard admin
    // (editor dashboard sẽ dùng editor.js riêng)
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
    
    // Search international drafts
    $('#searchIntDraftsBtn').click(function() {
        loadInternationalDrafts();
    });
    
    $('#searchIntDrafts').on('keypress', function(e) {
        if (e.which === 13) {
            loadInternationalDrafts();
        }
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
        const articleType = $(this).data('type'); // 'international' hoặc undefined
        approveArticle(articleId, articleType);
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
    
    // Reject article
    $(document).on('click', '.btn-reject', function() {
        const articleId = $(this).data('id');
        const articleType = $(this).data('type'); // 'international' hoặc undefined
        const reason = prompt('Lý do từ chối:');
        if (reason) {
            rejectArticle(articleId, reason, articleType);
        }
    });
    
    // Preview article
    $(document).on('click', '.btn-preview', function() {
        const articleId = $(this).data('id');
        const articleType = $(this).data('type'); // 'international' hoặc undefined
        previewArticle(articleId, articleType);
    });
    
    // Edit international article
    $(document).on('click', '.btn-edit[data-type="international"]', function() {
        const articleId = $(this).data('id');
        editInternationalArticle(articleId);
    });
    
    // Delete international article
    $(document).on('click', '.btn-delete[data-type="international"]', function() {
        const articleId = $(this).data('id');
        if (confirm('Bạn có chắc muốn xóa bài viết này?')) {
            deleteInternationalArticle(articleId);
        }
    });
    
    // Submit international draft for approval
    $(document).on('click', '.btn-submit[data-type="international"]', function() {
        const articleId = $(this).data('id');
        if (confirm('Bạn có chắc muốn gửi bài viết này để duyệt?')) {
            submitInternationalDraft(articleId);
        }
    });
    
    // Modal approve/reject
    $('#approveBtn').click(function() {
        const articleId = $(this).data('id');
        const articleType = $(this).data('type'); // 'international' hoặc undefined
        approveArticle(articleId, articleType);
        $('#previewArticleModal').modal('hide');
    });
    
    $('#rejectBtn').click(function() {
        const articleId = $(this).data('id');
        const articleType = $(this).data('type'); // 'international' hoặc undefined
        const reason = prompt('Lý do từ chối:');
        if (reason) {
            rejectArticle(articleId, reason, articleType);
            $('#previewArticleModal').modal('hide');
        }
    });

    // Tag manager events
    $('#tagSearchInput').on('input', function() {
        const search = $(this).val().trim();
        loadTags(search);
    });

    $('#tagForm').on('submit', function(e) {
        e.preventDefault();
        saveTag();
    });

    $('#tagResetBtn').on('click', function() {
        resetTagForm();
    });

    $(document).on('click', '.btn-edit-tag', function() {
        const tagId = $(this).data('id');
        const tagName = $(this).data('name');
        const tagSlug = $(this).data('slug');
        fillTagForm(tagId, tagName, tagSlug);
    });

    $(document).on('click', '.btn-delete-tag', function() {
        const tagId = $(this).data('id');
        const tagName = $(this).data('name');
        if (confirm(`Bạn có chắc muốn xóa hashtag "${tagName}"?`)) {
            deleteTag(tagId);
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
            var html = `<a href="/admin/profile">${result.data.name}</a>`;
            $('#userName').html(html);
        }
    } catch (error) {
        console.error('Error loading user info:', error);
    }
}

// Update page title based on section
function updatePageTitle(section) {
    const titles = {
        'dashboard': 'Dashboard',
        'pending': 'Pending Articles',
        'approved': 'Bài viết đã duyệt',
        'rejected': 'Bài viết bị từ chối',
        'api': 'Bài viết từ API',
        'tags-manager': 'Quản lý Hashtag',
        'international': 'Bài báo Quốc tế',
        'international-pending': 'Quốc tế chờ duyệt',
        'international-drafts': 'Quốc tế nháp',
        'menu-manager': 'Quản lý Menu',
        'en-menu-manager': 'Menu Categories EN',
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
            // Tự động load categories khi vào tab API
            const region = $('#apiRegion').val();
            loadApiCategories(region);
            break;
        case 'international':
            loadInternationalArticles();
            break;
        case 'international-pending':
            loadInternationalPending();
            break;
        case 'international-drafts':
            loadInternationalDrafts();
            break;
        case 'dashboard':
            loadStatistics();
            loadHotArticles();
            break;
        case 'tags-manager':
            loadTags();
            break;
        case 'settings':
            // Settings will be loaded by its own script in setting-section.html
            if (typeof loadSettings === 'function') {
                loadSettings();
            }
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
                            <button class="btn btn-sm btn-primary btn-preview" data-id="${article.id}" title="Xem">
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
                            <button class="btn btn-sm btn-primary btn-preview" data-id="${article.id}" title="Xem">
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
                const approverDisplay = article.approver || '<span class="text-muted">Chưa duyệt</span>';
                html += `
                    <tr>
                        <td>${index + 1}</td>
                        <td><strong>${escapeHtml(article.title)}</strong></td>
                        <td><span class="badge bg-info">${escapeHtml(article.category)}</span></td>
                        <td>${escapeHtml(article.author)}${article.is_api ? ' <span class="badge bg-secondary">API</span>' : ''}</td>
                        <td>${escapeHtml(approverDisplay)}</td>
                        <td><span class="badge bg-success">${article.status}</span></td>
                        <td>${article.views.toLocaleString('vi-VN')}</td>
                        <td>${article.published}</td>
                        <td>
                            <button class="btn btn-sm btn-primary btn-preview" data-id="${article.id}" data-type="international" title="Xem trước">
                                <i class="fas fa-eye"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            if (result.data.length === 0) {
                html = '<tr><td colspan="9" class="text-center text-muted">Không có bài viết nào</td></tr>';
            }
            
            $('#international').find('tbody').html(html);
        }
    } catch (error) {
        console.error('Lỗi tải bài viết quốc tế:', error);
        $('#international').find('tbody').html('<tr><td colspan="9" class="text-center text-danger">Lỗi tải dữ liệu</td></tr>');
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
                        <td><strong>${escapeHtml(article.title)}</strong></td>
                        <td><span class="badge bg-warning">${escapeHtml(article.category)}</span></td>
                        <td>${escapeHtml(article.author)}${article.is_api ? ' <span class="badge bg-secondary">API</span>' : ''}</td>
                        <td>${article.submitted}</td>
                        <td>
                            <button class="btn btn-sm btn-primary btn-preview" data-id="${article.id}" data-type="international" title="Xem trước">
                                <i class="fas fa-eye"></i> Review
                            </button>
                            <button class="btn btn-sm btn-success btn-approve" data-id="${article.id}" data-type="international" title="Duyệt">
                                <i class="fas fa-check"></i> Approve
                            </button>
                            <button class="btn btn-sm btn-danger btn-reject" data-id="${article.id}" data-type="international" title="Từ chối">
                                <i class="fas fa-times"></i> Reject
                            </button>
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
        $('#international-pending').find('tbody').html('<tr><td colspan="6" class="text-center text-danger">Lỗi tải dữ liệu</td></tr>');
    }
}

// Load international drafts
async function loadInternationalDrafts() {
    try {
        const search = $('#searchIntDrafts').val() ? $('#searchIntDrafts').val().trim() : '';
        let url = '/admin/api/international-drafts';
        if (search) {
            url += `?search=${encodeURIComponent(search)}`;
        }
        
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.success && result.data) {
            let html = '';
            result.data.forEach((article, index) => {
                html += `
                    <tr>
                        <td>${index + 1}</td>
                        <td><strong>${escapeHtml(article.title)}</strong></td>
                        <td><span class="badge bg-secondary">${escapeHtml(article.category)}</span></td>
                        <td>${escapeHtml(article.author)}${article.is_api ? ' <span class="badge bg-secondary">API</span>' : ''}</td>
                        <td>${article.created}</td>
                        <td>
                            <button class="btn btn-sm btn-primary btn-preview" data-id="${article.id}" data-type="international" title="Xem trước">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-info btn-submit" data-id="${article.id}" data-type="international" title="Gửi chờ duyệt">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                            <button class="btn btn-sm btn-danger btn-delete" data-id="${article.id}" data-type="international" title="Xóa">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            if (result.data.length === 0) {
                html = '<tr><td colspan="6" class="text-center text-muted">Không có bài viết nháp nào</td></tr>';
            }
            
            $('#internationalDraftsTable').html(html);
        }
    } catch (error) {
        console.error('Lỗi tải bài viết quốc tế nháp:', error);
        $('#internationalDraftsTable').html('<tr><td colspan="6" class="text-center text-danger">Lỗi tải dữ liệu</td></tr>');
    }
}

// Edit international article
async function editInternationalArticle(articleId) {
    try {
        const response = await fetch(`/admin/api/international-article/${articleId}`);
        const result = await response.json();
        
        if (!result.success || !result.data) {
            showToast('Lỗi', result.error || 'Không thể tải bài viết', 'warning');
            return;
        }
        
        const article = result.data;
        
        // Hiển thị thông báo rằng chức năng edit sẽ được thêm sau
        // Hoặc có thể redirect đến editor page nếu có
        showToast('Thông báo', 'Chức năng chỉnh sửa bài viết quốc tế đang được phát triển. Vui lòng sử dụng chức năng preview để xem chi tiết.', 'info');
        
        // Có thể mở modal preview để xem chi tiết
        previewArticle(articleId, 'international');
    } catch (error) {
        console.error('Lỗi tải bài viết quốc tế:', error);
        showToast('Lỗi', 'Có lỗi xảy ra khi tải bài viết', 'warning');
    }
}

// Delete international article
async function deleteInternationalArticle(articleId) {
    showSpinner();
    
    try {
        const response = await fetch(`/admin/international/${articleId}/delete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        hideSpinner();
        
        if (response.ok && result.success) {
            showToast('Thành công', 'Đã xóa bài viết quốc tế', 'success');
            
            // Remove from table
            $(`button[data-id="${articleId}"][data-type="international"]`).closest('tr').fadeOut(function() {
                $(this).remove();
            });
            
            // Reload drafts if needed
            loadInternationalDrafts();
        } else {
            showToast('Lỗi', result.error || 'Không thể xóa bài viết', 'warning');
        }
    } catch (error) {
        hideSpinner();
        console.error('Lỗi xóa bài viết quốc tế:', error);
        showToast('Lỗi', 'Có lỗi xảy ra khi xóa bài viết', 'warning');
    }
}

// Submit international draft for approval
async function submitInternationalDraft(articleId) {
    showSpinner();
    
    try {
        const response = await fetch(`/admin/international/${articleId}/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        hideSpinner();
        
        if (response.ok && result.success) {
            showToast('Thành công', 'Đã gửi bài viết để duyệt', 'success');
            
            // Remove from table
            $(`button[data-id="${articleId}"][data-type="international"]`).closest('tr').fadeOut(function() {
                $(this).remove();
            });
            
            // Reload drafts and pending
            loadInternationalDrafts();
            loadInternationalPending();
            loadStatistics();
        } else {
            showToast('Lỗi', result.error || 'Không thể gửi bài viết để duyệt', 'warning');
        }
    } catch (error) {
        hideSpinner();
        console.error('Lỗi gửi bài viết quốc tế:', error);
        showToast('Lỗi', 'Có lỗi xảy ra khi gửi bài viết', 'warning');
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
            const stats = result.data;
            $('#statPending').text(stats.pending);
            $('#statApproved').text(stats.approved);
            $('#statRejected').text(stats.rejected);
            $('#statAPI').text(stats.api);
            $('#pendingCount').text(stats.pending);

            // Update notification bell if elements exist
            const $notifCount = $('#notificationCount');
            const $notifList = $('#notificationList');
            const $notifEmpty = $('#notificationEmpty');
            if ($notifCount.length && $notifList.length && $notifEmpty.length) {
                const totalAlerts = (stats.pending || 0) + (stats.rejected || 0);
                $notifCount.text(totalAlerts);

                let html = '';
                if (stats.pending > 0) {
                    html += `
                        <div class="dropdown-item d-flex justify-content-between align-items-center">
                            <div>
                                <div><strong>${stats.pending}</strong> bài viết <span class="text-warning">chờ duyệt</span></div>
                                <small class="text-muted">Kiểm tra trong mục "Bài chờ duyệt".</small>
                            </div>
                            <span class="badge bg-warning text-dark ms-2"><i class="fas fa-clock"></i></span>
                        </div>
                    `;
                }
                if (stats.rejected > 0) {
                    html += `
                        <div class="dropdown-item d-flex justify-content-between align-items-center">
                            <div>
                                <div><strong>${stats.rejected}</strong> bài viết <span class="text-danger">bị từ chối</span></div>
                                <small class="text-muted">Xem chi tiết ở mục "Bài từ chối".</small>
                            </div>
                            <span class="badge bg-danger ms-2"><i class="fas fa-times"></i></span>
                        </div>
                    `;
                }
                if (stats.api > 0) {
                    html += `
                        <div class="dropdown-item d-flex justify-content-between align-items-center">
                            <div>
                                <div><strong>${stats.api}</strong> bài viết mới từ <span class="text-info">API</span></div>
                                <small class="text-muted">Kiểm tra tab "Bài viết từ API".</small>
                            </div>
                            <span class="badge bg-info ms-2"><i class="fas fa-cloud"></i></span>
                        </div>
                    `;
                }

                if (html) {
                    $notifEmpty.hide();
                    $notifList.html(html);
                } else {
                    $notifList.empty();
                    $notifEmpty.show().text('Chưa có thông báo mới.');
                }
            }
        }
    } catch (error) {
        console.error('Lỗi tải thống kê:', error);
    }
}

// =========================
// Tag Manager
// =========================

let tagsCache = [];

async function loadTags(search = '') {
    try {
        let url = '/admin/api/tags';
        if (search) {
            url += `?search=${encodeURIComponent(search)}`;
        }

        const response = await fetch(url);
        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
            tagsCache = result.data;
            renderTagsTable(tagsCache);
        } else {
            renderTagsTable([]);
        }
    } catch (error) {
        console.error('Lỗi tải hashtag:', error);
        renderTagsTable([]);
    }
}

function renderTagsTable(tags) {
    const $tbody = $('#tagsTableBody');
    const $badge = $('#tagsTotalBadge');

    if (!$tbody.length) {
        return;
    }

    if (!tags || tags.length === 0) {
        $tbody.html(`
            <tr>
                <td colspan="4" class="text-center text-muted">Chưa có hashtag nào.</td>
            </tr>
        `);
        if ($badge.length) {
            $badge.text('0 hashtag');
        }
        return;
    }

    let html = '';
    tags.forEach((tag, index) => {
        html += `
            <tr>
                <td>${index + 1}</td>
                <td><code>#${tag.name}</code></td>
                <td>${tag.slug}</td>
                <td>
                    <button class="btn btn-sm btn-warning btn-edit-tag" 
                            data-id="${tag.id}" 
                            data-name="${tag.name}" 
                            data-slug="${tag.slug}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger btn-delete-tag ms-1" 
                            data-id="${tag.id}" 
                            data-name="${tag.name}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    $tbody.html(html);
    if ($badge.length) {
        $badge.text(`${tags.length} hashtag`);
    }
}

function fillTagForm(id, name, slug) {
    $('#tagId').val(id);
    $('#tagName').val(name);
    $('#tagSlug').val(slug || '');
}

function resetTagForm() {
    $('#tagId').val('');
    $('#tagName').val('');
    $('#tagSlug').val('');
}

async function saveTag() {
    const id = $('#tagId').val();
    const nameRaw = $('#tagName').val().trim();
    const slugRaw = $('#tagSlug').val().trim();

    if (!nameRaw) {
        alert('Vui lòng nhập tên hashtag');
        return;
    }

    // Chuẩn hóa: bỏ dấu # nếu có ở đầu
    const name = nameRaw.startsWith('#') ? nameRaw.substring(1) : nameRaw;
    const payload = {
        name: name,
        slug: slugRaw || null
    };

    try {
        let url = '/admin/api/tags';
        let method = 'POST';

        if (id) {
            url = `/admin/api/tags/${id}`;
            method = 'PUT';
        }

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showToast('Thành công', id ? 'Đã cập nhật hashtag' : 'Đã tạo hashtag mới', 'success');
            resetTagForm();
            loadTags($('#tagSearchInput').val().trim());
        } else {
            showToast('Lỗi', result.error || 'Không thể lưu hashtag', 'warning');
        }
    } catch (error) {
        console.error('Lỗi lưu hashtag:', error);
        showToast('Lỗi', 'Có lỗi xảy ra khi lưu hashtag', 'warning');
    }
}

async function deleteTag(id) {
    try {
        const response = await fetch(`/admin/api/tags/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showToast('Thành công', 'Đã xóa hashtag', 'success');
            loadTags($('#tagSearchInput').val().trim());
        } else {
            showToast('Lỗi', result.error || 'Không thể xóa hashtag', 'warning');
        }
    } catch (error) {
        console.error('Lỗi xóa hashtag:', error);
        showToast('Lỗi', 'Có lỗi xảy ra khi xóa hashtag', 'warning');
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
                            <button class="btn btn-sm btn-info btn-action btn-preview" data-bs-target="#previewArticleModal" data-id="${article.id}" title="Xem trước">
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
async function approveArticle(articleId, articleType) {
    if (confirm('Bạn có chắc muốn duyệt bài viết này?')) {
        showSpinner();
        
        try {
            // Xác định route dựa trên loại bài viết
            const route = articleType === 'international' 
                ? `/admin/international/${articleId}/approve`
                : `/admin/news/${articleId}/approve`;
            
            const response = await fetch(route, {
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
    
    const modal = new bootstrap.Modal(document.getElementById('previewAPIArticleModal'));
    modal.show();
}

// Reject article
async function rejectArticle(articleId, reason, articleType) {
    showSpinner();
    
    try {
        // Xác định route dựa trên loại bài viết
        const route = articleType === 'international' 
            ? `/admin/international/${articleId}/reject`
            : `/admin/news/${articleId}/reject`;
        
        const response = await fetch(route, {
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
async function previewArticle(articleId, articleType) {
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

        // Fetch article data from API - sử dụng endpoint phù hợp với loại bài viết
        const apiEndpoint = articleType === 'international' 
            ? `/admin/api/international-article/${articleId}`
            : `/admin/api/article/${articleId}`;
        const response = await fetch(apiEndpoint);
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
        // Hiển thị tác giả: nếu là bài từ API thì hiển thị author, không thì hiển thị creator
        const authorDisplay = article.is_api && article.author 
            ? escapeHtml(article.author) + ' <span class="badge bg-secondary">Từ API</span>'
            : escapeHtml(article.author_full_name || article.author || 'N/A');
        content += '<span><i class="fas fa-user me-1"></i> <strong>Tác giả:</strong> ' + authorDisplay + '</span>';
        // Hiển thị người duyệt nếu có
        if (article.approver) {
            const approverDisplay = article.approver_full_name || article.approver || 'N/A';
            content += '<span><i class="fas fa-user-check me-1"></i> <strong>Người duyệt:</strong> ' + escapeHtml(approverDisplay) + '</span>';
        }
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
        $('#approveBtn').data('type', articleType); // Lưu loại bài viết
        $('#rejectBtn').data('id', articleId);
        $('#rejectBtn').data('type', articleType); // Lưu loại bài viết
        
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

    // Get modal element and show it
    const modal = new bootstrap.Modal(document.getElementById('previewArticleModal'));
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

// ============================================
// RSS FEEDS AND API NEWS HANDLERS
// ============================================

// RSS Preset Links
$(document).on('click', '.rss-preset', function(e) {
    e.preventDefault();
    const url = $(this).data('url');
    $('#rssFeedUrl').val(url);
});

// Fetch RSS Button
$('#fetchRssBtn').click(function() {
    const rssUrl = $('#rssFeedUrl').val().trim();
    const limit = $('#rssLimit').val() || 20;
    
    if (!rssUrl) {
        alert('Vui lòng nhập URL RSS feed');
        return;
    }
    
    const btn = $(this);
    btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Đang tải...');
    
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
                showToast('Thành công', `Đã tải ${response.count} bài viết từ RSS feed`, 'success');
                window.rssArticlesData = response.data;
            } else {
                showToast('Lỗi', response.message || 'Không thể tải bài viết', 'warning');
            }
        },
        error: function(xhr) {
            const errorMsg = xhr.responseJSON?.message || 'Lỗi kết nối server';
            showToast('Lỗi', errorMsg, 'warning');
        },
        complete: function() {
            btn.prop('disabled', false).html('<i class="fas fa-download"></i> Tải bài');
        }
    });
});

// Display RSS Articles
function displayRssArticles(articles) {
    const container = $('#rssArticlesList');
    
    if (!articles || articles.length === 0) {
        container.html('<p class="text-muted text-center">Không có bài viết nào</p>');
        return;
    }
    
    let html = '<div class="row">';
    articles.forEach((article, index) => {
        html += `
            <div class="col-md-6 mb-3">
                <div class="card h-100">
                    <div class="card-body">
                        <h6 class="card-title">${article.title}</h6>
                        <p class="card-text text-muted small">${article.summary || 'Không có mô tả'}</p>
                        ${article.thumbnail ? `<img src="${article.thumbnail}" class="img-fluid rounded mb-2" style="max-height: 150px; object-fit: cover; width: 100%;">` : ''}
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">${article.published_at || 'N/A'}</small>
                            <button class="btn btn-sm btn-primary save-rss-article" data-index="${index}" data-article-id="${article.id}">
                                <i class="fas fa-save"></i> Lưu
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    container.html(html);
}

// Save RSS Article Handler
$(document).on('click', '.save-rss-article', function() {
    const index = $(this).data('index');
    const article = window.rssArticlesData[index];
    
    openSaveExternalArticleModal(article);
});

// Open modal for saving external articles (RSS/API)
async function openSaveExternalArticleModal(articleData) {
    // Load categories - check region để load đúng loại danh mục
    const region = window.currentApiRegion || 'domestic';
    const isInternational = region === 'international';
    
    try {
        // Load categories từ API tương ứng với region
        const categoryEndpoint = isInternational 
            ? '/admin/api/international-categories' 
            : '/admin/api/categories';
            
        const response = await fetch(categoryEndpoint);
        const result = await response.json();
        
        let categoryOptions = '<option value="">-- Chọn danh mục --</option>';
        if (result.success) {
            // Xử lý cả trường hợp result.data và result.categories
            const categories = result.data || result.categories || [];
            
            if (categories.length === 0) {
                console.error('Không có danh mục nào');
                showToast('Cảnh báo', 'Không có danh mục nào trong hệ thống', 'warning');
            }
            
            categories.forEach(cat => {
                categoryOptions += `<option value="${cat.id}">${cat.name}</option>`;
            });
        } else {
            console.error('API trả về lỗi:', result);
            showToast('Lỗi', result.error || 'Không thể tải danh mục', 'warning');
            return;
        }
        
        $('#saveAPICategory').html(categoryOptions);
        
        // Lưu region info vào data attribute để biết save vào bảng nào
        $('#saveAPIArticleData').data('region', region);
        
    } catch (error) {
        console.error('Lỗi tải danh mục:', error);
        showToast('Lỗi', 'Không thể tải danh mục: ' + error.message, 'warning');
        return;
    }
    
    // Set article data
    $('#saveAPIArticleData').val(JSON.stringify(articleData));
    $('#saveAPITitle').val(articleData.title);
    $('#saveAPISummary').val(articleData.summary || articleData.description || '');
    $('#saveAPIStatus').val('pending'); // Default to pending
    
    // Update modal title để rõ đang lưu loại báo nào
    const modalTitle = isInternational ? 'Lưu bài viết Quốc tế từ API' : 'Lưu bài viết từ API';
    $('#saveAPIArticleModal .modal-title').text(modalTitle);
    
    const modal = new bootstrap.Modal(document.getElementById('saveAPIArticleModal'));
    modal.show();
}

// Save external article button handler
$('#saveAPIArticleBtn').off('click').on('click', async function() {
    const articleData = JSON.parse($('#saveAPIArticleData').val());
    const categoryId = $('#saveAPICategory').val();
    const status = $('#saveAPIStatus').val();
    const region = $('#saveAPIArticleData').data('region') || 'domestic'; // Lấy region từ data attribute
    
    console.log('Saving article with data:', {
        article: articleData,
        category_id: categoryId,
        status: status,
        region: region
    });
    
    if (!categoryId) {
        alert('Vui lòng chọn danh mục!');
        return;
    }
    
    const btn = $(this);
    btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Đang lưu...');
    
    try {
        const requestData = {
            article: articleData,
            category_id: parseInt(categoryId),
            status: status,
            region: region  // Gửi region để backend biết lưu vào bảng nào
        };
        
        console.log('Request payload:', requestData);
        
        const response = await fetch('/admin/api/save-api-article', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        console.log('Response status:', response.status);
        
        const result = await response.json();
        console.log('Response data:', result);
        
        if (result.success) {
            showToast('Thành công', result.message || 'Đã lưu bài viết', 'success');
            
            // Close modal
            bootstrap.Modal.getInstance(document.getElementById('saveAPIArticleModal')).hide();
            
            // Chỉ xóa card của bài viết vừa lưu (tìm bằng article ID)
            const articleId = result.article_id || articleData.id;
            if (articleId) {
                // Tìm và xóa card chứa bài viết với ID này
                $(`.save-api-article[data-article-id="${articleId}"], .save-rss-article[data-article-id="${articleId}"]`)
                    .closest('.col-md-6').fadeOut(function() {
                        $(this).remove();
                        
                        // Cập nhật số lượng bài còn lại
                        const remainingCount = $('.save-api-article, .save-rss-article').length;
                        if (remainingCount === 0) {
                            $('#apiArticlesList, #rssArticlesList').html(
                                '<p class="text-muted text-center">Không còn bài viết nào. Hãy tải thêm bài mới.</p>'
                            );
                        }
                    });
            }
            
            // Reload statistics
            loadStatistics();
        } else {
            console.error('Save failed:', result.error);
            showToast('Lỗi', result.error || 'Không thể lưu bài viết', 'warning');
        }
    } catch (error) {
        console.error('Exception when saving article:', error);
        showToast('Lỗi', 'Có lỗi xảy ra: ' + error.message, 'warning');
    } finally {
        btn.prop('disabled', false).html('<i class="fas fa-save"></i> Lưu bài viết');
    }
});

// Load API Categories based on region
function loadApiCategories(region) {
    // Sử dụng proxy endpoint để tránh CORS (token sẽ được lấy từ settings tự động)
    const proxyUrl = region === 'international' 
        ? `/admin/api/external-categories?source=en`
        : `/admin/api/external-categories`;
    
    const selectBox = $('#apiCategorySelect');
    selectBox.html('<option value="">Đang tải...</option>');
    
    $.ajax({
        url: proxyUrl,
        method: 'GET',
        success: function(response) {
            selectBox.html('');
            
            // Xử lý response - có thể là array hoặc object với data/categories
            let categories = [];
            if (Array.isArray(response)) {
                categories = response;
            } else if (response.data) {
                categories = Array.isArray(response.data) ? response.data : response.data.categories || [];
            } else if (response.categories) {
                categories = response.categories;
            }
            
            categories.forEach(function(cat) {
                const code = cat.code;
                const name = cat.name;
                selectBox.append(`<option value="${code}">${name}</option>`);
            });
        },
        error: function(xhr) {
            selectBox.html('<option value="">Lỗi tải danh mục</option>');
            console.error('Không thể tải danh mục:', xhr);
        }
    });
}

// Handle region change
$('#apiRegion').change(function() {
    const region = $(this).val();
    loadApiCategories(region);
});

// Fetch API News Button
$('#fetchApiBtn').click(function() {
    const limit = $('#apiLimit').val() || 20;
    
    // Kiểm tra tab nào đang active
    const activeTab = $('#apiModeTabs .nav-link.active').attr('id');
    let requestData = {
        source_type: 'api',
        limit: parseInt(limit)
        // api_key không cần gửi nữa vì server sẽ lấy từ settings
    };
    
    if (activeTab === 'category-tab') {
        // Mode: Theo khu vực & danh mục
        const region = $('#apiRegion').val();
        const categoryId = $('#apiCategorySelect').val();
        
        requestData.mode = 'category';
        requestData.region = region;
        requestData.category_id = categoryId;
        
        // Lưu region để dùng khi save article
        window.currentApiRegion = region;
        
    } else if (activeTab === 'urls-tab') {
        // Mode: Theo danh sách URL
        const apiUrlsText = $('#apiUrls').val().trim();
        
        if (!apiUrlsText) {
            alert('Vui lòng nhập ít nhất một URL bài viết');
            return;
        }
        
        // Parse URLs từ textarea (mỗi URL một dòng)
        const urls = apiUrlsText.split('\n')
            .map(url => url.trim())
            .filter(url => url.length > 0 && (url.startsWith('http://') || url.startsWith('https://')));
        
        if (urls.length === 0) {
            alert('Không tìm thấy URL hợp lệ. Vui lòng nhập URL bắt đầu bằng http:// hoặc https://');
            return;
        }
        
        requestData.mode = 'urls';
        requestData.urls = urls;
        
        // URLs mode mặc định là domestic, có thể lấy từ một select khác nếu cần
        window.currentApiRegion = 'domestic';
    }
    
    const btn = $(this);
    btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Đang tải...');
    
    $.ajax({
        url: '/admin/api/fetch-api-news',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(requestData),
        success: function(response) {
            if (response.success) {
                displayApiArticles(response.data);
                showToast('Thành công', `Đã tải ${response.count} bài viết từ API`, 'success');
                window.apiArticlesData = response.data;
            } else {
                showToast('Lỗi', response.message || 'Không thể tải bài viết', 'warning');
            }
        },
        error: function(xhr) {
            const errorMsg = xhr.responseJSON?.error || xhr.responseJSON?.message || 'Lỗi kết nối server';
            showToast('Lỗi', errorMsg, 'warning');
        },
        complete: function() {
            btn.prop('disabled', false).html('<i class="fas fa-download"></i> Tải bài từ API');
        }
    });
});

// Display API Articles
function displayApiArticles(articles) {
    const container = $('#apiArticlesList');
    
    if (!articles || articles.length === 0) {
        container.html('<p class="text-muted text-center">Không có bài viết nào</p>');
        return;
    }
    
    let html = '<div class="row">';
    articles.forEach((article, index) => {
        html += `
            <div class="col-md-6 mb-3">
                <div class="card h-100">
                    ${article.thumbnail ? `<img src="${article.thumbnail}" class="card-img-top" style="height: 200px; object-fit: cover;">` : ''}
                    <div class="card-body">
                        <h6 class="card-title">${article.title}</h6>
                        <p class="card-text text-muted small">${article.summary || 'Không có mô tả'}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">
                                <i class="fas fa-globe"></i> ${article.source || 'N/A'}<br>
                                <i class="fas fa-calendar"></i> ${article.published_at || 'N/A'}
                            </small>
                            <button class="btn btn-sm btn-primary save-api-article" data-index="${index}" data-article-id="${article.id}">
                                <i class="fas fa-save"></i> Lưu
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    container.html(html);
}

// Save API Article Handler
$(document).on('click', '.save-api-article', function() {
    const index = $(this).data('index');
    const article = window.apiArticlesData[index];
    
    openSaveExternalArticleModal(article);
});
