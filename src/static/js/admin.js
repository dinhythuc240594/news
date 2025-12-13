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
    
    // Logout
    $('#logoutBtn').click(function(e) {
        e.preventDefault();
        if (confirm('Bạn có chắc muốn đăng xuất?')) {
            localStorage.removeItem('userInfo');
            window.location.href = 'login.html';
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
function checkAuth() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo || userInfo.role !== 'admin') {
        window.location.href = 'login.html';
    }
}

// Load user info
function loadUserInfo() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo) {
        $('#userName').text(userInfo.name);
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
        'users': 'Quản lý người dùng',
        'statistics': 'Thống kê'
    };
    $('#pageTitle').text(titles[section] || 'Dashboard');
}

// Load statistics
function loadStatistics() {
    // Simulate API call
    const stats = {
        pending: 12,
        approved: 156,
        rejected: 8,
        api: 45
    };
    
    $('#statPending').text(stats.pending);
    $('#statApproved').text(stats.approved);
    $('#statRejected').text(stats.rejected);
    $('#statAPI').text(stats.api);
    $('#pendingCount').text(stats.pending);
}

// Load pending articles
function loadPendingArticles() {
    const articles = [
        {
            id: 1,
            title: 'Thủ tướng phát biểu tại hội nghị kinh tế quốc tế',
            author: 'Nguyễn Văn A',
            category: 'Thời sự',
            date: '2024-12-13 14:30',
            status: 'pending'
        },
        {
            id: 2,
            title: 'Giá vàng trong nước tăng cao kỷ lục',
            author: 'Trần Thị B',
            category: 'Kinh doanh',
            date: '2024-12-13 13:15',
            status: 'pending'
        },
        {
            id: 3,
            title: 'Đội tuyển Việt Nam chuẩn bị cho trận đấu quan trọng',
            author: 'Lê Văn C',
            category: 'Thể thao',
            date: '2024-12-13 12:00',
            status: 'pending'
        },
        {
            id: 4,
            title: 'Công nghệ AI đang thay đổi cách chúng ta làm việc',
            author: 'Phạm Thị D',
            category: 'Công nghệ',
            date: '2024-12-13 11:30',
            status: 'pending'
        },
        {
            id: 5,
            title: 'Top 10 địa điểm du lịch hấp dẫn nhất mùa đông',
            author: 'Hoàng Văn E',
            category: 'Du lịch',
            date: '2024-12-13 10:45',
            status: 'pending'
        }
    ];
    
    let html = '';
    articles.forEach((article, index) => {
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
    
    $('#pendingArticlesTable').html(html);
}

// Load API articles
function loadAPIArticles() {
    const articles = [
        {
            id: 101,
            title: 'Breaking: Major tech company announces new product',
            source: 'TechCrunch',
            category: 'Công nghệ',
            date: '2024-12-13 15:00',
            status: 'new'
        },
        {
            id: 102,
            title: 'Global markets react to economic news',
            source: 'Reuters',
            category: 'Kinh tế',
            date: '2024-12-13 14:30',
            status: 'new'
        },
        {
            id: 103,
            title: 'Sports: Championship final results',
            source: 'ESPN',
            category: 'Thể thao',
            date: '2024-12-13 13:45',
            status: 'new'
        }
    ];
    
    let html = '';
    articles.forEach((article, index) => {
        html += `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${article.title}</strong></td>
                <td><span class="badge bg-info">${article.source}</span></td>
                <td><span class="badge bg-primary">${article.category}</span></td>
                <td>${article.date}</td>
                <td>
                    <button class="btn btn-sm btn-info btn-action btn-preview" data-id="${article.id}" title="Xem trước">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-success btn-action btn-approve" data-id="${article.id}" title="Duyệt & Đăng">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-sm btn-danger btn-action" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    $('#apiArticlesTable').html(html);
}

// Fetch API articles
function fetchAPIArticles() {
    const btn = $('#fetchAPIBtn');
    btn.prop('disabled', true);
    btn.html('<i class="fas fa-spinner fa-spin"></i> Đang tải...');
    
    // Simulate API call
    setTimeout(function() {
        showToast('Thành công', 'Đã lấy 10 bài viết mới từ API', 'success');
        loadAPIArticles();
        btn.prop('disabled', false);
        btn.html('<i class="fas fa-sync-alt"></i> Lấy bài mới từ API');
        
        // Update stats
        const currentCount = parseInt($('#statAPI').text());
        $('#statAPI').text(currentCount + 10);
    }, 2000);
}

// Approve article
function approveArticle(articleId) {
    if (confirm('Bạn có chắc muốn duyệt bài viết này?')) {
        showSpinner();
        
        // Simulate API call
        setTimeout(function() {
            hideSpinner();
            showToast('Thành công', 'Bài viết đã được duyệt và xuất bản', 'success');
            
            // Remove from table
            $('button[data-id="' + articleId + '"]').closest('tr').fadeOut(function() {
                $(this).remove();
            });
            
            // Update stats
            const pending = parseInt($('#statPending').text()) - 1;
            const approved = parseInt($('#statApproved').text()) + 1;
            $('#statPending').text(pending);
            $('#statApproved').text(approved);
            $('#pendingCount').text(pending);
        }, 1000);
    }
}

// Reject article
function rejectArticle(articleId, reason) {
    showSpinner();
    
    // Simulate API call
    setTimeout(function() {
        hideSpinner();
        showToast('Thông báo', 'Bài viết đã bị từ chối. Lý do: ' + reason, 'warning');
        
        // Remove from table
        $('button[data-id="' + articleId + '"]').closest('tr').fadeOut(function() {
            $(this).remove();
        });
        
        // Update stats
        const pending = parseInt($('#statPending').text()) - 1;
        const rejected = parseInt($('#statRejected').text()) + 1;
        $('#statPending').text(pending);
        $('#statRejected').text(rejected);
        $('#pendingCount').text(pending);
    }, 1000);
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
function initializeChart() {
    const ctx = document.getElementById('articleChart');
    if (ctx) {
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
                datasets: [{
                    label: 'Bài viết mới',
                    data: [12, 19, 15, 25, 22, 30, 28],
                    borderColor: '#c00',
                    backgroundColor: 'rgba(192, 0, 0, 0.1)',
                    tension: 0.4
                }, {
                    label: 'Bài được duyệt',
                    data: [8, 15, 12, 20, 18, 25, 22],
                    borderColor: '#27ae60',
                    backgroundColor: 'rgba(39, 174, 96, 0.1)',
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
