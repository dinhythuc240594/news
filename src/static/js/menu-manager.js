// Menu Management System
const menuManager = {
    // Default menu structure
    defaultMenus: [
        {
            id: 1,
            name: 'Trang chủ',
            slug: 'trang-chu',
            icon: 'fas fa-home',
            order: 1,
            visible: true,
            parent_id: null
        },
        {
            id: 2,
            name: 'Thời sự',
            slug: 'thoi-su',
            icon: null,
            order: 2,
            visible: true,
            parent_id: null
        },
        {
            id: 21,
            name: 'Chính trị',
            slug: 'chinh-tri',
            icon: null,
            order: 1,
            visible: true,
            parent_id: 2
        },
        {
            id: 22,
            name: 'Nhân sự',
            slug: 'nhan-su',
            icon: null,
            order: 2,
            visible: true,
            parent_id: 2
        },
        {
            id: 23,
            name: 'Chính sách',
            slug: 'chinh-sach',
            icon: null,
            order: 3,
            visible: true,
            parent_id: 2
        },
        {
            id: 3,
            name: 'Góc nhìn',
            slug: 'goc-nhin',
            icon: null,
            order: 3,
            visible: true,
            parent_id: null
        },
        {
            id: 4,
            name: 'Thế giới',
            slug: 'the-gioi',
            icon: null,
            order: 4,
            visible: true,
            parent_id: null
        },
        {
            id: 41,
            name: 'Châu Á',
            slug: 'chau-a',
            icon: null,
            order: 1,
            visible: true,
            parent_id: 4
        },
        {
            id: 42,
            name: 'Châu Âu',
            slug: 'chau-au',
            icon: null,
            order: 2,
            visible: true,
            parent_id: 4
        },
        {
            id: 43,
            name: 'Châu Mỹ',
            slug: 'chau-my',
            icon: null,
            order: 3,
            visible: true,
            parent_id: 4
        },
        {
            id: 5,
            name: 'Kinh doanh',
            slug: 'kinh-doanh',
            icon: null,
            order: 5,
            visible: true,
            parent_id: null
        },
        {
            id: 51,
            name: 'Chứng khoán',
            slug: 'chung-khoan',
            icon: null,
            order: 1,
            visible: true,
            parent_id: 5
        },
        {
            id: 52,
            name: 'Bất động sản',
            slug: 'bat-dong-san',
            icon: null,
            order: 2,
            visible: true,
            parent_id: 5
        },
        {
            id: 53,
            name: 'Doanh nghiệp',
            slug: 'doanh-nghiep',
            icon: null,
            order: 3,
            visible: true,
            parent_id: 5
        },
        {
            id: 6,
            name: 'Giải trí',
            slug: 'giai-tri',
            icon: null,
            order: 6,
            visible: true,
            parent_id: null
        },
        {
            id: 61,
            name: 'Phim ảnh',
            slug: 'phim-anh',
            icon: null,
            order: 1,
            visible: true,
            parent_id: 6
        },
        {
            id: 62,
            name: 'Âm nhạc',
            slug: 'am-nhac',
            icon: null,
            order: 2,
            visible: true,
            parent_id: 6
        },
        {
            id: 63,
            name: 'Sao Việt',
            slug: 'sao-viet',
            icon: null,
            order: 3,
            visible: true,
            parent_id: 6
        },
        {
            id: 7,
            name: 'Thể thao',
            slug: 'the-thao',
            icon: null,
            order: 7,
            visible: true,
            parent_id: null
        },
        {
            id: 71,
            name: 'Bóng đá',
            slug: 'bong-da',
            icon: null,
            order: 1,
            visible: true,
            parent_id: 7
        },
        {
            id: 72,
            name: 'Tennis',
            slug: 'tennis',
            icon: null,
            order: 2,
            visible: true,
            parent_id: 7
        },
        {
            id: 73,
            name: 'Võ thuật',
            slug: 'vo-thuat',
            icon: null,
            order: 3,
            visible: true,
            parent_id: 7
        },
        {
            id: 8,
            name: 'Pháp luật',
            slug: 'phap-luat',
            icon: null,
            order: 8,
            visible: true,
            parent_id: null
        },
        {
            id: 9,
            name: 'Giáo dục',
            slug: 'giao-duc',
            icon: null,
            order: 9,
            visible: true,
            parent_id: null
        },
        {
            id: 10,
            name: 'Sức khỏe',
            slug: 'suc-khoe',
            icon: null,
            order: 10,
            visible: true,
            parent_id: null
        },
        {
            id: 11,
            name: 'Đời sống',
            slug: 'doi-song',
            icon: null,
            order: 11,
            visible: true,
            parent_id: null
        },
        {
            id: 12,
            name: 'Du lịch',
            slug: 'du-lich',
            icon: null,
            order: 12,
            visible: true,
            parent_id: null
        },
        {
            id: 13,
            name: 'Khoa học',
            slug: 'khoa-hoc',
            icon: null,
            order: 13,
            visible: true,
            parent_id: null
        },
        {
            id: 14,
            name: 'Số hóa',
            slug: 'so-hoa',
            icon: null,
            order: 14,
            visible: true,
            parent_id: null
        },
        {
            id: 15,
            name: 'Xe',
            slug: 'xe',
            icon: null,
            order: 15,
            visible: true,
            parent_id: null
        }
    ],

    // Initialize menu system
    init() {
        if (!localStorage.getItem('vnews_menus')) {
            this.saveMenus(this.defaultMenus);
        }
    },

    // Get all menus
    getMenus() {
        const menus = localStorage.getItem('vnews_menus');
        return menus ? JSON.parse(menus) : this.defaultMenus;
    },

    // Get parent menus only
    getParentMenus() {
        const menus = this.getMenus();
        return menus.filter(menu => menu.parent_id === null).sort((a, b) => a.order - b.order);
    },

    // Get child menus by parent id
    getChildMenus(parentId) {
        const menus = this.getMenus();
        return menus.filter(menu => menu.parent_id === parentId).sort((a, b) => a.order - b.order);
    },

    // Get menu by id
    getMenuById(id) {
        const menus = this.getMenus();
        return menus.find(menu => menu.id === id);
    },

    // Save menus to localStorage
    saveMenus(menus) {
        localStorage.setItem('vnews_menus', JSON.stringify(menus));
    },

    // Add new menu
    addMenu(menuData) {
        const menus = this.getMenus();
        const newId = Math.max(...menus.map(m => m.id), 0) + 1;
        
        const newMenu = {
            id: newId,
            name: menuData.name,
            slug: menuData.slug || this.slugify(menuData.name),
            icon: menuData.icon || null,
            order: menuData.order || 999,
            visible: menuData.visible !== false,
            parent_id: menuData.parent_id || null
        };
        
        menus.push(newMenu);
        this.saveMenus(menus);
        return newMenu;
    },

    // Update menu
    updateMenu(id, menuData) {
        const menus = this.getMenus();
        const index = menus.findIndex(menu => menu.id === id);
        
        if (index !== -1) {
            menus[index] = {
                ...menus[index],
                ...menuData,
                id: id // Ensure id doesn't change
            };
            this.saveMenus(menus);
            return menus[index];
        }
        return null;
    },

    // Delete menu
    deleteMenu(id) {
        let menus = this.getMenus();
        
        // Delete child menus first
        menus = menus.filter(menu => menu.parent_id !== id);
        
        // Delete the menu itself
        menus = menus.filter(menu => menu.id !== id);
        
        this.saveMenus(menus);
        return true;
    },

    // Toggle visibility
    toggleVisibility(id) {
        const menus = this.getMenus();
        const menu = menus.find(m => m.id === id);
        if (menu) {
            menu.visible = !menu.visible;
            this.saveMenus(menus);
            return menu;
        }
        return null;
    },

    // Update order
    updateOrder(id, newOrder) {
        const menus = this.getMenus();
        const menu = menus.find(m => m.id === id);
        if (menu) {
            menu.order = newOrder;
            this.saveMenus(menus);
            return menu;
        }
        return null;
    },

    // Generate slug from name
    slugify(text) {
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
    },

    // Build hierarchical menu structure
    buildMenuTree() {
        const menus = this.getMenus();
        const parentMenus = menus.filter(m => m.parent_id === null && m.visible)
                                  .sort((a, b) => a.order - b.order);
        
        return parentMenus.map(parent => ({
            ...parent,
            children: menus.filter(m => m.parent_id === parent.id && m.visible)
                          .sort((a, b) => a.order - b.order)
        }));
    },

    // Reset to default menus
    resetToDefault() {
        this.saveMenus(this.defaultMenus);
        return true;
    }
};

// Initialize on load
menuManager.init();
