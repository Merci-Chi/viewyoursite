/* ============================================
   ViewYourSite - State Management
   Complete application state handling
   ============================================ */

const AppState = {
    // Project Info
    project: {
        id: null,
        name: 'Untitled Project',
        createdAt: Date.now(),
        updatedAt: Date.now()
    },
    
    // Current Page
    currentPageId: 'page-1',
    
    // Pages Collection
    pages: [],
    
    // Elements on current page
    elements: [],
    
    // Selected Element ID
    selectedElementId: null,
    
    // History for undo/redo
    history: [],
    historyIndex: -1,
    maxHistory: 50,
    
    // Zoom level
    zoom: 100,
    
    // View mode (desktop, tablet, mobile)
    viewMode: 'desktop',
    
    // Current tool
    currentTool: 'select',
    
    // Dragging state
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    dragElementStartX: 0,
    dragElementStartY: 0,
    
    // Resizing state
    isResizing: false,
    resizeHandle: null,
    resizeStartX: 0,
    resizeStartY: 0,
    resizeStartWidth: 0,
    resizeStartHeight: 0,
    resizeStartElementX: 0,
    resizeStartElementY: 0,
    
    // Clipboard
    clipboard: null,
    
    // Settings
    settings: {
        snapToGrid: false,
        gridSize: 10,
        showRulers: true,
        showGuides: true,
        autoSave: true,
        autoSaveInterval: 30000
    },
    
    // Initialize
    init() {
        this.loadFromStorage();
        if (this.pages.length === 0) {
            this.createDefaultPage();
        }
        return this;
    },
    
    // Create default page
    createDefaultPage() {
        const defaultPage = {
            id: 'page-1',
            name: 'Home',
            type: 'page',
            path: '/',
            elements: [],
            settings: {
                title: 'Home - My Website',
                description: '',
                metaTags: {},
                customCSS: '',
                customJS: ''
            }
        };
        this.pages.push(defaultPage);
        this.currentPageId = defaultPage.id;
        this.saveToStorage();
    },
    
    // Generate unique ID
    generateId() {
        return 'el-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    },
    
    // Get current page
    getCurrentPage() {
        return this.pages.find(p => p.id === this.currentPageId);
    },
    
    // Set current page
    setCurrentPage(pageId) {
        // Save current page elements first
        this.saveCurrentPageElements();
        
        this.currentPageId = pageId;
        const page = this.getCurrentPage();
        this.elements = page ? [...page.elements] : [];
        this.selectedElementId = null;
        this.saveToStorage();
    },
    
    // Save current page elements
    saveCurrentPageElements() {
        const page = this.getCurrentPage();
        if (page) {
            page.elements = [...this.elements];
            page.updatedAt = Date.now();
        }
    },
    
    // Add element
    addElement(elementData) {
        const element = {
            id: this.generateId(),
            type: elementData.type || 'div',
            content: elementData.content || '',
            styles: {
                left: elementData.left || 100,
                top: elementData.top || 100,
                width: elementData.width || 'auto',
                height: elementData.height || 'auto',
                ...elementData.styles
            },
            properties: {
                ...elementData.properties
            },
            locked: false,
            hidden: false,
            zIndex: this.elements.length + 1,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        
        this.elements.push(element);
        this.saveHistory();
        this.saveToStorage();
        return element;
    },
    
    // Update element
    updateElement(id, updates) {
        const index = this.elements.findIndex(el => el.id === id);
        if (index !== -1) {
            this.elements[index] = {
                ...this.elements[index],
                ...updates,
                updatedAt: Date.now()
            };
            this.saveToStorage();
            return this.elements[index];
        }
        return null;
    },
    
    // Delete element
    deleteElement(id) {
        const index = this.elements.findIndex(el => el.id === id);
        if (index !== -1) {
            this.elements.splice(index, 1);
            if (this.selectedElementId === id) {
                this.selectedElementId = null;
            }
            this.saveHistory();
            this.saveToStorage();
            return true;
        }
        return false;
    },
    
    // Select element
    selectElement(id) {
        this.selectedElementId = id;
        Canvas.renderSelection();
        PropertiesPanel.update();
    },
    
    // Deselect
    deselectAll() {
        this.selectedElementId = null;
        Canvas.renderSelection();
        PropertiesPanel.update();
    },
    
    // Get selected element
    getSelectedElement() {
        return this.elements.find(el => el.id === this.selectedElementId);
    },
    
    // Duplicate element
    duplicateElement(id) {
        const element = this.elements.find(el => el.id === id);
        if (element) {
            const newElement = {
                ...element,
                id: this.generateId(),
                styles: {
                    ...element.styles,
                    left: (parseInt(element.styles.left) || 0) + 20,
                    top: (parseInt(element.styles.top) || 0) + 20
                },
                zIndex: this.elements.length + 1,
                createdAt: Date.now(),
                updatedAt: Date.now()
            };
            this.elements.push(newElement);
            this.selectedElementId = newElement.id;
            this.saveHistory();
            this.saveToStorage();
            return newElement;
        }
        return null;
    },
    
    // Layer operations
    bringToFront(id) {
        const maxZ = Math.max(...this.elements.map(e => e.zIndex), 0);
        this.updateElement(id, { zIndex: maxZ + 1 });
    },
    
    sendToBack(id) {
        const minZ = Math.min(...this.elements.map(e => e.zIndex), 0);
        this.updateElement(id, { zIndex: minZ - 1 });
    },
    
    bringForward(id) {
        const element = this.elements.find(el => el.id === id);
        if (element) {
            const higher = this.elements.filter(e => e.zIndex > element.zIndex).sort((a, b) => a.zIndex - b.zIndex)[0];
            if (higher) {
                const tempZ = higher.zIndex;
                this.updateElement(higher.id, { zIndex: element.zIndex });
                this.updateElement(id, { zIndex: tempZ });
            } else {
                this.bringToFront(id);
            }
        }
    },
    
    sendBackward(id) {
        const element = this.elements.find(el => el.id === id);
        if (element) {
            const lower = this.elements.filter(e => e.zIndex < element.zIndex).sort((a, b) => b.zIndex - a.zIndex)[0];
            if (lower) {
                const tempZ = lower.zIndex;
                this.updateElement(lower.id, { zIndex: element.zIndex });
                this.updateElement(id, { zIndex: tempZ });
            } else {
                this.sendToBack(id);
            }
        }
    },
    
    // Lock/Unlock
    toggleLock(id) {
        const element = this.elements.find(el => el.id === id);
        if (element) {
            this.updateElement(id, { locked: !element.locked });
        }
    },
    
    // Hide/Show
    toggleVisibility(id) {
        const element = this.elements.find(el => el.id === id);
        if (element) {
            this.updateElement(id, { hidden: !element.hidden });
        }
    },
    
    // Save to history
    saveHistory() {
        const state = JSON.stringify(this.elements);
        
        // Remove any future states if we're not at the end
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }
        
        this.history.push(state);
        
        // Limit history size
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        } else {
            this.historyIndex++;
        }
    },
    
    // Undo
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.elements = JSON.parse(this.history[this.historyIndex]);
            this.selectedElementId = null;
            Canvas.render();
            PropertiesPanel.update();
            Toast.show('Undo', 'info');
        }
    },
    
    // Redo
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.elements = JSON.parse(this.history[this.historyIndex]);
            this.selectedElementId = null;
            Canvas.render();
            PropertiesPanel.update();
            Toast.show('Redo', 'info');
        }
    },
    
    // Save to localStorage
    saveToStorage() {
        try {
            this.project.updatedAt = Date.now();
            this.saveCurrentPageElements();
            
            const data = {
                project: this.project,
                pages: this.pages,
                currentPageId: this.currentPageId,
                settings: this.settings
            };
            localStorage.setItem('viewyoursite_project', JSON.stringify(data));
        } catch (e) {
            console.warn('Storage full or unavailable:', e);
        }
    },
    
    // Load from localStorage
    loadFromStorage() {
        try {
            const data = localStorage.getItem('viewyoursite_project');
            if (data) {
                const parsed = JSON.parse(data);
                this.project = parsed.project || this.project;
                this.pages = parsed.pages || [];
                this.currentPageId = parsed.currentPageId || 'page-1';
                this.settings = parsed.settings || this.settings;
                
                const page = this.getCurrentPage();
                this.elements = page ? [...page.elements] : [];
                
                // Initialize history
                this.history = [JSON.stringify(this.elements)];
                this.historyIndex = 0;
            }
        } catch (e) {
            console.warn('Failed to load from storage:', e);
        }
    },
    
    // Clear all data
    clearStorage() {
        localStorage.removeItem('viewyoursite_project');
        this.pages = [];
        this.elements = [];
        this.history = [];
        this.historyIndex = -1;
        this.createDefaultPage();
    },
    
    // Export project as JSON
    exportProject() {
        this.saveCurrentPageElements();
        return {
            version: '1.2.0',
            exportedAt: new Date().toISOString(),
            project: this.project,
            pages: this.pages.map(p => ({
                ...p,
                elements: p.elements || []
            }))
        };
    },
    
    // Import project
    importProject(data) {
        if (data && data.pages) {
            this.project = data.project || this.project;
            this.pages = data.pages;
            this.currentPageId = data.pages[0]?.id || 'page-1';
            
            const page = this.getCurrentPage();
            this.elements = page ? [...page.elements] : [];
            
            this.history = [JSON.stringify(this.elements)];
            this.historyIndex = 0;
            
            this.saveToStorage();
            return true;
        }
        return false;
    }
};

// Make globally available
window.AppState = AppState;
