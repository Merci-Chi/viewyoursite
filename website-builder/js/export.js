/**
 * ViewYourSite - Export Module
 * Handles generating and downloading standalone HTML files
 */

/**
 * Generate a complete, standalone HTML file from the current canvas content
 * @param {string} title - Page title
 * @param {string} filename - Output filename (without extension)
 */
function generateAndDownloadHTML(title = 'My Website', filename = 'website') {
  // Get the clean HTML content from the canvas
  const canvasContent = getExportableContent();
  
  if (!canvasContent || !canvasContent.trim()) {
    showToast('Nothing to export! Add some content first.', 'error');
    return;
  }
  
  // Build the complete HTML document
  const fullHTML = buildCompleteHTML(title, canvasContent);
  
  // Create download
  downloadHTML(fullHTML, filename + '.html');
  
  showToast('Website exported successfully! 🎉', 'success');
}

/**
 * Get the exportable HTML content from the canvas
 * This extracts the actual website content without editor wrappers
 * @returns {string} Clean HTML string ready for export
 */
function getExportableContent() {
  const canvas = document.getElementById('canvas');
  if (!canvas) return '';
  
  // Clone the canvas to work with
  const clone = canvas.cloneNode(true);
  
  // Remove empty state placeholder
  const emptyState = clone.querySelector('#canvasEmpty');
  if (emptyState) emptyState.remove();
  
  // Process each canvas element
  clone.querySelectorAll('.canvas-element').forEach(element => {
    processElementForExport(element);
  });
  
  return clone.innerHTML;
}

/**
 * Process a single element for export
 * Removes editor-specific markup and cleans up styles
 * @param {HTMLElement} element - The canvas element to process
 */
function processElementForExport(element) {
  // Remove editor controls
  const controls = element.querySelector('.element-controls');
  if (controls) controls.remove();
  
  // Remove resize handles
  element.querySelectorAll('.resize-handle').forEach(h => h.remove());
  
  // Get the content element
  const contentEl = element.querySelector('.element-content');
  
  if (contentEl) {
    // Make content not editable for export
    contentEl.removeAttribute('contentEditable');
    contentEl.classList.remove('element-content');
    
    // Transfer inline styles from wrapper to content where appropriate
    const wrapperStyles = element.getAttribute('style') || '';
    const contentStyles = contentEl.getAttribute('style') || '';
    
    // For containers, keep wrapper styles on the outer element
    // For text/media elements, ensure content has proper styling
    
    // Move content up in DOM structure
    const parent = element.parentNode;
    
    // Check if this is a container-type element
    const isContainer = element.dataset.type === 'container' || 
                        element.dataset.type === 'layout' ||
                        element.dataset.component === 'section' ||
                        element.dataset.component === 'hero' ||
                        element.dataset.component === 'footer' ||
                        element.dataset.component === 'cta';
    
    if (isContainer) {
      // Keep as container, just clean up
      element.classList.remove('canvas-element', 'selected', 'drag-over');
      element.removeAttribute('data-editable');
      element.removeAttribute('data-component');
      element.removeAttribute('data-type');
      
      // Clean up content element
      if (contentEl) {
        contentEl.removeAttribute('contentEditable');
        contentEl.classList.remove('element-content');
      }
    } else {
      // Replace wrapper with content
      const newElement = document.createElement(contentEl.tagName.toLowerCase() || 'div');
      
      // Copy attributes
      if (contentEl.id) newElement.id = contentEl.id;
      if (contentEl.className) newElement.className = contentEl.className.replace('element-content', '').trim();
      
      // Combine styles - prefer content styles, fallback to wrapper
      let finalStyle = contentStyles;
      if (!finalStyle && wrapperStyles) {
        finalStyle = wrapperStyles;
      }
      if (finalStyle) newElement.setAttribute('style', finalStyle);
      
      // Copy inner content
      newElement.innerHTML = contentEl.innerHTML;
      
      // Replace in parent
      parent.replaceChild(newElement, element);
    }
  } else {
    // No content element, just clean up the wrapper
    element.classList.remove('canvas-element', 'selected', 'drag-over');
    element.removeAttribute('data-editable');
    element.removeAttribute('data-component');
    element.removeAttribute('data-type');
  }
}

/**
 * Build a complete HTML document string
 * @param {string} title - Page title
 * @param {string} bodyContent - The body content HTML
 * @returns {string} Complete HTML document
 */
function buildCompleteHTML(title, bodyContent) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="Created with ViewYourSite - Free Website Builder">
  
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@600;700;800&display=swap" rel="stylesheet">
  
  <style>
    /* ============================================
       Exported Website Styles
       Generated by ViewYourSite Builder
       ============================================ */
    
    /* Reset & Base */
    *, *::before, *::after {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    html {
      font-size: 16px;
      scroll-behavior: smooth;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1A202C;
      line-height: 1.6;
      min-height: 100vh;
    }
    
    /* Typography */
    h1, h2, h3, h4, h5, h6 {
      font-family: 'Poppins', 'Inter', sans-serif;
      font-weight: 700;
      line-height: 1.2;
      color: #1A202C;
    }
    
    p {
      color: #4A5568;
      line-height: 1.7;
    }
    
    a {
      color: #E85D4C;
      text-decoration: none;
      transition: color 0.2s ease;
    }
    
    a:hover {
      color: #C94A3A;
    }
    
    /* Container utility */
    .container {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
    }
    
    /* Button base styles */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 14px 32px;
      font-family: inherit;
      font-size: 1rem;
      font-weight: 600;
      border: none;
      border-radius: 30px;
      cursor: pointer;
      transition: all 0.25s ease;
      text-decoration: none;
    }
    
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(232, 93, 76, 0.35);
    }
    
    .btn-primary {
      background: linear-gradient(135deg, #E85D4C 0%, #F6AD55 100%);
      color: white;
    }
    
    .btn-secondary {
      background: white;
      border: 2px solid #e2e8f0;
      color: #1a202c;
    }
    
    /* Form input styles */
    input[type="text"],
    input[type="email"],
    textarea,
    select {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-family: inherit;
      font-size: 1rem;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }
    
    input:focus,
    textarea:focus,
    select:focus {
      outline: none;
      border-color: #E85D4C;
      box-shadow: 0 0 0 3px rgba(232, 93, 76, 0.15);
    }
    
    /* Responsive images */
    img {
      max-width: 100%;
      height: auto;
      display: block;
    }
    
    /* Section spacing helper */
    section {
      position: relative;
    }
    
    /* Smooth transitions */
    * {
      transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 150ms;
    }
    
    /* Responsive utilities */
    @media (max-width: 768px) {
      body {
        font-size: 15px;
      }
      
      h1 { font-size: 1.75rem; }
      h2 { font-size: 1.5rem; }
      h3 { font-size: 1.25rem; }
      
      .btn {
        padding: 12px 24px;
        font-size: 0.95rem;
      }
    }
    
    /* Print styles */
    @media print {
      body {
        background: white;
      }
      
      nav, footer, .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
${bodyContent}
  
  <!-- Footer attribution -->
  <div style="text-align: center; padding: 24px; font-size: 0.85rem; color: #a0aec0;">
    Built with <a href="#" style="color: #E85D4C;">ViewYourSite</a> - Free Website Builder
  </div>
</body>
</html>`;
}

/**
 * Trigger download of an HTML file
 * @param {string} htmlContent - The HTML content to download
 * @param {string} filename - The filename for download
 */
function downloadHTML(htmlContent, filename) {
  // Create blob from HTML content
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  
  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  
  // Append to body, click, then cleanup
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Revoke URL after delay
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Quick export function that can be called programmatically
 * Uses default values or saved preferences
 */
function quickExport() {
  const savedTitle = localStorage.getItem('viewyoursite_export_title') || 'My Website';
  const savedFilename = localStorage.getItem('viewyoursite_export_filename') || 'website';
  
  generateAndDownloadHTML(savedTitle, savedFilename);
}
