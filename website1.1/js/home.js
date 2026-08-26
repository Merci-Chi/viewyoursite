/* ============================================
   ViewYourSite v1.1 - Home Page JavaScript
   ============================================ */

// Navigation scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.06)';
    } else {
        navbar.style.boxShadow = 'none';
    }
});

// Open Builder
function openBuilder() {
    // Save site name if entered
    const siteName = document.getElementById('newSiteName')?.value || 'My Website';
    localStorage.setItem('vys_current_site', JSON.stringify({
        name: siteName,
        type: document.querySelector('.site-type.selected')?.dataset.type || 'blank',
        createdAt: new Date().toISOString()
    }));
    
    // Navigate to builder
    window.location.href = 'builder.html';
}

// Scroll to section
function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
    }
}

// Modal Functions
function showLoginModal() {
    document.getElementById('loginModal').classList.add('visible');
}

function closeLoginModal() {
    document.getElementById('loginModal').classList.remove('visible');
}

function showSignupModal() {
    document.getElementById('signupModal').classList.add('visible');
}

function closeSignupModal() {
    document.getElementById('signupModal').classList.remove('visible');
}

function showNewSiteModal() {
    closeLoginModal();
    closeSignupModal();
    document.getElementById('newSiteModal').classList.add('visible');
}

function closeNewSiteModal() {
    document.getElementById('newSiteModal').classList.remove('visible');
}

// Handle Login
function handleLogin(e) {
    e.preventDefault();
    showToast('Welcome back! Redirecting to builder...', 'success');
    setTimeout(() => openBuilder(), 1000);
}

// Handle Signup
function handleSignup(e) {
    e.preventDefault();
    showToast('Account created! Let\'s build your site...', 'success');
    setTimeout(() => {
        closeSignupModal();
        showNewSiteModal();
    }, 800);
}

// Google Auth (mock)
function continueWithGoogle() {
    showToast('Connecting to Google...', 'info');
    setTimeout(() => {
        showToast('Logged in with Google!', 'success');
        setTimeout(() => openBuilder(), 800);
    }, 1000);
}

// Create New Site
let selectedSiteType = 'blank';

document.addEventListener('DOMContentLoaded', () => {
    // Site type selection
    const siteTypes = document.querySelectorAll('.site-type');
    
    siteTypes.forEach(type => {
        type.addEventListener('click', () => {
            siteTypes.forEach(t => t.classList.remove('selected'));
            type.classList.add('selected');
            selectedSiteType = type.dataset.type;
        });
    });
    
    // Template filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Filter templates (visual only for demo)
            const filter = btn.textContent.toLowerCase();
            document.querySelectorAll('.template-card').forEach(card => {
                if (filter === 'all' || card.querySelector('.template-info span')?.textContent.toLowerCase() === filter) {
                    card.style.display = '';
                } else {
                    card.style.display = filter === 'all' ? '' : 'none';
                }
            });
        });
    });
    
    // Template card click -> create with template
    document.querySelectorAll('.template-card').forEach(card => {
        card.addEventListener('click', () => {
            const template = card.dataset.template;
            localStorage.setItem('vys_template', template);
            showNewSiteModal();
        });
    });
    
    // Check if coming from builder (back button)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'new') {
        setTimeout(showNewSiteModal, 500);
    }
});

function createNewSite() {
    const name = document.getElementById('newSiteName').value.trim() || 'My Website';
    
    localStorage.setItem('vys_current_site', JSON.stringify({
        name: name,
        type: selectedSiteType,
        template: localStorage.getItem('vys_template') || null,
        createdAt: new Date().toISOString()
    }));
    
    showToast(`Creating "${name}"...`, 'success');
    
    setTimeout(() => {
        window.location.href = 'builder.html';
    }, 600);
}

// Toast notifications
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '14px 28px',
        background: type === 'success' ? '#000' : type === 'error' ? '#dc2626' : '#3a3a3a',
        color: '#fff',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '14px',
        fontWeight: '500',
        zIndex: '100001',
        animation: 'toastIn 0.3s ease'
    });
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 2800);
}

// Add toast animation
const style = document.createElement('style');
style.textContent = `
    @keyframes toastIn {
        from { opacity: 0; transform: translateX(-50%) translateY(20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
`;
document.head.appendChild(style);

// Close modals on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.remove('visible');
        }
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.visible').forEach(m => m.classList.remove('visible'));
    }
});
