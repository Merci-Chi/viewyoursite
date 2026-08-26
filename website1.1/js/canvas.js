/* ============================================
   ViewYourSite v1.1 - Canvas & Free-form Positioning
   ============================================ */

let dragType = null;

// Initialize canvas
function initCanvas() {
    const canvas = document.getElementById('canvas');
    
    // Drop handling
    canvas.addEventListener('dragover', e => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    });
    
    canvas.addEventListener('drop', e => {
        e.preventDefault();
        if (!dragType) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        addElement(dragType, x, y);
    });
    
    // Click on empty area to deselect
    canvas.addEventListener('click', e => {
        if (e.target === canvas || e.target.id === 'canvas' || e.target.closest('#canvasEmpty')) {
            deselectEl();
        }
    });
    
    // Element items - make draggable
    document.querySelectorAll('.element-item').forEach(item => {
        item.addEventListener('dragstart', e => {
            dragType = item.dataset.type;
            e.dataTransfer.effectAllowed = 'copy';
            item.style.opacity = '0.6';
        });
        
        item.addEventListener('dragend', () => {
            dragType = null;
            item.style.opacity = '';
        });
        
        // Click to add at center
        item.addEventListener('click', () => {
            const type = item.dataset.type;
            const canvasRect = canvas.getBoundingClientRect();
            addElement(type, 100 + Math.random() * 200, 80 + Math.random() * 200);
        });
    });
}

// Add element to canvas
function addElement(type, x, y) {
    const data = getDefaultData(type, x, y);
    createElFromData(data);
    pushHistory();
    saveToStorage();
    updateCanvasEmpty();
}

// Get default data for element type
function getDefaultData(type, x, y) {
    const base = { id: uid(), type, pageId: VYS.currentPageId, x, y, zIndex: VYS.elements.length + 1 };
    
    const defs = {
        text: { content: 'Enter your text here...', width: 200, height: 28, styles: { fontSize: '14px', color: '#333' } },
        heading: { content: 'Heading Text', width: 300, height: 48, styles: { fontSize: '32px', fontWeight: '700', color: '#000' } },
        image: { src: '', alt: '', width: 300, height: 200, objectFit: 'cover' },
        video: { src: '', poster: '', width: 400, height: 225 },
        button: { content: 'Click Me', href: '#', width: 140, height: 48, styles: { background: '#000', color: '#fff', borderRadius: '6px' } },
        link: { content: 'Click here', href: '#', width: 80, height: 22, styles: { color: '#333', textDecoration: 'underline' } },
        divider: { width: 400, height: 1, styles: { borderTop: '1px solid #ddd' } },
        spacer: { width: 50, height: 60 },
        container: { width: 240, height: 140, styles: { background: '#f7f7f7', borderRadius: '10px' } },
        section: { width: 800, height: 220, styles: { background: 'linear-gradient(135deg,#fafafa,#eee)' } },
        columns: { cols: 2, width: 420, height: 160 },
        grid: { cols: 3, rows: 2, width: 300, height: 180 },
        form: { fields: ['Name', 'Email', 'Message'], submitText: 'Submit', width: 280, height: 200 },
        input: { placeholder: 'Enter text...', label: '', width: 200, height: 46 },
        textarea: { placeholder: 'Message...', label: '', width: 240, height: 110 },
        checkbox: { label: 'Option', checked: false, width: 130, height: 26 },
        select: { options: ['Option 1', 'Option 2'], placeholder: 'Select...', width: 180, height: 46 },
        accordion: { items: [{ title: 'Section 1', content: 'Content...' }, { title: 'Section 2', content: 'Content...' }], width: 260, height: 140 },
        tabs: { tabs: ['Tab 1', 'Tab 2', 'Tab 3'], width: 280, height: 160 },
        icon: { iconClass: 'fa-star', width: 44, height: 44, styles: { fontSize: '26px', color: '#000' } },
        social: { platforms: ['facebook', 'twitter', 'instagram'], width: 150, height: 44 },
        map: { location: '', width: 260, height: 180 },
        embed: { code: '<!-- Embed -->', width: 260, height: 150 },
        html: { code: '<div>HTML</div>', width: 220, height: 120 }
    };
    
    return { ...base, ...(defs[type] || defs.text) };
}

// Create DOM element from data
function createElFromData(data) {
    const canvas = document.getElementById('canvas');
    
    const el = document.createElement('div');
    el.className = `c-el el-${data.type}`;
    el.dataset.id = data.id;
    el.dataset.type = data.type;
    
    // Position & size
    el.style.left = data.x + 'px';
    el.style.top = data.y + 'px';
    el.style.width = data.width + 'px';
    el.style.height = (data.height || 'auto') + 'px';
    el.style.zIndex = data.zIndex || 1;
    
    // Apply custom styles
    if (data.styles) Object.assign(el.style, data.styles);
    
    // Inner HTML
    el.innerHTML = buildInnerHTML(data);
    
    // Resize handles
    ['nw','n','ne','w','e','sw','s','se'].forEach(pos => {
        const h = document.createElement('div');
        h.className = `rh ${pos}`;
        h.dataset.rh = pos;
        el.appendChild(h);
    });
    
    // Drag setup
    setupDrag(el);
    
    // Click to select
    el.addEventListener('mousedown', e => {
        if (!e.target.classList.contains('rh')) {
            selectEl(el);
        }
    });
    
    canvas.appendChild(el);
    
    // Store reference
    data.dom = el;
    VYS.elements.push(data);
    
    return el;
}

// Build inner HTML for element types
function buildInnerHTML(d) {
    switch (d.type) {
        case 'text': return `<span class="el-content">${d.content || ''}</span>`;
        case 'heading': return `<h2 class="el-content">${d.content || ''}</h2>`;
        case 'image':
            return d.src ? `<img src="${d.src}" alt="${d.alt||''}">` : 
                '<div style="display:flex;flex-direction:column;align-items:center;gap:6px;color:#999;"><i class="fas fa-image" style="font-size:22px;"></i><span style="font-size:10px;">Add Image</span></div>';
        case 'video':
            return d.src ? `<video src="${d.src}"${d.poster?` poster="${d.poster}"`:''} controls></video>` :
                '<div style="color:#fff;display:flex;align-items:center;gap:8px;"><i class="fas fa-video" style="font-size:20px;"></i><span style="font-size:11px;">Add Video</span></div>';
        case 'button': return `<button>${d.content || 'Button'}</button>`;
        case 'link': return `<a>${d.content || 'Link'}</a>`;
        case 'divider': return '';
        case 'spacer': return '';
        case 'container': return '<span style="color:#aaa;font-size:10px;">Container</span>';
        case 'section': return '<span style="color:#aaa;font-size:10px;">Section</span>';
        case 'columns':
            let cHtml = '';
            for (let i=0;i<(d.cols||2);i++) cHtml += `<div class="col">Col ${i+1}</div>`;
            return cHtml;
        case 'grid':
            let gHtml = '';
            for (let i=0;i<((d.cols||3)*(d.rows||2));i++) gHtml += `<div class="grid-cell">Cell ${i+1}</div>`;
            return gHtml;
        case 'form':
            let fHtml = '';
            (d.fields||[]).forEach(f => {
                if (f.toLowerCase()==='message') fHtml += `<textarea placeholder="${f}"></textarea>`;
                else fHtml += `<input type="text" placeholder="${f}">`;
            });
            fHtml += `<button type="submit">${d.submitText||'Submit'}</button>`;
            return `<form>${fHtml}</form>`;
        case 'input': return `${d.label?`<label style="display:block;margin-bottom:4px;font-size:12px;">${d.label}</label>`:''}<input type="text" placeholder="${d.placeholder||''}">`;
        case 'textarea': return `${d.label?`<label style="display:block;margin-bottom:4px;font-size:12px;">${d.label}</label>`:''}<textarea placeholder="${d.placeholder||''}"></textarea>`;
        case 'checkbox': return `<input type="checkbox" ${d.checked?'checked':''}><span style="margin-left:6px;">${d.label||'Option'}</span>`;
        case 'select':
            let oHtml = '';
            (d.options||[]).forEach(o => oHtml += `<option value="${o}">${o}</option>`);
            return `<select>${oHtml}</select>`;
        case 'accordion':
            let aHtml = '';
            (d.items||[]).forEach(item => aHtml += `
                <div class="acc-item">
                    <div class="acc-head"><span>${item.title}</span><i class="fas fa-chevron-down" style="font-size:10px;"></i></div>
                    <div class="acc-body">${item.content}</div>
                </div>
            `);
            return aHtml;
        case 'tabs':
            let tNav = '', tPanels = '';
            (d.tabs||[]).forEach((t,i) => {
                tNav += `<button class="tab-btn${i===0?' active':''}">${t}</button>`;
                tPanels += `<div class="tabs-panel${i===0?' active':''}">Content for ${t}</div>`;
            });
            return `<div class="tabs-nav">${tNav}</div>${tPanels}`;
        case 'icon': return `<i class="fas ${d.iconClass||'fa-star'}"></i>`;
        case 'social':
            const icons = { facebook:'fa-facebook-f', twitter:'fa-twitter', instagram:'fa-instagram', linkedin:'fa-linkedin-in' };
            let sHtml = '';
            (d.platforms||[]).forEach(p => sHtml += `<a class="soc-icon"><i class="fab ${icons[p]||'fa-link'}"></i></a>`);
            return sHtml || '<a class="soc-icon"><i class="fas fa-share-alt"></i></a>';
        case 'map':
            return d.location ? 
                `<iframe src="https://maps.google.com/maps?q=${encodeURIComponent(d.location)}&output=embed"></iframe>` :
                '<div><i class="fas fa-map-marked-alt" style="font-size:18px;"></i><p style="margin-top:6px;">Map Location</p></div>';
        case 'embed': case 'html':
            return `<pre style="white-space:pre-wrap;">${esc(d.code||'')}</pre>`;
        default:
            return `<span>${d.content||'Element'}</span>`;
    }
}

function esc(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
}

// Setup drag behavior
function setupDrag(el) {
    let dragging = false, sx, sy, sl, st;
    
    el.addEventListener('mousedown', e => {
        if (e.target.classList.contains('rh')) return;
        if (['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) return;
        
        dragging = true;
        el.classList.add('dragging');
        
        sx = e.clientX; sy = e.clientY;
        sl = parseInt(el.style.left) || 0;
        st = parseInt(el.style.top) || 0;
        
        selectEl(el);
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', e => {
        if (!dragging) return;
        
        const dx = e.clientX - sx;
        const dy = e.clientY - sy;
        
        let nl = sl + dx;
        let nt = st + dy;
        
        el.style.left = nl + 'px';
        el.style.top = nt + 'px';
        
        // Update data
        const data = VYS.elements.find(d => d.id === el.dataset.id);
        if (data) { data.x = nl; data.y = nt; }
        
        updatePropInputs(nl, nt, null, null);
    });
    
    document.addEventListener('mouseup', () => {
        if (dragging) {
            dragging = false;
            el.classList.remove('dragging');
            pushHistory();
            saveToStorage();
        }
    });
    
    // Setup resize handles
    setupResize(el);
}

// Setup resize handles
function setupResize(el) {
    el.querySelectorAll('.rh').forEach(handle => {
        let resizing = false, sx, sy, sw, sh, sl, st;
        
        handle.addEventListener('mousedown', e => {
            e.stopPropagation();
            resizing = true;
            
            sx = e.clientX; sy = e.clientY;
            sw = el.offsetWidth; sh = el.offsetHeight;
            sl = parseInt(el.style.left) || 0;
            st = parseInt(el.style.top) || 0;
            
            selectEl(el);
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', e => {
            if (!resizing) return;
            
            const dx = e.clientX - sx;
            const dy = e.clientY - sy;
            const pos = handle.dataset.rh;
            
            let nw = sw, nh = sh, nsl = sl, nst = st;
            
            switch(pos) {
                case 'se': nw = Math.max(40,sw+dx); nh = Math.max(20,sh+dy); break;
                case 'sw': nw = Math.max(40,sw-dx); nh = Math.max(20,sh+dy); if(nw>40)nsl=sl+dx; break;
                case 'ne': nw = Math.max(40,sw+dx); nh = Math.max(20,sh-dy); if(nh>20)nst=st+dy; break;
                case 'nw': nw = Math.max(40,sw-dx); nh = Math.max(20,sh-dy); if(nw>40)nsl=sl+dx; if(nh>20)nst=st+dy; break;
                case 'n': nh = Math.max(20,sh-dy); if(nh>20)nst=st+dy; break;
                case 's': nh = Math.max(20,sh+dy); break;
                case 'e': nw = Math.max(40,sw+dx); break;
                case 'w': nw = Math.max(40,sw-dx); if(nw>40)nsl=sl+dx; break;
            }
            
            el.style.width = nw + 'px';
            el.style.height = nh + 'px';
            el.style.left = nsl + 'px';
            el.style.top = nst + 'px';
            
            const data = VYS.elements.find(d => d.id === el.dataset.id);
            if (data) { data.width=nw; data.height=nh; data.x=nsl; data.y=nst; }
            
            updatePropInputs(null, null, nw, nh);
        });
        
        document.addEventListener('mouseup', () => {
            if (resizing) {
                resizing = false;
                pushHistory();
                saveToStorage();
            }
        });
    });
}

// Select element
function selectEl(el) {
    if (VYS.selectedEl && VYS.selectedEl !== el) {
        VYS.selectedEl.classList.remove('selected');
    }
    
    VYS.selectedEl = el;
    el.classList.add('selected');
    
    updatePropsPanel();
    document.getElementById('propsPanel').classList.remove('hidden');
}

// Deselect element
function deselectEl() {
    if (VYS.selectedEl) {
        VYS.selectedEl.classList.remove('selected');
        VYS.selectedEl = null;
    }
    updatePropsPanel();
}

// Duplicate element
function dupEl(el) {
    const data = VYS.elements.find(d => d.id === el.dataset.id);
    if (!data) return;
    
    const newData = { ...data, id: uid(), x: data.x + 30, y: data.y + 30, zIndex: VYS.elements.length + 1, dom: null };
    createElFromData(newData);
    pushHistory();
    saveToStorage();
    updateCanvasEmpty();
    toast('Duplicated');
}

// Delete element
function delEl(id) {
    const dom = document.querySelector(`.c-el[data-id="${id}"]`);
    if (dom) dom.remove();
    
    VYS.elements = VYS.elements.filter(e => e.id !== id);
    
    if (VYS.selectedEl && VYS.selectedEl.dataset.id === id) {
        VYS.selectedEl = null;
    }
    
    updatePropsPanel();
    updateCanvasEmpty();
    pushHistory();
    saveToStorage();
    toast('Deleted');
}

// Bring forward / send backward
function layerEl(el, dir) {
    const data = VYS.elements.find(d => d.id === el.dataset.id);
    if (!data) return;
    
    if (dir === 'front') {
        const maxZ = Math.max(...VYS.elements.map(e => e.zIndex || 1));
        data.zIndex = maxZ + 1;
    } else {
        const minZ = Math.min(...VYS.elements.map(e => e.zIndex || 1));
        data.zIndex = minZ > 1 ? minZ - 1 : 1;
    }
    
    el.style.zIndex = data.zIndex;
    pushHistory();
    saveToStorage();
}

// Update empty state visibility
function updateCanvasEmpty() {
    const empty = document.getElementById('canvasEmpty');
    if (empty) {
        empty.classList.toggle('hidden', VYS.elements.length > 0);
    }
}

// Update property input values during drag/resize
function updatePropInputs(x, y, w, h) {
    if (x !== null) { const i = document.getElementById('propX'); if(i)i.value=Math.round(x); }
    if (y !== null) { const i = document.getElementById('propY'); if(i)i.value=Math.round(y); }
    if (w !== null) { const i = document.getElementById('propW'); if(i)i.value=Math.round(w); }
    if (h !== null) { const i = document.getElementById('propH'); if(i)i.value=Math.round(h); }
}

// Apply settings to canvas
function applySettings() {
    const wrapper = document.getElementById('canvasWrapper');
    wrapper.style.background = VYS.settings.bgColor;
    
    const bgInput = document.getElementById('themeBgColor');
    const bgTextInput = document.getElementById('themeBgColorText');
    if (bgInput) bgInput.value = VYS.settings.bgColor;
    if (bgTextInput) bgTextInput.value = VYS.settings.bgColor;
}

// Initialize on ready
document.addEventListener('DOMContentLoaded', initCanvas);
