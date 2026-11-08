const labels = { success: 'Geslaagd', info: 'Informatie', warning: 'Waarschuwing', error: 'Fout' };
export class PausableTimer {
  constructor(callback, duration, clock = () => performance.now(), schedule = (fn, ms) => setTimeout(fn, ms), cancel = id => clearTimeout(id)) {
    Object.assign(this, { callback, remaining: duration, clock, schedule, cancel, reasons: new Set(), done: false });
    this.resume();
  }
  pause(reason = 'manual') {
    this.reasons.add(reason);
    if (this.id !== undefined) { this.cancel(this.id); this.remaining = Math.max(0, this.remaining - (this.clock() - this.started)); this.id = undefined; }
  }
  resume(reason = 'manual') {
    this.reasons.delete(reason);
    if (this.done || this.reasons.size || this.id !== undefined) return;
    this.started = this.clock();
    this.id = this.schedule(() => { this.id = undefined; this.done = true; this.callback(); }, this.remaining);
  }
  stop() { this.done = true; if (this.id !== undefined) this.cancel(this.id); this.id = undefined; }
}
export function createNotifier(root = document.body) {
  const doc = root.ownerDocument;
  const stack = doc.createElement('div'); stack.dataset.notifications = ''; stack.setAttribute('aria-label', 'Meldingen');
  const live = doc.createElement('div'); live.dataset.liveRegion = ''; live.setAttribute('role', 'status'); live.setAttribute('aria-live', 'polite'); live.setAttribute('aria-atomic', 'false');
  root.append(stack, live);
  const timers = new Map();
  function notify(message, { variant = 'info', duration = 5000 } = {}) {
    const opener = doc.activeElement;
    if (!(variant in labels)) variant = 'info';
    const notice = doc.createElement('div'); notice.dataset.notice = ''; notice.className = variant;
    const text = doc.createElement('div'), title = doc.createElement('strong'), p = doc.createElement('p'); title.textContent = labels[variant]; p.textContent = message; text.append(title, p);
    const button = doc.createElement('button'); button.type = 'button'; button.className = 'borderless'; button.dataset.noticeClose = ''; button.setAttribute('aria-label', `Melding sluiten: ${labels[variant]}`); button.textContent = 'Sluit';
    notice.append(text, button); stack.append(notice);
    const announcement = doc.createElement('p'); announcement.textContent = `${labels[variant]}: ${message}`; live.append(announcement);
    const clearAnnouncement = setTimeout(() => announcement.remove(), 1500);
    function close() {
      if (!notice.isConnected) return;
      const before = new Map([...stack.children].map(el => [el, el.getBoundingClientRect().top]));
      const hadFocus = notice.contains(doc.activeElement);
      const next = notice.nextElementSibling || notice.previousElementSibling;
      timers.get(notice)?.stop(); timers.delete(notice); clearTimeout(clearAnnouncement); announcement.remove(); notice.remove();
      // Keep keyboard focus useful without scrolling to an unrelated page control.
      if (hadFocus) (next?.querySelector('button') || (opener?.isConnected ? opener : null))?.focus({ preventScroll: true });
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) for (const el of stack.children) {
        const delta = before.get(el) - el.getBoundingClientRect().top;
        if (delta) el.animate([{ transform: `translateY(${delta}px)` }, { transform: 'translateY(0)' }], { duration: 200, easing: 'cubic-bezier(.16,1,.3,1)' });
      }
    }
    if (duration > 0) timers.set(notice, new PausableTimer(close, duration));
    button.addEventListener('click', close);
    notice.addEventListener('mouseenter', () => timers.get(notice)?.pause('hover'));
    notice.addEventListener('mouseleave', () => timers.get(notice)?.resume('hover'));
    notice.addEventListener('focusin', () => timers.get(notice)?.pause('focus'));
    notice.addEventListener('focusout', event => { if (!notice.contains(event.relatedTarget)) timers.get(notice)?.resume('focus'); });
    return { element: notice, close };
  }
  return { notify, destroy() { timers.forEach(timer => timer.stop()); stack.remove(); live.remove(); } };
}
