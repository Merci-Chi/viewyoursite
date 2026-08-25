/**
 * ViewYourSite - Professional Website Builder
 * Properties Panel (properties.js)
 * 
 * This file handles:
 * - Loading element properties into panel
 * - Loading page settings
 * - Handling property changes
 * - Style tab controls
 * - Advanced tab controls
 */

// ============================================
// Properties Panel Manager
// ============================================

const PropertiesPanel = {
    initialized: false,
    currentElementData: null,
    
    /**
     * Initialize the properties panel
     */
    init() {
        this.setupStyleControls();
        this.setupAdvancedControls();
        this.initialized = true;
        
        console.log('Properties Panel initialized');
    },
    
    /**
     * Load element properties when an element is selected
     */
    loadElementProperties(componentData) {
        if (!componentData) {
            this.resetToPageSettings();
            return;
        }
        
        this.currentElementData = componentData;
        
        // Show element properties, hide page settings
        document.getElementById('noSelectionState').style.display = 'none';
        document.getElementById('pageSettingsPanel').style.display = 'none';
        document.getElementById('elementPropertiesPanel').style.display = 'block';
        
        // Render content tab based on component type
        this.renderContentTab(componentData);
        
        // Load style values
        this.loadStyleValues(componentData);
        
        // Load advanced values
        this.loadAdvancedValues(componentData);
    },
    
    /**
     * Reset to show page settings (when no element selected)
     */
    resetToPageSettings() {
        this.currentElementData = null;
        
        document.getElementById('noSelectionState').style.display = '';
        document.getElementById('pageSettingsPanel').style.display = '';
        document.getElementById('elementPropertiesPanel').style.display = 'none';
        
        // Load current page settings
        const currentPage = PagesManager.getCurrentPage();
        if (currentPage) {
            this.loadPageSettings(currentPage);
        }
    },
    
    /**
     * Load page settings into the panel
     */
    loadPageSettings(page) {
        if (!page) return;
        
        // Background settings
        const bg = page.background || {};
        document.getElementById('pageBgType').value = bg.type || 'none';
        document.getElementById('pageBgColor').value = bg.color || '#ffffff';
        document.getElementById('pageBgColorText').value = bg.color || '#ffffff';
        document.getElementById('pageGradientType').value = bg.gradientType || 'linear';
        document.getElementById('pageGradColor1').value = bg.color1 || '#6366f1';
        document.getElementById('pageGradColor2').value = bg.color2 || '#8b5cf6';
        
        // Show/hide appropriate groups
        this.togglePageBackgroundGroups(bg.type || 'none');
        
        // Page display options
        document.getElementById('showHeaderToggle').checked = page.showHeader !== false;
        document.getElementById('showFooterToggle').checked = page.showFooter !== false;
    },
    
    /**
     * Toggle page background input groups
     */
    togglePageBackgroundGroups(type) {
        document.getElementById('bgColorGroup').style.display = type === 'color' ? '' : 'none';
        document.getElementById('bgGradientGroup').style.display = type === 'gradient' ? '' : 'none';
        document.getElementById('bgGradientColorsGroup').style.display = type === 'gradient' ? '' : 'none';
        document.getElementById('bgImageGroup').style.display = type === 'image' ? '' : 'none';
    },
    
    /**
     * Apply page background changes
     */
    applyPageBackground(type) {
        const page = PagesManager.getCurrentPage();
        if (!page) return;
        
        page.background = {
            type: type,
            color: document.getElementById('pageBgColor').value,
            gradientType: document.getElementById('pageGradientType').value,
            color1: document.getElementById('pageGradColor1').value,
            color2: document.getElementById('pageGradColor2').value,
            image: ''
        };
        
        PagesStore.update(page.id, { background: page.background });
        
        // Apply visual update to canvas
        this.applyCanvasBackground(page.background);
        
        AutoSave.save();
    },
    
    /**
     * Apply background to canvas visually
     */
    applyCanvasBackground(background) {
        const canvas = document.getElementById('canvas');
        
        switch (background.type) {
            case 'color':
                canvas.style.backgroundColor = background.color;
                canvas.style.backgroundImage = '';
                break;
            case 'gradient':
                if (background.gradientType === 'radial') {
                    canvas.style.background = `radial-gradient(circle, ${background.color1}, ${background.color2})`;
                } else {
                    canvas.style.background = `linear-gradient(135deg, ${background.color1}, ${background.color2})`;
                }
                break;
            default:
                canvas.style.backgroundColor = '';
                canvas.style.backgroundImage = '';
        }
    },
    
    /**
     * Render content tab based on component type
     */
    renderContentTab(data) {
        const container = document.getElementById('elementPropertiesPanel');
        
        let html = '';
        
        switch (data.type) {
            case 'heading':
                html = this.renderHeadingProps(data);
                break;
            case 'paragraph':
                html = this.renderParagraphProps(data);
                break;
            case 'quote':
                html = this.renderQuoteProps(data);
                break;
            case 'code':
                html = this.renderCodeProps(data);
                break;
            case 'image':
                html = this.renderImageProps(data);
                break;
            case 'video':
                html = this.renderVideoProps(data);
                break;
            case 'button':
                html = this.renderButtonProps(data);
                break;
            case 'form':
                html = this.renderFormProps(data);
                break;
            case 'divider':
                html = this.renderDividerProps(data);
                break;
            case 'spacer':
                html = this.renderSpacerProps(data);
                break;
            case 'shape':
                html = this.renderShapeProps(data);
                break;
            case 'embed':
                html = this.renderEmbedProps(data);
                break;
            case 'html':
                html = this.renderCustomHTMLProps(data);
                break;
            case 'section':
                html = this.renderSectionProps(data);
                break;
            case 'columns':
                html = this.renderColumnsProps(data);
                break;
            default:
                html = this.renderGenericProps(data);
        }
        
        container.innerHTML = html;
        
        // Attach event listeners
        this.attachContentTabEvents(data);
    },
    
    // ==========================================
    // Component-Specific Property Renderers
    // ==========================================
    
    renderHeadingProps(data) {
        return `
            <div class="settings-section">
                <h4>Heading Content</h4>
                <div class="form-group">
                    <label>Text</label>
                    <input type="text" id="propText" class="form-input" value="${this.escapeAttr(data.text)}">
                </div>
                <div class="form-group">
                    <label>Level</label>
                    <select id="propLevel" class="form-select">
                        <option value="h1" ${data.level === 'h1' ? 'selected' : ''}>H1 - Heading 1</option>
                        <option value="h2" ${data.level === 'h2' ? 'selected' : ''}>H2 - Heading 2</option>
                        <option value="h3" ${data.level === 'h3' ? 'selected' : ''}>H3 - Heading 3</option>
                        <option value="h4" ${data.level === 'h4' ? 'selected' : ''}>H4 - Heading 4</option>
                        <option value="h5" ${data.level === 'h5' ? 'selected' : ''}>H5 - Heading 5</option>
                        <option value="h6" ${data.level === 'h6' ? 'selected' : ''}>H6 - Heading 6</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Link URL</label>
                    <input type="text" id="propLink" class="form-input" value="${data.link || ''}" placeholder="https://...">
                </div>
            </div>
        `;
    },
    
    renderParagraphProps(data) {
        return `
            <div class="settings-section">
                <h4>Text Content</h4>
                <div class="form-group">
                    <label>Text</label>
                    <textarea id="propText" class="form-textarea" rows="4">${this.escapeAttr(data.text)}</textarea>
                </div>
                <div class="form-group">
                    <label>Text Transform</label>
                    <select id="propTextTransform" class="form-select">
                        <option value="none" ${data.style?.textTransform === 'none' || !data.style?.textTransform ? 'selected' : ''}>None</option>
                        <option value="uppercase" ${data.style?.textTransform === 'uppercase' ? 'selected' : ''}>Uppercase</option>
                        <option value="lowercase" ${data.style?.textTransform === 'lowercase' ? 'selected' : ''}>Lowercase</option>
                        <option value="capitalize" ${data.style?.textTransform === 'capitalize' ? 'selected' : ''}>Capitalize</option>
                    </select>
                </div>
            </div>
        `;
    },
    
    renderQuoteProps(data) {
        return `
            <div class="settings-section">
                <h4>Quote Content</h4>
                <div class="form-group">
                    <label>Quote Text</label>
                    <textarea id="propText" class="form-textarea" rows="3">${this.escapeAttr(data.text)}</textarea>
                </div>
                <div class="form-group">
                    <label>Attribution</label>
                    <input type="text" id="propAttribution" class="form-input" value="${this.escapeAttr(data.attribution || '')}" placeholder="Author name">
                </div>
            </div>
        `;
    },
    
    renderCodeProps(data) {
        return `
            <div class="settings-section">
                <h4>Code Content</h4>
                <div class="form-group">
                    <label>Code</label>
                    <textarea id="propCode" class="form-textarea code-editor" rows="6">${this.escapeAttr(data.code)}</textarea>
                </div>
                <div class="form-group">
                    <label>Language</label>
                    <select id="propLanguage" class="form-select">
                        <option value="javascript" ${data.language === 'javascript' ? 'selected' : ''}>JavaScript</option>
                        <option value="html" ${data.language === 'html' ? 'selected' : ''}>HTML</option>
                        <option value="css" ${data.language === 'css' ? 'selected' : ''}>CSS</option>
                        <option value="python" ${data.language === 'python' ? 'selected' : ''}>Python</option>
                        <option value="php" ${data.language === 'php' ? 'selected' : ''}>PHP</option>
                        <option value="sql" ${data.language === 'sql' ? 'selected' : ''}>SQL</option>
                    </select>
                </div>
            </div>
        `;
    },
    
    renderImageProps(data) {
        return `
            <div class="settings-section">
                <h4>Image Source</h4>
                <div class="form-group">
                    <label>Image URL</label>
                    <input type="text" id="propSrc" class="form-input" value="${data.src || ''}" placeholder="Enter image URL or select from library">
                </div>
                <button class="btn btn-secondary btn-sm" id="selectFromLibraryBtn">Select from Library</button>
            </div>
            <div class="settings-section">
                <h4>Image Settings</h4>
                <div class="form-group">
                    <label>Alt Text</label>
                    <input type="text" id="propAlt" class="form-input" value="${data.alt || ''}" placeholder="Image description">
                </div>
                <div class="form-group">
                    <label>Size Mode</label>
                    <select id="propSizeMode" class="form-select">
                        <option value="cover" ${data.sizeMode === 'cover' ? 'selected' : ''}>Cover</option>
                        <option value="contain" ${data.sizeMode === 'contain' ? 'selected' : ''}>Contain</option>
                        <option value="actual" ${data.sizeMode === 'actual' ? 'selected' : ''}>Actual Size</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Border Radius</label>
                    <input type="number" id="propRadius" class="form-input" value="${data.borderRadius || 0}" min="0" max="100">
                </div>
                <div class="form-group">
                    <label>Max Width</label>
                    <input type="text" id="propMaxWidth" class="form-input" value="${data.maxWidth || '100%'}" placeholder="e.g., 100%, 500px">
                </div>
            </div>
            <div class="settings-section">
                <h4>Link</h4>
                <div class="form-group">
                    <label>Link URL</label>
                    <input type="text" id="propLink" class="form-input" value="${data.link || ''}" placeholder="https://...">
                </div>
            </div>
        `;
    },
    
    renderVideoProps(data) {
        return `
            <div class="settings-section">
                <h4>Video Source</h4>
                <div class="form-group">
                    <label>Video URL (YouTube/Vimeo)</label>
                    <input type="url" id="propUrl" class="form-input" value="${data.url || ''}" placeholder="https://www.youtube.com/watch?v=...">
                </div>
            </div>
            <div class="settings-section">
                <h4>Video Options</h4>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="propAutoplay" ${data.autoplay ? 'checked' : ''}>
                        Autoplay
                    </label>
                </div>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="propLoop" ${data.loop ? 'checked' : ''}>
                        Loop
                    </label>
                </div>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="propMuted" ${data.muted ? 'checked' : ''}>
                        Muted
                    </label>
                </div>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="propShowControls" ${data.showControls !== false ? 'checked' : ''}>
                        Show Controls
                    </label>
                </div>
            </div>
        `;
    },
    
    renderButtonProps(data) {
        return `
            <div class="settings-section">
                <h4>Button Content</h4>
                <div class="form-group">
                    <label>Button Text</label>
                    <input type="text" id="propText" class="form-input" value="${this.escapeAttr(data.text)}">
                </div>
                <div class="form-group">
                    <label>Link URL</label>
                    <input type="text" id="propLink" class="form-input" value="${data.link || '#'}">
                </div>
            </div>
            <div class="settings-section">
                <h4>Button Style</h4>
                <div class="form-group">
                    <label>Style</label>
                    <select id="propStyle" class="form-select">
                        <option value="filled" ${data.style === 'filled' ? 'selected' : ''}>Filled</option>
                        <option value="outline" ${data.style === 'outline' ? 'selected' : ''}>Outline</option>
                        <option value="ghost" ${data.style === 'ghost' ? 'selected' : ''}>Ghost</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Size</label>
                    <select id="propSize" class="form-select">
                        <option value="small" ${data.size === 'small' ? 'selected' : ''}>Small</option>
                        <option value="medium" ${data.size === 'medium' || !data.size ? 'selected' : ''}>Medium</option>
                        <option value="large" ${data.size === 'large' ? 'selected' : ''}>Large</option>
                    </select>
                </div>
                <div class="form-row">
                    <div class="form-group flex-1">
                        <label>Background Color</label>
                        <div class="color-input-wrapper">
                            <input type="color" id="propBgColor" value="${data.colors?.background || '#6366f1'}" class="form-color">
                        </div>
                    </div>
                    <div class="form-group flex-1">
                        <label>Text Color</label>
                        <div class="color-input-wrapper">
                            <input type="color" id="propTextColor" value="${data.colors?.text || '#ffffff'}" class="form-color">
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label>Border Radius</label>
                    <input type="number" id="propRadius" class="form-input" value="${data.borderRadius || 6}" min="0" max="50">
                </div>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="propFullWidth" ${data.fullWidth ? 'checked' : ''}>
                        Full Width
                    </label>
                </div>
            </div>
        `;
    },
    
    renderFormProps(data) {
        return `
            <div class="settings-section">
                <h4>Form Fields</h4>
                <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: var(--spacing-md);">
                    Click on a field in the editor to edit it. Fields can be reordered by dragging.
                </p>
                <div id="formFieldsList">
                    ${(data.fields || []).map((field, i) => `
                        <div class="form-field-item" data-field-id="${field.id}">
                            <span>${field.label} (${field.type})</span>
                            <button class="icon-btn small remove-field-btn" data-index="${i}">Remove</button>
                        </div>
                    `).join('')}
                </div>
                <button class="btn btn-secondary btn-sm" id="addFieldBtn">Add Field</button>
            </div>
            <div class="settings-section">
                <h4>Submit Options</h4>
                <div class="form-group">
                    <label>Submit Button Text</label>
                    <input type="text" id="propSubmitText" class="form-input" value="${data.submitText || 'Submit'}">
                </div>
                <div class="form-group">
                    <label>Action</label>
                    <select id="propSubmitAction" class="form-select">
                        <option value="alert" ${data.submitAction === 'alert' ? 'selected' : ''}>Show Alert</option>
                        <option value="email" ${data.submitAction === 'email' ? 'selected' : ''}>Send Email</option>
                        <option value="url" ${data.submitAction === 'url' ? 'selected' : ''}>Post to URL</option>
                    </select>
                </div>
            </div>
        `;
    },
    
    renderDividerProps(data) {
        return `
            <div class="settings-section">
                <h4>Divider Style</h4>
                <div class="form-group">
                    <label>Style</label>
                    <select id="propStyle" class="form-select">
                        <option value="solid" ${data.style === 'solid' ? 'selected' : ''}>Solid</option>
                        <option value="dashed" ${data.style === 'dashed' ? 'selected' : ''}>Dashed</option>
                        <option value="dotted" ${data.style === 'dotted' ? 'selected' : ''}>Dotted</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Color</label>
                    <div class="color-input-wrapper">
                        <input type="color" id="propColor" value="${data.color || '#e2e8f0'}" class="form-color">
                        <input type="text" id="propColorText" value="${data.color || '#e2e8f0'}" class="form-input small">
                    </div>
                </div>
                <div class="form-group">
                    <label>Thickness (px)</label>
                    <input type="number" id="propThickness" class="form-input" value="${data.thickness || 1}" min="1" max="10">
                </div>
                <div class="form-group">
                    <label>Width</label>
                    <select id="propWidth" class="form-select">
                        <option value="100%" ${data.width === '100%' || !data.width ? 'selected' : ''}>Full Width</option>
                        <option value="75%" ${data.width === '75%' ? 'selected' : ''}>75%</option>
                        <option value="50%" ${data.width === '50%' ? 'selected' : ''}>50%</option>
                        <option value="25%" ${data.width === '25%' ? 'selected' : ''}>25%</option>
                    </select>
                </div>
            </div>
        `;
    },
    
    renderSpacerProps(data) {
        return `
            <div class="settings-section">
                <h4>Spacer Settings</h4>
                <div class="form-group">
                    <label>Height (px)</label>
                    <input type="number" id="propHeight" class="form-input" value="${data.height || 40}" min="0" max="500">
                </div>
            </div>
        `;
    },
    
    renderShapeProps(data) {
        return `
            <div class="settings-section">
                <h4>Shape Settings</h4>
                <div class="form-group">
                    <label>Shape Type</label>
                    <select id="propShape" class="form-select">
                        <option value="rectangle" ${data.shape === 'rectangle' || !data.shape ? 'selected' : ''}>Rectangle</option>
                        <option value="circle" ${data.shape === 'circle' ? 'selected' : ''}>Circle</option>
                    </select>
                </div>
                <div class="form-row">
                    <div class="form-group flex-1">
                        <label>Width</label>
                        <input type="text" id="propWidth" class="form-input" value="${data.width || '100px'}">
                    </div>
                    <div class="form-group flex-1">
                        <label>Height</label>
                        <input type="text" id="propHeight" class="form-input" value="${data.height || '100px'}">
                    </div>
                </div>
                <div class="form-group">
                    <label>Fill Color</label>
                    <div class="color-input-wrapper">
                        <input type="color" id="propFill" value="${data.fill || '#6366f1'}" class="form-color">
                    </div>
                </div>
                <div class="form-group">
                    <label>Border Radius</label>
                    <input type="number" id="propRadius" class="form-input" value="${data.borderRadius || 8}" min="0" max="1000">
                </div>
            </div>
        `;
    },
    
    renderEmbedProps(data) {
        return `
            <div class="settings-section">
                <h4>Embed Settings</h4>
                <div class="form-group">
                    <label>Embed URL</label>
                    <input type="url" id="propUrl" class="form-input" value="${data.url || ''}" placeholder="https://...">
                </div>
                <div class="form-row">
                    <div class="form-group flex-1">
                        <label>Width</label>
                        <input type="text" id="propWidth" class="form-input" value="${data.width || '100%'}">
                    </div>
                    <div class="form-group flex-1">
                        <label>Height</label>
                        <input type="text" id="propHeight" class="form-input" value="${data.height || '400px'}">
                    </div>
                </div>
            </div>
        `;
    },
    
    renderCustomHTMLProps(data) {
        return `
            <div class="settings-section">
                <h4>HTML Code</h4>
                <div class="form-group">
                    <textarea id="propHtml" class="form-textarea code-editor" rows="10">${this.escapeAttr(data.html || '')}</textarea>
                </div>
            </div>
        `;
    },
    
    renderSectionProps(data) {
        return `
            <div class="settings-section">
                <h4>Section Background</h4>
                <div class="form-group">
                    <label>Type</label>
                    <select id="propBgType" class="form-select">
                        <option value="color" ${data.background?.type === 'color' ? 'selected' : ''}>Color</option>
                        <option value="gradient" ${data.background?.type === 'gradient' ? 'selected' : ''}>Gradient</option>
                        <option value="image" ${data.background?.type === 'image' ? 'selected' : ''}>Image</option>
                    </select>
                </div>
                <div class="form-group" id="sectionBgColorGroup">
                    <label>Color</label>
                    <div class="color-input-wrapper">
                        <input type="color" id="propBgColor" value="${data.background?.color || '#f8fafc'}" class="form-color">
                    </div>
                </div>
                <div class="form-group" id="sectionBgGradientGroup" style="display: none;">
                    <label>Gradient Colors</label>
                    <div class="color-pair">
                        <input type="color" id="propGradColor1" value="${data.background?.color1 || '#6366f1'}" class="form-color">
                        <input type="color" id="propGradColor2" value="${data.background?.color2 || '#8b5cf6'}" class="form-color">
                    </div>
                </div>
            </div>
            <div class="settings-section">
                <h4>Section Size</h4>
                <div class="form-group">
                    <label>Min Height</label>
                    <input type="text" id="propMinHeight" class="form-input" value="${data.minHeight || '200px'}" placeholder="e.g., 200px, 50vh">
                </div>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="propFullWidth" ${data.fullWidth !== false ? 'checked' : ''}>
                        Full Width
                    </label>
                </div>
            </div>
        `;
    },
    
    renderColumnsProps(data) {
        return `
            <div class="settings-section">
                <h4>Column Layout</h4>
                <div class="form-group">
                    <label>Number of Columns</label>
                    <select id="propColumns" class="form-select">
                        <option value="2" ${data.columns === 2 ? 'selected' : ''}>2 Columns</option>
                        <option value="3" ${data.columns === 3 ? 'selected' : ''}>3 Columns</option>
                        <option value="4" ${data.columns === 4 ? 'selected' : ''}>4 Columns</option>
                        <option value="5" ${data.columns === 5 ? 'selected' : ''}>5 Columns</option>
                        <option value="6" ${data.columns === 6 ? 'selected' : ''}>6 Columns</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Gap (px)</label>
                    <input type="number" id="propGap" class="form-input" value="${data.gap || 24}" min="0" max="100">
                </div>
            </div>
        `;
    },
    
    renderGenericProps(data) {
        return `
            <div class="settings-section">
                <h4>Component Settings</h4>
                <p style="color: var(--text-muted);">No specific settings available for this component type.</p>
                <p style="color: var(--text-muted); font-size: 0.8rem;">Use the Style and Advanced tabs to customize appearance.</p>
            </div>
        `;
    },
    
    /**
     * Escape HTML attribute values
     */
    escapeAttr(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    },
    
    /**
     * Attach event listeners to content tab inputs
     */
    attachContentTabEvents(data) {
        const container = document.getElementById('elementPropertiesPanel');
        
        // Generic text/property change handler
        const handleInputChange = (id, propPath) => {
            const el = document.getElementById(id);
            if (!el) return;
            
            el.addEventListener('change', () => {
                this.updateElementProperty(propPath, el.value);
            });
            
            // Also update on input for real-time updates
            el.addEventListener('input', debounce(() => {
                this.updateElementProperty(propPath, el.value);
            }, 300));
        };
        
        // Handle different input types based on component
        switch (data.type) {
            case 'heading':
                handleInputChange('propText', 'text');
                handleInputChange('propLevel', 'level');
                handleInputChange('propLink', 'link');
                break;
                
            case 'paragraph':
                handleInputChange('propText', 'text');
                handleInputChange('propTextTransform', 'style.textTransform');
                break;
                
            case 'quote':
                handleInputChange('propText', 'text');
                handleInputChange('propAttribution', 'attribution');
                break;
                
            case 'code':
                handleInputChange('propCode', 'code');
                handleInputChange('propLanguage', 'language');
                break;
                
            case 'image':
                handleInputChange('propSrc', 'src');
                handleInputChange('propAlt', 'alt');
                handleInputChange('propSizeMode', 'sizeMode');
                handleInputChange('propRadius', 'borderRadius');
                handleInputChange('propMaxWidth', 'maxWidth');
                handleInputChange('propLink', 'link');
                
                // Select from library button
                const libBtn = document.getElementById('selectFromLibraryBtn');
                if (libBtn) {
                    libBtn.addEventListener('click', () => {
                        MediaLibrary.openForSelection((mediaItem) => {
                            this.updateElementProperty('src', mediaItem.url);
                            document.getElementById('propSrc').value = mediaItem.url;
                        });
                    });
                }
                break;
                
            case 'video':
                handleInputChange('propUrl', 'url');
                
                document.getElementById('propAutoplay')?.addEventListener('change', (e) => {
                    this.updateElementProperty('autoplay', e.target.checked);
                });
                document.getElementById('propLoop')?.addEventListener('change', (e) => {
                    this.updateElementProperty('loop', e.target.checked);
                });
                document.getElementById('propMuted')?.addEventListener('change', (e) => {
                    this.updateElementProperty('muted', e.target.checked);
                });
                document.getElementById('propShowControls')?.addEventListener('change', (e) => {
                    this.updateElementProperty('showControls', e.target.checked);
                });
                break;
                
            case 'button':
                handleInputChange('propText', 'text');
                handleInputChange('propLink', 'link');
                handleInputChange('propStyle', 'style');
                handleInputChange('propSize', 'size');
                handleInputChange('propRadius', 'borderRadius');
                
                document.getElementById('propFullWidth')?.addEventListener('change', (e) => {
                    this.updateElementProperty('fullWidth', e.target.checked);
                });
                
                document.getElementById('propBgColor')?.addEventListener('input', (e) => {
                    this.updateNestedProperty('colors.background', e.target.value);
                });
                document.getElementById('propTextColor')?.addEventListener('input', (e) => {
                    this.updateNestedProperty('colors.text', e.target.value);
                });
                break;
                
            case 'divider':
                handleInputChange('propStyle', 'style');
                handleInputChange('propColor', 'color');
                handleInputChange('propThickness', 'thickness');
                handleInputChange('propWidth', 'width');
                break;
                
            case 'spacer':
                handleInputChange('propHeight', 'height');
                break;
                
            case 'shape':
                handleInputChange('propShape', 'shape');
                handleInputChange('propWidth', 'width');
                handleInputChange('propHeight', 'height');
                handleInputChange('propFill', 'fill');
                handleInputChange('propRadius', 'borderRadius');
                break;
                
            case 'embed':
                handleInputChange('propUrl', 'url');
                handleInputChange('propWidth', 'width');
                handleInputChange('propHeight', 'height');
                break;
                
            case 'html':
                handleInputChange('propHtml', 'html');
                break;
                
            case 'section':
                document.getElementById('propBgType')?.addEventListener('change', (e) => {
                    const type = e.target.value;
                    document.getElementById('sectionBgColorGroup').style.display = type === 'color' ? '' : 'none';
                    document.getElementById('sectionBgGradientGroup').style.display = type === 'gradient' ? '' : 'none';
                    this.updateNestedProperty('background.type', type);
                });
                
                document.getElementById('propBgColor')?.addEventListener('input', (e) => {
                    this.updateNestedProperty('background.color', e.target.value);
                });
                
                document.getElementById('propGradColor1')?.addEventListener('input', (e) => {
                    this.updateNestedProperty('background.color1', e.target.value);
                });
                
                document.getElementById('propGradColor2')?.addEventListener('input', (e) => {
                    this.updateNestedProperty('background.color2', e.target.value);
                });
                
                handleInputChange('propMinHeight', 'minHeight');
                
                document.getElementById('propFullWidth')?.addEventListener('change', (e) => {
                    this.updateElementProperty('fullWidth', e.target.checked);
                });
                break;
                
            case 'columns':
                document.getElementById('propColumns')?.addEventListener('change', (e) => {
                    this.updateElementProperty('columns', parseInt(e.target.value));
                });
                handleInputChange('propGap', 'gap');
                break;
        }
    },
    
    /**
     * Update a property on the selected element
     */
    updateElementProperty(propPath, value) {
        if (!this.currentElementData) return;
        
        // Support nested paths like "style.fontSize"
        const paths = propPath.split('.');
        let obj = this.currentElementData;
        
        for (let i = 0; i < paths.length - 1; i++) {
            if (!obj[paths[i]]) obj[paths[i]] = {};
            obj = obj[paths[i]];
        }
        
        obj[paths[paths.length - 1]] = value;
        
        // Re-render and update
        Editor.updateSelectedElement(this.currentElementData);
    },
    
    /**
     * Update nested property
     */
    updateNestedProperty(propPath, value) {
        this.updateElementProperty(propPath, value);
    },
    
    // ==========================================
    // Style Tab Controls
    // ==========================================
    
    setupStyleControls() {
        // Typography
        document.getElementById('styleFontFamily')?.addEventListener('change', (e) => {
            this.applyStyleUpdate('style.fontFamily', e.target.value);
        });
        
        document.getElementById('styleFontSize')?.addEventListener('input', debounce((e) => {
            this.applyStyleUpdate('style.fontSize', e.target.value);
        }, 200));
        
        document.getElementById('styleFontWeight')?.addEventListener('change', (e) => {
            this.applyStyleUpdate('style.fontWeight', e.target.value);
        });
        
        document.getElementById('styleTextColor')?.addEventListener('input', (e) => {
            document.getElementById('styleTextColorText').value = e.target.value;
            this.applyStyleUpdate('style.color', e.target.value);
        });
        
        document.getElementById('styleTextColorText')?.addEventListener('change', (e) => {
            document.getElementById('styleTextColor').value = e.target.value;
            this.applyStyleUpdate('style.color', e.target.value);
        });
        
        // Text alignment buttons
        document.querySelectorAll('#textAlignGroup .btn-icon').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#textAlignGroup .btn-icon').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.applyStyleUpdate('style.textAlign', btn.dataset.align);
            });
        });
        
        // Background
        document.getElementById('styleBgType')?.addEventListener('change', (e) => {
            this.applyStyleUpdate('background.type', e.target.value);
        });
        
        document.getElementById('styleBgColor')?.addEventListener('input', (e) => {
            document.getElementById('styleBgColorText').value = e.target.value;
            this.applyStyleUpdate('background.color', e.target.value);
        });
        
        // Border
        document.getElementById('styleBorderWidth')?.addEventListener('input', debounce((e) => {
            this.applyStyleUpdate('border.width', e.target.value);
        }, 200));
        
        document.getElementById('styleBorderStyle')?.addEventListener('change', (e) => {
            this.applyStyleUpdate('border.style', e.target.value);
        });
        
        document.getElementById('styleBorderColor')?.addEventListener('input', (e) => {
            this.applyStyleUpdate('border.color', e.target.value);
        });
        
        document.getElementById('styleBorderRadius')?.addEventListener('input', debounce((e) => {
            this.applyStyleUpdate('borderRadius', e.target.value);
        }, 200));
        
        // Shadow
        document.getElementById('styleShadowEnabled')?.addEventListener('change', (e) => {
            document.getElementById('shadowControls').style.display = e.target.checked ? '' : 'none';
            this.applyStyleUpdate('shadow.enabled', e.target.checked);
        });
        
        ['shadowX', 'shadowY', 'shadowBlur', 'shadowSpread'].forEach(id => {
            document.getElementById(id)?.addEventListener('input', debounce((e) => {
                const prop = id.replace('shadow', '').toLowerCase();
                this.applyStyleUpdate(`shadow.${prop}`, e.target.value);
            }, 200));
        });
        
        document.getElementById('shadowColor')?.addEventListener('input', (e) => {
            this.applyStyleUpdate('shadow.color', e.target.value);
        });
        
        // Padding
        ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'].forEach(id => {
            document.getElementById(id)?.addEventListener('input', debounce((e) => {
                const side = id.replace('padding', '').toLowerCase();
                this.applyStyleUpdate(`padding.${side}`, e.target.value);
            }, 200));
        });
        
        // Margin
        ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'].forEach(id => {
            document.getElementById(id)?.addEventListener('input', debounce((e) => {
                const side = id.replace('margin', '').toLowerCase();
                this.applyStyleUpdate(`margin.${side}`, e.target.value);
            }, 200));
        });
        
        // Width
        document.getElementById('styleWidth')?.addEventListener('change', (e) => {
            document.getElementById('customWidthGroup').style.display = e.target.value === 'custom' ? '' : 'none';
            this.applyStyleUpdate('width', e.target.value);
        });
        
        document.getElementById('customWidthValue')?.addEventListener('input', debounce((e) => {
            this.applyStyleUpdate('widthValue', e.target.value);
        }, 200));
        
        document.getElementById('styleMinHeight')?.addEventListener('input', debounce((e) => {
            this.applyStyleUpdate('minHeight', e.target.value);
        }, 200));
        
        // Effects
        document.getElementById('styleOpacity')?.addEventListener('input', (e) => {
            document.getElementById('opacityValue').textContent = `${e.target.value}%`;
            this.applyStyleUpdate('opacity', e.target.value / 100);
        });
    },
    
    /**
     * Apply style update to selected element
     */
    applyStyleUpdate(propPath, value) {
        if (!AppState.selectedElement) return;
        this.updateElementProperty(propPath, value);
    },
    
    /**
     * Load style values from element data
     */
    loadStyleValues(data) {
        if (!data || !data.style) return;
        
        const style = data.style;
        
        // Typography
        if (style.fontFamily) document.getElementById('styleFontFamily').value = style.fontFamily;
        if (style.fontSize) document.getElementById('styleFontSize').value = style.fontSize;
        if (style.fontWeight) document.getElementById('styleFontWeight').value = style.fontWeight;
        if (style.color) {
            document.getElementById('styleTextColor').value = style.color;
            document.getElementById('styleTextColorText').value = style.color;
        }
        
        // Text align
        if (style.textAlign) {
            document.querySelectorAll('#textAlignGroup .btn-icon').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.align === style.textAlign);
            });
        }
        
        // Background
        if (data.background) {
            document.getElementById('styleBgType').value = data.background.type || 'none';
            if (data.background.color) {
                document.getElementById('styleBgColor').value = data.background.color;
                document.getElementById('styleBgColorText').value = data.background.color;
            }
        }
        
        // Border
        if (data.border) {
            document.getElementById('styleBorderWidth').value = data.border.width || 0;
            document.getElementById('styleBorderStyle').value = data.border.style || 'none';
            if (data.border.color) document.getElementById('styleBorderColor').value = data.border.color;
        }
        document.getElementById('styleBorderRadius').value = data.borderRadius || 0;
        
        // Shadow
        if (data.shadow) {
            document.getElementById('styleShadowEnabled').checked = data.shadow.enabled || false;
            document.getElementById('shadowControls').style.display = data.shadow.enabled ? '' : 'none';
            document.getElementById('shadowX').value = data.shadow.x || 0;
            document.getElementById('shadowY').value = data.shadow.y || 4;
            document.getElementById('shadowBlur').value = data.shadow.blur || 8;
            document.getElementById('shadowSpread').value = data.shadow.spread || 0;
            if (data.shadow.color) document.getElementById('shadowColor').value = data.shadow.color;
        }
        
        // Padding
        if (data.padding) {
            document.getElementById('paddingTop').value = data.padding.top || 0;
            document.getElementById('paddingRight').value = data.padding.right || 0;
            document.getElementById('paddingBottom').value = data.padding.bottom || 0;
            document.getElementById('paddingLeft').value = data.padding.left || 0;
        }
        
        // Margin
        if (data.margin) {
            document.getElementById('marginTop').value = data.margin.top || 0;
            document.getElementById('marginRight').value = data.margin.right || 0;
            document.getElementById('marginBottom').value = data.margin.bottom || 0;
            document.getElementById('marginLeft').value = data.margin.left || 0;
        }
        
        // Opacity
        if (data.opacity !== undefined) {
            document.getElementById('styleOpacity').value = data.opacity * 100;
            document.getElementById('opacityValue').textContent = `${Math.round(data.opacity * 100)}%`;
        }
    },
    
    // ==========================================
    // Advanced Tab Controls
    // ==========================================
    
    setupAdvancedControls() {
        // Element ID
        document.getElementById('advElementId')?.addEventListener('change', (e) => {
            this.applyStyleUpdate('elementId', e.target.value);
        });
        
        // Classes
        document.getElementById('advClasses')?.addEventListener('change', (e) => {
            this.applyStyleUpdate('classes', e.target.value);
        });
        
        // Animation
        document.getElementById('advAnimation')?.addEventListener('change', (e) => {
            this.applyStyleUpdate('animation.name', e.target.value);
        });
        
        document.getElementById('advAnimDuration')?.addEventListener('input', debounce((e) => {
            this.applyStyleUpdate('animation.duration', parseInt(e.target.value));
        }, 200));
        
        document.getElementById('advAnimDelay')?.addEventListener('input', debounce((e) => {
            this.applyStyleUpdate('animation.delay', parseInt(e.target.value));
        }, 200));
        
        // Visibility
        document.getElementById('advVisibility')?.addEventListener('change', (e) => {
            this.applyStyleUpdate('visibility', e.target.value);
        });
        
        // Custom CSS
        document.getElementById('advCustomCSS')?.addEventListener('input', debounce((e) => {
            this.applyStyleUpdate('customCSS', e.target.value);
        }, 500));
    },
    
    /**
     * Load advanced values from element data
     */
    loadAdvancedValues(data) {
        if (!data) return;
        
        document.getElementById('advElementId').value = data.elementId || '';
        document.getElementById('advClasses').value = data.classes || '';
        
        if (data.animation) {
            document.getElementById('advAnimation').value = data.animation.name || '';
            document.getElementById('advAnimDuration').value = data.animation.duration || 500;
            document.getElementById('advAnimDelay').value = data.animation.delay || 0;
        }
        
        document.getElementById('advVisibility').value = data.visibility || 'all';
        document.getElementById('advCustomCSS').value = data.customCSS || '';
    }
};

// Expose globally
window.PropertiesPanel = PropertiesPanel;
