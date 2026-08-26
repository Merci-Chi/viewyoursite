/* ============================================
   ViewYourSite - Properties Panel
   Element editing with popup controls
   ============================================ */

const PropertiesPanel = {
    panel: null,
    content: null,
    
    init() {
        this.panel = document.getElementById('propertiesPanel');
        this.content = document.getElementById('panelContent');
        
        // Close button
        document.getElementById('closePanel').addEventListener('click', () => {
            this.panel.classList.add('collapsed');
        });
        
        return this;
    },
    
    update() {
        const selectedEl = AppState.getSelectedElement();
        
        if (!selectedEl) {
            this.content.innerHTML = `
                <div class="no-selection">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="opacity:0.3;margin-bottom:12px">
                        <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"></path>
                    </svg>
                    <p>Select an element to edit its properties</p>
                </div>
            `;
            this.panel.classList.remove('collapsed');
            return;
        }
        
        this.panel.classList.remove('collapsed');
        this.renderProperties(selectedEl);
    },
    
    renderProperties(element) {
        const styles = element.styles || {};
        const props = element.properties || {};
        
        let html = `
            <!-- Element Type & ID -->
            <div class="prop-group open">
                <div class="prop-group-header" onclick="this.parentElement.classList.toggle('open')">
                    <span class="prop-group-title">${element.type.charAt(0).toUpperCase() + element.type.slice(1)}</span>
                    <span class="prop-group-toggle">&#9660;</span>
                </div>
                <div class="prop-group-content">
                    <div class="prop-row">
                        <label>ID</label>
                        <input type="text" class="prop-input" value="${element.id}" readonly style="opacity:0.5;font-size:11px">
                    </div>
                </div>
            </div>

            <!-- Position & Size -->
            <div class="prop-group open">
                <div class="prop-group-header" onclick="this.parentElement.classList.toggle('open')">
                    <span class="prop-group-title">Position & Size</span>
                    <span class="prop-group-toggle">&#9660;</span>
                </div>
                <div class="prop-group-content">
                    <div class="size-grid">
                        <div class="prop-row">
                            <label>X</label>
                            <input type="number" class="prop-input" data-prop="left" value="${parseInt(styles.left) || 0}">
                        </div>
                        <div class="prop-row">
                            <label>Y</label>
                            <input type="number" class="prop-input" data-prop="top" value="${parseInt(styles.top) || 0}">
                        </div>
                    </div>
                    <div class="size-grid" style="margin-top:8px">
                        <div class="prop-row">
                            <label>W</label>
                            <input type="number" class="prop-input" data-prop="width" value="${this.parseSize(styles.width)}" placeholder="auto">
                        </div>
                        <div class="prop-row">
                            <label>H</label>
                            <input type="number" class="prop-input" data-prop="height" value="${this.parseSize(styles.height)}" placeholder="auto">
                        </div>
                    </div>
                    <div class="prop-row" style="margin-top:8px">
                        <label>Z-Index</label>
                        <input type="number" class="prop-input" data-prop="zIndex" value="${element.zIndex || 1}" min="-1000" max="1000">
                    </div>
                </div>
            </div>

            <!-- Typography -->
            ${this.isTextElement(element.type) ? `
            <div class="prop-group">
                <div class="prop-group-header" onclick="this.parentElement.classList.toggle('open')">
                    <span class="prop-group-title">Typography</span>
                    <span class="prop-group-toggle">&#9660;</span>
                </div>
                <div class="prop-group-content">
                    <div class="prop-row">
                        <label>Font</label>
                        <select class="prop-select" data-prop="fontFamily">
                            <option value="inherit" ${styles.fontFamily === 'inherit' ? 'selected' : ''}>Default</option>
                            <option value="'Inter', sans-serif" ${styles.fontFamily?.includes('Inter') ? 'selected' : ''}>Inter</option>
                            <option value="'Georgia', serif" ${styles.fontFamily?.includes('Georgia') ? 'selected' : ''}>Georgia</option>
                            <option value="'Courier New', monospace" ${styles.fontFamily?.includes('Courier') ? 'selected' : ''}>Courier</option>
                            <option value="'JetBrains Mono', monospace" ${styles.fontFamily?.includes('JetBrains') ? 'selected' : ''}>JetBrains Mono</option>
                        </select>
                    </div>
                    <div class="size-grid">
                        <div class="prop-row">
                            <label>Size</label>
                            <input type="text" class="prop-input" data-prop="fontSize" value="${styles.fontSize || '14'}" placeholder="14px">
                        </div>
                        <div class="prop-row">
                            <label>Weight</label>
                            <select class="prop-select" data-prop="fontWeight">
                                <option value="300" ${styles.fontWeight == '300' ? 'selected' : ''}>Light</option>
                                <option value="400" ${!styles.fontWeight || styles.fontWeight == '400' ? 'selected' : ''}>Normal</option>
                                <option value="500" ${styles.fontWeight == '500' ? 'selected' : ''}>Medium</option>
                                <option value="600" ${styles.fontWeight == '600' ? 'selected' : ''}>Semibold</option>
                                <option value="700" ${styles.fontWeight == '700' ? 'selected' : ''}>Bold</option>
                                <option value="800" ${styles.fontWeight == '800' ? 'selected' : ''}>Extra Bold</option>
                            </select>
                        </div>
                    </div>
                    <div class="prop-row">
                        <label>Line Ht</label>
                        <input type="text" class="prop-input" data-prop="lineHeight" value="${styles.lineHeight || '1.5'}" placeholder="1.5">
                    </div>
                    <div class="prop-row">
                        <label>Align</label>
                        <div class="prop-btn-group">
                            <button class="prop-btn ${styles.textAlign === 'left' || !styles.textAlign ? 'active' : ''}" data-value="left">&#8592;</button>
                            <button class="prop-btn ${styles.textAlign === 'center' ? 'active' : ''}" data-value="center">&#8593;</button>
                            <button class="prop-btn ${styles.textAlign === 'right' ? 'active' : ''}" data-value="right">&#8594;</button>
                            <button class="prop-btn ${styles.textAlign === 'justify' ? 'active' : ''}" data-value="justify">&#8962;</button>
                        </div>
                    </div>
                    <div class="prop-row">
                        <label>Color</label>
                        <div class="prop-color-wrap">
                            <input type="color" class="prop-color" data-prop="color" value="${this.parseColor(styles.color, '#000000')}">
                            <input type="text" class="prop-color-value" data-prop="color-text" value="${styles.color || '#000000'}">
                        </div>
                    </div>
                </div>
            </div>
            ` : ''}

            <!-- Content (for text elements) -->
            ${this.hasEditableContent(element.type) ? `
            <div class="prop-group">
                <div class="prop-group-header" onclick="this.parentElement.classList.toggle('open')">
                    <span class="prop-group-title">Content</span>
                    <span class="prop-group-toggle">&#9660;</span>
                </div>
                <div class="prop-group-content">
                    <textarea class="prop-input prop-input-full" data-prop="content" rows="4" style="resize:vertical;min-height:80px">${this.stripHTML(element.content)}</textarea>
                </div>
            </div>
            ` : ''}

            <!-- Background -->
            <div class="prop-group">
                <div class="prop-group-header" onclick="this.parentElement.classList.toggle('open')">
                    <span class="prop-group-title">Background</span>
                    <span class="prop-group-toggle">&#9660;</span>
                </div>
                <div class="prop-group-content">
                    <div class="prop-row">
                        <label>Color</label>
                        <div class="prop-color-wrap">
                            <input type="color" class="prop-color" data-prop="background" value="${this.parseColor(styles.background, '#ffffff')}">
                            <input type="text" class="prop-color-value" data-prop="bg-text" value="${styles.background || 'transparent'}">
                        </div>
                    </div>
                    <div class="prop-row">
                        <label>Image URL</label>
                        <input type="text" class="prop-input" data-prop="bgImage" value="${styles.backgroundImage?.replace(/url\(['"]?|['"]?\)/g, '') || ''}" placeholder="https://...">
                    </div>
                    <div class="prop-row">
                        <label>Opacity</label>
                        <input type="range" class="prop-range" data-prop="bgOpacity" min="0" max="100" value="${(parseFloat(styles.opacity) || 1) * 100}">
                    </div>
                </div>
            </div>

            <!-- Border -->
            <div class="prop-group">
                <div class="prop-group-header" onclick="this.parentElement.classList.toggle('open')">
                    <span class="prop-group-title">Border</span>
                    <span class="prop-group-toggle">&#9660;</span>
                </div>
                <div class="prop-group-content">
                    <div class="size-grid">
                        <div class="prop-row">
                            <label>Width</label>
                            <input type="number" class="prop-input" data-prop="borderWidth" value="${parseInt(styles.borderWidth) || 0}" min="0">
                        </div>
                        <div class="prop-row">
                            <label>Radius</label>
                            <input type="text" class="prop-input" data-prop="borderRadius" value="${styles.borderRadius || '0'}" placeholder="8px">
                        </div>
                    </div>
                    <div class="prop-row">
                        <label>Color</label>
                        <div class="prop-color-wrap">
                            <input type="color" class="prop-color" data-prop="borderColor" value="${this.parseColor(styles.borderColor, '#000000')}">
                            <input type="text" class="prop-color-value" data-prop="borderColorText" value="${styles.borderColor || '#000000'}">
                        </div>
                    </div>
                    <div class="prop-row">
                        <label>Style</label>
                        <select class="prop-select" data-prop="borderStyle">
                            <option value="none" ${styles.borderStyle === 'none' ? 'selected' : ''}>None</option>
                            <option value="solid" ${!styles.borderStyle || styles.borderStyle === 'solid' ? 'selected' : ''}>Solid</option>
                            <option value="dashed" ${styles.borderStyle === 'dashed' ? 'selected' : ''}>Dashed</option>
                            <option value="dotted" ${styles.borderStyle === 'dotted' ? 'selected' : ''}>Dotted</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Spacing -->
            <div class="prop-group">
                <div class="prop-group-header" onclick="this.parentElement.classList.toggle('open')">
                    <span class="prop-group-title">Spacing</span>
                    <span class="prop-group-toggle">&#9660;</span>
                </div>
                <div class="prop-group-content">
                    <div class="position-grid">
                        <div></div>
                        <div class="prop-row"><label>T</label><input type="number" class="prop-input" data-prop="paddingTop" value="${parseInt(styles.paddingTop) || parseInt(styles.padding) || 0}"></div>
                        <div></div>
                        <div class="prop-row"><label>L</label><input type="number" class="prop-input" data-prop="paddingLeft" value="${parseInt(styles.paddingLeft) || parseInt(styles.padding) || 0}"></div>
                        <div class="prop-row"><label>All</label><input type="number" class="prop-input" data-prop="padding" value="${parseInt(styles.padding) || 0}"></div>
                        <div class="prop-row"><label>R</label><input type="number" class="prop-input" data-prop="paddingRight" value="${parseInt(styles.paddingRight) || parseInt(styles.padding) || 0}"></div>
                        <div></div>
                        <div class="prop-row"><label>B</label><input type="number" class="prop-input" data-prop="paddingBottom" value="${parseInt(styles.paddingBottom) || parseInt(styles.padding) || 0}"></div>
                        <div></div>
                    </div>
                    <div style="font-size:10px;color:#666;text-align:center;margin:8px 0">Margin</div>
                    <div class="position-grid">
                        <div></div>
                        <div class="prop-row"><label>T</label><input type="number" class="prop-input" data-prop="marginTop" value="${parseInt(styles.marginTop) || parseInt(styles.margin) || 0}"></div>
                        <div></div>
                        <div class="prop-row"><label>L</label><input type="number" class="prop-input" data-prop="marginLeft" value="${parseInt(styles.marginLeft) || parseInt(styles.margin) || 0}"></div>
                        <div class="prop-row"><label>All</label><input type="number" class="prop-input" data-prop="margin" value="${parseInt(styles.margin) || 0}"></div>
                        <div class="prop-row"><label>R</label><input type="number" class="prop-input" data-prop="marginRight" value="${parseInt(styles.marginRight) || parseInt(styles.margin) || 0}"></div>
                        <div></div>
                        <div class="prop-row"><label>B</label><input type="number" class="prop-input" data-prop="marginBottom" value="${parseInt(styles.marginBottom) || parseInt(styles.margin) || 0}"></div>
                        <div></div>
                    </div>
                </div>
            </div>

            <!-- Effects -->
            <div class="prop-group">
                <div class="prop-group-header" onclick="this.parentElement.classList.toggle('open')">
                    <span class="prop-group-title">Effects</span>
                    <span class="prop-group-toggle">&#9660;</span>
                </div>
                <div class="prop-group-content">
                    <div class="prop-row">
                        <label>Shadow</label>
                        <input type="text" class="prop-input" data-prop="boxShadow" value="${styles.boxShadow || 'none'}" placeholder="0 2px 8px rgba(0,0,0,0.1)">
                    </div>
                    <div class="prop-row">
                        <label>Rotate</label>
                        <input type="range" class="prop-range" data-prop="rotate" min="-180" max="180" value="${parseInt(styles.transform?.replace(/[^\d-]/g, '')) || 0}">
                    </div>
                    <div class="prop-row">
                        <label>Blur</label>
                        <input type="range" class="prop-range" data-prop="blur" min="0" max="20" value="${parseInt(styles.filter?.match(/blur\((\d+)px\)/)?.[1]) || 0}">
                    </div>
                </div>
            </div>

            <!-- Actions -->
            <div class="prop-group">
                <div class="prop-group-header" onclick="this.parentElement.classList.toggle('open')">
                    <span class="prop-group-title">Actions</span>
                    <span class="prop-group-toggle">&#9660;</span>
                </div>
                <div class="prop-group-content">
                    <div style="display:flex;flex-direction:column;gap:6px">
                        <button class="prop-btn" id="duplicateElBtn" style="justify-content:center;padding:8px">Duplicate Element</button>
                        <button class="prop-btn" id="lockElBtn" style="justify-content:center;padding:8px">${element.locked ? 'Unlock' : 'Lock'} Element</button>
                        <button class="prop-btn" id="hideElBtn" style="justify-content:center;padding:8px">${element.hidden ? 'Show' : 'Hide'} Element</button>
                        <button class="prop-btn danger" id="deleteElBtn" style="justify-content:center;padding:8px;background:#dc2626;color:#fff;border-color:#dc2626">Delete Element</button>
                    </div>
                </div>
            </div>
        `;
        
        this.content.innerHTML = html;
        this.attachEventListeners(element.id);
    },
    
    attachEventListeners(elementId) {
        // Style property inputs
        this.content.querySelectorAll('[data-prop]').forEach(input => {
            input.addEventListener('change', (e) => {
                this.updateProperty(elementId, e.target.dataset.prop, e.target.value);
            });
            
            input.addEventListener('input', (e) => {
                if (e.target.type === 'range') {
                    this.updateProperty(elementId, e.target.dataset.prop, e.target.value);
                }
            });
        });
        
        // Text align buttons
        this.content.querySelectorAll('[data-value]').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.parentElement.querySelectorAll('.prop-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.updateProperty(elementId, 'textAlign', btn.dataset.value);
            });
        });
        
        // Action buttons
        this.content.querySelector('#duplicateElBtn')?.addEventListener('click', () => {
            AppState.duplicateElement(elementId);
            Canvas.render();
            this.update();
        });
        
        this.content.querySelector('#lockElBtn')?.addEventListener('click', () => {
            AppState.toggleLock(elementId);
            Canvas.render();
            this.update();
        });
        
        this.content.querySelector('#hideElBtn')?.addEventListener('click', () => {
            AppState.toggleVisibility(elementId);
            Canvas.render();
            this.update();
        });
        
        this.content.querySelector('#deleteElBtn')?.addEventListener('click', () => {
            AppState.deleteElement(elementId);
            Canvas.render();
            this.update();
            Toast.show('Element deleted', 'success');
        });
    },
    
    updateProperty(elementId, prop, value) {
        const element = AppState.elements.find(el => el.id === elementId);
        if (!element) return;
        
        // Map prop names to actual style names
        const propMap = {
            'left': 'left',
            'top': 'top',
            'width': 'width',
            'height': 'height',
            'zIndex': 'zIndex',
            'fontSize': 'fontSize',
            'fontWeight': 'fontWeight',
            'lineHeight': 'lineHeight',
            'textAlign': 'textAlign',
            'color': 'color',
            'color-text': 'color',
            'background': 'background',
            'bg-text': 'background',
            'bgImage': 'backgroundImage',
            'bgOpacity': 'opacity',
            'borderWidth': 'borderWidth',
            'borderRadius': 'borderRadius',
            'borderColor': 'borderColor',
            'borderColorText': 'borderColor',
            'borderStyle': 'borderStyle',
            'padding': 'padding',
            'paddingTop': 'paddingTop',
            'paddingRight': 'paddingRight',
            'paddingBottom': 'paddingBottom',
            'paddingLeft': 'paddingLeft',
            'margin': 'margin',
            'marginTop': 'marginTop',
            'marginRight': 'marginRight',
            'marginBottom': 'marginBottom',
            'marginLeft': 'marginLeft',
            'boxShadow': 'boxShadow',
            'rotate': 'transform',
            'blur': 'filter',
            'content': 'content'
        };
        
        const styleProp = propMap[prop];
        if (!styleProp) return;
        
        let finalValue = value;
        
        // Handle special cases
        if (styleProp === 'width' || styleProp === 'height') {
            finalValue = value && value !== 'auto' ? value + 'px' : 'auto';
        } else if (styleProp === 'left' || styleProp === 'top') {
            finalValue = Math.max(0, parseInt(value)) + 'px';
        } else if (styleProp === 'transform') {
            finalValue = `rotate(${value}deg)`;
        } else if (styleProp === 'filter') {
            finalValue = `blur(${value}px)`;
        } else if (styleProp === 'backgroundImage' && value) {
            finalValue = `url('${value}')`;
        } else if (styleProp === 'opacity') {
            finalValue = String(parseInt(value) / 100);
        } else if (styleProp === 'content') {
            AppState.updateElement(elementId, { content: value });
            Canvas.render();
            return;
        }
        
        const newStyles = { ...element.styles, [styleProp]: finalValue };
        AppState.updateElement(elementId, { styles: newStyles });
        
        // Update DOM directly
        const domEl = document.querySelector(`[data-id="${elementId}"]`);
        if (domEl) {
            domEl.style[styleProp] = finalValue;
        }
    },
    
    isTextElement(type) {
        return ['heading', 'subheading', 'paragraph', 'text', 'span', 'link', 'list', 'quote', 'code'].includes(type);
    },
    
    hasEditableContent(type) {
        return ['heading', 'subheading', 'paragraph', 'text', 'span', 'quote', 'code', 'button', 'buttonOutline'].includes(type);
    },
    
    parseSize(value) {
        if (!value || value === 'auto') return '';
        return parseInt(value) || '';
    },
    
    parseColor(color, fallback) {
        if (!color || color === 'transparent' || color.includes('gradient')) return fallback;
        if (color.startsWith('#') && (color.length === 7 || color.length === 4)) return color;
        if (color.startsWith('rgb')) {
            const match = color.match(/\d+/g);
            if (match && match.length >= 3) {
                return '#' + match.slice(0, 3).map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
            }
        }
        return fallback;
    },
    
    stripHTML(html) {
        if (!html) return '';
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }
};

// Make globally available
window.PropertiesPanel = PropertiesPanel;
