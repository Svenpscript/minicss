const processing = new WeakMap();
const initialized = new WeakSet();
export function setProcessing(form, busy = true) {
  if (!busy) {
    const state = processing.get(form);
    state?.forEach(({ control, disabled, ariaBusy, ariaDisabled }) => { control.disabled = disabled; if (ariaBusy === null) control.removeAttribute('aria-busy'); else control.setAttribute('aria-busy', ariaBusy); if (ariaDisabled === null) control.removeAttribute('aria-disabled'); else control.setAttribute('aria-disabled', ariaDisabled); });
    form.removeAttribute('aria-busy'); processing.delete(form); return;
  }
  if (processing.has(form)) return;
  const controls = [...form.querySelectorAll('button:not([type]), button[type=submit], input[type=submit]')].filter(control => control.getAttribute('formmethod')?.toLowerCase() !== 'dialog');
  processing.set(form, controls.map(control => ({ control, disabled: control.disabled, ariaBusy: control.getAttribute('aria-busy'), ariaDisabled: control.getAttribute('aria-disabled') })));
  form.setAttribute('aria-busy', 'true');
  // aria-disabled retains submitter name/value in native form submissions.
  controls.forEach(control => { control.setAttribute('aria-busy', 'true'); control.setAttribute('aria-disabled', 'true'); });
}
export function initForms(root = document) {
  if (initialized.has(root)) return;
  initialized.add(root);
  root.addEventListener('click', event => {
    const control = event.target.closest('button, input[type=submit]');
    if (control?.type === 'submit' && control.getAttribute('formmethod')?.toLowerCase() !== 'dialog' && processing.has(control.form)) event.preventDefault();
  }, true);
  root.addEventListener('submit', event => {
    const form = event.target;
    const method = event.submitter?.getAttribute('formmethod') || form.method;
    if (method.toLowerCase() !== 'post' || event.defaultPrevented) return;
    if (processing.has(form)) { event.preventDefault(); event.stopImmediatePropagation(); return; }
    if (!form.checkValidity()) return;
    setProcessing(form, true);
  }, true);
  root.addEventListener('reset', event => setProcessing(event.target, false), true);
  window.addEventListener('pageshow', () => root.querySelectorAll('form').forEach(form => { if (processing.has(form)) setProcessing(form, false); }));
}
