/**
 * ViewYourSite - Professional Website Builder
 * Editor Core (editor.js)
 * 
 * This file handles:
 * - Canvas rendering
 * - Element selection and deselection
 * - Component adding, duplicating, deleting
 * - Drag and drop functionality
 * - Text editing
 * - Element reordering
 */

// ============================================
// Editor Manager
// ============================================

const Editor = {
    canvas: null,
    initialized: false,
    
    /**
     * Initialize the editor
     */
    init() {
        this.canvas = document.getElementById('canvas');
        this.setupCanvasEvents();
        this.setupDragAndDrop();
        this.initialized = true;
        
        console.log('Editor initialized');
    },
    
    /**
     * Setup canvas event listeners
     */
    setupCanvasEvents() {
        // Click on canvas to deselect (handled in app.js too)
        this.canvas.addEventListener('click', (e) => {
            if (e.target === this.canvas || e.target.closest('.empty-canvas')) {
                this.deselectElement();
            }
        });
        
        // Handle contenteditable changes
        this.canvas.addEventListener('input', (e) => {
            if (e.target.contentEditable === 'true' && e.target.closest('.builder-element')) {
                const element = e.target.closest('.builder-element');
                if (element.componentData) {
                    // Update component data based on element type
                    this.updateComponentText(element.componentData, e.target);
                    
                    // Save to history after text changes
                    debouncedSaveHistory();
                }
            }
        });
        
        // Prevent default drag behavior on some elements
        this.canvas.addEventListener('dragstart', (e) => {
            const builderElement = e.target.closest('.builder-element');
            if (builderElement && !e.target.draggable) {
                // Allow dragging of builder elements
                e.dataTransfer.setData('text/plain', builderElement.dataset.componentId);
                e.dataTransfer.effectAllowed = 'move';
                builderElement.style.opacity = '0.5';
            }
        });
        
        this.canvas.addEventListener('dragend', (e) => {
            document.querySelectorAll('.builder-element').forEach(el => {
                el.style.opacity = '1';
            });
        });
    },
    
    /**
     * Setup drag and drop from component picker
     */
    setupDragAndDrop() {
        // Make component cards draggable
        document.querySelectorAll('.component-card').forEach(card => {
            card.setAttribute('draggable', 'true');
            
            card.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('componentType', card.dataset.componentType);
                e.dataTransfer.effectAllowed = 'copy';
            });
        });
        
        // Canvas drop zone
        this.canvas.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            
            // Show visual feedback
            this.canvas.classList.add('drag-over');
        });
        
        this.canvas.addEventListener('dragleave', (e) => {
            if (!this.canvas.contains(e.relatedTarget)) {
                this.canvas.classList.remove('drag-over');
            }
        });
        
        this.canvas.addEventListener('drop', (e) => {
            e.preventDefault();
            this.canvas.classList.remove('drag-over');
            
            const componentType = e.dataTransfer.getData('componentType');
            if (componentType) {
                this.addComponent(componentType);
            }
        });
        
        // Quick add items draggable
        document.querySelectorAll('.quick-add-item').forEach(item => {
            item.setAttribute('draggable', 'true');
            
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('componentType', item.dataset.component);
                e.dataTransfer.effectAllowed = 'copy';
            });
        });
    },
    
    /**
     * Render all components for a page
     */
    renderPageComponents(components) {
        // Clear canvas
        this.canvas.innerHTML = '';
        
        // Show empty state or components
        if (!components || components.length === 0) {
            this.showEmptyState();
        } else {
            this.hideEmptyState();
            
            components.forEach(compData => {
                try {
                    const element = ComponentRenderer.render(compData);
                    this.attachElementEvents(element);
                    this.canvas.appendChild(element);
                } catch (error) {
                    console.error('Error rendering component:', compData.type, error);
                }
            });
        }
    },
    
    /**
     * Show empty canvas state
     */
    showEmptyState() {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-canvas';
        emptyState.id = 'emptyCanvas';
        emptyState.innerHTML = `
            <div class="empty-canvas-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <line x1="9" y1="3" x2="9" y2="21"/>
                    <line x1="15" y1="3" x2="15" y2="21"/>
                    <line x1="3" y1="9" x2="21" y2="9"/>
                    <line x1="3" y1="15" x2="21" y2="15"/>
                </svg>
            </div>
            <h3>Start Building Your Page</h3>
            <p>Drag components here or click "Add Component" to begin</p>
            <div class="quick-add-grid">
                <button class="quick-add-item" data-component="heading">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 7V4h16v3M9 20h6M12 4v16"/>
                    </svg>
                    Heading
                </button>
                <button class="quick-add-item" data-component="paragraph">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/>
                    </svg>
                    Text
                </button>
                <button class="quick-add-item" data-component="image">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                    </svg>
                    Image
                </button>
                <button class="quick-add-item" data-component="button">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="8" width="18" height="8" rx="2"/>
                    </svg>
                    Button
                </button>
                <button class="quick-add-item" data-component="section">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                    </svg>
                    Section
                </button>
                <button class="quick-add-item" data-component="columns">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="18" rx="1"/>
                    </svg>
                    Columns
                </button>
            </div>
        `;
        
        this.canvas.appendChild(emptyState);
        
        // Re-attach quick add events
        emptyState.querySelectorAll('.quick-add-item').forEach(item => {
            item.addEventListener('click', () => {
                this.addComponent(item.dataset.component);
            });
        });
    },
    
    /**
     * Hide empty canvas state
     */
    hideEmptyState() {
        const emptyState = document.getElementById('emptyCanvas');
        if (emptyState) {
            emptyState.remove();
        }
    },
    
    /**
     * Add a new component to the canvas
     */
    addComponent(type, insertAfterId = null) {
        // Get default props for this component type
        const definition = ComponentDefinitions[type];
        if (!definition) {
            Toast.error(`Unknown component type: ${type}`);
            return null;
        }
        
        // Create new component data with unique ID
        const componentData = {
            ...deepClone(definition.defaultProps),
            id: generateId(),
            type: type,
            createdAt: new Date().toISOString()
        };
        
        // Render the component
        const element = ComponentRenderer.render(componentData);
        this.attachElementEvents(element);
        
        // Hide empty state if showing
        this.hideEmptyState();
        
        // Insert at position or append
        if (insertAfterId) {
            const afterElement = this.canvas.querySelector(`[data-component-id="${insertAfterId}"]`);
            if (afterElement) {
                afterElement.after(element);
            } else {
                this.canvas.appendChild(element);
            }
        } else {
            this.canvas.appendChild(element);
        }
        
        // Update page data
        this.addComponentToPageData(componentData, insertAfterId);
        
        // Select the new element
        this.selectElement(element);
        
        // Save history
        HistoryManager.push(PagesManager.getCurrentPageState());
        
        // Auto save
        AutoSave.save();
        
        Toast.success(`${definition.name} added`);
        
        return element;
    },
    
    /**
     * Add component data to current page's component list
     */
    addToParentComponent(parentData, childData, afterId = null) {
        if (!parentData.components) {
            parentData.components = [];
        }
        
        if (afterId) {
            const index = parentData.components.findIndex(c => c.id === afterId);
            if (index !== -1) {
                parentData.components.splice(index + 1, 0, childData);
            } else {
                parentData.components.push(childData);
            }
        } else {
            parentData.components.push(childData);
        }
    },
    
    /**
     * Add component to page data
     */
    addComponentToPageData(componentData, afterId = null) {
        const page = PagesManager.getCurrentPage();
        if (!page) return;
        
        if (!page.components) {
            page.components = [];
        }
        
        if (afterId) {
            const index = page.components.findIndex(c => c.id === afterId);
            if (index !== -1) {
                page.components.splice(index + 1, 0, componentData);
            } else {
                page.components.push(componentData);
            }
        } else {
            page.components.push(componentData);
        }
        
        page.updatedAt = new Date().toISOString();
    },
    
    /**
     * Select an element
     */
    selectElement(element) {
        // Deselect previous
        this.deselectElement();
        
        if (!element || !element.classList.contains('builder-element')) {
            return;
        }
        
        // Mark as selected
        element.classList.add('selected');
        AppState.selectedElement = element;
        AppState.selectedElementId = element.dataset.componentId;
        
        // Show element toolbar
        this.showElementToolbar(element);
        
        // Load properties panel
        PropertiesPanel.loadElementProperties(element.componentData);
        
        // Scroll into view if needed
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    },
    
    /**
     * Deselect current element
     */
    deselectElement() {
        // Remove selection from previous element
        if (AppState.selectedElement) {
            AppState.selectedElement.classList.remove('selected');
            
            // Remove resize handles
            const handles = AppState.selectedElement.querySelectorAll('.resize-handle');
            handles.forEach(h => h.remove());
        }
        
        AppState.selectedElement = null;
        AppState.selectedElementId = null;
        
        // Hide element toolbar
        this.hideElementToolbar();
        
        // Reset properties panel to show page settings
        PropertiesPanel.resetToPageSettings();
    },
    
    /**
     * Show floating toolbar above selected element
     */
    showElementToolbar(element) {
        const toolbar = document.getElementById('elementToolbar');
        const label = document.getElementById('elementTypeLabel');
        
        // Set type label
        const typeName = element.componentData?.type || 'Element';
        label.textContent = typeName.charAt(0).toUpperCase() + typeName.slice(1);
        
        // Position toolbar above element
        const rect = element.getBoundingClientRect();
        const canvasRect = this.canvas.parentElement.getBoundingClientRect();
        
        let top = rect.top - canvasRect.top - toolbar.offsetHeight - 10;
        let left = rect.left - canvasRect.left + (rect.width / 2) - (toolbar.offsetWidth / 2);
        
        // Keep within bounds
        top = Math.max(0, top);
        left = Math.max(10, Math.min(left, canvasRect.width - toolbar.offsetWidth - 10));
        
        toolbar.style.top = `${top}px`;
        toolbar.style.left = `${left}px`;
        toolbar.style.display = 'flex';
    },
    
    /**
     * Hide element toolbar
     */
    hideElementToolbar() {
        document.getElementById('elementToolbar').style.display = 'none';
    },
    
    /**
     * Delete an element
     */
    deleteElement(element) {
        if (!element) return;
        
        const id = element.dataset.componentId;
        const type = element.componentData?.type || 'element';
        
        // Remove from DOM with animation
        element.style.transition = 'all 0.2s ease';
        element.style.opacity = '0';
        element.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            element.remove();
            
            // Remove from page data
            this.removeComponentFromPage(id);
            
            // Check if canvas is now empty
            const remainingElements = this.canvas.querySelectorAll('.builder-element');
            if (remainingElements.length === 0) {
                this.showEmptyState();
            }
            
            // Clear selection
            this.deselectElement();
            
            // Save history
            HistoryManager.push(PagesManager.getCurrentPageState());
            
            AutoSave.save();
            
            Toast.success(`${type} deleted`);
        }, 200);
    },
    
    /**
     * Duplicate an element
     */
    duplicateElement(element) {
        if (!element || !element.componentData) return;
        
        // Clone the component data
        const newData = deepClone(element.componentData);
        newData.id = generateId(); // New ID
        newData.createdAt = new Date().toISOString();
        
        // Render new element
        const newElement = ComponentRenderer.render(newData);
        this.attachElementEvents(newElement);
        
        // Insert after original
        element.after(newElement);
        
        // Add to page data
        this.addComponentToPageData(newData, element.dataset.componentId);
        
        // Select new element
        this.selectElement(newElement);
        
        // Save history
        HistoryManager.push(PagesManager.getCurrentPageState());
        
        AutoSave.save();
        
        Toast.success('Element duplicated');
    },
    
    /**
     * Move element up in order
     */
    moveElementUp(element) {
        if (!element || !element.previousElementSibling) return false;
        
        element.previousElementSibling.before(element);
        
        // Update page data order
        this.updateComponentsOrderFromDOM();
        
        HistoryManager.push(PagesManager.getCurrentPageState());
        AutoSave.save();
        
        return true;
    },
    
    /**
     * Move element down in order
     */
    moveElementDown(element) {
        if (!element || !element.nextElementSibling) return false;
        
        element.nextElementSibling.after(element);
        
        // Update page data order
        this.updateComponentsOrderFromDOM();
        
        HistoryManager.push(PagesManager.getCurrentPageState());
        AutoSave.save();
        
        return true;
    },
    
    /**
     * Remove component from page data by ID
     */
    removeComponentFromPage(id) {
        const page = PagesManager.getCurrentPage();
        if (!page || !page.components) return;
        
        const index = page.components.findIndex(c => c.id === id);
        if (index !== -1) {
            page.components.splice(index, 1);
            page.updatedAt = new Date().toISOString();
        }
    },
    
    /**
     * Update components order to match DOM
     */
    updateComponentsOrderFromDOM() {
        const page = PagesManager.getCurrentPage();
        if (!page) return;
        
        const newOrder = [];
        this.canvas.querySelectorAll('.builder-element').forEach(el => {
            if (el.componentData) {
                newOrder.push(el.componentData);
            }
        });
        
        page.components = newOrder;
        page.updatedAt = new Date().toISOString();
    },
    
    /**
     * Attach event handlers to a builder element
     */
    attachElementEvents(element) {
        // Click to select
        element.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectElement(element);
        });
        
        // Double click to edit text (for text elements)
        element.addEventListener('dblclick', (e) => {
            const editableEl = element.querySelector('[contenteditable], h1, h2, h3, h4, h5, h6, p, blockquote');
            if (editableEl) {
                editableEl.focus();
                
                // Select all text
                const range = document.createRange();
                range.selectNodeContents(editableEl);
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);
            }
        });
        
        // Keyboard events when editing
        element.addEventListener('keydown', (e) => {
            if (e.target.contentEditable === 'true') {
                // Escape to stop editing
                if (e.key === 'Escape') {
                    e.target.blur();
                    this.selectElement(element);
                }
                
                // Prevent certain keys from propagating
                if ((e.key === 'Delete' || e.key === 'Backspace') && e.target.textContent === '') {
                    e.preventDefault();
                }
            }
        });
    },
    
    /**
     * Update component text data based on edited element
     */
    updateComponentText(componentData, targetElement) {
        switch (componentData.type) {
            case 'heading':
            case 'paragraph':
                componentData.text = targetElement.textContent;
                break;
            case 'quote':
                if (targetElement.tagName === 'P') {
                    componentData.text = targetElement.textContent;
                } else if (targetElement.tagName === 'CITE') {
                    componentData.attribution = targetElement.textContent.replace(/^—\s*/, '');
                }
                break;
            case 'button':
                componentData.text = targetElement.textContent;
                break;
        }
    },
    
    /**
     * Get currently selected element data
     */
    getSelectedElementData() {
        if (!AppState.selectedElement) return null;
        return AppState.selectedElement.componentData;
    },
    
    /**
     * Update selected element's data and re-render
     */
    updateSelectedElement(updates) {
        if (!AppState.selectedElement || !AppState.selectedElement.componentData) return;
        
        // Merge updates into component data
        Object.assign(AppState.selectedElement.componentData, updates);
        
        // Re-render the element
        const newData = AppState.selectedElement.componentData;
        const newElement = ComponentRenderer.render(newData);
        this.attachElementEvents(newElement);
        
        // Replace old element
        AppState.selectedElement.replaceWith(newElement);
        
        // Maintain selection
        this.selectElement(newElement);
        
        // Update page data
        this.updateComponentInPageData(newData);
        
        // Auto save
        AutoSave.save();
    },
    
    /**
     * Update component data in page store
     */
    updateComponentInPageData(updatedData) {
        const page = PagesManager.getCurrentPage();
        if (!page || !page.components) return;
        
        const index = page.components.findIndex(c => c.id === updatedData.id);
        if (index !== -1) {
            page.components[index] = updatedData;
            page.updatedAt = new Date().toISOString();
        }
    },
    
    /**
     * Get all component IDs in order
     */
    getComponentOrder() {
        const ids = [];
        this.canvas.querySelectorAll('.builder-element').forEach(el => {
            if (el.dataset.componentId) {
                ids.push(el.dataset.componentId);
            }
        });
        return ids;
    }
};

// ============================================
// Debounced Functions
// ============================================

const debouncedSaveHistory = debounce(() => {
    HistoryManager.push(PagesManager.getCurrentPageState());
}, 1000);

// Expose globally
window.Editor = Editor;
