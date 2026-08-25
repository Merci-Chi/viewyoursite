/**
 * ViewYourSite - Professional Website Builder
 * Media Library (media.js)
 * 
 * This file handles:
 * - Media upload and storage
 * - Image/video/file management
 * - Media grid rendering
 * - Search and filter
 * - Selection callback for inserting media
 */

// ============================================
// Media Store
// ============================================

const MediaStore = {
    items: [],
    
    /**
     * Get all media items
     */
    getAll() {
        return this.items;
    },
    
    /**
     * Set items (for loading)
     */
    set(items) {
        this.items = items || [];
    },
    
    /**
     * Add a new media item
     */
    add(item) {
        item.id = generateId();
        item.createdAt = new Date().toISOString();
        this.items.unshift(item); // Add to beginning
        return item;
    },
    
    /**
     * Remove an item by ID
     */
    remove(id) {
        const index = this.items.findIndex(i => i.id === id);
        if (index !== -1) {
            return this.items.splice(index, 1)[0];
        }
        return null;
    },
    
    /**
     * Get item by ID
     */
    getById(id) {
        return this.items.find(i => i.id === id);
    },
    
    /**
     * Filter by type
     */
    getByType(type) {
        return this.items.filter(i => i.type === type);
    },
    
    /**
     * Search items by name
     */
    search(query) {
        const q = query.toLowerCase();
        return this.items.filter(i => 
            i.name.toLowerCase().includes(q) ||
            (i.alt && i.alt.toLowerCase().includes(q))
        );
    }
};

// ============================================
// Media Library Manager
// ============================================

const MediaLibrary = {
    initialized: false,
    selectionCallback: null,
    
    // Sample images for demo (base64 placeholders)
    sampleImages: [
        { name: 'Mountain Landscape', type: 'image', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop', thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&auto=format&fit=crop', size: '245 KB' },
        { name: 'Ocean Sunset', type: 'image', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop', thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&auto=format&fit=crop', size: '198 KB' },
        { name: 'Forest Path', type: 'image', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&auto=format&fit=crop', thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&auto=format&fit=crop', size: '312 KB' },
        { name: 'City Skyline', type: 'image', url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&auto=format&fit=crop', thumbnail: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=200&auto=format&fit=crop', size: '276 KB' },
        { name: 'Abstract Art', type: 'image', url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&auto=format&fit=crop', thumbnail: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=200&auto=format&fit=crop', size: '189 KB' },
        { name: 'Technology', type: 'image', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop', thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&auto=format&fit=crop', size: '234 KB' }
    ],
    
    /**
     * Initialize the media library
     */
    init() {
        this.setupUploadZone();
        this.setupSearch();
        this.renderMediaGrids();
        
        // Load saved media or use samples
        const savedMedia = Storage.load(Storage.KEYS.MEDIA);
        if (savedMedia && savedMedia.length > 0) {
            MediaStore.set(savedMedia);
        } else {
            // Initialize with sample images
            this.sampleImages.forEach(img => {
                MediaStore.add({
                    ...img,
                    alt: img.name,
                    dateAdded: new Date().toISOString()
                });
            });
        }
        
        this.initialized = true;
        
        console.log('Media Library initialized');
    },
    
    /**
     * Setup file upload zone
     */
    setupUploadZone() {
        const zone = document.getElementById('uploadZone');
        const fileInput = document.getElementById('fileInput');
        
        if (!zone || !fileInput) return;
        
        // Click to browse
        zone.addEventListener('click', () => fileInput.click());
        
        // Drag and drop
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('dragover');
        });
        
        zone.addEventListener('dragleave', () => {
            zone.classList.remove('dragover');
        });
        
        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            this.handleFiles(files);
        });
        
        // File input change
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                this.handleFiles(fileInput.files);
                fileInput.value = ''; // Reset
            }
        });
    },
    
    /**
     * Handle uploaded files
     */
    handleFiles(files) {
        Array.from(files).forEach(file => {
            // Validate file type
            if (!this.isValidFileType(file)) {
                Toast.error(`Invalid file type: ${file.name}`);
                return;
            }
            
            // Check file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                Toast.error(`File too large: ${file.name} (max 10MB)`);
                return;
            }
            
            // Process file
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const fileType = this.getFileType(file);
                
                const mediaItem = {
                    name: file.name,
                    type: fileType,
                    size: this.formatFileSize(file.size),
                    url: e.target.result, // Data URL for local storage
                    thumbnail: fileType === 'image' ? e.target.result : null,
                    alt: file.name.replace(/\.[^/.]+$/, ''),
                    dateAdded: new Date().toISOString()
                };
                
                MediaStore.add(mediaItem);
                this.renderMediaGrids();
                AutoSave.save();
                
                Toast.success(`${file.name} uploaded`);
            };
            
            reader.onerror = () => {
                Toast.error(`Failed to read file: ${file.name}`);
            };
            
            reader.readAsDataURL(file);
        });
    },
    
    /**
     * Validate file type
     */
    isValidFileType(file) {
        const validTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
            'video/mp4',
            'video/webm',
            'application/pdf'
        ];
        
        return validTypes.includes(file.type) || 
               /\.(jpe?g|png|gif|webp|svg|mp4|webm|pdf)$/i.test(file.name);
    },
    
    /**
     * Get media type from file
     */
    getFileType(file) {
        if (file.type.startsWith('image/')) return 'image';
        if (file.type.startsWith('video/')) return 'video';
        if (file.type === 'application/pdf') return 'document';
        return 'file';
    },
    
    /**
     * Format file size
     */
    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    },
    
    /**
     * Setup search functionality
     */
    setupSearch() {
        const searchInput = document.getElementById('mediaSearch');
        if (!searchInput) return;
        
        searchInput.addEventListener('input', debounce((e) => {
            const query = e.target.value.trim();
            this.renderFilteredMedia(query);
        }, 300));
    },
    
    /**
     * Render all media grids
     */
    renderMediaGrids() {
        this.renderImagesGrid();
        this.renderVideosGrid();
        this.renderFilesList();
    },
    
    /**
     * Render filtered media based on search query
     */
    renderFilteredMedia(query) {
        const items = query ? MediaStore.search(query) : MediaStore.getAll();
        const images = items.filter(i => i.type === 'image');
        const videos = items.filter(i => i.type === 'video');
        const files = items.filter(i => !['image', 'video'].includes(i.type));
        
        this.populateImagesGrid(images);
        this.populateVideosGrid(videos);
        this.populateFilesList(files);
    },
    
    /**
     * Render images grid
     */
    renderImagesGrid() {
        const images = MediaStore.getByType('image');
        this.populateImagesGrid(images);
    },
    
    /**
     * Populate images grid
     */
    populateImagesGrid(images) {
        const container = document.getElementById('imagesGrid');
        if (!container) return;
        
        if (images.length === 0) {
            container.innerHTML = `
                <div class="empty-media" style="grid-column: span 3; text-align: center; padding: 40px; color: var(--text-muted);">
                    <p>No images yet</p>
                    <p style="font-size: 0.8rem;">Upload images using the Upload tab</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = images.map(item => `
            <div class="media-item" data-media-id="${item.id}" data-type="${item.type}">
                <img src="${item.thumbnail || item.url}" alt="${item.alt || item.name}" loading="lazy">
                <div class="media-item-overlay">
                    <span class="media-item-name">${item.name}</span>
                </div>
            </div>
        `).join('');
        
        this.attachMediaItemEvents(container);
    },
    
    /**
     * Render videos grid
     */
    renderVideosGrid() {
        const videos = MediaStore.getByType('video');
        this.populateVideosGrid(videos);
    },
    
    /**
     * Populate videos grid
     */
    populateVideosGrid(videos) {
        const container = document.getElementById('videosGrid');
        if (!container) return;
        
        if (videos.length === 0) {
            container.innerHTML = `
                <div class="empty-media" style="grid-column: span 3; text-align: center; padding: 40px; color: var(--text-muted);">
                    <p>No videos yet</p>
                    <p style="font-size: 0.8rem;">Upload videos using the Upload tab</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = videos.map(item => `
            <div class="media-item" data-media-id="${item.id}" data-type="${item.type}">
                <video src="${item.url}" muted></video>
                <div class="media-item-overlay">
                    <span class="media-item-name">${item.name}</span>
                </div>
            </div>
        `).join('');
        
        this.attachMediaItemEvents(container);
    },
    
    /**
     * Render files list
     */
    renderFilesList() {
        const files = MediaStore.getAll().filter(i => !['image', 'video'].includes(i.type));
        this.populateFilesList(files);
    },
    
    /**
     * Populate files list
     */
    populateFilesList(files) {
        const container = document.getElementById('filesList');
        if (!container) return;
        
        if (files.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                    <p>No documents yet</p>
                    <p style="font-size: 0.8rem;">Upload files using the Upload tab</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div class="media-list-items">
                ${files.map(item => `
                    <div class="media-list-item" data-media-id="${item.id}" data-type="${item.type}">
                        <div class="media-file-icon">
                            ${this.getFileIcon(item.name)}
                        </div>
                        <div class="media-file-info">
                            <span class="media-file-name">${item.name}</span>
                            <span class="media-file-size">${item.size}</span>
                        </div>
                        <button class="icon-btn small delete-media-btn" title="Delete">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
        
        // Attach events
        container.querySelectorAll('.media-list-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.delete-media-btn')) {
                    const id = item.dataset.mediaId;
                    const mediaItem = MediaStore.getById(id);
                    if (mediaItem && this.selectionCallback) {
                        this.selectionCallback(mediaItem);
                    }
                }
            });
            
            item.querySelector('.delete-media-btn')?.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = item.dataset.mediaId;
                this.deleteMedia(id);
            });
        });
    },
    
    /**
     * Get file icon SVG based on extension
     */
    getFileIcon(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        
        switch (ext) {
            case 'pdf':
                return `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 9"/></svg>`;
            case 'doc':
            case 'docx':
                return `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 9"/></svg>`;
            case 'xls':
            case 'xlsx':
                return `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 9"/></svg>`;
            default:
                return `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 9"/></svg>`;
        }
    },
    
    /**
     * Attach event listeners to media items in a grid
     */
    attachMediaItemEvents(container) {
        container.querySelectorAll('.media-item').forEach(item => {
            // Click to select/insert
            item.addEventListener('click', () => {
                const id = item.dataset.mediaId;
                const mediaItem = MediaStore.getById(id);
                
                if (mediaItem && this.selectionCallback) {
                    this.selectionCallback(mediaItem);
                } else {
                    // Default behavior: copy URL to clipboard or show preview
                    navigator.clipboard.writeText(mediaItem.url).then(() => {
                        Toast.info('Image URL copied to clipboard');
                    });
                }
            });
            
            // Right-click context menu for delete
            item.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                const id = item.dataset.mediaId;
                
                if (confirm('Delete this media item?')) {
                    this.deleteMedia(id);
                }
            });
        });
    },
    
    /**
     * Delete a media item
     */
    deleteMedia(id) {
        const item = MediaStore.getById(id);
        if (!item) return;
        
        MediaStore.remove(id);
        this.renderMediaGrids();
        AutoSave.save();
        
        Toast.success(`"${item.name}" deleted`);
    },
    
    /**
     * Open media library for selection
     * @param {Function} callback - Called with selected media item
     */
    openForSelection(callback) {
        this.selectionCallback = callback;
        
        // Switch to images tab
        document.querySelectorAll('.media-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.media-tab-content').forEach(p => p.classList.remove('active'));
        
        const imagesTab = document.querySelector('[data-tab="images"]');
        const imagesContent = document.getElementById('mediaTabImages');
        
        if (imagesTab) imagesTab.classList.add('active');
        if (imagesContent) imagesContent.classList.add('active');
        
        // Expand media panel if collapsed
        const panel = document.getElementById('mediaPanel');
        if (panel.classList.contains('collapsed')) {
            panel.classList.remove('collapsed');
        }
        
        // Scroll to media panel
        panel.scrollIntoView({ behavior: 'smooth' });
        
        Toast.info('Select an image to insert');
    },
    
    /**
     * Clear selection mode
     */
    clearSelection() {
        this.selectionCallback = null;
    },
    
    /**
     * Get all media items (for export/save)
     */
    getItems() {
        return MediaStore.getAll();
    },
    
    /**
     * Set media items (for loading)
     */
    setItems(items) {
        MediaStore.set(items);
        this.renderMediaGrids();
    }
};

// Expose globally
window.MediaLibrary = MediaLibrary;
window.MediaStore = MediaStore;
