/* ============================================
   ViewYourSite v1.1 - Properties Panel
   ============================================ */

function updatePropsPanel() {
    const body = document.getElementById('propsBody');
    const panel = document.getElementById('propsPanel');
    
    if (!VYS.selectedEl) {
        panel.classList.add('hidden');
        body.innerHTML = `
            <div class="props-empty">
                <i class="fas fa-mouse-pointer"></i>
                <p>Select an element to edit</p>
            </div>`;
        return;
    }
    
    panel.classList.remove('hidden');
    
    const el = VYS.selectedEl;
    const data = VYS.elements.find(d => d.id === el.dataset.id);
    if (!data) return;
    
    body.innerHTML = buildPropsHTML(data);
    setupPropsListeners(data);
}

function buildPropsHTML(d) {
    let html = `
        <!-- Position & Size -->
        <div class="prop-section">
            <div class="prop-section-header" onclick="toggleProp(this)">
                <span>Position & Size</span><i class="fas fa-chevron-down"></i>
            </div>
            <div class="prop-section-body">
                <div class="prop-row">
                    <label>X</label><input type="number" id="propX" value="${Math.round(d.x)}">
                    <label>Y</label><input type="number" id="propY" value="${Math.round(d.y)}">
                </div>
                <div class="prop-row">
                    <label>W</label><input type="number" id="propW" value="${Math.round(d.width)}">
                    <label>H</label><input type="number" id="propH" value="${Math.round(d.height || 0)}">
                </div>
            </div>
        </div>`;
    
    // Content for text-based elements
    if (['text','heading','button','link'].includes(d.type)) {
        html += buildContentProps(d);
    }
    
    // Style section
    html += buildStyleProps(d, d.type);
    
    // Type-specific
    switch (d.type) {
        case 'image': html += imageProps(d); break;
        case 'video': html += videoProps(d); break;
        case 'button': html += buttonProps(d); break;
        case 'icon': html += iconProps(d); break;
        case 'social': html += socialProps(d); break;
        case 'map': html += mapProps(d); break;
        case 'embed': case 'html': html += codeProps(d); break;
        case 'accordion': html += accordionProps(d); break;
        case 'tabs': html += tabsProps(d); break;
        case 'select': html += selectProps(d); break;
    }
    
    // Advanced
    html += advancedProps(d);
    
    return html;
}

function buildContentProps(d) {
    return `
        <div class="prop-section">
            <div class="prop-section-header" onclick="toggleProp(this)">
                <span>Content</span><i class="fas fa-chevron-down"></i>
            </div>
            <div class="prop-section-body">
                <div class="style-field">
                    <label>${d.type==='button'?'Button Text':'Text Content'}</label>
                    <textarea id="propContent" style="min-height:50px;">${(d.content||'').replace(/"/g,'&quot;')}</textarea>
                </div>
                ${d.type==='button'||d.type==='link'?`
                <div class="style-field"><label>Link URL</label><input type="text" id="propHref" value="${d.href||'#'}"></div>`:''}
            </div>
        </div>`;
}

function buildStyleProps(d, type) {
    const s = d.styles || {};
    
    return `
        <div class="prop-section">
            <div class="prop-section-header" onclick="toggleProp(this)">
                <span>Style</span><i class="fas fa-chevron-down"></i>
            </div>
            <div class="prop-section-body style-editor">
                <div class="style-field">
                    <label>Font Size</label>
                    <select id="propFontSize">
                        ${[12,14,16,18,20,24,28,32,36,42,48,56,64,72].map(sz => 
                            `<option value="${sz}px"${s.fontSize===sz+'px'?' selected':''}>${sz}px</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="style-field">
                    <label>Font Weight</label>
                    <select id="propFontWeight">
                        <option value="normal"${!s.fontWeight||s.fontWeight==='normal'?' selected':''}>Normal</option>
                        <option value="500"${s.fontWeight==='500'?' selected':''}>Medium</option>
                        <option value="600"${s.fontWeight==='600'?' selected':''}>Semi Bold</option>
                        <option value="700"${s.fontWeight==='700'||s.fontWeight==='bold'?' selected':''}>Bold</option>
                    </select>
                </div>
                <div class="style-field">
                    <label>Color</label>
                    <div class="color-row">
                        <input type="color" id="propColor" value="${s.color||'#333'}">
                        <input type="text" id="propColorTxt" value="${s.color||'#333'}">
                    </div>
                </div>
                <div class="style-field">
                    <label>Background</label>
                    <div class="color-row">
                        <input type="color" id="propBg" value="${s.background||s.backgroundColor||'#fff'}">
                        <input type="text" id="propBgTxt" value="${s.background||s.backgroundColor||'#fff'}">
                    </div>
                </div>
                <div class="style-field">
                    <label>Border Radius</label>
                    <input type="text" id="propRadius" value="${s.borderRadius||'0px'}">
                </div>
                <div class="style-field">
                    <label>Padding</label>
                    <input type="text" id="propPadding" value="${s.padding||'0px'}">
                </div>
                <div class="style-field">
                    <label>Opacity</label>
                    <input type="range" id="propOpacity" min="0" max="1" step="0.05" value="${s.opacity||1}">
                </div>
            </div>
        </div>`;
}

function imageProps(d) {
    return `
        <div class="prop-section">
            <div class="prop-section-header" onclick="toggleProp(this)">
                <span>Image</span><i class="fas fa-chevron-down"></i>
            </div>
            <div class="prop-section-body">
                <div class="style-field"><label>Image URL</label><input type="url" id="propSrc" value="${d.src||''}"></div>
                <button onclick="openMediaForEl()" style="padding:8px 14px;background:#000;color:#fff;border:none;border-radius:5px;cursor:pointer;font-size:11px;width:100%;">Choose from Media Library</button>
                <div class="style-field"><label>Alt Text</label><input type="text" id="propAlt" value="${d.alt||''}"></div>
                <div class="style-field"><label>Object Fit</label>
                    <select id="propFit">
                        <option value="cover"${d.objectFit==='cover'?' selected':''}>Cover</option>
                        <option value="contain"${d.objectFit==='contain'?' selected':''}>Contain</option>
                        <option value="fill"${d.objectFit==='fill'?' selected':''}>Fill</option>
                    </select>
                </div>
            </div>
        </div>`;
}

function videoProps(d) {
    return `
        <div class="prop-section">
            <div class="prop-section-header" onclick="toggleProp(this)">
                <span>Video</span><i class="fas fa-chevron-down"></i>
            </div>
            <div class="prop-section-body">
                <div class="style-field"><label>Video URL</label><input type="url" id="propSrc" value="${d.src||''}"></div>
                <div class="style-field"><label>Poster Image</label><input type="url" id="propPoster" value="${d.poster||''}"></div>
                <label style="font-size:11px;display:flex;align-items:center;gap:6px;margin-top:8px;">
                    <input type="checkbox" id="propAutoPlay"${d.autoPlay?' checked':''}> Autoplay
                </label>
                <label style="font-size:11px;display:flex;align-items:center;gap:6px;margin-top:4px;">
                    <input type="checkbox" id="propControls"${d.controls===false?'':' checked'}> Show Controls
                </label>
            </div>
        </div>`;
}

function buttonProps(d) {
    return `
        <div class="prop-section">
            <div class="prop-section-header" onclick="toggleProp(this)">
                <span>Button</span><i class="fas fa-chevron-down"></i>
            </div>
            <div class="prop-section-body">
                <div class="style-field"><label>Button Text</label><input type="text" id="propContent" value="${d.content||''}"></div>
                <div class="style-field"><label>Link URL</label><input type="text" id="propHref" value="${d.href||'#'}"></div>
            </div>
        </div>`;
}

function iconProps(d) {
    const s = d.styles || {};
    return `
        <div class="prop-section">
            <div class="prop-section-header" onclick="toggleProp(this)">
                <span>Icon</span><i class="fas fa-chevron-down"></i>
            </div>
            <div class="prop-section-body">
                <div class="style-field"><label>Icon</label>
                    <select id="propIcon">${iconOptions(d.iconClass)}</select></div>
                <div class="style-field"><label>Size</label><input type="text" id="propIconSize" value="${s.fontSize||'26px'}"></div>
                <div class="style-field"><label>Color</label>
                    <div class="color-row">
                        <input type="color" id="propIconClr" value="${s.color||'#000'}">
                        <input type="text" id="propIconClrTxt" value="${s.color||'#000'}">
                    </div>
                </div>
            </div>
        </div>`;
}

function iconOptions(selected) {
    const icons = ['star','heart','check','times','plus','minus','search','home','user','envelope','phone','cog','lock','key','bolt','fire','sun','moon','cloud','play','pause','camera','file','folder','code','rocket','lightbulb'];
    return icons.map(i => `<option value="fa-${i}"${selected===`fa-${i}`?' selected':''}>${i}</option>`).join('');
}

function socialProps(d) {
    return `
        <div class="prop-section">
            <div class="prop-section-header" onclick="toggleProp(this)">
                <span>Social Icons</span><i class="fas fa-chevron-down"></i>
            </div>
            <div class="prop-section-body">
                <div class="style-field"><label>Platforms</label>
                    <div style="display:flex;flex-wrap:wrap;gap:6px;">
                        ${['facebook','twitter','instagram','linkedin','youtube'].map(p =>
                            `<label style="display:flex;align-items:center;gap:3px;font-size:11px;"><input type="checkbox" class="soc-p" value="${p}"${(d.platforms||[]).includes(p)?' checked':''}>${p.charAt(0).toUpperCase()+p.slice(1)}</label>`
                        ).join('')}
                    </div>
                </div>
                <div class="style-field"><label>Size</label><input type="text" id="propSocSize" value="${d.size||'32px'}"></div>
                <div class="style-field"><label>Color</label>
                    <div class="color-row">
                        <input type="color" id="propSocClr" value="${d.color||'#666'}">
                        <input type="text" id="propSocClrTxt" value="${d.color||'#666'}">
                    </div>
                </div>
            </div>
        </div>`;
}

function mapProps(d) {
    return `
        <div class="prop-section">
            <div class="prop-section-header" onclick="toggleProp(this)">
                <span>Map</span><i class="fas fa-chevron-down"></i>
            </div>
            <div class="prop-section-body">
                <div class="style-field"><label>Location / Address</label><input type="text" id="propLoc" value="${d.location||''}"></div>
                <div class="style-field"><label>Zoom Level</label><input type="range" id="propZoom" min="1" max="20" value="${d.zoom||14}"></div>
            </div>
        </div>`;
}

function codeProps(d) {
    return `
        <div class="prop-section">
            <div class="prop-section-header" onclick="toggleProp(this)">
                <span>${d.type==='embed'?'Embed Code':'Custom Code'}</span><i class="fas fa-chevron-down"></i>
            </div>
            <div class="prop-section-body">
                <div class="style-field"><label>Code</label>
                    <textarea id="propCode" style="min-height:120px;font-family:monospace;font-size:11px;">${esc(d.code||'')}</textarea></div>
            </div>
        </div>`;
}

function accordionProps(d) {
    return `
        <div class="prop-section">
            <div class="prop-section-header" onclick="toggleProp(this)">
                <span>Accordion Items</span><i class="fas fa-chevron-down"></i>
            </div>
            <div class="prop-section-body" id="accItemsContainer">
                ${(d.items||[]).map((item,i) => `
                    <div style="margin-bottom:8px;padding:8px;background:#f7f7f7;border-radius:5px;">
                        <input type="text" value="${item.title}" placeholder="Title" class="acc-tit" data-i="${i}" style="width:100%;margin-bottom:4px;padding:5px 8px;border:1px solid #ddd;border-radius:4px;font-size:12px;">
                        <textarea placeholder="Content" class="acc-ctn" data-i="${i}" style="width:100%;min-height:36px;padding:5px 8px;border:1px solid #ddd;border-radius:4px;font-size:11px;">${item.content}</textarea>
                    </div>
                `).join('')}
                <button onclick="addAccItem()" style="padding:7px 14px;background:#f0f0f0;color:#666;border:none;border-radius:5px;cursor:pointer;font-size:11px;width:100%;">+ Add Item</button>
            </div>
        </div>`;
}

function tabsProps(d) {
    return `
        <div class="prop-section">
            <div class="prop-section-header" onclick="toggleProp(this)">
                <span>Tabs</span><i class="fas fa-chevron-down"></i>
            </div>
            <div class="prop-section-body">
                <div class="style-field"><label>Tab Names (comma separated)</label>
                    <input type="text" id="propTabs" value="${(d.tabs||[]).join(', ')}"></div>
            </div>
        </div>`;
}

function selectProps(d) {
    return `
        <div class="prop-section">
            <div class="prop-section-header" onclick="toggleProp(this)">
                <span>Dropdown Options</span><i class="fas fa-chevron-down"></i>
            </div>
            <div class="prop-section-body">
                <div class="style-field"><label>Options (one per line)</label>
                    <textarea id="propOpts" style="min-height:70px;">${(d.options||[]).join('\n')}</textarea></div>
                <div class="style-field"><label>Placeholder</label><input type="text" id="propPh" value="${d.placeholder||''}"></div>
            </div>
        </div>`;
}

function advancedProps(d) {
    return `
        <div class="prop-section">
            <div class="prop-section-header" onclick="toggleProp(this)">
                <span>Advanced</span><i class="fas fa-chevron-down"></i>
            </div>
            <div class="prop-section-body">
                <div class="style-field"><label>CSS Class</label><input type="text" id="propCls" value="${d.cssClass||''}"></div>
                <div class="style-field"><label>ID</label><input type="text" id="propId" value="${d.customId||''}"></div>
                <label style="font-size:11px;display:flex;align-items:center;gap:6px;">
                    <input type="checkbox" id="propHidden"${d.hidden?' checked':''}> Hidden
                </label>
                <div class="style-field"><label>Custom CSS</label>
                    <textarea id="propCss" style="min-height:50px;font-family:monospace;font-size:10px;">${d.customCss||''}</textarea></div>
            </div>
        </div>`;
}

// Toggle prop section
window.toggleProp = function(header) {
    header.classList.toggle('collapsed');
    header.nextElementSibling.classList.toggle('collapsed');
};

// Setup property listeners
function setupPropsListeners(d) {
    const el = VYS.selectedEl;
    if (!el || !d) return;
    
    // Position
    bindP('propX', v => { d.x=parseInt(v)||0; el.style.left=v+'px'; });
    bindP('propY', v => { d.y=parseInt(v)||0; el.style.top=v+'px'; });
    bindP('propW', v => { d.width=parseInt(v)||100; el.style.width=v+'px'; });
    bindP('propH', v => { d.height=parseInt(v)||50; el.style.height=v+'px'; });
    
    // Content
    bindP('propContent', v => {
        d.content=v;
        const c = el.querySelector('.el-content')||el.querySelector('h2')||el.querySelector('button')||el.querySelector('a');
        if(c)c.textContent=v;
    });
    
    // Link
    bindP('propHref', v => { d.href=v; });
    
    // Styles
    bindP('propFontSize', v => applyS(el,d,'fontSize',v));
    bindP('propFontWeight', v => applyS(el,d,'fontWeight',v));
    
    bindP('propColor', v => { applyS(el,d,'color',v); const t=document.getElementById('propColorTxt');if(t)t.value=v; });
    bindP('propColorTxt', v => { applyS(el,d,'color',v); const t=document.getElementById('propColor');if(t)t.value=v; });
    
    bindP('propBg', v => { applyS(el,d,'background',v); const t=document.getElementById('propBgTxt');if(t)t.value=v; });
    bindP('propBgTxt', v => { applyS(el,d,'background',v); const t=document.getElementById('propBg');if(t)t.value=v; });
    
    bindP('propRadius', v => applyS(el,d,'borderRadius',v));
    bindP('propPadding', v => applyS(el,d,'padding',v));
    bindP('propOpacity', v => applyS(el,d,'opacity',v));
    
    // Image
    bindP('propSrc', v => {
        d.src=v;
        const img=el.querySelector('img');
        if(img&&v)img.src=v;
        else if(v)el.innerHTML=`<img src="${v}" alt="${d.alt||''}">`;
    });
    bindP('propAlt', v => { d.alt=v; const img=el.querySelector('img'); if(img)img.alt=v; });
    bindP('propFit', v => { d.objectFit=v; const img=el.querySelector('img'); if(img)img.style.objectFit=v; });
    
    // Video
    bindP('propSrc', v => { d.src=v; }, true);
    bindP('propPoster', v => { d.poster=v; }, true);
    
    // Icon
    bindP('propIcon', v => {
        d.iconClass=v;
        const i=el.querySelector('i.fas');
        if(i)i.className='fas '+v;
    });
    bindP('propIconSize', v => applyS(el,d,'fontSize',v));
    bindP('propIconClr', v => { applyS(el,d,'color',v); const t=document.getElementById('propIconClrTxt');if(t)t.value=v; });
    
    // Map
    bindP('propLoc', v => { d.location=v; });
    bindP('propZoom', v => { d.zoom=parseInt(v); });
    
    // Code
    bindP('propCode', v => { d.code=v; });
    
    // Tabs
    bindP('propTabs', v => { d.tabs=v.split(',').map(s=>s.trim()); });
    
    // Advanced
    bindP('propCls', v => { d.cssClass=v; el.className=`c-el el-${d.type}${v?' '+v:''}`; });
    bindP('propId', v => { d.customId=v; if(v)el.id=v; else el.removeAttribute('id'); });
    
    const hiddenChk = document.getElementById('propHidden');
    if(hiddenChk) hiddenChk.addEventListener('change', e => { d.hidden=e.target.checked; el.style.display=e.target.checked?'none':''; });
    
    bindP('propCss', v => { d.customCss=v; });
    
    // Save on change
    document.querySelectorAll('#propsBody input,#propsBody textarea,#propsBody select').forEach(inp => {
        inp.addEventListener('change', () => { pushHistory(); saveToStorage(); });
    });
}

function bindP(id, handler, skip=false) {
    const el = document.getElementById(id);
    if(!el) return;
    if(skip && el._b) return;
    el._b=true;
    el.addEventListener('input', e=>handler(e.target.value));
    el.addEventListener('change', e=>handler(e.target.value));
}

function applyS(el, data, prop, val) {
    if(!data.styles)data.styles={};
    data.styles[prop]=val;
    el.style[prop]=val;
}

// Open media for element
window.openMediaForEl = function() {
    openPanel('media');
    window.mediaPickMode = true;
};

// Add accordion item
window.addAccItem = function() {
    const container = document.getElementById('accItemsContainer');
    const btn = container.querySelector('button');
    const idx = container.querySelectorAll('[class*="acc-tit"]').length;
    
    const div = document.createElement('div');
    div.style.cssText = 'margin-bottom:8px;padding:8px;background:#f7f7f7;border-radius:5px;';
    div.innerHTML = `
        <input type="text" value="" placeholder="Title" class="acc-tit" data-i="${idx}" style="width:100%;margin-bottom:4px;padding:5px 8px;border:1px solid #ddd;border-radius:4px;font-size:12px;">
        <textarea placeholder="Content" class="acc-ctn" data-i="${idx}" style="width:100%;min-height:36px;padding:5px 8px;border:1px solid #ddd;border-radius:4px;font-size:11px;"></textarea>`;
    container.insertBefore(div, btn);
};

// Close props panel
document.getElementById('closeProps').addEventListener('click', deselectEl);
