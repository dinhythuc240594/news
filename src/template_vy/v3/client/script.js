$(document).ready(function() {
    // Display current date and time
    function updateDateTime() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        const dateTimeString = now.toLocaleDateString('vi-VN', options);
        $('#currentDateTime').text(dateTimeString);
    }
    
    updateDateTime();
    setInterval(updateDateTime, 60000); // Update every minute

    // Sticky Navigation
    $(window).scroll(function() {
        if ($(this).scrollTop() > 200) {
            $('.scroll-to-top').addClass('show');
        } else {
            $('.scroll-to-top').removeClass('show');
        }
    });

    // Scroll to top button
    $('.scroll-to-top').click(function() {
        $('html, body').animate({ scrollTop: 0 }, 800);
        return false;
    });

    // Smooth scroll for anchor links
    $('a[href^="#"]').on('click', function(e) {
        const target = $(this.getAttribute('href'));
        if (target.length) {
            e.preventDefault();
            $('html, body').stop().animate({
                scrollTop: target.offset().top - 100
            }, 1000);
        }
    });

    // Search functionality
    $('.btn-search').click(function() {
        const searchTerm = $('.search-box input').val();
        if (searchTerm.trim() !== '') {
            alert('Đang tìm kiếm: ' + searchTerm);
            // In a real application, you would redirect to a search results page
            // window.location.href = '/search?q=' + encodeURIComponent(searchTerm);
        }
    });

    // Search on Enter key
    $('.search-box input').keypress(function(e) {
        if (e.which === 13) {
            $('.btn-search').click();
        }
    });

    // Navigation active state
    $('.nav-menu li').click(function() {
        $('.nav-menu li').removeClass('active');
        $(this).addClass('active');
    });

    // Load more news
    let newsLoadCount = 0;
    $('.btn-load-more').click(function() {
        const button = $(this);
        button.html('<i class="fas fa-spinner fa-spin"></i> Đang tải...');
        button.prop('disabled', true);

        // Simulate loading delay
        setTimeout(function() {
            newsLoadCount++;
            
            // Sample news data
            const newNews = [
                {
                    image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400',
                    category: 'Thời sự',
                    title: 'Tin tức mới số ' + (newsLoadCount * 3 + 1),
                    description: 'Mô tả ngắn gọn về tin tức này, cung cấp thông tin tổng quan cho người đọc.',
                    time: '1 giờ trước',
                    comments: 45
                },
                {
                    image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=400',
                    category: 'Kinh doanh',
                    title: 'Tin tức mới số ' + (newsLoadCount * 3 + 2),
                    description: 'Mô tả ngắn gọn về tin tức này, cung cấp thông tin tổng quan cho người đọc.',
                    time: '2 giờ trước',
                    comments: 32
                },
                {
                    image: 'https://images.unsplash.com/photo-1461088945293-0c17689e48ac?w=400',
                    category: 'Thể thao',
                    title: 'Tin tức mới số ' + (newsLoadCount * 3 + 3),
                    description: 'Mô tả ngắn gọn về tin tức này, cung cấp thông tin tổng quan cho người đọc.',
                    time: '3 giờ trước',
                    comments: 28
                }
            ];

            // Add new news to the list
            newNews.forEach(function(news) {
                const newsHTML = `
                    <article class="news-card horizontal-card" style="display: none;">
                        <div class="row g-0">
                            <div class="col-md-4">
                                <div class="news-image">
                                    <img src="${news.image}" alt="Tin tức">
                                    <span class="badge-category">${news.category}</span>
                                </div>
                            </div>
                            <div class="col-md-8">
                                <div class="news-content">
                                    <h3 class="news-title">
                                        <a href="#">${news.title}</a>
                                    </h3>
                                    <p class="news-description">
                                        ${news.description}
                                    </p>
                                    <div class="news-meta">
                                        <span><i class="far fa-clock"></i> ${news.time}</span>
                                        <span><i class="far fa-comment"></i> ${news.comments}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </article>
                `;
                $('.news-list').append(newsHTML);
            });

            // Fade in new news
            $('.news-card:hidden').fadeIn(600);

            // Reset button
            button.html('<i class="fas fa-sync-alt"></i> Xem thêm');
            button.prop('disabled', false);

            // Hide button after 5 loads
            if (newsLoadCount >= 5) {
                button.fadeOut();
                $('.news-list').after('<p class="text-center text-muted mt-3">Đã tải hết tin tức</p>');
            }
        }, 1000);
    });

    // Login button
    $('.btn-login').click(function() {
        alert('Chức năng đăng nhập đang được phát triển');
        // In a real application, you would open a login modal or redirect to login page
    });

    // Newsletter subscription
    $('.btn-subscribe').click(function() {
        const email = $('.newsletter input').val();
        if (email && validateEmail(email)) {
            alert('Cảm ơn bạn đã đăng ký nhận tin! Email: ' + email);
            $('.newsletter input').val('');
        } else {
            alert('Vui lòng nhập email hợp lệ');
        }
    });

    // Email validation
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Video play
    $('.video-widget').click(function() {
        alert('Video đang được tải...');
        // In a real application, you would open a video player modal
    });

    // Most read items click
    $('.most-read-item').click(function() {
        const title = $(this).find('h4').text();
        alert('Đang mở: ' + title);
        // In a real application, you would navigate to the article page
    });

    // News card click tracking
    $('.news-card').click(function(e) {
        // Only track if not clicking on a link
        if (!$(e.target).is('a') && !$(e.target).closest('a').length) {
            const title = $(this).find('.news-title a').text();
            console.log('Clicked on news:', title);
            // In a real application, you would send analytics data
        }
    });

    // Lazy loading images
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img.lazy').forEach(function(img) {
            imageObserver.observe(img);
        });
    }

    // Add hover effect to news cards
    $('.news-card').hover(
        function() {
            $(this).find('.news-title a').css('color', '#c00');
        },
        function() {
            $(this).find('.news-title a').css('color', '#333');
        }
    );

    // Mobile menu toggle (for responsive design)
    let menuVisible = false;
    $(document).on('click', '.mobile-menu-toggle', function() {
        if (!menuVisible) {
            $('.nav-menu').slideDown();
            menuVisible = true;
        } else {
            $('.nav-menu').slideUp();
            menuVisible = false;
        }
    });

    // Close mobile menu when clicking outside
    $(document).click(function(e) {
        if (menuVisible && !$(e.target).closest('.main-nav').length) {
            $('.nav-menu').slideUp();
            menuVisible = false;
        }
    });

    // Add reading progress bar
    const progressBar = $('<div class="reading-progress"></div>');
    $('body').append(progressBar);
    
    $(window).scroll(function() {
        const windowHeight = $(window).height();
        const documentHeight = $(document).height();
        const scrollTop = $(window).scrollTop();
        const progress = (scrollTop / (documentHeight - windowHeight)) * 100;
        
        progressBar.css('width', progress + '%');
    });

    // Add CSS for progress bar
    $('<style>')
        .text('.reading-progress { position: fixed; top: 0; left: 0; height: 3px; background: linear-gradient(to right, #c00, #ff0000); z-index: 9999; transition: width 0.3s; }')
        .appendTo('head');

    // Console log for debugging
    console.log('VnNews website loaded successfully!');
    console.log('jQuery version:', $.fn.jquery);
});

// Add animation on scroll
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Animate elements on scroll
$(window).scroll(function() {
    $('.news-card').each(function() {
        if (isInViewport(this)) {
            $(this).addClass('animated');
        }
    });
});

// Add CSS for animation
$('<style>')
    .text('.news-card { opacity: 0; transform: translateY(30px); transition: all 0.6s; } .news-card.animated { opacity: 1; transform: translateY(0); }')
    .appendTo('head');
