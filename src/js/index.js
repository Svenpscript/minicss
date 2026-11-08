import { initTheme } from './theme.js';
import { initNavigation } from './navigation.js';
import { initAsides } from './aside.js';
import { initDialogs } from './dialog.js';
import { initForms } from './forms.js';
export { initTheme, initNavigation, initAsides, initDialogs, initForms };
export { openDialog, closeDialog } from './dialog.js';
export { setProcessing } from './forms.js';
export { createNotifier, PausableTimer } from './notifications.js';
export function init(root = document) {
  const theme = initTheme(root);
  initNavigation(root); initDialogs(root); initForms(root);
  const destroyAsides = initAsides(root);
  return { theme, destroyAsides };
}
