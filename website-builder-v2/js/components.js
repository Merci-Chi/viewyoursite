/**
 * ViewYourSite - Professional Website Builder
 * Component System (components.js)
 * 
 * This file handles:
 * - Component definitions
 * - Component rendering
 * - Default component data
 * - Export rendering
 */

// ============================================
// Component Definitions
// ============================================

const ComponentDefinitions = {
    // Text Components
    heading: {
        name: 'Heading',
        category: 'text',
        icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>',
        defaultProps: {
            type: 'heading',
            text: 'Heading Text',
            level: 'h2', // h1-h6
            style: {
                fontFamily: 'Inter',
                fontSize: '',
                fontWeight: '700',
                color: '#1e293b',
                textAlign: 'left',
                lineHeight: '1.2',
                letterSpacing: '0'
            },
            background: {
                type: 'none',
                color: ''
            },
            padding: { top: 0, right: 0, bottom: 16, left: 0 },
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
            link: ''
        }
    },
    
    paragraph: {
        name: 'Paragraph',
        category: 'text',
        icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>',
        defaultProps: {
            type: 'paragraph',
            text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.',
            style: {
                fontFamily: 'Inter',
                fontSize: '16',
                fontWeight: '400',
                color: '#475569',
                textAlign: 'left',
                lineHeight: '1.7',
                letterSpacing: '0',
                textTransform: 'none'
            },
            padding: { top: 0, right: 0, bottom: 16, left: 0 },
            margin: { top: 0, right: 0, bottom: 0, left: 0 }
        }
    },
    
    quote: {
        name: 'Quote',
        category: 'text',
        icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3z"/></svg>',
        defaultProps: {
            type: 'quote',
            text: 'The only way to do great work is to love what you do.',
            attribution: 'Steve Jobs',
            style: {
                fontSize: '20',
                fontWeight: '500',
                color: '#334155',
                textAlign: 'left'
            },
            padding: { top: 16, right: 24, bottom: 16, left: 24 },
            margin: { top: 0, right: 0, bottom: 16, left: 0 }
        }
    },
    
    code: {
        name: 'Code Block',
        category: 'text',
        icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
        defaultProps: {
            type: 'code',
            code: '// Your code here\nfunction hello() {\n  console.log("Hello, World!");\n}',
            language: 'javascript',
            showLineNumbers: true,
            style: {
                backgroundColor: '#1a1a2e',
                textColor: '#e2e8f0',
                fontSize: '14'
            },
            padding: { top: 16, right: 16, bottom: 16, left: 16 },
            margin: { top: 0, right: 0, bottom: 16, left: 0 }
        }
    },
    
    // Media Components
    image: {
        name: 'Image',
        category: 'media',
        icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
        defaultProps: {
            type: 'image',
            src: '', // URL or data
            alt: 'Image description',
            sizeMode: 'cover', // cover, contain, actual
            link: '',
            borderRadius: '8',
            shadow: {
                enabled: false,
                x: 0,
                y: 4,
                blur: 10,
                spread: 0,
                color: 'rgba(0,0,0,0.1)'
            },
            filters: {
                brightness: 100,
                contrast: 100,
                saturate: 100,
                blur: 0
            },
            maxWidth: '100%',
            padding: { top: 0, right: 0, bottom: 0, left: 0 },
            margin: { top: 0, right: 0, bottom: 16, left: 0 }
        }
    },
    
    video: {
        name: 'Video',
        category: 'media',
        icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>',
        defaultProps: {
            type: 'video',
            source: 'embed', // embed, upload
            url: '', // YouTube/Vimeo URL or uploaded file
            autoplay: false,
            loop: false,
            muted: false,
            showControls: true,
            aspectRatio: '16:9',
            padding: { top: 0, right: 0, bottom: 16, left: 0 },
            margin: { top: 0, right: 0, bottom: 0, left: 0 }
        }
    },
    
    gallery: {
        name: 'Gallery',
        category: 'media',
        icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>',
        defaultProps: {
            type: 'gallery',
            images: [], // Array of image objects
            columns: 3,
            gap: 8,
            lightbox: true,
            borderRadius: '8',
            padding: { top: 0, right: 0, bottom: 16, left: 0 },
            margin: { top: 0, right: 0, bottom: 0, left: 0 }
        }
    },
    
    // Interactive Components
    button: {
        name: 'Button',
        category: 'interactive',
        icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="8" width="18" height="8" rx="2"/></svg>',
        defaultProps: {
            type: 'button',
            text: 'Click Me',
            link: '#',
            style: 'filled', // filled, outline, ghost
            size: 'medium', // small, medium, large
            fullWidth: false,
            colors: {
                background: '#6366f1',
                text: '#ffffff',
                hoverBackground: '#4f46e5'
            },
            borderRadius: '6',
            padding: { top: 12, right: 24, bottom: 12, left: 24 },
            margin: { top: 0, right: 0, bottom: 16, left: 0 }
        }
    },
    
    form: {
        name: 'Form',
        category: 'interactive',
        icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
        defaultProps: {
            type: 'form',
            fields: [
                { id: generateId(), type: 'text', label: 'Name', placeholder: 'Your name', required: true },
                { id: generateId(), type: 'email', label: 'Email', placeholder: 'your@email.com', required: true },
                { id: generateId(), type: 'textarea', label: 'Message', placeholder: 'Your message...', required: false }
            ],
            submitAction: 'alert', // alert, email, url
            submitUrl: '',
            submitEmail: '',
            submitText: 'Send Message',
            padding: { top: 16, right: 16, bottom: 16, left: 16 },
            margin: { top: 0, right: 0, bottom: 16, left: 0 }
        }
    },
    
    accordion: {
        name: 'Accordion',
        category: 'interactive',
        icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>',
        defaultProps: {
            type: 'accordion',
            items: [
                { id: generateId(), title: 'Section 1', content: 'Content for section 1...', open: true },
                { id: generateId(), title: 'Section 2', content: 'Content for section 2...', open: false },
                { id: generateId(), title: 'Section 3', content: 'Content for section 3...', open: false }
            ],
            style: 'default', // default, bordered, minimal
            padding: { top: 0, right: 0, bottom: 16, left: 0 },
            margin: { top: 0, right: 0, bottom: 0, left: 0 }
        }
    },
    
    tabs: {
        name: 'Tabs',
        category: 'interactive',
        icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>',
        defaultProps: {
            type: 'tabs',
            tabs: [
                { id: generateId(), label: 'Tab 1', content: 'Content for tab 1', active: true },
                { id: generateId(), label: 'Tab 2', content: 'Content for tab 2', active: false },
                { id: generateId(), label: 'Tab 3', content: 'Content for tab 3', active: false }
            ],
            style: 'default',
            padding: { top: 0, right: 0, bottom: 16, left: 0 },
            margin: { top: 0, right: 0, bottom: 0, left: 0 }
        }
    },
    
    social: {
        name: 'Social Links',
        category: 'interactive',
        icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
        defaultProps: {
            type: 'social',
            links: [
                { id: generateId(), platform: 'twitter', url: 'https://twitter.com' },
                { id: generateId(), platform: 'facebook', url: 'https://facebook.com' },
                { id: generateId(), platform: 'instagram', url: 'https://instagram.com' },
                { id: generateId(), platform: 'linkedin', url: 'https://linkedin.com' }
            ],
            size: 'medium', // small, medium, large
            style: 'default', // default, circle, rounded
            colors: {
                icon: '#64748b',
                hoverIcon: '#6366f1',
                background: 'transparent'
            },
            padding: { top: 16, right: 0, bottom: 16, left: 0 },
            margin: { top: 0, right: 0, bottom: 0, left: 0 }
        }
    },
    
    search: {
        name: 'Search Field',
        category: 'interactive',
        icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
        defaultProps: {
            type: 'search',
            placeholder: 'Search...',
            action: 'url', // url, custom
            searchUrl: '/search?q=',
            padding: { top: 0, right: 0, bottom: 16, left: 0 },
            margin: { top: 0, right: 0, bottom: 0, left: 0 }
        }
    },
    
    // Layout Components
    section: {
        name: 'Section',
        category: 'layout',
        icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>',
        defaultProps: {
            type: 'section',
            background: {
                type: 'color',
                color: '#f8fafc',
                gradientType: 'linear',
                color1: '#6366f1',
                color2: '#8b5cf6',
                image: ''
            },
            minHeight: '200px',
            fullWidth: true,
            padding: { top: 48, right: 24, bottom: 48, left: 24 },
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
            components: [] // Nested components
        }
    },
    
    columns: {
        name: 'Columns',
        category: 'layout',
        icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="18" rx="1"/></svg>',
        defaultProps: {
            type: 'columns',
            columns: 2,
            gap: 24,
            columnsData: [
                { components: [] },
                { components: [] }
            ],
            padding: { top: 0, right: 0, bottom: 16, left: 0 },
            margin: { top: 0, right: 0, bottom: 0, left: 0 }
        }
    },
    
    divider: {
        name: 'Divider',
        category: 'layout',
        icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="3" y1="12" x2="21" y2="12"/></svg>',
        defaultProps: {
            type: 'divider',
            style: 'solid', // solid, dashed, dotted
            color: '#e2e8f0',
            thickness: 1,
            width: '100%',
            padding: { top: 8, right: 0, bottom: 8, left: 0 },
            margin: { top: 0, right: 0, bottom: 0, left: 0 }
        }
    },
    
    spacer: {
        name: 'Spacer',
        category: 'layout',
        icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="3" x2="12" y2="21"/></svg>',
        defaultProps: {
            type: 'spacer',
            height: 40,
            padding: { top: 0, right: 0, bottom: 0, left: 0 },
            margin: { top: 0, right: 0, bottom: 0, left: 0 }
        }
    },
    
    shape: {
        name: 'Shape',
        category: 'layout',
        icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>',
        defaultProps: {
            type: 'shape',
            shape: 'rectangle', // rectangle, circle
            width: '100px',
            height: '100px',
            fill: '#6366f1',
            border: {
                width: 0,
                style: 'solid',
                color: '#000000'
            },
            borderRadius: '8',
            padding: { top: 0, right: 0, bottom: 0, left: 0 },
            margin: { top: 0, right: 0, bottom: 0, left: 0 }
        }
    },
    
    // Advanced Components
    embed: {
        name: 'Embed',
        category: 'advanced',
        icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
        defaultProps: {
            type: 'embed',
            url: '',
            width: '100%',
            height: '400px',
            padding: { top: 0, right: 0, bottom: 16, left: 0 },
            margin: { top: 0, right: 0, bottom: 0, left: 0 }
        }
    },
    
    html: {
        name: 'Custom HTML',
        category: 'advanced',
        icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>',
        defaultProps: {
            type: 'html',
            html: '<div>\n  <!-- Your custom HTML here -->\n</div>',
            padding: { top: 0, right: 0, bottom: 16, left: 0 },
            margin: { top: 0, right: 0, bottom: 0, left: 0 }
        }
    },
    
    scrollcontainer: {
        name: 'Scroll Container',
        category: 'advanced',
        icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/></svg>',
        defaultProps: {
            type: 'scrollcontainer',
            direction: 'horizontal', // horizontal, vertical
            snap: false,
            components: [],
            padding: { top: 0, right: 0, bottom: 16, left: 0 },
            margin: { top: 0, right: 0, bottom: 0, left: 0 }
        }
    },
    
    calendar: {
        name: 'Calendar',
        category: 'advanced',
        icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
        defaultProps: {
            type: 'calendar',
            displayStyle: 'month', // month, week, agenda
            events: [],
            padding: { top: 0, right: 0, bottom: 16, left: 0 },
            margin: { top: 0, right: 0, bottom: 0, left: 0 }
        }
    },
    
    chart: {
        name: 'Chart',
        category: 'advanced',
        icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
        defaultProps: {
            type: 'chart',
            chartType: 'bar', // bar, line, pie
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
                values: [65, 59, 80, 81, 56]
            },
            colors: ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'],
            padding: { top: 0, right: 0, bottom: 16, left: 0 },
            margin: { top: 0, right: 0, bottom: 0, left: 0 }
        }
    }
};

// ============================================
// Component Renderer
// ============================================

const ComponentRenderer = {
    /**
     * Render a component to DOM element
     */
    render(componentData) {
        const { type } = componentData;
        
        switch (type) {
            case 'heading': return this.renderHeading(componentData);
            case 'paragraph': return this.renderParagraph(componentData);
            case 'quote': return this.renderQuote(componentData);
            case 'code': return this.renderCode(componentData);
            case 'image': return this.renderImage(componentData);
            case 'video': return this.renderVideo(componentData);
            case 'gallery': return this.renderGallery(componentData);
            case 'button': return this.renderButton(componentData);
            case 'form': return this.renderForm(componentData);
            case 'accordion': return this.renderAccordion(componentData);
            case 'tabs': return this.renderTabs(componentData);
            case 'social': return this.renderSocial(componentData);
            case 'search': return this.renderSearch(componentData);
            case 'section': return this.renderSection(componentData);
            case 'columns': return this.renderColumns(componentData);
            case 'divider': return this.renderDivider(componentData);
            case 'spacer': return this.renderSpacer(componentData);
            case 'shape': return this.renderShape(componentData);
            case 'embed': return this.renderEmbed(componentData);
            case 'html': return this.renderHTML(componentData);
            case 'scrollcontainer': return this.renderScrollContainer(componentData);
            case 'calendar': return this.renderCalendar(componentData);
            case 'chart': return this.renderChart(componentData);
            default:
                console.warn('Unknown component type:', type);
                return this.renderUnknown(type);
        }
    },
    
    /**
     * Apply common styles to element
     */
    applyStyles(element, data) {
        if (data.padding) {
            element.style.paddingTop = (data.padding.top || 0) + 'px';
            element.style.paddingRight = (data.padding.right || 0) + 'px';
            element.style.paddingBottom = (data.padding.bottom || 0) + 'px';
            element.style.paddingLeft = (data.padding.left || 0) + 'px';
        }
        
        if (data.margin) {
            element.style.marginTop = (data.margin.top || 0) + 'px';
            element.style.marginRight = (data.margin.right || 0) + 'px';
            element.style.marginBottom = (data.margin.bottom || 0) + 'px';
            element.style.marginLeft = (data.margin.left || 0) + 'px';
        }
        
        return element;
    },
    
    /**
     * Create base builder element
     */
    createBaseElement(data, className = '') {
        const el = document.createElement('div');
        el.className = `builder-element ${className}`;
        el.dataset.componentType = data.type;
        el.dataset.componentId = data.id;
        el.componentData = data;
        
        return el;
    },
    
    // ==========================================
    // Text Components
    // ==========================================
    
    renderHeading(data) {
        const el = this.createBaseElement(data, 'heading-component');
        const tag = document.createElement(data.level || 'h2');
        tag.textContent = data.text;
        tag.contentEditable = true;
        
        // Apply styles
        if (data.style) {
            if (data.style.fontFamily) tag.style.fontFamily = data.style.fontFamily;
            if (data.style.fontSize) tag.style.fontSize = data.style.fontSize + (isNaN(data.style.fontSize) ? '' : 'px');
            if (data.style.fontWeight) tag.style.fontWeight = data.style.fontWeight;
            if (data.style.color) tag.style.color = data.style.color;
            if (data.style.textAlign) tag.style.textAlign = data.style.textAlign;
            if (data.style.lineHeight) tag.style.lineHeight = data.style.lineHeight;
            if (data.style.letterSpacing) tag.style.letterSpacing = data.style.letterSpacing + 'em';
        }
        
        el.appendChild(tag);
        return this.applyStyles(el, data);
    },
    
    renderParagraph(data) {
        const el = this.createBaseElement(data, 'paragraph-component');
        const p = document.createElement('p');
        p.textContent = data.text;
        p.contentEditable = true;
        
        if (data.style) {
            if (data.style.fontFamily) p.style.fontFamily = data.style.fontFamily;
            if (data.style.fontSize) p.style.fontSize = data.style.fontSize + 'px';
            if (data.style.fontWeight) p.style.fontWeight = data.style.fontWeight;
            if (data.style.color) p.style.color = data.style.color;
            if (data.style.textAlign) p.style.textAlign = data.style.textAlign;
            if (data.style.lineHeight) p.style.lineHeight = data.style.lineHeight;
            if (data.style.textTransform) p.style.textTransform = data.style.textTransform;
        }
        
        el.appendChild(p);
        return this.applyStyles(el, data);
    },
    
    renderQuote(data) {
        const el = this.createBaseElement(data, 'quote-component');
        
        let html = `<blockquote>`;
        html += `<p contenteditable="true">${data.text}</p>`;
        if (data.attribution) {
            html += `<cite contenteditable="true">— ${data.attribution}</cite>`;
        }
        html += `</blockquote>`;
        
        el.innerHTML = html;
        
        if (data.style) {
            const blockquote = el.querySelector('blockquote');
            if (data.style.fontSize) blockquote.style.fontSize = data.style.fontSize + 'px';
            if (data.style.color) blockquote.style.color = data.style.color;
            if (data.style.textAlign) blockquote.style.textAlign = data.style.textAlign;
        }
        
        return this.applyStyles(el, data);
    },
    
    renderCode(data) {
        const el = this.createBaseElement(data, 'code-component');
        
        let html = `<div class="code-block-wrapper">`;
        html += `<pre><code class="language-${data.language || 'javascript'}">${this.escapeHTML(data.code)}</code></pre>`;
        html += `<button class="code-copy-btn">Copy</button>`;
        html += `</div>`;
        
        el.innerHTML = html;
        
        // Copy button handler
        el.querySelector('.code-copy-btn').addEventListener('click', () => {
            navigator.clipboard.writeText(data.code).then(() => {
                Toast.success('Code copied to clipboard');
            });
        });
        
        return this.applyStyles(el, data);
    },
    
    // ==========================================
    // Media Components
    // ==========================================
    
    renderImage(data) {
        const el = this.createBaseElement(data, 'image-component');
        
        if (data.src) {
            const img = document.createElement('img');
            img.src = data.src;
            img.alt = data.alt || '';
            
            if (data.sizeMode === 'contain') {
                img.style.objectFit = 'contain';
            } else if (data.sizeMode === 'actual') {
                img.style.width = 'auto';
                img.style.height = 'auto';
            } else {
                img.style.objectFit = 'cover';
            }
            
            if (data.borderRadius) {
                img.style.borderRadius = data.borderRadius + 'px';
            }
            
            if (data.maxWidth) {
                img.style.maxWidth = data.maxWidth;
            }
            
            if (data.shadow && data.shadow.enabled) {
                const s = data.shadow;
                img.style.boxShadow = `${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${s.color}`;
            }
            
            if (data.filters) {
                const f = data.filters;
                if (f.brightness !== 100) img.style.filter = `${img.style.filter || ''} brightness(${f.brightness}%) `;
                if (f.contrast !== 100) img.style.filter = `${img.style.filter || ''} contrast(${f.contrast}%) `;
                if (f.saturate !== 100) img.style.filter = `${img.style.filter || ''} saturate(${f.saturate}%) `;
                if (f.blur > 0) img.style.filter = `${img.style.filter || ''} blur(${f.blur}px)`;
            }
            
            el.appendChild(img);
        } else {
            // Placeholder
            const placeholder = document.createElement('div');
            placeholder.className = 'image-placeholder';
            placeholder.innerHTML = `
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                </svg>
                <span>Click to add image</span>
            `;
            el.appendChild(placeholder);
        }
        
        return this.applyStyles(el, data);
    },
    
    renderVideo(data) {
        const el = this.createBaseElement(data, 'video-component');
        
        if (data.url) {
            // Check if it's a YouTube or Vimeo URL
            const youtubeMatch = data.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
            const vimeoMatch = data.url.match(/vimeo\.com\/(\d+)/);
            
            if (youtubeMatch) {
                const videoId = youtubeMatch[1];
                el.innerHTML = `
                    <iframe src="https://www.youtube.com/embed/${videoId}?autoplay=${data.autoplay ? 1 : 0}&loop=${data.loop ? 1 : 0}&mute=${data.muted ? 1 : 0}&controls=${data.showControls ? 1 : 0}" 
                            frameborder="0" 
                            allowfullscreen
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
                    </iframe>
                `;
            } else if (vimeoMatch) {
                const videoId = vimeoMatch[1];
                el.innerHTML = `
                    <iframe src="https://player.vimeo.com/video/${videoId}?autoplay=${data.autoplay ? 1 : 0}&loop=${data.loop ? 1 : 0}&muted=${data.muted ? 1 : 0}" 
                            frameborder="0" 
                            allowfullscreen>
                    </iframe>
                `;
            } else {
                el.innerHTML = `<video src="${data.url}" controls="${data.showControls}" autoplay="${data.autoplay}" loop="${data.loop}" muted="${data.muted}"></video>`;
            }
        } else {
            el.innerHTML = `
                <div class="video-placeholder">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                        <polygon points="23 7 16 12 23 17 23 7"/>
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                    </svg>
                    <span>Add video URL</span>
                </div>
            `;
        }
        
        return this.applyStyles(el, data);
    },
    
    renderGallery(data) {
        const el = this.createBaseElement(data, `gallery-component grid-${data.columns || 3}`);
        
        if (data.images && data.images.length > 0) {
            data.images.forEach(img => {
                const item = document.createElement('div');
                item.className = 'gallery-item';
                
                const imgEl = document.createElement('img');
                imgEl.src = img.src;
                imgEl.alt = img.alt || '';
                
                if (data.borderRadius) {
                    item.style.borderRadius = data.borderRadius + 'px';
                }
                
                item.appendChild(imgEl);
                el.appendChild(item);
            });
        } else {
            el.innerHTML = `
                <div class="image-placeholder" style="grid-column: span ${data.columns || 3}">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                        <rect x="3" y="3" width="7" height="7"/>
                        <rect x="14" y="3" width="7" height="7"/>
                        <rect x="3" y="14" width="7" height="7"/>
                        <rect x="14" y="14" width="7" height="7"/>
                    </svg>
                    <span>Click to add images</span>
                </div>
            `;
        }
        
        if (data.gap) {
            el.style.gap = data.gap + 'px';
        }
        
        return this.applyStyles(el, data);
    },
    
    // ==========================================
    // Interactive Components
    // ==========================================
    
    renderButton(data) {
        const el = this.createBaseElement(data);
        
        const btn = document.createElement('a');
        btn.href = data.link || '#';
        btn.className = `button-component ${data.style || 'filled'}`;
        btn.textContent = data.text || 'Button';
        
        if (data.fullWidth) {
            btn.classList.add('full-width');
        }
        
        if (data.colors) {
            if (data.style === 'filled') {
                btn.style.backgroundColor = data.colors.background;
                btn.style.color = data.colors.text;
            } else if (data.style === 'outline') {
                btn.style.borderColor = data.colors.background;
                btn.style.color = data.colors.background;
            } else {
                btn.style.color = data.colors.background;
            }
        }
        
        if (data.borderRadius) {
            btn.style.borderRadius = data.borderRadius + 'px';
        }
        
        if (data.size === 'small') {
            btn.style.padding = '8px 16px';
            btn.style.fontSize = '0.875rem';
        } else if (data.size === 'large') {
            btn.style.padding = '16px 32px';
            btn.style.fontSize = '1.125rem';
        }
        
        el.appendChild(btn);
        return this.applyStyles(el, data);
    },
    
    renderForm(data) {
        const el = this.createBaseElement(data, 'form-component');
        
        let formHtml = '<form onsubmit="event.preventDefault(); alert(\'Form submitted!\');">';
        
        if (data.fields) {
            data.fields.forEach(field => {
                formHtml += `<div class="form-field">`;
                formHtml += `<label>${field.label}${field.required ? ' *' : ''}</label>`;
                
                if (field.type === 'textarea') {
                    formHtml += `<textarea placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}></textarea>`;
                } else if (field.type === 'select') {
                    formHtml += `<select><option value="">Select...</option></select>`;
                } else {
                    formHtml += `<input type="${field.type}" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}>`;
                }
                
                formHtml += `</div>`;
            });
        }
        
        formHtml += `<button type="submit" class="form-submit-btn">${data.submitText || 'Submit'}</button>`;
        formHtml += '</form>';
        
        el.innerHTML = formHtml;
        return this.applyStyles(el, data);
    },
    
    renderAccordion(data) {
        const el = this.createBaseElement(data, 'accordion-component');
        
        if (data.items && data.items.length > 0) {
            data.items.forEach((item, index) => {
                const itemEl = document.createElement('div');
                itemEl.className = `accordion-item ${item.open && index === 0 ? 'open' : ''}`;
                
                itemEl.innerHTML = `
                    <div class="accordion-header">
                        <h4 contenteditable="true">${item.title}</h4>
                        <svg class="accordion-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"/>
                        </svg>
                    </div>
                    <div class="accordion-content">
                        <p contenteditable="true">${item.content}</p>
                    </div>
                `;
                
                // Toggle functionality
                itemEl.querySelector('.accordion-header').addEventListener('click', () => {
                    itemEl.classList.toggle('open');
                });
                
                el.appendChild(itemEl);
            });
        }
        
        return this.applyStyles(el, data);
    },
    
    renderTabs(data) {
        const el = this.createBaseElement(data, 'tabs-component');
        
        let navHtml = '<div class="tabs-nav">';
        let contentHtml = '<div class="tabs-content">';
        
        if (data.tabs && data.tabs.length > 0) {
            data.tabs.forEach((tab, index) => {
                const isActive = tab.active || index === 0;
                navHtml += `<button class="tab-btn ${isActive ? 'active' : ''}">${tab.label}</button>`;
                contentHtml += `<div class="tab-pane ${isActive ? 'active' : ''}"><p contenteditable="true">${tab.content}</p></div>`;
            });
        }
        
        navHtml += '</div>';
        contentHtml += '</div>';
        
        el.innerHTML = navHtml + contentHtml;
        
        // Tab switching
        el.querySelectorAll('.tab-btn').forEach((btn, index) => {
            btn.addEventListener('click', () => {
                el.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                el.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
                btn.classList.add('active');
                el.querySelectorAll('.tab-pane')[index].classList.add('active');
            });
        });
        
        return this.applyStyles(el, data);
    },
    
    renderSocial(data) {
        const el = this.createBaseElement(data, 'social-links-component');
        
        const socialIcons = {
            twitter: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>',
            facebook: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>',
            instagram: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>',
            linkedin: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>',
            youtube: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.43z"/><polygon points="9.75 15.02l5.75-3.27-5.75-3.27v6.54"/></svg>',
            github: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></svg>'
        };
        
        if (data.links) {
            data.links.forEach(link => {
                const a = document.createElement('a');
                a.href = link.url || '#';
                a.target = '_blank';
                a.className = 'social-link';
                a.title = link.platform;
                a.innerHTML = socialIcons[link.platform] || socialIcons.github;
                
                if (data.style === 'circle') {
                    a.style.borderRadius = '50%';
                } else if (data.style === 'rounded') {
                    a.style.borderRadius = '12px';
                }
                
                if (data.size === 'small') {
                    a.style.width = '36px';
                    a.style.height = '36px';
                } else if (data.size === 'large') {
                    a.style.width = '52px';
                    a.style.height = '52px';
                }
                
                if (data.colors) {
                    a.style.color = data.colors.icon;
                }
                
                el.appendChild(a);
            });
        }
        
        return this.applyStyles(el, data);
    },
    
    renderSearch(data) {
        const el = this.createBaseElement(data, 'search-component');
        
        el.innerHTML = `
            <div class="search-input-wrapper">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input type="text" placeholder="${data.placeholder || 'Search...'}" />
            </div>
        `;
        
        return this.applyStyles(el, data);
    },
    
    // ==========================================
    // Layout Components
    // ==========================================
    
    renderSection(data) {
        const el = this.createBaseElement(data, 'section-component');
        
        // Apply background
        if (data.background) {
            this.applyBackground(el, data.background);
        }
        
        if (data.minHeight) {
            el.style.minHeight = data.minHeight;
        }
        
        // Create inner container
        const inner = document.createElement('div');
        inner.className = 'section-inner';
        
        // Render nested components
        if (data.components && data.components.length > 0) {
            data.components.forEach(comp => {
                inner.appendChild(this.render(comp));
            });
        } else {
            inner.innerHTML = '<p style="color: var(--text-muted); text-align: center;">Section - Drop components here</p>';
        }
        
        el.appendChild(inner);
        return this.applyStyles(el, data);
    },
    
    renderColumns(data) {
        const el = this.createBaseElement(data, `columns-component cols-${data.columns || 2}`);
        
        if (data.gap) {
            el.style.gap = data.gap + 'px';
        }
        
        if (data.columnsData && data.columnsData.length > 0) {
            data.columnsData.forEach((colData, index) => {
                const col = document.createElement('div');
                col.className = 'column';
                col.dataset.columnIndex = index;
                
                if (colData.components && colData.components.length > 0) {
                    colData.components.forEach(comp => {
                        col.appendChild(this.render(comp));
                    });
                } else {
                    col.innerHTML = `<span style="color: var(--text-muted); font-size: 0.8rem;">Column ${index + 1}</span>`;
                }
                
                el.appendChild(col);
            });
        }
        
        return this.applyStyles(el, data);
    },
    
    renderDivider(data) {
        const el = this.createBaseElement(data, 'divider-component');
        
        el.className += ` ${data.style || 'solid'}`;
        el.style.backgroundColor = data.color || '#e2e8f0';
        el.style.height = (data.thickness || 1) + 'px';
        
        if (data.width && data.width !== '100%') {
            el.style.width = data.width;
            el.style.marginLeft = 'auto';
            el.style.marginRight = 'auto';
        }
        
        return this.applyStyles(el, data);
    },
    
    renderSpacer(data) {
        const el = this.createBaseElement(data, 'spacer-component');
        el.style.height = (data.height || 40) + 'px';
        el.textContent = `${data.height || 40}px`;
        return this.applyStyles(el, data);
    },
    
    renderShape(data) {
        const el = this.createBaseElement(data, `shape-component ${data.shape || 'rectangle'}`);
        
        el.style.width = data.width || '100px';
        el.style.height = data.height || '100px';
        el.style.backgroundColor = data.fill || '#6366f1';
        
        if (data.borderRadius) {
            el.style.borderRadius = data.borderRadius + 'px';
        }
        
        if (data.border && data.border.width > 0) {
            el.style.borderWidth = data.border.width + 'px';
            el.style.borderStyle = data.border.style;
            el.style.borderColor = data.border.color;
        }
        
        return this.applyStyles(el, data);
    },
    
    // ==========================================
    // Advanced Components
    // ==========================================
    
    renderEmbed(data) {
        const el = this.createBaseElement(data, 'embed-component');
        
        if (data.url) {
            el.innerHTML = `<iframe src="${data.url}" width="${data.width || '100%'}" height="${data.height || '400px'}" sandbox="allow-scripts allow-same-origin"></iframe>`;
        } else {
            el.innerHTML = `
                <div class="embed-placeholder">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                        <polyline points="16 18 22 12 16 6"/>
                        <polyline points="8 6 2 12 8 18"/>
                    </svg>
                    <p>Enter embed URL</p>
                </div>
            `;
        }
        
        return this.applyStyles(el, data);
    },
    
    renderHTML(data) {
        const el = this.createBaseElement(data, 'html-component');
        el.innerHTML = data.html || '<p>Custom HTML content</p>';
        return this.applyStyles(el, data);
    },
    
    renderScrollContainer(data) {
        const el = this.createBaseElement(data, `scrollcontainer-component ${data.direction === 'vertical' ? 'vertical' : ''}`);
        
        if (data.components && data.components.length > 0) {
            data.components.forEach(comp => {
                el.appendChild(this.render(comp));
            });
        } else {
            el.innerHTML = `<div class="empty-canvas" style="min-height: 150px;"><p>Scroll Container - Add components</p></div>`;
        }
        
        return this.applyStyles(el, data);
    },
    
    renderCalendar(data) {
        const el = this.createBaseElement(data, 'calendar-component');
        
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = now.getDate();
        
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                           'July', 'August', 'September', 'October', 'November', 'December'];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        let calendarHtml = `
            <div class="calendar-header">
                <strong>${monthNames[month]} ${year}</strong>
            </div>
            <div class="calendar-grid">
        `;
        
        dayNames.forEach(day => {
            calendarHtml += `<div class="calendar-day-header">${day}</div>`;
        });
        
        for (let i = 0; i < firstDay; i++) {
            calendarHtml += '<div class="calendar-day"></div>';
        }
        
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = day === today;
            calendarHtml += `<div class="calendar-day${isToday ? ' today' : ''}">${day}</div>`;
        }
        
        calendarHtml += '</div>';
        el.innerHTML = calendarHtml;
        
        return this.applyStyles(el, data);
    },
    
    renderChart(data) {
        const el = this.createBaseElement(data, 'chart-component');
        
        const chartType = data.chartType || 'bar';
        const chartData = data.data || { labels: [], values: [] };
        const colors = data.colors || ['#6366f1'];
        
        let chartHtml = `<div class="chart-title" style="margin-bottom: 16px; font-weight: 600;">${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart</div>`;
        
        if (chartType === 'bar') {
            chartHtml += '<div style="display: flex; align-items: flex-end; gap: 8px; height: 180px; padding: 0 8px;">';
            const maxVal = Math.max(...chartData.values);
            chartData.values.forEach((val, i) => {
                const height = (val / maxVal) * 160;
                chartHtml += `
                    <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px;">
                        <div style="width: 100%; height: ${height}px; background-color: ${colors[i % colors.length]}; border-radius: 4px 4px 0 0;"></div>
                        <span style="font-size: 10px; color: #666;">${chartData.labels[i]}</span>
                    </div>
                `;
            });
            chartHtml += '</div>';
        } else if (chartType === 'line') {
            chartHtml += '<div style="position: relative; height: 180px; border-left: 2px solid #eee; border-bottom: 2px solid #eee;">';
            chartHtml += '<svg width="100%" height="100%" style="overflow: visible;">';
            // Simple line representation
            const points = chartData.values.map((val, i) => {
                const x = (i / (chartData.values.length - 1)) * 100;
                const y = 100 - val;
                return `${x}%,${y}%`;
            }).join(' ');
            chartHtml += `<polyline points="${points}" fill="none" stroke="${colors[0]}" stroke-width="2"/>`;
            chartHtml += '</svg></div>';
        } else if (chartType === 'pie') {
            chartHtml += '<div style="display: flex; justify-content: center; align-items: center; height: 180px;">';
            chartHtml += `<svg width="160" height="160" viewBox="0 0 160 160">`;
            const total = chartData.values.reduce((a, b) => a + b, 0);
            let currentAngle = 0;
            chartData.values.forEach((val, i) => {
                const angle = (val / total) * 360;
                const startAngle = currentAngle;
                const endAngle = currentAngle + angle;
                const largeArc = angle > 180 ? 1 : 0;
                
                const x1 = 80 + 70 * Math.cos((startAngle - 90) * Math.PI / 180);
                const y1 = 80 + 70 * Math.sin((startAngle - 90) * Math.PI / 180);
                const x2 = 80 + 70 * Math.cos((endAngle - 90) * Math.PI / 180);
                const y2 = 80 + 70 * Math.sin((endAngle - 90) * Math.PI / 180);
                
                chartHtml += `<path d="M80,80 L${x1},${y1} A70,70 0 ${largeArc},1 ${x2},${y2} Z" fill="${colors[i % colors.length]}"/>`;
                
                currentAngle = endAngle;
            });
            chartHtml += '</svg></div>';
        }
        
        el.innerHTML = chartHtml;
        return this.applyStyles(el, data);
    },
    
    renderUnknown(type) {
        const el = this.createBaseElement({ type: 'unknown' });
        el.innerHTML = `<p style="padding: 20px; color: #ef4444;">Unknown component type: ${type}</p>`;
        return el;
    },
    
    // ==========================================
    // Helper Methods
    // ==========================================
    
    applyBackground(element, bg) {
        if (!bg) return;
        
        switch (bg.type) {
            case 'color':
                element.style.backgroundColor = bg.color;
                break;
            case 'gradient':
                if (bg.gradientType === 'radial') {
                    element.style.background = `radial-gradient(circle, ${bg.color1}, ${bg.color2})`;
                } else {
                    element.style.background = `linear-gradient(135deg, ${bg.color1}, ${bg.color2})`;
                }
                break;
            case 'image':
                element.style.backgroundImage = `url('${bg.image}')`;
                element.style.backgroundSize = 'cover';
                element.style.backgroundPosition = 'center';
                break;
        }
    },
    
    escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },
    
    // ==========================================
    // Export Rendering (for preview/export)
    // ==========================================
    
    renderForExport(data) {
        // Similar to render but without editor-specific features
        return this.renderExportComponent(data);
    },
    
    renderExportComponent(data) {
        const { type } = data;
        
        switch (type) {
            case 'heading':
                return `<${data.level || 'h2'} style="
                    font-family: ${data.style?.fontFamily || 'Inter'};
                    font-size: ${data.style?.fontSize || 32}px;
                    font-weight: ${data.style?.fontWeight || 700};
                    color: ${data.style?.color || '#1e293b'};
                    text-align: ${data.style?.textAlign || 'left'};
                    line-height: ${data.style?.lineHeight || 1.2};
                    padding: ${(data.padding?.top || 0)}px ${(data.padding?.right || 0)}px ${(data.padding?.bottom || 16)}px ${(data.padding?.left || 0)}px;
                ">${data.text}</${data.level || 'h2'}>`;
                
            case 'paragraph':
                return `<p style="
                    font-family: ${data.style?.fontFamily || 'Inter'};
                    font-size: ${data.style?.fontSize || 16}px;
                    color: ${data.style?.color || '#475569'};
                    line-height: ${data.style?.lineHeight || 1.7};
                    padding: ${(data.padding?.top || 0)}px ${(data.padding?.right || 0)}px ${(data.padding?.bottom || 16)}px ${(data.padding?.left || 0)}px;
                ">${data.text}</p>`;
                
            case 'image':
                if (data.src) {
                    return `<img src="${data.src}" alt="${data.alt || ''}" style="
                        max-width: ${data.maxWidth || '100%'};
                        border-radius: ${data.borderRadius || 8}px;
                        object-fit: ${data.sizeMode || 'cover'};
                        margin: ${(data.margin?.top || 0)}px ${(data.margin?.right || 0)}px ${(data.margin?.bottom || 16)}px ${(data.margin?.left || 0)}px;
                    ">`;
                }
                return '';
                
            case 'button':
                return `<a href="${data.link || '#'}" style="
                    display: inline-flex;
                    padding: ${data.style === 'filled' ? '12px 24px' : data.style === 'outline' ? '11px 23px' : '12px 24px'};
                    background: ${data.style === 'filled' ? (data.colors?.background || '#6366f1') : 'transparent'};
                    color: ${data.style === 'filled' ? (data.colors?.text || '#fff') : (data.colors?.background || '#6366f1')};
                    border: ${data.style === 'outline' ? `2px solid ${data.colors?.background || '#6366f1'}` : 'none'};
                    border-radius: ${data.borderRadius || 6}px;
                    text-decoration: none;
                    font-weight: 600;
                    ${data.fullWidth ? 'width: 100%; justify-content: center;' : ''}
                    margin: ${(data.padding?.top || 12)}px ${(data.padding?.right || 0)}px ${(data.padding?.bottom || 16)}px ${(data.padding?.left || 0)}px;
                ">${data.text || 'Button'}</a>`;
                
            case 'divider':
                return `<hr style="
                    border: none;
                    height: ${data.thickness || 1}px;
                    background: ${data.color || '#e2e8f0'};
                    width: ${data.width || '100%'};
                    margin: ${(data.padding?.top || 8)}px auto ${(data.padding?.bottom || 8)}px;
                ">`;
                
            case 'spacer':
                return `<div style="height: ${data.height || 40}px;"></div>`;
                
            case 'section':
                let sectionStyle = `
                    padding: ${data.padding?.top || 48}px ${data.padding?.right || 24}px ${data.padding?.bottom || 48}px ${data.padding?.left || 24}px;
                    min-height: ${data.minHeight || 'auto'};
                `;
                if (data.background) {
                    if (data.background.type === 'color') {
                        sectionStyle += `background-color: ${data.background.color};`;
                    } else if (data.background.type === 'gradient') {
                        sectionStyle += `background: linear-gradient(135deg, ${data.background.color1}, ${data.background.color2});`;
                    }
                }
                
                let sectionContent = '';
                if (data.components && data.components.length > 0) {
                    data.components.forEach(comp => {
                        sectionContent += this.renderExportComponent(comp);
                    });
                }
                
                return `<section style="${sectionStyle}"><div style="max-width: 1200px; margin: 0 auto;">${sectionContent}</div></section>`;
                
            case 'quote':
                return `<blockquote style="
                    border-left: 4px solid #6366f1;
                    padding-left: 24px;
                    font-style: italic;
                    color: ${data.style?.color || '#334155'};
                    font-size: ${data.style?.fontSize || 20}px;
                    margin: ${(data.padding?.top || 16)}px ${(data.padding?.right || 24)}px ${(data.padding?.bottom || 16)}px ${(data.padding?.left || 24)}px;
                ">
                    <p>${data.text}</p>
                    ${data.attribution ? `<cite>-- ${data.attribution}</cite>` : ''}
                </blockquote>`;
                
            case 'columns':
                let colsStyle = `display: grid; grid-template-columns: repeat(${data.columns || 2}, 1fr); gap: ${data.gap || 24}px;`;
                let colsContent = '';
                
                if (data.columnsData) {
                    data.columnsData.forEach(col => {
                        let colContent = '';
                        if (col.components) {
                            col.components.forEach(comp => {
                                colContent += this.renderExportComponent(comp);
                            });
                        }
                        colsContent += `<div>${colContent}</div>`;
                    });
                }
                
                return `<div style="${colsStyle}; padding: ${(data.padding?.top || 0)}px ${(data.padding?.right || 0)}px ${(data.padding?.bottom || 16)}px ${(data.padding?.left || 0)}px;">${colsContent}</div>`;
                
            default:
                return `<!-- Component type "${type}" not supported in export -->`;
        }
    }
};

// Expose globally
window.ComponentRenderer = ComponentRenderer;
window.ComponentDefinitions = ComponentDefinitions;
