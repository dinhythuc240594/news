$(document).ready(function() {
    // Menu is now loaded from template (categories from database)
    // Adjust menu visibility after page load
    setTimeout(adjustMenuVisibility, 100);
    
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
            // alert('Đang tìm kiếm: ' + searchTerm);
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

    // International news button - redirect to English version
    $('#btnInternational').click(function() {
        window.location.href = 'en/index.html';
    });

    // Submenu hover behavior (backup in case CSS hover doesn't work)
    $(document).on('mouseenter', '.nav-menu > li.has-submenu', function() {
        $(this).find('.submenu').show();
    });
    
    $(document).on('mouseleave', '.nav-menu > li.has-submenu', function() {
        $(this).find('.submenu').hide();
    });
    
    // Navigation active state
    $(document).on('click', '.nav-menu > li', function(e) {
        // Only if clicking on parent, not submenu
        if ($(e.target).closest('.submenu').length === 0) {
            $('.nav-menu > li').removeClass('active');
            $(this).addClass('active');
        }
    });
    
    // Submenu active state
    $(document).on('click', '.submenu li', function(e) {
        e.stopPropagation();
        $('.submenu li').removeClass('active');
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

    // // Login button
    // $('.btn-login').click(function() {
    //     alert('Chức năng đăng nhập đang được phát triển');
    //     // In a real application, you would open a login modal or redirect to login page
    // });

    // Newsletter subscription
    $('.btn-subscribe').click(function() {
        const email = $('.newsletter input').val();
        // if (email && validateEmail(email)) {
        //     alert('Cảm ơn bạn đã đăng ký nhận tin! Email: ' + email);
        //     $('.newsletter input').val('');
        // } else {
        //     alert('Vui lòng nhập email hợp lệ');
        // }
    });

    // Email validation
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // // Video play
    // $('.video-widget').click(function() {
    //     alert('Video đang được tải...');
    //     // In a real application, you would open a video player modal
    // });

    // // Most read items click
    // $('.most-read-item').click(function() {
    //     const title = $(this).find('h4').text();
    //     // alert('Đang mở: ' + title);
    //     // In a real application, you would navigate to the article page
    // });

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

    // Weather Widget - Load weather data
    loadWeatherData();

    // Console log for debugging
    console.log('VnNews website loaded successfully!');
    console.log('jQuery version:', $.fn.jquery);
});

// const cityList = {
//     'HaNoi': ['Ha Noi City', 'Ha Dong', 'Hoai Duc', 'Ba Vi', 'Thach That', 'Thanh Tri', 'Thanh Xuan'],
//     'HoChiMinh': ['Ho Chi Minh City', 'Tan Binh', 'Tan Phu', 'Thu Duc', 'Binh Tan', 'Binh Thanh', 'Go Vap', 'Phu Nhuan'],
//     'DaNang': ['Da Nang City', 'Hai Chau', 'Lien Chieu', 'Thanh Khe', 'Son Tra', 'Ngu Hanh Son', 'Hai Van', 'Cam Le'],
//     'HaiPhong': ['Hai Phong City', 'Hai An', 'Hai Duong', 'Hai Phong', 'Hai Phong', 'Hai Phong', 'Hai Phong', 'Hai Phong'],
//     'ThanhHoA': ['Thanh Hoa City', 'Thanh Hoa', 'Thanh Hoa', 'Thanh Hoa', 'Thanh Hoa', 'Thanh Hoa', 'Thanh Hoa', 'Thanh Hoa'],
//     'NhaTrang': ['Nha Trang City', 'Nha Trang', 'Nha Trang', 'Nha Trang', 'Nha Trang', 'Nha Trang', 'Nha Trang', 'Nha Trang'],
//     'Hue': ['Hue City', 'Hue', 'Hue', 'Hue', 'Hue', 'Hue', 'Hue', 'Hue'],
//     'CanTho': ['Can Tho City', 'Can Tho', 'Can Tho', 'Can Tho', 'Can Tho', 'Can Tho', 'Can Tho', 'Can Tho'],
// };

// function getLocation(position) {

//     const latitude  = position.coords.latitude;
//     const longitude = position.coords.longitude;

//     // 2. Gửi tọa độ đến OpenStreetMap để lấy tên thành phố (Reverse Geocoding)
//     const apiUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;

//     return fetch(apiUrl)
//     .then(res => res.json())
//     .then(data => {
//         // Cấu trúc data trả về của OpenStreetMap nằm trong address
//         const address = data.address;
//         // Đôi khi nó là city, town, hoặc village tùy khu vực
//         const city = address.city || address.town || address.village || address.state; 
        
//         console.log("Địa chỉ đầy đủ:", data.display_name);
//         console.log("Thành phố hiện tại:", city);
//         return city;
//     })
//     .catch(err => console.log("Lỗi API bản đồ:", err));
// }

function getCity(cityName) {
    var converted_city = cityName.toLowerCase();
    for (const key in cityList) {
        if (cityList[key].includes(converted_city)) {
            return key;
        }
    }
    return null;
}

// Weather Widget Function
function loadWeatherData() {
    const weatherWidget = $('#weatherWidget');
    if (!weatherWidget.length) return;

    var city = 'Saigon';

    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=vi&format=json`)
        .then(response => response.json())
        .then(data => {
            if (data.results && data.results.length > 0) {
                const location = data.results[0];
                const latitude = location.latitude;
                const longitude = location.longitude;
                const cityName = "TP. Hồ Chí Minh";
                
                // Get current weather
                return fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Asia/Ho_Chi_Minh`)
                    .then(response => response.json())
                    .then(weatherData => {
                        displayWeather(cityName, weatherData);
                    });
            } else {
                throw new Error('Không tìm thấy thành phố');
            }
        })
        .catch(error => {
            console.error('Weather API error:', error);
            // Fallback to wttr.in API
            loadWeatherFallback(city);
        });
}


// Fallback weather API (wttr.in)
function loadWeatherFallback(city) {
    const weatherWidget = $('#weatherWidget');
    
    fetch(`https://wttr.in/${city}?format=j1&lang=vi`)
        .then(response => response.json())
        .then(data => {
            if (data.current_condition && data.current_condition[0]) {
                const current = data.current_condition[0];
                const location = data.nearest_area[0].areaName[0].value;
                
                const weatherData = {
                    current: {
                        temperature_2m: parseFloat(current.temp_C),
                        relative_humidity_2m: parseFloat(current.humidity),
                        wind_speed_10m: parseFloat(current.windspeedKmph) / 3.6, // Convert km/h to m/s
                        weather_code: getWeatherCode(current.weatherDesc[0].value)
                    }
                };
                
                displayWeather(location, weatherData);
            } else {
                throw new Error('Không thể lấy dữ liệu thời tiết');
            }
        })
        .catch(error => {
            console.error('Weather fallback error:', error);
            displayWeatherError();
        });
}

// Display weather data
function displayWeather(cityName, weatherData) {
    const weatherWidget = $('#weatherWidget');
    const current = weatherData.current;
    
    // Get weather icon and description
    const weatherInfo = getWeatherInfo(current.weather_code);
    const temperature = Math.round(current.temperature_2m);
    const humidity = Math.round(current.relative_humidity_2m);
    const windSpeed = Math.round(current.wind_speed_10m * 3.6); // Convert m/s to km/h
    
    const weatherHTML = `
        <div class="city-name">${cityName}</div>
        <div class="temperature">${temperature}°C</div>
        <div class="weather-desc">
            <i class="${weatherInfo.icon}"></i> ${weatherInfo.description}
        </div>
        <div class="weather-details">
            <div class="detail-item">
                <i class="fas fa-tint"></i>
                <span>Độ ẩm: ${humidity}%</span>
            </div>
            <div class="detail-item">
                <i class="fas fa-wind"></i>
                <span>Gió: ${windSpeed} km/h</span>
            </div>
        </div>
    `;
    
    weatherWidget.html(weatherHTML);
}

// Display weather error
function displayWeatherError() {
    const weatherWidget = $('#weatherWidget');
    weatherWidget.html(`
        <div class="weather-error">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Không thể tải dữ liệu thời tiết</p>
        </div>
    `);
}

// Get weather code from description (for wttr.in fallback)
function getWeatherCode(description) {
    const desc = description.toLowerCase();
    if (desc.includes('sun') || desc.includes('nắng') || desc.includes('clear')) return 0;
    if (desc.includes('cloud') || desc.includes('mây')) return 1;
    if (desc.includes('rain') || desc.includes('mưa')) return 61;
    if (desc.includes('snow') || desc.includes('tuyết')) return 71;
    if (desc.includes('thunder') || desc.includes('sấm')) return 95;
    return 1; // Default to cloudy
}

// Get weather icon and description from weather code (WMO Weather interpretation codes)
function getWeatherInfo(code) {
    const weatherMap = {
        0: { icon: 'fas fa-sun', description: 'Trời nắng' },
        1: { icon: 'fas fa-sun', description: 'Trời quang' },
        2: { icon: 'fas fa-cloud-sun', description: 'Ít mây' },
        3: { icon: 'fas fa-cloud', description: 'Nhiều mây' },
        45: { icon: 'fas fa-smog', description: 'Sương mù' },
        48: { icon: 'fas fa-smog', description: 'Sương mù' },
        51: { icon: 'fas fa-cloud-rain', description: 'Mưa nhẹ' },
        53: { icon: 'fas fa-cloud-rain', description: 'Mưa vừa' },
        55: { icon: 'fas fa-cloud-rain', description: 'Mưa nặng' },
        56: { icon: 'fas fa-cloud-rain', description: 'Mưa đá nhẹ' },
        57: { icon: 'fas fa-cloud-rain', description: 'Mưa đá nặng' },
        61: { icon: 'fas fa-cloud-showers-heavy', description: 'Mưa nhẹ' },
        63: { icon: 'fas fa-cloud-showers-heavy', description: 'Mưa vừa' },
        65: { icon: 'fas fa-cloud-showers-heavy', description: 'Mưa nặng' },
        66: { icon: 'fas fa-cloud-rain', description: 'Mưa đá nhẹ' },
        67: { icon: 'fas fa-cloud-rain', description: 'Mưa đá nặng' },
        71: { icon: 'fas fa-snowflake', description: 'Tuyết nhẹ' },
        73: { icon: 'fas fa-snowflake', description: 'Tuyết vừa' },
        75: { icon: 'fas fa-snowflake', description: 'Tuyết nặng' },
        77: { icon: 'fas fa-snowflake', description: 'Hạt tuyết' },
        80: { icon: 'fas fa-cloud-showers-heavy', description: 'Mưa rào nhẹ' },
        81: { icon: 'fas fa-cloud-showers-heavy', description: 'Mưa rào vừa' },
        82: { icon: 'fas fa-cloud-showers-heavy', description: 'Mưa rào nặng' },
        85: { icon: 'fas fa-snowflake', description: 'Mưa tuyết nhẹ' },
        86: { icon: 'fas fa-snowflake', description: 'Mưa tuyết nặng' },
        95: { icon: 'fas fa-bolt', description: 'Dông' },
        96: { icon: 'fas fa-bolt', description: 'Dông có mưa đá' },
        99: { icon: 'fas fa-bolt', description: 'Dông có mưa đá nặng' }
    };
    
    return weatherMap[code] || { icon: 'fas fa-cloud', description: 'Nhiều mây' };
}

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

// Load dynamic menu from menu manager
function loadDynamicMenu() {
    const menuTree = menuManager.buildMenuTree();
    console.log('Menu Tree:', menuTree);
    let menuHtml = '';
    
    menuTree.forEach(menu => {
        const hasChildren = menu.children && menu.children.length > 0;
        console.log(`Menu: ${menu.name}, Has Children: ${hasChildren}, Children:`, menu.children);
        
        const icon = menu.icon ? `<i class="${menu.icon}"></i> ` : '';
        const activeClass = menu.order === 1 ? 'active' : '';
        const submenuClass = hasChildren ? 'has-submenu' : '';
        
        // Build class list properly
        const classList = [activeClass, submenuClass].filter(c => c).join(' ');
        
        menuHtml += `<li class="${classList}" data-slug="${menu.slug}">`;
        menuHtml += `<a href="#${menu.slug}">${icon}${menu.name}</a>`;
        
        if (hasChildren) {
            console.log(`Adding submenu for ${menu.name} with ${menu.children.length} children`);
            menuHtml += '<ul class="submenu">';
            menu.children.forEach(child => {
                const childIcon = child.icon ? `<i class="${child.icon}"></i> ` : '';
                menuHtml += `<li data-slug="${child.slug}">`;
                menuHtml += `<a href="#${child.slug}">${childIcon}${child.name}</a>`;
                menuHtml += '</li>';
            });
            menuHtml += '</ul>';
        }
        
        menuHtml += '</li>';
    });
    
    // Add more menu button (will be shown/hidden by adjustMenuVisibility)
    menuHtml += `
        <li class="more-menu-btn">
            <a href="javascript:void(0)">
                <i class="fas fa-ellipsis-h"></i> Xem thêm
            </a>
            <ul class="more-menu-dropdown"></ul>
        </li>
    `;
    
    $('#mainMenu').html(menuHtml);
    
    console.log('Menu HTML loaded into #mainMenu');
    console.log('Elements with .has-submenu:', $('.has-submenu').length);
    console.log('Elements with .submenu:', $('.submenu').length);
    
    // Adjust menu visibility after load
    setTimeout(adjustMenuVisibility, 100);
}

// Adjust menu visibility based on available space
function adjustMenuVisibility() {
    const navMenu = $('.nav-menu');
    const moreBtn = $('.more-menu-btn');
    const moreDropdown = $('.more-menu-dropdown');
    const menuItems = $('.nav-menu > li:not(.more-menu-btn)');
    
    if (!navMenu.length || !menuItems.length) return;
    
    // Reset
    menuItems.removeClass('nav-hidden');
    moreBtn.removeClass('show');
    moreDropdown.empty();
    
    const navWidth = navMenu.width();
    const moreBtnWidth = 120; // Width for "Xem thêm" button
    let totalWidth = 0;
    let hiddenMenus = [];
    
    menuItems.each(function(index) {
        const itemWidth = $(this).outerWidth(true);
        totalWidth += itemWidth;
        
        // Check if this item would overflow
        if (totalWidth > (navWidth - moreBtnWidth)) {
            $(this).addClass('nav-hidden');
            
            // Get menu data
            const menuSlug = $(this).data('slug');
            const menuHtml = $(this).clone();
            menuHtml.removeClass('nav-hidden active');
            
            // Build dropdown item
            let dropdownItem = `<li>`;
            dropdownItem += `<a href="#${menuSlug}">${menuHtml.find('> a').html()}</a>`;
            
            // Add submenu if exists
            const submenu = $(this).find('.submenu');
            if (submenu.length) {
                dropdownItem += '<ul class="more-submenu">';
                submenu.find('> li').each(function() {
                    const childSlug = $(this).data('slug');
                    const childName = $(this).find('a').text();
                    dropdownItem += `<li><a href="#${childSlug}">${childName}</a></li>`;
                });
                dropdownItem += '</ul>';
            }
            
            dropdownItem += '</li>';
            hiddenMenus.push(dropdownItem);
        }
    });
    
    // Show more button if there are hidden menus
    if (hiddenMenus.length > 0) {
        moreDropdown.html(hiddenMenus.join(''));
        moreBtn.addClass('show');
    }
}

// Recalculate on window resize
$(window).on('resize', function() {
    clearTimeout(window.resizeTimer);
    window.resizeTimer = setTimeout(adjustMenuVisibility, 250);
});
