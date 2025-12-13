$(document).ready(function() {
    // Check authentication
    checkAuth();
    loadUserInfo();
    
    // Load menu data
    loadMenuTable();
    loadMenuTree();
    loadParentMenuOptions();
    
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
        menuManager.toggleVisibility(menuId);
        showToast('Thành công', 'Đã cập nhật trạng thái hiển thị', 'success');
        loadMenuTable();
        loadMenuTree();
    });
    
    // Update order
    $(document).on('change', '.menu-order-input', function() {
        const menuId = parseInt($(this).data('id'));
        const newOrder = parseInt($(this).val());
        menuManager.updateOrder(menuId, newOrder);
        showToast('Thành công', 'Đã cập nhật thứ tự', 'success');
        loadMenuTable();
        loadMenuTree();
    });
    
    // Auto generate slug
    $('#menuName').on('input', function() {
        const name = $(this).val();
        const slug = menuManager.slugify(name);
        $('#menuSlug').val(slug);
    });
    
    // Preview menu
    $('#previewMenuBtn').click(function() {
        previewMenu();
    });
    
    // Reset menu
    $('#resetMenuBtn').click(function() {
        if (confirm('Bạn có chắc muốn reset tất cả menu về mặc định? Thao tác này không thể hoàn tác!')) {
            menuManager.resetToDefault();
            showToast('Thành công', 'Đã reset menu về mặc định', 'success');
            loadMenuTable();
            loadMenuTree();
            loadParentMenuOptions();
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

// Load menu table
function loadMenuTable() {
    const menus = menuManager.getMenus();
    let html = '';
    
    // Sort by parent first, then by order
    menus.sort((a, b) => {
        if (a.parent_id === null && b.parent_id !== null) return -1;
        if (a.parent_id !== null && b.parent_id === null) return 1;
        if (a.parent_id === b.parent_id) return a.order - b.order;
        return a.parent_id - b.parent_id;
    });
    
    menus.forEach(menu => {
        const parentMenu = menu.parent_id ? menuManager.getMenuById(menu.parent_id) : null;
        const parentName = parentMenu ? parentMenu.name : '-';
        const icon = menu.icon ? `<i class="${menu.icon}"></i>` : '-';
        const checked = menu.visible ? 'checked' : '';
        const childCount = menuManager.getChildMenus(menu.id).length;
        const rowClass = menu.parent_id === null ? 'table-primary' : '';
        
        html += `
            <tr class="${rowClass}">
                <td>${menu.id}</td>
                <td>
                    ${menu.parent_id !== null ? '&nbsp;&nbsp;&nbsp;└─ ' : ''}
                    <strong>${menu.name}</strong>
                </td>
                <td><code>${menu.slug}</code></td>
                <td>${parentName}</td>
                <td>${icon}</td>
                <td>
                    <input type="number" class="form-control form-control-sm menu-order-input" 
                           value="${menu.order}" data-id="${menu.id}" style="width: 70px;">
                </td>
                <td>
                    <label class="visibility-switch">
                        <input type="checkbox" class="menu-visibility-toggle" data-id="${menu.id}" ${checked}>
                        <span class="visibility-slider"></span>
                    </label>
                </td>
                <td>
                    ${childCount > 0 ? `<span class="badge bg-info">${childCount} menu con</span>` : '-'}
                </td>
                <td>
                    <button class="btn btn-sm btn-info btn-action btn-edit-menu" data-id="${menu.id}" title="Sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger btn-action btn-delete-menu" data-id="${menu.id}" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    $('#menuTable').html(html);
}

// Load menu tree
function loadMenuTree() {
    const menuTree = menuManager.buildMenuTree();
    let html = '<ul class="menu-tree">';
    
    menuTree.forEach(parent => {
        html += `
            <li>
                <div class="menu-tree-item parent">
                    ${parent.icon ? `<i class="${parent.icon}"></i>` : ''} 
                    <strong>${parent.name}</strong> 
                    <span class="badge bg-secondary">${parent.order}</span>
                    ${parent.visible ? '<span class="badge bg-success">Hiện</span>' : '<span class="badge bg-danger">Ẩn</span>'}
                </div>
        `;
        
        if (parent.children && parent.children.length > 0) {
            html += '<ul class="menu-tree-children">';
            parent.children.forEach(child => {
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

// Load parent menu options
function loadParentMenuOptions() {
    const parentMenus = menuManager.getParentMenus();
    let html = '<option value="">-- Menu cấp 1 --</option>';
    
    parentMenus.forEach(menu => {
        html += `<option value="${menu.id}">${menu.name}</option>`;
    });
    
    $('#menuParent').html(html);
}

// Open menu modal
function openMenuModal(mode, menuId) {
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
        const menu = menuManager.getMenuById(menuId);
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
    
    const modal = new bootstrap.Modal(document.getElementById('menuModal'));
    modal.show();
}

// Save menu
function saveMenu() {
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
        menuData.slug = menuManager.slugify(menuData.name);
    }
    
    if (menuId) {
        // Update existing menu
        menuManager.updateMenu(parseInt(menuId), menuData);
        showToast('Thành công', 'Đã cập nhật menu', 'success');
    } else {
        // Add new menu
        menuManager.addMenu(menuData);
        showToast('Thành công', 'Đã thêm menu mới', 'success');
    }
    
    // Close modal and reload
    bootstrap.Modal.getInstance(document.getElementById('menuModal')).hide();
    loadMenuTable();
    loadMenuTree();
    loadParentMenuOptions();
}

// Delete menu
function deleteMenu(menuId) {
    const menu = menuManager.getMenuById(menuId);
    const childCount = menuManager.getChildMenus(menuId).length;
    
    let confirmMsg = `Bạn có chắc muốn xóa menu "${menu.name}"?`;
    if (childCount > 0) {
        confirmMsg += `\n\nLưu ý: Menu này có ${childCount} submenu, tất cả sẽ bị xóa!`;
    }
    
    if (confirm(confirmMsg)) {
        menuManager.deleteMenu(menuId);
        showToast('Thành công', 'Đã xóa menu', 'success');
        loadMenuTable();
        loadMenuTree();
        loadParentMenuOptions();
    }
}

// Preview menu
function previewMenu() {
    const menuTree = menuManager.buildMenuTree();
    let html = '';
    
    menuTree.forEach(menu => {
        const hasChildren = menu.children && menu.children.length > 0;
        const icon = menu.icon ? `<i class="${menu.icon}"></i> ` : '';
        
        html += `<li>`;
        html += `<a href="#${menu.slug}">${icon}${menu.name}</a>`;
        
        if (hasChildren) {
            html += '<ul class="submenu-preview">';
            menu.children.forEach(child => {
                html += `<li><a href="#${child.slug}">${child.name}</a></li>`;
            });
            html += '</ul>';
        }
        
        html += '</li>';
    });
    
    $('#previewMenuList').html(html);
    
    const modal = new bootstrap.Modal(document.getElementById('previewModal'));
    modal.show();
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
