import { test, expect } from '@playwright/test';

test('authored pages use semantic containers and no duplicate framework hooks', async ({ page, request }) => {
  for (const route of ['/', '/docs.html', '/theme.html']) {
    const html = await (await request.get(route)).text();
    expect(html).not.toMatch(/data-(nav-toggle|nav-menu|aside-open|aside-close|dialog-open|dialog-close|prevent-double-submit|submit-ready|form-actions|field-error|select-classic|theme-control|variant|borderless|full-width|text-start)\b/);
    await page.goto(route);
    expect(await page.locator('main').getAttribute('class') || '').not.toMatch(/\bcontainer\b/);
    await expect(page.locator('main')).toHaveCSS('max-width', route === '/docs.html' ? '992px' : '1216px');
  }
});

test('delegated POST protection covers dynamic forms, initializes once and leaves GET forms alone', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(async () => {
    const { initForms, setProcessing } = await import('/dist/minicss.js');
    initForms(); initForms();
    const post = document.createElement('form'); post.method = 'post';
    post.innerHTML = '<label>Naam<input name="name" value="Test"></label><button name="save" value="yes">Opslaan</button>';
    const get = document.createElement('form'); get.innerHTML = '<input name="q"><button>Zoeken</button>';
    document.querySelector('main > div').append(post, get);
    let posts = 0, gets = 0;
    post.addEventListener('submit', e => { e.preventDefault(); posts++; });
    get.addEventListener('submit', e => { e.preventDefault(); gets++; });
    post.requestSubmit(); post.requestSubmit(); get.requestSubmit(); get.requestSubmit();
    const busy = post.getAttribute('aria-busy'), getBusy = get.hasAttribute('aria-busy');
    const valueRetained = new FormData(post, post.querySelector('button')).get('save');
    setProcessing(post, false); post.requestSubmit();
    setProcessing(post, false);
    return { posts, gets, busy, getBusy, valueRetained, markers: post.hasAttribute('data-submit-ready') };
  });
  expect(result).toEqual({ posts: 2, gets: 2, busy: 'true', getBusy: false, valueRetained: 'yes', markers: false });
});

test('native dialog cancellation bypasses validation and remains usable during a POST', async ({ page }) => {
  await page.goto('/');
  const dialog = page.locator('#berichtdialoog');
  const opener = page.locator('button[aria-controls="berichtdialoog"]');
  await opener.click();
  await dialog.getByRole('button', { name: 'Annuleren', exact: true }).click();
  await expect(dialog).toBeHidden(); await expect(opener).toBeFocused();
  await opener.click();
  await page.evaluate(async () => {
    const { setProcessing } = await import('/dist/minicss.js');
    setProcessing(document.querySelector('#berichtdialoog form[method=post]'), true);
  });
  await dialog.getByRole('button', { name: 'Annuleren', exact: true }).click();
  await expect(dialog).toBeHidden(); await expect(opener).toBeFocused();
  await opener.click();
  await dialog.getByRole('button', { name: 'Dialoog sluiten', exact: true }).click();
  await expect(dialog).toBeHidden();
});

test('unrelated aria-controls buttons remain visible and semantic scoped asides can be enhanced', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    const { initNavigation, initDialogs, initAsides } = await import('/dist/minicss.js');
    const host = document.createElement('section');
    host.innerHTML = '<button aria-controls="ordinary-target">Gewone bediening</button><div id="ordinary-target">Inhoud</div><link rel="stylesheet" href="/dist/minicss.conditional.min.css"><div class="minicss"><main><div><h1>Ingebed</h1><button aria-controls="scoped-aside" hidden>Open ingebed paneel</button></div><aside id="scoped-aside" aria-label="Ingebedde uitleg"><button class="close">Sluiten</button><p>Uitleg</p></aside></main></div>';
    host.style.width = '350px'; host.style.maxWidth = '100%';
    document.querySelector('main > div').append(host);
    initNavigation(host); initDialogs(host); initAsides(host);
  });
  await expect(page.getByRole('button', { name: 'Gewone bediening', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Open ingebed paneel', exact: true }).click();
  await expect(page.locator('#scoped-aside')).toHaveAttribute('aria-modal', 'true');
  await page.locator('#scoped-aside button').click();
  await expect(page.locator('#scoped-aside')).toBeHidden();
});
