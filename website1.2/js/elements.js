/* ============================================
   ViewYourSite - Elements System
   50+ Element Types with Full Support
   ============================================ */

const Elements = {
    // Element type definitions
    types: {
        // TEXT ELEMENTS
        heading: {
            category: 'Text',
            name: 'Heading',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h8"></path><path d="M4 18V6"></path><path d="M12 18V6"></path><path d="M17 10v8"></path><path d="M17 14h4"></path></svg>',
            defaults: {
                content: 'Heading Text',
                styles: { width: '300px', height: 'auto', fontSize: '32px', fontWeight: '700' }
            }
        },
        subheading: {
            category: 'Text',
            name: 'Subheading',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h8"></path><path d="M4 18V6"></path><path d="M12 18V6"></path><path d="M17 10v8"></path></svg>',
            defaults: {
                content: 'Subheading Text',
                styles: { width: '280px', height: 'auto', fontSize: '24px', fontWeight: '600' }
            }
        },
        paragraph: {
            category: 'Text',
            name: 'Paragraph',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="15" y2="12"></line><line x1="3" y1="18" x2="17" y2="18"></line></svg>',
            defaults: {
                content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                styles: { width: '350px', height: 'auto', fontSize: '14px', lineHeight: '1.6' }
            }
        },
        text: {
            category: 'Text',
            name: 'Text Block',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>',
            defaults: {
                content: 'Text content goes here',
                styles: { width: '200px', height: 'auto', fontSize: '14px' }
            }
        },
        span: {
            category: 'Text',
            name: 'Inline Text',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 6H7a2 2 0 00-2 2v8a2 2 0 002 2h10a2 2 0 002-2V8a2 2 0 00-2-2z"></path></svg>',
            defaults: {
                content: 'Span text',
                styles: { width: 'auto', height: 'auto', display: 'inline-block' }
            }
        },
        link: {
            category: 'Text',
            name: 'Link',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>',
            defaults: {
                content: 'Click here',
                properties: { href: '#', target: '_self' },
                styles: { width: 'auto', height: 'auto', color: '#0066cc', textDecoration: 'underline', cursor: 'pointer' }
            }
        },
        list: {
            category: 'Text',
            name: 'List',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>',
            defaults: {
                content: '<ul style="margin:0;padding-left:20px;list-style:disc"><li>Item one</li><li>Item two</li><li>Item three</li></ul>',
                styles: { width: '200px', height: 'auto' }
            }
        },
        quote: {
            category: 'Text',
            name: 'Quote',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z"></path><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3z"></path></svg>',
            defaults: {
                content: 'A meaningful quote that inspires and motivates your audience to take action.',
                styles: { width: '320px', height: 'auto', fontSize: '18px', fontStyle: 'italic', borderLeft: '4px solid #333', paddingLeft: '20px' }
            }
        },
        code: {
            category: 'Text',
            name: 'Code Block',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>',
            defaults: {
                content: '// Your code here\nconsole.log("Hello World");',
                styles: { width: '280px', height: 'auto', fontFamily: "'JetBrains Mono', monospace", background: '#f5f5f5', padding: '12px 16px', borderRadius: '6px', fontSize: '13px', whiteSpace: 'pre-wrap' }
            }
        },
        
        // MEDIA ELEMENTS
        image: {
            category: 'Media',
            name: 'Image',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>',
            defaults: {
                content: '',
                properties: { src: '', alt: 'Image' },
                styles: { width: '250px', height: '180px', background: 'linear-gradient(135deg, #f0f0f0, #e0e0e0)' }
            }
        },
        video: {
            category: 'Media',
            name: 'Video',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>',
            defaults: {
                content: '',
                properties: { src: '', poster: '', controls: true, autoplay: false, loop: false, muted: true },
                styles: { width: '320px', height: '200px', background: '#000' }
            }
        },
        audio: {
            category: 'Media',
            name: 'Audio Player',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>',
            defaults: {
                content: '',
                properties: { src: '', controls: true, autoplay: false, loop: false },
                styles: { width: '280px', height: '50px', background: '#f5f5f5', padding: '10px', borderRadius: '8px' }
            }
        },
        iframe: {
            category: 'Media',
            name: 'Embed / Iframe',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>',
            defaults: {
                content: '',
                properties: { src: 'about:blank' },
                styles: { width: '400px', height: '300px', border: '1px solid #ddd' }
            }
        },
        icon: {
            category: 'Media',
            name: 'Icon',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',
            defaults: {
                content: '&#9733;',
                properties: { iconType: 'star' },
                styles: { width: '48px', height: '48px', fontSize: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }
            }
        },
        
        // FORM ELEMENTS
        button: {
            category: 'Interactive',
            name: 'Button',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="8" width="18" height="8" rx="2"></rect><path d="M12 8v8"></path><path d="M8 12h8"></path></svg>',
            defaults: {
                content: 'Click Me',
                styles: { width: 'auto', height: 'auto', padding: '12px 28px', background: '#000', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }
            }
        },
        buttonOutline: {
            category: 'Interactive',
            name: 'Outline Button',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="8" width="18" height="8" rx="2"></rect></svg>',
            defaults: {
                content: 'Learn More',
                styles: { width: 'auto', height: 'auto', padding: '11px 27px', background: 'transparent', color: '#000', border: '2px solid #000', borderRadius: '6px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }
            }
        },
        input: {
            category: 'Interactive',
            name: 'Text Input',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"></rect><path d="M7 8h10"></path><path d="M7 12h10"></path><path d="M7 16h6"></path></svg>',
            defaults: {
                content: '<input type="text" placeholder="Enter text..." style="width:100%;padding:10px 14px;border:1px solid #ccc;border-radius:6px;font-size:14px;box-sizing:border-box">',
                styles: { width: '240px', height: 'auto' }
            }
        },
        textarea: {
            category: 'Interactive',
            name: 'Textarea',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="8" y1="8" x2="16" y2="8"></line><line x1="8" y1="13" x2="16" y2="13"></line><line x1="8" y1="18" x2="12" y2="18"></line></svg>',
            defaults: {
                content: '<textarea placeholder="Enter message..." rows="4" style="width:100%;padding:10px 14px;border:1px solid #ccc;border-radius:6px;font-size:14px;font-family:inherit;resize:vertical;box-sizing:border-box"></textarea>',
                styles: { width: '280px', height: 'auto' }
            }
        },
        select: {
            category: 'Interactive',
            name: 'Dropdown Select',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>',
            defaults: {
                content: '<select style="width:100%;padding:10px 14px;border:1px solid #ccc;border-radius:6px;font-size:14px;background:#fff"><option>Option 1</option><option>Option 2</option><option>Option 3</option></select>',
                styles: { width: '200px', height: 'auto' }
            }
        },
        checkbox: {
            category: 'Interactive',
            name: 'Checkbox',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M9 12l2 2 4-4"></path></svg>',
            defaults: {
                content: '<label style="display:flex;align-items:center;gap:8px;cursor:pointer"><input type="checkbox"> <span>Accept terms</span></label>',
                styles: { width: 'auto', height: 'auto' }
            }
        },
        radio: {
            category: 'Interactive',
            name: 'Radio Button',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle></svg>',
            defaults: {
                content: '<div style="display:flex;flex-direction:column;gap:8px"><label style="display:flex;align-items:center;gap:8px;cursor:pointer"><input type="radio" name="radio_group"> <span>Option A</span></label><label style="display:flex;align-items:center;gap:8px;cursor:pointer"><input type="radio" name="radio_group"> <span>Option B</span></label></div>',
                styles: { width: 'auto', height: 'auto' }
            }
        },
        toggle: {
            category: 'Interactive',
            name: 'Toggle Switch',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="6" width="22" height="12" rx="6"></rect><circle cx="17" cy="12" r="3"></circle></svg>',
            defaults: {
                content: '<label style="display:flex;align-items:center;gap:10px;cursor:pointer"><div style="width:44px;height:24px;background:#ccc;border-radius:12px;position:relative;transition:background 0.2s"><div style="width:20px;height:20px;background:#fff;border-radius:50%;position:absolute;top:2px;left:2px;transition:left 0.2s"></div></div> <span>Enable feature</span></label>',
                styles: { width: 'auto', height: 'auto' }
            }
        },
        range: {
            category: 'Interactive',
            name: 'Range Slider',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="12" x2="20" y2="12"></line><circle cx="12" cy="12" r="3"></circle></svg>',
            defaults: {
                content: '<input type="range" min="0" max="100" value="50" style="width:100%">',
                styles: { width: '200px', height: 'auto' }
            }
        },
        
        // LAYOUT ELEMENTS
        container: {
            category: 'Layout',
            name: 'Container',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>',
            defaults: {
                content: 'Container',
                styles: { width: '200px', height: '150px', border: '2px dashed #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: '12px' }
            }
        },
        section: {
            category: 'Layout',
            name: 'Section',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line></svg>',
            defaults: {
                content: 'Section',
                styles: { width: '100%', minHeight: '200px', left: '0', top: '0', background: '#fafafa', padding: '40px' }
            }
        },
        divider: {
            category: 'Layout',
            name: 'Divider',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line></svg>',
            defaults: {
                content: '',
                styles: { width: '300px', height: '1px', background: '#e0e0e0' }
            }
        },
        spacer: {
            category: 'Layout',
            name: 'Spacer',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="3" x2="12" y2="21"></line><polyline points="8 7 12 3 16 7"></polyline><polyline points="8 17 12 21 16 17"></polyline></svg>',
            defaults: {
                content: '',
                styles: { width: '100%', height: '40px', background: 'rgba(0,0,0,0.02)' }
            }
        },
        grid: {
            category: 'Layout',
            name: 'Grid Layout',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect></svg>',
            defaults: {
                content: '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;padding:16px"><div style="background:#f0f0f0;height:80px;border-radius:8px"></div><div style="background:#f0f0f0;height:80px;border-radius:8px"></div><div style="background:#f0f0f0;height:80px;border-radius:8px"></div></div>',
                styles: { width: '400px', height: 'auto', padding: '16px' }
            }
        },
        flex: {
            category: 'Layout',
            name: 'Flex Row',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="8" width="6" height="8"></rect><rect x="9" y="8" width="6" height="8"></rect><rect x="15" y="8" width="6" height="8"></rect></svg>',
            defaults: {
                content: '<div style="display:flex;gap:16px;padding:16px"><div style="flex:1;background:#f0f0f0;height:60px;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#888;font-size:12px">Item 1</div><div style="flex:1;background:#f0f0f0;height:60px;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#888;font-size:12px">Item 2</div></div>',
                styles: { width: '350px', height: 'auto', padding: '16px' }
            }
        },
        
        // COMPONENTS
        card: {
            category: 'Components',
            name: 'Card',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="M2 10h20"></path></svg>',
            defaults: {
                content: '<div style="padding:24px"><strong style="font-size:16px;display:block;margin-bottom:8px">Card Title</strong><p style="color:#666;font-size:14px;margin:0">Card description goes here with some details.</p></div>',
                styles: { width: '260px', height: 'auto', background: '#fff', border: '1px solid #e0e0e0', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }
            }
        },
        navbar: {
            category: 'Components',
            name: 'Navigation Bar',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>',
            defaults: {
                content: '<nav style="display:flex;align-items:center;justify-content:space-between;padding:16px 24px"><strong style="font-size:18px">Logo</strong><div style="display:flex;gap:24px;font-size:14px"><span>Home</span><span>About</span><span>Contact</span></div></nav>',
                styles: { width: '100%', height: 'auto', left: '0', top: '0', background: '#fff', borderBottom: '1px solid #eee' }
            }
        },
        footer: {
            category: 'Components',
            name: 'Footer',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="14" width="20" height="8" rx="2"></rect><line x1="7" y1="18" x2="17" y2="18"></line></svg>',
            defaults: {
                content: '<footer style="padding:40px 24px;text-align:center"><p style="margin:0 0 16px;font-weight:600">Your Brand</p><p style="margin:0;color:#aaa;font-size:13px">&copy; 2024 All rights reserved.</p></footer>',
                styles: { width: '100%', height: 'auto', left: '0', bottom: '0', background: '#222', color: '#fff', padding: '40px 24px' }
            }
        },
        hero: {
            category: 'Components',
            name: 'Hero Section',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2"></rect><path d="M12 8v8"></path><path d="M8 12h8"></path></svg>',
            defaults: {
                content: '<div style="text-align:center;padding:60px 40px"><h1 style="font-size:42px;margin:0 0 16px;color:#fff">Welcome to Our Site</h1><p style="font-size:18px;margin:0 0 32px;color:rgba(255,255,255,0.8)">Build something amazing today</p><button style="padding:14px 32px;background:#fff;color:#333;border:none;border-radius:6px;font-size:16px;font-weight:600;cursor:pointer">Get Started</button></div>',
                styles: { width: '100%', height: 'auto', left: '0', top: '0', background: 'linear-gradient(135deg, #667eea, #764ba2)', padding: '60px 40px' }
            }
        },
        alert: {
            category: 'Components',
            name: 'Alert Box',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
            defaults: {
                content: '<div style="padding:16px 20px;border-radius:8px;display:flex;align-items:center;gap:12px"><span style="font-size:20px">&#9888;</span><div><strong>Important Notice</strong><p style="margin:4px 0 0;font-size:13px;color:#555">This is an important message for users.</p></div></div>',
                styles: { width: '320px', height: 'auto', background: '#d4edda', color: '#155724', border: '1px solid #c3e6cb', borderRadius: '8px' }
            }
        },
        badge: {
            category: 'Components',
            name: 'Badge',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>',
            defaults: {
                content: 'New',
                styles: { width: 'auto', height: 'auto', display: 'inline-flex', padding: '4px 12px', background: '#000', color: '#fff', borderRadius: '100px', fontSize: '12px', fontWeight: '500' }
            }
        },
        avatar: {
            category: 'Components',
            name: 'Avatar',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
            defaults: {
                content: 'JD',
                styles: { width: '48px', height: '48px', background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '600', fontSize: '16px' }
            }
        },
        progress: {
            category: 'Components',
            name: 'Progress Bar',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><polyline points="15 8 19 12 15 16"></polyline></svg>',
            defaults: {
                content: '<div style="width:100%;height:8px;background:#e0e0e0;border-radius:4px;overflow:hidden"><div style="height:100%;background:linear-gradient(90deg,#4caf50,#8bc34a);width:70%"></div></div>',
                styles: { width: '200px', height: 'auto' }
            }
        },
        stats: {
            category: 'Components',
            name: 'Stats Row',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>',
            defaults: {
                content: '<div style="display:flex;gap:32px;text-align:center"><div><div style="font-size:28px;font-weight:700">10K+</div><div style="font-size:12px;color:#888;text-transform:uppercase;margin-top:4px">Users</div></div><div><div style="font-size:28px;font-weight:700">98%</div><div style="font-size:12px;color:#888;text-transform:uppercase;margin-top:4px">Satisfaction</div></div><div><div style="font-size:28px;font-weight:700">24/7</div><div style="font-size:12px;color:#888;text-transform:uppercase;margin-top:4px">Support</div></div></div>',
                styles: { width: '340px', height: 'auto', padding: '24px' }
            }
        },
        pricing: {
            category: 'Components',
            name: 'Pricing Card',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>',
            defaults: {
                content: '<div style="text-align:center;padding:32px 24px"><div style="font-size:14px;color:#888;text-transform:uppercase;margin-bottom:8px">Pro Plan</div><div style="font-size:42px;font-weight:800">$29<span style="font-size:16px;font-weight:400;color:#888">/mo</span></div><ul style="list-style:none;padding:0;margin:24px 0;text-align:left;font-size:14px;color:#555"><li style="padding:8px 0;border-bottom:1px solid #eee">Unlimited projects</li><li style="padding:8px 0;border-bottom:1px solid #eee">Priority support</li><li style="padding:8px 0">Advanced analytics</li></ul><button style="width:100%;padding:12px;background:#000;color:#fff;border:none;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer">Choose Plan</button></div>',
                styles: { width: '260px', height: 'auto', background: '#fff', border: '2px solid #eee', borderRadius: '16px' }
            }
        },
        testimonial: {
            category: 'Components',
            name: 'Testimonial',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
            defaults: {
                content: '<div style="padding:24px;background:#f9f9f9;border-radius:12px"><div style="color:#ffc107;font-size:18px;margin-bottom:12px">&#9733;&#9733;&#9733;&#9733;&#9733;</div><p style="font-style:italic;margin:0 0 16px;color:#555;line-height:1.6">This product has completely transformed our workflow. Highly recommended!</p><div style="display:flex;align-items:center;gap:12px"><div style="width:40px;height:40px;background:linear-gradient(135deg,#667eea,#764ba2);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600;font-size:14px">JD</div><div><strong>Jane Doe</strong><div style="font-size:12px;color:#888">CEO at Company</div></div></div></div>',
                styles: { width: '320px', height: 'auto' }
            }
        },
        formGroup: {
            category: 'Components',
            name: 'Contact Form',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>',
            defaults: {
                content: `<form style="display:flex;flex-direction:column;gap:16px;padding:24px;background:#fff;border-radius:12px;border:1px solid #eee">
                    <div>
                        <label style="display:block;font-size:13px;font-weight:500;margin-bottom:6px;color:#555">Name</label>
                        <input type="text" placeholder="Your name" style="width:100%;padding:10px 14px;border:1px solid #ddd;border-radius:6px;font-size:14px;box-sizing:border-box">
                    </div>
                    <div>
                        <label style="display:block;font-size:13px;font-weight:500;margin-bottom:6px;color:#555">Email</label>
                        <input type="email" placeholder="your@email.com" style="width:100%;padding:10px 14px;border:1px solid #ddd;border-radius:6px;font-size:14px;box-sizing:border-box">
                    </div>
                    <div>
                        <label style="display:block;font-size:13px;font-weight:500;margin-bottom:6px;color:#555">Message</label>
                        <textarea rows="4" placeholder="Your message..." style="width:100%;padding:10px 14px;border:1px solid #ddd;border-radius:6px;font-size:14px;resize:none;box-sizing:border-box;font-family:inherit"></textarea>
                    </div>
                    <button type="button" style="padding:12px 24px;background:#000;color:#fff;border:none;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer">Send Message</button>
                </form>`,
                styles: { width: '320px', height: 'auto' }
            }
        },
        socialIcons: {
            category: 'Components',
            name: 'Social Icons',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>',
            defaults: {
                content: '<div style="display:flex;gap:12px;padding:12px"><div style="width:36px;height:36px;background:#1877f2;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-weight:bold">f</div><div style="width:36px;height:36px;background:#1da1f2;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-weight:bold">t</div><div style="width:36px;height:36px;background:#e1306c;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-weight:bold">ig</div><div style="width:36px;height:36px;background:#0077b5;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-weight:bold">in</div></div>',
                styles: { width: 'auto', height: 'auto' }
            }
        },
        mapEmbed: {
            category: 'Components',
            name: 'Map Embed',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>',
            defaults: {
                content: '<div style="width:100%;height:100%;min-height:180px;background:#e8eaed;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;color:#666"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg><span style="font-size:13px">Map Location</span></div>',
                styles: { width: '300px', height: '200px', background: '#e8eaed', borderRadius: '8px' }
            }
        },
        countdown: {
            category: 'Components',
            name: 'Countdown Timer',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
            defaults: {
                content: '<div style="display:flex;gap:16px;padding:20px;background:#000;color:#fff;border-radius:8px"><div style="text-align:center"><div style="font-size:32px;font-weight:700">07</div><div style="font-size:11px;text-transform:uppercase;opacity:0.7">Days</div></div><div style="text-align:center"><div style="font-size:32px;font-weight:700">12</div><div style="font-size:11px;text-transform:uppercase;opacity:0.7">Hours</div></div><div style="text-align:center"><div style="font-size:32px;font-weight:700">34</div><div style="font-size:11px;text-transform:uppercase;opacity:0.7">Minutes</div></div><div style="text-align:center"><div style="font-size:32px;font-weight:700">56</div><div style="font-size:11px;text-transform:uppercase;opacity:0.7">Seconds</div></div></div>',
                styles: { width: 'auto', height: 'auto' }
            }
        },
        timeline: {
            category: 'Components',
            name: 'Timeline',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="2" x2="12" y2="22"></line><circle cx="12" cy="6" r="3"></circle><circle cx="12" cy="12" r="3"></circle><circle cx="12" cy="18" r="3"></circle></svg>',
            defaults: {
                content: '<div style="padding:20px"><div style="display:flex;gap:16px;padding-bottom:24px;position:relative"><div style="width:12px;height:12px;background:#000;border-radius:50%;margin-top:4px;flex-shrink:0;z-index:1"></div><div style="position:absolute;left:5px;top:16px;bottom:0;width:2px;background:#eee"></div><div><strong style="font-size:14px">Step One</strong><p style="font-size:13px;color:#666;margin:4px 0 0">Complete initial setup</p></div></div><div style="display:flex;gap:16px;padding-bottom:24px;position:relative"><div style="width:12px;height:12px;background:#000;border-radius:50%;margin-top:4px;flex-shrink:0;z-index:1"></div><div><strong style="font-size:14px">Step Two</strong><p style="font-size:13px;color:#666;margin:4px 0 0">Configure your settings</p></div></div><div style="display:flex;gap:16px;position:relative"><div style="width:12px;height:12px;background:#000;border-radius:50%;margin-top:4px;flex-shrink:0;z-index:1"></div><div><strong style="font-size:14px">Step Three</strong><p style="font-size:13px;color:#666;margin:4px 0 0">Launch your project</p></div></div></div>',
                styles: { width: '280px', height: 'auto' }
            }
        },
        chart: {
            category: 'Components',
            name: 'Bar Chart',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>',
            defaults: {
                content: '<div style="display:flex;align-items:flex-end;justify-content:space-around;padding:20px;height:160px;background:#f9f9f9;border-radius:8px;gap:12px"><div style="width:30px;background:linear-gradient(to top,#667eea,#764ba2);border-radius:4px 4px 0 0;height:60%"></div><div style="width:30px;background:linear-gradient(to top,#667eea,#764ba2);border-radius:4px 4px 0 0;height:85%"></div><div style="width:30px;background:linear-gradient(to top,#667eea,#764ba2);border-radius:4px 4px 0 0;height:45%"></div><div style="width:30px;background:linear-gradient(to top,#667eea,#764ba2);border-radius:4px 4px 0 0;height:95%"></div><div style="width:30px;background:linear-gradient(to top,#667eea,#764ba2);border-radius:4px 4px 0 0;height:70%"></div></div>',
                styles: { width: '260px', height: 'auto' }
            }
        },
        table: {
            category: 'Components',
            name: 'Table',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>',
            defaults: {
                content: '<table style="width:100%;border-collapse:collapse;font-size:14px"><thead><tr style="background:#f9f9f9"><th style="padding:12px;text-align:left;border:1px solid #eee">Name</th><th style="padding:12px;text-align:left;border:1px solid #eee">Status</th><th style="padding:12px;text-align:left;border:1px solid #eee">Date</th></tr></thead><tbody><tr><td style="padding:12px;border:1px solid #eee">Project A</td><td style="padding:12px;border:1px solid #eee"><span style="padding:4px 8px;background:#d4edda;color:#155724;border-radius:4px;font-size:12px">Active</span></td><td style="padding:12px;border:1px solid #eee">Jan 15</td></tr><tr><td style="padding:12px;border:1px solid #eee">Project B</td><td style="padding:12px;border:1px solid #eee"><span style="padding:4px 8px;background:#fff3cd;color:#856404;border-radius:4px;font-size:12px">Pending</span></td><td style="padding:12px;border:1px solid #eee">Jan 20</td></tr></tbody></table>',
                styles: { width: '360px', height: 'auto' }
            }
        },
        tabs: {
            category: 'Components',
            name: 'Tabs',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="M2 10h20"></path><path d="M10 4v6"></path></svg>',
            defaults: {
                content: '<div><div style="display:flex;border-bottom:2px solid #eee"><div style="padding:12px 20px;cursor:pointer;border-bottom:2px solid #000;margin-bottom:-2px;font-weight:600">Tab 1</div><div style="padding:12px 20px;cursor:pointer;color:#888">Tab 2</div><div style="padding:12px 20px;cursor:pointer;color:#888">Tab 3</div></div><div style="padding:20px;font-size:14px">Content for Tab 1 goes here.</div></div>',
                styles: { width: '320px', height: 'auto' }
            }
        },
        accordion: {
            category: 'Components',
            name: 'Accordion',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"></path></svg>',
            defaults: {
                content: '<div><div style="border:1px solid #eee;border-radius:8px;margin-bottom:8px;overflow:hidden"><div style="padding:14px 16px;background:#f9f9f9;cursor:pointer;font-weight:500;display:flex;justify-content:space-between">What is this? <span>&#9660;</span></div><div style="padding:16px;font-size:14px;color:#555">This is an answer to the question above.</div></div><div style="border:1px solid #eee;border-radius:8px;overflow:hidden"><div style="padding:14px 16px;background:#f9f9f9;cursor:pointer;font-weight:500;display:flex;justify-content:space-between">How does it work? <span>&#9660;</span></div><div style="padding:16px;font-size:14px;color:#555;display:none">This would show when expanded.</div></div></div>',
                styles: { width: '300px', height: 'auto' }
            }
        },
        carousel: {
            category: 'Components',
            name: 'Carousel',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="8" cy="12" r="2"></circle><circle cx="16" cy="12" r="2"></circle></svg>',
            defaults: {
                content: '<div style="display:flex;gap:12px;overflow-x:auto;padding:16px"><div style="min-width:200px;height:140px;background:linear-gradient(135deg,#667eea,#764ba2);border-radius:8px;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600">Slide 1</div><div style="min-width:200px;height:140px;background:linear-gradient(135deg,#f093fb,#f5576c);border-radius:8px;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600">Slide 2</div><div style="min-width:200px;height:140px;background:linear-gradient(135deg,#4facfe,#00f2fe);border-radius:8px;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600">Slide 3</div></div>',
                styles: { width: '340px', height: 'auto' }
            }
        },
        breadcrumb: {
            category: 'Components',
            name: 'Breadcrumb',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>',
            defaults: {
                content: '<nav style="display:flex;gap:8px;font-size:13px;color:#666;padding:12px 16px"><a href="#" style="color:#666;text-decoration:none">Home</a><span>/</span><a href="#" style="color:#666;text-decoration:none">Products</a><span>/</span><span style="color:#333;font-weight:500">Current Page</span></nav>',
                styles: { width: 'auto', height: 'auto' }
            }
        },
        pagination: {
            category: 'Components',
            name: 'Pagination',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline><line x1="3" y1="12" x2="21" y2="12"></line></svg>',
            defaults: {
                content: '<div style="display:flex;gap:8px;padding:12px"><button style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;border:1px solid #ddd;border-radius:6px;background:#fff;cursor:pointer">&lt;</button><button style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;border:1px solid #ddd;border-radius:6px;background:#fff;cursor:pointer">1</button><button style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;border:1px solid #ddd;border-radius:6px;background:#000;color:#fff;cursor:pointer">2</button><button style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;border:1px solid #ddd;border-radius:6px;background:#fff;cursor:pointer">3</button><button style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;border:1px solid #ddd;border-radius:6px;background:#fff;cursor:pointer">&gt;</button></div>',
                styles: { width: 'auto', height: 'auto' }
            }
        },
        emptyState: {
            category: 'Components',
            name: 'Empty State',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="9" y1="9" x2="15" y2="15"></line><line x1="15" y1="9" x2="9" y2="15"></line></svg>',
            defaults: {
                content: '<div style="text-align:center;padding:48px 24px;color:#888"><div style="font-size:48px;margin-bottom:16px;opacity:0.3">&#128203;</div><p style="font-size:16px;font-weight:500;margin:0 0 8px">No items found</p><p style="font-size:13px;margin:0">Start by adding some content here.</p></div>',
                styles: { width: '280px', height: 'auto' }
            }
        },
        skeleton: {
            category: 'Components',
            name: 'Skeleton Loader',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"></rect><line x1="6" y1="12" x2="14" y2="12"></line></svg>',
            defaults: {
                content: '<div style="padding:20px"><div style="display:flex;gap:16px;margin-bottom:20px"><div style="width:48px;height:48px;background:linear-gradient(90deg,#f0f0f0,#e0e0e0,#f0f0f0);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:50%"></div><div style="flex:1"><div style="height:14px;background:linear-gradient(90deg,#f0f0f0,#e0e0e0,#f0f0f0);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:4px;margin-bottom:8px;width:70%"></div><div style="height:12px;background:linear-gradient(90deg,#f0f0f0,#e0e0e0,#f0f0f0);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:4px;width:40%"></div></div></div><div style="height:100px;background:linear-gradient(90deg,#f0f0f0,#e0e0e0,#f0f0f0);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:8px"></div><style>@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}</style></div>',
                styles: { width: '300px', height: 'auto', background: '#fff', borderRadius: '8px' }
            }
        },
        tooltip: {
            category: 'Components',
            name: 'Tooltip',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
            defaults: {
                content: '<span style="position:relative;display:inline-block;cursor:help;border-bottom:1px dotted #666" title="This is a helpful tooltip">Hover me for info</span>',
                styles: { width: 'auto', height: 'auto' }
            }
        },
        dropdown: {
            category: 'Components',
            name: 'Dropdown Menu',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>',
            defaults: {
                content: '<div style="position:relative"><div style="padding:10px 16px;border:1px solid #ddd;border-radius:6px;background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:space-between">Select option &#9662;</div></div>',
                styles: { width: '180px', height: 'auto' }
            }
        },
        modalTrigger: {
            category: 'Components',
            name: 'Modal Trigger',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>',
            defaults: {
                content: '<button style="padding:12px 28px;background:#000;color:#fff;border:none;border-radius:6px;font-size:14px;font-weight:500;cursor:pointer">Open Modal</button>',
                styles: { width: 'auto', height: 'auto' }
            }
        },
        navMenu: {
            category: 'Components',
            name: 'Nav Menu',
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>',
            defaults: {
                content: '<nav style="display:flex;gap:24px;list-style:none;padding:12px 20px;margin:0;font-size:14px"><span style="cursor:pointer;font-weight:500">Home</span><span style="cursor:pointer;color:#666">Features</span><span style="cursor:pointer;color:#666">Pricing</span><span style="cursor:pointer;color:#666">About</span><span style="cursor:pointer;color:#666">Contact</span></nav>',
                styles: { width: 'auto', height: 'auto' }
            }
        }
    },

    // Create DOM element from data
    createDOM(elementData) {
        const el = document.createElement('div');
        el.className = `canvas-element element-${elementData.type}`;
        el.dataset.id = elementData.id;
        
        // Apply styles
        const styles = elementData.styles || {};
        Object.assign(el.style, {
            position: 'absolute',
            left: (styles.left || 100) + 'px',
            top: (styles.top || 100) + 'px',
            width: styles.width || 'auto',
            height: styles.height || 'auto'
        });
        
        // Apply additional styles
        const skipStyles = ['left', 'top', 'width', 'height'];
        Object.keys(styles).forEach(key => {
            if (!skipStyles.includes(key)) {
                el.style[key] = styles[key];
            }
        });
        
        // Set content
        if (elementData.content) {
            el.innerHTML = elementData.content;
        }
        
        // Handle special cases
        if (elementData.type === 'image' && elementData.properties?.src) {
            const img = document.createElement('img');
            img.src = elementData.properties.src;
            img.alt = elementData.properties?.alt || '';
            img.style.cssText = 'width:100%;height:100%;object-fit:cover';
            el.innerHTML = '';
            el.appendChild(img);
        } else if (elementData.type === 'video' && elementData.properties?.src) {
            const video = document.createElement('video');
            video.src = elementData.properties.src;
            if (elementData.properties.controls) video.controls = true;
            if (elementData.properties.autoplay) video.autoplay = true;
            if (elementData.properties.loop) video.loop = true;
            if (elementData.properties.muted) video.muted = true;
            video.style.cssText = 'width:100%;height:100%;object-fit:contain';
            el.innerHTML = '';
            el.appendChild(video);
        }
        
        // Apply state
        if (elementData.locked) el.classList.add('locked');
        if (elementData.hidden) el.classList.add('hidden');
        el.style.zIndex = elementData.zIndex || 1;
        
        return el;
    },

    // Get all types organized by category
    getTypesByCategory() {
        const categories = {};
        Object.keys(this.types).forEach(typeKey => {
            const type = this.types[typeKey];
            if (!categories[type.category]) {
                categories[type.category] = [];
            }
            categories[type.category].push({
                key: typeKey,
                ...type
            });
        });
        return categories;
    },

    // Add element of given type
    add(type, customOptions = {}) {
        const typeDef = this.types[type];
        if (!typeDef) {
            Toast.show(`Unknown element type: ${type}`, 'error');
            return null;
        }

        const options = {
            type,
            content: typeDef.defaults.content,
            styles: {
                left: 100 + Math.random() * 100,
                top: 100 + Math.random() * 100,
                ...typeDef.defaults.styles
            },
            properties: { ...typeDef.defaults.properties },
            ...customOptions
        };

        const element = AppState.addElement(options);
        AppState.selectElement(element.id);
        Canvas.render();
        PropertiesPanel.update();
        
        Toast.show(`${typeDef.name} added`, 'success');
        return element;
    }
};

// Make globally available
window.Elements = Elements;
