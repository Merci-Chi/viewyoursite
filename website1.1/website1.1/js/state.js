/* ============================================
   ViewYourSite v1.1 - State Management
   ============================================ */

const VYS = {
    // Current site info
    site: {
        name: 'My Website',
        type: 'blank',
        createdAt: null
    },
    
    // Pages
    pages: [],
    currentPageId: null,
    
    // Elements on current page
    elements: [],
    selectedEl: null,
    
    // Media library
    media: [],
    
    // History for undo/redo
    history: [],
    historyIdx: -1,
    
    // Settings
    settings: {
        bgColor: '#ffffff',
        fontFamily: '-apple-system, sans-serif',
        fontSize: 16,
        showNav: true,
        showFooter: true
    },
    
    // View mode
    viewMode: 'desktop'
};

// Generate unique ID
function uid() {
    return 'el_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// Save state to history
function pushHistory() {
    const snapshot = {
        elements: VYS.elements.map(el => ({
            ...el,
            dom: null
        })),
        settings: { ...VYS.settings }
    };
    
    // Remove future states if we're not at the end
    VYS.history = VYS.history.slice(0, VYS.historyIdx + 1);
    VYS.history.push(JSON.stringify(snapshot));
    VYS.historyIdx = VYS.history.length - 1;
    
    // Limit history size
    if (VYS.history.length > 40) {
        VYS.history.shift();
        VYS.historyIdx--;
    }
}

// Undo
function undo() {
    if (VYS.historyIdx > 0) {
        VYS.historyIdx--;
        restoreSnapshot(VYS.history[VYS.historyIdx]);
    }
}

// Redo
function redo() {
    if (VYS.historyIdx < VYS.history.length - 1) {
        VYS.historyIdx++;
        restoreSnapshot(VYS.history[VYS.historyIdx]);
    }
}

// Restore from history snapshot
function restoreSnapshot(jsonStr) {
    try {
        const snap = JSON.parse(jsonStr);
        
        // Clear canvas
        document.querySelectorAll('.c-el').forEach(el => el.remove());
        
        // Restore elements
        VYS.elements = [];
        snap.elements.forEach(data => createElFromData(data));
        
        // Restore settings
        VYS.settings = { ...snap.settings };
        applySettings();
        
        updateCanvasEmpty();
        updatePropsPanel();
        
    } catch (e) {
        console.error('Restore failed:', e);
    }
}

// Save to localStorage
function saveToStorage() {
    try {
        const data = {
            site: VYS.site,
            pages: VYS.pages,
            settings: VYS.settings,
            media: VYS.media.map(m => ({...m}))
        };
        
        // Save per-page elements
        VYS.pages.forEach(page => {
            const pageEls = VYS.elements.filter(el => el.pageId === page.id);
            data['els_' + page.id] = pageEls.map(el => ({...el, dom: null}));
        });
        
        localStorage.setItem('vys_data', JSON.stringify(data));
    } catch (e) {
        console.error('Save failed:', e);
    }
}

// Load from localStorage
function loadFromStorage() {
    try {
        const raw = localStorage.getItem('vys_data');
        if (!raw) return false;
        
        const data = JSON.parse(raw);
        
        VYS.site = data.site || VYS.site;
        VYS.pages = data.pages || [];
        VYS.settings = data.settings || VYS.settings;
        VYS.media = data.media || [];
        
        // Create default pages if none exist
        if (VYS.pages.length === 0) {
            createDefaultPages();
        }
        
        return true;
    } catch (e) {
        console.error('Load failed:', e);
        return false;
    }
}

// Create default pages
function createDefaultPages() {
    VYS.pages = [
        { id: 'page_home', name: 'Home', type: 'page', order: 0 },
        { id: 'page_about', name: 'About', type: 'page', order: 1 },
        { id: 'page_contact', name: 'Contact', type: 'page', order: 2 }
    ];
}

// Load site info from session
function loadSiteInfo() {
    try {
        const siteRaw = localStorage.getItem('vys_current_site');
        if (siteRaw) {
            const site = JSON.parse(siteRaw);
            VYS.site.name = site.name || 'My Website';
            VYS.site.type = site.type || 'blank';
            
            document.getElementById('currentSiteName').textContent = VYS.site.name;
            document.getElementById('siteTitleInput').value = VYS.site.name;
        }
    } catch (e) {}
}

// Show toast notification
function toast(msg, type = 'info') {
    const container = document.getElementById('toastContainer');
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `
        <i class="fas fa-${type === 'ok' ? 'check' : type === 'err' ? 'exclamation-circle' : 'info'}"></i>
        <span>${msg}</span>
    `;
    
    Object.assign(el.style, {
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '12px 24px',
        background: type === 'ok' ? '#000' : type === 'err' ? '#dc2626' : '#333',
        color: '#fff',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '13px',
        fontWeight: '500',
        zIndex: 100001,
        animation: 'fadeIn 0.25s ease'
    });
    
    container.appendChild(el);
    
    setTimeout(() => {
        el.style.opacity = '0';
        el.style.transition = 'opacity 0.3s ease';
        setTimeout(() => el.remove(), 300);
    }, 2500);
}
