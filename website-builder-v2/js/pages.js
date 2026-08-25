/**
 * ViewYourSite - Professional Website Builder
 * Page Management System (pages.js)
 * 
 * This file handles:
 * - CRUD operations for pages
 * - Page switching and navigation
 * - Page settings management
 * - Page ordering
 */

// ============================================
// Pages Data Store
// ============================================

const PagesStore = {
    pages: [],
    
    /**
     * Get all pages
     */
    getAll() {
        return this.pages;
    },
    
    /**
     * Get a page by ID
     */
    getById(id) {
        return this.pages.find(p => p.id === id);
    },
    
    /**
     * Set pages (for loading)
     */
    set(pages) {
        this.pages = pages;
    },
    
    /**
     * Add a new page
     */
    add(page) {
        this.pages.push(page);
        return page;
    },
    
    /**
     * Update a page
     */
    update(id, updates) {
        const index = this.pages.findIndex(p => p.id === id);
        if (index !== -1) {
            this.pages[index] = { ...this.pages[index], ...updates };
            return this.pages[index];
        }
        return null;
    },
    
    /**
     * Remove a page by ID
     */
    remove(id) {
        const index = this.pages.findIndex(p => p.id === id);
        if (index !== -1) {
            return this.pages.splice(index, 1)[0];
        }
        return null;
    },
    
    /**
     * Reorder pages
     */
    reorder(fromIndex, toIndex) {
        const [page] = this.pages.splice(fromIndex, 1);
        this.pages.splice(toIndex, 0, page);
    },
    
    /**
     * Get home page
     */
    getHomePage() {
        return this.pages.find(p => p.isHome);
    }
};

// ============================================
// Default Page Structure
// ============================================

function createDefaultPageData(overrides = {}) {
    return {
        id: generateId(),
        name: 'Untitled Page',
        navTitle: '',
        slug: '',
        type: 'standard', // standard, link
        
        // Visibility
        enabled: true,
        passwordProtected: false,
        password: '',
        generateQRCode: false,
        
        // SEO
        metaTitle: '',
        metaDescription: '',
        socialImage: '',
        
        // Display options
        showHeader: true,
        showFooter: true,
        
        // Code injection
        headCode: '',
        bodyCode: '',
        
        // Background
        background: {
            type: 'none', // none, color, gradient, image, video
            color: '#ffffff',
            gradientType: 'linear',
            color1: '#6366f1',
            color2: '#8b5cf6',
            image: ''
        },
        
        // Components on this page
        components: [],
        
        // Metadata
        isHome: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        
        ...overrides
    };
}

// ============================================
// Pages Manager
// ============================================

const PagesManager = {
    initialized: false,
    
    /**
     * Initialize the pages system
     */
    init() {
        this.renderPagesList();
        this.setupPageSettingsModal();
        this.initialized = true;
    },
    
    /**
     * Create a new page
     */
    createPage(options = {}) {
        const pageData = createDefaultPageData(options);
        
        // Generate slug if not provided
        if (!pageData.slug) {
            pageData.slug = pageData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        }
        
        // Set nav title same as name if not provided
        if (!pageData.navTitle) {
            pageData.navTitle = pageData.name;
        }
        
        PagesStore.add(pageData);
        this.renderPagesList();
        
        // Save to history
        HistoryManager.push(this.getCurrentPageState());
        
        Toast.success(`Page "${pageData.name}" created`);
        return pageData;
    },
    
    /**
     * Delete a page with confirmation
     */
    deletePage(pageId) {
        const page = PagesStore.getById(pageId);
        if (!page) return;
        
        // Don't allow deleting the only page
        if (PagesStore.getAll().length <= 1) {
            Toast.warning('Cannot delete the only page');
            return;
        }
        
        // Confirm deletion
        if (confirm(`Are you sure you want to delete "${page.name}"? This cannot be undone.`)) {
            PagesStore.remove(pageId);
            
            // If deleted current page, switch to another
            if (AppState.currentPageId === pageId) {
                const remainingPages = PagesStore.getAll();
                if (remainingPages.length > 0) {
                    this.switchToPage(remainingPages[0].id);
                }
            }
            
            this.renderPagesList();
            AutoSave.save();
            Toast.success(`Page "${page.name}" deleted`);
        }
    },
    
    /**
     * Duplicate a page
     */
    duplicatePage(pageId) {
        const original = PagesStore.getById(pageId);
        if (!original) return;
        
        const duplicated = createDefaultPageData({
            name: `${original.name} (Copy)`,
            navTitle: `${original.navTitle || original.name} (Copy)`,
            slug: `${original.slug}-copy`,
            components: deepClone(original.components),
            background: deepClone(original.background),
            metaTitle: original.metaTitle,
            metaDescription: original.metaDescription,
            showHeader: original.showHeader,
            showFooter: original.showFooter,
            headCode: original.headCode,
            bodyCode: original.bodyCode
        });
        
        PagesStore.add(duplicated);
        this.renderPagesList();
        
        Toast.success(`Page duplicated as "${duplicated.name}"`);
        return duplicated;
    },
    
    /**
     * Set page as home page
     */
    setAsHome(pageId) {
        // Remove home status from all pages
        PagesStore.getAll().forEach(p => {
            p.isHome = false;
        });
        
        // Set new home page
        const page = PagesStore.update(pageId, { isHome: true });
        
        this.renderPagesList();
        AutoSave.save();
        
        Toast.success(`"${page.name}" is now the home page`);
    },
    
    /**
     * Switch to a different page
     */
    switchToPage(pageId) {
        const page = PagesStore.getById(pageId);
        if (!page) {
            console.error('Page not found:', pageId);
            return;
        }
        
        // Save current page state before switching
        if (AppState.currentPageId && AppState.currentPageId !== pageId) {
            this.saveCurrentPageState();
        }
        
        AppState.currentPageId = pageId;
        
        // Update UI
        document.getElementById('canvas').dataset.pageId = pageId;
        PageSelector.updateCurrentPageName(page.name);
        
        // Render page content
        Editor.renderPageComponents(page.components);
        
        // Update page settings in properties panel
        PropertiesPanel.loadPageSettings(page);
        
        // Update active state in list
        document.querySelectorAll('.page-item').forEach(item => {
            item.classList.toggle('active', item.dataset.pageId === pageId);
        });
        
        // Clear selection
        Editor.deselectElement();
        
        console.log('Switched to page:', page.name);
    },
    
    /**
     * Save current page's component state
     */
    saveCurrentPageState() {
        if (!AppState.currentPageId) return;
        
        const canvas = document.getElementById('canvas');
        const elements = canvas.querySelectorAll('.builder-element');
        const components = [];
        
        elements.forEach(el => {
            const compData = el.componentData;
            if (compData) {
                components.push(compData);
            }
        });
        
        PagesStore.update(AppState.currentPageId, { 
            components: components,
            updatedAt: new Date().toISOString()
        });
    },
    
    /**
     * Get current page object
     */
    getCurrentPage() {
        if (!AppState.currentPageId) return null;
        return PagesStore.getById(AppState.currentPageId);
    },
    
    /**
     * Get all pages (alias)
     */
    getPages() {
        return PagesStore.getAll();
    },
    
    /**
     * Set pages from external source
     */
    setPages(pages) {
        PagesStore.set(pages);
        this.renderPagesList();
    },
    
    /**
     * Get current page state for history
     */
    getCurrentPageState() {
        const page = this.getCurrentPage();
        return page ? deepClone(page) : null;
    },
    
    /**
     * Restore page from state
     */
    restorePageState(state) {
        if (!state) return;
        
        PagesStore.update(state.id, state);
        
        if (AppState.currentPageId === state.id) {
            Editor.renderPageComponents(state.components);
        }
    },
    
    /**
     * Get all pages data (for export)
     */
    getAllPages() {
        // Ensure current page is saved first
        this.saveCurrentPageState();
        return PagesStore.getAll();
    },
    
    /**
     * Render the pages list in sidebar
     */
    renderPagesList() {
        const container = document.getElementById('pagesList');
        const pages = PagesStore.getAll();
        
        if (pages.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="padding: var(--spacing-lg); text-align: center; color: var(--text-muted);">
                    <p>No pages yet</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = pages.map((page, index) => `
            <div class="page-item ${page.id === AppState.currentPageId ? 'active' : ''} ${page.isHome ? 'is-home' : ''}" 
                 data-page-id="${page.id}"
                 draggable="true">
                <div class="page-item-icon">
                    ${this.getPageIcon(page)}
                </div>
                <span class="page-item-name">${page.name}</span>
                <div class="page-item-actions">
                    <button class="page-item-action-btn" data-action="settings" title="Settings">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                        </svg>
                    </button>
                    <button class="page-item-action-btn" data-action="duplicate" title="Duplicate">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                        </svg>
                    </button>
                    <button class="page-item-action-btn danger" data-action="delete" title="Delete">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');
        
        // Add event listeners
        this.attachPageItemEvents(container);
    },
    
    /**
     * Get icon SVG for page type
     */
    getPageIcon(page) {
        if (page.type === 'link') {
            return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>`;
        }
        
        return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-9V4a2 2 0 0 0-2-2z"/>
            <polyline points="13 2 13 9 20 9"/>
        </svg>`;
    },
    
    /**
     * Attach events to page items
     */
    attachPageItemEvents(container) {
        // Click to select page
        container.querySelectorAll('.page-item').forEach(item => {
            item.addEventListener('click', (e) => {
                // Don't switch if clicking action buttons
                if (e.target.closest('.page-item-actions')) return;
                
                const pageId = item.dataset.pageId;
                this.switchToPage(pageId);
            });
            
            // Drag and drop for reordering
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', item.dataset.pageId);
                item.style.opacity = '0.5';
            });
            
            item.addEventListener('dragend', () => {
                item.style.opacity = '1';
            });
            
            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                item.style.borderTop = '2px solid var(--primary)';
            });
            
            item.addEventListener('dragleave', () => {
                item.style.borderTop = '';
            });
            
            item.addEventListener('drop', (e) => {
                e.preventDefault();
                item.style.borderTop = '';
                
                const draggedId = e.dataTransfer.getData('text/plain');
                const targetId = item.dataset.pageId;
                
                if (draggedId !== targetId) {
                    const draggedIndex = PagesStore.getAll().findIndex(p => p.id === draggedId);
                    const targetIndex = PagesStore.getAll().findIndex(p => p.id === targetId);
                    
                    PagesStore.reorder(draggedIndex, targetIndex);
                    this.renderPagesList();
                    AutoSave.save();
                }
            });
            
            // Action buttons
            item.querySelectorAll('.page-item-action-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const action = btn.dataset.action;
                    const pageId = item.dataset.pageId;
                    
                    switch (action) {
                        case 'settings':
                            this.openPageSettings(pageId);
                            break;
                        case 'duplicate':
                            this.duplicatePage(pageId);
                            break;
                        case 'delete':
                            this.deletePage(pageId);
                            break;
                    }
                });
            });
        });
    },
    
    /**
     * Setup page settings modal
     */
    setupPageSettingsModal() {
        const modal = document.getElementById('pageSettingsModal');
        
        // Close button
        document.getElementById('closePageSettings').addEventListener('click', () => {
            ModalManager.close('pageSettingsModal');
        });
        
        // Cancel button
        document.getElementById('cancelPageSettings').addEventListener('click', () => {
            ModalManager.close('pageSettingsModal');
        });
        
        // Save button
        document.getElementById('savePageSettings').addEventListener('click', () => {
            this.savePageSettingsFromModal();
        });
        
        // Page type change
        document.getElementById('psType').addEventListener('change', (e) => {
            document.getElementById('psUrlGroup').style.display = 
                e.target.value === 'link' ? '' : 'none';
        });
        
        // Password protect toggle
        document.getElementById('psPasswordProtect').addEventListener('change', (e) => {
            document.getElementById('psPasswordGroup').style.display = 
                e.target.checked ? '' : 'none';
        });
        
        // New page button
        document.getElementById('newPageBtn').addEventListener('click', () => {
            const options = document.getElementById('newPageOptions');
            options.style.display = options.style.display === 'none' ? 'block' : 'none';
        });
        
        // New page options
        document.querySelectorAll('#newPageOptions .option-item').forEach(item => {
            item.addEventListener('click', () => {
                const type = item.dataset.type;
                
                if (type === 'blank') {
                    const pageCount = PagesStore.getAll().length + 1;
                    this.createPage({
                        name: `Page ${pageCount}`,
                        navTitle: `Page ${pageCount}`,
                        slug: `page-${pageCount}`
                    });
                    
                    // Switch to new page
                    const pages = PagesStore.getAll();
                    this.switchToPage(pages[pages.length - 1].id);
                } else if (type === 'link') {
                    this.createPage({
                        name: 'External Link',
                        type: 'link'
                    });
                }
                
                document.getElementById('newPageOptions').style.display = 'none';
            });
        });
    },
    
    /**
     * Open page settings modal
     */
    openPageSettings(pageId) {
        const page = PagesStore.getById(pageId);
        if (!page) return;
        
        // Populate form fields
        document.getElementById('psName').value = page.name;
        document.getElementById('psNavTitle').value = page.navTitle || '';
        document.getElementById('psType').value = page.type || 'standard';
        document.getElementById('psUrl').value = page.url || '';
        document.getElementById('psUrlGroup').style.display = page.type === 'link' ? '' : 'none';
        
        document.getElementById('psEnabled').checked = page.enabled !== false;
        document.getElementById('psPasswordProtect').checked = page.passwordProtected || false;
        document.getElementById('psPassword').value = page.password || '';
        document.getElementById('psPasswordGroup').style.display = page.passwordProtected ? '' : 'none';
        document.getElementById('psQRCode').checked = page.generateQRCode || false;
        
        document.getElementById('psMetaTitle').value = page.metaTitle || '';
        document.getElementById('psMetaDesc').value = page.metaDescription || '';
        document.getElementById('psSlug').value = page.slug || '';
        
        document.getElementById('psShowHeader').checked = page.showHeader !== false;
        document.getElementById('psShowFooter').checked = page.showFooter !== false;
        document.getElementById('psHeadCode').value = page.headCode || '';
        document.getElementById('psBodyCode').value = page.bodyCode || '';
        
        // Store which page we're editing
        modal.dataset.pageId = pageId;
        
        // Show basic tab
        document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
        document.querySelector('[data-settings="basic"]').classList.add('active');
        document.getElementById('settings-basic').classList.add('active');
        
        ModalManager.open('pageSettingsModal');
    },
    
    /**
     * Save settings from modal
     */
    savePageSettingsFromModal() {
        const modal = document.getElementById('pageSettingsModal');
        const pageId = modal.dataset.pageId;
        
        if (!pageId) return;
        
        const updates = {
            name: document.getElementById('psName').value.trim(),
            navTitle: document.getElementById('psNavTitle').value.trim(),
            type: document.getElementById('psType').value,
            url: document.getElementById('psUrl').value.trim(),
            
            enabled: document.getElementById('psEnabled').checked,
            passwordProtected: document.getElementById('psPasswordProtect').checked,
            password: document.getElementById('psPassword').value,
            generateQRCode: document.getElementById('psQRCode').checked,
            
            metaTitle: document.getElementById('psMetaTitle').value.trim(),
            metaDescription: document.getElementById('psMetaDesc').value.trim(),
            slug: document.getElementById('psSlug').value.trim().toLowerCase().replace(/\s+/g, '-'),
            
            showHeader: document.getElementById('psShowHeader').checked,
            showFooter: document.getElementById('psShowFooter').checked,
            headCode: document.getElementById('psHeadCode').value,
            bodyCode: document.getElementById('psBodyCode').value,
            
            updatedAt: new Date().toISOString()
        };
        
        const updatedPage = PagesStore.update(pageId, updates);
        
        this.renderPagesList();
        PageSelector.updateCurrentPageName(updatedPage.name);
        PropertiesPanel.loadPageSettings(updatedPage);
        
        ModalManager.close('pageSettingsModal');
        AutoSave.save();
        
        Toast.success('Page settings saved');
    }
};

// Expose globally
window.PagesManager = PagesManager;
window.PagesStore = PagesStore;
