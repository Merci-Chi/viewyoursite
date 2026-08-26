/* ============================================
   ViewYourSite - Canvas Management
   Drag, Resize, Rendering, Zoom
   ============================================ */

const Canvas = {
    element: null,
    container: null,
    wrapper: null,
    
    init() {
        this.element = document.getElementById('canvas');
        this.container = document.getElementById('canvasContainer');
        this.wrapper = document.getElementById('canvasWrapper');
        
        this.setupEventListeners();
        this.render();
        return this;
    },
    
    setupEventListeners() {
        // Canvas click to deselect
        this.element.addEventListener('click', (e) => {
            if (e.target === this.element || e.target.classList.contains('canvas-placeholder')) {
                AppState.deselectAll();
            }
        });
        
        // Mouse events for drag
        this.element.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        
        // Zoom controls
        document.getElementById('zoomIn').addEventListener('click', () => this.setZoom(AppState.zoom + 10));
        document.getElementById('zoomOut').addEventListener('click', () => this.setZoom(AppState.zoom - 10));
        document.getElementById('zoomFit').addEventListener('click', () => this.fitToScreen());
        
        // Mouse wheel zoom
        this.wrapper.addEventListener('wheel', (e) => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                const delta = e.deltaY > 0 ? -10 : 10;
                this.setZoom(AppState.zoom + delta);
            }
        }, { passive: false });
    },
    
    handleMouseDown(e) {
        const elementEl = e.target.closest('.canvas-element');
        
        if (elementEl && !elementEl.classList.contains('locked')) {
            // Check if clicking on resize handle
            if (e.target.classList.contains('resize-handle') || e.target.classList.contains('rotate-handle')) {
                this.startResize(e, elementEl);
                return;
            }
            
            // Start dragging
            AppState.selectElement(elementEl.dataset.id);
            this.startDrag(e, elementEl);
        } else if (!e.target.closest('.resize-handles')) {
            // Clicked on empty area - deselect
            if (e.target === this.element || e.target.classList.contains('canvas-placeholder')) {
                AppState.deselectAll();
            }
        }
    },
    
    startDrag(e, elementEl) {
        e.preventDefault();
        AppState.isDragging = true;
        
        const rect = elementEl.getBoundingClientRect();
        const canvasRect = this.element.getBoundingClientRect();
        
        AppState.dragStartX = e.clientX;
        AppState.dragStartY = e.clientY;
        AppState.dragElementStartX = rect.left - canvasRect.left;
        AppState.dragElementStartY = rect.top - canvasRect.top;
        
        elementEl.classList.add('dragging');
    },
    
    startResize(e, elementEl) {
        e.preventDefault();
        e.stopPropagation();
        
        AppState.isResizing = true;
        AppState.resizeHandle = e.target.classList.contains('rotate-handle') ? 'rotate' : 
            Array.from(e.target.classList).find(c => ['nw','n','ne','e','se','s','sw','w'].includes(c)) || 'se';
        
        const el = AppState.getSelectedElement();
        if (el) {
            const styles = el.styles;
            AppState.resizeStartX = e.clientX;
            AppState.resizeStartY = e.clientY;
            AppState.resizeStartWidth = parseInt(styles.width) || elementEl.offsetWidth;
            AppState.resizeStartHeight = parseInt(styles.height) || elementEl.offsetHeight;
            AppState.resizeStartElementX = parseInt(styles.left) || 0;
            AppState.resizeStartElementY = parseInt(styles.top) || 0;
        }
    },
    
    handleMouseMove(e) {
        if (AppState.isDragging) {
            const selectedEl = AppState.getSelectedElement();
            if (!selectedEl) return;
            
            const dx = e.clientX - AppState.dragStartX;
            const dy = e.clientY - AppState.dragStartY;
            
            // Adjust for zoom
            const scale = AppState.zoom / 100;
            const newX = Math.round((AppState.dragElementStartX + dx / scale));
            const newY = Math.round((AppState.dragElementStartY + dy / scale));
            
            AppState.updateElement(selectedEl.id, {
                styles: {
                    ...selectedEl.styles,
                    left: Math.max(0, newX),
                    top: Math.max(0, newY)
                }
            });
            
            // Update DOM position directly for performance
            const elDom = this.element.querySelector(`[data-id="${selectedEl.id}"]`);
            if (elDom) {
                elDom.style.left = newX + 'px';
                elDom.style.top = newY + 'px';
            }
        }
        
        if (AppState.isResizing) {
            this.handleResize(e);
        }
    },
    
    handleResize(e) {
        const selectedEl = AppState.getSelectedElement();
        if (!selectedEl) return;
        
        const dx = e.clientX - AppState.resizeStartX;
        const dy = e.clientY - AppState.resizeStartY;
        const scale = AppState.zoom / 100;
        
        let newWidth = AppState.resizeStartWidth + (dx / scale);
        let newHeight = AppState.resizeStartHeight + (dy / scale);
        let newLeft = AppState.resizeStartElementX;
        let newTop = AppState.resizeStartElementY;
        
        const handle = AppState.resizeHandle;
        
        switch (handle) {
            case 'nw':
                newLeft = AppState.resizeStartElementX + (dx / scale);
                newTop = AppState.resizeStartElementY + (dy / scale);
                newWidth = AppState.resizeStartWidth - (dx / scale);
                newHeight = AppState.resizeStartHeight - (dy / scale);
                break;
            case 'n':
                newTop = AppState.resizeStartElementY + (dy / scale);
                newHeight = AppState.resizeStartHeight - (dy / scale);
                break;
            case 'ne':
                newTop = AppState.resizeStartElementY + (dy / scale);
                newWidth = AppState.resizeStartWidth + (dx / scale);
                newHeight = AppState.resizeStartHeight - (dy / scale);
                break;
            case 'e':
                newWidth = AppState.resizeStartWidth + (dx / scale);
                break;
            case 'se':
                newWidth = AppState.resizeStartWidth + (dx / scale);
                newHeight = AppState.resizeStartHeight + (dy / scale);
                break;
            case 's':
                newHeight = AppState.resizeStartHeight + (dy / scale);
                break;
            case 'sw':
                newLeft = AppState.resizeStartElementX + (dx / scale);
                newWidth = AppState.resizeStartWidth - (dx / scale);
                newHeight = AppState.resizeStartHeight + (dy / scale);
                break;
            case 'w':
                newLeft = AppState.resizeStartElementX + (dx / scale);
                newWidth = AppState.resizeStartWidth - (dx / scale);
                break;
        }
        
        // Minimum sizes
        newWidth = Math.max(20, Math.round(newWidth));
        newHeight = Math.max(20, Math.round(newHeight));
        newLeft = Math.max(0, Math.round(newLeft));
        newTop = Math.max(0, Math.round(newTop));
        
        AppState.updateElement(selectedEl.id, {
            styles: {
                ...selectedEl.styles,
                width: newWidth + 'px',
                height: newHeight + 'px',
                left: newLeft + 'px',
                top: newTop + 'px'
            }
        });
        
        // Update DOM directly
        const elDom = this.element.querySelector(`[data-id="${selectedEl.id}"]`);
        if (elDom) {
            elDom.style.width = newWidth + 'px';
            elDom.style.height = newHeight + 'px';
            elDom.style.left = newLeft + 'px';
            elDom.style.top = newTop + 'px';
        }
    },
    
    handleMouseUp(e) {
        if (AppState.isDragging) {
            AppState.isDragging = false;
            const selectedEl = AppState.getSelectedElement();
            if (selectedEl) {
                const elDom = this.element.querySelector(`[data-id="${selectedEl.id}"]`);
                if (elDom) elDom.classList.remove('dragging');
            }
            AppState.saveHistory();
        }
        
        if (AppState.isResizing) {
            AppState.isResizing = false;
            AppState.resizeHandle = null;
            AppState.saveHistory();
        }
    },
    
    handleKeyDown(e) {
        // Don't handle if typing in input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.contentEditable === 'true') {
            return;
        }
        
        const selectedEl = AppState.getSelectedElement();
        
        // Delete
        if ((e.key === 'Delete' || e.key === 'Backspace') && selectedEl) {
            e.preventDefault();
            AppState.deleteElement(selectedEl.id);
            this.render();
            PropertiesPanel.update();
            Toast.show('Element deleted', 'success');
        }
        
        // Undo/Redo
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                AppState.undo();
            }
            if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
                e.preventDefault();
                AppState.redo();
            }
            if (e.key === 'd' && selectedEl) {
                e.preventDefault();
                AppState.duplicateElement(selectedEl.id);
                this.render();
                PropertiesPanel.update();
                Toast.show('Element duplicated', 'success');
            }
            if (e.key === 'c' && selectedEl) {
                AppState.clipboard = JSON.parse(JSON.stringify(selectedEl));
            }
            if (e.key === 'v' && AppState.clipboard) {
                const newEl = AppState.addElement({
                    ...AppState.clipboard,
                    left: (parseInt(AppState.clipboard.styles?.left) || 0) + 20,
                    top: (parseInt(AppState.clipboard.styles?.top) || 0) + 20
                });
                AppState.selectElement(newEl.id);
                this.render();
                PropertiesPanel.update();
            }
        }
        
        // Arrow keys for moving
        if (selectedEl && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
            const step = e.shiftKey ? 10 : 1;
            const styles = { ...selectedEl.styles };
            
            switch (e.key) {
                case 'ArrowUp':
                    styles.top = Math.max(0, (parseInt(styles.top) || 0) - step) + 'px';
                    break;
                case 'ArrowDown':
                    styles.top = ((parseInt(styles.top) || 0) + step) + 'px';
                    break;
                case 'ArrowLeft':
                    styles.left = Math.max(0, (parseInt(styles.left) || 0) - step) + 'px';
                    break;
                case 'ArrowRight':
                    styles.left = ((parseInt(styles.left) || 0) + step) + 'px';
                    break;
            }
            
            AppState.updateElement(selectedEl.id, { styles });
            
            const elDom = this.element.querySelector(`[data-id="${selectedEl.id}"]`);
            if (elDom) {
                Object.assign(elDom.style, styles);
            }
        }
        
        // Escape to deselect
        if (e.key === 'Escape') {
            AppState.deselectAll();
            PopupMenu.closeAll();
        }
    },
    
    render() {
        // Clear existing elements (keep placeholder)
        const existingElements = this.element.querySelectorAll('.canvas-element');
        existingElements.forEach(el => el.remove());
        
        // Show/hide placeholder
        const placeholder = this.element.querySelector('.canvas-placeholder');
        if (placeholder) {
            placeholder.classList.toggle('hidden', AppState.elements.length > 0);
        }
        
        // Render each element
        AppState.elements.forEach(el => {
            const dom = Elements.createDOM(el);
            if (dom) {
                this.element.appendChild(dom);
            }
        });
        
        // Render selection
        this.renderSelection();
    },
    
    renderSelection() {
        // Remove old selection UI
        this.element.querySelectorAll('.resize-handles').forEach(h => h.remove());
        
        const selectedId = AppState.selectedElementId;
        if (!selectedId) return;
        
        const elDom = this.element.querySelector(`[data-id="${selectedId}"]`);
        if (!elDom) return;
        
        elDom.classList.add('selected');
        
        // Create resize handles
        const handles = document.createElement('div');
        handles.className = 'resize-handles';
        handles.innerHTML = `
            <div class="resize-handle nw" data-handle="nw"></div>
            <div class="resize-handle n" data-handle="n"></div>
            <div class="resize-handle ne" data-handle="ne"></div>
            <div class="resize-handle e" data-handle="e"></div>
            <div class="resize-handle se" data-handle="se"></div>
            <div class="resize-handle s" data-handle="s"></div>
            <div class="resize-handle sw" data-handle="sw"></div>
            <div class="resize-handle w" data-handle="w"></div>
            <div class="rotate-handle" data-handle="rotate"></div>
        `;
        elDom.appendChild(handles);
        
        // Remove selection from others
        this.element.querySelectorAll('.canvas-element:not([data-id="${selectedId}"])').forEach(el => {
            el.classList.remove('selected');
        });
    },
    
    setZoom(level) {
        AppState.zoom = Math.max(25, Math.min(200, level));
        this.container.style.transform = `scale(${AppState.zoom / 100})`;
        document.getElementById('zoomLevel').textContent = `${Math.round(AppState.zoom)}%`;
    },
    
    fitToScreen() {
        const wrapperRect = this.wrapper.getBoundingClientRect();
        const padding = 80;
        const availableWidth = wrapperRect.width - padding * 2;
        const availableHeight = wrapperRect.height - padding * 2;
        
        const scaleX = (availableWidth / 1200) * 100;
        const scaleY = (availableHeight / 800) * 100;
        
        this.setZoom(Math.min(scaleX, scaleY, 100));
    },
    
    setViewMode(mode) {
        AppState.viewMode = mode;
        
        this.element.classList.remove('tablet-view', 'mobile-view');
        
        if (mode === 'tablet') {
            this.element.classList.add('tablet-view');
        } else if (mode === 'mobile') {
            this.element.classList.add('mobile-view');
        }
        
        // Update buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === mode);
        });
    }
};

// Make globally available
window.Canvas = Canvas;
