/* ============================================
   ViewYourSite v1.1 - Page Management
   ============================================ */

// Render pages list
function renderPages() {
    const container = document.getElementById('pagesList');
    if (!container) return;
    
    const sorted = [...VYS.pages].sort((a,b) => a.order - b.order);
    
    container.innerHTML = sorted.map(p => `
        <div class="page-row${VYS.currentPageId===p.id?' active':''}" data-id="${p.id}">
            <div class="page-icon"><i class="fas fa-file"></i></div>
            <div class="page-info">
                <div class="page-name">${p.name}</div>
                <div class="page-type-label">${p.type==='external'?'External Link':p.type==='dropdown'?'Dropdown':'Page'}</div>
            </div>
            <div class="page-actions">
                <button class="page-action-btn" onclick="editPage('${p.id}')" title="Edit"><i class="fas fa-pen"></i></button>
                <button class="page-action-btn" onclick="dupPage('${p.id}')" title="Duplicate"><i class="fas fa-copy"></i></button>
                ${VYS.pages.length>1?`<button class="page-action-btn delete" onclick="delPage('${p.id}')" title="Delete"><i class="fas fa-trash"></i></button>`:''}
            </div>
        </div>
    `).join('');
    
    // Click to select page
    container.querySelectorAll('.page-row').forEach(row => {
        row.addEventListener('click', e => {
            if(!e.target.closest('.page-actions')) selectPage(row.dataset.id);
        });
    });
}

// Select page
function selectPage(pageId) {
    // Save current page elements
    if (VYS.currentPageId) savePageEls(VYS.currentPageId);
    
    const page = VYS.pages.find(p => p.id === pageId);
    if (!page) return;
    
    VYS.currentPageId = pageId;
    
    // Clear and load elements
    clearCanvas();
    loadPageEls(pageId);
    
    renderPages();
    updateCanvasEmpty();
    applySettings();
    
    // Update settings panel values
    document.getElementById('siteTitleInput').value = page.name || '';
    document.getElementById('siteDescInput').value = page.description || '';
}

// Clear canvas elements
function clearCanvas() {
    document.querySelectorAll('.c-el').forEach(el => el.remove());
    VYS.elements = [];
    deselectEl();
}

// Save page elements to storage
function savePageEls(pageId) {
    localStorage.setItem('vys_els_'+pageId, JSON.stringify(VYS.elements.map(e=>({...e,dom:null}))));
}

// Load page elements from storage
function loadPageEls(pageId) {
    const raw = localStorage.getItem('vys_els_'+pageId);
    if (raw) {
        try {
            JSON.parse(raw).forEach(data => createElFromData(data));
        } catch(e) { console.error('Load els failed:',e); }
    }
}

// Add new page
document.getElementById('addPageBtn')?.addEventListener('click', showAddPageModal);

function showAddPageModal() {
    const body = `
        <div style="display:flex;flex-direction:column;gap:14px;">
            <div>
                <label style="display:block;font-size:12px;font-weight:600;margin-bottom:6px;">Page Name</label>
                <input type="text" id="newPgName" value="" placeholder="e.g., Services" style="width:100%;padding:10px 12px;border:1px solid #ddd;border-radius:6px;">
            </div>
            <div>
                <label style="display:block;font-size:12px;font-weight:600;margin-bottom:8px;">Type</label>
                <div style="display:flex;flex-direction:column;gap:6px;">
                    <label class="pg-type selected" data-t="page">
                        <span style="display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid #ddd;border-radius:6px;cursor:pointer;">
                            <span style="width:18px;height:18px;border-radius:50%;border:2px solid #ddd;display:flex;align-items:center;justify-content:center;"></span>
                            <div><strong style="font-size:13px;">Blank Page</strong><br><small style="color:#888;">A new blank page</small></div>
                        </span>
                    </label>
                    <label class="pg-type" data-t="external">
                        <span style="display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid #ddd;border-radius:6px;cursor:pointer;">
                            <span style="width:18px;height:18px;border-radius:50%;border:2px solid #ddd;display:flex;align-items:center;justify-content:center;"></span>
                            <div><strong style="font-size:13px;">External Link</strong><br><small style="color:#888;">Links to URL</small></div>
                        </span>
                    </label>
                    <label class="pg-type" data-t="dropdown">
                        <span style="display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid #ddd;border-radius:6px;cursor:pointer;">
                            <span style="width:18px;height:18px;border-radius:50%;border:2px solid #ddd;display:flex;align-items:center;justify-content:center;"></span>
                            <div><strong style="font-size:13px;">Dropdown Child</strong><br><small style="color:#888;">Inside dropdown menu</small></div>
                        </span>
                    </label>
                </div>
            </div>
            <div id="extUrlGroup" style="display:none;">
                <label style="display:block;font-size:12px;margin-bottom:6px;">URL</label>
                <input type="url" id="newPgUrl" value="" placeholder="https://..." style="width:100%;padding:10px 12px;border:1px solid #ddd;border-radius:6px;">
            </div>
        </div>`;
    
    showModal('New Page', body, `
        <button onclick="closeModal()" style="padding:10px 20px;background:#f5f5f5;border:none;border-radius:6px;cursor:pointer;">Cancel</button>
        <button onclick="createPage()" style="padding:10px 20px;background:#000;color:#fff;border:none;border-radius:6px;cursor:pointer;">Create</button>
    `);
    
    setTimeout(() => {
        document.querySelectorAll('.pg-type').forEach(t => {
            t.addEventListener('click', () => {
                document.querySelectorAll('.pg-type').forEach(x=>{
                    x.classList.remove('selected');
                    x.querySelector('span>span:first-child').style.background='transparent';
                    x.querySelector('span>span:first-child').style.borderColor='#ddd';
                });
                t.classList.add('selected');
                t.querySelector('span>span:first-child').style.background='#000';
                t.querySelector('span>span:first-child').style.borderColor='#000';
                
                document.getElementById('extUrlGroup').style.display = t.dataset.t==='external'?'block':'none';
            });
        });
        
        // Set first as visually selected
        const first = document.querySelector('.pg-type.selected span>span:first-child');
        if(first){first.style.background='#000';first.style.borderColor='#000';}
    }, 100);
}

function createPage() {
    const name = document.getElementById('newPgName').value.trim() || 'Untitled';
    const selType = document.querySelector('.pg-type.selected');
    const type = selType ? selType.dataset.t : 'page';
    
    const pg = {
        id: 'pg_' + Date.now(),
        name,
        type,
        url: type === 'external' ? document.getElementById('newPgUrl').value : '',
        order: VYS.pages.length,
        description: ''
    };
    
    VYS.pages.push(pg);
    closeModal();
    renderPages();
    selectPage(pg.id);
    saveToStorage();
    toast(`"${name}" created`);
}

// Edit page
function editPage(id) {
    const p = VYS.pages.find(x=>x.id===id);
    if(!p) return;
    
    showModal(`Edit "${p.name}"`, `
        <div style="display:flex;flex-direction:column;gap:14px;">
            <div>
                <label style="display:block;font-size:12px;font-weight:600;margin-bottom:6px;">Name</label>
                <input type="text" id="editPgName" value="${p.name}" style="width:100%;padding:10px 12px;border:1px solid #ddd;border-radius:6px;">
            </div>
            <div>
                <label style="display:block;font-size:12px;font-weight:600;margin-bottom:6px;">Description</label>
                <textarea id="editPgDesc" style="width:100%;min-height:70px;padding:10px 12px;border:1px solid #ddd;border-radius:6px;">${p.description||''}</textarea>
            </div>
            <div>
                <label style="font-size:12px;display:flex;align-items:center;gap:8px;">
                    <input type="checkbox" id="editPw"${p.passwordProtected?' checked':''}> Password Protected
                </label>
            </div>
        </div>
    `, `
        <button onclick="closeModal()" style="padding:10px 20px;background:#f5f5f5;border:none;border-radius:6px;cursor:pointer;">Cancel</button>
        <button onclick="savePageEdit('${id}')" style="padding:10px 20px;background:#000;color:#fff;border:none;border-radius:6px;cursor:pointer;">Save</button>
    `);
}

function savePageEdit(id) {
    const p = VYS.pages.find(x=>x.id===id);
    if(!p) return;
    
    p.name = document.getElementById('editPgName').value.trim()||p.name;
    p.description = document.getElementById('editPgDesc').value;
    p.passwordProtected = document.getElementById('editPw')?.checked;
    
    closeModal();
    renderPages();
    saveToStorage();
    toast('Page updated');
}

// Duplicate page
function dupPage(id) {
    const p = VYS.pages.find(x=>x.id===id);
    if(!p) return;
    
    const np = {...p, id:'pg_'+Date.now(), name:p.name+' (Copy)', order:VYS.pages.length};
    VYS.pages.push(np);
    
    // Copy elements
    const oldEls = localStorage.getItem('vys_els_'+id);
    if(oldEls) localStorage.setItem('vys_els_'+np.id, oldEls);
    
    renderPages();
    saveToStorage();
    toast('Duplicated');
}

// Delete page
function delPage(id) {
    if(VYS.pages.length<=1){
        toast('Cannot delete last page','err');return;
    }
    
    const p = VYS.pages.find(x=>x.id===id);
    
    showModal('Delete Page', `
        <p>Delete "<strong>${p?.name}</strong>"?</p>
        <p style="color:#dc2626;font-size:12px;margin-top:8px;">This cannot be undone.</p>
    `, `
        <button onclick="closeModal()" style="padding:10px 20px;background:#f5f5f5;border:none;border-radius:6px;cursor:pointer;">Cancel</button>
        <button onclick="confirmDelPage('${id}')" style="padding:10px 20px;background:#dc2626;color:#fff;border:none;border-radius:6px;cursor:pointer;">Delete</button>
    `);
}

function confirmDelPage(id) {
    VYS.pages = VYS.pages.filter(p=>p.id!==id);
    localStorage.removeItem('vys_els_'+id);
    
    if(VYS.currentPageId===id) selectPage(VYS.pages[0].id);
    
    closeModal();
    renderPages();
    saveToStorage();
    toast('Deleted');
}

// Settings listeners
document.getElementById('siteTitleInput')?.addEventListener('change', e => {
    if(VYS.currentPageId){
        const p=VYS.pages.find(x=>x.id===VYS.currentPageId);
        if(p)p.name=e.target.value;
        renderPages();saveToStorage();
    }
});

document.getElementById('siteDescInput')?.addEventListener('change', e => {
    if(VYS.currentPageId){
        const p=VYS.pages.find(x=>x.id===VYS.currentPageId);
        if(p)p.description=e.target.value;
        saveToStorage();
    }
});

document.getElementById('themeBgColor')?.addEventListener('input', e => {
    VYS.settings.bgColor=e.target.value;
    document.getElementById('themeBgColorText').value=e.target.value;
    applySettings();saveToStorage();
});
document.getElementById('themeBgColorText')?.addEventListener('change', e => {
    if(/^#[0-9A-Fa-f]{6}$/.test(e.target.value)){
        VYS.settings.bgColor=e.target.value;
        document.getElementById('themeBgColor').value=e.target.value;
        applySettings();saveToStorage();
    }
});

document.getElementById('showNavToggle')?.addEventListener('change', e => {
    VYS.settings.showNav=e.target.checked;saveToStorage();
});
document.getElementById('showFooterToggle')?.addEventListener('change', e => {
    VYS.settings.showFooter=e.target.checked;saveToStorage();
});

// Modal helpers
function showModal(title,body,footer) {
    // For now just use alert or create inline modal
    // Simplified - using existing pattern from home page
    console.log('Show modal:',title);
}
function closeModal() {
    console.log('Close modal');
}
