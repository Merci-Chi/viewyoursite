/* ============================================
   ViewYourSite v1.1 - Main Builder Controller
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    console.log('ViewYourSite v1.1 - Initializing...');
    
    // Load site info
    loadSiteInfo();
    
    // Load saved data
    if (loadFromStorage()) {
        renderPages();
        selectPage(VYS.pages[0]?.id);
    } else {
        createDefaultPages();
        renderPages();
        selectPage(VYS.pages[0]?.id);
    }
    
    applySettings();
    
    // Initialize toolbar navigation
    initToolbarNav();
    
    // Initialize view switcher
    initViewSwitcher();
    
    // Initialize topbar buttons
    initTopbarBtns();
    
    // Initialize context menu
    initCtxMenu();
    
    // Keyboard shortcuts
    initKeys();
    
    // Preview functionality
    initPreview();
    
    // Initial history state
    setTimeout(() => { if(VYS.history.length===0) pushHistory(); }, 200);
    
    console.log('ViewYourSite v1.1 - Ready!');
});

// Toolbar panel switching
function initToolbarNav() {
    document.querySelectorAll('.tool-btn[data-panel]').forEach(btn => {
        btn.addEventListener('click', () => {
            const panel = btn.dataset.panel;
            
            // Toggle active state
            document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Show/hide drawer
            const drawer = document.getElementById('panelDrawer');
            const targetPanel = document.getElementById(panel + 'Panel');
            
            if (targetPanel) {
                // Hide all panels
                document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
                
                // Show target
                targetPanel.classList.add('active');
                drawer.classList.add('open');
            } else {
                drawer.classList.remove('open');
            }
        });
    });
}

// Open specific panel
function openPanel(name) {
    const btn = document.querySelector(`.tool-btn[data-panel="${name}"]`);
    if (btn) btn.click();
}
window.openPanel = openPanel;

// Close panel
function closePanel() {
    document.getElementById('panelDrawer')?.classList.remove('open');
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
}
window.closePanel = closePanel;

// View mode switcher
function initViewSwitcher() {
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const mode = btn.dataset.view;
            VYS.viewMode = mode;
            
            const wrapper = document.getElementById('canvasWrapper');
            wrapper.classList.remove('tablet', 'mobile');
            if (mode === 'tablet') wrapper.classList.add('tablet');
            else if (mode === 'mobile') wrapper.classList.add('mobile');
        });
    });
}

// Topbar button handlers
function initTopbarBtns() {
    document.getElementById('undoBtn')?.addEventListener('click', undo);
    document.getElementById('redoBtn')?.addEventListener('click', redo);
    document.getElementById('previewBtn')?.addEventListener('click', showPreview);
    document.getElementById('exportBtn')?.addEventListener('click', exportSite);
    
    // Site name button (could show site settings)
    document.getElementById('siteNameBtn')?.addEventListener('click', () => {
        openPanel('settings');
    });
}

// Context menu
function initCtxMenu() {
    const ctx = document.getElementById('ctxMenu');
    
    document.addEventListener('contextmenu', e => {
        if (e.target.closest('.c-el')) {
            e.preventDefault();
            selectEl(e.target.closest('.c-el'));
            
            ctx.style.left = e.pageX + 'px';
            ctx.style.top = e.pageY + 'px';
            ctx.classList.add('visible');
        }
    });
    
    document.addEventListener('click', e => {
        if (!e.target.closest('.ctx-menu')) {
            ctx.classList.remove('visible');
        }
    });
    
    ctx.querySelectorAll('button[data-action]').forEach(btn => {
        btn.addEventListener('click', () => {
            handleCtxAction(btn.dataset.action);
            ctx.classList.remove('visible');
        });
    });
}

function handleCtxAction(action) {
    if (!VYS.selectedEl) return;
    
    switch (action) {
        case 'duplicate': dupEl(VYS.selectedEl); break;
        case 'front': layerEl(VYS.selectedEl, 'front'); break;
        case 'back': layerEl(VYS.selectedEl, 'back'); break;
        case 'delete': delEl(VYS.selectedEl.dataset.id); break;
    }
}

// Keyboard shortcuts
function initKeys() {
    document.addEventListener('keydown', e => {
        // Skip when typing in inputs
        if (['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) return;
        
        const key = e.key.toLowerCase();
        const ctrl = e.ctrlKey || e.metaKey;
        
        if (ctrl && key === 'z') {
            e.preventDefault();
            e.shiftKey ? redo() : undo();
        }
        
        if ((key === 'delete' || key === 'backspace') && VYS.selectedEl) {
            e.preventDefault();
            delEl(VYS.selectedEl.dataset.id);
        }
        
        if (key === 'escape') {
            deselectEl();
            hidePreview();
        }
        
        if (ctrl && key === 'd' && VYS.selectedEl) {
            e.preventDefault();
            dupEl(VYS.selectedEl);
        }
    });
}

// Preview
function initPreview() {
    document.getElementById('closePreview')?.addEventListener('click', hidePreview);
    
    document.querySelectorAll('.preview-devices button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.preview-devices button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const frame = document.getElementById('previewFrame');
            const dev = btn.dataset.pv;
            
            if (dev === 'mobile') frame.style.maxWidth = '375px';
            else if (dev === 'tablet') frame.style.maxWidth = '768px';
            else frame.style.maxWidth = '100%';
        });
    });
}

function showPreview() {
    const overlay = document.getElementById('previewOverlay');
    const frame = document.getElementById('previewFrame');
    
    const html = generateExportHTML();
    const blob = new Blob([html], { type: 'text/html' });
    frame.src = URL.createObjectURL(blob);
    
    overlay.classList.add('visible');
    
    // Set preview URL display
    const urlDisplay = document.getElementById('previewUrl');
    if (urlDisplay) {
        urlDisplay.textContent = (VYS.site.name || 'my-site').toLowerCase().replace(/\s+/g, '-') + '.viewyoursite.com';
    }
}

function hidePreview() {
    document.getElementById('previewOverlay')?.classList.remove('visible');
}
window.closePreview = hidePreview;

// Make functions global for HTML onclick handlers
window.selectPage = selectPage;
window.editPage = editPage;
window.dupPage = dupPage;
window.delPage = delPage;
window.createPage = createPage;
window.savePageEdit = savePageEdit;
window.confirmDelPage = confirmDelPage;
window.delMedia = delMedia;
