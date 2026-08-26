/* ============================================
   ViewYourSite - Popup Menu System
   All dropdown/popup menus for tools
   ============================================ */

const PopupMenu = {
    container: null,
    currentPopup: null,
    
    init() {
        this.container = document.getElementById('popupContainer');
        this.setupToolButtons();
        return this;
    },
    
    setupToolButtons() {
        // Add Elements Button
        document.getElementById('addElementsBtn').addEventListener('click', (e) => {
            this.showElementsMenu(e.currentTarget);
        });
        
        // Text Tool Button
        document.getElementById('textToolBtn').addEventListener('click', (e) => {
            this.showCategoryMenu(e.currentTarget, 'Text');
        });
        
        // Media Tool Button
        document.getElementById('mediaToolBtn').addEventListener('click', (e) => {
            this.showCategoryMenu(e.currentTarget, 'Media');
        });
        
        // Shapes/Layout Tool Button
        document.getElementById('shapesToolBtn').addEventListener('click', (e) => {
            this.showCategoryMenu(e.currentTarget, 'Layout');
        });
        
        // Interactive Tool Button
        document.getElementById('interactiveToolBtn').addEventListener('click', (e) => {
            this.showCategoryMenu(e.currentTarget, 'Interactive');
        });
        
        // Components Tool Button
        document.getElementById('componentsToolBtn').addEventListener('click', (e) => {
            this.showCategoryMenu(e.currentTarget, 'Components');
        });
        
        // Pages Button
        document.getElementById('pagesBtn').addEventListener('click', (e) => {
            this.showPagesMenu(e.currentTarget);
        });
        
        // Media Library Button
        document.getElementById('mediaLibBtn').addEventListener('click', (e) => {
            this.showMediaLibrary(e.currentTarget);
        });
        
        // Settings Button
        document.getElementById('settingsBtn').addEventListener('click', (e) => {
            this.showSettings(e.currentTarget);
        });
        
        // Close popups when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.popup-menu') && !e.target.closest('.tool-btn')) {
                this.closeAll();
            }
        });
    },
    
    show(button, content, options = {}) {
        this.closeAll();
        
        const rect = button.getBoundingClientRect();
        const popup = document.createElement('div');
        popup.className = `popup-menu ${options.size || ''}`;
        popup.innerHTML = content;
        
        // Position
        let left = rect.left + window.scrollX;
        let top = rect.bottom + window.scrollY + 8;
        
        // Adjust if too close to right edge
        const width = options.width || 280;
        if (left + width > window.innerWidth) {
            left = left + rect.width - width;
        }
        
        // Show above if not enough space below
        if (top + 300 > window.innerHeight) {
            top = rect.top + window.scrollY - (options.height || 300) - 8;
        }
        
        popup.style.left = `${left}px`;
        popup.style.top = `${top}px`;
        
        this.container.appendChild(popup);
        this.currentPopup = popup;
        
        return popup;
    },
    
    showElementsMenu(button) {
        const categories = Elements.getTypesByCategory();
        let html = `
            <div class="popup-header">
                <span class="popup-title">Add Element</span>
                <input type="text" class="popup-search" placeholder="Search elements..." id="elementSearch">
            </div>
        `;
        
        Object.keys(categories).forEach(category => {
            html += `
                <div class="popup-section" data-category="${category}">
                    <div class="popup-section-title">${category}</div>
                    <div class="elements-grid">
                        ${categories[category].map(type => `
                            <div class="element-grid-item" data-type="${type.key}" title="${type.name}">
                                ${type.icon}
                                <span>${type.name}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });
        
        const popup = this.show(button, html, { size: 'xlarge', width: 500, height: 500 });
        
        // Add click handlers
        popup.querySelectorAll('.element-grid-item').forEach(item => {
            item.addEventListener('click', () => {
                Elements.add(item.dataset.type);
                this.closeAll();
            });
        });
        
        // Search functionality
        const searchInput = popup.querySelector('#elementSearch');
        searchInput?.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            popup.querySelectorAll('.popup-section').forEach(section => {
                const items = section.querySelectorAll('.element-grid-item');
                let hasVisible = false;
                items.forEach(item => {
                    const visible = item.dataset.type.toLowerCase().includes(query) || 
                                    item.querySelector('span').textContent.toLowerCase().includes(query);
                    item.style.display = visible ? '' : 'none';
                    if (visible) hasVisible = true;
                });
                section.style.display = hasVisible ? '' : 'none';
            });
        });
    },
    
    showCategoryMenu(button, category) {
        const types = Elements.getTypesByCategory()[category] || [];
        
        let html = `
            <div class="popup-header">
                <span class="popup-title">${category} Elements</span>
            </div>
            <div class="popup-section">
                <div class="elements-grid">
                    ${types.map(type => `
                        <div class="element-grid-item" data-type="${type.key}" title="${type.name}">
                            ${type.icon}
                            <span>${type.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        const popup = this.show(button, html, { size: 'large' });
        
        popup.querySelectorAll('.element-grid-item').forEach(item => {
            item.addEventListener('click', () => {
                Elements.add(item.dataset.type);
                this.closeAll();
            });
        });
    },
    
    showPagesMenu(button) {
        const pages = AppState.pages;
        
        let html = `
            <div class="popup-header">
                <span class="popup-title">Pages</span>
            </div>
            <div class="pages-list">
                ${pages.map(page => `
                    <div class="page-item ${page.id === AppState.currentPageId ? 'active' : ''}" data-page-id="${page.id}">
                        <svg class="page-item-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                        <span class="page-item-name">${page.name}</span>
                        <div class="page-item-actions">
                            <button class="page-action-btn" data-action="rename" title="Rename">&#9998;</button>
                            <button class="page-action-btn" data-action="duplicate" title="Duplicate">&#128203;</button>
                            <button class="page-action-btn" data-action="delete" title="Delete">&#128465;</button>
                        </div>
                    </div>
                `).join('')}
            </div>
            <button class="add-page-btn" id="addNewPageBtn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Add New Page
            </button>
        `;
        
        const popup = this.show(button, html, { width: 260 });
        
        // Page selection
        popup.querySelectorAll('.page-item').forEach(item => {
            item.querySelector('.page-item-name').addEventListener('click', () => {
                Pages.switchTo(item.dataset.pageId);
                Canvas.render();
                this.closeAll();
            });
            
            item.querySelectorAll('.page-action-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const action = btn.dataset.action;
                    const pageId = item.dataset.pageId;
                    
                    switch(action) {
                        case 'rename':
                            Pages.rename(pageId);
                            break;
                        case 'duplicate':
                            Pages.duplicate(pageId);
                            break;
                        case 'delete':
                            Pages.delete(pageId);
                            break;
                    }
                    
                    // Refresh menu
                    setTimeout(() => this.showPagesMenu(button), 100);
                });
            });
        });
        
        // Add new page
        popup.querySelector('#addNewPageBtn')?.addEventListener('click', () => {
            Pages.create();
            setTimeout(() => this.showPagesMenu(button), 100);
        });
    },
    
    showMediaLibrary(button) {
        const mediaItems = MediaLibrary.getItems();
        
        let html = `
            <div class="popup-header">
                <span class="popup-title">Media Library</span>
            </div>
            <div style="padding: 8px;">
                <label class="add-page-btn" id="uploadMediaBtn" style="margin:0 0 12px;cursor:pointer">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    Upload Media
                    <input type="file" id="mediaFileInput" accept="image/*,video/*" multiple hidden>
                </label>
            </div>
            <div class="media-grid">
                ${mediaItems.length === 0 ? '<p style="grid-column:1/-1;text-align:center;color:#666;padding:40px;font-size:13px">No media uploaded yet</p>' : 
                    mediaItems.map(item => `
                        <div class="media-item" data-media-id="${item.id}">
                            ${item.type.startsWith('video') ? 
                                `<video src="${item.url}" muted></video>` : 
                                `<img src="${item.url}" alt="${item.name}">`
                            }
                            <div class="media-item-name">${item.name}</div>
                        </div>
                    `).join('')
                }
            </div>
        `;
        
        const popup = this.show(button, html, { size: 'large' });
        
        // Upload handler
        popup.querySelector('#uploadMediaBtn')?.addEventListener('click', () => {
            popup.querySelector('#mediaFileInput')?.click();
        });
        
        popup.querySelector('#mediaFileInput')?.addEventListener('change', (e) => {
            MediaLibrary.uploadFiles(e.target.files);
            setTimeout(() => this.showMediaLibrary(button), 200);
        });
        
        // Select media to add as image element
        popup.querySelectorAll('.media-item').forEach(item => {
            item.addEventListener('dblclick', () => {
                const mediaId = item.dataset.mediaId;
                const media = MediaLibrary.getItem(mediaId);
                if (media) {
                    Elements.add('image', {
                        properties: { src: media.url, alt: media.name },
                        styles: { width: '250px', height: '180px' }
                    });
                    this.closeAll();
                }
            });
        });
    },
    
    showSettings(button) {
        const settings = AppState.settings;
        
        let html = `
            <div class="popup-header">
                <span class="popup-title">Settings</span>
            </div>
            <div class="settings-form">
                <div class="setting-item">
                    <label class="setting-label">Snap to Grid</label>
                    <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
                        <input type="checkbox" class="setting-check" data-setting="snapToGrid" ${settings.snapToGrid ? 'checked' : ''}>
                        <span style="font-size:13px;color:#888">Enable grid snapping</span>
                    </label>
                </div>
                <div class="setting-item">
                    <label class="setting-label">Grid Size</label>
                    <input type="number" class="prop-input prop-input-full" data-setting="gridSize" value="${settings.gridSize}" min="1" max="50">
                </div>
                <div class="setting-item">
                    <label class="setting-label">Auto Save</label>
                    <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
                        <input type="checkbox" class="setting-check" data-setting="autoSave" ${settings.autoSave ? 'checked' : ''}>
                        <span style="font-size:13px;color:#888">Save automatically</span>
                    </label>
                </div>
                <div class="setting-item">
                    <label class="setting-label">Project Name</label>
                    <input type="text" class="prop-input prop-input-full" id="settingProjectName" value="${AppState.project.name}">
                </div>
                <div class="setting-item">
                    <button class="btn btn-primary btn-block" id="clearDataBtn" style="background:#dc2626;margin-top:8px">Clear All Data</button>
                    <p class="setting-desc">This will reset your entire project. Use with caution!</p>
                </div>
            </div>
        `;
        
        const popup = this.show(button, html, { width: 300 });
        
        // Settings handlers
        popup.querySelectorAll('.setting-check').forEach(check => {
            check.addEventListener('change', (e) => {
                settings[e.target.dataset.setting] = e.target.checked;
                AppState.saveToStorage();
            });
        });
        
        popup.querySelectorAll('[data-setting]:not(.setting-check)').forEach(input => {
            input.addEventListener('change', (e) => {
                const val = e.target.type === 'number' ? parseInt(e.target.value) : e.target.value;
                settings[e.target.dataset.setting] = val;
                AppState.saveToStorage();
            });
        });
        
        popup.querySelector('#settingProjectName')?.addEventListener('change', (e) => {
            AppState.project.name = e.target.value;
            document.getElementById('projectName').textContent = e.target.value;
            AppState.saveToStorage();
        });
        
        popup.querySelector('#clearDataBtn')?.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all project data? This cannot be undone!')) {
                AppState.clearStorage();
                Canvas.render();
                Toast.show('All data cleared', 'warning');
                this.closeAll();
            }
        });
    },
    
    closeAll() {
        if (this.currentPopup) {
            this.currentPopup.remove();
            this.currentPopup = null;
        }
        
        // Also remove any overlay
        const overlay = this.container.querySelector('.popup-overlay');
        if (overlay) overlay.remove();
    }
};

// Make globally available
window.PopupMenu = PopupMenu;
