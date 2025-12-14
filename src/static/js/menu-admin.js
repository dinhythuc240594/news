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
        const visible = $(this).is(':checked');
        updateMenuVisibility(menuId, visible);
    });
    
    // Update order
    $(document).on('change', '.menu-order-input', function() {
        const menuId = parseInt($(this).data('id'));
        const newOrder = parseInt($(this).val());
        updateMenuOrder(menuId, newOrder);
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
        if (confirm('Bạn có chắc muốn reset tất cả menu về mặc định? Thao tác này không thể hoàn tác!')) {
            // Note: Reset functionality would need to be implemented on backend
            showToast('Thông báo', 'Chức năng reset sẽ được triển khai sau', 'info');
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

// Load menu table
async function loadMenuTable() {
    try {
        const response = await fetch('/admin/api/menu-items');
        const result = await response.json();
        
        if (result.success && result.data) {
            const menus = result.data;
            let html = '';
            
            // Sort by parent first, then by order
            menus.sort((a, b) => {
                if (a.parent_id === null && b.parent_id !== null) return -1;
                if (a.parent_id !== null && b.parent_id === null) return 1;
                if (a.parent_id === b.parent_id) return a.order - b.order;
                return (a.parent_id || 0) - (b.parent_id || 0);
            });
            
            menus.forEach(menu => {
                const parentMenu = menu.parent_id ? menus.find(m => m.id === menu.parent_id) : null;
                const parentName = parentMenu ? parentMenu.name : '-';
                const icon = menu.icon ? `<i class="${menu.icon}"></i>` : '-';
                const checked = menu.visible ? 'checked' : '';
                const childCount = menus.filter(m => m.parent_id === menu.id).length;
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
            
            if (menus.length === 0) {
                html = '<tr><td colspan="9" class="text-center text-muted">Chưa có menu nào</td></tr>';
            }
            
            $('#menuTable').html(html);
        }
    } catch (error) {
        console.error('Lỗi tải menu:', error);
        $('#menuTable').html('<tr><td colspan="9" class="text-center text-danger">Lỗi tải dữ liệu</td></tr>');
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
            
            let html = '';
            
            parentMenus.forEach(menu => {
                const children = menus.filter(m => m.parent_id === menu.id && m.visible)
                                      .sort((a, b) => a.order - b.order);
                const hasChildren = children.length > 0;
                const icon = menu.icon ? `<i class="${menu.icon}"></i> ` : '';
                
                html += `<li>`;
                html += `<a href="#${menu.slug}">${icon}${menu.name}</a>`;
                
                if (hasChildren) {
                    html += '<ul class="submenu-preview">';
                    children.forEach(child => {
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

// Update menu order
async function updateMenuOrder(menuId, order) {
    try {
        const response = await fetch(`/admin/api/menu-items/${menuId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ order: order })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Thành công', 'Đã cập nhật thứ tự', 'success');
            loadMenuTable();
            loadMenuTree();
        } else {
            showToast('Lỗi', result.error || 'Không thể cập nhật', 'warning');
        }
    } catch (error) {
        console.error('Lỗi cập nhật order:', error);
        showToast('Lỗi', 'Có lỗi xảy ra', 'warning');
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
