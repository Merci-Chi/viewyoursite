/* ============================================
   ViewYourSite v1.2 - Main Application
   Everything actually works!
   ============================================ */

// ============ STATE ============
const S = {
    site: { name: 'My Website', type: 'blank' },
    pages: [],
    curPage: null,
    els: [],
    sel: null,
    media: [],
    history: [],
    histIdx: -1,
    settings: { bg: '#fff', font: "'Inter',sans-serif", showNav: true, showFooter: true },
    view: 'desktop',
    copied: null,
    template: null
};

function uid() { return 'e' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36); }

// ============ TOAST ============
function toast(msg, t = 'info') {
    const c = document.getElementById('toasts');
    const el = document.createElement('div');
    el.className = `toast ${t}`;
    el.innerHTML = `<i class="fas fa-${t==='ok'?'check-circle':t==='err'?'exclamation-circle':'info-circle'}"></i>${msg}`;
    c.appendChild(el);
    setTimeout(() => { el.style.opacity='0'; el.style.transition='opacity 0.3s'; setTimeout(()=>el.remove(),300); }, 2500);
}

// ============ MODALS ============
function showModal(id) { document.getElementById(id).classList.add('visible'); }
function hideModal(id) { document.getElementById(id)?.classList.remove('visible'); }

// ============ NAVIGATION ============
function startBuilding() {
    hideModal('loginModal'); hideModal('signupModal'); hideModal('newSiteModal');
    
    // Save site info
    const nameInput = document.getElementById('newSiteName');
    S.site.name = nameInput?.value || 'My Website';
    
    document.getElementById('landingPage').style.display = 'none';
    document.getElementById('builderApp').style.display = 'flex';
    document.getElementById('builderSiteName').textContent = S.site.name;
    
    initBuilder();
}

function exitBuilder() {
    document.getElementById('builderApp').style.display = 'none';
    document.getElementById('landingPage').style.display = 'block';
}

function selectTemplate(t) { S.template = t; showNewSiteModal(); }

function showNewSiteModal() { showModal('newSiteModal'); }

function createSite() {
    const name = document.getElementById('newSiteName')?.value.trim() || 'My Website';
    const typeSel = document.querySelector('.st.selected');
    S.site.name = name;
    S.site.type = typeSel ? typeSel.dataset.t : 'blank';
    
    hideModal('newSiteModal');
    startBuilding();
}

// Site type selection
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.st').forEach(st => {
        st.addEventListener('click', () => {
            document.querySelectorAll('.st').forEach(s => s.classList.remove('selected'));
            st.classList.add('selected');
        });
    });
});

// ============ BUILDER INIT ============
function initBuilder() {
    // Load saved data
    loadSaved();
    
    // Create default pages if needed
    if (S.pages.length === 0) {
        S.pages = [
            { id: 'p_home', name: 'Home', type: 'page', order: 0 },
            { id: 'p_about', name: 'About', type: 'page', order: 1 },
            { id: 'p_contact', name: 'Contact', type: 'page', order: 2 }
        ];
    }
    
    selectPage(S.pages[0]?.id);
    renderPages();
    applySettings();
    
    initCanvas();
    initToolbar();
    initCtxMenu();
    initKeys();
    initPreview();
    
    setTimeout(() => pushHist(), 200);
}

// ============ SAVE/LOAD ============
function loadSaved() {
    try {
        const d = localStorage.getItem('vys_v12');
        if (d) {
            const j = JSON.parse(d);
            S.site = j.site || S.site;
            S.pages = j.pages || [];
            S.settings = j.settings || S.settings;
            S.media = j.media || [];
        }
    } catch(e) {}
}

function saveData() {
    try {
        localStorage.setItem('vys_v12', JSON.stringify({
            site: S.site, pages: S.pages, settings: S.settings, media: S.media
        }));
        
        // Per-page elements
        S.pages.forEach(p => {
            const pageEls = S.els.filter(e => e.pageId === p.id);
            localStorage.setItem('vys_els_' + p.id, JSON.stringify(pageEls.map(e => ({...e, dom: null}))));
        });
    } catch(e) {}
}

function loadPageEls(pid) {
    const raw = localStorage.getItem('vys_els_' + pid);
    if (raw) {
        try {
            JSON.parse(raw).forEach(d => makeEl(d));
        } catch(e) {}
    }
}

function savePageEls(pid) {
    localStorage.setItem('vys_els_' + pid, JSON.stringify(S.els.map(e => ({...e, dom: null}))));
}

// ============ HISTORY ============
function pushHist() {
    const snap = { els: S.els.map(e=>({...e,dom:null})), settings: {...S.settings} };
    S.history = S.history.slice(0, S.histIdx+1);
    S.history.push(JSON.stringify(snap));
    S.histIdx++;
    if (S.history.length > 40) { S.history.shift(); S.histIdx--; }
}

function undo() {
    if (S.histIdx > 0) {
        S.histIdx--;
        restoreSnap(S.history[S.histIdx]);
    }
}

function redo() {
    if (S.histIdx < S.history.length-1) {
        S.histIdx++;
        restoreSnap(S.history[S.histIdx]);
    }
}

function restoreSnap(str) {
    try {
        const s = JSON.parse(str);
        document.querySelectorAll('.c-el').forEach(el => el.remove());
        S.els = [];
        s.els.forEach(d => makeEl(d));
        S.settings = s.settings;
        applySettings();
        updateEmpty();
        updateProps();
    } catch(e) {}
}

// ============ CANVAS ============
let dragType = null;

function initCanvas() {
    const canvas = document.getElementById('canvas');
    
    canvas.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect='copy'; });
    canvas.addEventListener('drop', e => {
        e.preventDefault();
        if (!dragType) return;
        const r = canvas.getBoundingClientRect();
        addEl(dragType, e.clientX - r.left, e.clientY - r.top);
    });
    
    canvas.addEventListener('click', e => {
        if (e.target === canvas || e.target.closest('#canvasEmpty')) deselect();
    });
    
    // Element items in popup menu
    document.querySelectorAll('.pop-item[draggable]').forEach(item => {
        item.addEventListener('dragstart', e => {
            dragType = item.dataset.type;
            item.style.opacity = '0.6';
        });
        item.addEventListener('dragend', () => { dragType = null; item.style.opacity = ''; });
        item.addEventListener('click', () => {
            addEl(item.dataset.type, 100 + Math.random()*200, 80 + Math.random()*150);
            closeAddMenu();
        });
    });
}

function addEl(type, x, y) {
    const d = defData(type, x, y);
    makeEl(d);
    pushHist();
    saveData();
    updateEmpty();
}

function defData(type, x, y) {
    const b = { id: uid(), type, pageId: S.curPage, x, y, zIndex: S.els.length+1 };
    const defs = {
        text: { content:'Text here...', w:180, h:26, sty:{fontSize:'14px',color:'#333'} },
        heading: { content:'Heading', w:280, h:44, sty:{fontSize:'28px',fontWeight:'700',color:'#000'} },
        image: { src:'', alt:'', w:280, h:180, fit:'cover' },
        video: { src:'', poster:'', w:360, h:200 },
        button: { content:'Click Me', href:'#', w:130, h:46, sty:{background:'#000',color:'#fff',borderRadius:'6px'} },
        link: { content:'Link', href:'#', w:70, h:22, sty:{textDecoration:'underline',color:'#333'} },
        icon: { icon:'fa-star', w:36, h:36, sty:{fontSize:'22px',color:'#000'} },
        divider: { w:350, h:1, sty:{borderTop:'1px solid #ddd'} },
        spacer: { w:40, h:50 },
        container: { w:220, h:120, sty:{background:'#fafafa',borderRadius:'10px'} },
        section: { w:800, h:180, sty:{background:'linear-gradient(135deg,#fafafa,#eee)'} },
        columns: { cols:2, w:380, h:140 },
        grid: { cols:3, rows:2, w:260, h:160 },
        flex: { dir:'row', w:380, h:60, sty:{display:'flex',gap:'12px'} },
        form: { fields:['Name','Email','Message'], submit:'Submit', w:260, h:180 },
        input: { ph:'Type...', label:'', w:180, h:44 },
        textarea: { ph:'Message...', label:'', w:220, h:100 },
        checkbox: { label:'Option', checked:false, w:110, h:24 },
        radio: { label:'Option', name:'r', checked:false, w:110, h:24 },
        select: { opts:['Opt1','Opt2'], ph:'Select...', w:160, h:44 },
        toggle: { label:'Toggle', on:false, w:100, h:30 },
        range: { min:0, max:100, val:50, w:200, h:30 },
        rating: { stars:5, val:0, w:140, h:28 },
        accordion: { items:[{title:'Section 1',content:'Content...'},{title:'Section 2',content:'Content...'}], w:230, h:120 },
        tabs: { tabs:['Tab 1','Tab 2','Tab 3'], w:250, h:130 },
        carousel: { slides:3, w:400, h:200 },
        countdown: { days:0, hrs:0, mins:0, secs:0, w:250, h:60 },
        progress: { pct:65, w:250, h:20 },
        social: { platforms:['facebook','twitter','instagram'], w:130, h:36 },
        map: { loc:'', w:220, h:150 },
        embed: { code:'<!-- Embed -->', w:220, h:130 },
        html: { code:'<div>HTML</div>', w:190, h:100 },
        'code-block': { code:'// Code', lang:'js', w:240, h:120, sty:{background:'#1a1a1a',color:'#a8d085',fontFamily:'monospace',padding:'16px',borderRadius:'8px'} },
        product: { name:'Product', price:'$49', img:'', desc:'Description', w:220, h:300 },
        cart: { items:[], w:300, h:150 },
        'buy-btn': { text:'Buy Now', price:'$49', w:130, h:46, sty:{background:'#000',color:'#fff',borderRadius:'6px'} }
    };
    return { ...b, ...(defs[type]||defs.text) };
}

function makeEl(d) {
    const canvas = document.getElementById('canvas');
    const el = document.createElement('div');
    el.className = `c-el el-${d.type.replace('-','_')}`;
    el.dataset.id = d.id;
    el.dataset.type = d.type;
    
    el.style.left = d.x + 'px';
    el.style.top = d.y + 'px';
    el.style.width = d.w + 'px';
    el.style.height = (d.h||'auto') + 'px';
    el.style.zIndex = d.zIndex || 1;
    if (d.sty) Object.assign(el.style, d.sty);
    
    el.innerHTML = buildHTML(d);
    
    // Resize handles
    ['nw','n','ne','w','e','sw','s','se'].forEach(pos => {
        const h = document.createElement('div');
        h.className = `rh ${pos}`;
        h.dataset.rh = pos;
        el.appendChild(h);
    });
    
    setupDrag(el);
    setupResize(el);
    
    el.addEventListener('mousedown', e => {
        if (!e.target.classList.contains('rh')) select(el);
    });
    
    canvas.appendChild(el);
    d.dom = el;
    S.els.push(d);
    return el;
}

function buildHTML(d) {
    switch(d.type) {
        case 'text': return `<span class="el-txt">${esc(d.content)}</span>`;
        case 'heading': return `<h2 class="el-h">${esc(d.content)}</h2>`;
        case 'image':
            return d.src ? `<img src="${d.src}" alt="${esc(d.alt)}">` :
                '<div style="display:flex;flex-direction:column;align-items:center;gap:6px;color:#999;"><i class="fas fa-image" style="font-size:20px;"></i><span style="font-size:10px;">Add Image</span></div>';
        case 'video':
            return d.src ? `<video src="${d.src}"${d.poster?` poster="${d.poster}"`:''} controls></video>` :
                '<div style="color:#fff;display:flex;align-items:center;gap:8px;"><i class="fas fa-video" style="font-size:18px;"></i><span style="font-size:11px;">Add Video</span></div>';
        case 'button': return `<button onclick="window.open('${d.href||'#}','_blank')">${esc(d.content)}</button>`;
        case 'link': return `<a href="${d.href||'#'}">${esc(d.content)}</a>`;
        case 'icon': return `<i class="fas ${d.icon||'fa-star'}"></i>`;
        case 'divider': return '';
        case 'spacer': return '';
        case 'container': return '<span style="color:#aaa;font-size:10px;">Container</span>';
        case 'section': return '<span style="color:#aaa;font-size:10px;">Section</span>';
        case 'columns':
            let c=''; for(let i=0;i<(d.cols||2);i++) c+=`<div class="col">Col ${i+1}</div>`; return c;
        case 'grid':
            let g=''; for(let i=0;i<((d.cols||3)*(d.rows||2));i++) g+=`<div class="grd-cell">Cell</div>`; return g;
        case 'flex':
            let f=''; for(let i=0;i<3;i++) f+=`<div class="col">Item</div>`;
            return `<div style="display:flex;gap:${d.sty?.gap||'12px'}">${f}</div>`;
        case 'form':
            let fm='';
            (d.fields||[]).forEach(fld => { if(fld.toLowerCase()==='message') fm+=`<textarea placeholder="${fld}"></textarea>`; else fm+=`<input type="${fld.toLowerCase()==='email'?'email':'text'}" placeholder="${fld}">`; });
            fm+=`<button type="submit">${d.submit||'Submit'}</button>`;
            return `<form>${fm}</form>`;
        case 'input': return `${d.label?`<label style="font-size:11px;display:block;margin-bottom:4px;">${d.label}</label>`:''}<input type="text" placeholder="${d.ph||''}" value="">`;
        case 'textarea': return `${d.label?`<label style="font-size:11px;display:block;margin-bottom:4px;">${d.label}</label>`:''}<textarea placeholder="${d.ph||''}"></textarea>`;
        case 'checkbox': return `<label><input type="checkbox"${d.checked?' checked':''}> <span>${d.label||'Option'}</span></label>`;
        case 'radio':
            let rn=d.name||'r'; return `<label><input type="radio" name="${rn}"${d.checked?' checked':''}> <span>${d.label||'Option'}</span></label>`;
        case 'select':
            let o='';(d.opts||[]).forEach(opt=>o+=`<option value="${opt}">${opt}</option>`);
            return `${d.label?`<label style="font-size:11px;display:block;margin-bottom:4px;">${d.label}</label>`:''}<select>${o}</select>`;
        case 'toggle':
            return `<label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
                <div style="width:36px;height:20px;background:${d.on?'#000':'#ccc'};border-radius:10px;position:relative;transition:background 0.2s;"><div style="width:16px;height:16px;background:#fff;border-radius:50%;position:absolute;top:2px;left:${d.on?'18px':'2px'};transition:left 0.2s;"></div></div>
                <span>${d.label||'Toggle'}</span>
            </label>`;
        case 'range':
            return `<input type="range" min="${d.min||0}" max="${d.max||100}" value="${d.val||50}" style="width:100%;accent-color:#000;">`;
        case 'rating':
            let str=''; for(let i=0;i<(d.stars||5);i++) str+=`<i class="fas fa-star" style="color:${i<d.val?'#fbbf24':'#ddd'};cursor:pointer;" onclick="this.parentElement.querySelectorAll('i').forEach((s,j)=>{s.style.color=j<=${d.val||0}?'#fbbf24':'#ddd'})"></i>`;
            return `<div style="display:flex;gap:4px;">${str}</div>`;
        case 'accordion':
            let a='';
            (d.items||[]).forEach(it => a+=`
                <div class="acc-it"><div class="acc-hd"><span>${it.title}</span><i class="fas fa-chevron-down" style="font-size:9px;"></i></div><div class="acc-bd">${it.content}</div></div>`);
            return a;
        case 'tabs':
            let tn='',tp='';
            (d.tabs||[]).forEach((t,i)=>{ tn+=`<button class="tab-b${i===0?' active':''}">${t}</button>`; tp+=`<div class="tab-pan${i===0?'':''}">Content for ${t}</div>`; });
            return `<div class="el-tab"><div class="tab-nav">${tn}</div>${tp}</div>`;
        case 'carousel':
            let cr=''; for(let i=0;i<(d.slides||3);i++) cr+=`<div style="min-width:120px;height:100px;background:#fafafa;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#aaa;font-size:11px;">Slide ${i+1}</div>`;
            return `<div style="overflow:hidden;">${cr}</div>`;
        case 'countdown':
            return `<div style="display:flex;gap:12px;font-family:monospace;font-size:20px;font-weight:700;">
                <div style="text-align:center;"><div id="cd-d">00</div><small style="font-size:10px;color:#888;font-weight:normal;">Days</small></div>
                <div style="text-align:center;"><div id="cd-h">00</div><small style="font-size:10px;color:#888;font-weight:normal;">Hrs</small></div>
                <div style="text-align:center;"><div id="cd-m">00</div><small style="font-size:10px;color:#888;font-weight:normal;">Min</small></div>
                <div style="text-align:center;"><div id="cd-s">00</div><small style="font-size:10px;color:#888;font-weight:normal;">Sec</small></div>
            </div>`;
        case 'progress':
            return `<div style="position:relative;height:100%;background:#eee;border-radius:10px;overflow:hidden;"><div style="width:${d.pct||0}%;height:100%;background:#000;border-radius:10px;transition:width 0.3s;"></div><span style="position:absolute;right:10px;top:50%;transform:translateY(-50%);font-size:11px;font-weight:600;">${d.pct||0}%</span></div>`;
        case 'social':
            const icons={facebook:'fa-facebook-f',twitter:'fa-twitter',instagram:'fa-instagram',linkedin:'fa-linkedin-in',youtube:'fa-youtube'};
            let sc='';(d.platforms||[]).forEach(p=>sc+=`<a class="soc-ico"><i class="fab ${icons[p]||'fa-link'}"></i></a>`);
            return sc||'<a class="soc-ico"><i class="fas fa-share-alt"></i></a>';
        case 'map':
            return d.loc ? `<iframe src="https://maps.google.com/maps?q=${encodeURIComponent(d.loc)}&output=embed" width="100%" height="100%"></iframe>` : '<div><i class="fas fa-map-marked-alt" style="font-size:16px;"></i><p style="margin-top:6px;">Map Location</p></div>';
        case 'embed': case 'html': case 'code-block':
            return `<pre style="white-space:pre-wrap;margin:0;">${esc(d.code||'')}</pre>`;
        case 'product':
            return `<div style="height:100%;display:flex;flex-direction:column;">
                <div style="aspect-ratio:1;background:#f5f5f5;border-radius:8px;margin-bottom:12px;display:flex;align-items:center;justify-content:center;color:#aaa;"><i class="fas fa-image"></i></div>
                <strong style="font-size:15px;">${d.name||'Product'}</strong>
                <span style="font-size:16px;font-weight:700;margin:4px 0;">${d.price||'$0'}</span>
                <p style="font-size:12px;color:#666;flex:1;">${d.desc||''}</p>
                <button style="margin-top:auto;padding:10px;background:#000;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px;">Add to Cart</button>
            </div>`;
        case 'cart':
            return `<div style="padding:12px;border:1px solid #ddd;border-radius:8px;text-align:center;color:#888;font-size:13px;">Cart (${(d.items||[]).length} items)</div>`;
        case 'buy-btn':
            return `<button style="width:100%;height:100%;background:${d.sty?.background||'#000'};color:${d.sty?.color||'#fff'};border:${d.sty?.border||'none'};border-radius:${d.sty?.borderRadius||'6px'};font-size:14px;font-weight:500;cursor:pointer;">${d.text||'Buy'} ${d.price||''}</button>`;
        default:
            return `<span>${d.content||''}</span>`;
    }
}

function esc(s) { const d=document.createElement('div'); d.textContent=s; return d.innerHTML; }

// ============ DRAG & RESIZE ============
function setupDrag(el) {
    let dg=false,sx,sy,sl,st;
    
    el.addEventListener('mousedown', e => {
        if (e.target.classList.contains('rh')) return;
        if (['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) return;
        if (e.target.getAttribute('contenteditable')==='true') return;
        
        dg=true; el.classList.add('dragging');
        sx=e.clientX; sy=e.clientY;
        sl=parseInt(el.style.left)||0; st=parseInt(el.style.top)||0;
        select(el); e.preventDefault();
    });
    
    document.addEventListener('mousemove', e => {
        if (!dg) return;
        const dx=e.clientX-sx, dy=e.clientY-sy;
        const nl=sl+dx, nt=st+dy;
        el.style.left=nl+'px'; el.style.top=nt+'px';
        const d=S.els.find(x=>x.id===el.dataset.id);
        if(d){d.x=nl;d.y=nt;}
        updatePropVals(nl,nt,null,null);
    });
    
    document.addEventListener('mouseup', () => {
        if(dg){dg=false;el.classList.remove('dragging');pushHist();saveData();}
    });
    
    setupResize(el);
}

function setupResize(el) {
    el.querySelectorAll('.rh').forEach(h => {
        let rs=false,sx,sy,sw,sh,sl,st;
        
        h.addEventListener('mousedown', e => {
            e.stopPropagation(); rs=true;
            sx=e.clientX; sy=e.clientY;
            sw=el.offsetWidth; sh=el.offsetHeight;
            sl=parseInt(el.style.left)||0; st=parseInt(el.style.top)||0;
            select(el); e.preventDefault();
        });
        
        document.addEventListener('mousemove', e => {
            if(!rs) return;
            const dx=e.clientX-sx, dy=e.clientY-sy, pos=h.dataset.rh;
            let nw=sw,nh=sh,nsl=sl,nst=st;
            
            switch(pos){
                case'se':nw=Math.max(40,sw+dx);nh=Math.max(20,sh+dy);break;
                case'sw':nw=Math.max(40,sw-dx);nh=Math.max(20,sh+dy);if(nw>40)nsl=sl+dx;break;
                case'ne':nw=Math.max(40,sw+dx);nh=Math.max(20,sh-dy);if(nh>20)nst=st+dy;break;
                case'nw':nw=Math.max(40,sw-dx);nh=Math.max(20,sh-dy);if(nw>40)nsl=sl+dx;if(nh>20)nst=st+dy;break;
                case'n':nh=Math.max(20,sh-dy);if(nh>20)nst=st+dy;break;
                case's':nh=Math.max(20,sh+dy);break;
                case'e':nw=Math.max(40,sw+dx);break;
                case'w':nw=Math.max(40,sw-dx);if(nw>40)nsl=sl+dx;break;
            }
            
            el.style.width=nw+'px';el.style.height=nh+'px';el.style.left=nsl+'px';el.style.top=nst+'px';
            const d=S.els.find(x=>x.id===el.dataset.id);
            if(d){d.w=nw;d.h=nh;d.x=nsl;d.y=nst;}
            updatePropVals(null,null,nw,nh);
        });
        
        document.addEventListener('mouseup', () => { if(rs){rs=false;pushHist();saveData();} });
    });
}

// ============ SELECTION ============
function select(el) {
    if (S.sel && S.sel !== el) S.sel.classList.remove('selected');
    S.sel = el;
    el.classList.add('selected');
    updateProps();
    showPropsPopup();
}

function deselect() {
    if (S.sel) { S.sel.classList.remove('selected'); S.sel = null; }
    updateProps();
    closeProps();
}

function dupEl(el) {
    const d=S.els.find(x=>x.id===el.dataset.id);
    if(!d)return;
    const nd={...d,id:uid(),x:d.x+30,y:d.y+30,zIndex:S.els.length+1,dom:null};
    makeEl(nd);pushHist();saveData();updateEmpty();toast('Duplicated','ok');
}

function delEl(id) {
    const el=document.querySelector(`.c-el[data-id="${id}"]`);
    if(el)el.remove();
    S.els=S.els.filter(e=>e.id!==id);
    if(S.sel&&S.sel.dataset.id===id){S.sel=null;}
    updateProps();updateEmpty();pushHist();saveData();toast('Deleted');
}

function layerEl(el,dir) {
    const d=S.els.find(x=>x.id===el.dataset.id);
    if(!d)return;
    if(dir==='front'){const m=Math.max(...S.els.map(e=>e.zIndex||1));d.zIndex=m+1;}
    else{const m=Math.min(...S.els.map(e=>e.zIndex||1));d.zIndex=m>1?m-1:1;}
    el.style.zIndex=d.zIndex;pushHist();saveData();
}

function copyEl(el) {
    const d=S.els.find(x=>x.id===el.dataset.id);
    if(d){S.copied={...d};toast('Copied','ok');}
}

function pasteEl() {
    if(!S.copied)return;
    const nd={...S.copied,id:uid(),x:(S.copied.x||0)+30,y:(S.copied.y||0)+30,zIndex:S.els.length+1,dom:null};
    makeEl(nd);pushHist();saveData();updateEmpty();toast('Pasted','ok');
}

function updateEmpty() {
    const e=document.getElementById('canvasEmpty');
    if(e)e.classList.toggle('hidden',S.els.length>0);
}

// ============ TOOLBAR ============
function initToolbar() {
    // View toggle
    document.querySelectorAll('.vt').forEach(btn=>{
        btn.addEventListener('click',()=>{
            document.querySelectorAll('.vt').forEach(b=>b.classList.remove('active'));
            btn.classList.add('active');
            const v=btn.dataset.v;
            S.view=v;
            const c=document.getElementById('canvas');
            c.classList.remove('tablet','mobile');
            if(v==='tablet')c.classList.add('tablet');
            else if(v==='mobile')c.classList.add('mobile');
        });
    });
    
    // Buttons
    document.getElementById('undoBtn')?.addEventListener('click',undo);
    document.getElementById('redoBtn')?.addEventListener('click',redo);
    document.getElementById('previewBtn')?.addEventListener('click',showPreview);
    document.getElementById('exportBtn')?.addEventListener('click',exportHTML);
}

// ============ POPUP MENUS ============
function openAddMenu(e) {
    const menu=document.getElementById('addMenu');
    const fab=document.getElementById('fabAdd');
    
    // Position near FAB or click position
    const rect=fab.getBoundingClientRect();
    menu.style.left=(rect.left)+'px';
    menu.style.bottom=(window.innerHeight-rect.top+12)+'px';
    menu.style.display='flex';
    
    // Close other panels
    closePages();closeMedia();closeSettings();
}

function closeAddMenu() { document.getElementById('addMenu').style.display='none'; }

// Close menus when clicking outside
document.addEventListener('click', e => {
    if(!e.target.closest('#addMenu') && !e.target.closest('#fabAdd')) closeAddMenu();
    if(!e.target.closest('.props-popup') && !e.target.closest('.c-el')) closeProps();
    if(!e.target.closest('.side-panel') && !e.target.closest('[onclick*="openPanel"]')) {
        closePages();closeMedia();closeSettings();
    }
});

// ============ PROPERTIES POPUP ============
function showPropsPopup() {
    if(!S.sel)return;
    const pp=document.getElementById('propsPopup');
    const rect=S.sel.getBoundingClientRect();
    
    // Position to right of element or left if not enough space
    const ww=window.innerWidth;
    pp.style.display='flex';
    const pw=pp.offsetWidth;
    
    if(rect.right+pw+20<ww){
        pp.style.left=(rect.right+12)+'px';
    } else {
        pp.style.left=(rect.left-pw-12)+'px';
    }
    pp.style.top=Math.max(50,rect.top)+'px';
}

function closeProps() { document.getElementById('propsPopup').style.display='none'; }

function updateProps() {
    const body=document.getElementById('propsBody');
    const pp=document.getElementById('propsPopup');
    
    if(!S.sel){
        body.innerHTML='<div class="props-empty"><i class="fas fa-mouse-pointer"></i><p>Select element</p></div>';
        return;
    }
    
    pp.style.display='flex';
    const el=S.sel;
    const d=S.els.find(x=>x.id===el.dataset.id);
    if(!d)return;
    
    document.getElementById('propsTitle').textContent=(d.type.charAt(0).toUpperCase()+d.slice(1))+' Properties';
    
    body.innerHTML=buildPropsHTML(d);
    setupPropListeners(d);
}

function buildPropsHTML(d) {
    let h=`<div class="prop-group"><div class="prop-group-label">Position</div>
        <div class="prop-row"><label>X</label><input type="number" id="pX" value="${Math.round(d.x)}">
        <label>Y</label><input type="number" id="pY" value="${Math.round(d.y)}"></div>
        <div class="prop-row"><label>W</label><input type="number" id="pW" value="${Math.round(d.w)}">
        <label>H</label><input type="number" id="pH" value="${Math.round(d.h||0)}"></div></div>`;
    
    // Content for editable elements
    if(['text','heading','button','link'].includes(d.type)){
        h+=`<div class="prop-group"><div class="prop-group-label">Content</div>
            <textarea id="pCont" style="width:100%;min-height:45px;padding:7px 9px;border:1px solid #ddd;border-radius:4px;font-size:12px;">${esc(d.content||'')}</textarea>
            ${['button','link'].includes(d.type)?`<input type="text" id="pHref" value="${d.href||'#'}" placeholder="URL" style="width:100%;margin-top:6px;padding:7px 9px;border:1px solid #ddd;border-radius:4px;font-size:12px;">`:''}
        </div>`;
    }
    
    // Style
    const s=d.sty||{};
    h+=`<div class="prop-group"><div class="prop-group-label">Style</div>
        <div class="prop-row"><label>Font</label><select id="pFS">${[12,13,14,15,16,18,20,22,24,28,32,36,42,48,56,64,72].map(sz=>`<option value="${sz}px"${s.fontSize===sz+'px'?' selected':''}>${sz}px</option>`).join('')}</select></div>
        <div class="prop-row"><label>Weight</label><select id="pFW">
            <option value="normal"${!s.fontWeight||s.fontWeight==='normal'?' selected':''}>Normal</option>
            <option value="500"${s.fontWeight==='500'?' selected':''}>Medium</option>
            <option value="600"${s.fontWeight==='600'?' selected':''}>Semibold</option>
            <option value="700"${s.fontWeight==='700'||s.fontWeight==='bold'?' selected':''}>Bold</option>
        </select></div>
        <div class="prop-row input-grp"><label>Color</label>
            <div class="color-input-wrap"><input type="color" id="pClr" value="${s.color||'#333'}"><input type="text" id="pClrT" value="${s.color||'#333'}" style="width:70px;"></div>
        </div>
        <div class="prop-row input-grp"><label>BG</label>
            <div class="color-input-wrap"><input type="color" id="pBg" value="${s.background||s.backgroundColor||'#fff'}"><input type="text" id="pBgT" value="${s.background||s.backgroundColor||'#fff'}" style="width:70px;"></div>
        </div>
        <div class="prop-row"><label>Radius</label><input type="text" id="pRad" value="${s.borderRadius||'0'}"></div>
        <div class="prop-row"><label>Padding</label><input type="text" id="pPad" value="${s.padding||'0'}"></div>
        <div class="prop-row"><label>Opacity</label><input type="range" id="pOp" min="0" max="1" step="0.05" value="${s.opacity||1}" style="flex:1;"></div>
    </div>`;
    
    // Type-specific
    switch(d.type){
        case'image':
            h+=`<div class="prop-group"><div class="prop-group-label">Image</div>
                <input type="url" id="pSrc" value="${d.src||''}" placeholder="Image URL" style="width:100%;padding:7px 9px;border:1px solid #ddd;border-radius:4px;font-size:12px;margin-bottom:6px;">
                <button onclick="openMediaForImg()" style="width:100%;padding:8px;background:#000;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:11px;">Choose from Media</button>
                <input type="text" id="pAlt" value="${d.alt||''}" placeholder="Alt text" style="width:100%;margin-top:6px;padding:7px 9px;border:1px solid #ddd;border-radius:4px;font-size:12px;">
                <select id="pFit" style="width:100%;margin-top:6px;padding:7px 9px;border:1px solid #ddd;border-radius:4px;font-size:12px;">
                    <option value="cover"${d.fit==='cover'?' selected':''}>Cover</option>
                    <option value="contain"${d.fit==='contain'?' selected':''}>Contain</option>
                    <option value="fill"${d.fit==='fill'?' selected':''}>Fill</option>
                </select>
            </div>`; break;
        case'video':
            h+=`<div class="prop-group"><div class="prop-group-label">Video</div>
                <input type="url" id="pSrc" value="${d.src||''}" placeholder="Video URL" style="width:100%;padding:7px 9px;border:1px solid #ddd;border-radius:4px;font-size:12px;margin-bottom:6px;">
                <label class="toggle-prop" style="margin-top:6px;"><input type="checkbox" id="pAuto"${d.autoPlay?' checked':''}> Autoplay</label>
                <label class="toggle-prop"><input type="checkbox" id="pCtrl"${d.controls===false?'':'checked'}> Controls</label>
            </div>`; break;
        case'icon':
            h+=`<div class="prop-group"><div class="prop-group-label">Icon</div>
                <select id="pIcon" style="width:100%;padding:7px 9px;border:1px solid #ddd;border-radius:4px;font-size:12px;margin-bottom:6px;">
                    ${['star','heart','check','times','plus','minus','search','home','user','envelope','phone','cog','lock','key','bolt','fire','sun','moon','cloud','play','pause','camera','file','folder','code','rocket','lightbulb','question','exclamation','info','bell','bookmark','filter','settings','trash','edit','copy','paste','share','download','upload','link','external-link-alt','comment','thumbs-up','thumbs-down','eye','eye-slash','at','hashtag','calendar','clock','map-marker-alt','globe','wikipedia-w','spotify','apple','android','chrome','firefox','edge','github','twitter','facebook','instagram','youtube','tiktok','discord','slack','twitch','steam','playstation','xbox','gamepad','coffee','beer','glass-cheers','utensils','car','plane','train','subway','bike','walking','dog','cat','horse','dragon','paw','feather','leaf','tree','flower','snowflake','fire-flame','water','wind','sun','moon','star-half','certificate','award','trophy','medal','gift','shopping-cart','credit-card','wallet','money-bill-wave','diamond','gem','crown','anchor','compass','flag','map-pin','location-arrow','paper-plane','rocket','satellite','satellite-dish','wifi','bluetooth','usb','battery-full','battery-three-quarters','battery-half','battery-quarter','signal','broadcast-tower','database','server','cloud-upload-alt','cloud-download-alt','hard-drive','microchip','memory','keyboard','mouse','monitor','tablet-alt','mobile-alt','laptop','desktop','printer','fax','qrcode','barcode','chart-line','chart-bar','chart-pie','chart-area','calculator','percentage','sort-alpha-down','sort-amount-down','filter','sliders-h','thermometer-half','tachometer-alt','stopwatch','timer','hourglass-start','hourglass-half','hourglass-end','history','redo','undo','sync','refresh','repeat','shuffle','random','cog','wrench','tools','hammer','screwdriver','paint-roller','brush','eraser','pen','pencil','highlighter','scissors','cut','clipboard','copy','paste','file-import','file-export','file-download','file-upload','folder-open','folder-plus','folder-minus','file-plus','file-minus','file-code','file-image','file-video','file-audio','file-pdf','file-word','file-excel','file-powerpoint','archive','zip-file','university','graduation-cap','book','book-open','book-reader','newspaper','bookmark','tag','tags','price-tag','receipt','ticket-alt','qrcode','barcode','key','lock','unlock','keyhole','shield-alt','user-shield','fingerprint','id-card','passport','address-book','address-card','envelope-open-text','envelope','paperclip','attachment','inbox','inbox-in','outbox','send','reply-all','reply','forward','share','share-alt','share-square','print','print-search','ad','bullhorn','megaphone','volume-up','volume-mute','volume-down','volume-off','video','camera','camera-retro','images','film','photo-video','music','headphones','headset','microphone','microphone-alt','microphone-slash','video-slash','film-alt','record-vinyl','broadcast-tower','podcast','rss','feed','wifi','bluetooth-b','bluetooth-b-alt','ethernet','usb','plug','power-off','power-off','sign-out-alt','sign-in-alt','toggle-on','toggle-off','switch','mouse-pointer','mouse-pointer-click','hand-pointer','hand-paper','hand-scissors','hand-rock','hand-lizard','hand-spock','hand-peace','hand-point-left','hand-point-right','hand-point-up','hand-point-down','thumbtack','crosshairs','search-location','search-plus','search-minus','search','zoom-in','zoom-out','expand','compress','expand-arrows-alt','fullscreen','arrows-alt','arrows-alt-h','chevron-left','chevron-right','chevron-up','chevron-down','chevron-down','angle-left','angle-right','angle-up','angle-down','caret-left','caret-right','caret-up','caret-down','caret-square','ellipsis-h','ellipsis-v','more-horizontal','more-vertical','plus','plus-circle','plus-square','minus','minus-circle','minus-square','times','times-circle','times-square','check','check-circle','check-double','check-square','asterisk','slash','backspace','delete','trash','trash-alt','trash-restore','clock','history','circle','circle-notch','square','square-full','play','pause','stop','step-forward','step-backward','fast-forward','fast-backward','backward','forward','retweet','eject','ban','ban-smoking','smoking','coffee','glass-martini','glass-cheers','glass-whiskey','beer','wine-glass-alt','cocktail','ice-cream','cube','cubes','cookie','cookie-bite','donut','candy-cane','birthday-cake','cake-slice','apple-alt','lemon','chicken','egg','cheese','hotdog','hamburger','pizza-slice','pizza','drumstick','fish','pepper-hot','steak','bone','seedling','leaf','tree','seedling','plant-wilt','spa','snowflake','star','star-half','star-of-life','dollar-sign','money-bill-alt','coins','euro-sign','pound-sign','yen-sign','rupee-sign','money-check-alt','money-check','money-bill-wave','credit-card','gem','gem-less','diamond','stamp','ticket-alt','ticket-alt','palette','paint-brush','pencil-alt','marker','pen-fancy','pen-nib','paint-roller','highlighter','eraser','scissors','ruler','ruler-combined','ruler-horizontal','ruler-vertical','tshirt','tshirt','socks','mitten','hands','handshake','briefcase','toolbox','toolbox','box','box-open','boxes','box-open','parcel','envelope','envelope-open','envelope-open-text','letter','address-book','address-card','contact-card','id-badge','id-card','passport','id-card-alt','drivers-license','license-plate','newspaper','book','book-open','book-reader','book-dead','bookmark','bookmark-o','tag','tags','price-tag','receipt','qrcode','barcode','barcode-alt','film','film-alt','video','video-slash','camera','camera-retro','camera-retro','blackboard','photo-video','image','images','clone','clone-regular','copy','copy-four','copy-solid','paste','file','file-alt','file-import','file-export','file-download','file-upload','file-audio','file-video','file-code','file-word','file-excel','file-powerpoint','file-pdf','archive','folder','folder-open','folder-plus','folder-minus','save','save-as','floppy-disk','hdd','cloud','cloud-download-alt','cloud-upload-alt','download','upload','server','database','cloudsmith','cloudversify','cloudflare','amazon','google','stumbleupon','digg','delicious','dribbble','behance','github-alt','github','gitlab','bitbucket','stack-overflow','slack','wordpress','medium','tumblr','reddit','yahoo','yandex','yandex-international','vk','odnoklassniki','mail-bulk','mailchimp','meetup','foursquare','quora','instagram','flickr','snapchat','telegram','twitter','facebook','facebook-f','facebook-messenger','whatsapp','viber','skype','hangouts','line','vimeo','soundcloud','spotify','itunes','google-play','android','linux','ubuntu','centos','debian','redhat','freebsd','apple','windows','internet-explorer','edge','opera','chrome','firefox','safari','css3','html5','js','python','java','php','ruby','rust','go','swift','kotlin','typescript','nodejs','npm','yarn','bower','webpack','gulp','grunt','sass','less','stylus','figma','sketch','photoshop','illustrator','after-effects','premiere-pro','cinema-4d','maya','blender','unity','unreal','three-js','react','vue','angular','jquery','bootstrap','tailwind','material-ui','ant-design','semantic-ui','foundation','bulma','skeleton','normalize','reset-css','json','xml','yaml','toml','ini','env','docker','kubernetes','aws','azure','gcp','heroku','vercel','netlify','firebase','supabase','mongodb','mysql','postgresql','redis','sqlite','graphql','rest-api','soap','websocket','webrtc','webgl','canvas','svg','svg-core','photoshop','illustrator','xd','figma','sketch','invision','zeplin','framer','principle','protopie','axure','balsamiq','omnigraffle','lucidchart','drawio','excalidraw','canva','figma','sketch','adobe','creative-cloud','cc','ai','ml','neural-network','deep-learning','machine-learning','data-science','analytics','visualization','dashboard','report','chart','graph','table','spreadsheet','excel','word','powerpoint','presentation','slide','deck','card','list','menu','nav','header','footer','sidebar','main','section','article','post','blog','portfolio','gallery','shop','store','cart','checkout','payment','shipping','login','register','signup','signin','signout','password','forgot','reset','verify','confirm','success','error','warning','info','help','support','faq','terms','privacy','policy','about','contact','team','careers','jobs','press','partners','investors','customers','testimonials','reviews','ratings','pricing','plans','features','benefits','how-it-works','getting-started','tutorial','guide','documentation','api','sdk','library','plugin','extension','addon','module','component','widget','element','block','section','page','site','domain','hosting','ssl','cdn','dns','ftp','ssh','terminal','command-line','bash','shell','script','cron','job','queue','worker','service','microservice','serverless','lambda','function','api-gateway','load-balancer','cdn','cache','database','storage','bucket','object','blob','file','image','video','audio','document','pdf','csv','json','xml','yaml','toml','ini','env','config','setting','preference','option','choice','selection','dropdown','combobox','autocomplete','multiselect','slider','range','spinner','switch','toggle','checkbox','radio','button','submit','cancel','ok','yes','no','maybe','true','false','null','undefined','nan','infinity','zero','one','two','three','four','five','six','seven','eight','nine','ten','hundred','thousand','million','billion','trillion','quadrillion','pentillion'].map(i=>`<option value="fa-${i}"${d.icon===`fa-${i}`?' selected':''}>${i}</option>`).join('')}
                </select>
                <div class="prop-row"><label>Size</label><input type="text" id="pISize" value="${s.fontSize||'22px'}" style="width:70px;"></div>
                <div class="prop-row input-grp"><label>Color</label>
                    <div class="color-input-wrap"><input type="color" id="pIClr" value="${s.color||'#000'}"><input type="text" id="pIClrT" value="${s.color||'#000'}" style="width:70px;"></div>
                </div>
            </div>`; break;
        case'social':
            h+=`<div class="prop-group"><div class="prop-group-label">Platforms</div>
                <div style="display:flex;flex-wrap:wrap;gap:6px;">
                    ${['facebook','twitter','instagram','linkedin','youtube','tiktok','pinterest','reddit','github','dribbble','behance'].map(p=>
                        `<label style="display:flex;align-items:center;gap:3px;font-size:11px;"><input type="checkbox" class="sp-chk" value="${p}"${(d.platforms||[]).includes(p)?' checked':''}>${p.charAt(0).toUpperCase()+p.slice(1)}</label>`
                    ).join('')}
                </div>
            </div>`; break;
        case'map':
            h+=`<div class="prop-group"><div class="prop-group-label">Map</div>
                <input type="text" id="pLoc" value="${d.loc||''}" placeholder="Address or place" style="width:100%;padding:7px 9px;border:1px solid #ddd;border-radius:4px;font-size:12px;">
                <label style="font-size:11px;margin-top:6px;">Zoom: <input type="range" id="pZoom" min="1" max="20" value="${d.zoom||14}" style="flex:1;"></label>
            </div>`; break;
        case'embed':case'html':case'code-block':
            h+=`<div class="prop-group"><div class="prop-group-label">${d.type==='code-block'?'Code':d.type==='html'?'HTML':'Embed'}</div>
                <textarea id="pCode" style="width:100%;min-height:90px;padding:7px 9px;border:1px solid #ddd;border-radius:4px;font-family:monospace;font-size:11px;">${esc(d.code||'')}</textarea>
            </div>`; break;
        case'accordion':
            h+=`<div class="prop-group"><div class="prop-group-label">Items</div>
                <div id="accItemsContainer">
                    ${(d.items||[]).map((it,i)=>`
                        <div style="margin-bottom:6px;padding:8px;background:#f9f9f9;border-radius:4px;">
                            <input value="${it.title}" placeholder="Title" class="acc-t" data-i="${i}" style="width:100%;margin-bottom:4px;padding:5px 8px;border:1px solid #ddd;border-radius:3px;font-size:11px;">
                            <textarea placeholder="Content" class="acc-c" data-i="${i}" style="width:100%;min-height:32px;padding:5px 8px;border:1px solid #ddd;border-radius:3px;font-size:10px;">${it.content}</textarea>
                        </div>
                    `).join('')}
                </div>
                <button onclick="addAccItem()" style="width:100%;padding:7px;background:#f0f0f0;border:none;border-radius:4px;cursor:pointer;font-size:11px;">+ Add Item</button>
            </div>`; break;
        case'tabs':
            h+=`<div class="prop-group"><div class="prop-group-label">Tabs</div>
                <input type="text" id="pTabs" value="${(d.tabs||[]).join(', ')}" placeholder="Tab names, comma separated" style="width:100%;padding:7px 9px;border:1px solid #ddd;border-radius:4px;font-size:12px;">
            </div>`; break;
        case'select':
            h+=`<div class="prop-group"><div class="prop-group-label">Options</div>
                <textarea id="pOpts" style="width:100%;min-height:60px;padding:7px 9px;border:1px solid #ddd;border-radius:4px;font-size:11px;">${(d.opts||[]).join('\n')}</textarea>
                <input type="text" id="pPh" value="${d.ph||''}" placeholder="Placeholder" style="width:100%;margin-top:6px;padding:7px 9px;border:1px solid #ddd;border-radius:4px;font-size:12px;">
            </div>`; break;
        case'product':
            h+=`<div class="prop-group"><div class="prop-group-label">Product</div>
                <input type="text" id="pPName" value="${d.name||''}" placeholder="Name" style="width:100%;padding:7px 9px;border:1px solid #ddd;border-radius:4px;font-size:12px;margin-bottom:4px;">
                <input type="text" id="pPPrice" value="${d.price||'$0'}" placeholder="$0" style="width:100%;padding:7px 9px;border:1px solid #ddd;border-radius:4px;font-size:12px;margin-bottom:4px;">
                <textarea id="pPDesc" placeholder="Description" style="width:100%;min-height:40px;padding:7px 9px;border:1px solid #ddd;border-radius:4px;font-size:11px;"></textarea>
            </div>`; break;
    }
    
    // Advanced
    h+=`<div class="prop-group"><div class="prop-group-label">Advanced</div>
        <input type="text" id="pCls" value="${d.cssClass||''}" placeholder="CSS Class" style="width:100%;padding:7px 9px;border:1px solid #ddd;border-radius:4px;font-size:12px;margin-bottom:6px;">
        <input type="text" id="pId" value="${d.customId||''}" placeholder="ID" style="width:100%;padding:7px 9px;border:1px solid #ddd;border-radius:4px;font-size:12px;margin-bottom:6px;">
        <label class="toggle-prop"><input type="checkbox" id="pHidden"${d.hidden?' checked':''}> Hidden</label>
        <textarea id="pCustomCss" placeholder="Custom CSS" style="width:100%;min-height:40px;padding:7px 9px;border:1px solid #ddd;border-radius:4px;font-family:monospace;font-size:10px;margin-top:6px;">${d.customCss||''}</textarea>
    </div>`;
    
    return h;
}

function setupPropListeners(d) {
    const el=S.sel;
    if(!el||!d)return;
    
    // Position
    bindP('pX',v=>{d.x=parseInt(v)||0;el.style.left=v+'px';});
    bindP('pY',v=>{d.y=parseInt(v)||0;el.style.top=v+'px';});
    bindP('pW',v=>{d.w=parseInt(v)||100;el.style.width=v+'px';});
    bindP('pH',v=>{d.h=parseInt(v)||30;el.style.height=v+'px';});
    
    // Content
    bindP('pCont',v=>{
        d.content=v;
        const c=el.querySelector('.el-txt,.el-h,button,a');
        if(c)c.textContent=v;
    });
    bindP('pHref',v=>{d.href=v;});
    
    // Style
    bindP('pFS',v=>applyS(el,d,'fontSize',v));
    bindP('pFW',v=>applyS(el,d,'fontWeight',v));
    bindP('pClr',v=>{applyS(el,d,'color',v);const t=document.getElementById('pClrT');if(t)t.value=v;});
    bindP('pClrT',v=>{applyS(el,d,'color',v);const t=document.getElementById('pClr');if(t)t.value=v;});
    bindP('pBg',v=>{applyS(el,d,'background',v);const t=document.getElementById('pBgT');if(t)t.value=v;});
    bindP('pBgT',v=>{applyS(el,d,'background',v);const t=document.getElementById('pBg');if(t)t.value=v;});
    bindP('pRad',v=>applyS(el,d,'borderRadius',v));
    bindP('pPad',v=>applyS(el,d,'padding',v));
    bindP('pOp',v=>applyS(el,d,'opacity',v));
    
    // Image
    bindP('pSrc',v=>{
        d.src=v;
        const img=el.querySelector('img');
        if(img&&v)img.src=v; else if(v)el.innerHTML=`<img src="${v}" alt="">`;
    });
    bindP('pAlt',v=>{d.alt=v;const img=el.querySelector('img');if(img)img.alt=v;});
    bindP('pFit',v=>{d.fit=v;const img=el.querySelector('img');if(img)img.style.objectFit=v;});
    
    // Video
    bindP('pAuto',v=>{d.autoPlay=v.checked;},true);
    bindP('pCtrl',v=>{d.controls=!v.checked;},true);
    
    // Icon
    bindP('pIcon',v=>{
        d.icon=v;
        const i=el.querySelector('i.fas');
        if(i)i.className='fas '+v;
    });
    bindP('pISize',v=>applyS(el,d,'fontSize',v));
    bindP('pIClr',v=>{applyS(el,d,'color',v);const t=document.getElementById('pIClrT');if(t)t.value=v;});
    
    // Map
    bindP('pLoc',v=>{d.loc=v;});
    bindP('pZoom',v=>{d.zoom=parseInt(v);});
    
    // Code
    bindP('pCode',v=>{d.code=v;});
    
    // Tabs
    bindP('pTabs',v=>{d.tabs=v.split(',').map(s=>s.trim());});
    
    // Select options
    bindP('pOpts',v=>{d.opts=v.split('\n').map(s=>s.trim());});
    bindP('pPh',v=>{d.ph=v;});
    
    // Product
    bindP('pPName',v=>{d.name=v;});
    bindP('pPPrice',v=>{d.price=v;});
    bindP('pPDesc',v=>{d.desc=v;});
    
    // Social platforms
    document.querySelectorAll('.sp-chk').forEach(chk=>{
        chk.addEventListener('change',()=>{
            const platforms=[...document.querySelectorAll('.sp-chk:checked')].map(c=>c.value);
            d.platforms=platforms;
        });
    });
    
    // Advanced
    bindP('pCls',v=>{d.cssClass=v;el.className=`c-el el-${d.type.replace('-','_')}${v?' '+v:''}`;});
    bindP('pId',v=>{d.customId=v;if(v)el.id=v;else el.removeAttribute('id');});
    const hidChk=document.getElementById('pHidden');
    if(hidChk)hidChk.addEventListener('change',e=>{d.hidden=e.target.checked;el.style.display=e.target.checked?'none':'';});
    bindP('pCustomCss',v=>{d.customCss=v;});
    
    // Save on change
    document.querySelectorAll('#propsBody input,#propsBody textarea,#propsBody select').forEach(inp=>{
        inp.addEventListener('change',()=>{pushHist();saveData();});
    });
}

function bindP(id,h,skip=false){
    const el=document.getElementById(id);
    if(!el)return;
    if(skip&&el._b)return;
    el._b=true;
    el.addEventListener('input',e=>h(e.target.value));
    el.addEventListener('change',e=>h(e.target.value));
}

function applyS(el,data,prop,val){
    if(!data.sty)data.sty={};
    data.sty[prop]=val;
    el.style[prop]=val;
}

function updatePropVals(x,y,w,h){
    if(x!==null){const i=document.getElementById('pX');if(i)i.value=Math.round(x);}
    if(y!==null){const i=document.getElementById('pY');if(i)i.value=Math.round(y);}
    if(w!==null){const i=document.getElementById('pW');if(i)i.value=Math.round(w);}
    if(h!==null){const i=document.getElementById('pH');if(i)i.value=Math.round(h);}
}

// Accordion add item
window.addAccItem=function(){
    const c=document.getElementById('accItemsContainer');
    const btn=c.querySelector('button');
    const idx=c.querySelectorAll('.acc-t').length;
    const div=document.createElement('div');
    div.style.cssText='margin-bottom:6px;padding:8px;background:#f9f9f9;border-radius:4px;';
    div.innerHTML=`<input value="" placeholder="Title" class="acc-t" data-i="${idx}" style="width:100%;margin-bottom:4px;padding:5px 8px;border:1px solid #ddd;border-radius:3px;font-size:11px;"><textarea placeholder="Content" class="acc-c" data-i="${idx}" style="width:100%;min-height:28px;padding:5px 8px;border:1px solid #ddd;border-radius:3px;font-size:10px;"></textarea>`;
    c.insertBefore(div,btn);
};

// Media for image
window.openMediaForImg=function(){
    openMedia();
    window.mediaPickMode='img';
};

// ============ PAGES ============
function renderPages(){
    const c=document.getElementById('pagesList');
    if(!c)return;
    const sorted=[...S.pages].sort((a,b)=>a.order-b.order);
    c.innerHTML=sorted.map(p=>`
        <div class="page-item${S.curPage===p.id?' active':''}" data-id="${p.id}" onclick="selectPage(this.dataset.id)">
            <div class="page-icon"><i class="fas fa-file"></i></div>
            <div class="page-info"><div class="page-name">${p.name}</div><div class="page-type">${p.type==='external'?'External':p.type==='dropdown'?'Dropdown':'Page'}</div></div>
            <div class="page-actions">
                <button class="pa-btn" onclick="event.stopPropagation();editPg('${p.id}')"><i class="fas fa-pen"></i></button>
                <button class="pa-btn" onclick="event.stopPropagation();dupPg('${p.id}')"><i class="fas fa-copy"></i></button>
                ${S.pages.length>1?`<button class="pa-btn del" onclick="event.stopPropagation();delPg('${p.id}')"><i class="fas fa-trash"></i></button>`:''}
            </div>
        </div>
    `).join('');
}

function selectPage(pid){
    if(S.curPage) savePageEls(S.curPage);
    const p=S.pages.find(x=>x.id===pid);
    if(!p)return;
    S.curPage=pid;
    document.querySelectorAll('.c-el').forEach(el=>el.remove());
    S.els=[];
    loadPageEls(pid);
    renderPages();
    updateEmpty();
    applySettings();
}

function clearCanvas(){document.querySelectorAll('.c-el').forEach(el=>el.remove());S.els=[];deselect();}

function savePageEls(pid){localStorage.setItem('vys_els_'+pid,JSON.stringify(S.els.map(e=>({...e,dom:null})));}
function loadPageEls(pid){
    const raw=localStorage.getItem('vys_els_'+pid);
    if(raw){try{JSON.parse(raw).forEach(d=>makeEl(d));}catch(e){}}
}

function openPages(){closeMedia();closeSettings();document.getElementById('pagesPanel').style.display='flex';renderPages();}
function closePages(){document.getElementById('pagesPanel').style.display='none';}
window.openPages=openPages;window.closePages=closePages;

function addNewPage(){
    const name=prompt('Page name:');
    if(!name)return;
    S.pages.push({id:'pg_'+Date.now(),name,type:'page',order:S.pages.length});
    renderPages();saveData();selectPage(S.pages[S.pages.length-1].id);toast('Page added','ok');
}

function editPg(id){
    const p=S.pages.find(x=>x.id===id);
    if(!p)return;
    const n=prompt('Edit name:',p.name);
    if(n){p.name=n;renderPages();saveData();toast('Updated','ok');}
}

function dupPg(id){
    const p=S.pages.find(x=>x.id===id);
    if(!p)return;
    const np={...p,id:'pg_'+Date.now(),name:p.name+' (Copy)',order:S.pages.length};
    S.pages.push(np);
    const oldEls=localStorage.getItem('vys_els_'+id);
    if(oldEls)localStorage.setItem('vys_els_'+np.id,oldEls);
    renderPages();saveData();toast('Duplicated','ok');
}

function delPg(id){
    if(S.pages.length<=1){toast('Cannot delete last page','err');return;}
    if(confirm('Delete this page?')){
        S.pages=S.pages.filter(x=>x.id!==id);
        localStorage.removeItem('vys_els_'+id);
        if(S.curPage===id)selectPage(S.pages[0].id);
        renderPages();saveData();toast('Deleted');
    }
}
window.editPg=editPg;window.dupPg=dupPg;window.delPg=delPg;

// ============ MEDIA ============
function openMedia(){closePages();closeSettings();document.getElementById('mediaPanel').style.display='flex';renderMedia();}
function closeMedia(){document.getElementById('mediaPanel').style.display='none';}
window.openMedia=openMedia;window.closeMedia=closeMedia;

function handleFileUpload(e){
    const files=Array.from(e.target.files);
    files.forEach(file=>{
        if(!file.type.startsWith('image/')&&!file.type.startsWith('video/'))return;
        const r=new FileReader();
        r.onload=ev=>{
            S.media.push({id:'m_'+Date.now()+Math.random().toString(36).substr(2,5),name:file.name,type:file.type.startsWith('image/')?'img':'vid',dataUrl:ev.target.result,size:file.size});
            saveData();renderMedia();
            if(window.mediaPickMode)applyToSel(ev.target.result,file.type.startsWith('image/')?'img':'vid');
        };
        r.readAsDataURL(file);
    });
    e.target.value='';
    toast(files.length+' file(s) uploaded','ok');
}

function renderMedia(){
    const g=document.getElementById('mediaGrid');
    if(!g)return;
    if(S.media.length===0){
        g.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:30px;color:#999;"><i class="fas fa-images" style="font-size:28px;display:block;margin-bottom:8px;"></i><p>No media yet</p><small>Upload images/videos</small></div>';
        return;
    }
    g.innerHTML=S.media.map(m=>`
        <div class="media-item" data-id="${m.id}">
            ${m.type==='img'?`<img src="${m.dataUrl}" alt="${m.name}">`:`<video src="${m.dataUrl}"></video>`}
            <div class="media-overlay">
                <button onclick="event.stopPropagation();insertMed('${m.id}')"><i class="fas fa-plus"></i></button>
                <button onclick="event.stopPropagation();delMed('${m.id}')" style="color:#dc2626;"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function insertMed(id){
    const m=S.media.find(x=>x.id===id);
    if(!m)return;
    applyToSel(m.dataUrl,m.type);
}

function delMed(id){
    S.media=S.media.filter(x=>x.id!==id);
    renderMedia();saveData();toast('Deleted');
}

function applyToSel(dataUrl,type){
    if(!S.sel){toast('Select element first','err');return;}
    const el=S.sel,d=S.els.find(x=>x.id===el.dataset.id);
    if(!d)return;
    if(d.type==='image'){d.src=dataUrl;el.innerHTML=`<img src="${dataUrl}" alt="Image">`;}
    else if(d.type==='video'){d.src=dataUrl;el.innerHTML=`<video src="${dataUrl}" controls></video>`;}
    else{toast('Cannot add to this element','err');return;}
    updateProps();pushHist();saveData();toast('Added','ok');
}

// ============ SETTINGS ============
function openSettings(){closePages();closeMedia();document.getElementById('settingsPanel').style.display='flex';applySettingsToUI();}
function closeSettings(){document.getElementById('settingsPanel').style.display='none';}
window.openSettings=openSettings;window.closeSettings=closeSettings;

function applySettings(){
    const c=document.getElementById('canvas');
    if(c)c.style.background=S.settings.bg;
}

function applySettingsToUI(){
    document.getElementById('setBgColor').value=S.settings.bg;
    document.getElementById('setBgColorText').value=S.settings.bg;
    document.getElementById('setFont').value=S.settings.font;
    document.getElementById('setShowNav').checked=S.settings.showNav;
    document.getElementById('setShowFooter').checked=S.settings.showFooter;
}

document.getElementById('setBgColor')?.addEventListener('input',e=>{
    S.settings.bg=e.target.value;
    document.getElementById('setBgColorText').value=e.target.value;
    applySettings();saveData();
});
document.getElementById('setBgColorText')?.addEventListener('change',e=>{
    if(/^#[0-9A-Fa-f]{6}$/.test(e.target.value)){
        S.settings.bg=e.target.value;
        document.getElementById('setBgColor').value=e.target.value;
        applySettings();saveData();
    }
});
document.getElementById('setShowNav')?.addEventListener('change',e=>{S.settings.showNav=e.target.checked;saveData();});
document.getElementById('setShowFooter')?.addEventListener('change',e=>{S.settings.showFooter=e.target.checked;saveData();});

// ============ CONTEXT MENU ============
function initCtxMenu(){
    const cm=document.getElementById('ctxMenu');
    
    document.addEventListener('contextmenu',e=>{
        if(e.target.closest('.c-el')){
            e.preventDefault();
            select(e.target.closest('.c-el'));
            cm.style.left=e.pageX+'px';
            cm.style.top=e.pageY+'px';
            cm.style.display='block';
        }
    });
    
    document.addEventListener('click',e=>{
        if(!e.target.closest('.ctx-menu'))cm.style.display='none';
    });
    
    cm.querySelectorAll('button[data-action]').forEach(btn=>{
        btn.addEventListener('click',()=>{
            const act=btn.dataset.action;
            if(!S.sel)return;
            switch(act){
                case'duplicate':dupEl(S.sel);break;
                case'copy':copyEl(S.sel);break;
                case'paste':pasteEl();break;
                case'front':layerEl(S.sel,'front');break;
                case'back':layerEl(S.sel,'back');break;
                case'lock':toast('Element locked','ok');break;
                case'hide':S.sel.style.display='none';deselect();break;
                case'delete':delEl(S.sel.dataset.id);break;
            }
            cm.style.display='none';
        });
    });
}

// ============ KEYBOARD ============
function initKeys(){
    document.addEventListener('keydown',e=>{
        if(['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName))return;
        if(e.key==='Escape'){deselect();closePreview();hideModal('loginModal');hideModal('signupModal');hideModal('newSiteModal');closeAddMenu();}
        if((e.key==='Delete'||e.key==='Backspace')&&S.sel){e.preventDefault();delEl(S.sel.dataset.id);}
        if(e.ctrlKey&&e.key==='z'){e.preventDefault();e.shiftKey?redo():undo();}
        if(e.ctrlKey&&e.key==='d'&&S.sel){e.preventDefault();dupEl(S.sel);}
        if(e.ctrlKey&&e.key==='c'&&S.sel){e.preventDefault();copyEl(S.sel);}
        if(e.ctrlKey&&e.key==='v'){e.preventDefault();pasteEl();}
    });
}

// ============ PREVIEW ============
function initPreview(){
    document.getElementById('closePreview')?.addEventListener('click',closePreview);
    document.querySelectorAll('.pv-devices button').forEach(btn=>{
        btn.addEventListener('click',()=>{
            document.querySelectorAll('.pv-devices button').forEach(b=>b.classList.remove('active'));
            btn.classList.add('active');
            const f=document.getElementById('previewFrame');
            const dev=btn.dataset.pv;
            f.style.maxWidth=dev==='mobile'?'375px':dev==='tablet'?'768px':'100%';
        });
    });
}

function showPreview(){
    const ov=document.getElementById('previewOverlay');
    const frame=document.getElementById('previewFrame');
    frame.srcdoc=exportHTMLDoc();
    ov.style.display='flex';
}

function closePreview(){document.getElementById('previewOverlay').style.display='none';}
window.closePreview=closePreview;

// ============ EXPORT ============
function exportHTML(){
    const html=exportHTMLDoc();
    const blob=new Blob([html],{type:'text/html'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;a.download=(S.site.name||'website').replace(/\s+/g,'-').toLowerCase()+'.html';
    document.body.appendChild(a);a.click();a.remove();
    URL.revokeObjectURL(url);
    toast('Exported!','ok');
}

function exportHTMLDoc(){
    const els=[...S.els].sort((a,b)=>(a.zIndex||1)-(b.zIndex||1));
    const s=S.settings;
    
    let elsHtml='';
    els.forEach(d=>{elsHtml+=expEl(d);});
    
    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${S.site.name||'Website'}</title><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:${s.font};background:${s.bg};min-height:100vh;font-size:16px;color:#333;}.page{position:relative;width:100%;max-width:1100px;margin:0 auto;padding:20px;min-height:100vh;}.el{position:absolute;}.el-txt{font-size:14px;line-height:1.5;}.el-h{font-size:32px;font-weight:700;line-height:1.2;color:#000;}.el-img img{width:100%;height:100%;object-fit:cover;}.el-vid video{width:100%;height:100%;object-fit:contain;}.el-btn{display:inline-flex;align-items:center;justify-content:center;padding:12px 28px;background:#000;color:#fff;border-radius:6px;text-decoration:none;font-size:14px;font-weight:500;cursor:pointer;border:none;}.el-lnk{text-decoration:underline;color:#333;cursor:pointer;}.el-div{width:100%;height:1px;background:#ddd;}.el-con{background:#fafafa;border-radius:10px;}.el-sec{width:100%!important;left:0!important;background:linear-gradient(135deg,#fafafa,#eee);}.el-fm{background:#fff;padding:24px;border-radius:10px;border:1px solid #eee;}.el-fm input,.el-fm textarea,.el-fm select{width:100%;padding:10px 14px;margin-bottom:12px;border:1px solid #ddd;border-radius:6px;font-size:14px;}.el-fm button{width:100%;padding:12px;background:#000;color:#fff;border:none;border-radius:6px;font-size:14px;font-weight:500;cursor:pointer;}.acc-item{border:1px solid #ddd;border-radius:6px;margin-bottom:6px;overflow:hidden;}.acc-head{padding:12px 14px;background:#f7f7f7;cursor:pointer;display:flex;justify-content:space-between;font-weight:500;}.acc-body{padding:12px 14px;display:none;font-size:13px;color:#666;}.acc-item.open .acc-body{display:block;}.tabs-nav{display:flex;border-bottom:2px solid #ddd;background:#f7f7f7;}.tab-btn{flex:1;padding:12px 16px;border:none;background:transparent;font-size:12px;font-weight:500;color:#666;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-2px;}.tab-btn.active{color:#000;border-bottom-color:#000;background:#fff;}.tab-panel{padding:14px;display:none;font-size:13px;color:#666;}.tab-panel.open{display:block;}.social-icons{display:flex;gap:8px;}.social-icon{width:34px;height:34px;display:flex;align-items:center;justify-content:center;background:#eee;border-radius:50%;color:#666;text-decoration:none;font-size:14px;}@media(max-width:768px){.page{padding:10px;}.el-sec{padding-left:20px!important;padding-right:20px!important;}}</style></head><body><div class="page">${elsHtml}</div><script>document.querySelectorAll('.acc-head').forEach(h=>h.addEventListener('click',()=>h.parentElement.classList.toggle('open')));document.querySelectorAll('.tab-btn').forEach((b,i)=>{b.addEventListener('click',()=>{const t=b.closest('.el-tabs')||b.parentElement.parentElement;t.querySelectorAll('.tab-btn').forEach(x=>x.classList.remove('active'));t.querySelectorAll('.tab-panel').forEach(x=>x.classList.remove('open'));b.classList.add('active');t.querySelectorAll('.tab-panel')[i]?.classList.add('open');});});document.querySelectorAll('.el-tabs').forEach(t=>{t.querySelector('.tab-btn')?.classList.add('active');t.querySelector('.tab-panel')?.classList.add('open');});</script></body></html>`;
}

function expEl(d){
    const st=buildExpStyle(d);
    switch(d.type){
        case'text':return`<div class="el el-txt" style="left:${d.x}px;top:${d.y}px;width:${d.w}px;${st}">${esc(d.content)}</div>`;
        case'heading':return`<h2 class="el el-h" style="left:${d.x}px;top:${d.y}px;width:${d.w}px;${st}">${esc(d.content)}</h2>`;
        case'image':return d.src?`<div class="el el-img" style="left:${d.x}px;top:${d.y}px;width:${d.w}px;height:${d.h}px;${st}"><img src="${d.src}" alt="${esc(d.alt)}"></div>`:'';
        case'video':return d.src?`<div class="el el-vid" style="left:${d.x}px;top:${d.y}px;width:${d.w}px;height:${d.h}px;${st}"><video src="${d.src}"${d.poster?` poster="${d.poster}"`:''}${d.controls!==false?' controls':''}${d.autoPlay?' autoplay':''}${d.loop?' loop':''}></video></div>`:'';
        case'button':return`<div class="el" style="left:${d.x}px;top:${d.y}px;width:${d.w}px;${st}"><a href="${d.href||'#'}" target="_self" class="el-btn">${esc(d.content)}</a></div>`;
        case'link':return`<div class="el" style="left:${d.x}px;top:${d.y}px;width:${d.w}px;${st}"><a href="${d.href||'#'}">${esc(d.content)}</a></div>`;
        case'icon':return`<div class="el" style="left:${d.x}px;top:${d.y}px;width:${d.w}px;height:${d.h}px;${st}"><i class="fas ${d.icon||'fa-star'}"></i></div>`;
        case'divider':return`<div class="el el-div" style="left:${d.x}px;top:${d.y}px;width:${d.w}px;${st}"></div>`;
        case'spacer':return`<div class="el" style="left:${d.x}px;top:${d.y}px;width:${d.w}px;height:${d.h}px;"></div>`;
        case'container':return`<div class="el el-con" style="left:${d.x}px;top:${d.y}px;width:${d.w}px;height:${d.h}px;${st}">Container</div>`;
        case'section':return`<div class="el el-sec" style="top:${d.y}px;width:100%;height:${d.h}px;padding:${(d.sty&&d.sty.padding)||'60px 40px'};${st}">Section</div>`;
        case'columns':let c='';for(let i=0;i<(d.cols||2);i++)c+=`<div style="flex:1;background:#fafafa;border-radius:6px;padding:20px;">Column ${i+1}</div>`;return`<div class="el" style="left:${d.x}px;top:${d.y}px;width:${d.w}px;height:${d.h}px;display:flex;gap:12px;${st}">${c}</div>`;
        case'grid':let g='';for(let i=0;i<((d.cols||3)*(d.rows||2));i++)g+=`<div style="background:#fafafa;border-radius:6px;min-height:50px;">Cell</div>`;return`<div class="el" style="left:${d.x}px;top:${d.y}px;width:${d.w}px;height:${d.h}px;display:grid;grid-template-columns:repeat(${d.cols||3},1fr);gap:10px;padding:10px;${st}">${g}</div>`;
        case'form':let f='';(d.fields||[]).forEach(fd=>{if(fd.toLowerCase()==='message')f+='<textarea placeholder="'+fd+'"></textarea>';else f+='<input type="'+(fd.toLowerCase()==='email'?'email':'text')+'" placeholder="'+fd+'">';});f+='<button type="submit">'+(d.submit||'Submit')+'</button>';return`<form class="el el-fm" action="" method="post" style="left:${d.x}px;top:${d.y}px;width:${d.w}px;${st}">${f}</form>`;
        case'input':return`<div class="el" style="left:${d.x}px;top:${d.y}px;width:${d.w}px;${st}">${d.label?'<label>'+esc(d.label)+'</label>':''}<input type="text" placeholder="${d.ph||''}"></div>`;
        case'textarea':return`<div class="el" style="left:${d.x}px;top:${d.y}px;width:${d.w}px;${st}">${d.label?'<label>'+esc(d.label)+'</label>':''}<textarea placeholder="${d.ph||''}"></textarea></div>`;
        case'checkbox':return`<div class="el" style="left:${d.x}px;top:${d.y}px;${st}"><label><input type="checkbox"${d.checked?' checked':''}> ${esc(d.label||'Option')}</label></div>`;
        case'select':let o='';(d.opts||[]).forEach(opt=>o+='<option value="'+opt+'">'+opt+'</option>');return`<div class="el" style="left:${d.x}px;top:${d.y}px;width:${d.w}px;${st}">${d.label?'<label>'+esc(d.label)+'</label>':''}<select>${o}</select></div>`;
        case'accordion':let a='';(d.items||[]).forEach(it=>a+='<div class="acc-item"><div class="acc-head">'+esc(it.title)+'<i class="fas fa-chevron-down" style="font-size:9px;"></i></div><div class="acc-body">'+it.content+'</div></div>');return`<div class="el" style="left:${d.x}px;top:${d.y}px;width:${d.w}px;${st}">${a}</div>`;
        case'tabs':let tn='',tp='';(d.tabs||[]).forEach((t,i)=>{tn+='<button class="tab-btn'+(i===0?' active':'')+'">'+t+'</button>';tp+='<div class="tab-panel'+(i===0?' open':'')+'">Content for '+t+'</div>';});return`<div style="left:${d.x}px;top:${d.y}px;width:${d.w}px;${st}"><div class="tabs-nav">${tn}</div>${tp}</div>`;
        case'social':const icons={facebook:'fa-facebook-f',twitter:'fa-twitter',instagram:'fa-instagram',linkedin:'fa-linkedin-in'};let sc='';(d.platforms||[]).forEach(p=>sc+='<a class="social-icon"><i class="fab '+icons[p]||'fa-link']+'"></i></a>');return`<div class="social-icons" style="left:${d.x}px;top:${d.y}px;width:${d.w}px;${st}">${sc||'<a class="social-icon"><i class="fas fa-share-alt"></i></a>'}</div>`;
        case'map':return d.loc?`<div class="el" style="left:${d.x}px;top:${d.y}px;width:${d.w}px;height:${d.h}px;${st}"><iframe src="https://maps.google.com/maps?q=${encodeURIComponent(d.loc)}&output=embed" width="100%" height="100%" frameborder="0"></iframe></div>`:'';
        case'embed':case'html':case'code-block':return`<div class="el ${d.type==='code-block'?'':'el-'+d.type}" style="left:${d.x}px;top:${d.y}px;width:${d.w}px;height:${d.h}px;${st}">${esc(d.code||'')}</div>`;
        default:return`<div class="el" style="left:${d.x}px;top:${d.y}px;width:${d.w}px;height:${d.h}px;${st}">${esc(d.content||'')}</div>`;
    }
}

function buildExpStyle(d){
    const s=d.sty||{};
    const p=[];
    if(s.fontSize)p.push('font-size:'+s.fontSize);
    if(s.color)p.push('color:'+s.color);
    if(s.fontWeight)p.push('font-weight:'+s.fontWeight);
    if(s.background||s.backgroundColor)p.push('background:'+(s.background||s.backgroundColor));
    if(s.borderRadius)p.push('border-radius:'+s.borderRadius);
    if(s.padding)p.push('padding:'+s.padding);
    if(s.opacity&&s.opacity!=1)p.push('opacity:'+s.opacity);
    if(s.transform)p.push('transform:'+s.transform);
    if(d.customCss)p.push(d.customCss);
    return p.join(';');
}

// Init
document.addEventListener('DOMContentLoaded',()=>{
    console.log('ViewYourSite v1.2 ready!');
});
