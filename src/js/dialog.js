import { lockScroll } from './focus.js';
const states = new WeakMap();
const initialized = new WeakSet();
export function openDialog(dialog, opener = document.activeElement) {
  if (!(dialog instanceof HTMLDialogElement)) throw new TypeError('Een native dialog is vereist.');
  if (dialog.open || document.querySelector('dialog[open], aside[data-panel-open]')) return false;
  const release = lockScroll();
  states.set(dialog, { opener, release });
  dialog.addEventListener('close', () => {
    const state = states.get(dialog);
    state?.release();
    if (state?.opener?.isConnected) state.opener.focus();
    states.delete(dialog);
  }, { once: true });
  try { dialog.showModal(); } catch (error) { release(); states.delete(dialog); throw error; }
  return true;
}
export function closeDialog(dialog, value = '') { dialog.close(value); }
export function initDialogs(root = document) {
  root.querySelectorAll('button[aria-controls]').forEach(button => {
    if (initialized.has(button)) return;
    const dialog = (root.ownerDocument || root).getElementById(button.getAttribute('aria-controls'));
    if (!(dialog instanceof HTMLDialogElement)) return;
    initialized.add(button);
    button.setAttribute('aria-haspopup', 'dialog');
    button.hidden = false;
    button.addEventListener('click', () => openDialog(dialog, button));
  });
}
