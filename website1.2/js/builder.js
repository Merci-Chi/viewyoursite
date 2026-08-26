/* ============================================
   ViewYourSite - Main Builder Controller
   Initialization, Preview, Context Menu
   ============================================ */

const Builder = {
    init() {
        // Initialize all modules
        AppState.init();
        Canvas.init();
        Elements.init();
        PopupMenu.init();
        PropertiesPanel.init();
        Pages.init();
        MediaLibrary.init();
        Export.init();
        
        // Setup additional features
        this.setupPreviewModal();
        this.setupContextMenu();
        this.setupKeyboardShortcuts();
        this.setupProjectName();
        
        // Auto-save
        if (AppState.settings.autoSave) {
            setInterval(() => {
                AppState.saveToStorage();
            }, AppState.settings.autoSaveInterval);
        }
        
        console.log('ViewYourSite Builder initialized');
        Toast.show('Builder loaded successfully', 'success');
    },
    
    setupPreviewModal() {
        const previewBtn = document.getElementById('previewBtn');
        const modal = document.getElementById('previewModal');
        const closeBtn = document.getElementById('closePreview');
        const deviceSelect = document.getElementById('previewDeviceSelect');
        const frame = document.getElementById('previewFrame');
        
        previewBtn?.addEventListener('click', () => {
            this.updatePreview();
            modal.classList.add('visible');
        });
        
        closeBtn?.addEventListener('click', () => {
            modal.classList.remove('visible');
        });
        
        deviceSelect?.addEventListener('change', () => {
            this.updatePreview(deviceSelect.value);
        });
        
        // Close on overlay click
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('visible');
            }
        });
    },
    
    updatePreview(device = 'desktop') {
        const frame = document.getElementById('previewFrame');
        if (!frame) return;
        
        // Generate preview HTML
        const html = Export.generateHTML({ inlineImages: true });
        
        // Create blob URL for iframe
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        frame.src = url;
        
        // Set width based on device
        switch (device) {
            case 'tablet':
                frame.style.maxWidth = '768px';
                break;
            case 'mobile':
                frame.style.maxWidth = '375px';
                break;
            default:
                frame.style.maxWidth = '100%';
        }
    },
    
    setupContextMenu() {
        const canvas = document.getElementById('canvas');
        const menu = document.getElementById('contextMenu');
        
        canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            
            const elementEl = e.target.closest('.canvas-element');
            
            if (elementEl) {
                // Select element first
                AppState.selectElement(elementEl.dataset.id);
                
                // Show context menu
                const x = e.clientX;
                const y = e.clientY;
                
                menu.style.left = `${x}px`;
                menu.style.top = `${y}px`;
                menu.classList.add('visible');
                
                // Adjust position if off screen
                requestAnimationFrame(() => {
                    const rect = menu.getBoundingClientRect();
                    if (rect.right > window.innerWidth) {
                        menu.style.left = `${x - rect.width}px`;
                    }
                    if (rect.bottom > window.innerHeight) {
                        menu.style.top = `${y - rect.height}px`;
                    }
                });
            } else {
                menu.classList.remove('visible');
            }
        });
        
        // Handle context menu actions
        menu.querySelectorAll('.context-item').forEach(item => {
            item.addEventListener('click', () => {
                const action = item.dataset.action;
                const selectedEl = AppState.getSelectedElement();
                
                if (!selectedEl) return;
                
                switch (action) {
                    case 'duplicate':
                        AppState.duplicateElement(selectedEl.id);
                        Canvas.render();
                        PropertiesPanel.update();
                        Toast.show('Duplicated', 'success');
                        break;
                        
                    case 'bringFront':
                        AppState.bringToFront(selectedEl.id);
                        Canvas.render();
                        break;
                        
                    case 'sendBack':
                        AppState.sendToBack(selectedEl.id);
                        Canvas.render();
                        break;
                        
                    case 'bringForward':
                        AppState.bringForward(selectedEl.id);
                        Canvas.render();
                        break;
                        
                    case 'sendBackward':
                        AppState.sendBackward(selectedEl.id);
                        Canvas.render();
                        break;
                        
                    case 'lock':
                        AppState.toggleLock(selectedEl.id);
                        Canvas.render();
                        PropertiesPanel.update();
                        Toast.show(selectedEl.locked ? 'Unlocked' : 'Locked', 'info');
                        break;
                        
                    case 'hide':
                        AppState.toggleVisibility(selectedEl.id);
                        Canvas.render();
                        PropertiesPanel.update();
                        Toast.show(selectedEl.hidden ? 'Hidden' : 'Visible', 'info');
                        break;
                        
                    case 'delete':
                        AppState.deleteElement(selectedEl.id);
                        Canvas.render();
                        PropertiesPanel.update();
                        Toast.show('Deleted', 'success');
                        break;
                }
                
                menu.classList.remove('visible');
            });
        });
        
        // Close on click elsewhere
        document.addEventListener('click', () => {
            menu.classList.remove('visible');
        });
    },
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Don't trigger when typing in inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.contentEditable === 'true') {
                return;
            }
            
            // Ctrl/Cmd + shortcuts
            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 's':
                        e.preventDefault();
                        AppState.saveToStorage();
                        Toast.show('Project saved', 'success');
                        break;
                        
                    case 'e':
                        e.preventDefault();
                        document.getElementById('exportBtn')?.click();
                        break;
                        
                    case 'p':
                        e.preventDefault();
                        document.getElementById('previewBtn')?.click();
                        break;
                }
            }
            
            // Tool shortcuts
            switch (e.key.toLowerCase()) {
                case 'v':
                    if (!e.ctrlKey && !e.metaKey) {
                        document.querySelector('[data-tool="select"]')?.click();
                    }
                    break;
                    
                case 'h':
                    if (!e.ctrlKey && !e.metaKey) {
                        document.querySelector('[data-tool="hand"]')?.click();
                    }
                    break;
                    
                case 'escape':
                    AppState.deselectAll();
                    PopupMenu.closeAll();
                    break;
            }
        });
        
        // Tool buttons
        document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tool-btn[data-tool]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                AppState.currentTool = btn.dataset.tool;
                
                // Update cursor
                const canvas = document.getElementById('canvas');
                if (btn.dataset.tool === 'hand') {
                    canvas.style.cursor = 'grab';
                } else {
                    canvas.style.cursor = 'default';
                }
            });
        });
        
        // View mode buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                Canvas.setViewMode(btn.dataset.view);
            });
        });
        
        // Undo/Redo buttons
        document.getElementById('undoBtn').addEventListener('click', () => AppState.undo());
        document.getElementById('redoBtn').addEventListener('click', () => AppState.redo());
    },
    
    setupProjectName() {
        const nameEl = document.getElementById('projectName');
        
        nameEl?.addEventListener('blur', () => {
            const newName = nameEl.textContent.trim() || 'Untitled Project';
            nameEl.textContent = newName;
            AppState.project.name = newName;
            AppState.saveToStorage();
        });
        
        nameEl?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                nameEl.blur();
            }
        });
    }
};

// ============================================
// TOAST NOTIFICATION SYSTEM
// ============================================

const Toast = {
    container: null,
    
    init() {
        this.container = document.getElementById('toastContainer');
    },
    
    show(message, type = 'info', duration = 3000) {
        if (!this.container) {
            this.container = document.getElementById('toastContainer');
        }
        
        const icons = {
            success: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
            error: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
            warning: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
            info: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
        };
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            ${icons[type] || icons.info}
            <span class="toast-message">${message}</span>
            <button class="toast-close">&times;</button>
        `;
        
        // Close button handler
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 200);
        });
        
        this.container.appendChild(toast);
        
        // Auto remove
        setTimeout(() => {
            if (toast.parentElement) {
                toast.classList.add('removing');
                setTimeout(() => toast.remove(), 200);
            }
        }, duration);
    }
};

// Make globally available
window.Toast = Toast;

// ============================================
// INITIALIZE ON DOM READY
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    Builder.init();
});
