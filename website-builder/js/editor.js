/**
 * ViewYourSite - Editor JavaScript
 * The core editor functionality including:
 * - Drag and drop components
 * - Element selection and editing
 * - Properties panel management
 * - Template loading
 * - Undo/Redo system
 * - Auto-save to localStorage
 */

// ============================================
// Global State
// ============================================
const EditorState = {
  selectedElement: null,
  history: [],
  historyIndex: -1,
  isDirty: false,
  maxHistorySize: 50,
  autoSaveTimeout: null
};

// ============================================
// Component Definitions (what gets created when dragging)
// ============================================
const COMPONENTS = {
  heading1: {
    type: 'heading',
    tag: 'h1',
    icon: 'H1',
    content: 'Heading 1 - Main Title',
    styles: {
      fontSize: '2.5rem',
      fontWeight: '700',
      color: '#1A202C',
      textAlign: 'center',
      padding: '16px'
    }
  },
  
  heading2: {
    type: 'heading',
    tag: 'h2',
    icon: 'H2',
    content: 'Heading 2 - Section Title',
    styles: {
      fontSize: '2rem',
      fontWeight: '700',
      color: '#1A202C',
      textAlign: 'left',
      padding: '12px'
    }
  },
  
  heading3: {
    type: 'heading',
    tag: 'h3',
    icon: 'H3',
    content: 'Heading 3 - Subsection Title',
    styles: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#1A202C',
      textAlign: 'left',
      padding: '8px'
    }
  },
  
  paragraph: {
    type: 'text',
    tag: 'p',
    icon: '¶',
    content: 'This is a paragraph of text. Click to edit this content and make it your own. You can change the text, font size, colors, and more using the properties panel on the right.',
    styles: {
      fontSize: '1rem',
      lineHeight: '1.7',
      color: '#4A5568',
      padding: '12px'
    }
  },
  
  quote: {
    type: 'text',
    tag: 'blockquote',
    icon: '❝',
    content: '"An inspiring quote that captures the essence of your message. Quotes add personality and depth to your content."',
    styles: {
      fontSize: '1.25rem',
      fontStyle: 'italic',
      color: '#4A5568',
      borderLeft: '4px solid #E85D4C',
      paddingLeft: '24px',
      padding: '16px',
      backgroundColor: '#FAFAFA'
    }
  },
  
  image: {
    type: 'media',
    tag: 'div',
    icon: '🖼️',
    content: '',
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=400&fit=crop',
    altText: 'Placeholder image',
    styles: {
      width: '100%',
      height: '300px',
      backgroundImage: 'url(https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=400&fit=crop)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      borderRadius: '12px'
    }
  },
  
  gallery: {
    type: 'media',
    tag: 'div',
    icon: '🎞️',
    content: '',
    styles: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '12px',
      padding: '16px'
    },
    children: [
      { type: 'image', aspectRatio: '1/1' },
      { type: 'image', aspectRatio: '1/1' },
      { type: 'image', aspectRatio: '1/1' }
    ]
  },
  
  video: {
    type: 'media',
    tag: 'div',
    icon: '▶️',
    content: '',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    styles: {
      position: 'relative',
      paddingBottom: '56.25%',
      height: '0',
      overflow: 'hidden',
      borderRadius: '12px'
    }
  },
  
  button: {
    type: 'interactive',
    tag: 'a',
    icon: '🔘',
    content: 'Click Me',
    linkUrl: '#',
    styles: {
      display: 'inline-block',
      padding: '14px 32px',
      background: 'linear-gradient(135deg, #E85D4C 0%, #F6AD55 100%)',
      color: '#FFFFFF',
      borderRadius: '30px',
      textDecoration: 'none',
      fontWeight: '600',
      fontSize: '1rem',
      textAlign: 'center'
    }
  },
  
  form: {
    type: 'interactive',
    tag: 'div',
    icon: '📝',
    content: '',
    styles: {
      padding: '24px',
      backgroundColor: '#F8F9FA',
      borderRadius: '12px'
    },
    isForm: true
  },
  
  social: {
    type: 'interactive',
    tag: 'div',
    icon: '🔗',
    content: '',
    styles: {
      display: 'flex',
      justifyContent: 'center',
      gap: '16px',
      padding: '24px',
      fontSize: '1.5rem'
    },
    isSocial: true
  },
  
  divider: {
    type: 'layout',
    tag: 'hr',
    icon: '➖',
    content: '',
    styles: {
      border: 'none',
      borderTop: '2px solid #E2E8F0',
      margin: '24px 0'
    }
  },
  
  spacer: {
    type: 'layout',
    tag: 'div',
    icon: '↕️',
    content: '',
    styles: {
      height: '48px'
    }
  },
  
  columns: {
    type: 'layout',
    tag: 'div',
    icon: '▤',
    content: '',
    styles: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '24px',
      padding: '16px'
    },
    isContainer: true
  },
  
  map: {
    type: 'layout',
    tag: 'div',
    icon: '🗺️',
    content: '',
    styles: {
      width: '100%',
      height: '300px',
      backgroundColor: '#E2E8F0',
      backgroundImage: 'url(https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/-122.4194,37.7749,11,0/600x300?access_token=pk.placeholder)',
      backgroundSize: 'cover',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#666',
      fontSize: '1rem'
    }
  },
  
  section: {
    type: 'container',
    tag: 'section',
    icon: '📦',
    content: '',
    styles: {
      padding: '60px 32px',
      backgroundColor: '#FFFFFF'
    },
    isContainer: true
  },
  
  hero: {
    type: 'container',
    tag: 'section',
    icon: '⭐',
    content: '',
    styles: {
      padding: '80px 32px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#FFFFFF',
      textAlign: 'center'
    },
    isContainer: true
  },
  
  cards: {
    type: 'container',
    tag: 'div',
    icon: '🃏',
    content: '',
    styles: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '24px',
      padding: '32px'
    },
    isContainer: true
  },
  
  features: {
    type: 'container',
    tag: 'div',
    icon: '✨',
    content: '',
    styles: {
      padding: '40px 32px',
      backgroundColor: '#FAFAFA'
    },
    isContainer: true
  },
  
  testimonials: {
    type: 'container',
    tag: 'div',
    icon: '💬',
    content: '',
    styles: {
      padding: '60px 32px',
      backgroundColor: '#FFFFFF',
      textAlign: 'center'
    },
    isContainer: true
  },
  
  cta: {
    type: 'container',
    tag: 'section',
    icon: '📣',
    content: '',
    styles: {
      padding: '80px 32px',
      background: 'linear-gradient(135deg, #E85D4C 0%, #F6AD55 100%)',
      color: '#FFFFFF',
      textAlign: 'center'
    },
    isContainer: true
  },
  
  footer: {
    type: 'container',
    tag: 'footer',
    icon: '🦶',
    content: '',
    styles: {
      padding: '40px 32px',
      backgroundColor: '#1A202C',
      color: '#FFFFFF',
      textAlign: 'center'
    },
    isContainer: true
  }
};

// ============================================
// Initialization
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  initEditor();
});

/**
 * Initialize the editor functionality
 */
function initEditor() {
  // Initialize all editor features
  initTemplateSelector();
  initDragAndDrop();
  initCanvasInteraction();
  initPropertiesPanel();
  initToolbarActions();
  initViewToggle();
  initKeyboardShortcuts();
  initComponentSearch();
  
  // Check for template in URL params
  const urlParams = new URLSearchParams(window.location.search);
  const templateParam = urlParams.get('template');
  
  if (templateParam && TEMPLATES[templateParam]) {
    // Load the specified template
    loadTemplate(templateParam);
    document.getElementById('templateSelect').value = templateParam;
  } else {
    // Try to restore from localStorage
    restoreFromLocalStorage();
  }
}

// ============================================
// Template Loading
// ============================================

/**
 * Initialize template selector dropdown
 */
function initTemplateSelector() {
  const select = document.getElementById('templateSelect');
  if (!select) return;
  
  select.addEventListener('change', function() {
    if (this.value) {
      loadTemplate(this.value);
    }
  });
}

/**
 * Load a template into the canvas
 * @param {string} templateId - ID of the template to load
 */
function loadTemplate(templateId) {
  const canvas = document.getElementById('canvas');
  const emptyState = document.getElementById('canvasEmpty');
  const templateHtml = getTemplateHtml(templateId);
  
  if (!canvas || !templateHtml) return;
  
  // Hide empty state
  if (emptyState) {
    emptyState.style.display = 'none';
  }
  
  // Clear canvas and add template content
  // Wrap each top-level element for editing
  const wrapper = document.createElement('div');
  wrapper.innerHTML = templateHtml;
  
  // Clear existing content (except empty state)
  Array.from(canvas.children).forEach(child => {
    if (child.id !== 'canvasEmpty') {
      child.remove();
    }
  });
  
  // Add template elements as editable
  const fragment = document.createDocumentFragment();
  
  Array.from(wrapper.children).forEach(child => {
    const editableElement = wrapElementForEditing(child);
    fragment.appendChild(editableElement);
  });
  
  canvas.appendChild(fragment);
  
  // Save state
  saveToHistory();
  saveToLocalStorage();
  
  // Show toast notification
  showToast(`Template "${TEMPLATES[templateId].name}" loaded!`, 'success');
}

/**
 * Wrap an HTML element for editing capabilities
 * @param {HTMLElement} element - The element to wrap
 * @returns {HTMLElement} The wrapped editable element
 */
function wrapElementForEditing(element) {
  const wrapper = document.createElement('div');
  wrapper.className = 'canvas-element';
  wrapper.setAttribute('data-editable', 'true');
  wrapper.setAttribute('data-type', element.tagName.toLowerCase());
  
  // Copy inline styles if any
  if (element.style.cssText) {
    wrapper.style.cssText = element.style.cssText;
  }
  
  // Create controls toolbar
  const controls = document.createElement('div');
  controls.className = 'element-controls';
  controls.innerHTML = `
    <button class="element-control-btn" title="Edit" onclick="editElementContent(this)">✏️</button>
    <button class="element-control-btn" title="Duplicate" onclick="duplicateElement(this)">📋</button>
    <button class="element-control-btn danger" title="Delete" onclick="deleteElement(this)">🗑️</button>
  `;
  
  // Add resize handles
  ['top', 'bottom', 'left', 'right'].forEach(pos => {
    const handle = document.createElement('div');
    handle.className = `resize-handle ${pos}`;
    handle.dataset.position = pos;
    wrapper.appendChild(handle);
  });
  
  wrapper.appendChild(controls);
  wrapper.appendChild(element);
  
  return wrapper;
}

// ============================================
// Drag and Drop Functionality
// ============================================

let draggedComponent = null;

/**
 * Initialize drag and drop for component palette
 */
function initDragAndDrop() {
  const componentItems = document.querySelectorAll('.component-item');
  const canvas = document.getElementById('canvas');
  
  componentItems.forEach(item => {
    item.addEventListener('dragstart', handleDragStart);
    item.addEventListener('dragend', handleDragEnd);
  });
  
  if (canvas) {
    canvas.addEventListener('dragover', handleDragOver);
    canvas.addEventListener('dragleave', handleDragLeave);
    canvas.addEventListener('drop', handleDrop);
  }
}

/**
 * Handle drag start event
 * @param {DragEvent} e - The drag event
 */
function handleDragStart(e) {
  draggedComponent = e.target.closest('.component-item');
  if (!draggedComponent) return;
  
  e.dataTransfer.setData('text/plain', draggedComponent.dataset.component);
  e.dataTransfer.effectAllowed = 'copy';
  
  draggedComponent.classList.add('dragging');
}

/**
 * Handle drag end event
 * @param {DragEvent} e - The drag event
 */
function handleDragEnd(e) {
  if (draggedComponent) {
    draggedComponent.classList.remove('dragging');
    draggedComponent = null;
  }
  
  // Remove drop zone indicators
  document.querySelectorAll('.drop-zone').forEach(zone => zone.remove());
}

/**
 * Handle drag over event
 * @param {DragEvent} e - The drag event
 */
function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';
  
  const canvas = document.getElementById('canvas');
  const emptyState = document.getElementById('canvasEmpty');
  
  // Hide empty state when dragging over
  if (emptyState) {
    emptyState.style.display = 'none';
  }
  
  // Show drop zone indicator if canvas is mostly empty
  if (canvas && canvas.children.length <= 1) {
    if (!canvas.querySelector('.drop-zone')) {
      const dropZone = document.createElement('div');
      dropZone.className = 'drop-zone active';
      dropZone.textContent = 'Drop component here';
      canvas.appendChild(dropZone);
    }
  }
}

/**
 * Handle drag leave event
 * @param {DragEvent} e - The drag event
 */
function handleDragLeave(e) {
  // Only remove if leaving the canvas itself
  if (e.target === document.getElementById('canvas')) {
    document.querySelectorAll('.drop-zone').forEach(zone => zone.remove());
  }
}

/**
 * Handle drop event - creates a new element from the dropped component
 * @param {DragEvent} e - The drop event
 */
function handleDrop(e) {
  e.preventDefault();
  
  const componentType = e.dataTransfer.getData('text/plain');
  if (!componentType || !COMPONENTS[componentType]) return;
  
  const canvas = document.getElementById('canvas');
  const emptyState = document.getElementById('canvasEmpty');
  
  // Remove drop zone indicator
  document.querySelectorAll('.drop-zone').forEach(zone => zone.remove());
  
  // Hide empty state
  if (emptyState) {
    emptyState.style.display = 'none';
  }
  
  // Create the new element
  const newElement = createComponentElement(componentType);
  
  // Find insertion point (before the drop target or at end)
  let insertBefore = null;
  const targetElement = document.elementFromPoint(e.clientX, e.clientY);
  if (targetElement) {
    const targetCanvasElement = targetElement.closest('.canvas-element');
    if (targetCanvasElement) {
      insertBefore = targetCanvasElement.nextSibling;
    }
  }
  
  // Insert the new element
  if (insertBefore) {
    canvas.insertBefore(newElement, insertBefore);
  } else {
    canvas.appendChild(newElement);
  }
  
  // Select the new element
  selectElement(newElement);
  
  // Save state
  saveToHistory();
  scheduleAutoSave();
  
  showToast(`${COMPONENTS[componentType].icon} ${componentType.replace(/([A-Z])/g, ' $1')} added!`, 'success');
}

/**
 * Create an element from a component definition
 * @param {string} componentType - Type of component to create
 * @returns {HTMLElement} The created canvas element
 */
function createComponentElement(componentType) {
  const config = COMPONENTS[componentType];
  if (!config) return document.createElement('div');
  
  const wrapper = document.createElement('div');
  wrapper.className = 'canvas-element';
  wrapper.setAttribute('data-editable', 'true');
  wrapper.setAttribute('data-component', componentType);
  wrapper.setAttribute('data-type', config.type);
  
  // Apply base styles
  Object.assign(wrapper.style, config.styles);
  
  // Create inner content based on component type
  let innerElement;
  
  switch (componentType) {
    case 'image':
      innerElement = document.createElement('div');
      innerElement.className = 'element-content';
      innerElement.contentEditable = 'false';
      innerElement.style.cssText = `
        width: 100%;
        height: 100%;
        min-height: 200px;
        background-image: url(${config.imageUrl});
        background-size: cover;
        background-position: center;
        border-radius: inherit;
        cursor: pointer;
      `;
      innerElement.dataset.imageUrl = config.imageUrl;
      break;
      
    case 'video':
      innerElement = document.createElement('div');
      innerElement.className = 'element-content';
      innerElement.innerHTML = `
        <iframe src="${config.videoUrl}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;" allowfullscreen></iframe>
      `;
      break;
      
    case 'form':
      innerElement = document.createElement('div');
      innerElement.className = 'element-content';
      innerElement.innerHTML = `
        <div style="margin-bottom: 16px;">
          <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Name</label>
          <input type="text" placeholder="Your name" style="width:100%;padding:12px;border:1px solid #ddd;border-radius:8px;font-size:1rem;">
        </div>
        <div style="margin-bottom: 16px;">
          <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Email</label>
          <input type="email" placeholder="your@email.com" style="width:100%;padding:12px;border:1px solid #ddd;border-radius:8px;font-size:1rem;">
        </div>
        <div style="margin-bottom: 16px;">
          <label style="display:block;margin-bottom:6px;font-weight:500;color:#333;">Message</label>
          <textarea placeholder="Your message..." rows="4" style="width:100%;padding:12px;border:1px solid #ddd;border-radius:8px;font-size:1rem;resize:vertical;"></textarea>
        </div>
        <button style="width:100%;padding:14px;background:linear-gradient(135deg,#E85D4C,#F6AD55);color:white;border:none;border-radius:8px;font-weight:600;cursor:pointer;">Send Message</button>
      `;
      break;
      
    case 'social':
      innerElement = document.createElement('div');
      innerElement.className = 'element-content';
      innerElement.innerHTML = `
        <span style="cursor:pointer;">🐦</span>
        <span style="cursor:pointer;">💼</span>
        <span style="cursor:pointer;">📸</span>
        <span style="cursor:pointer;">🎮</span>
        <span style="cursor:pointer;">📺</span>
      `;
      break;
      
    case 'gallery':
      innerElement = document.createElement('div');
      innerElement.className = 'element-content';
      innerElement.innerHTML = `
        <div style="aspect-ratio:1;background:linear-gradient(45deg,#e0e0e0,#f5f5f5);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:2rem;">🖼️</div>
        <div style="aspect-ratio:1;background:linear-gradient(45deg,#e8f4f8,#d0e8f0);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:2rem;">🎨</div>
        <div style="aspect-ratio:1;background:linear-gradient(45deg,#fff0f0,#ffe8e8);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:2rem;">✨</div>
      `;
      break;
      
    case 'map':
      innerElement = document.createElement('div');
      innerElement.className = 'element-content';
      innerElement.style.cssText = `
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 8px;
        color: #666;
      `;
      innerElement.innerHTML = `<span style="font-size:3rem;">🗺️</span><span>Map Embed</span>`;
      break;
      
    default:
      // For headings, paragraphs, quotes, buttons, etc.
      innerElement = document.createElement(config.tag);
      innerElement.className = 'element-content';
      innerElement.contentEditable = 'true';
      innerElement.textContent = config.content;
      
      // Apply text-specific styles
      if (config.type === 'heading' || config.type === 'text') {
        innerElement.style.fontSize = config.styles.fontSize;
        innerElement.style.fontWeight = config.styles.fontWeight;
        innerElement.style.color = config.styles.color;
        innerElement.style.textAlign = config.styles.textAlign;
        innerElement.style.lineHeight = config.styles.lineHeight || '1.4';
        innerElement.style.fontStyle = config.styles.fontStyle || 'normal';
        
        if (config.styles.borderLeft) {
          innerElement.style.borderLeft = config.styles.borderLeft;
          innerElement.style.paddingLeft = config.styles.paddingLeft;
        }
      }
      
      if (config.type === 'interactive' && componentType === 'button') {
        innerElement.href = config.linkUrl;
        innerElement.textContent = config.content;
      }
  }
  
  // Create controls toolbar
  const controls = document.createElement('div');
  controls.className = 'element-controls';
  controls.innerHTML = `
    <button class="element-control-btn" title="Edit" onclick="editElementContent(this)">✏️</button>
    <button class="element-control-btn" title="Duplicate" onclick="duplicateElement(this)">📋</button>
    <button class="element-control-btn danger" title="Delete" onclick="deleteElement(this)">🗑️</button>
  `;
  
  // Add resize handles
  ['top', 'bottom', 'left', 'right'].forEach(pos => {
    const handle = document.createElement('div');
    handle.className = `resize-handle ${pos}`;
    handle.dataset.position = pos;
    wrapper.appendChild(handle);
  });
  
  wrapper.appendChild(controls);
  
  if (innerElement) {
    wrapper.appendChild(innerElement);
  }
  
  return wrapper;
}

// ============================================
// Canvas Interaction & Selection
// ============================================

/**
 * Initialize click interactions on the canvas
 */
function initCanvasInteraction() {
  const canvas = document.getElementById('canvas');
  if (!canvas) return;
  
  // Use event delegation for canvas clicks
  canvas.addEventListener('click', function(e) {
    const clickedElement = e.target.closest('.canvas-element');
    
    if (clickedElement) {
      selectElement(clickedElement);
    } else if (e.target === canvas || e.target.id === 'canvasEmpty') {
      deselectAll();
    }
  });
  
  // Prevent editing when clicking controls
  canvas.addEventListener('mousedown', function(e) {
    if (e.target.closest('.element-controls') || e.target.closest('.resize-handle')) {
      e.stopPropagation();
    }
  });
}

/**
 * Select an element and show its properties
 * @param {HTMLElement} element - The canvas element to select
 */
function selectElement(element) {
  // Deselect previous
  deselectAll();
  
  // Select new element
  element.classList.add('selected');
  EditorState.selectedElement = element;
  
  // Update properties panel
  updatePropertiesPanel(element);
}

/**
 * Deselect all elements
 */
function deselectAll() {
  document.querySelectorAll('.canvas-element.selected').forEach(el => {
    el.classList.remove('selected');
  });
  EditorState.selectedElement = null;
  
  // Reset properties panel
  showNoSelection();
}

/**
 * Edit element content directly
 * @param {HTMLElement} button - The edit button clicked
 */
function editElementContent(button) {
  const element = button.closest('.canvas-element');
  if (!element) return;
  
  const contentEl = element.querySelector('.element-content');
  if (contentEl && contentEl.contentEditable !== 'false') {
    contentEl.focus();
    // Select all text
    const range = document.createRange();
    range.selectNodeContents(contentEl);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

/**
 * Duplicate an element
 * @param {HTMLElement} button - The duplicate button clicked
 */
function duplicateElement(button) {
  const element = button.closest('.canvas-element');
  if (!element) return;
  
  const clone = element.cloneNode(true);
  
  // Re-attach event handlers by inserting after original
  element.parentNode.insertBefore(clone, element.nextSibling);
  
  // Select the clone
  selectElement(clone);
  
  // Save state
  saveToHistory();
  scheduleAutoSave();
  
  showToast('Element duplicated!', 'info');
}

/**
 * Delete an element
 * @param {HTMLElement} button - The delete button clicked
 */
function deleteElement(button) {
  const element = button.closest('.canvas-element');
  if (!element) return;
  
  element.remove();
  EditorState.selectedElement = null;
  
  // Check if canvas is now empty
  checkCanvasEmpty();
  
  // Update properties panel
  showNoSelection();
  
  // Save state
  saveToHistory();
  scheduleAutoSave();
  
  showToast('Element deleted', 'info');
}

/**
 * Check if canvas is empty and show/hide empty state accordingly
 */
function checkCanvasEmpty() {
  const canvas = document.getElementById('canvas');
  const emptyState = document.getElementById('canvasEmpty');
  
  if (!canvas) return;
  
  const hasElements = canvas.querySelectorAll('.canvas-element:not(#canvasEmpty)').length > 0;
  
  if (emptyState) {
    emptyState.style.display = hasElements ? 'none' : 'flex';
  }
}

// ============================================
// Properties Panel
// ============================================

/**
 * Initialize properties panel interactions
 */
function initPropertiesPanel() {
  // Text content changes
  const propText = document.getElementById('propText');
  if (propText) {
    propText.addEventListener('input', debounce(function() {
      applyPropertyChange('textContent', this.value);
    }, 200));
  }
  
  // Image URL changes
  const propImageUrl = document.getElementById('propImageUrl');
  if (propImageUrl) {
    propImageUrl.addEventListener('input', debounce(function() {
      applyPropertyChange('imageUrl', this.value);
    }, 200));
  }
  
  // Link URL changes
  const propLinkUrl = document.getElementById('propLinkUrl');
  if (propLinkUrl) {
    propLinkUrl.addEventListener('input', debounce(function() {
      applyPropertyChange('linkUrl', this.value);
    }, 200));
  }
  
  // Alt text changes
  const propAltText = document.getElementById('propAltText');
  if (propAltText) {
    propAltText.addEventListener('input', debounce(function() {
      applyPropertyChange('altText', this.value);
    }, 200));
  }
  
  // Video URL changes
  const propVideoUrl = document.getElementById('propVideoUrl');
  if (propVideoUrl) {
    propVideoUrl.addEventListener('input', debounce(function() {
      applyPropertyChange('videoUrl', this.value);
    }, 200));
  }
  
  // Font size slider
  const propFontSize = document.getElementById('propFontSize');
  if (propFontSize) {
    propFontSize.addEventListener('input', function() {
      document.getElementById('propFontSizeValue').textContent = this.value + 'px';
      applyPropertyChange('fontSize', this.value + 'px');
    });
  }
  
  // Font weight selector
  const propFontWeight = document.getElementById('propFontWeight');
  if (propFontWeight) {
    propFontWeight.addEventListener('change', function() {
      applyPropertyChange('fontWeight', this.value);
    });
  }
  
  // Alignment buttons
  document.querySelectorAll('.align-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.align-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      applyPropertyChange('textAlign', this.dataset.align);
    });
  });
  
  // Text color picker
  const propTextColor = document.getElementById('propTextColor');
  const propTextColorHex = document.getElementById('propTextColorHex');
  if (propTextColor) {
    propTextColor.addEventListener('input', function() {
      propTextColorHex.value = this.value.toUpperCase();
      applyPropertyChange('color', this.value);
    });
  }
  if (propTextColorHex) {
    propTextColorHex.addEventListener('input', function() {
      if (/^#[0-9A-Fa-f]{6}$/.test(this.value)) {
        propTextColor.value = this.value;
        applyPropertyChange('color', this.value);
      }
    });
  }
  
  // Background color picker
  const propBgColor = document.getElementById('propBgColor');
  const propBgColorHex = document.getElementById('propBgColorHex');
  if (propBgColor) {
    propBgColor.addEventListener('input', function() {
      propBgColorHex.value = this.value.toUpperCase();
      applyPropertyChange('backgroundColor', this.value);
    });
  }
  if (propBgColorHex) {
    propBgColorHex.addEventListener('input', function() {
      if (/^#[0-9A-Fa-f]{6}$/.test(this.value)) {
        propBgColor.value = this.value;
        applyPropertyChange('backgroundColor', this.value);
      }
    });
  }
  
  // Background image URL
  const propBgImage = document.getElementById('propBgImage');
  if (propBgImage) {
    propBgImage.addEventListener('input', debounce(function() {
      applyPropertyChange('backgroundImage', this.value ? `url(${this.value})` : 'none');
    }, 200));
  }
  
  // Padding slider
  const propPadding = document.getElementById('propPadding');
  if (propPadding) {
    propPadding.addEventListener('input', function() {
      document.getElementById('propPaddingValue').textContent = this.value + 'px';
      applyPropertyChange('padding', this.value + 'px');
    });
  }
  
  // Margin slider
  const propMargin = document.getElementById('propMargin');
  if (propMargin) {
    propMargin.addEventListener('input', function() {
      document.getElementById('propMarginValue').textContent = this.value + 'px';
      applyPropertyChange('margin', this.value + 'px');
    });
  }
  
  // Border radius slider
  const propBorderRadius = document.getElementById('propBorderRadius');
  if (propBorderRadius) {
    propBorderRadius.addEventListener('input', function() {
      document.getElementById('propBorderRadiusValue').textContent = this.value + 'px';
      applyPropertyChange('borderRadius', this.value + 'px');
    });
  }
  
  // Duplicate button
  const duplicateBtn = document.getElementById('duplicateBtn');
  if (duplicateBtn) {
    duplicateBtn.addEventListener('click', function() {
      if (EditorState.selectedElement) {
        const btn = EditorState.selectedElement.querySelector('.element-control-btn[title="Duplicate"]');
        if (btn) duplicateElement(btn);
      }
    });
  }
  
  // Delete button
  const deleteBtn = document.getElementById('deleteBtn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', function() {
      if (EditorState.selectedElement) {
        const btn = EditorState.selectedElement.querySelector('.element-control-btn.danger');
        if (btn) deleteElement(btn);
      }
    });
  }
  
  // Toggle properties panel
  const toggleProps = document.getElementById('toggleProperties');
  if (toggleProps) {
    toggleProps.addEventListener('click', function() {
      const sidebar = document.getElementById('sidebarRight');
      sidebar.classList.toggle('collapsed');
      this.textContent = sidebar.classList.contains('collapsed') ? '▶' : '◀';
    });
  }
}

/**
 * Update the properties panel with selected element's data
 * @param {HTMLElement} element - The selected canvas element
 */
function updatePropertiesPanel(element) {
  const noSelection = document.getElementById('noSelection');
  const elementProps = document.getElementById('elementProperties');
  
  if (noSelection) noSelection.style.display = 'none';
  if (elementProps) elementProps.style.display = 'block';
  
  // Get element info
  const componentType = element.dataset.component || '';
  const elementType = element.dataset.type || '';
  const contentEl = element.querySelector('.element-content');
  
  // Update type indicator
  const typeIcon = document.getElementById('elementTypeIcon');
  const typeLabel = document.getElementById('elementTypeLabel');
  
  if (typeIcon) {
    const icons = {
      heading: '📝', text: '📝', media: '🖼️', 
      interactive: '🔘', layout: '📐', container: '📦'
    };
    typeIcon.textContent = icons[elementType] || '📦';
  }
  if (typeLabel) {
    typeLabel.textContent = componentType ? componentType.charAt(0).toUpperCase() + componentType.slice(1) : 'Element';
  }
  
  // Update text content
  const propText = document.getElementById('propText');
  if (propText && contentEl) {
    propText.value = contentEl.textContent || '';
  }
  
  // Show/hide relevant property sections
  updatePropertySectionsVisibility(elementType, componentType);
  
  // Populate current values
  populateCurrentValues(element, contentEl, componentType);
}

/**
 * Show/hide property sections based on element type
 * @param {string} elementType - The element's type category
 * @param {string} componentType - The specific component type
 */
function updatePropertySectionsVisibility(elementType, componentType) {
  const contentSection = document.getElementById('contentSection');
  const typographySection = document.getElementById('typographySection');
  const backgroundSection = document.getElementById('backgroundSection');
  const spacingSection = document.getElementById('spacingSection');
  
  // Content section visibility
  const textProp = document.getElementById('textProperty');
  const imageUrlProp = document.getElementById('imageUrlProperty');
  const linkUrlProp = document.getElementById('linkUrlProperty');
  const altTextProp = document.getElementById('altTextProperty');
  const videoUrlProp = document.getElementById('videoUrlProperty');
  
  // Hide all first
  if (textProp) textProp.style.display = 'none';
  if (imageUrlProp) imageUrlProp.style.display = 'none';
  if (linkUrlProp) linkUrlProp.style.display = 'none';
  if (altTextProp) altTextProp.style.display = 'none';
  if (videoUrlProp) videoUrlProp.style.display = 'none';
  
  // Show relevant ones
  if (['heading', 'text'].includes(elementType)) {
    if (textProp) textProp.style.display = 'block';
  } else if (elementType === 'media') {
    if (componentType === 'image') {
      if (imageUrlProp) imageUrlProp.style.display = 'block';
      if (altTextProp) altTextProp.style.display = 'block';
    } else if (componentType === 'video') {
      if (videoUrlProp) videoUrlProp.style.display = 'block';
    }
  } else if (elementType === 'interactive') {
    if (componentType === 'button') {
      if (textProp) textProp.style.display = 'block';
      if (linkUrlProp) linkUrlProp.style.display = 'block';
    }
  }
  
  // Typography section - only for text-like elements
  if (typographySection) {
    typographySection.style.display = ['heading', 'text', 'interactive'].includes(elementType) ? 'block' : 'none';
  }
}

/**
 * Populate current values into property inputs
 * @param {HTMLElement} element - The canvas element
 * @param {HTMLElement} contentEl - The content element inside
 * @param {string} componentType - The component type
 */
function populateCurrentValues(element, contentEl, componentType) {
  const computedStyle = window.getComputedStyle(contentEl || element);
  
  // Font size
  const propFontSize = document.getElementById('propFontSize');
  const propFontSizeValue = document.getElementById('propFontSizeValue');
  if (propFontSize && contentEl) {
    const size = parseInt(computedStyle.fontSize) || 16;
    propFontSize.value = Math.min(Math.max(size, 12), 72);
    if (propFontSizeValue) propFontSizeValue.textContent = size + 'px';
  }
  
  // Font weight
  const propFontWeight = document.getElementById('propFontWeight');
  if (propFontWeight && contentEl) {
    propFontWeight.value = computedStyle.fontWeight || '400';
  }
  
  // Alignment
  const align = computedStyle.textAlign || 'left';
  document.querySelectorAll('.align-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.align === align);
  });
  
  // Text color
  const propTextColor = document.getElementById('propTextColor');
  const propTextColorHex = document.getElementById('propTextColorHex');
  if (propTextColor && contentEl) {
    const color = rgbToHex(computedStyle.color) || '#1A202C';
    propTextColor.value = color;
    if (propTextColorHex) propTextColorHex.value = color;
  }
  
  // Background color
  const propBgColor = document.getElementById('propBgColor');
  const propBgColorHex = document.getElementById('propBgColorHex');
  if (propBgColor) {
    const bgColor = rgbToHex(computedStyle.backgroundColor) || '#FFFFFF';
    propBgColor.value = bgColor;
    if (propBgColorHex) propBgColorHex.value = bgColor;
  }
  
  // Image URL
  const propImageUrl = document.getElementById('propImageUrl');
  if (propImageUrl && contentEl) {
    const bgImage = computedStyle.backgroundImage || '';
    const match = bgImage.match(/url\(["']?(.*?)["']?\)/);
    propImageUrl.value = match ? match[1] : '';
  }
  
  // Padding
  const propPadding = document.getElementById('propPadding');
  const propPaddingValue = document.getElementById('propPaddingValue');
  if (propPadding) {
    const padding = parseInt(computedStyle.padding) || 0;
    propPadding.value = Math.min(padding, 100);
    if (propPaddingValue) propPaddingValue.textContent = padding + 'px';
  }
  
  // Border radius
  const propBorderRadius = document.getElementById('propBorderRadius');
  const propBorderRadiusValue = document.getElementById('propBorderRadiusValue');
  if (propBorderRadius) {
    const radius = parseInt(computedStyle.borderRadius) || 0;
    propBorderRadius.value = Math.min(radius, 50);
    if (propBorderRadiusValue) propBorderRadiusValue.textContent = radius + 'px';
  }
}

/**
 * Apply a property change to the selected element
 * @param {string} property - CSS property name
 * @param {string} value - New value
 */
function applyPropertyChange(property, value) {
  if (!EditorState.selectedElement) return;
  
  const element = EditorState.selectedElement;
  const contentEl = element.querySelector('.element-content');
  const componentType = element.dataset.component || '';
  
  switch (property) {
    case 'textContent':
      if (contentEl) contentEl.textContent = value;
      break;
      
    case 'imageUrl':
      if (contentEl) contentEl.style.backgroundImage = `url(${value})`;
      break;
      
    case 'linkUrl':
      if (contentEl && contentEl.tagName === 'A') contentEl.href = value;
      break;
      
    case 'altText':
      if (contentEl) contentEl.alt = value;
      break;
      
    case 'videoUrl':
      if (contentEl) {
        const iframe = contentEl.querySelector('iframe');
        if (iframe) iframe.src = value;
      }
      break;
      
    case 'fontSize':
    case 'fontWeight':
    case 'textAlign':
    case 'color':
    case 'lineHeight':
    case 'fontStyle':
      if (contentEl) contentEl.style[property] = value;
      break;
      
    case 'backgroundColor':
    case 'backgroundImage':
    case 'padding':
    case 'margin':
    case 'borderRadius':
      element.style[property] = value;
      break;
  }
  
  scheduleAutoSave();
}

/**
 * Show "no selection" state in properties panel
 */
function showNoSelection() {
  const noSelection = document.getElementById('noSelection');
  const elementProps = document.getElementById('elementProperties');
  
  if (noSelection) noSelection.style.display = 'flex';
  if (elementProps) elementProps.style.display = 'none';
}

// ============================================
// Toolbar Actions
// ============================================

/**
 * Initialize toolbar button actions
 */
function initToolbarActions() {
  // Undo button
  const undoBtn = document.getElementById('undoBtn');
  if (undoBtn) {
    undoBtn.addEventListener('click', undo);
  }
  
  // Redo button
  const redoBtn = document.getElementById('redoBtn');
  if (redoBtn) {
    redoBtn.addEventListener('click', redo);
  }
  
  // Preview button
  const previewBtn = document.getElementById('previewBtn');
  if (previewBtn) {
    previewBtn.addEventListener('click', openPreview);
  }
  
  // Export button
  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', showExportModal);
  }
  
  // Export modal handling
  const closeExportModal = document.getElementById('closeExportModal');
  const cancelExport = document.getElementById('cancelExport');
  const confirmExport = document.getElementById('confirmExport');
  const exportModal = document.getElementById('exportModal');
  
  if (closeExportModal) closeExportModal.addEventListener('click', hideExportModal);
  if (cancelExport) cancelExport.addEventListener('click', hideExportModal);
  if (confirmExport) confirmExport.addEventListener('click', performExport);
  if (exportModal) {
    exportModal.addEventListener('click', function(e) {
      if (e.target === exportModal) hideExportModal();
    });
  }
}

/**
 * Open preview in new tab/window
 */
function openPreview() {
  // Save current state before previewing
  saveToLocalStorage();
  
  // Open preview page
  window.open('preview.html', '_blank');
}

/**
 * Show the export modal dialog
 */
function showExportModal() {
  const modal = document.getElementById('exportModal');
  if (modal) modal.classList.add('active');
}

/**
 * Hide the export modal dialog
 */
function hideExportModal() {
  const modal = document.getElementById('exportModal');
  if (modal) modal.classList.remove('active');
}

/**
 * Perform the actual export
 */
function performExport() {
  const title = document.getElementById('exportTitle').value || 'My Website';
  const filename = document.getElementById('exportFilename').value || 'website';
  
  generateAndDownloadHTML(title, filename);
  hideExportModal();
}

// ============================================
// View Toggle (Desktop/Tablet/Mobile)
// ============================================

/**
 * Initialize view toggle buttons
 */
function initViewToggle() {
  const viewDesktop = document.getElementById('viewDesktop');
  const viewTablet = document.getElementById('viewTablet');
  const viewMobile = document.getElementById('viewMobile');
  const canvasInner = document.getElementById('canvasInner');
  
  const setView = (view, btn) => {
    [viewDesktop, viewTablet, viewMobile].forEach(b => b?.classList.remove('active'));
    btn?.classList.add('active');
    
    if (canvasInner) {
      canvasInner.classList.remove('mobile-view', 'tablet-view');
      if (view === 'mobile') canvasInner.classList.add('mobile-view');
      else if (view === 'tablet') canvasInner.classList.add('tablet-view');
    }
  };
  
  if (viewDesktop) viewDesktop.addEventListener('click', () => setView('desktop', viewDesktop));
  if (viewTablet) viewTablet.addEventListener('click', () => setView('tablet', viewTablet));
  if (viewMobile) viewMobile.addEventListener('click', () => setView('mobile', viewMobile));
}

// ============================================
// Keyboard Shortcuts
// ============================================

/**
 * Initialize keyboard shortcuts
 */
function initKeyboardShortcuts() {
  document.addEventListener('keydown', function(e) {
    // Ctrl+Z / Cmd+Z - Undo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      undo();
    }
    
    // Ctrl+Y / Cmd+Shift+Z / Cmd+Y - Redo
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault();
      redo();
    }
    
    // Delete/Backspace - Delete selected element
    if ((e.key === 'Delete' || e.key === 'Backspace') && EditorState.selectedElement) {
      // Don't delete if editing text
      if (document.activeElement.contentEditable === 'true') return;
      
      e.preventDefault();
      const btn = EditorState.selectedElement.querySelector('.element-control-btn.danger');
      if (btn) deleteElement(btn);
    }
    
    // Escape - Deselect
    if (e.key === 'Escape') {
      deselectAll();
    }
  });
}

// ============================================
// Component Search
// ============================================

/**
 * Initialize component search/filter
 */
function initComponentSearch() {
  const searchInput = document.getElementById('componentSearch');
  if (!searchInput) return;
  
  searchInput.addEventListener('input', function() {
    const query = this.value.toLowerCase().trim();
    const categories = document.querySelectorAll('.component-category');
    
    categories.forEach(category => {
      const items = category.querySelectorAll('.component-item');
      let visibleCount = 0;
      
      items.forEach(item => {
        const name = item.querySelector('.component-name')?.textContent.toLowerCase() || '';
        const matches = !query || name.includes(query);
        item.style.display = matches ? '' : 'none';
        if (matches) visibleCount++;
      });
      
      // Hide empty categories
      category.style.display = visibleCount > 0 ? '' : 'none';
    });
  });
}

// ============================================
// History (Undo/Redo)
// ============================================

/**
 * Save current state to history
 */
function saveToHistory() {
  const canvas = document.getElementById('canvas');
  if (!canvas) return;
  
  // Get clean HTML (without controls)
  const html = getCleanCanvasHTML();
  
  // Remove future states if we're not at the end
  if (EditorState.historyIndex < EditorState.history.length - 1) {
    EditorState.history = EditorState.history.slice(0, EditorState.historyIndex + 1);
  }
  
  // Add new state
  EditorState.history.push(html);
  
  // Limit history size
  if (EditorState.history.length > EditorState.maxHistorySize) {
    EditorState.history.shift();
  } else {
    EditorState.historyIndex++;
  }
  
  EditorState.isDirty = true;
}

/**
 * Undo last action
 */
function undo() {
  if (EditorState.historyIndex > 0) {
    EditorState.historyIndex--;
    restoreFromHistory(EditorState.history[EditorState.historyIndex]);
    showToast('Undo', 'info');
  }
}

/**
 * Redo last undone action
 */
function redo() {
  if (EditorState.historyIndex < EditorState.history.length - 1) {
    EditorState.historyIndex++;
    restoreFromHistory(EditorState.history[EditorState.historyIndex]);
    showToast('Redo', 'info');
  }
}

/**
 * Restore canvas from history state
 * @param {string} html - The HTML to restore
 */
function restoreFromHistory(html) {
  const canvas = document.getElementById('canvas');
  if (!canvas) return;
  
  canvas.innerHTML = html;
  reinitializeCanvasElements();
  deselectAll();
  scheduleAutoSave();
}

/**
 * Get clean HTML from canvas (without editing wrappers)
 * @returns {string} Clean HTML string
 */
function getCleanCanvasHTML() {
  const canvas = document.getElementById('canvas');
  if (!canvas) return '';
  
  // Clone and clean up
  const clone = canvas.cloneNode(true);
  
  // Remove empty state
  const emptyState = clone.querySelector('#canvasEmpty');
  if (emptyState) emptyState.remove();
  
  // Remove editing wrappers but keep content
  clone.querySelectorAll('.canvas-element').forEach(el => {
    const content = el.querySelector('.element-content');
    const controls = el.querySelector('.element-controls');
    const handles = el.querySelectorAll('.resize-handle');
    
    // Move content attributes to parent
    if (content) {
      // Transfer styles
      const contentStyles = content.getAttribute('style');
      if (contentStyles) {
        el.setAttribute('style', contentStyles);
      }
      
      // Replace wrapper with content
      while (content.firstChild) {
        el.insertBefore(content.firstChild, content);
      }
      content.remove();
    }
    
    // Remove controls and handles
    if (controls) controls.remove();
    handles.forEach(h => h.remove());
    
    // Clean up classes
    el.classList.remove('canvas-element', 'selected', 'drag-over', 'dragging-element');
    el.removeAttribute('data-editable');
  });
  
  return clone.innerHTML;
}

/**
 * Reinitialize canvas elements after restoring from history
 */
function reinitializeCanvasElements() {
  const canvas = document.getElementById('canvas');
  if (!canvas) return;
  
  // Find direct children that need wrapping
  Array.from(canvas.children).forEach(child => {
    if (!child.classList.contains('canvas-element') && child.id !== 'canvasEmpty') {
      const wrapped = wrapElementForEditing(child);
      child.replaceWith(wrapped);
    }
  });
  
  checkCanvasEmpty();
}

// ============================================
// Local Storage Persistence
// ============================================

/**
 * Schedule auto-save with debouncing
 */
function scheduleAutoSave() {
  clearTimeout(EditorState.autoSaveTimeout);
  EditorState.autoSaveTimeout = setTimeout(() => {
    saveToLocalStorage();
  }, 1000);
}

/**
 * Save current state to localStorage
 */
function saveToLocalStorage() {
  try {
    const html = getCleanCanvasHTML();
    localStorage.setItem('viewyoursite_content', html);
    localStorage.setItem('viewyoursite_timestamp', Date.now());
    
    updateSaveStatus('saved');
  } catch (e) {
    console.error('Failed to save:', e);
    showToast('Failed to save!', 'error');
  }
}

/**
 * Restore from localStorage
 */
function restoreFromLocalStorage() {
  try {
    const savedContent = localStorage.getItem('viewyoursite_content');
    
    if (savedContent) {
      const canvas = document.getElementById('canvas');
      const emptyState = document.getElementById('canvasEmpty');
      
      if (canvas && savedContent.trim()) {
        if (emptyState) emptyState.style.display = 'none';
        
        const wrapper = document.createElement('div');
        wrapper.innerHTML = savedContent;
        
        const fragment = document.createDocumentFragment();
        Array.from(wrapper.children).forEach(child => {
          const wrapped = wrapElementForEditing(child);
          fragment.appendChild(wrapped);
        });
        
        canvas.appendChild(fragment);
        checkCanvasEmpty();
        saveToHistory();
        
        showToast('Previous work restored!', 'success');
      }
    }
  } catch (e) {
    console.error('Failed to restore:', e);
  }
}

/**
 * Update the save status indicator
 * @param {string} status - Status type: 'saving', 'saved', 'error'
 */
function updateSaveStatus(status) {
  const statusEl = document.getElementById('saveStatus');
  if (!statusEl) return;
  
  const dot = statusEl.querySelector('.save-status-dot');
  const text = statusEl.querySelector('span:last-child');
  
  statusEl.className = 'save-status ' + status;
  
  switch (status) {
    case 'saving':
      if (dot) dot.style.background = '#F6AD55';
      if (text) text.textContent = 'Saving...';
      break;
    case 'saved':
      if (dot) dot.style.background = '#28C840';
      if (text) text.textContent = 'Saved';
      break;
    case 'error':
      if (dot) dot.style.background = '#E53E3E';
      if (text) text.textContent = 'Error';
      break;
  }
}

// ============================================
// Toast Notifications
// ============================================

/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {string} type - Toast type: 'success', 'error', 'info'
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <span style="margin-left:auto;cursor:pointer;opacity:0.7;" onclick="this.parentElement.remove()">✕</span>
  `;
  
  container.appendChild(toast);
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============================================
// Utility Functions
// ============================================

/**
 * Debounce function to limit execution rate
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func.apply(this, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Convert RGB color to Hex format
 * @param {string} rgb - RGB color string
 * @returns {string} Hex color string
 */
function rgbToHex(rgb) {
  if (!rgb || rgb.startsWith('#')) return rgb || '#000000';
  
  const match = rgb.match(/\d+/g);
  if (!match || match.length < 3) return '#000000';
  
  return '#' + match.slice(0, 3).map(x => {
    const hex = parseInt(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('').toUpperCase();
}
