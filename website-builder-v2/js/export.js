/**
 * ViewYourSite - Professional Website Builder
 * Export System (export.js)
 * 
 * This file handles:
 * - Full site export to HTML/CSS/JS
 * - Single page export
 * - Sitemap generation
 * - Download functionality
 */

// ============================================
// Export Manager
// ============================================

const ExportSystem = {
    /**
     * Export the website
     */
    export() {
        const exportType = document.querySelector('input[name="exportType"]:checked')?.value || 'full';
        const options = {
            inlineCSS: document.getElementById('exportInlineCSS')?.checked ?? true,
            optimizeImages: document.getElementById('exportOptimizeImages')?.checked ?? true,
            sitemap: document.getElementById('exportSitemap')?.checked ?? true
        };
        
        if (exportType === 'single') {
            this.exportSinglePage(options);
        } else {
            this.exportFullSite(options);
        }
    },
    
    /**
     * Export a single page
     */
    exportSinglePage(options) {
        const currentPage = PagesManager.getCurrentPage();
        if (!currentPage) {
            Toast.error('No page selected');
            return;
        }
        
        // Generate HTML
        const html = this.generatePageHTML(currentPage, options);
        
        // Create download
        this.downloadFile(html, `${currentPage.slug || currentPage.name}.html`, 'text/html');
        
        Toast.success(`"${currentPage.name}" exported successfully`);
    },
    
    /**
     * Export full site
     */
    exportFullSite(options) {
        const pages = PagesManager.getAllPages();
        
        if (pages.length === 0) {
            Toast.error('No pages to export');
            return;
        }
        
        // Generate all HTML files
        const files = [];
        
        pages.forEach(page => {
            if (page.type === 'link') return; // Skip external links
            
            const html = this.generatePageHTML(page, options, pages);
            files.push({
                name: page.isHome ? 'index.html' : `${page.slug || page.name.toLowerCase().replace(/\s+/g, '-')}.html`,
                content: html,
                type: 'text/html'
            });
        });
        
        // Generate CSS file if not inlining
        if (!options.inlineCSS) {
            files.push({
                name: 'styles.css',
                content: this.generateCSS(),
                type: 'text/css'
            });
        }
        
        // Generate sitemap
        if (options.sitemap) {
            files.push({
                name: 'sitemap.xml',
                content: this.generateSitemap(pages),
                type: 'application/xml'
            });
        }
        
        // For single-file download, create ZIP-like structure or download main file
        if (files.length === 1) {
            this.downloadFile(files[0].content, files[0].name, files[0].type);
        } else {
            // Download each file (in production, would use JSZip)
            this.downloadMultipleFiles(files);
        }
        
        Toast.success(`Exported ${files.length} files`);
    },
    
    /**
     * Generate HTML for a single page
     */
    generatePageHTML(page, options, allPages = null) {
        const components = page.components || [];
        
        // Render component HTML
        let bodyContent = '';
        components.forEach(comp => {
            bodyContent += ComponentRenderer.renderForExport(comp);
        });
        
        // Generate navigation
        let navHTML = '';
        if (allPages && page.showHeader !== false) {
            const navItems = allPages.filter(p => p.enabled !== false && p.type !== 'link').map(p => {
                const href = p.isHome ? 'index.html' : `${p.slug || p.name.toLowerCase().replace(/\s+/g, '-')}.html`;
                return `<a href="${href}" class="${p.id === page.id ? 'active' : ''}">${p.navTitle || p.name}</a>`;
            }).join('\n                ');
            
            navHTML = `
            <header class="site-header">
                <div class="header-container">
                    <a href="index.html" class="logo">ViewYourSite</a>
                    <nav class="main-nav">
                        ${navItems}
                    </nav>
                </div>
            </header>`;
        }
        
        // Generate footer
        let footerHTML = '';
        if (page.showFooter !== false) {
            footerHTML = `
            <footer class="site-footer">
                <div class="footer-container">
                    <p>&copy; ${new Date().getFullYear()} ViewYourSite. Built with ViewYourSite Builder.</p>
                </div>
            </footer>`;
        }
        
        // Page background styles
        const bgStyles = this.getPageBackgroundStyles(page.background);
        
        // Build complete HTML
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.escapeHTML(page.metaTitle || page.name)}</title>
    ${page.metaDescription ? `<meta name="description" content="${this.escapeHTML(page.metaDescription)}">` : ''}
    ${page.socialImage ? `<meta property="og:image" content="${page.socialImage}">` : ''}
    <meta name="generator" content="ViewYourSite Builder">
    
    ${options.inlineCSS ? `<style>
${this.getInlineCSS()}
</style>` : '<link rel="stylesheet" href="styles.css">'}
    
    ${page.headCode || ''}
</head>
<body style="${bgStyles}">
    
${navHTML}
    
    <main class="site-main">
        <div class="container" style="max-width: 1200px; margin: 0 auto; padding: 2rem;">
            ${bodyContent || '<p style="text-align: center; color: #999;">No content yet. Edit in ViewYourSite Builder.</p>'}
        </div>
    </main>
    
${footerHTML}
    
    ${page.bodyCode || ''}
    
</body>
</html>`;
        
        return html;
    },
    
    /**
     * Get page background as inline style
     */
    getPageBackgroundStyles(background) {
        if (!background || background.type === 'none') return '';
        
        switch (background.type) {
            case 'color':
                return `background-color: ${background.color};`;
            case 'gradient':
                if (background.gradientType === 'radial') {
                    return `background: radial-gradient(circle, ${background.color1}, ${background.color2});`;
                }
                return `background: linear-gradient(135deg, ${background.color1}, ${background.color2});`;
            case 'image':
                return `background-image: url('${background.image}'); background-size: cover; background-position: center;`;
            default:
                return '';
        }
    },
    
    /**
     * Generate inline CSS for exported site
     */
    getInlineCSS() {
        return `/* Generated by ViewYourSite Builder */
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: #1e293b;
}

/* Header */
.site-header {
    background: #ffffff;
    border-bottom: 1px solid #e2e8f0;
    position: sticky;
    top: 0;
    z-index: 100;
}

.header-container {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
}

.logo {
    font-weight: 700;
    font-size: 1.25rem;
    color: #6366f1;
    text-decoration: none;
}

.main-nav a {
    text-decoration: none;
    color: #475569;
    margin-left: 1.5rem;
    transition: color 0.2s;
}

.main-nav a:hover,
.main-nav a.active {
    color: #6366f1;
}

/* Main Content */
.site-main {
    min-height: calc(100vh - 160px);
}

/* Footer */
.site-footer {
    background: #1e293b;
    color: #94a3b8;
    padding: 2rem;
    text-align: center;
}

.site-footer a {
    color: #6366f1;
    text-decoration: none;
}

/* Container */
.container {
    max-width: 1200px;
    margin: 0 auto;
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: 1rem;
    color: #0f172a;
}

h1 { font-size: 2.5rem; }
h2 { font-size: 2rem; }
h3 { font-size: 1.75rem; }
h4 { font-size: 1.5rem; }
h5 { font-size: 1.25rem; }
h6 { font-size: 1.125rem; }

p {
    margin-bottom: 1rem;
    color: #334155;
}

/* Images */
img {
    max-width: 100%;
    height: auto;
}

/* Buttons */
.btn-primary,
.button-component.filled {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 12px 24px;
    background-color: #6366f1;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    transition: background-color 0.2s;
}

.btn-primary:hover,
.button-component.filled:hover {
    background-color: #4f46e5;
}

.button-component.outline {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 11px 23px;
    background: transparent;
    border: 2px solid #6366f1;
    color: #6366f1;
    border-radius: 6px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.2s;
}

.button-component.outline:hover {
    background-color: rgba(99, 102, 241, 0.1);
}

.button-component.ghost {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 12px 24px;
    background: transparent;
    color: #6366f1;
    font-weight: 600;
    text-decoration: none;
    transition: background-color 0.2s;
}

.button-component.ghost:hover {
    background-color: rgba(99, 102, 241, 0.1);
}

/* Section */
.section-component {
    padding: 48px 24px;
    border-radius: 8px;
}

/* Quote */
.quote-component {
    padding-left: 24px;
    border-left: 4px solid #6366f1;
    font-style: italic;
    color: #334155;
}

.quote-component cite {
    display: block;
    margin-top: 8px;
    font-size: 0.875rem;
    color: #64748b;
}

/* Code Block */
.code-component {
    background: #1a1a2e;
    border-radius: 8px;
    padding: 16px;
    overflow-x: auto;
}

.code-component code {
    color: #e2e8f0;
    font-family: 'Courier New', monospace;
    font-size: 0.875rem;
    line-height: 1.6;
}

/* Divider */
.divider-component {
    border: none;
    height: 1px;
    background: #e2e8f0;
    margin: 16px 0;
}

.divider-component.dashed {
    border-top: 1px dashed #e2e8f0;
}

.divider-component.dotted {
    border-top: 1px dotted #e2e8f0;
}

/* Form */
.form-component {
    max-width: 500px;
}

.form-field {
    margin-bottom: 16px;
}

.form-field label {
    display: block;
    font-weight: 500;
    margin-bottom: 4px;
    color: #374151;
}

.form-field input,
.form-field textarea,
.form-field select {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 1rem;
    color: #111827;
}

.form-field input:focus,
.form-field textarea:focus,
.form-field select:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.form-submit-btn {
    width: 100%;
    padding: 12px 24px;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
}

.form-submit-btn:hover {
    background: #4f46e5;
}

/* Accordion */
.accordion-item {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 8px;
}

.accordion-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #f8fafc;
    cursor: pointer;
    user-select: none;
}

.accordion-header:hover {
    background: #f1f5f9;
}

.accordion-header h4 {
    margin: 0;
    font-size: 1rem;
}

.accordion-content {
    padding: 12px 16px;
    display: none;
}

.accordion-item.open .accordion-content {
    display: block;
}

/* Tabs */
.tabs-nav {
    display: flex;
    border-bottom: 2px solid #e2e8f0;
}

.tab-btn {
    padding: 10px 20px;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
    color: #64748b;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.tab-btn:hover {
    color: #374151;
}

.tab-btn.active {
    color: #6366f1;
    border-bottom-color: #6366f1;
}

.tab-pane {
    display: none;
    padding: 16px 0;
}

.tab-pane.active {
    display: block;
}

/* Social Links */
.social-links-component {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.social-link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background: #f1f5f9;
    border-radius: 8px;
    color: #64748b;
    text-decoration: none;
    transition: all 0.2s;
}

.social-link:hover {
    background: #6366f1;
    color: white;
    transform: translateY(-2px);
}

/* Columns */
.columns-component {
    display: grid;
    gap: 24px;
}

.columns-component.cols-2 { grid-template-columns: repeat(2, 1fr); }
.columns-component.cols-3 { grid-template-columns: repeat(3, 1fr); }
.columns-component.cols-4 { grid-template-columns: repeat(4, 1fr); }

@media (max-width: 768px) {
    .columns-component {
        grid-template-columns: 1fr !important;
    }
    
    .header-container {
        flex-direction: column;
        gap: 16px;
    }
    
    .main-nav {
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
        justify-content: center;
    }
    
    .main-nav a {
        margin: 0;
    }
}`;
    },
    
    /**
     * Generate separate CSS file
     */
    generateCSS() {
        return this.getInlineCSS();
    },
    
    /**
     * Generate sitemap XML
     */
    generateSitemap(pages) {
        const today = new Date().toISOString().split('T')[0];
        const validPages = pages.filter(p => p.type !== 'link' && p.enabled !== false);
        
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
        
        validPages.forEach(page => {
            const slug = page.isHome ? '' : (page.slug || page.name.toLowerCase().replace(/\s+/g, '-'));
            xml += `  <url>\n`;
            xml += `    <loc>https://yourwebsite.com/${slug}</loc>\n`;
            xml += `    <lastmod>${today}</lastmod>\n`;
            xml += `    <changefreq>weekly</changefreq>\n`;
            xml += `    <priority>${page.isHome ? '1.0' : '0.8'}</priority>\n`;
            xml += `  </url>\n`;
        });
        
        xml += '</urlset>';
        
        return xml;
    },
    
    /**
     * Download a single file
     */
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    },
    
    /**
     * Download multiple files (sequential download)
     */
    downloadMultipleFiles(files) {
        // Download first file (usually index.html)
        if (files.length > 0) {
            this.downloadFile(files[0].content, files[0].name, files[0].type);
            
            Toast.info(`Downloaded ${files[0].name}. Other files need to be downloaded individually in production.`);
            
            // Show list of other files
            setTimeout(() => {
                const fileList = files.slice(1).map(f => f.name).join(', ');
                Toast.info(`Other files: ${fileList}`);
            }, 2000);
        }
    },
    
    /**
     * Escape HTML special characters
     */
    escapeHTML(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    },
    
    /**
     * Generate preview HTML (used by PreviewSystem)
     */
    generatePreviewHTML() {
        const currentPage = PagesManager.getCurrentPage();
        if (!currentPage) return '<html><body>No page</body></html>';
        
        return this.generatePageHTML(currentPage, {
            inlineCSS: true,
            optimizeImages: false,
            sitemap: false
        }, PagesManager.getAllPages());
    }
};

// Expose globally
window.ExportSystem = ExportSystem;
