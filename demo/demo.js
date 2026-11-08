import { init, createNotifier, setProcessing, closeDialog } from '../dist/minicss.js';
init();
const notifications = createNotifier();
window.minicssDemo = { notifications, setProcessing };
const messages = { success: 'De wijziging is opgeslagen. Dit is een demonstratie.', info: 'De nieuwe versie staat klaar om te bekijken.', warning: 'Controleer je invoer voor je verdergaat.', error: 'Opslaan is niet gelukt. Je invoer blijft behouden.' };
document.querySelectorAll('[data-notify]').forEach(button => button.addEventListener('click', () => notifications.notify(messages[button.dataset.notify], { variant: button.dataset.notify })));
document.querySelector('#meldingstapel')?.addEventListener('click', () => {
  notifications.notify(messages.success, { variant: 'success', duration: 3500 });
  notifications.notify(messages.info, { variant: 'info', duration: 6500 });
  notifications.notify(messages.warning, { variant: 'warning', duration: 9000 });
});
document.querySelector('form[action="/demo/logout"]')?.addEventListener('submit', event => {
  event.preventDefault(); setProcessing(event.target, false);
  notifications.notify('Het afmeldformulier verzendt een echte POST zonder JavaScript. Dit is een demonstratie.', { variant: 'info' });
});
for (const form of document.querySelectorAll('form[action="/demo/save"], form[role="search"]')) form.addEventListener('submit', async event => {
  if (event.submitter?.getAttribute('formmethod') === 'dialog') return;
  event.preventDefault();
  const status = form.querySelector('[role="status"]');
  if (!status) {
    setProcessing(form, false);
    notifications.notify('De formulieractie is uitgevoerd in de demo.', { variant: 'success' });
    return;
  }
  status.textContent = 'Bezig met opslaan...';
  try {
    await new Promise(resolve => setTimeout(resolve, 900));
    status.textContent = 'Geslaagd: je invoer is gecontroleerd. In deze demo bewaren we geen gegevens.';
    if (!form.closest('dialog')) notifications.notify('Je gegevens zijn gecontroleerd.', { variant: 'success' });
  } finally { setProcessing(form, false); }
});

document.querySelector('#bevestig-wissen')?.addEventListener('click', event => { closeDialog(event.target.closest('dialog'), 'confirmed'); notifications.notify('Het demonstratieconcept is gewist.', { variant: 'success' }); });
