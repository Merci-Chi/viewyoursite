/* ============================================
   ViewYourSite - Page Management
   Create, edit, delete, duplicate pages
   ============================================ */

const Pages = {
    counter: 1,
    
    init() {
        return this;
    },
    
    create(options = {}) {
        this.counter++;
        
        const page = {
            id: 'page-' + Date.now(),
            name: options.name || `Page ${this.counter}`,
            type: options.type || 'page',
            path: options.path || `/page-${this.counter}`,
            parentId: options.parentId || null,
            elements: [],
            settings: {
                title: options.title || `${options.name || 'Page'} - My Website`,
                description: options.description || '',
                metaTags: {},
                customCSS: '',
                customJS: ''
            }
        };
        
        AppState.pages.push(page);
        AppState.saveToStorage();
        
        Toast.show(`Page "${page.name}" created`, 'success');
        return page;
    },
    
    switchTo(pageId) {
        AppState.setCurrentPage(pageId);
        Canvas.render();
        PropertiesPanel.update();
    },
    
    rename(pageId) {
        const page = AppState.pages.find(p => p.id === pageId);
        if (!page) return;
        
        const newName = prompt('Enter new page name:', page.name);
        if (newName && newName.trim()) {
            page.name = newName.trim();
            page.settings.title = `${newName.trim()} - My Website`;
            AppState.saveToStorage();
            Toast.show(`Page renamed to "${page.name}"`, 'success');
        }
    },
    
    duplicate(pageId) {
        const page = AppState.pages.find(p => p.id === pageId);
        if (!page) return;
        
        const newPage = this.create({
            name: page.name + ' Copy',
            type: page.type,
            title: page.settings.title + ' Copy',
            description: page.settings.description
        });
        
        // Copy elements
        newPage.elements = JSON.parse(JSON.stringify(page.elements));
        
        AppState.saveToStorage();
        Toast.show(`Page "${newPage.name}" created`, 'success');
    },
    
    delete(pageId) {
        // Don't allow deleting last page
        if (AppState.pages.length <= 1) {
            Toast.show('Cannot delete the last page', 'error');
            return;
        }
        
        const page = AppState.pages.find(p => p.id === pageId);
        if (!page) return;
        
        if (!confirm(`Are you sure you want to delete "${page.name}"?`)) return;
        
        // If deleting current page, switch to first
        if (AppState.currentPageId === pageId) {
            const firstPage = AppState.pages.find(p => p.id !== pageId);
            if (firstPage) {
                AppState.setCurrentPage(firstPage.id);
                Canvas.render();
            }
        }
        
        AppState.pages = AppState.pages.filter(p => p.id !== pageId);
        AppState.saveToStorage();
        
        Toast.show(`Page "${page.name}" deleted`, 'success');
    },
    
    updateSettings(pageId, settings) {
        const page = AppState.pages.find(p => p.id === pageId);
        if (!page) return;
        
        page.settings = { ...page.settings, ...settings };
        AppState.saveToStorage();
    },
    
    getPageById(pageId) {
        return AppState.pages.find(p => p.id === pageId);
    },
    
    getPagesByType(type) {
        return AppState.pages.filter(p => p.type === type);
    },
    
    getChildPages(parentId) {
        return AppState.pages.filter(p => p.parentId === parentId);
    },
    
    reorder(pageIds) {
        const reordered = pageIds.map(id => AppState.pages.find(p => p.id === id)).filter(Boolean);
        if (reordered.length === AppState.pages.length) {
            AppState.pages = reordered;
            AppState.saveToStorage();
        }
    },
    
    exportPages() {
        return AppState.pages.map(page => ({
            id: page.id,
            name: page.name,
            type: page.type,
            path: page.path,
            settings: page.settings,
            elementCount: page.elements?.length || 0
        }));
    }
};

// Make globally available
window.Pages = Pages;
