import { focusable, trapFocus, lockScroll } from './focus.js';
const initialized = new WeakSet();

export function initAsides(root = document) {
  const cleanups = [];
  root.querySelectorAll('.container > aside, main > aside').forEach(aside => {
    if (initialized.has(aside)) return;
    const container = aside.parentElement;
    const openers = [...root.querySelectorAll('button[aria-controls]')].filter(b => b.getAttribute('aria-controls') === aside.id);
    if (!openers.length) return;
    initialized.add(aside);
    const closers = [...aside.querySelectorAll('button.close')];
    aside.dataset.asideReady = '';
    openers.forEach(b => { b.dataset.asideOpen = ''; b.dataset.asideReady = ''; b.hidden = false; b.setAttribute('aria-expanded', 'false'); });
    let narrow = true, opener, release, backdrop, inerted = [], savedAttributes;
    function close(restore = true) {
      if (!aside.hasAttribute('data-panel-open')) return;
      aside.removeAttribute('data-panel-open');
      for (const [name, value] of Object.entries(savedAttributes)) { if (value === null) aside.removeAttribute(name); else aside.setAttribute(name, value); }
      backdrop?.remove(); release?.();
      inerted.forEach(([el, was]) => { el.inert = was; }); inerted = [];
      openers.forEach(b => b.setAttribute('aria-expanded', 'false'));
      if (restore && opener?.getClientRects().length) opener.focus();
    }
    function open(button) {
      if (!narrow || document.querySelector('dialog[open], aside[data-panel-open]')) return;
      opener = button;
      savedAttributes = Object.fromEntries(['role', 'aria-modal', 'tabindex'].map(a => [a, aside.getAttribute(a)]));
      aside.dataset.panelOpen = ''; aside.setAttribute('role', 'dialog'); aside.setAttribute('aria-modal', 'true'); aside.tabIndex = -1;
      openers.forEach(b => b.setAttribute('aria-expanded', 'true'));
      backdrop = document.createElement('div'); backdrop.dataset.asideBackdrop = ''; backdrop.setAttribute('aria-hidden', 'true'); document.body.append(backdrop);
      // Inert every sibling along the ancestor path; the aside itself stays in the original HTML.
      let branch = aside;
      while (branch.parentElement) {
        for (const sibling of branch.parentElement.children) if (sibling !== branch && sibling !== backdrop) { inerted.push([sibling, sibling.inert]); sibling.inert = true; }
        branch = branch.parentElement;
        if (branch === document.body) break;
      }
      release = lockScroll(); (focusable(aside)[0] || aside).focus();
    }
    let frame;
    const observer = new ResizeObserver(() => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => {
      const css = getComputedStyle(container);
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const px = value => value.trim().endsWith('rem') ? parseFloat(value) * rem : value.trim().endsWith('em') ? parseFloat(value) * parseFloat(css.fontSize) : parseFloat(value);
      const required = px(css.getPropertyValue('--mini-main-min')) + px(css.getPropertyValue('--mini-sidebar-width')) + px(css.getPropertyValue('--mini-sidebar-gap'));
      const queryWidth = container.clientWidth - parseFloat(css.paddingLeft) - parseFloat(css.paddingRight);
      container.toggleAttribute('data-aside-narrow', queryWidth < required);
      // CSS query is the authority, including the build-configured threshold.
      const wasOpen = aside.hasAttribute('data-panel-open');
      if (!wasOpen) narrow = getComputedStyle(aside).display === 'none';
      else {
        aside.removeAttribute('data-panel-open'); narrow = getComputedStyle(aside).display === 'none'; aside.dataset.panelOpen = '';
      }
      if (!narrow) {
        close(false);
        if (wasOpen && aside.contains(document.activeElement) && !document.activeElement.getClientRects().length) focusable(aside)[0]?.focus();
      }
    }); });
    observer.observe(container);
    openers.forEach(b => b.addEventListener('click', () => open(b)));
    closers.forEach(b => b.addEventListener('click', () => close()));
    const onKey = event => {
      if (!aside.hasAttribute('data-panel-open')) return;
      if (event.key === 'Escape') { event.preventDefault(); close(); } else trapFocus(event, aside);
    };
    document.addEventListener('keydown', onKey);
    cleanups.push(() => { close(false); initialized.delete(aside); observer.disconnect(); cancelAnimationFrame(frame); document.removeEventListener('keydown', onKey); });
  });
  return () => cleanups.forEach(fn => fn());
}
