document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) window.lucide.createIcons();

  /*
   * EDIT SECTION LANDING POSITIONS HERE (pixels).
   * Positive numbers scroll farther DOWN into a section.
   * Negative numbers stop farther ABOVE the section.
   */
  const SECTION_SCROLL_ADJUSTMENTS = {
    home: 0,
    services: 50,
    specials: -130,
    about: 0,
    contact: 50
  };

  const scrollToSection = (hash, smooth = true) => {
    const id = hash.replace('#', '');
    const section = document.getElementById(id);
    if (!section) return;

    const headerHeight = document.querySelector('.site-header')?.offsetHeight || 0;
    const adjustment = SECTION_SCROLL_ADJUSTMENTS[id] || 0;
    const top = section.getBoundingClientRect().top + window.scrollY - headerHeight + adjustment;

    window.scrollTo({ top: Math.max(0, top), behavior: smooth ? 'smooth' : 'auto' });
  };

  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  const navLinks = [...document.querySelectorAll('.main-nav a')];

  menuButton?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
  });

  document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
    const hash = link.getAttribute('href');
    if (!hash || hash === '#') return;
    event.preventDefault();
    if (link.dataset.service) chooseService(link.dataset.service);
    if (window.location.hash !== hash) window.location.hash = hash;
    requestAnimationFrame(() => scrollToSection(hash));
    nav.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  }));

  window.addEventListener('hashchange', () => {
    if (window.location.hash) scrollToSection(window.location.hash);
  });

  if (window.location.hash) {
    requestAnimationFrame(() => scrollToSection(window.location.hash, false));
  }

  const sections = [...document.querySelectorAll('main section[id]')];
  const updateActiveLink = () => {
    const marker = window.scrollY + 150;
    let active = sections[0]?.id;
    sections.forEach(section => { if (section.offsetTop <= marker) active = section.id; });
    navLinks.forEach(link => link.classList.toggle('active', link.hash === `#${active}`));
  };
  updateActiveLink();
  window.addEventListener('scroll', updateActiveLink, { passive: true });

  const form = document.querySelector('#estimateForm');
  const status = form?.querySelector('.form-status');
  const customSelect = form?.querySelector('[data-custom-select]');
  const selectButton = customSelect?.querySelector('.custom-select-button');
  const selectLabel = selectButton?.querySelector('span');
  const serviceInput = customSelect?.querySelector('input[name="service"]');

  function chooseService(value) {
    const option = customSelect?.querySelector(`[role="option"][data-value="${value}"]`);
    if (!option) return;
    serviceInput.value = option.dataset.value;
    selectLabel.textContent = option.textContent;
    selectButton.classList.add('has-value');
    customSelect.querySelectorAll('[role="option"]').forEach(item => item.classList.toggle('selected', item === option));
    customSelect.classList.remove('open');
    selectButton.setAttribute('aria-expanded', 'false');
    if (status) status.textContent = '';
  }

  selectButton?.addEventListener('click', () => {
    const open = customSelect.classList.toggle('open');
    selectButton.setAttribute('aria-expanded', String(open));
  });

  customSelect?.querySelectorAll('[role="option"]').forEach(option => {
    option.addEventListener('click', () => {
      chooseService(option.dataset.value);
    });
  });

  document.addEventListener('click', event => {
    if (customSelect && !customSelect.contains(event.target)) {
      customSelect.classList.remove('open');
      selectButton?.setAttribute('aria-expanded', 'false');
    }
  });

  const methodInput = form?.querySelector('input[name="contactMethod"]');
  const valueInput = form?.querySelector('input[name="contactValue"]');
  const valueLabel = form?.querySelector('.contact-value-field span');
  const submitLabel = form?.querySelector('.submit-label');

  const formatPhoneNumber = value => {
    const digits = value.replace(/\D/g, '').replace(/^1(?=\d{10})/, '').slice(0, 10);
    if (digits.length < 4) return digits;
    if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  valueInput?.addEventListener('input', () => {
    if (valueInput.type === 'tel') valueInput.value = formatPhoneNumber(valueInput.value);
  });

  form?.querySelectorAll('.preference-option').forEach(button => {
    button.addEventListener('click', () => {
      const method = button.dataset.method;
      methodInput.value = method;
      form.querySelectorAll('.preference-option').forEach(item => {
        const active = item === button;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      const usesEmail = method === 'email';
      valueInput.type = usesEmail ? 'email' : 'tel';
      valueInput.inputMode = usesEmail ? 'email' : 'tel';
      valueInput.maxLength = usesEmail ? 254 : 14;
      valueInput.placeholder = usesEmail ? 'Email Address' : 'Phone Number';
      valueInput.autocomplete = usesEmail ? 'email' : 'tel';
      valueLabel.textContent = usesEmail ? 'Email address' : 'Phone number';
      submitLabel.textContent = usesEmail ? 'Open Email' : 'Open Messages';
      valueInput.value = '';
      valueInput.focus();
      status.textContent = '';
    });
  });

  form?.addEventListener('submit', event => {
    event.preventDefault();
    if (!serviceInput.value) {
      status.textContent = 'Please choose a service.';
      selectButton.focus();
      return;
    }
    if (!form.reportValidity()) return;

    const name = form.elements.name.value.trim();
    const service = serviceInput.value;
    const method = methodInput.value;
    const contact = valueInput.value.trim();
    const message = `Hello! My name is ${name}, I was just reaching out about ${service}. The best way to get in touch with me is to ${method} me at this ${method === 'email' ? 'email' : 'number'}: ${contact}.`;
    if (method === 'email') {
      const subject = `Service request from ${name}`;
      window.location.href = `mailto:greenhouseplumbing@yahoo.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    } else {
      window.location.href = `sms:+17023052598?body=${encodeURIComponent(message)}`;
    }
  });
});
