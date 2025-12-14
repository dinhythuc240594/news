$(document).ready(function() {
    // Check authentication
    checkAuth();
    loadUserInfo();
    
    // Check and init default menu items if empty
    checkAndInitDefaultMenus();
    
    // Load menu data
    loadMenuTable();
    loadMenuTree();
    loadParentMenuOptions();
    
    // Initialize drag & drop
    initDragAndDrop();
    
    // Add Menu button
    $('#addMenuBtn').click(function() {
        openMenuModal('add', null);
    });
    
    // Add Submenu button
    $('#addSubmenuBtn').click(function() {
        openMenuModal('add-submenu', null);
    });
    
    // Save menu
    $('#saveMenuBtn').click(function() {
        saveMenu();
    });
    
    // Edit menu
    $(document).on('click', '.btn-edit-menu', function() {
        const menuId = parseInt($(this).data('id'));
        openMenuModal('edit', menuId);
    });
    
    // Delete menu
    $(document).on('click', '.btn-delete-menu', function() {
        const menuId = parseInt($(this).data('id'));
        deleteMenu(menuId);
    });
    
    // Toggle visibility
    $(document).on('change', '.menu-visibility-toggle', function() {
        const menuId = parseInt($(this).data('id'));
        const visible = $(this).is(':checked');
        updateMenuVisibility(menuId, visible);
    });
    
    // Toggle expand/collapse children
    $(document).on('click', '.menu-item-expand.has-children', function(e) {
        e.stopPropagation();
        const menuId = $(this).data('menu-id');
        const $container = $(`.menu-children-container[data-parent-id="${menuId}"]`);
        const $icon = $(this).find('i');
        
        if ($container.hasClass('expanded')) {
            $container.removeClass('expanded');
            $icon.removeClass('fa-chevron-up').addClass('fa-chevron-down');
        } else {
            $container.addClass('expanded');
            $icon.removeClass('fa-chevron-down').addClass('fa-chevron-up');
        }
    });
    
    // Auto generate slug
    $('#menuName').on('input', function() {
        const name = $(this).val();
        const slug = slugify(name);
        $('#menuSlug').val(slug);
    });
    
    // Preview menu
    $('#previewMenuBtn').click(function() {
        previewMenu();
    });
    
    // Reset menu
    $('#resetMenuBtn').click(function() {
        if (confirm('Bạn có chắc muốn reset tất cả menu về mặc định? Thao tác này sẽ xóa tất cả menu hiện tại và tạo lại menu mặc định!')) {
            resetMenuToDefault();
        }
    });
    
    // Logout
    $('#logoutBtn').click(function(e) {
        e.preventDefault();
        if (confirm('Bạn có chắc muốn đăng xuất?')) {
            localStorage.removeItem('userInfo');
            window.location.href = 'login.html';
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

// Check and init default menu items
async function checkAndInitDefaultMenus() {
    try {
        const response = await fetch('/admin/api/menu-items');
        const result = await response.json();
        
        if (result.success && result.data && result.data.length === 0) {
            // Bảng rỗng, tự động init default menu items
            const initResponse = await fetch('/admin/api/menu-items/init-default', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const initResult = await initResponse.json();
            if (initResult.success) {
                console.log('Đã tự động khởi tạo menu items mặc định');
            }
        }
    } catch (error) {
        console.error('Lỗi kiểm tra menu items:', error);
    }
}

// Load menu table with tree view
async function loadMenuTable() {
    try {
        const response = await fetch('/admin/api/menu-items');
        const result = await response.json();
        
        if (result.success && result.data) {
            const menus = result.data;
            
            // Build tree structure
            const parentMenus = menus.filter(m => m.parent_id === null)
                                     .sort((a, b) => a.order - b.order);
            
            let html = '';
            
            parentMenus.forEach(parent => {
                const children = menus.filter(m => m.parent_id === parent.id)
                                      .sort((a, b) => a.order - b.order);
                const hasChildren = children.length > 0;
                
                html += renderMenuRow(parent, hasChildren, true);
                
                if (hasChildren) {
                    // Mặc định expand khi có children
                    html += `<div class="menu-children-container expanded" data-parent-id="${parent.id}">`;
                    children.forEach(child => {
                        html += renderMenuRow(child, false, false);
                    });
                    html += `</div>`;
                }
            });
            
            if (menus.length === 0) {
                html = '<div class="text-center text-muted p-4">Chưa có menu nào. Nhấn "Thêm Menu" để tạo mới.</div>';
            }
            
            $('#menuTreeList').html(html);
            
            // Initialize sortable after rendering
            initDragAndDrop();
        }
    } catch (error) {
        console.error('Lỗi tải menu:', error);
        $('#menuTreeList').html('<div class="text-center text-danger p-4">Lỗi tải dữ liệu</div>');
    }
}

// Render menu row
function renderMenuRow(menu, hasChildren, isParent) {
    const icon = menu.icon ? `<i class="${menu.icon}"></i> ` : '';
    const checked = menu.visible ? 'checked' : '';
    const rowClass = isParent ? 'parent-item' : 'child-item';
    const hiddenClass = !menu.visible ? 'hidden-item' : '';
    // Nếu có children và container expanded, hiển thị chevron-up, ngược lại chevron-down
    const expandIcon = hasChildren ? '<i class="fas fa-chevron-up"></i>' : '<i class="fas fa-minus" style="opacity: 0.3;"></i>';
    
    return `
        <div class="menu-item-row ${rowClass} ${hiddenClass}" data-id="${menu.id}" data-parent-id="${menu.parent_id || ''}">
            <div class="menu-item-handle">
                <i class="fas fa-grip-vertical"></i>
            </div>
            <div class="menu-item-expand ${hasChildren ? 'has-children' : ''}" data-menu-id="${menu.id}">
                ${expandIcon}
            </div>
            <div class="menu-item-content">
                <div class="menu-item-info">
                    <div class="menu-item-name">
                        ${icon}${menu.name}
                        ${!menu.visible ? '<span class="badge bg-secondary ms-2">Ẩn</span>' : ''}
                    </div>
                    <div class="menu-item-meta">
                        <code>${menu.slug}</code> | Thứ tự: ${menu.order}
                    </div>
                </div>
                <div class="menu-item-actions">
                    <label class="visibility-switch me-2">
                        <input type="checkbox" class="menu-visibility-toggle" data-id="${menu.id}" ${checked}>
                        <span class="visibility-slider"></span>
                    </label>
                    <button class="btn btn-sm btn-info btn-action btn-edit-menu" data-id="${menu.id}" title="Sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger btn-action btn-delete-menu" data-id="${menu.id}" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Initialize drag and drop
function initDragAndDrop() {
    if (typeof $.ui !== 'undefined' && $.ui.sortable) {
        // Make parent items sortable
        $('#menuTreeList').sortable({
            handle: '.menu-item-handle',
            items: '.menu-item-row.parent-item',
            tolerance: 'pointer',
            cursor: 'move',
            placeholder: 'menu-item-placeholder',
            opacity: 0.8,
            helper: function(e, item) {
                // Clone item with children
                const $clone = item.clone();
                const $children = item.next('.menu-children-container');
                if ($children.length) {
                    $clone.append($children.clone());
                }
                return $clone;
            },
            update: function(event, ui) {
                saveMenuOrder();
            }
        });
        
        // Make child items sortable within their container
        $('.menu-children-container').each(function() {
            $(this).sortable({
                handle: '.menu-item-handle',
                items: '.menu-item-row.child-item',
                tolerance: 'pointer',
                cursor: 'move',
                placeholder: 'menu-item-placeholder',
                opacity: 0.8,
                connectWith: '.menu-children-container',
                update: function(event, ui) {
                    saveMenuOrder();
                }
            });
        });
    }
}

// Save menu order after drag & drop
async function saveMenuOrder() {
    const items = [];
    let parentOrder = 0;
    
    // Collect parent items
    $('#menuTreeList .menu-item-row.parent-item').each(function() {
        const $row = $(this);
        parentOrder++;
        items.push({
            id: parseInt($row.data('id')),
            parent_id: null,
            order: parentOrder
        });
        
        // Collect children of this parent
        const parentId = parseInt($row.data('id'));
        const $childrenContainer = $(`.menu-children-container[data-parent-id="${parentId}"]`);
        let childOrder = 0;
        
        $childrenContainer.find('.menu-item-row.child-item').each(function() {
            const $childRow = $(this);
            childOrder++;
            items.push({
                id: parseInt($childRow.data('id')),
                parent_id: parentId,
                order: childOrder
            });
        });
    });
    
    try {
        const response = await fetch('/admin/api/menu-items/update-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ items: items })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Thành công', 'Đã cập nhật thứ tự menu', 'success');
            // Reload để đảm bảo sync
            setTimeout(() => {
                loadMenuTable();
                loadMenuTree();
            }, 500);
        } else {
            showToast('Lỗi', result.error || 'Không thể cập nhật thứ tự', 'warning');
            // Reload để revert
            loadMenuTable();
        }
    } catch (error) {
        console.error('Lỗi cập nhật thứ tự:', error);
        showToast('Lỗi', 'Có lỗi xảy ra khi cập nhật thứ tự', 'warning');
        // Reload để revert
        loadMenuTable();
    }
}

// Load menu tree
async function loadMenuTree() {
    try {
        const response = await fetch('/admin/api/menu-items');
        const result = await response.json();
        
        if (result.success && result.data) {
            const menus = result.data;
            const parentMenus = menus.filter(m => m.parent_id === null && m.visible)
                                      .sort((a, b) => a.order - b.order);
            
            let html = '<ul class="menu-tree">';
            
            parentMenus.forEach(parent => {
                const children = menus.filter(m => m.parent_id === parent.id && m.visible)
                                      .sort((a, b) => a.order - b.order);
                
                html += `
                    <li>
                        <div class="menu-tree-item parent">
                            ${parent.icon ? `<i class="${parent.icon}"></i>` : ''} 
                            <strong>${parent.name}</strong> 
                            <span class="badge bg-secondary">${parent.order}</span>
                            ${parent.visible ? '<span class="badge bg-success">Hiện</span>' : '<span class="badge bg-danger">Ẩn</span>'}
                        </div>
                `;
                
                if (children.length > 0) {
                    html += '<ul class="menu-tree-children">';
                    children.forEach(child => {
                        html += `
                            <li>
                                ${child.name} 
                                <span class="badge bg-secondary">${child.order}</span>
                                ${child.visible ? '<span class="badge bg-success">Hiện</span>' : '<span class="badge bg-danger">Ẩn</span>'}
                            </li>
                        `;
                    });
                    html += '</ul>';
                }
                
                html += '</li>';
            });
            
            html += '</ul>';
            $('#menuTreeView').html(html);
        }
    } catch (error) {
        console.error('Lỗi tải menu tree:', error);
    }
}

// Load parent menu options
async function loadParentMenuOptions() {
    try {
        const response = await fetch('/admin/api/menu-items');
        const result = await response.json();
        
        if (result.success && result.data) {
            const parentMenus = result.data.filter(m => m.parent_id === null)
                                           .sort((a, b) => a.order - b.order);
            let html = '<option value="">-- Menu cấp 1 --</option>';
            
            parentMenus.forEach(menu => {
                html += `<option value="${menu.id}">${menu.name}</option>`;
            });
            
            $('#menuParent').html(html);
        }
    } catch (error) {
        console.error('Lỗi tải parent menu options:', error);
    }
}

// Open menu modal
async function openMenuModal(mode, menuId) {
    $('#menuForm')[0].reset();
    $('#menuId').val('');
    
    if (mode === 'add') {
        $('#menuModalTitle').text('Thêm Menu Mới');
        $('#menuParent').val('');
        $('#menuVisible').prop('checked', true);
    } else if (mode === 'add-submenu') {
        $('#menuModalTitle').text('Thêm Submenu');
        $('#menuVisible').prop('checked', true);
        // Show parent menu select as required
    } else if (mode === 'edit' && menuId) {
        $('#menuModalTitle').text('Chỉnh sửa Menu');
        try {
            const response = await fetch('/admin/api/menu-items');
            const result = await response.json();
            
            if (result.success && result.data) {
                const menu = result.data.find(m => m.id === menuId);
                if (menu) {
                    $('#menuId').val(menu.id);
                    $('#menuName').val(menu.name);
                    $('#menuSlug').val(menu.slug);
                    $('#menuParent').val(menu.parent_id || '');
                    $('#menuIcon').val(menu.icon || '');
                    $('#menuOrder').val(menu.order);
                    $('#menuVisible').prop('checked', menu.visible);
                }
            }
        } catch (error) {
            console.error('Lỗi tải menu:', error);
        }
    }
    
    const modal = new bootstrap.Modal(document.getElementById('menuModal'));
    modal.show();
}

// Save menu
async function saveMenu() {
    const menuId = $('#menuId').val();
    const menuData = {
        name: $('#menuName').val().trim(),
        slug: $('#menuSlug').val().trim(),
        parent_id: $('#menuParent').val() ? parseInt($('#menuParent').val()) : null,
        icon: $('#menuIcon').val().trim() || null,
        order: parseInt($('#menuOrder').val()) || 1,
        visible: $('#menuVisible').is(':checked')
    };
    
    if (!menuData.name) {
        alert('Vui lòng nhập tên menu!');
        return;
    }
    
    if (!menuData.slug) {
        menuData.slug = slugify(menuData.name);
    }
    
    try {
        let response;
        if (menuId) {
            // Update existing menu
            response = await fetch(`/admin/api/menu-items/${menuId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(menuData)
            });
        } else {
            // Add new menu
            response = await fetch('/admin/api/menu-items', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(menuData)
            });
        }
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Thành công', result.message || (menuId ? 'Đã cập nhật menu' : 'Đã thêm menu mới'), 'success');
            bootstrap.Modal.getInstance(document.getElementById('menuModal')).hide();
            loadMenuTable();
            loadMenuTree();
            loadParentMenuOptions();
        } else {
            showToast('Lỗi', result.error || 'Không thể lưu menu', 'warning');
        }
    } catch (error) {
        console.error('Lỗi lưu menu:', error);
        showToast('Lỗi', 'Có lỗi xảy ra khi lưu menu', 'warning');
    }
}

// Slugify function
function slugify(text) {
    const from = "àáäâãèéëêìíïîòóöôõùúüûñçăắằẳẵặâấầẩẫậđèéẹẻẽêếềểễệìíịỉĩòóọỏõôốồổỗộơớờởỡợùúụủũưứừửữựỳýỵỷỹ";
    const to = "aaaaaeeeeiiiioooooouuuuncaaaaaaaaaaaadeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyy";
    
    let slug = text.toLowerCase();
    
    for (let i = 0; i < from.length; i++) {
        slug = slug.replace(new RegExp(from[i], 'g'), to[i]);
    }
    
    slug = slug.replace(/[^a-z0-9 -]/g, '')
               .replace(/\s+/g, '-')
               .replace(/-+/g, '-')
               .replace(/^-+/, '')
               .replace(/-+$/, '');
    
    return slug;
}

// Delete menu
async function deleteMenu(menuId) {
    try {
        const response = await fetch('/admin/api/menu-items');
        const result = await response.json();
        
        if (result.success && result.data) {
            const menu = result.data.find(m => m.id === menuId);
            if (!menu) {
                showToast('Lỗi', 'Không tìm thấy menu', 'warning');
                return;
            }
            
            const childCount = result.data.filter(m => m.parent_id === menuId).length;
            
            let confirmMsg = `Bạn có chắc muốn xóa menu "${menu.name}"?`;
            if (childCount > 0) {
                confirmMsg += `\n\nLưu ý: Menu này có ${childCount} submenu, tất cả sẽ bị xóa!`;
            }
            
            if (confirm(confirmMsg)) {
                const deleteResponse = await fetch(`/admin/api/menu-items/${menuId}`, {
                    method: 'DELETE'
                });
                
                const deleteResult = await deleteResponse.json();
                
                if (deleteResult.success) {
                    showToast('Thành công', 'Đã xóa menu', 'success');
                    loadMenuTable();
                    loadMenuTree();
                    loadParentMenuOptions();
                } else {
                    showToast('Lỗi', deleteResult.error || 'Không thể xóa menu', 'warning');
                }
            }
        }
    } catch (error) {
        console.error('Lỗi xóa menu:', error);
        showToast('Lỗi', 'Có lỗi xảy ra khi xóa menu', 'warning');
    }
}

// Preview menu
async function previewMenu() {
    try {
        const response = await fetch('/admin/api/menu-items');
        const result = await response.json();
        
        if (result.success && result.data) {
            const menus = result.data;
            const parentMenus = menus.filter(m => m.parent_id === null && m.visible)
                                      .sort((a, b) => a.order - b.order);
            
            let html = '<div class="preview-header"><h4><i class="fas fa-eye"></i> Xem trước Menu</h4></div>';
            html += '<nav class="main-nav-preview">';
            html += '<ul class="nav-menu-preview">';
            
            parentMenus.forEach(menu => {
                const children = menus.filter(m => m.parent_id === menu.id && m.visible)
                                      .sort((a, b) => a.order - b.order);
                const hasChildren = children.length > 0;
                const icon = menu.icon ? `<i class="${menu.icon}"></i>` : '<i class="fas fa-circle" style="font-size: 6px;"></i>';
                
                html += `<li>`;
                html += `<a href="#${menu.slug}">${icon} <span>${menu.name}</span>${hasChildren ? ' <i class="fas fa-chevron-down" style="font-size: 10px; margin-left: 5px;"></i>' : ''}</a>`;
                
                if (hasChildren) {
                    html += '<ul class="submenu-preview">';
                    children.forEach(child => {
                        html += `<li><a href="#${child.slug}"><i class="fas fa-angle-right" style="font-size: 10px; margin-right: 5px;"></i>${child.name}</a></li>`;
                    });
                    html += '</ul>';
                }
                
                html += '</li>';
            });
            
            html += '</ul>';
            html += '</nav>';
            
            $('#previewMenuList').html(html);
            
            const modal = new bootstrap.Modal(document.getElementById('previewModal'));
            modal.show();
        }
    } catch (error) {
        console.error('Lỗi tải menu preview:', error);
    }
}

// Update menu visibility
async function updateMenuVisibility(menuId, visible) {
    try {
        const response = await fetch(`/admin/api/menu-items/${menuId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ visible: visible })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Thành công', 'Đã cập nhật trạng thái hiển thị', 'success');
            loadMenuTable();
            loadMenuTree();
        } else {
            showToast('Lỗi', result.error || 'Không thể cập nhật', 'warning');
        }
    } catch (error) {
        console.error('Lỗi cập nhật visibility:', error);
        showToast('Lỗi', 'Có lỗi xảy ra', 'warning');
    }
}

// Reset menu to default
async function resetMenuToDefault() {
    try {
        // Xóa tất cả menu items
        const response = await fetch('/admin/api/menu-items');
        const result = await response.json();
        
        if (result.success && result.data) {
            // Xóa từng menu item
            for (const menu of result.data) {
                await fetch(`/admin/api/menu-items/${menu.id}`, {
                    method: 'DELETE'
                });
            }
            
            // Init default menu items
            const initResponse = await fetch('/admin/api/menu-items/init-default', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const initResult = await initResponse.json();
            
            if (initResult.success) {
                showToast('Thành công', 'Đã reset menu về mặc định', 'success');
                loadMenuTable();
                loadMenuTree();
                loadParentMenuOptions();
            } else {
                showToast('Lỗi', initResult.error || 'Không thể reset menu', 'warning');
            }
        }
    } catch (error) {
        console.error('Lỗi reset menu:', error);
        showToast('Lỗi', 'Có lỗi xảy ra khi reset menu', 'warning');
    }
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
