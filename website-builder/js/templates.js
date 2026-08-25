/**
 * ViewYourSite - Templates Module
 * Contains all template definitions and loading functions
 */

// Template definitions with metadata and HTML content
const TEMPLATES = {
  business: {
    id: 'business',
    name: 'Business / Corporate',
    description: 'Professional template perfect for companies, agencies, and startups.',
    icon: '🏢',
    tags: ['Professional', 'Corporate', 'Clean'],
    color: '#1a1a2e',
    thumbnail: 'thumbnail-business',
    
    // Full HTML content for the Business template
    html: `
      <!-- Navigation -->
      <nav class="template-nav" style="background: #1a1a2e; padding: 16px 32px; display: flex; justify-content: space-between; align-items: center;">
        <div style="font-size: 1.5rem; font-weight: 800; color: white;">TechCorp</div>
        <div style="display: flex; gap: 24px;">
          <span style="color: rgba(255,255,255,0.8); cursor: pointer;">Home</span>
          <span style="color: rgba(255,255,255,0.8); cursor: pointer;">About</span>
          <span style="color: rgba(255,255,255,0.8); cursor: pointer;">Services</span>
          <span style="color: rgba(255,255,255,0.8); cursor: pointer;">Contact</span>
        </div>
      </nav>

      <!-- Hero Section -->
      <section class="template-hero" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); padding: 80px 32px; text-align: center; color: white;">
        <h1 style="font-size: clamp(2rem, 5vw, 3.5rem); margin-bottom: 16px; font-weight: 800;">Building Tomorrow's Technology Today</h1>
        <p style="font-size: 1.25rem; opacity: 0.9; max-width: 600px; margin: 0 auto 32px;">We help businesses transform through innovative technology solutions that drive growth and efficiency.</p>
        <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
          <span style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #E85D4C 0%, #F6AD55 100%); border-radius: 30px; font-weight: 600; cursor: pointer;">Get Started</span>
          <span style="display: inline-block; padding: 14px 32px; background: transparent; border: 2px solid white; border-radius: 30px; font-weight: 600; cursor: pointer;">Learn More</span>
        </div>
      </section>

      <!-- Features/Services Section -->
      <section style="padding: 80px 32px; background: white;">
        <div style="max-width: 1200px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 48px;">
            <h2 style="margin-bottom: 12px;">Our Services</h2>
            <p style="color: #666; max-width: 500px; margin: 0 auto;">Comprehensive solutions tailored to your business needs</p>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px;">
            <div style="padding: 32px; background: #fafafa; border-radius: 16px; text-align: center;">
              <div style="font-size: 2.5rem; margin-bottom: 16px;">🚀</div>
              <h3 style="margin-bottom: 8px;">Digital Transformation</h3>
              <p style="color: #666; font-size: 0.95rem;">Modernize your operations with cutting-edge digital solutions.</p>
            </div>
            <div style="padding: 32px; background: #fafafa; border-radius: 16px; text-align: center;">
              <div style="font-size: 2.5rem; margin-bottom: 16px;">🔒</div>
              <h3 style="margin-bottom: 8px;">Cybersecurity</h3>
              <p style="color: #666; font-size: 0.95rem;">Protect your assets with enterprise-grade security solutions.</p>
            </div>
            <div style="padding: 32px; background: #fafafa; border-radius: 16px; text-align: center;">
              <div style="font-size: 2.5rem; margin-bottom: 16px;">☁️</div>
              <h3 style="margin-bottom: 8px;">Cloud Solutions</h3>
              <p style="color: #666; font-size: 0.95rem;">Scale your infrastructure with flexible cloud services.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- About Section -->
      <section style="padding: 80px 32px; background: #f8f9fa;">
        <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 48px; align-items: center;">
          <div>
            <h2 style="margin-bottom: 16px;">About Our Company</h2>
            <p style="color: #666; margin-bottom: 16px; line-height: 1.7;">With over a decade of experience, we've helped hundreds of businesses achieve their digital goals. Our team of experts combines technical excellence with creative thinking to deliver solutions that matter.</p>
            <p style="color: #666; line-height: 1.7;">We believe in building lasting partnerships with our clients, understanding their unique challenges, and crafting solutions that drive real results.</p>
          </div>
          <div style="background: linear-gradient(135deg, #E85D4C 0%, #F6AD55 100%); border-radius: 20px; height: 300px; display: flex; align-items: center; justify-content: center; color: white; font-size: 4rem;">📊</div>
        </div>
      </section>

      <!-- Testimonials Section -->
      <section style="padding: 80px 32px; background: white;">
        <div style="max-width: 800px; margin: 0 auto; text-align: center;">
          <h2 style="margin-bottom: 40px;">What Our Clients Say</h2>
          <div style="padding: 40px; background: #f8f9fa; border-radius: 20px; position: relative;">
            <div style="font-size: 3rem; position: absolute; top: -10px; left: 30px; opacity: 0.2;">"</div>
            <p style="font-size: 1.25rem; color: #333; line-height: 1.7; margin-bottom: 24px; font-style: italic;">"Working with TechCorp transformed our entire operation. Their team delivered beyond our expectations and helped us achieve results we never thought possible."</p>
                <div style="font-weight: 700; color: #E85D4C;">Sarah Johnson</div>
                <div style="color: #666; font-size: 0.9rem;">CEO, Innovation Labs</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Contact Section -->
      <section style="padding: 80px 32px; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white;">
        <div style="max-width: 600px; margin: 0 auto; text-align: center;">
          <h2 style="margin-bottom: 16px;">Get In Touch</h2>
          <p style="opacity: 0.8; margin-bottom: 32px;">Ready to start your project? Contact us today for a free consultation.</p>
          <div style="display: flex; flex-direction: column; gap: 16px; max-width: 400px; margin: 0 auto;">
            <input type="text" placeholder="Your Name" style="padding: 14px 20px; border: none; border-radius: 8px; font-size: 1rem;">
            <input type="email" placeholder="Your Email" style="padding: 14px 20px; border: none; border-radius: 8px; font-size: 1rem;">
            <textarea placeholder="Your Message" rows="4" style="padding: 14px 20px; border: none; border-radius: 8px; font-size: 1rem; resize: vertical;"></textarea>
            <button style="padding: 14px 32px; background: linear-gradient(135deg, #E85D4C 0%, #F6AD55 100%); border: none; border-radius: 8px; color: white; font-weight: 600; font-size: 1rem; cursor: pointer;">Send Message</button>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer style="background: #0d1117; color: rgba(255,255,255,0.7); padding: 40px 32px; text-align: center;">
        <div style="font-size: 1.5rem; font-weight: 800; color: white; margin-bottom: 16px;">TechCorp</div>
        <p style="font-size: 0.9rem;">© 2024 TechCorp. All rights reserved.</p>
      </footer>
    `
  },

  portfolio: {
    id: 'portfolio',
    name: 'Portfolio / Creative',
    description: 'Showcase your work beautifully with this modern portfolio template.',
    icon: '🎨',
    tags: ['Creative', 'Portfolio', 'Modern'],
    color: '#2d1b69',
    thumbnail: 'thumbnail-portfolio',
    
    html: `
      <!-- Hero Section - Full Screen -->
      <section class="template-hero" style="min-height: 80vh; background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%); display: flex; align-items: center; justify-content: center; text-align: center; color: white; padding: 60px 32px;">
        <div>
          <p style="font-size: 1rem; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 16px; opacity: 0.9;">Creative Designer & Developer</p>
          <h1 style="font-size: clamp(2.5rem, 7vw, 5rem); font-weight: 800; margin-bottom: 24px; line-height: 1.1;">Alex Morgan</h1>
          <p style="font-size: 1.25rem; opacity: 0.9; max-width: 500px; margin: 0 auto 32px;">Crafting beautiful digital experiences that inspire and engage audiences worldwide.</p>
          <div style="display: flex; gap: 16px; justify-content: center;">
            <span style="display: inline-block; padding: 14px 32px; background: white; color: #2d1b69; border-radius: 30px; font-weight: 600; cursor: pointer;">View My Work</span>
            <span style="display: inline-block; padding: 14px 32px; background: transparent; border: 2px solid white; border-radius: 30px; font-weight: 600; cursor: pointer;">Contact Me</span>
          </div>
        </div>
      </section>

      <!-- Projects Gallery -->
      <section style="padding: 80px 32px; background: white;">
        <div style="max-width: 1200px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 48px;">
            <h2 style="margin-bottom: 12px;">Featured Projects</h2>
            <p style="color: #666;">A selection of my recent work</p>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px;">
            <div style="border-radius: 16px; overflow: hidden; background: #f0f0f0; aspect-ratio: 4/3; display: flex; align-items: center; justify-content: center; font-size: 4rem; cursor: pointer; transition: transform 0.3s;">🎨</div>
            <div style="border-radius: 16px; overflow: hidden; background: #e8f4f8; aspect-ratio: 4/3; display: flex; align-items: center; justify-content: center; font-size: 4rem; cursor: pointer; transition: transform 0.3s;">💻</div>
            <div style="border-radius: 16px; overflow: hidden; background: #fff0f0; aspect-ratio: 4/3; display: flex; align-items: center; justify-content: center; font-size: 4rem; cursor: pointer; transition: transform 0.3s;">📱</div>
            <div style="border-radius: 16px; overflow: hidden; background: #f0fff0; aspect-ratio: 4/3; display: flex; align-items: center; justify-content: center; font-size: 4rem; cursor: pointer; transition: transform 0.3s;">✨</div>
            <div style="border-radius: 16px; overflow: hidden; background: #f8f0ff; aspect-ratio: 4/3; display: flex; align-items: center; justify-content: center; font-size: 4rem; cursor: pointer; transition: transform 0.3s;">🎬</div>
            <div style="border-radius: 16px; overflow: hidden; background: #fffff0; aspect-ratio: 4/3; display: flex; align-items: center; justify-content: center; font-size: 4rem; cursor: pointer; transition: transform 0.3s;">🎵</div>
          </div>
        </div>
      </section>

      <!-- About Section -->
      <section style="padding: 80px 32px; background: #f8f9fa;">
        <div style="max-width: 900px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center;">
          <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); border-radius: 20px; height: 400px; display: flex; align-items: center; justify-content: center; font-size: 6rem;">👨‍💻</div>
          <div>
            <h2 style="margin-bottom: 16px;">About Me</h2>
            <p style="color: #666; margin-bottom: 16px; line-height: 1.7;">I'm a passionate designer and developer based in San Francisco with over 8 years of experience creating digital products for brands around the world.</p>
            <p style="color: #666; margin-bottom: 24px; line-height: 1.7;">My approach combines clean aesthetics with functional design, ensuring every project not only looks beautiful but also delivers exceptional user experiences.</p>
            <h4 style="margin-bottom: 12px;">Skills & Expertise</h4>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              <span style="padding: 6px 14px; background: white; border-radius: 20px; font-size: 0.9rem;">UI/UX Design</span>
              <span style="padding: 6px 14px; background: white; border-radius: 20px; font-size: 0.9rem;">Web Development</span>
              <span style="padding: 6px 14px; background: white; border-radius: 20px; font-size: 0.9rem;">Brand Identity</span>
              <span style="padding: 6px 14px; background: white; border-radius: 20px; font-size: 0.9rem;">Motion Design</span>
              <span style="padding: 6px 14px; background: white; border-radius: 20px; font-size: 0.9rem;">Illustration</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Contact Section -->
      <section style="padding: 80px 32px; background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%); color: white;">
        <div style="max-width: 600px; margin: 0 auto; text-align: center;">
          <h2 style="margin-bottom: 16px;">Let's Work Together</h2>
          <p style="opacity: 0.9; margin-bottom: 32px;">Have a project in mind? I'd love to hear about it.</p>
          <form style="display: flex; flex-direction: column; gap: 16px; text-align: left;">
            <input type="text" placeholder="Your Name" style="padding: 14px 20px; border: none; border-radius: 8px; font-size: 1rem;">
            <input type="email" placeholder="Your Email" style="padding: 14px 20px; border: none; border-radius: 8px; font-size: 1rem;">
            <textarea placeholder="Tell me about your project..." rows="5" style="padding: 14px 20px; border: none; border-radius: 8px; font-size: 1rem; resize: vertical;"></textarea>
            <button type="submit" style="padding: 14px 32px; background: white; color: #2d1b69; border: none; border-radius: 8px; font-weight: 600; font-size: 1rem; cursor: pointer; align-self: flex-start;">Send Message →</button>
          </form>
        </div>
      </section>

      <!-- Social Links Footer -->
      <footer style="background: #1a1033; color: white; padding: 40px 32px; text-align: center;">
        <div style="display: flex; justify-content: center; gap: 24px; margin-bottom: 24px; font-size: 1.5rem;">
          <span style="cursor: pointer;">🐦</span>
          <span style="cursor: pointer;">💼</span>
          <span style="cursor: pointer;">📸</span>
          <span style="cursor: pointer;">🎮</span>
        </div>
        <p style="opacity: 0.7; font-size: 0.9rem;">© 2024 Alex Morgan. Made with ❤️</p>
      </footer>
    `
  },

  restaurant: {
    id: 'restaurant',
    name: 'Restaurant / Food',
    description: 'Elegant template for restaurants, cafes, and food businesses.',
    icon: '🍽️',
    tags: ['Restaurant', 'Food', 'Elegant'],
    color: '#2c1810',
    thumbnail: 'thumbnail-restaurant',
    
    html: `
      <!-- Header -->
      <header style="background: linear-gradient(180deg, #2c1810 0%, #4a2c2a 100%); padding: 24px 32px; text-align: center; border-bottom: 1px solid rgba(212,175,55,0.3);">
        <h1 style="font-family: Georgia, serif; font-size: 2rem; color: #d4af37; letter-spacing: 4px; margin: 0;">La Belle Cuisine</h1>
        <p style="color: rgba(255,255,255,0.7); font-size: 0.9rem; margin-top: 8px; letter-spacing: 2px;">FINE DINING EXPERIENCE</p>
      </header>

      <!-- Hero Banner -->
      <section style="height: 400px; background: linear-gradient(rgba(44,24,16,0.6), rgba(44,24,16,0.7)), url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200'); background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; text-align: center; color: white; padding: 32px;">
        <div>
          <p style="letter-spacing: 3px; font-size: 0.9rem; margin-bottom: 12px; opacity: 0.9;">WELCOME TO</p>
          <h2 style="font-family: Georgia, serif; font-size: clamp(2rem, 5vw, 3.5rem); margin-bottom: 16px;">An Exquisite Culinary Journey</h2>
          <p style="opacity: 0.9; max-width: 500px; margin: 0 auto 24px;">Experience the finest French cuisine crafted with passion and the freshest ingredients.</p>
          <span style="display: inline-block; padding: 14px 36px; background: #d4af37; color: #2c1810; border-radius: 4px; font-weight: 700; cursor: pointer; letter-spacing: 1px;">RESERVE A TABLE</span>
        </div>
      </section>

      <!-- Menu Section - Starters -->
      <section style="padding: 64px 32px; background: #faf8f5;">
        <div style="max-width: 900px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 48px;">
            <p style="color: #d4af37; letter-spacing: 3px; font-size: 0.85rem; margin-bottom: 8px;">DISCOVER</p>
            <h2 style="font-family: Georgia, serif;">Our Menu</h2>
          </div>
          
          <div style="margin-bottom: 48px;">
            <h3 style="font-family: Georgia, serif; color: #d4af37; border-bottom: 1px solid #ddd; padding-bottom: 12px; margin-bottom: 24px;">Starters</h3>
            
            <div style="display: flex; justify-content: space-between; padding: 16px 0; border-bottom: 1px dashed #ccc;">
              <div>
                <strong>French Onion Soup</strong>
                <p style="font-size: 0.85rem; color: #666; margin-top: 4px;">Gruyère cheese, croutons, fresh herbs</p>
              </div>
              <span style="color: #d4af37; font-weight: 700;">$14</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; padding: 16px 0; border-bottom: 1px dashed #ccc;">
              <div>
                <strong>Escargots de Bourgogne</strong>
                <p style="font-size: 0.85rem; color: #666; margin-top: 4px;">Garlic butter, parsley, traditional preparation</p>
              </div>
              <span style="color: #d4af37; font-weight: 700;">$18</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; padding: 16px 0; border-bottom: 1px dashed #ccc;">
              <div>
                <strong>Tartare de Saumon</strong>
                <p style="font-size: 0.85rem; color: #666; margin-top: 4px;">Fresh salmon, avocado, citrus dressing</p>
              </div>
              <span style="color: #d4af37; font-weight: 700;">$19</span>
            </div>
          </div>
          
          <!-- Main Courses -->
          <div style="margin-bottom: 48px;">
            <h3 style="font-family: Georgia, serif; color: #d4af37; border-bottom: 1px solid #ddd; padding-bottom: 12px; margin-bottom: 24px;">Main Courses</h3>
            
            <div style="display: flex; justify-content: space-between; padding: 16px 0; border-bottom: 1px dashed #ccc;">
              <div>
                <strong>Boeuf Bourguignon</strong>
                <p style="font-size: 0.85rem; color: #666; margin-top: 4px;">Slow-cooked beef, red wine, mushrooms</p>
              </div>
              <span style="color: #d4af37; font-weight: 700;">$34</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; padding: 16px 0; border-bottom: 1px dashed #ccc;">
              <div>
                <strong>Sautéed Duck Breast</strong>
                <p style="font-size: 0.85rem; color: #666; margin-top: 4px;">Cherry reduction, seasonal vegetables</p>
              </div>
              <span style="color: #d4af37; font-weight: 700;">$38</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; padding: 16px 0; border-bottom: 1px dashed #ccc;">
              <div>
                <strong>Pan-Seared Sea Bass</strong>
                <p style="font-size: 0.85rem; color: #666; margin-top: 4px;">Lemon beurre blanc, asparagus, risotto</p>
              </div>
              <span style="color: #d4af37; font-weight: 700;">$36</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Gallery Section -->
      <section style="padding: 64px 32px; background: #2c1810;">
        <div style="max-width: 1200px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 40px;">
            <p style="color: #d4af37; letter-spacing: 3px; font-size: 0.85rem; margin-bottom: 8px;">GALLERY</p>
            <h2 style="font-family: Georgia, serif; color: white;">A Visual Feast</h2>
          </div>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
            <div style="aspect-ratio: 1; background: linear-gradient(45deg, #8B4513, #D2691E); border-radius: 8px;"></div>
            <div style="aspect-ratio: 1; background: linear-gradient(45deg, #CD853F, #DEB887); border-radius: 8px;"></div>
            <div style="aspect-ratio: 1; background: linear-gradient(45deg, #A0522D, #BC8F8F); border-radius: 8px;"></div>
            <div style="aspect-ratio: 1; background: linear-gradient(45deg, #6B4423, #8B7355); border-radius: 8px;"></div>
          </div>
        </div>
      </section>

      <!-- Reservation CTA -->
      <section style="padding: 80px 32px; background: linear-gradient(135deg, #d4af37 0%, #f4cf67 100%); text-align: center;">
        <h2 style="font-family: Georgia, serif; color: #2c1810; margin-bottom: 16px;">Reserve Your Table</h2>
        <p style="color: #4a2c2a; max-width: 500px; margin: 0 auto 32px;">Join us for an unforgettable dining experience. Book your table today.</p>
        <div style="display: inline-flex; gap: 16px; flex-wrap: wrap; justify-content: center;">
          <span style="display: flex; align-items: center; gap: 8px; padding: 12px 24px; background: #2c1810; color: white; border-radius: 6px; font-weight: 600;">📞 Call (555) 123-4567</span>
          <span style="display: flex; align-items: center; gap: 8px; padding: 12px 24px; background: #2c1810; color: white; border-radius: 6px; font-weight: 600;">🕐 Open Tue-Sun 5PM-11PM</span>
        </div>
      </section>

      <!-- Location & Hours -->
      <section style="padding: 64px 32px; background: #faf8f5;">
        <div style="max-width: 900px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 48px; text-align: center;">
          <div>
            <div style="font-size: 2.5rem; margin-bottom: 16px;">📍</div>
            <h3 style="margin-bottom: 12px; font-family: Georgia, serif;">Location</h3>
            <p style="color: #666;">123 Gourmet Avenue<br>Culinary District<br>San Francisco, CA 94102</p>
          </div>
          <div>
            <div style="font-size: 2.5rem; margin-bottom: 16px;">🕐</div>
            <h3 style="margin-bottom: 12px; font-family: Georgia, serif;">Hours</h3>
            <p style="color: #666;">Tuesday - Thursday: 5PM - 10PM<br>Friday - Saturday: 5PM - 11PM<br>Sunday: 4PM - 9PM<br><strong>Monday: Closed</strong></p>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer style="background: #1a0f0a; color: rgba(255,255,255,0.7); padding: 40px 32px; text-align: center;">
        <h2 style="font-family: Georgia, serif; color: #d4af37; font-size: 1.5rem; margin-bottom: 8px;">La Belle Cuisine</h2>
        <p style="font-size: 0.85rem;">© 2024 La Belle Cuisine. All rights reserved.</p>
      </footer>
    `
  },

  landing: {
    id: 'landing',
    name: 'Landing Page',
    description: 'High-converting landing page template for products and services.',
    icon: '🚀',
    tags: ['Marketing', 'SaaS', 'Conversion'],
    color: '#667eea',
    thumbnail: 'thumbnail-landing',
    
    html: `
      <!-- Navigation -->
      <nav style="background: white; padding: 16px 32px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
        <div style="font-size: 1.5rem; font-weight: 800; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">LaunchPad</div>
        <div style="display: flex; gap: 24px; align-items: center;">
          <span style="color: #666; cursor: pointer; font-size: 0.95rem;">Features</span>
          <span style="color: #666; cursor: pointer; font-size: 0.95rem;">Pricing</span>
          <span style="color: #666; cursor: pointer; font-size: 0.95rem;">FAQ</span>
          <span style="padding: 10px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 25px; font-weight: 600; cursor: pointer; font-size: 0.95rem;">Get Started</span>
        </div>
      </nav>

      <!-- Hero / Product Showcase -->
      <section style="padding: 80px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); text-align: center; color: white;">
        <div style="max-width: 800px; margin: 0 auto;">
          <span style="display: inline-block; padding: 8px 20px; background: rgba(255,255,255,0.2); border-radius: 20px; font-size: 0.85rem; margin-bottom: 24px;">🚀 Now in Public Beta</span>
          <h1 style="font-size: clamp(2.5rem, 6vw, 4rem); font-weight: 800; margin-bottom: 20px; line-height: 1.1;">Ship Products Faster Than Ever Before</h1>
          <p style="font-size: 1.25rem; opacity: 0.95; margin-bottom: 36px; max-width: 600px; margin-left: auto; margin-right: auto;">The all-in-one platform that helps teams build, launch, and scale products 10x faster.</p>
          <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
            <span style="display: inline-flex; align-items: center; gap: 8px; padding: 16px 36px; background: white; color: #667eea; border-radius: 30px; font-weight: 700; font-size: 1.1rem; cursor: pointer;">Start Free Trial →</span>
            <span style="display: inline-flex; align-items: center; gap: 8px; padding: 16px 36px; background: transparent; border: 2px solid white; border-radius: 30px; font-weight: 600; font-size: 1.1rem; cursor: pointer;">Watch Demo</span>
          </div>
          <p style="margin-top: 24px; opacity: 0.8; font-size: 0.9rem;">No credit card required • Free 14-day trial • Cancel anytime</p>
        </div>
      </section>

      <!-- Features List -->
      <section style="padding: 80px 32px; background: white;">
        <div style="max-width: 1100px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 56px;">
            <h2 style="margin-bottom: 12px;">Everything You Need to Succeed</h2>
            <p style="color: #666; max-width: 550px; margin: 0 auto;">Powerful features designed to streamline your workflow and boost productivity.</p>
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 32px;">
            <div style="padding: 28px;">
              <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #667eea20, #764ba220); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 20px;">⚡</div>
              <h3 style="margin-bottom: 10px; font-size: 1.2rem;">Lightning Fast</h3>
              <p style="color: #666; line-height: 1.6;">Optimized performance ensures your projects load instantly and run smoothly at any scale.</p>
            </div>
            
            <div style="padding: 28px;">
              <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #667eea20, #764ba220); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 20px;">🔒</div>
              <h3 style="margin-bottom: 10px; font-size: 1.2rem;">Enterprise Security</h3>
              <p style="color: #666; line-height: 1.6;">Bank-grade encryption and security protocols keep your data safe and compliant.</p>
            </div>
            
            <div style="padding: 28px;">
              <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #667eea20, #764ba220); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 20px;">🤝</div>
              <h3 style="margin-bottom: 10px; font-size: 1.2rem;">Team Collaboration</h3>
              <p style="color: #666; line-height: 1.6;">Real-time collaboration tools that keep your team aligned and productive.</p>
            </div>
            
            <div style="padding: 28px;">
              <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #667eea20, #764ba220); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 20px;">📊</div>
              <h3 style="margin-bottom: 10px; font-size: 1.2rem;">Advanced Analytics</h3>
              <p style="color: #666; line-height: 1.6;">Deep insights and reporting to track progress and make data-driven decisions.</p>
            </div>
            
            <div style="padding: 28px;">
              <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #667eea20, #764ba220); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 20px;">🔌</div>
              <h3 style="margin-bottom: 10px; font-size: 1.2rem;">Integrations</h3>
              <p style="color: #666; line-height: 1.6;">Connect with 100+ tools you already use including Slack, GitHub, and more.</p>
            </div>
            
            <div style="padding: 28px;">
              <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #667eea20, #764ba220); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 20px;">💬</div>
              <h3 style="margin-bottom: 10px; font-size: 1.2rem;">24/7 Support</h3>
              <p style="color: #666; line-height: 1.6;">Our expert support team is always available to help you succeed.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Pricing Table -->
      <section style="padding: 80px 32px; background: #f8f9fa;">
        <div style="max-width: 1000px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 56px;">
            <h2 style="margin-bottom: 12px;">Simple, Transparent Pricing</h2>
            <p style="color: #666;">Choose the plan that's right for you</p>
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; align-items: start;">
            <!-- Starter Plan -->
            <div style="background: white; border-radius: 20px; padding: 36px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
              <h3 style="font-size: 1.2rem; margin-bottom: 8px;">Starter</h3>
              <p style="color: #666; font-size: 0.9rem; margin-bottom: 20px;">Perfect for individuals</p>
              <div style="margin-bottom: 24px;">
                <span style="font-size: 3rem; font-weight: 800;">$9</span>
                <span style="color: #666;">/month</span>
              </div>
              <ul style="list-style: none; padding: 0; margin-bottom: 28px;">
                <li style="padding: 10px 0; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 10px;"><span style="color: #28C840;">✓</span> 5 Projects</li>
                <li style="padding: 10px 0; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 10px;"><span style="color: #28C840;">✓</span> Basic Analytics</li>
                <li style="padding: 10px 0; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 10px;"><span style="color: #28C840;">✓</span> Email Support</li>
                <li style="padding: 10px 0; display: flex; align-items: center; gap: 10px; color: #ccc;"><span>✗</span> Custom Domain</li>
              </ul>
              <button style="width: 100%; padding: 14px; background: #f0f0f0; border: none; border-radius: 10px; font-weight: 600; cursor: pointer;">Get Started</button>
            </div>
            
            <!-- Pro Plan (Featured) -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 20px; padding: 36px; color: white; transform: scale(1.05); box-shadow: 0 10px 40px rgba(102,126,234,0.4);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <h3 style="font-size: 1.2rem;">Pro</h3>
                <span style="padding: 4px 12px; background: rgba(255,255,255,0.2); border-radius: 12px; font-size: 0.75rem;">POPULAR</span>
              </div>
              <p style="opacity: 0.9; font-size: 0.9rem; margin-bottom: 20px;">Best for growing teams</p>
              <div style="margin-bottom: 24px;">
                <span style="font-size: 3rem; font-weight: 800;">$29</span>
                <span style="opacity: 0.8;">/month</span>
              </div>
              <ul style="list-style: none; padding: 0; margin-bottom: 28px;">
                <li style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.2); display: flex; align-items: center; gap: 10px;"><span>✓</span> Unlimited Projects</li>
                <li style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.2); display: flex; align-items: center; gap: 10px;"><span>✓</span> Advanced Analytics</li>
                <li style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.2); display: flex; align-items: center; gap: 10px;"><span>✓</span> Priority Support</li>
                <li style="padding: 10px 0; display: flex; align-items: center; gap: 10px;"><span>✓</span> Custom Domain</li>
              </ul>
              <button style="width: 100%; padding: 14px; background: white; border: none; border-radius: 10px; font-weight: 600; color: #667eea; cursor: pointer;">Get Started</button>
            </div>
            
            <!-- Enterprise Plan -->
            <div style="background: white; border-radius: 20px; padding: 36px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
              <h3 style="font-size: 1.2rem; margin-bottom: 8px;">Enterprise</h3>
              <p style="color: #666; font-size: 0.9rem; margin-bottom: 20px;">For large organizations</p>
              <div style="margin-bottom: 24px;">
                <span style="font-size: 3rem; font-weight: 800;">$99</span>
                <span style="color: #666;">/month</span>
              </div>
              <ul style="list-style: none; padding: 0; margin-bottom: 28px;">
                <li style="padding: 10px 0; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 10px;"><span style="color: #28C840;">✓</span> Everything in Pro</li>
                <li style="padding: 10px 0; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 10px;"><span style="color: #28C840;">✓</span> SSO & Security</li>
                <li style="padding: 10px 0; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 10px;"><span style="color: #28C840;">✓</span> Dedicated Manager</li>
                <li style="padding: 10px 0; display: flex; align-items: center; gap: 10px;"><span style="color: #28C840;">✓</span> SLA Guarantee</li>
              </ul>
              <button style="width: 100%; padding: 14px; background: #f0f0f0; border: none; border-radius: 10px; font-weight: 600; cursor: pointer;">Contact Sales</button>
            </div>
          </div>
        </div>
      </section>

      <!-- FAQ Section -->
      <section style="padding: 80px 32px; background: white;">
        <div style="max-width: 750px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 48px;">
            <h2 style="margin-bottom: 12px;">Frequently Asked Questions</h2>
            <p style="color: #666;">Got questions? We've got answers.</p>
          </div>
          
          <div style="border-top: 1px solid #eee;">
            <div style="padding: 20px 0; border-bottom: 1px solid #eee;">
              <h4 style="margin-bottom: 8px; font-size: 1.05rem;">How does the free trial work?</h4>
              <p style="color: #666; line-height: 1.6;">You get full access to all Pro features for 14 days. No credit card required. Cancel anytime during the trial and you won't be charged.</p>
            </div>
            <div style="padding: 20px 0; border-bottom: 1px solid #eee;">
              <h4 style="margin-bottom: 8px; font-size: 1.05rem;">Can I change plans later?</h4>
              <p style="color: #666; line-height: 1.6;">Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate any differences.</p>
            </div>
            <div style="padding: 20px 0; border-bottom: 1px solid #eee;">
              <h4 style="margin-bottom: 8px; font-size: 1.05rem;">What kind of support do you offer?</h4>
              <p style="color: #666; line-height: 1.6;">All plans include email support. Pro and Enterprise plans include priority chat support. Enterprise customers get a dedicated success manager.</p>
            </div>
            <div style="padding: 20px 0;">
              <h4 style="margin-bottom: 8px; font-size: 1.05rem;">Is my data secure?</h4>
              <p style="color: #666; line-height: 1.6;">Security is our top priority. We use AES-256 encryption, are SOC 2 Type II certified, and undergo regular third-party security audits.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Final CTA -->
      <section style="padding: 80px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); text-align: center; color: white;">
        <h2 style="font-size: clamp(1.75rem, 4vw, 2.5rem); margin-bottom: 16px;">Ready to Get Started?</h2>
        <p style="opacity: 0.95; font-size: 1.15rem; margin-bottom: 32px; max-width: 550px; margin-left: auto; margin-right: auto;">Join thousands of teams already using LaunchPad to ship faster.</p>
        <span style="display: inline-flex; align-items: center; gap: 8px; padding: 18px 42px; background: white; color: #667eea; border-radius: 30px; font-weight: 700; font-size: 1.15rem; cursor: pointer;">Start Your Free Trial →</span>
      </section>

      <!-- Footer -->
      <footer style="background: #1a1a2e; color: rgba(255,255,255,0.7); padding: 48px 32px;">
        <div style="max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 40px;">
          <div>
            <div style="font-size: 1.5rem; font-weight: 800; color: white; margin-bottom: 16px;">LaunchPad</div>
            <p style="font-size: 0.9rem; line-height: 1.6;">Ship products faster than ever before.</p>
          </div>
          <div>
            <h4 style="color: white; margin-bottom: 16px;">Product</h4>
            <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.9rem;">
              <span style="cursor: pointer;">Features</span>
              <span style="cursor: pointer;">Pricing</span>
              <span style="cursor: pointer;">Integrations</span>
              <span style="cursor: pointer;">Changelog</span>
            </div>
          </div>
          <div>
            <h4 style="color: white; margin-bottom: 16px;">Company</h4>
            <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.9rem;">
              <span style="cursor: pointer;">About</span>
              <span style="cursor: pointer;">Blog</span>
              <span style="cursor: pointer;">Careers</span>
              <span style="cursor: pointer;">Contact</span>
            </div>
          </div>
          <div>
            <h4 style="color: white; margin-bottom: 16px;">Legal</h4>
            <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.9rem;">
              <span style="cursor: pointer;">Privacy</span>
              <span style="cursor: pointer;">Terms</span>
              <span style="cursor: pointer;">Security</span>
            </div>
          </div>
        </div>
        <div style="max-width: 1100px; margin: 40px auto 0; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center; font-size: 0.85rem;">
          © 2024 LaunchPad. All rights reserved.
        </div>
      </footer>
    `
  }
};

/**
 * Load template HTML by ID
 * @param {string} templateId - The template ID
 * @returns {string} The template HTML content
 */
function getTemplateHtml(templateId) {
  const template = TEMPLATES[templateId];
  return template ? template.html : '';
}

/**
 * Get template metadata
 * @param {string} templateId - The template ID  
 * @returns {object} Template metadata object
 */
function getTemplateInfo(templateId) {
  return TEMPLATES[templateId] || null;
}

/**
 * Get all templates array
 * @returns {Array} Array of all template objects
 */
function getAllTemplates() {
  return Object.values(TEMPLATES);
}
