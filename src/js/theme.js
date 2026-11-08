export function initTheme(root = document) {
  const html = root.documentElement || root.ownerDocument.documentElement;
  const system = matchMedia('(prefers-color-scheme: dark)');
  let mode = ['light', 'dark'].includes(html.dataset.theme) ? html.dataset.theme : 'auto';
  const controls = [...root.querySelectorAll('select[name="theme"]')];
  const sync = () => {
    if (mode === 'auto') delete html.dataset.theme; else html.dataset.theme = mode;
    controls.forEach(control => { control.value = mode; });
    html.dispatchEvent(new CustomEvent('mini:theme', { detail: { mode, resolved: mode === 'auto' ? (system.matches ? 'dark' : 'light') : mode } }));
  };
  const set = value => {
    mode = ['light', 'dark'].includes(value) ? value : 'auto';
    try { if (mode === 'auto') localStorage.removeItem('minicss-theme'); else localStorage.setItem('minicss-theme', mode); } catch { /* Keep working in memory. */ }
    sync();
  };
  controls.forEach(control => control.addEventListener('change', () => set(control.value)));
  system.addEventListener('change', sync);
  sync();
  return { set, get mode() { return mode; }, destroy() { system.removeEventListener('change', sync); } };
}
