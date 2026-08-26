// ============================================
// ViewYourSite Builder - Main Application
// Clean, Working, No Fake Content
// ============================================

(function() {
    'use strict';

    // ---- STATE ----
    const state = {
        elements: [],
        pages: [{ id: 'p1', name: 'Home', elements: [] }],
        currentPageId: 'p1',
        selectedId: null,
        zoom: 100,
        viewMode: 'desktop',
        history: [],
        historyIdx: -1,
        media: [],
        settings: { snap: false, gridSize: 10, autoSave: true },
        isDragging: false,
        isResizing: false,
        dragStart: {},
        resizeData: {}
    };

    // ---- ELEMENT TYPES (Real, working types) ----
    const EL_TYPES = [
        // Text
        { type: 'h1', cat: 'text', name: 'H1', icon: 'H1', def: { content: 'Heading', w: 300, h: 'auto', fs: 32, fw: 700 } },
        { type: 'h2', cat: 'text', name: 'H2', icon: 'H2', def: { content: 'Subheading', w: 280, h: 'auto', fs: 24, fw: 600 } },
        { type: 'p', cat: 'text', name: 'Paragraph', icon: 'P', def: { content: 'Enter your text here.', w: 300, h: 'auto', fs: 14 } },
        { type: 'span', cat: 'text', name: 'Text', icon: 'T', def: { content: 'Text', w: 'auto', h: 'auto' } },
        { type: 'a', cat: 'text', name: 'Link', icon: '@', def: { content: 'Click here', w: 'auto', h: 'auto', color: '#0066cc', td: 'underline' } },
        { type: 'quote', cat: 'text', name: 'Quote', icon: '"', def: { content: 'Quote text here', w: 280, h: 'auto', fs: 18, fi: 'italic', bl: '4px solid #333', pl: 20 } },
        
        // Media
        { type: 'img', cat: 'media', name: 'Image', icon: '\u25A0', def: { content: '', w: 200, h: 150, bg: '#f0f0f0' } },
        { type: 'video', cat: 'media', name: 'Video', icon: '\u25B6', def: { content: '', w: 300, h: 200, bg: '#000' } },
        { type: 'icon', cat: 'media', name: 'Icon', icon: '\u2605', def: { content: '\u2605', w: 40, h: 40, fs: 24, d: 'flex', ai: 'center', jc: 'center' } },
        
        // Interactive
        { type: 'btn', cat: 'interactive', name: 'Button', icon: '\u25A0', def: { content: 'Button', w: 'auto', h: 'auto', bg: '#000', c: '#fff', pad: '10px 24px', br: 5, cursor: 'pointer' } },
        { type: 'input', cat: 'interactive', name: 'Input', icon: '_', def: { content: '<input type="text" placeholder="Type..." style="width:100%;padding:8px;border:1px solid #ccc;box-sizing:border-box">', w: 200, h: 'auto' } },
        { type: 'textarea', cat: 'interactive', name: 'Textarea', icon: '#', def: { content: '<textarea placeholder="Message..." rows="3" style="width:100%;padding:8px;border:1px solid #ccc;resize:none;box-sizing:border-box"></textarea>', w: 250, h: 'auto' } },
        { type: 'select', cat: 'interactive', name: 'Select', icon: '\u25BC', def: { content: '<select style="width:100%;padding:8px;border:1px solid #ccc"><option>Option 1</option><option>Option 2</option></select>', w: 160, h: 'auto' } },
        { type: 'checkbox', cat: 'interactive', name: 'Checkbox', icon: '\u2611', def: { content: '<label style="display:flex;align-items:center;gap:6px"><input type="checkbox"> Option</label>', w: 'auto', h: 'auto' } },
        
        // Shapes/Layout
        { type: 'div', cat: 'shapes', name: 'Box', icon: '\u25A1', def: { content: '', w: 150, h: 100, bg: '#f5f5f5', border: '1px dashed #ccc' } },
        { type: 'section', cat: 'shapes', name: 'Section', icon: '\u2550', def: { content: '', w: '100%', h: 200, bg: '#fafafa', pad: 30 } },
        { type: 'hr', cat: 'shapes', name: 'Divider', icon: '-', def: { content: '', w: 200, h: 1, bg: '#ddd' } },
        { type: 'spacer', cat: 'shapes', name: 'Spacer', icon: '\u21D5', def: { content: '', w: '100%', h: 40 } },
        { type: 'grid', cat: 'shapes', name: 'Grid', icon: ':::', def: { content: '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:10px"><div style="bg:#eee;height:60px"></div><div style="bg:#eee;height:60px"></div><div style="bg:#eee;height:60px"></div></div>', w: 320, h: 'auto' } },
        { type: 'flex', cat: 'shapes', name: 'Flex Row', icon: '\u22EF', def: { content: '<div style="display:flex;gap:10px;padding:10px"><div style="flex:1;height:50px;background:#eee"></div><div style="flex:1;height:50px;background:#eee"></div></div>', w: 280, h: 'auto' } },
        
        // Components
        { type: 'card', cat: 'component', name: 'Card', icon: '\u25A4', def: { content: '<div style="padding:16px"><strong>Card Title</strong><p style="color:#666;font-size:12px;margin-top:6px">Card description</p></div>', w: 220, h: 'auto', bg: '#fff', border: '1px solid #e0e0e0', br: 8, bs: '0 2px 8px rgba(0,0,0,0.08)' } },
        { type: 'nav', cat: 'component', name: 'Navbar', icon: '\u2261', def: { content: '<nav style="display:flex;justify-content:space-between;align-items:center;padding:14px 20px"><strong>Logo</strong><div style="display:flex;gap:20px;font-size:13px"><span>Home</span><span>About</span><span>Contact</span></div></nav>', w: '100%', h: 'auto', bg: '#fff', borderBottom: '1px solid #eee' } },
        { type: 'footer', cat: 'component', name: 'Footer', icon: '\u22A4', def: { content: '<footer style="padding:30px;text-align:center;color:#aaa"><p>&copy; 2024</p></footer>', w: '100%', h: 'auto', bg: '#222', c: '#fff' } },
        { type: 'hero', cat: 'component', name: 'Hero', icon: '*', def: { content: '<div style="text-align:center;padding:60px 30px"><h1 style="margin-bottom:12px">Welcome</h1><p style="opacity:0.8;margin-bottom:24px">Your message here</p><button style="padding:12px 28px;background:#fff;border:none;cursor:pointer;font-weight:600">Get Started</button></div>', w: '100%', h: 'auto', bg: 'linear-gradient(135deg,#667eea,#764ba2)', c: '#fff' } },
        { type: 'alert', cat: 'component', name: 'Alert', icon: '!', def: { content: '<div style="padding:14px;display:flex;align-items:center;gap:10px"><span style="font-size:18px">&#9888;</span><div><strong>Notice</strong><p style="font-size:11px;margin:2px 0 0;color:#555">Alert message here</p></div></div>', w: 280, h: 'auto', bg: '#d4edda', c: '#155724', br: 6 } },
        { type: 'badge', cat: 'component', name: 'Badge', icon: '\u25CE', def: { content: 'New', w: 'auto', h: 'auto', bg: '#000', c: '#fff', pad: '4px 12px', br: 20, fs: 11, fw: 600 } },
        { type: 'avatar', cat: 'component', name: 'Avatar', icon: '@', def: { content: 'JD', w: 44, h: 44, bg: 'linear-gradient(135deg,#667eea,#764ba2)', br: '50%', c: '#fff', d: 'flex', ai: 'center', jc: 'center', fw: 600 } },
        { type: 'progress', cat: 'component', name: 'Progress', icon: '=', def: { content: '<div style="height:6px;background:#e0e0e0;border-radius:3px"><div style="height:100%;background:#4caf50;width:70%;border-radius:3px"></div></div>', w: 180, h: 'auto' } },
        { type: 'form', cat: 'component', name: 'Form', icon: '\u2709', def: { content: `<form style="display:flex;flex-direction:column;gap:12px;padding:16px">
<div><label style="font-size:11px;font-weight:600;color:#555">Name</label><input type="text" style="width:100%;padding:8px;margin-top:4px;border:1px solid #ddd;box-sizing:border-box"></div>
<div><label style="font-size:11px;font-weight:600;color:#555">Email</label><input type="email" style="width:100%;padding:8px;margin-top:4px;border:1px solid #ddd;box-sizing:border-box"></div>
<button type="button" style="padding:10px;background:#000;color:#fff;border:none;cursor:pointer;font-weight:600">Submit</button>
</form>`, w: 260, h: 'auto', bg: '#fff', br: 8, bs: '0 1px 4px rgba(0,0,0,0.1)' } },
        { type: 'social', cat: 'component', name: 'Social', icon: '\u2699', def: { content: '<div style="display:flex;gap:8px"><div style="w:32px;height:32px;background:#1877f2;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:bold">f</div><div style="w:32px;height:32px;background:#1da1f2;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:bold">t</div><div style="w:32px;height:32px;background:#e1306c;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:bold">in</div></div>', w: 'auto', h: 'auto' } },
        { type: 'table', cat: 'component', name: 'Table', icon: '\u2250', def: { content: '<table style="width:100%;border-collapse:collapse;font-size:12px"><tr style="background:#f9f9f9"><th style="padding:10px;text-align:left;border:1px solid #eee">Col 1</th><th style="padding:10px;text-align:left;border:1px solid #eee">Col 2</th></tr><tr><td style="padding:10px;border:1px solid #eee">Data 1</td><td style="padding:10px;border:1px solid #eee">Data 2</td></tr></table>', w: 280, h: 'auto' } },
        { type: 'tabs', cat: 'component', name: 'Tabs', icon: '\u255E', def: { content: '<div><div style="display:flex;border-bottom:1px solid #ddd"><div style="padding:10px 16px;border-bottom:2px solid #000;font-weight:600;cursor:pointer">Tab 1</div><div style="padding:10px 16px;cursor:pointer;color:#888">Tab 2</div></div><div style="padding:16px;font-size:13px">Content for Tab 1</div></div>', w: 280, h: 'auto' } },
        { type: 'pricing', cat: 'component', name: 'Pricing', icon: '$', def: { content: '<div style="text-align:center;padding:24px"><div style="font-size:12px;color:#888;text-transform:uppercase">Pro</div><div style="font-size:36px;font-weight:800">$19<span style="font-size:14px;font-weight:400;color:#888">/mo</span></div><ul style="list-style:none;padding:0;margin:16px 0;text-align:left;font-size:12px;color:#555"><li style="padding:6px 0;border-bottom:1px solid #eee">Feature 1</li><li style="padding:6px 0;border-bottom:1px solid #eee">Feature 2</li><li style="padding:6px 0">Feature 3</li></ul><button style="width:100%;padding:10px;background:#000;color:#fff;border:none;cursor:pointer;font-weight:600">Choose Plan</button></div>', w: 240, h: 'auto', bg: '#fff', border: '2px solid #eee', br: 12 } },
        { type: 'testimonial', cat: 'component', name: 'Testimonial', icon: '"', def: { content: '<div style="padding:20px;background:#f9f9f9;border-radius:8px"><div style="color:#ffc107;font-size:14px;margin-bottom:8px">\u2605\u2605\u2605\u2605\u2605</div><p style="font-style:italic;font-size:13px;color:#556;margin:0 0 12px">Great product!</p><div style="display:flex;align-items:center;gap:8px"><div style="w:32px;height:32px;background:#667eea;border-radius:50%"></div><strong style="font-size:12px">User Name</strong></div></div>', w: 260, h: 'auto' } },
        { type: 'countdown', cat: 'component', name: 'Countdown', icon: '\u23F3', def: { content: '<div style="display:flex;gap:12px;padding:16px;background:#000;color:#fff;border-radius:6px"><div style="text-align:center"><div style="font-size:28px;font-weight:700">07</div><div style="font-size:10px;opacity:0.7">Days</div></div><div style="text-align:center"><div style="font-size:28px;font-weight:700">12</div><div style="font-size:10px;opacity:0.7">Hours</div></div><div style="text-align:center"><div style="font-size:28px;font-weight:700">34</div><div style="font-size:10px;opacity:0.7">Min</div></div></div>', w: 'auto', h: 'auto' } },
        { type: 'chart', cat: 'component', name: 'Chart', icon: '\u25AC', def: { content: '<div style="display:flex;align-items:end;gap:8px;padding:16px;height:120px;background:#f9f9f9;border-radius:6px"><div style="flex:1;background:linear-gradient(to top,#667eea,#764ba2);border-radius:3px 3px 0 0;height:60%"></div><div style="flex:1;background:linear-gradient(to top,#667eea,#764ba2);border-radius:3px 3px 0 0;height:85%"></div><div style="flex:1;background:linear-gradient(to top,#667eea,#7674ba);border-radius:3px 3px 0 0;height:45%"></div><div style="flex:1;background:linear-gradient(to top,#667eea,#764ba2);border-radius:3px 3px 0 0;height:95%"></div></div>', w: 220, h: 'auto' } }
    ];

    // ---- DOM REFS ----
    let canvas, propsContent, addPopup, pagesPopup, mediaPopup, settingsPopup;
    let previewModal, exportModal, ctxMenu;

    // ---- INIT ----
    function init() {
        canvas = document.getElementById('canvas');
        propsContent = document.getElementById('propsContent');
        addPopup = document.getElementById('addPopup');
        pagesPopup = document.getElementById('pagesPopup');
        mediaPopup = document.getElementById('mediaPopup');
        settingsPopup = document.getElementById('settingsPopup');
        previewModal = document.getElementById('previewModal');
        exportModal = document.getElementById('exportModal');
        ctxMenu = document.getElementById('ctxMenu');

        loadState();
        setupEvents();
        renderElements();
        updateProps();
        toast('Builder ready');
    }

    // ---- LOAD/SAVE STATE ----
    function loadState() {
        try {
            const data = localStorage.getItem('vys_data');
            if (data) {
                const parsed = JSON.parse(data);
                Object.assign(state, parsed);
                state.isDragging = false;
                state.isResizing = false;
            }
        } catch(e) {}
        
        if (!state.pages.length) {
            state.pages = [{ id: 'p1', name: 'Home', elements: [] }];
        }
        
        loadPageElements();
        saveHistory();
    }

    function saveState() {
        try {
            state.currentPageId && savePageElements();
            const toSave = {
                pages: state.pages,
                currentPageId: state.currentPageId,
                media: state.media,
                settings: state.settings
            };
            localStorage.setItem('vys_data', JSON.stringify(toSave));
        } catch(e) {}
    }

    function loadPageElements() {
        const page = state.pages.find(p => p.id === state.currentPageId);
        state.elements = page ? [...(page.elements || [])] : [];
    }

    function savePageElements() {
        const page = state.pages.find(p => p.id === state.currentPageId);
        if (page) page.elements = [...state.elements];
    }

    // ---- HISTORY ----
    function saveHistory() {
        state.history = state.history.slice(0, state.historyIdx + 1);
        state.history.push(JSON.stringify(state.elements));
        if (state.history.length > 50) state.history.shift();
        else state.historyIdx++;
    }

    function undo() {
        if (state.historyIdx > 0) {
            state.historyIdx--;
            state.elements = JSON.parse(state.history[state.historyIdx]);
            state.selectedId = null;
            renderElements();
            updateProps();
            toast('Undo');
        }
    }

    function redo() {
        if (state.historyIdx < state.history.length - 1) {
            state.historyIdx++;
            state.elements = JSON.parse(state.history[state.historyIdx]);
            state.selectedId = null;
            renderElements();
            updateProps();
            toast('Redo');
        }
    }

    // ---- RENDER ELEMENTS ----
    function renderElements() {
        // Clear but keep structure
        canvas.innerHTML = '';
        
        if (!state.elements.length) {
            canvas.style.minHeight = '400px';
        } else {
            canvas.style.minHeight = '';
        }

        state.elements.forEach(el => {
            const dom = createElDOM(el);
            if (dom) canvas.appendChild(dom);
        });

        renderSelection();
    }

    function createElDOM(el) {
        const div = document.createElement('div');
        div.className = 'el';
        div.dataset.id = el.id;
        
        if (el.locked) div.classList.add('locked');
        if (el.hidden) div.classList.add('hidden');
        
        // Base styles
        const s = el.styles || {};
        div.style.cssText = `
            position: absolute;
            left: ${s.left || 50}px;
            top: ${s.top || 50}px;
            width: ${s.width || 'auto'};
            height: ${s.height || 'auto'};
            z-index: ${el.zIndex || 1};
            ${s.fontSize ? 'font-size:' + s.fontSize + ';' : ''}
            ${s.fontWeight ? 'font-weight:' + s.fontWeight + ';' : ''}
            ${s.color ? 'color:' + s.color + ';' : ''}
            ${s.background || s.bg ? 'background:' + (s.background || s.bg) + ';' : ''}
            ${s.padding ? 'padding:' + s.padding + ';' : ''}
            ${s.border ? 'border:' + s.border + ';' : ''}
            ${s.borderRadius || s.br ? 'border-radius:' + (s.borderRadius || s.br) + ';' : ''}
            ${s.boxShadow || s.bs ? 'box-shadow:' + (s.boxShadow || s.bs) + ';' : ''}
            ${s.display || s.d ? 'display:' + (s.display || s.d) + ';' : ''}
            ${s.alignItems || s.ai ? 'align-items:' + (s.alignItems || s.ai) + ';' : ''}
            ${s.justifyContent || s.jc ? 'justify-content:' + (s.justifyContent || s.jc) + ';' : ''}
            ${s.textDecoration || s.td ? 'text-decoration:' + (s.textDecoration || s.td) + ';' : ''}
            ${s.fontStyle || s.fi ? 'font-style:' + (s.fontStyle || s.fi) + ';' : ''}
            ${s.paddingLeft || s.pl ? 'padding-left:' + (s.paddingLeft || s.pl) + ';' : ''}
            ${s.borderBottom ? 'border-bottom:' + s.borderBottom + ';' : ''}
            ${s.cursor ? 'cursor:' + s.cursor + ';' : ''}
            ${s.opacity !== undefined ? 'opacity:' + s.opacity + ';' : ''}
        `;

        // Content
        if (el.content) {
            div.innerHTML = el.content;
        }

        return div;
    }

    function renderSelection() {
        // Remove old handles
        document.querySelectorAll('.handles').forEach(h => h.remove());
        document.querySelectorAll('.el.selected').forEach(e => e.classList.remove('selected'));

        if (!state.selectedId) return;

        const dom = canvas.querySelector(`[data-id="${state.selectedId}"]`);
        if (!dom) return;

        dom.classList.add('selected');

        // Add handles
        const handles = document.createElement('div');
        handles.className = 'handles';
        handles.innerHTML = `
            <div class="handle nw" data-h="nw"></div>
            <div class="handle n" data-h="n"></div>
            <div class="handle ne" data-h="ne"></div>
            <div class="handle e" data-h="e"></div>
            <div class="handle se" data-h="se"></div>
            <div class="handle s" data-h="s"></div>
            <div class="handle sw" data-h="sw"></div>
            <div class="handle w" data-h="w"></div>
        `;
        dom.appendChild(handles);
    }

    // ---- ADD ELEMENT ----
    function addElement(typeKey) {
        const typeDef = EL_TYPES.find(t => t.type === typeKey);
        if (!typeDef) return;

        const def = typeDef.def;
        const id = 'el_' + Date.now();

        const el = {
            id,
            type: typeDef.type,
            content: def.content || '',
            styles: {
                left: 80 + Math.random() * 100,
                top: 80 + Math.random() * 100,
                width: def.w || 'auto',
                height: def.h || 'auto',
                fontSize: def.fs,
                fontWeight: def.fw,
                color: def.c,
                background: def.bg,
                padding: def.pad,
                border: def.border,
                borderRadius: def.br,
                boxShadow: def.bs,
                display: def.d,
                alignItems: def.ai,
                justifyContent: def.jc,
                textDecoration: def.td,
                fontStyle: def.fi,
                paddingLeft: def.pl,
                borderBottom: def.borderBottom,
                cursor: def.cursor
            },
            locked: false,
            hidden: false,
            zIndex: state.elements.length + 1
        };

        state.elements.push(el);
        state.selectedId = id;
        saveHistory();
        saveState();
        renderElements();
        updateProps();
        closePopups();
        toast(typeDef.name + ' added');
    }

    // ---- SELECT / DELETE ----
    function selectEl(id) {
        state.selectedId = id;
        renderSelection();
        updateProps();
    }

    function deleteEl(id) {
        const idx = state.elements.findIndex(e => e.id === id);
        if (idx > -1) {
            state.elements.splice(idx, 1);
            if (state.selectedId === id) state.selectedId = null;
            saveHistory();
            saveState();
            renderElements();
            updateProps();
            toast('Deleted');
        }
    }

    function duplicateEl(id) {
        const el = state.elements.find(e => e.id === id);
        if (!el) return;

        const newEl = JSON.parse(JSON.stringify(el));
        newEl.id = 'el_' + Date.now();
        newEl.styles = {...newEl.styles};
        newEl.styles.left = (parseInt(newEl.styles.left) || 0) + 20;
        newEl.styles.top = (parseInt(newEl.styles.top) || 0) + 20;
        newEl.zIndex = state.elements.length + 1;

        state.elements.push(newEl);
        state.selectedId = newEl.id;
        saveHistory();
        saveState();
        renderElements();
        updateProps();
        toast('Duplicated');
    }

    // ---- LAYER OPERATIONS ----
    function layerOp(id, op) {
        const el = state.elements.find(e => e.id === id);
        if (!el) return;

        const zs = state.elements.map(e => e.zIndex);

        switch(op) {
            case 'front':
                el.zIndex = Math.max(...zs) + 1;
                break;
            case 'back':
                el.zIndex = Math.min(...zs) - 1;
                break;
            case 'forward':
                const nextHigher = state.elements.filter(e => e.zIndex > el.zIndex).sort((a,b) => a.zIndex - b.zIndex)[0];
                if (nextHigher) {
                    const temp = nextHigher.zIndex;
                    nextHigher.zIndex = el.zIndex;
                    el.zIndex = temp;
                }
                break;
            case 'backward':
                const nextLower = state.elements.filter(e => e.zIndex < el.zIndex).sort((a,b) => b.zIndex - a.zIndex)[0];
                if (nextLower) {
                    const temp = nextLower.zIndex;
                    nextLower.zIndex = el.zIndex;
                    el.zIndex = temp;
                }
                break;
        }
        saveState();
        renderElements();
    }

    // ---- PROPERTIES PANEL ----
    function updateProps() {
        const el = state.elements.find(e => e.id === state.selectedId);
        
        if (!el) {
            propsContent.innerHTML = '<p class="empty-msg">Select an element to edit</p>';
            return;
        }

        const s = el.styles || {};

        propsContent.innerHTML = `
            <details open class="prop-section">
                <summary>Position & Size</summary>
                <div class="prop-grid">
                    <div class="prop-row"><label>X</label><input type="number" data-s="left" value="${parseInt(s.left)||0}"></div>
                    <div class="prop-row"><label>Y</label><input type="number" data-s="top" value="${parseInt(s.top)||0}"></div>
                    <div class="prop-row"><label>W</label><input type="text" data-s="width" value="${s.width||'auto'}"></div>
                    <div class="prop-row"><label>H</label><input type="text" data-s="height" value="${s.height||'auto'}"></div>
                </div>
                <div class="prop-row"><label>Z</label><input type="number" data-prop="zIndex" value="${el.zIndex||1}"></div>
            </details>

            <details class="prop-section">
                <summary>Typography</summary>
                <div class="prop-row"><label>Font Size</label><input type="text" data-s="fontSize" value="${s.fontSize||''}" placeholder="14px"></div>
                <div class="prop-row"><label>Weight</label><select data-s="fontWeight">
                    <option value="" ${!s.fw?'selected':''}>Normal</option>
                    <option value="500" ${s.fw=='500'?'selected':''}>Medium</option>
                    <option value="600" ${s.fw=='600'?'selected':''}>Semi</option>
                    <option value="700" ${s.fw=='700'?'selected':''}>Bold</option>
                </select></div>
                <div class="prop-row"><label>Color</label><input type="color" data-s="color" value="${hexColor(s.color)}"></div>
                <div class="prop-row"><label>Align</label><select data-s="textAlign">
                    <option value="">Default</option>
                    <option value="left" ${s.textAlign=='left'?'selected':''}>Left</option>
                    <option value="center" ${s.textAlign=='center'?'selected':''}>Center</option>
                    <option value="right" ${s.textAlign=='right'?'selected':''}>Right</option>
                </select></div>
            </details>

            <details class="prop-section">
                <summary>Background</summary>
                <div class="prop-row"><label>Color</label><input type="color" data-s="background" value="${hexColor(s.background||s.bg)}"></div>
                <div class="prop-row"><label>Opacity</label><input type="range" data-s="opacity" min="0" max="100" value="${(parseFloat(s.opacity)||1)*100}"></div>
            </details>

            <details class="prop-section">
                <summary>Border</summary>
                <div class="prop-row"><label>Width</label><input type="text" data-s="borderWidth" value="${s.borderWidth||''}" placeholder="1px"></div>
                <div class="prop-row"><label>Radius</label><input type="text" data-s="borderRadius" value="${s.borderRadius||s.br||''}" placeholder="8px"></div>
                <div class="prop-row"><label>Color</label><input type="color" data-s="borderColor" value="${hexColor(s.borderColor)}"></div>
            </details>

            <details class="prop-section">
                <summary>Spacing</summary>
                <div class="prop-row"><label>Padding</label><input type="text" data-s="padding" value="${s.padding||''}" placeholder="10px"></div>
                <div class="prop-row"><label>Margin</label><input type="text" data-s="margin" value="${s.margin||''}" placeholder="10px"></div>
            </details>

            <details class="prop-section">
                <summary>Effects</summary>
                <div class="prop-row"><label>Shadow</label><input type="text" data-s="boxShadow" value="${s.boxShadow||''}" placeholder="0 2px 8px rgba(0,0,0,0.1)"></div>
            </details>

            <div class="prop-actions">
                <button onclick="app.duplicate('${el.id}')">Duplicate</button>
                <button onclick="app.toggleLock('${el.id}')">${el.locked ? 'Unlock' : 'Lock'}</button>
                <button onclick="app.toggleHide('${el.id}')">${el.hidden ? 'Show' : 'Hide'}</button>
                <button onclick="app.delete('${el.id}')" class="danger">Delete</button>
            </div>
        `;

        // Bind prop inputs
        propsContent.querySelectorAll('[data-s]').forEach(input => {
            input.addEventListener('change', e => updateStyle(e.target.dataset.s, e.target.value));
            input.addEventListener('input', e => {
                if (e.target.type === 'range') updateStyle(e.target.dataset.s, e.target.value / 100);
            });
        });

        propsContent.querySelectorAll('[data-prop]').forEach(input => {
            input.addEventListener('change', e => {
                const el2 = state.elements.find(x => x.id === state.selectedId);
                if (el2) {
                    el2[e.target.dataset.prop] = parseInt(e.target.value);
                    saveState();
                    renderElements();
                }
            });
        });
    }

    function hexColor(c) {
        if (!c || c.includes('gradient') || c === 'transparent') return '#000000';
        if (c.startsWith('#')) return c.length === 7 ? c : '#000000';
        if (c.startsWith('rgb')) {
            const m = c.match(/\d+/g);
            return m ? '#' + m.slice(0,3).map(x=>(+x).toString(16).padStart(2,'0')).join('') : '#000000';
        }
        return '#000000';
    }

    function updateStyle(prop, val) {
        const el = state.elements.find(e => e.id === state.selectedId);
        if (!el) return;

        if (prop === 'left' || prop === 'top') {
            val = Math.max(0, parseInt(val)) + 'px';
        } else if ((prop === 'width' || prop === 'height') && val && val !== 'auto') {
            val = val + 'px';
        } else if (prop === 'opacity') {
            val = String(val);
        }

        el.styles[prop] = val;
        saveState();

        const dom = canvas.querySelector(`[data-id="${state.selectedId}"]`);
        if (dom) {
            const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
            dom.style[cssProp] = val;
        }
    }

    // ---- DRAG & RESIZE ----
    function startDrag(e, elDom) {
        const el = state.elements.find(x => x.id === elDom.dataset.id);
        if (!el || el.locked) return;

        state.isDragging = true;
        state.dragStart = {
            mx: e.clientX, my: e.clientY,
            ex: parseInt(el.styles.left), ey: parseInt(el.styles.top)
        };
        elDom.classList.add('dragging');
    }

    function startResize(e, handle) {
        const el = state.elements.find(x => x.id === state.selectedId);
        if (!el) return;

        state.isResizing = true;
        const dom = canvas.querySelector(`[data-id="${state.selectedId}"]`);

        state.resizeData = {
            handle: handle,
            mx: e.clientX, my: e.clientY,
            w: dom.offsetWidth,
            h: dom.offsetHeight,
            ex: parseInt(el.styles.left),
            ey: parseInt(el.styles.top)
        };
    }

    function onMouseMove(e) {
        if (state.isDragging) {
            const el = state.elements.find(x => x.id === state.selectedId);
            if (!el) return;

            const dx = Math.round((e.clientX - state.dragStart.mx) / (state.zoom / 100));
            const dy = Math.round((e.clientY - state.dragStart.my) / (state.zoom / 100));

            const newX = Math.max(0, state.dragStart.ex + dx);
            const newY = Math.max(0, state.dragStart.ey + dy);

            el.styles.left = newX;
            el.styles.top = newY;

            const dom = canvas.querySelector(`[data-id="${state.selectedId}"]`);
            if (dom) {
                dom.style.left = newX + 'px';
                dom.style.top = newY + 'px';
            }
        }

        if (state.isResizing) {
            const r = state.resizeData;
            const scale = state.zoom / 100;
            const dx = (e.clientX - r.mx) / scale;
            const dy = (e.clientY - r.my) / scale;

            let newW = r.w + dx;
            let newH = r.dy;
            let newL = r.ex;
            let newT = r.ey;

            switch(r.handle) {
                case 'se': newH = r.h + dy; break;
                case 'sw': newW = r.w - dx; newL = r.ex + dx; newH = r.h + dy; break;
                case 'ne': newW = r.w + dx; newT = r.ey + dy; newH = r.h - dy; break;
                case 'nw': newW = r.w - dx; newL = r.ex + dx; newH = r.h - dy; newT = r.ey + dy; break;
                case 'n': newH = r.h - dy; newT = r.ey + dy; break;
                case 's': newH = r.h + dy; break;
                case 'e': newW = r.w + dx; break;
                case 'w': newW = r.w - dx; newL = r.ex + dx; break;
            }

            newW = Math.max(20, Math.round(newW));
            newH = Math.max(20, Math.round(newH));
            newL = Math.max(0, Math.round(newL));
            newT = Math.max(0, Math.round(newT));

            const el = state.elements.find(x => x.id === state.selectedId);
            if (el) {
                el.styles.width = newW + 'px';
                el.styles.height = newH + 'px';
                el.styles.left = newL + 'px';
                el.styles.top = newT + 'px';

                const dom = canvas.querySelector(`[data-id="${state.selectedId}"]`);
                if (dom) {
                    dom.style.width = newW + 'px';
                    dom.style.height = newH + 'px';
                    dom.style.left = newL + 'px';
                    dom.style.top = newT + 'px';
                }
            }
        }
    }

    function onMouseUp() {
        if (state.isDragging || state.isResizing) {
            const dom = canvas.querySelector(`[data-id="${state.selectedId}"]`);
            if (dom) dom.classList.remove('dragging');

            state.isDragging = false;
            state.isResizing = false;
            saveHistory();
            saveState();
        }
    }

    // ---- POPUPS ----
    function showAddPopup(btn) {
        closePopups();
        
        const rect = btn.getBoundingClientRect();
        addPopup.style.left = rect.left + 'px';
        addPopup.style.top = (rect.bottom + 8) + 'px';
        addPopup.classList.remove('hidden');

        // Build element list
        const list = document.getElementById('elementList');
        list.innerHTML = EL_TYPES.map(t => 
            `<div class="el-item" data-type="${t.type}" title="${t.name}">${t.icon}<span>${t.name}</span></div>`
        ).join('');

        list.querySelectorAll('.el-item').forEach(item => {
            item.addEventListener('click', () => addElement(item.dataset.type));
        });

        // Search
        document.getElementById('elementSearch').addEventListener('input', e => {
            const q = e.target.value.toLowerCase();
            list.querySelectorAll('.el-item').forEach(item => {
                const t = EL_TYPES.find(x => x.type === item.dataset.type);
                item.style.display = (t.name.toLowerCase().includes(q) || t.type.includes(q)) ? '' : 'none';
            });
        });
    }

    function showPagesPopup(btn) {
        closePopups();
        const rect = btn.getBoundingClientRect();
        pagesPopup.style.left = rect.left + 'px';
        pagesPopup.style.top = (rect.bottom + 8) + 'px';
        pagesPopup.classList.remove('hidden');
        renderPagesList();
    }

    function renderPagesList() {
        const list = document.getElementById('pagesList');
        list.innerHTML = state.pages.map(p => `
            <div class="page-item ${p.id === state.currentPageId ? 'active' : ''}" data-pid="${p.id}">
                <span class="page-item-name">${p.name}</span>
                <div class="page-item-actions">
                    <button data-action="rename" title="Rename">&#9998;</button>
                    <button data-action="delete" title="Delete">&#128465;</button>
                </div>
            </div>
        `).join('');

        list.querySelectorAll('.page-item').forEach(item => {
            item.querySelector('.page-item-name').addEventListener('click', () => switchPage(item.dataset.pid));
            item.querySelectorAll('[data-action]').forEach(btn => {
                btn.addEventListener('click', e => {
                    e.stopPropagation();
                    if (btn.dataset.action === 'rename') renamePage(item.dataset.pid);
                    else if (btn.dataset.action === 'delete') deletePage(item.dataset.pid);
                });
            });
        });
    }

    function showMediaPopup(btn) {
        closePopups();
        const rect = btn.getBoundingClientRect();
        mediaPopup.style.left = rect.left + 'px';
        mediaPopup.style.top = (rect.bottom + 8) + 'px';
        mediaPopup.classList.remove('hidden');
        renderMediaGrid();
    }

    function renderMediaGrid() {
        const grid = document.getElementById('mediaGrid');
        grid.innerHTML = state.media.length ? state.media.map(m => `
            <div class="media-item" data-mid="${m.id}">
                ${m.type.startsWith('video') ? '<video src="'+m.url+'" muted></video>' : '<img src="'+m.url+'">'}
            </div>
        `).join('') : '<p style="grid-column:1/-1;text-align:center;color:#666;padding:20px;font-size:11px">No media uploaded</p>';

        grid.querySelectorAll('.media-item').forEach(item => {
            item.addEventListener('dblclick', () => {
                const m = state.media.find(x => x.id === item.dataset.mid);
                if (m) {
                    addElement(m.type.startsWith('video') ? 'video' : 'img');
                    const el = state.elements[state.elements.length - 1];
                    if (el) {
                        el.content = '';
                        el.mediaUrl = m.url;
                        const dom = canvas.querySelector(`[data-id="${el.id}"]`);
                        if (dom) {
                            dom.innerHTML = m.type.startsWith('video') ? 
                                `<video src="${m.url}" controls style="width:100%;height:100%">` :
                                `<img src="${m.url}" style="width:100%;height:100%;object-fit:cover">`;
                        }
                    }
                    closePopups();
                }
            });
        });
    }

    function showSettingsPopup(btn) {
        closePopups();
        const rect = btn.getBoundingClientRect();
        settingsPopup.style.left = rect.left + 'px';
        settingsPopup.style.top = (rect.bottom + 8) + 'px';
        settingsPopup.classList.remove('hidden');

        document.getElementById('snapToggle').checked = state.settings.snap;
        document.getElementById('gridSize').value = state.settings.gridSize;
        document.getElementById('autoSaveToggle').checked = state.settings.autoSave;
    }

    function closePopups() {
        [addPopup, pagesPopup, mediaPopup, settingsPopup].forEach(p => p?.classList.add('hidden'));
    }

    // ---- PAGES ----
    function switchPage(pid) {
        savePageElements();
        state.currentPageId = pid;
        state.selectedId = null;
        loadPageElements();
        saveHistory();
        renderElements();
        updateProps();
        renderPagesList();
        closePopups();
        toast('Switched to ' + (state.pages.find(p=>p.id===pid)?.name || 'page'));
    }

    function addPage() {
        const name = prompt('Page name:') || 'Page ' + (state.pages.length + 1);
        const page = { id: 'p_' + Date.now(), name, elements: [] };
        state.pages.push(page);
        saveState();
        renderPagesList();
        toast('Page created');
    }

    function renamePage(pid) {
        const page = state.pages.find(p => p.id === pid);
        if (!page) return;
        const name = prompt('New name:', page.name);
        if (name && name.trim()) {
            page.name = name.trim();
            saveState();
            renderPagesList();
        }
    }

    function deletePage(pid) {
        if (state.pages.length <= 1) { toast('Cannot delete last page'); return; }
        if (!confirm('Delete this page?')) return;
        state.pages = state.pages.filter(p => p.id !== pid);
        if (state.currentPageId === pid) {
            state.currentPageId = state.pages[0].id;
            loadPageElements();
        }
        saveState();
        renderPagesList();
        renderElements();
        toast('Page deleted');
    }

    // ---- MEDIA ----
    function uploadMedia(files) {
        Array.from(files).forEach(f => {
            if (f.size > 5*1024*1024) { toast(f.name + ' too large', 'error'); return; }
            const reader = new FileReader();
            reader.onload = e => {
                state.media.unshift({
                    id: 'm_' + Date.now(),
                    name: f.name,
                    type: f.type,
                    url: e.target.result
                });
                saveState();
                renderMediaGrid();
            };
            reader.readAsDataURL(f);
        });
        toast('Uploaded');
    }

    // ---- ZOOM ----
    function setZoom(z) {
        state.zoom = Math.max(25, Math.min(200, z));
        document.getElementById('canvasWrapper').style.transform = `scale(${state.zoom/100})`;
        document.getElementById('zoomLevel').textContent = Math.round(state.zoom) + '%';
    }

    // ---- VIEW MODE ----
    function setViewMode(mode) {
        state.viewMode = mode;
        canvas.className = '';
        if (mode === 'tablet') canvas.classList.add('tablet');
        else if (mode === 'mobile') canvas.classList.add('mobile');
        document.querySelectorAll('.view-btn').forEach(b => b.classList.toggle('active', b.dataset.view === mode));
    }

    // ---- PREVIEW ----
    function showPreview() {
        previewModal.classList.remove('hidden');
        const html = generateExportHTML();
        const blob = new Blob([html], {type: 'text/html'});
        document.getElementById('previewFrame').src = URL.createObjectURL(blob);
    }

    // ---- EXPORT ----
    function showExport() {
        exportModal.classList.remove('hidden');
    }

    function downloadHTML() {
        const html = generateExportHTML();
        downloadFile(html, 'website.html', 'text/html');
        exportModal.classList.add('hidden');
        toast('Downloaded!');
    }

    function downloadZIP() {
        // Generate multi-page export info
        let output = '// Export from ViewYourSite\n\n';
        output += '=== INDEX.HTML ===\n\n' + generateExportHTML() + '\n\n';
        
        state.pages.slice(1).forEach(p => {
            savePageElements();
            const oldPage = state.currentPageId;
            state.currentPageId = p.id;
            loadPageElements();
            output += `=== ${p.name}.html ===\n\n` + generateExportHTML() + '\n\n';
            state.currentPageId = oldPage;
            loadPageElements();
        });

        downloadFile(output, 'website-export.txt', 'text/plain');
        exportModal.classList.add('hidden');
        toast('Export ready!');
    }

    function generateExportHTML() {
        const page = state.pages.find(p => p.id === state.currentPageId);
        const els = page ? (page.elements || state.elements) : state.elements;

        let bodyHTML = els.map(el => {
            const s = el.styles || {};
            const styleStr = Object.entries(s)
                .filter(([k,v]) => v && v !== '')
                .map(([k,v]) => k.replace(/([A-Z])/g,'-$1').toLowerCase() + ':' + v)
                .join(';');

            let tag = 'div';
            let content = el.content || '';

            switch(el.type) {
                case 'h1': tag = 'h1'; break;
                case 'h2': tag = 'h2'; break;
                case 'p': tag = 'p'; break;
                case 'img': return `<img src="${el.mediaUrl || ''}" alt="" style="${styleStr};max-width:100%">`;
                case 'video': return `<video src="${el.mediaUrl || ''}" controls style="${styleStr};max-width:100%"></video>`;
                case 'btn': tag = 'button'; break;
                case 'hr': return `<hr style="${styleStr}">`;
            }

            return `<${tag}${styleStr ? ' style="' + styleStr + '"' : ''}>${content}</${tag}>`;
        }).join('\n');

        return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${document.getElementById('projectName').textContent || 'My Website'}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:sans-serif;line-height:1.6}</style>
</head>
<body>
${bodyHTML}
</body>
</html>`;
    }

    function downloadFile(content, filename, mime) {
        const blob = new Blob([content], {type: mime});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename;
        a.click(); URL.revokeObjectURL(url);
    }

    // ---- TOAST ----
    window.toast = function(msg, type) {
        const container = document.getElementById('toastContainer');
        const t = document.createElement('div');
        t.className = 'toast';
        t.innerHTML = `<span class="toast-msg">${msg}</span><button class="toast-close">&times;</button>`;
        t.querySelector('.toast-close').onclick = () => { t.classList.add('removing'); setTimeout(() => t.remove(), 200); };
        container.appendChild(t);
        setTimeout(() => { if(t.parentElement) { t.classList.add('removing'); setTimeout(() => t.remove(), 200); } }, 2500);
    };

    // ---- PUBLIC API ----
    window.app = {
        duplicate: duplicateEl,
        delete: deleteEl,
        toggleLock: function(id) {
            const el = state.elements.find(e => e.id === id);
            if (el) { el.locked = !el.locked; saveState(); renderElements(); updateProps(); }
        },
        toggleHide: function(id) {
            const el = state.elements.find(e => e.id === id);
            if (el) { el.hidden = !el.hidden; saveState(); renderElements(); updateProps(); }
        }
    };

    // ---- EVENTS SETUP ----
    function setupEvents() {
        // Canvas events
        canvas.addEventListener('mousedown', e => {
            const el = e.target.closest('.el');
            
            if (e.target.classList.contains('handle')) {
                startResize(e, e.target.dataset.h);
                return;
            }

            if (el && !el.classList.contains('locked')) {
                selectEl(el.dataset.id);
                startDrag(e, el);
            } else if (e.target === canvas) {
                state.selectedId = null;
                renderSelection();
                updateProps();
            }
        });

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);

        // Keyboard
        document.addEventListener('keydown', e => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.contentEditable === 'true') return;

            const sel = state.elements.find(el => el.id === state.selectedId);

            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (sel) { e.preventDefault(); deleteEl(sel.id); }
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
            if ((e.ctrlKey || e.metaKey) && e.key === 'd' && sel) { e.preventDefault(); duplicateEl(sel.id); }
            if (e.key === 'Escape') { closePopups(); state.selectedId = null; renderSelection(); updateProps(); }

            // Arrow keys
            if (sel && ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
                e.preventDefault();
                const step = e.shiftKey ? 10 : 1;
                const s = sel.styles;
                switch(e.key) {
                    case 'ArrowUp': s.top = Math.max(0, (parseInt(s.top)||0) - step) + 'px'; break;
                    case 'ArrowDown': s.top = ((parseInt(s.top)||0) + step) + 'px'; break;
                    case 'ArrowLeft': s.left = Math.max(0, (parseInt(s.left)||0) - step) + 'px'; break;
                    case 'ArrowRight': s.left = ((parseInt(s.left)||0) + step) + 'px'; break;
                }
                saveState();
                const dom = canvas.querySelector(`[data-id="${sel.id}"]`);
                if (dom) {
                    dom.style.top = s.top;
                    dom.style.left = s.left;
                }
            }
        });

        // Toolbar buttons
        document.getElementById('addBtn').addEventListener('click', e => showAddPopup(e.currentTarget));

        document.querySelectorAll('[data-category]').forEach(btn => {
            btn.addEventListener('click', e => {
                const cat = btn.dataset.category;
                closePopups();
                
                const rect = btn.getBoundingClientRect();
                addPopup.style.left = rect.left + 'px';
                addPopup.style.top = (rect.bottom + 8) + 'px';
                addPopup.classList.remove('hidden');

                const list = document.getElementById('elementList');
                list.innerHTML = EL_TYPES.filter(t => t.cat === cat).map(t => 
                    `<div class="el-item" data-type="${t.type}" title="${t.name}">${t.icon}<span>${t.name}</span></div>`
                ).join('');

                list.querySelectorAll('.el-item').forEach(item => {
                    item.addEventListener('click', () => addElement(item.dataset.type));
                });
            });
        });

        document.getElementById('pagesBtn').addEventListener('click', e => showPagesPopup(e.currentTarget));
        document.getElementById('mediaBtn').addEventListener('click', e => showMediaPopup(e.currentTarget));
        document.getElementById('settingsBtn').addEventListener('click', e => showSettingsPopup(e.currentTarget));

        document.getElementById('addPageBtn').addEventListener('click', addPage);
        document.getElementById('uploadBtn').addEventListener('click', () => document.getElementById('fileInput').click());
        document.getElementById('fileInput').addEventListener('change', e => uploadMedia(e.target.files));

        // Settings
        document.getElementById('snapToggle').addEventListener('change', e => { state.settings.snap = e.target.checked; saveState(); });
        document.getElementById('gridSize').addEventListener('change', e => { state.settings.gridSize = +e.target.value; saveState(); });
        document.getElementById('autoSaveToggle').addEventListener('change', e => { state.settings.autoSave = e.target.checked; saveState(); });
        document.getElementById('clearDataBtn').addEventListener('click', () => {
            if (confirm('Clear ALL data?')) {
                localStorage.removeItem('vys_data');
                location.reload();
            }
        });

        // Top bar
        document.getElementById('undoBtn').addEventListener('click', undo);
        document.getElementById('redoBtn').addEventListener('click', redo);
        document.getElementById('previewBtn').addEventListener('click', showPreview);
        document.getElementById('exportBtn').addEventListener('click', showExport);

        document.querySelectorAll('.view-btn').forEach(b => b.addEventListener('click', () => setViewMode(b.dataset.view)));

        // Zoom
        document.getElementById('zoomIn').addEventListener('click', () => setZoom(state.zoom + 10));
        document.getElementById('zoomOut').addEventListener('click', () => setZoom(state.zoom - 10));

        // Modals
        document.getElementById('closePreview').addEventListener('click', () => previewModal.classList.add('hidden'));
        document.getElementById('closeExport').addEventListener('click', () => exportModal.classList.add('hidden'));
        document.getElementById('downloadHTML').addEventListener('click', downloadHTML);
        document.getElementById('downloadZIP').addEventListener('click', downloadZIP);

        [previewModal, exportModal].forEach(m => m.addEventListener('click', e => { if (e.target === m) m.classList.add('hidden'); }));

        // Context menu
        canvas.addEventListener('contextmenu', e => {
            e.preventDefault();
            const el = e.target.closest('.el');
            if (el) {
                selectEl(el.dataset.id);
                ctxMenu.style.left = e.clientX + 'px';
                ctxMenu.style.top = e.clientY + 'px';
                ctxMenu.classList.remove('hidden');
            }
        });

        document.addEventListener('click', () => ctxMenu.classList.add('hidden'));

        ctxMenu.querySelectorAll('[data-action]').forEach(item => {
            item.addEventListener('click', () => {
                const action = item.dataset.action;
                const sel = state.elements.find(e => e.id === state.selectedId);
                if (!sel) return;

                switch(action) {
                    case 'duplicate': duplicateEl(sel.id); break;
                    case 'copy': navigator.clipboard.writeText(JSON.stringify(sel)); toast('Copied'); break;
                    case 'front': layerOp(sel.id, 'front'); break;
                    case 'back': layerOp(sel.id, 'back'); break;
                    case 'lock': app.toggleLock(sel.id); break;
                    case 'hide': app.toggleHide(sel.id); break;
                    case 'delete': deleteEl(sel.id); break;
                }
                ctxMenu.classList.add('hidden');
            });
        });

        // Props panel
        document.getElementById('closeProps').addEventListener('click', () => document.getElementById('propsPanel').classList.add('collapsed'));

        // Project name
        document.getElementById('projectName').addEventListener('blur', e => {
            saveState();
        });

        // Close popups on outside click
        document.addEventListener('click', e => {
            if (!e.target.closest('.popup') && !e.target.closest('.tool-btn') && !e.target.closest('#addBtn')) {
                closePopups();
            }
        });

        // Mouse wheel zoom
        document.getElementById('canvasArea').addEventListener('wheel', e => {
            if (e.ctrlKey) {
                e.preventDefault();
                setZoom(state.zoom + (e.deltaY > 0 ? -10 : 10));
            }
        }, { passive: false });
    }

    // ---- START ----
    document.addEventListener('init', init);
    if (document.readyState !== 'loading') init();
    else document.addEventListener('DOMContentLoaded', init);

})();
