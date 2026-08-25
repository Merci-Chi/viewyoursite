/**
 * ViewYourSite - Main Landing Page JavaScript
 * Handles template gallery, animations, and navigation
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize the landing page
  initTemplateGallery();
  initAnimations();
  initSmoothScroll();
});

/**
 * Initialize the template gallery with dynamic cards
 */
function initTemplateGallery() {
  const templatesGrid = document.getElementById('templatesGrid');
  
  if (!templatesGrid) return;
  
  // Get all templates from the templates module
  const templates = getAllTemplates();
  
  // Clear existing content
  templatesGrid.innerHTML = '';
  
  // Create a card for each template
  templates.forEach((template, index) => {
    const card = createTemplateCard(template, index);
    templatesGrid.appendChild(card);
  });
}

/**
 * Create a template card element
 * @param {object} template - Template data object
 * @param {number} index - Template index
 * @returns {HTMLElement} The template card element
 */
function createTemplateCard(template, index) {
  const card = document.createElement('div');
  card.className = 'template-card';
  card.style.animationDelay = `${index * 0.1}s`;
  
  // Build thumbnail HTML based on template type
  let thumbnailHtml = '';
  switch(template.id) {
    case 'business':
      thumbnailHtml = buildBusinessThumbnail();
      break;
    case 'portfolio':
      thumbnailHtml = buildPortfolioThumbnail();
      break;
    case 'restaurant':
      thumbnailHtml = buildRestaurantThumbnail();
      break;
    case 'landing':
      thumbnailHtml = buildLandingThumbnail();
      break;
    default:
      thumbnailHtml = `<div class="template-preview-fallback">
        <div class="template-icon">${template.icon}</div>
        <span>${template.name}</span>
      </div>`;
  }
  
  card.innerHTML = `
    <div class="template-preview-container">
      ${thumbnailHtml}
    </div>
    <div class="template-info-overlay">
      <h3>${template.name}</h3>
      <p>${template.description}</p>
      <a href="editor.html?template=${template.id}" class="btn btn-primary">Use This Template →</a>
    </div>
    <div class="template-card-footer">
      <span class="template-name">${template.icon} ${template.name}</span>
      <div class="template-actions">
        <a href="editor.html?template=${template.id}" class="btn btn-secondary" style="padding: 8px 16px; font-size: 0.85rem;">
          Edit
        </a>
      </div>
    </div>
  `;
  
  // Add click handler to navigate to editor with this template
  card.addEventListener('click', function(e) {
    // Don't navigate if clicking on buttons/links
    if (e.target.closest('a') || e.target.closest('.btn')) {
      return;
    }
    window.location.href = `editor.html?template=${template.id}`;
  });
  
  return card;
}

// Thumbnail builders - create visual previews of each template

function buildBusinessThumbnail() {
  return `
    <div class="template-thumbnail thumbnail-business">
      <div class="thumb-header">
        <span class="thumb-logo">TechCorp</span>
        <div class="thumb-nav">
          <span>Home</span>
          <span>About</span>
          <span>Contact</span>
        </div>
      </div>
      <div class="thumb-hero">
        <div class="thumb-hero-title">Building Tomorrow's Technology</div>
        <div class="thumb-hero-subtitle">Innovative solutions for modern businesses</div>
        <span class="thumb-cta">Get Started</span>
      </div>
      <div class="thumb-features">
        <div class="thumb-feature">
          <div class="thumb-feature-icon">🚀</div>
          <div class="thumb-feature-text">Digital Transform</div>
        </div>
        <div class="thumb-feature">
          <div class="thumb-feature-icon">🔒</div>
          <div class="thumb-feature-text">Security</div>
        </div>
        <div class="thumb-feature">
          <div class="thumb-feature-icon">☁️</div>
          <div class="thumb-feature-text">Cloud</div>
        </div>
      </div>
    </div>
  `;
}

function buildPortfolioThumbnail() {
  return `
    <div class="template-thumbnail thumbnail-portfolio">
      <div class="thumb-hero-full">
        <div class="thumb-hero-large">Alex Morgan</div>
        <div class="thumb-hero-tagline">Creative Designer & Developer crafting beautiful digital experiences</div>
      </div>
      <div class="thumb-gallery">
        <div class="thumb-gallery-item"></div>
        <div class="thumb-gallery-item"></div>
        <div class="thumb-gallery-item"></div>
      </div>
    </div>
  `;
}

function buildRestaurantThumbnail() {
  return `
    <div class="template-thumbnail thumbnail-restaurant">
      <div class="thumb-header-elegant">
        <span class="thumb-restaurant-name">La Belle Cuisine</span>
      </div>
      <div class="thumb-menu-preview">
        <div class="thumb-menu-category">Starters</div>
        <div class="thumb-menu-items">
          <div class="thumb-menu-item"><span>French Onion Soup</span><span>$14</span></div>
          <div class="thumb-menu-item"><span>Escargots de Bourgogne</span><span>$18</span></div>
          <div class="thumb-menu-item"><span>Tartare de Saumon</span><span>$19</span></div>
        </div>
      </div>
      <div class="thumb-gallery-row">
        <div class="thumb-food-img"></div>
        <div class="thumb-food-img"></div>
        <div class="thumb-food-img"></div>
        <div class="thumb-food-img"></div>
      </div>
    </div>
  `;
}

function buildLandingThumbnail() {
  return `
    <div class="template-thumbnail thumbnail-landing">
      <div class="thumb-product-showcase">
        <span class="thumb-product-badge">🚀 Now in Beta</span>
        <div class="thumb-product-title">LaunchPad</div>
        <div class="thumb-product-desc">Ship products faster than ever before</div>
        <div class="thumb-price-card">
          <div style="font-size: 2rem; font-weight: 800; color: #667eea;">$29</div>
          <div style="color: #666; font-size: 0.8rem;">/month Pro Plan</div>
        </div>
      </div>
      <div class="thumb-features-list">
        <div class="thumb-feature-item"><span class="thumb-check">✓</span> Lightning Fast</div>
        <div class="thumb-feature-item"><span class="thumb-check">✓</span> Enterprise Security</div>
        <div class="thumb-feature-item"><span class="thumb-check">✓</span> Team Collaboration</div>
      </div>
    </div>
  `;
}

/**
 * Initialize scroll-based animations using Intersection Observer
 */
function initAnimations() {
  // Check if Intersection Observer is supported
  if ('IntersectionObserver' in window) {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    // Observe elements that should animate on scroll
    const animateElements = document.querySelectorAll(
      '.feature-card, .step-card, .template-card, .section-header'
    );
    
    animateElements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });
  } else {
    // Fallback: show all elements immediately
    document.querySelectorAll('.feature-card, .step-card, .template-card').forEach(el => {
      el.style.opacity = '1';
    });
  }
}

/**
 * Initialize smooth scrolling for anchor links
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

/**
 * Add parallax effect to hero visual (subtle)
 */
function initParallax() {
  const heroVisual = document.querySelector('.hero-visual');
  
  if (!heroVisual) return;
  
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    if (scrolled < window.innerHeight) {
      heroVisual.style.transform = `translateY(${scrolled * 0.15}px)`;
    }
  });
}

// Initialize parallax on load
window.addEventListener('load', initParallax);
