/* ============================================
   ViewYourSite - Media Library
   Upload, manage, and use media files
   ============================================ */

const MediaLibrary = {
    storageKey: 'viewyoursite_media',
    items: [],
    maxItems: 100,
    maxSize: 5 * 1024 * 1024, // 5MB per file
    
    init() {
        this.loadFromStorage();
        return this;
    },
    
    loadFromStorage() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (data) {
                this.items = JSON.parse(data);
            }
        } catch (e) {
            console.warn('Failed to load media library:', e);
            this.items = [];
        }
    },
    
    saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.items));
        } catch (e) {
            console.warn('Storage full, clearing old media...');
            // Clear oldest items if storage is full
            this.items = this.items.slice(-50);
            try {
                localStorage.setItem(this.storageKey, JSON.stringify(this.items));
            } catch (e2) {
                Toast.show('Storage is full', 'error');
            }
        }
    },
    
    uploadFiles(fileList) {
        const files = Array.from(fileList);
        let uploaded = 0;
        let failed = 0;
        
        files.forEach((file, index) => {
            // Check file size
            if (file.size > this.maxSize) {
                Toast.show(`${file.name} is too large (max 5MB)`, 'error');
                failed++;
                return;
            }
            
            // Check item limit
            if (this.items.length >= this.maxItems) {
                Toast.show('Media library is full', 'warning');
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const item = {
                    id: 'media-' + Date.now() + '-' + index,
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    url: e.target.result,
                    uploadedAt: Date.now()
                };
                
                this.items.unshift(item); // Add to beginning
                this.saveToStorage();
                uploaded++;
                
                if (uploaded + failed === files.length) {
                    Toast.show(`${uploaded} file(s) uploaded`, 'success');
                }
            };
            
            reader.onerror = () => {
                failed++;
                Toast.show(`Failed to upload ${file.name}`, 'error');
            };
            
            reader.readAsDataURL(file);
        });
        
        if (files.length === 0) {
            Toast.show('No files selected', 'info');
        }
    },
    
    getItem(id) {
        return this.items.find(item => item.id === id);
    },
    
    getItems(type = null) {
        if (type) {
            return this.items.filter(item => item.type.startsWith(type));
        }
        return this.items;
    },
    
    getImages() {
        return this.getItems('image');
    },
    
    getVideos() {
        return this.getItems('video');
    },
    
    deleteItem(id) {
        const index = this.items.findIndex(item => item.id === id);
        if (index !== -1) {
            const item = this.items[index];
            this.items.splice(index, 1);
            this.saveToStorage();
            Toast.show(`"${item.name}" deleted`, 'success');
            return true;
        }
        return false;
    },
    
    renameItem(id, newName) {
        const item = this.getItem(id);
        if (item && newName.trim()) {
            item.name = newName.trim();
            this.saveToStorage();
            return true;
        }
        return false;
    },
    
    search(query) {
        const q = query.toLowerCase();
        return this.items.filter(item =>
            item.name.toLowerCase().includes(q) ||
            item.type.toLowerCase().includes(q)
        );
    },
    
    clearAll() {
        if (confirm('Are you sure you want to delete all media?')) {
            this.items = [];
            this.saveToStorage();
            Toast.show('Media library cleared', 'success');
        }
    },
    
    getTotalSize() {
        return this.items.reduce((total, item) => total + (item.size || 0), 0);
    },
    
    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    },
    
    exportMedia() {
        return {
            count: this.items.length,
            totalSize: this.getTotalSize(),
            items: this.items.map(item => ({
                id: item.id,
                name: item.name,
                type: item.type,
                size: item.size,
                hasData: !!item.url
            }))
        };
    }
};

// Make globally available
window.MediaLibrary = MediaLibrary;
