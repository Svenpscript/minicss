const initialized = new WeakSet();
export function initNavigation(root = document) {
  root.querySelectorAll('nav button[aria-controls]').forEach(button => {
    const menu = root.getElementById ? root.getElementById(button.getAttribute('aria-controls')) : root.querySelector(`#${CSS.escape(button.getAttribute('aria-controls'))}`);
    if (!menu || !button.closest('nav').contains(menu) || !menu.matches('ul, ol') || initialized.has(button)) return;
    initialized.add(button);
    button.dataset.navToggle = '';
    menu.dataset.navMenu = '';
    button.hidden = false;
    button.dataset.navReady = '';
    const nav = button.closest('nav');
    const close = (restore = false) => {
      menu.removeAttribute('data-menu-open'); button.setAttribute('aria-expanded', 'false');
      if (restore && button.getClientRects().length) button.focus();
    };
    button.setAttribute('aria-expanded', 'false');
    button.addEventListener('click', () => {
      button.focus();
      const open = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(open)); menu.toggleAttribute('data-menu-open', open);
      // Explicit focus also works when a browser does not focus buttons on mouse clicks.
      if (open) menu.querySelector('a[href], button, input, select, [tabindex="0"]')?.focus();
    });
    nav.addEventListener('keydown', event => { if (event.key === 'Escape') { close(true); event.preventDefault(); } });
    menu.addEventListener('click', event => { if (event.target.closest('a[href]')) close(); });
    document.addEventListener('click', event => { if (!nav.contains(event.target)) close(); });
    let frame;
    const observer = new ResizeObserver(() => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => { if (!button.getClientRects().length) close(); }); });
    observer.observe(nav);
  });
  const header = root.querySelector('body > header:has(nav)');
  let headerFrame;
  if (header) new ResizeObserver(() => { cancelAnimationFrame(headerFrame); headerFrame = requestAnimationFrame(() => {
    const isSticky = getComputedStyle(header).position === 'sticky';
    // Closed header height keeps notifications anchored without following an expanded menu.
    const toggle = header.querySelector('[data-nav-toggle][aria-expanded="true"]');
    if (!toggle) document.documentElement.style.setProperty('--mini-nav-offset', `${isSticky ? header.getBoundingClientRect().height : 0}px`);
  }); }).observe(header);
}
