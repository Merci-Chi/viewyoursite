/* ============================================
   ViewYourSite v1.1 - Element Definitions
   ============================================ */

// Element registry
const Elements = {
    text: { name: 'Text', icon: 'fa-font' },
    heading: { name: 'Heading', icon: 'fa-heading' },
    image: { name: 'Image', icon: 'fa-image' },
    video: { name: 'Video', icon: 'fa-video' },
    button: { name: 'Button', icon: 'fa-square' },
    link: { name: 'Link', icon: 'fa-link' },
    divider: { name: 'Divider', icon: 'fa-minus' },
    spacer: { name: 'Spacer', icon: 'fa-arrows-alt-v' },
    container: { name: 'Container', icon: 'fa-square-full' },
    section: { name: 'Section', icon: 'fa-layer-group' },
    columns: { name: 'Columns', icon: 'fa-columns' },
    grid: { name: 'Grid', icon: 'fa-th' },
    form: { name: 'Form', icon: 'fa-wpforms' },
    input: { name: 'Input', icon: 'fa-i-cursor' },
    textarea: { name: 'Textarea', icon: 'fa-align-left' },
    checkbox: { name: 'Checkbox', icon: 'fa-check-square' },
    select: { name: 'Select', icon: 'fa-caret-down' },
    accordion: { name: 'Accordion', icon: 'fa-bars' },
    tabs: { name: 'Tabs', icon: 'fa-folder' },
    icon: { name: 'Icon', icon: 'fa-smile' },
    social: { name: 'Social', icon: 'fa-share-alt' },
    map: { name: 'Map', icon: 'fa-map-marked-alt' },
    embed: { name: 'Embed', icon: 'fa-code' },
    html: { name: 'HTML', icon: 'fa-file-code' }
};

// Search/filter elements
function initElementSearch() {
    const search = document.getElementById('elementSearch');
    if (!search) return;
    
    search.addEventListener('input', e => {
        const q = e.target.value.toLowerCase();
        document.querySelectorAll('.element-item').forEach(item => {
            const name = item.querySelector('span').textContent.toLowerCase();
            const type = item.dataset.type;
            item.style.display = (name.includes(q) || type.includes(q)) ? '' : 'none';
        });
        
        // Hide empty categories
        document.querySelectorAll('.element-category').forEach(cat => {
            const visible = [...cat.querySelectorAll('.element-item')].some(i => i.style.display !== 'none');
            cat.style.display = visible ? '' : 'none';
        });
    });
}

document.addEventListener('DOMContentLoaded', initElementSearch);
