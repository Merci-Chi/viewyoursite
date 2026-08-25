/**
 * ViewYourSite - Professional Website Builder
 * Main Application Logic (app.js)
 * 
 * This file handles:
 * - Application initialization
 * - Global state management
 * - Event coordination between modules
 * - Keyboard shortcuts
 * - Toast notifications
 * - Auto-save functionality
 */

// ============================================
// Application State
// ============================================
const AppState = {
    // Current project data
    project: {
        id: null,
        name: 'Untitled Project',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    
    // Current page ID being edited
    currentPageId: null,
    
    // Currently selected element on canvas
    selectedElement: null,
    selectedElementId: null,
    
    // UI State
    ui: {
        gridVisible: true,
        guidesVisible: true,
        zoomLevel: 100,
        mediaPanelCollapsed: false,
        propertiesPanelOpen: true
    },
    
    // History for undo/redo
    history: {
        past: [],
        future: []
    },
    
    // Maximum history entries
    maxHistorySize: 50
};

// ============================================
// Utility Functions
// ============================================

/**
 * Generate a unique ID
 */
function generateId() {
    return 'el_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * Deep clone an object
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Debounce function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
}

// ============================================
// Toast Notification System
// ============================================

const Toast = {
    container: null,
    
    init() {
        this.container = document.getElementById('toastContainer');
    },
    
    show(message, type = 'info', duration = 3000) {
        if (!this.container) this.init();
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        `;
        
        this.container.appendChild(toast);
        
        // Auto remove after duration
        setTimeout(() => {
            toast.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },
    
    success(message, duration) {
        this.show(message, 'success', duration);
    },
    
    error(message, duration) {
        this.show(message, 'error', duration);
    },
    
    warning(message, duration) {
        this.show(message, 'warning', duration);
    },
    
    info(message, duration) {
        this.show(message, 'info', duration);
    }
};

// ============================================
// Local Storage Management
// ============================================

const Storage = {
    KEYS: {
        PROJECT: 'viewyoursite_project',
        PAGES: 'viewyoursite_pages',
        MEDIA: 'viewyoursite_media',
        SETTINGS: 'viewyoursite_settings'
    },
    
    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Storage save error:', e);
            Toast.error('Failed to save data');
            return false;
        }
    },
    
    load(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Storage load error:', e);
            return null;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Storage remove error:', e);
            return false;
        }
    },
    
    clearAll() {
        Object.values(this.KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    }
};

// ============================================
// History (Undo/Redo)
// ============================================

const HistoryManager = {
    push(state) {
        // Add current state to past
        AppState.history.past.push(deepClone(state));
        
        // Limit history size
        if (AppState.history.past.length > AppState.maxHistorySize) {
            AppState.history.past.shift();
        }
        
        // Clear future when new action is taken
        AppState.history.future = [];
        
        this.updateButtons();
    },
    
    undo() {
        if (AppState.history.past.length === 0) return false;
        
        // Get current state and add to future
        const currentState = PagesManager.getCurrentPageState();
        AppState.history.future.push(currentState);
        
        // Get previous state from past
        const previousState = AppState.history.past.pop();
        
        // Restore state
        PagesManager.restorePageState(previousState);
        
        this.updateButtons();
        Toast.info('Undo');
        return true;
    },
    
    redo() {
        if (AppState.history.future.length === 0) return false;
        
        // Get current state and add to past
        const currentState = PagesManager.getCurrentPageState();
        AppState.history.past.push(currentState);
        
        // Get next state from future
        const nextState = AppState.history.future.pop();
        
        // Restore state
        PagesManager.restorePageState(nextState);
        
        this.updateButtons();
        Toast.info('Redo');
        return true;
    },
    
    updateButtons() {
        document.getElementById('undoBtn').disabled = AppState.history.past.length === 0;
        document.getElementById('redoBtn').disabled = AppState.history.future.length === 0;
    },
    
    clear() {
        AppState.history.past = [];
        AppState.history.future = [];
        this.updateButtons();
    }
};

// ============================================
// Auto-Save System
// ============================================

const AutoSave = {
    interval: null,
    delay: 5000, // 5 seconds
    
    start() {
        this.stop(); // Clear any existing interval
        this.interval = setInterval(() => this.save(), this.delay);
    },
    
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    },
    
    save() {
        try {
            const projectData = {
                project: AppState.project,
                pages: PagesManager.getAllPages(),
                media: MediaLibrary.getItems(),
                settings: {
                    zoomLevel: AppState.ui.zoomLevel,
                    gridVisible: AppState.ui.gridVisible
                }
            };
            
            Storage.save(Storage.KEYS.PROJECT, projectData);
            
            // Update timestamp
            AppState.project.updatedAt = new Date().toISOString();
            
        } catch (e) {
            console.error('Auto-save error:', e);
        }
    },
    
    forceSave() {
        this.save();
        Toast.success('Project saved');
    }
};

// ============================================
// Zoom Controls
// ============================================

const ZoomManager = {
    minZoom: 25,
    maxZoom: 200,
    step: 10,
    
    set(level) {
        level = Math.max(this.minZoom, Math.min(this.maxZoom, level));
        AppState.ui.zoomLevel = level;
        
        const canvas = document.getElementById('canvas');
        canvas.style.transform = `scale(${level / 100})`;
        
        document.getElementById('zoomLevel').textContent = `${level}%`;
        
        AutoSave.save();
    },
    
    in() {
        this.set(AppState.ui.zoomLevel + this.step);
    },
    
    out() {
        this.set(AppState.ui.zoomLevel - this.step);
    },
    
    reset() {
        this.set(100);
    }
};

// ============================================
// Grid & Guides Toggle
// ============================================

const ViewControls = {
    toggleGrid() {
        AppState.ui.gridVisible = !AppState.ui.gridVisible;
        const wrapper = document.getElementById('canvasWrapper');
        wrapper.classList.toggle('no-grid', !AppState.ui.gridVisible);
        
        const btn = document.getElementById('toggleGridBtn');
        btn.classList.toggle('active', AppState.ui.gridVisible);
        
        AutoSave.save();
    },
    
    toggleGuides() {
        AppState.ui.guidesVisible = !AppState.ui.guidesVisible;
        const btn = document.getElementById('toggleGuidesBtn');
        btn.classList.toggle('active', AppState.ui.guidesVisible);
        
        AutoSave.save();
    }
};

// ============================================
// Modal Management
// ============================================

const ModalManager = {
    open(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    },
    
    close(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    },
    
    closeAll() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.style.display = 'none';
        });
        document.body.style.overflow = '';
    }
};

// ============================================
// Context Menu
// ============================================

const ContextMenu = {
    element: null,
    targetElement: null,
    
    show(x, y, targetElement) {
        this.element = document.getElementById('contextMenu');
        this.targetElement = targetElement;
        
        // Position context menu
        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;
        this.element.style.display = 'block';
        
        // Adjust if off screen
        const rect = this.element.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            this.element.style.left = `${x - rect.width}px`;
        }
        if (rect.bottom > window.innerHeight) {
            this.element.style.top = `${y - rect.height}px`;
        }
    },
    
    hide() {
        if (this.element) {
            this.element.style.display = 'none';
        }
        this.targetElement = null;
    },
    
    handleAction(action) {
        if (!this.targetElement) return;
        
        switch (action) {
            case 'edit':
                Editor.selectElement(this.targetElement);
                break;
            case 'duplicate':
                Editor.duplicateElement(this.targetElement);
                break;
            case 'moveUp':
                Editor.moveElementUp(this.targetElement);
                break;
            case 'moveDown':
                Editor.moveElementDown(this.targetElement);
                break;
            case 'delete':
                Editor.deleteElement(this.targetElement);
                break;
        }
        
        this.hide();
    }
};

// ============================================
// Page Selector Dropdown
// ============================================

const PageSelector = {
    isOpen: false,
    
    toggle() {
        this.isOpen = !this.isOpen;
        const dropdown = document.getElementById('pageDropdown');
        dropdown.classList.toggle('active', this.isOpen);
        
        if (this.isOpen) {
            this.renderOptions();
        }
    },
    
    close() {
        this.isOpen = false;
        document.getElementById('pageDropdown').classList.remove('active');
    },
    
    renderOptions() {
        const dropdown = document.getElementById('pageDropdown');
        const pages = PagesManager.getPages();
        const currentPageId = AppState.currentPageId;
        
        dropdown.innerHTML = pages.map(page => `
            <button class="page-dropdown-item ${page.id === currentPageId ? 'current' : ''}" 
                    data-page-id="${page.id}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-9V4a2 2 0 0 0-2-2z"/>
                    <polyline points="13 2 13 9 20 9"/>
                </svg>
                <span>${page.name}</span>
                ${page.isHome ? '<span class="page-indicator">HOME</span>' : ''}
            </button>
        `).join('');
        
        // Add click handlers
        dropdown.querySelectorAll('.page-dropdown-item').forEach(item => {
            item.addEventListener('click', () => {
                const pageId = item.dataset.pageId;
                PagesManager.switchToPage(pageId);
                this.close();
            });
        });
    },
    
    updateCurrentPageName(name) {
        document.getElementById('currentPageName').textContent = name;
    }
};

// ============================================
// Preview System
// ============================================

const PreviewSystem = {
    currentDevice: 'desktop',
    
    deviceWidths: {
        desktop: '100%',
        tablet: '768px',
        mobile: '375px'
    },
    
    open() {
        ModalManager.open('previewModal');
        this.renderPreview();
    },
    
    close() {
        ModalManager.close('previewModal');
    },
    
    setDevice(device) {
        this.currentDevice = device;
        
        // Update button states
        document.querySelectorAll('.device-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.device === device);
        });
        
        // Update iframe width
        const frame = document.getElementById('previewFrame');
        frame.style.width = this.deviceWidths[device];
        frame.style.margin = device === 'desktop' ? '0' : '0 auto';
        frame.style.maxWidth = '100%';
        
        this.renderPreview();
    },
    
    renderPreview() {
        const frame = document.getElementById('previewFrame');
        const html = ExportManager.generatePreviewHTML();
        
        // Create blob URL for preview
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        frame.srcdoc = html;
        
        // Update preview URL display
        document.getElementById('previewUrl').textContent = `Preview - ${PagesManager.getCurrentPage()?.name || 'Untitled'}`;
    },
    
    refresh() {
        this.renderPreview();
        Toast.success('Preview refreshed');
    },
    
    openInNewTab() {
        const html = ExportManager.generatePreviewHTML();
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    }
};

// ============================================
// Export System (Basic - Full in export.js)
// ============================================

const ExportManager = {
    generatePreviewHTML() {
        const currentPage = PagesManager.getCurrentPage();
        if (!currentPage) return '<html><body>No page selected</body></html>';
        
        const pages = PagesManager.getPages();
        const allComponents = currentPage.components || [];
        
        // Generate component HTML
        const componentsHTML = allComponents.map(comp => {
            return ComponentRenderer.renderForExport(comp);
        }).join('\n');
        
        // Generate navigation
        const navItems = pages.filter(p => p.enabled !== false && p.type !== 'link').map(p => `
            <a href="#${p.slug || p.name.toLowerCase().replace(/\s+/g, '-')}" 
               class="${p.id === currentPage.id ? 'active' : ''}">${p.navTitle || p.name}</a>
        `).join('\n');
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${currentPage.metaTitle || currentPage.name}</title>
    <meta name="description" content="${currentPage.metaDescription || ''}">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #1a1a1a; }
        header { background: #fff; padding: 1rem 2rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); position: sticky; top: 0; z-index: 100; }
        .nav-container { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
        .logo { font-weight: 700; font-size: 1.25rem; color: #6366f1; }
        nav a { text-decoration: none; color: #374151; margin-left: 1.5rem; transition: color 0.2s; }
        nav a:hover, nav a.active { color: #6366f1; }
        main { min-height: calc(100vh - 160px); }
        footer { background: #1e293b; color: #94a3b8; padding: 2rem; text-align: center; }
        footer a { color: #6366f1; text-decoration: none; }
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        img { max-width: 100%; height: auto; }
        h1, h2, h3, h4, h5, h6 { line-height: 1.2; margin-bottom: 1rem; }
        p { margin-bottom: 1rem; }
        ${currentPage.headCode || ''}
    </style>
</head>
<body>
    ${currentPage.showHeader !== false ? `
    <header>
        <div class="nav-container">
            <div class="logo">ViewYourSite</div>
            <nav>${navItems}</nav>
        </div>
    </header>` : ''}
    
    <main>
        <div class="container" style="${this.getPageBackgroundStyle(currentPage)}">
            ${componentsHTML}
        </div>
    </main>
    
    ${currentPage.showFooter !== false ? `
    <footer>
        <p>&copy; ${new Date().getFullYear()} ViewYourSite. Built with ViewYourSite Builder.</p>
    </footer>` : ''}
    
    ${currentPage.bodyCode || ''}
</body>
</html>`;
    },
    
    getPageBackgroundStyle(page) {
        if (!page.background) return '';
        
        const bg = page.background;
        let styles = [];
        
        switch (bg.type) {
            case 'color':
                styles.push(`background-color: ${bg.color};`);
                break;
            case 'gradient':
                if (bg.gradientType === 'radial') {
                    styles.push(`background: radial-gradient(circle, ${bg.color1}, ${bg.color2});`);
                } else {
                    styles.push(`background: linear-gradient(135deg, ${bg.color1}, ${bg.color2});`);
                }
                break;
            case 'image':
                styles.push(`background-image: url('${bg.image}');`);
                styles.push(`background-size: cover;`);
                styles.push(`background-position: center;`);
                break;
        }
        
        return styles.join(' ');
    }
};

// ============================================
// Keyboard Shortcuts
// ============================================

const KeyboardShortcuts = {
    init() {
        document.addEventListener('keydown', (e) => {
            // Don't trigger shortcuts when typing in inputs
            if (e.target.matches('input, textarea, [contenteditable]')) {
                // Allow escape to deselect even in inputs
                if (e.key === 'Escape') {
                    Editor.deselectElement();
                }
                return;
            }
            
            const ctrl = e.ctrlKey || e.metaKey;
            
            // Ctrl+Z - Undo
            if (ctrl && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                HistoryManager.undo();
            }
            
            // Ctrl+Y or Ctrl+Shift+Z - Redo
            if (ctrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                HistoryManager.redo();
            }
            
            // Ctrl+S - Save
            if (ctrl && e.key === 's') {
                e.preventDefault();
                AutoSave.forceSave();
            }
            
            // Ctrl+D - Duplicate
            if (ctrl && e.key === 'd') {
                e.preventDefault();
                if (AppState.selectedElement) {
                    Editor.duplicateElement(AppState.selectedElement);
                }
            }
            
            // Delete/Backspace - Delete element
            if ((e.key === 'Delete' || e.key === 'Backspace') && AppState.selectedElement) {
                e.preventDefault();
                Editor.deleteElement(AppState.selectedElement);
            }
            
            // Escape - Deselect
            if (e.key === 'Escape') {
                Editor.deselectElement();
                ModalManager.closeAll();
                ContextMenu.hide();
            }
            
            // +/- - Zoom
            if (e.key === '=' || e.key === '+') {
                e.preventDefault();
                ZoomManager.in();
            }
            if (e.key === '-') {
                e.preventDefault();
                ZoomManager.out();
            }
            
            // 0 - Reset zoom
            if (e.key === '0' && ctrl) {
                e.preventDefault();
                ZoomManager.reset();
            }
        });
    }
};

// ============================================
// Event Handlers Setup
// ============================================

function setupEventHandlers() {
    // Top Bar Events
    document.getElementById('undoBtn').addEventListener('click', () => HistoryManager.undo());
    document.getElementById('redoBtn').addEventListener('click', () => HistoryManager.redo());
    document.getElementById('previewBtn').addEventListener('click', () => PreviewSystem.open());
    document.getElementById('exportBtn').addEventListener('click', () => ModalManager.open('exportModal'));
    
    // Page Selector
    document.getElementById('currentPageBtn').addEventListener('click', () => PageSelector.toggle());
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#pageSelector')) {
            PageSelector.close();
        }
    });
    
    // Add Component Button
    document.getElementById('addComponentBtn').addEventListener('click', () => {
        ModalManager.open('componentPickerModal');
    });
    
    // Close Component Picker
    document.getElementById('closeComponentPicker').addEventListener('click', () => {
        ModalManager.close('componentPickerModal');
    });
    
    // Zoom Controls
    document.getElementById('zoomInBtn').addEventListener('click', () => ZoomManager.in());
    document.getElementById('zoomOutBtn').addEventListener('click', () => ZoomManager.out());
    
    // Grid/Guides Toggle
    document.getElementById('toggleGridBtn').addEventListener('click', () => ViewControls.toggleGrid());
    document.getElementById('toggleGuidesBtn').addEventListener('click', () => ViewControls.toggleGuides());
    
    // Media Panel Toggle
    document.getElementById('toggleMediaPanel').addEventListener('click', () => {
        const panel = document.getElementById('mediaPanel');
        const isCollapsed = panel.classList.toggle('collapsed');
        AppState.ui.mediaPanelCollapsed = isCollapsed;
        
        const icon = document.querySelector('#toggleMediaPanel svg');
        icon.style.transform = isCollapsed ? 'rotate(180deg)' : '';
    });
    
    // Properties Panel Close
    document.getElementById('closePropertiesBtn').addEventListener('click', () => {
        document.getElementById('propertiesSidebar').style.display = 'none';
    });
    
    // Element Toolbar Actions
    document.getElementById('duplicateBtn').addEventListener('click', () => {
        if (AppState.selectedElement) {
            Editor.duplicateElement(AppState.selectedElement);
        }
    });
    
    document.getElementById('deleteElementBtn').addEventListener('click', () => {
        if (AppState.selectedElement) {
            Editor.deleteElement(AppState.selectedElement);
        }
    });
    
    // Quick Add Items
    document.querySelectorAll('.quick-add-item').forEach(item => {
        item.addEventListener('click', () => {
            const componentType = item.dataset.component;
            Editor.addComponent(componentType);
        });
    });
    
    // Component Cards in Picker
    document.querySelectorAll('.component-card').forEach(card => {
        card.addEventListener('click', () => {
            const componentType = card.dataset.component;
            Editor.addComponent(componentType);
            ModalManager.close('componentPickerModal');
        });
    });
    
    // Category Filter in Component Picker
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const category = btn.dataset.category;
            document.querySelectorAll('.component-card').forEach(card => {
                card.style.display = (category === 'all' || card.dataset.category === category) ? '' : 'none';
            });
        });
    });
    
    // Preview Modal Events
    document.getElementById('closePreview').addEventListener('click', () => PreviewSystem.close());
    document.getElementById('refreshPreview').addEventListener('click', () => PreviewSystem.refresh());
    document.getElementById('openPreviewNewTab').addEventListener('click', () => PreviewSystem.openInNewTab());
    
    document.querySelectorAll('.device-btn').forEach(btn => {
        btn.addEventListener('click', () => PreviewSystem.setDevice(btn.dataset.device));
    });
    
    // Export Modal Events
    document.getElementById('closeExportModal').addEventListener('click', () => ModalManager.close('exportModal'));
    document.getElementById('cancelExport').addEventListener('click', () => ModalManager.close('exportModal'));
    document.getElementById('startExport').addEventListener('click', () => {
        ExportSystem.export();
        ModalManager.close('exportModal');
    });
    
    // Context Menu Events
    document.addEventListener('contextmenu', (e) => {
        const element = e.target.closest('.builder-element');
        if (element) {
            e.preventDefault();
            ContextMenu.show(e.clientX, e.clientY, element);
        }
    });
    
    document.addEventListener('click', () => ContextMenu.hide());
    
    document.querySelectorAll('.context-item').forEach(item => {
        item.addEventListener('click', () => ContextMenu.handleAction(item.dataset.action));
    });
    
    // Click outside to deselect
    document.getElementById('canvas').addEventListener('click', (e) => {
        if (e.target.id === 'canvas' || e.target.closest('.empty-canvas')) {
            Editor.deselectElement();
        }
    });
    
    // Settings Tabs
    document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const panel = tab.dataset.settings;
            document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`settings-${panel}`).classList.add('active');
        });
    });
    
    // Properties Tabs
    document.querySelectorAll('.prop-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const panel = tab.dataset.tab;
            document.querySelectorAll('.prop-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.prop-panel').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`panel-${panel}`).classList.add('active');
        });
    });
    
    // Media Panel Tabs
    document.querySelectorAll('.media-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const panel = tab.dataset.tab;
            document.querySelectorAll('.media-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.media-tab-content').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`mediaTab${panel.charAt(0).toUpperCase() + panel.slice(1)}`).classList.add('active');
        });
    });
    
    // Page Background Type Change
    document.getElementById('pageBgType').addEventListener('change', (e) => {
        const type = e.target.value;
        document.getElementById('bgColorGroup').style.display = type === 'color' ? '' : 'none';
        document.getElementById('bgGradientGroup').style.display = type === 'gradient' ? '' : 'none';
        document.getElementById('bgGradientColorsGroup').style.display = type === 'gradient' ? '' : 'none';
        document.getElementById('bgImageGroup').style.display = type === 'image' ? '' : 'none';
        
        // Apply background change
        PropertiesPanel.applyPageBackground(type);
    });
    
    // Initialize keyboard shortcuts
    KeyboardShortcuts.init();
}

// ============================================
// Application Initialization
// ============================================

function initializeApp() {
    console.log('Initializing ViewYourSite...');
    
    // Initialize modules
    Toast.init();
    PagesManager.init();
    MediaLibrary.init();
    Editor.init();
    PropertiesPanel.init();
    
    // Setup event handlers
    setupEventHandlers();
    
    // Load saved project or create default
    loadProject();
    
    // Start auto-save
    AutoSave.start();
    
    // Set initial UI state
    document.getElementById('toggleGridBtn').classList.toggle('active', AppState.ui.gridVisible);
    
    console.log('ViewYourSite initialized successfully!');
}

function loadProject() {
    const savedProject = Storage.load(Storage.KEYS.PROJECT);
    
    if (savedProject && savedProject.pages && savedProject.pages.length > 0) {
        // Restore project
        AppState.project = savedProject.project || AppState.project;
        PagesManager.setPages(savedProject.pages);
        MediaLibrary.setItems(savedProject.media || []);
        
        if (savedProject.settings) {
            AppState.ui.zoomLevel = savedProject.settings.zoomLevel || 100;
            AppState.ui.gridVisible = savedProject.settings.gridVisible !== false;
        }
        
        // Switch to first page or last active page
        const firstPage = savedProject.pages[0];
        if (firstPage) {
            PagesManager.switchToPage(firstPage.id);
        }
        
        Toast.success('Project loaded');
    } else {
        // Create default project with home page
        createDefaultProject();
    }
}

function createDefaultProject() {
    const homePage = PagesManager.createPage({
        name: 'Home',
        navTitle: 'Home',
        slug: 'home',
        isHome: true,
        metaTitle: 'Welcome - My Website',
        metaDescription: 'Built with ViewYourSite'
    });
    
    PagesManager.switchToPage(homePage.id);
    Toast.info('New project created');
}

// ============================================
// Start Application
// ============================================

document.addEventListener('DOMContentLoaded', initializeApp);

// Expose globally for debugging
window.ViewYourSite = {
    AppState,
    Storage,
    Toast,
    HistoryManager,
    AutoSave
};
