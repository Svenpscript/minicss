export const focusable = root => [...root.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter(el => !el.disabled && !el.closest('[inert]') && el.getClientRects().length);
export function trapFocus(event, root) {
  if (event.key !== 'Tab') return;
  const items = focusable(root), first = items[0], last = items.at(-1);
  if (!first) { event.preventDefault(); root.focus(); return; }
  if (event.shiftKey && (document.activeElement === first || document.activeElement === root)) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
}
let locks = 0;
let previousOverflow;
export function lockScroll() {
  if (locks === 0) previousOverflow = { value: document.documentElement.style.getPropertyValue('overflow'), priority: document.documentElement.style.getPropertyPriority('overflow') };
  locks++;
  document.documentElement.setAttribute('data-scroll-lock', '');
  document.documentElement.style.setProperty('overflow', 'hidden');
  let released = false;
  return () => { if (released) return; released = true; if (--locks === 0) { document.documentElement.removeAttribute('data-scroll-lock'); if (previousOverflow.value) document.documentElement.style.setProperty('overflow', previousOverflow.value, previousOverflow.priority); else document.documentElement.style.removeProperty('overflow'); } };
}
