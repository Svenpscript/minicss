import { test, expect } from '@playwright/test';
test('desktop and mobile: typography, overflow, themes, direct-header cards, nav control geometry', async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const colorScheme of ['light', 'dark']) {
      await page.emulateMedia({ colorScheme });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(await page.evaluate(() => getComputedStyle(document.documentElement).fontSize)).toBe('16px');
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  expect(await page.locator('#footer-only').evaluate(el => getComputedStyle(el).padding)).toBe('0px');
  expect(await page.locator('#articles article').first().evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgba(0, 0, 0, 0)');
  expect(await page.locator('#articles article:has(> header)').evaluate(el => getComputedStyle(el).borderTopWidth)).toBe('1px');
  const heights = await page.locator('#hoofdmenu a, #hoofdmenu button').evaluateAll(els => els.map(el => el.getBoundingClientRect().height));
  expect(new Set(heights).size).toBe(1);
  expect(errors).toEqual([]);
});
test('mobile navigation disclosure supports Tab, Escape and resize', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto('/');
  const toggle = page.locator('[data-nav-toggle]');
  await expect(page.locator('#hoofdmenu')).toBeHidden();
  await toggle.click(); await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#hoofdmenu a').first()).toBeFocused();
  const scrolling = await page.locator('#hoofdmenu').evaluate(menu => {
    for (let i = 0; i < 25; i++) { const li = document.createElement('li'), a = document.createElement('a'); a.href = '#formulier'; a.textContent = `Extra navigatielink ${i}`; li.append(a); menu.append(li); }
    return { scrollable: menu.scrollHeight > menu.clientHeight, bottom: menu.getBoundingClientRect().bottom, height: innerHeight };
  });
  expect(scrolling.scrollable).toBe(true); expect(scrolling.bottom).toBeLessThanOrEqual(scrolling.height);
  await page.keyboard.press('Escape'); await expect(toggle).toBeFocused(); await expect(page.locator('#hoofdmenu')).toBeHidden();
  await page.setViewportSize({ width: 1440, height: 1000 }); await expect(toggle).toBeHidden(); await expect(page.locator('#hoofdmenu')).toBeVisible();
});
test('aside uses one accessible mobile panel and returns focus; nested narrow container stays narrow', async ({ page }) => {
  await page.goto('/'); await expect(page.locator('#paginamenu')).toBeVisible();
  await expect(page.locator('.secondary-layout > aside')).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  const opener = page.locator('[data-aside-open]'), aside = page.locator('#paginamenu');
  await expect(aside).toBeHidden(); await opener.click();
  await expect(aside).toHaveAttribute('aria-modal', 'true'); await expect(page.locator('aside .close').first()).toBeFocused();
  expect(await page.locator('body > header').evaluate(el => el.inert)).toBe(true);
  await page.keyboard.press('Shift+Tab'); expect(await aside.evaluate(el => el.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape'); await expect(opener).toBeFocused(); await expect(aside).toBeHidden();
  expect(await page.locator('body > header').evaluate(el => el.inert)).toBe(false);
  await opener.click(); await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(aside).not.toHaveAttribute('aria-modal'); await expect(aside).toBeVisible();
  expect(await page.locator('#paginamenu').count()).toBe(1);
});
test('dialogs trap focus natively, validate, keep application control, reject stacking and restore focus', async ({ page }) => {
  await page.goto('/');
  const opener = page.locator('button[aria-controls="berichtdialoog"]'), dialog = page.locator('#berichtdialoog');
  await opener.click(); await expect(dialog).toBeVisible(); await expect(page.locator('#onderwerp')).toBeFocused();
  await dialog.getByRole('button', { name: 'Bericht opslaan', exact: true }).click();
  await expect(dialog).toBeVisible(); await expect(page.locator('#onderwerp')).toBeFocused();
  await page.locator('#onderwerp').fill('Test'); await page.locator('#modal-bericht').fill('Een bericht');
  await dialog.getByRole('button', { name: 'Bericht opslaan', exact: true }).click();
  await expect(page.locator('#berichtdialoog [role="status"]')).toContainText('Geslaagd'); await expect(dialog).toBeVisible();
  expect(await page.evaluate(async () => { const { openDialog } = await import('/dist/minicss.js'); return openDialog(document.querySelector('#bevestiging')); })).toBe(false);
  await page.mouse.click(5, 200); await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape'); await expect(dialog).toBeHidden(); await expect(opener).toBeFocused();
  await expect(page.locator('html')).not.toHaveAttribute('data-scroll-lock');
});
test('double submit is blocked and spinner does not change dimensions', async ({ page }) => {
  await page.goto('/'); await page.locator('#naam').fill('Test'); await page.locator('#email').fill('test@example.org');
  const form = page.locator('#voorbeeldformulier'), button = form.locator('button[type=submit]');
  await page.evaluate(() => { window.submissions = 0; document.querySelector('#voorbeeldformulier').addEventListener('submit', () => window.submissions++); });
  const before = await button.boundingBox(); await button.click(); const busy = await button.boundingBox();
  expect(busy.width).toBeCloseTo(before.width, 0); expect(busy.height).toBeCloseTo(before.height, 0);
  await form.evaluate(el => el.requestSubmit()); expect(await page.evaluate(() => window.submissions)).toBe(1);
  await expect(button).not.toHaveAttribute('aria-busy'); await expect(button).not.toHaveAttribute('aria-disabled');
});
test('notifications stack, pause on simultaneous hover/focus and close independently', async ({ page }) => {
  // Virtual clocks do not advance WebKit's compositor animations consistently.
  // Test timer state with reduced motion; actual stack animation has a separate real-clock test.
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.goto('/'); await page.clock.install();
  await page.evaluate(() => { window.minicssDemo.notifications.notify('Eerste', { duration: 1000 }); window.minicssDemo.notifications.notify('Tweede', { duration: 5000 }); });
  const notices = page.locator('[data-notice]');
  await expect(notices).toHaveCount(2);
  const secondTop = (await notices.nth(1).boundingBox()).y;
  await notices.first().hover(); await notices.first().getByRole('button').focus();
  await page.clock.runFor(2000); await expect(notices).toHaveCount(2);
  await page.mouse.move(1000, 800); await page.clock.runFor(1000); await expect(notices).toHaveCount(2);
  await page.locator('.wordmark').first().focus(); await page.clock.runFor(1100); await expect(notices).toHaveCount(1);
  await page.clock.runFor(250);
  await expect.poll(async () => (await notices.first().boundingBox()).y).toBeLessThan(secondTop);
  await notices.first().getByRole('button').click(); await expect(notices).toHaveCount(0);
});
test('notification removal animates the remaining stack with a real compositor clock', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(async () => {
    const first = window.minicssDemo.notifications.notify('Eerste', { duration: 0 });
    const second = window.minicssDemo.notifications.notify('Tweede', { duration: 0 });
    const before = second.element.getBoundingClientRect().top;
    first.close();
    const animations = second.element.getAnimations();
    await Promise.all(animations.map(animation => animation.finished));
    return { count: animations.length, before, after: second.element.getBoundingClientRect().top };
  });
  expect(result.count).toBe(1); expect(result.after).toBeLessThan(result.before);
  await page.locator('[data-notice] button').click(); await expect(page.locator('[data-notice]')).toHaveCount(0);
});
test('theme persistence, system changes and auto mode', async ({ page }) => {
  await page.goto('/');
  const control = page.locator('select[name="theme"]');
  await control.selectOption('dark'); await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload(); await expect(control).toHaveValue('dark');
  await control.selectOption('auto'); await expect(page.locator('html')).not.toHaveAttribute('data-theme');
  await page.emulateMedia({ colorScheme: 'light' }); const light = await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor);
  await page.emulateMedia({ colorScheme: 'dark' }); const dark = await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor);
  expect(light).not.toBe(dark);
});
test('theme controls still work when storage is denied', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Denied', 'SecurityError'); } }); });
  await page.goto('/'); await page.locator('select[name="theme"]').selectOption('light'); await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});
test('no JavaScript: navigation, aside and native form submissions stay usable', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage(); await page.goto('http://127.0.0.1:4173/');
  await expect(page.locator('#hoofdmenu')).toBeVisible(); await expect(page.locator('#paginamenu')).toBeVisible(); await expect(page.locator('.secondary-layout > aside')).toBeVisible();
  await expect(page.locator('[data-nav-toggle]')).toBeHidden(); await expect(page.locator('[data-aside-open]')).toBeHidden();
  await page.getByRole('button', { name: 'Afmelden', exact: true }).click(); await expect(page.locator('h1')).toHaveText('Formulier ontvangen'); await context.close();
});
test('select fallback, reduced motion and print styles', async ({ page, browserName }) => {
  await page.goto('/'); await page.locator('#klassieke-select').selectOption('Onderwijs'); await expect(page.locator('#klassieke-select')).toHaveValue('Onderwijs');
  await page.locator('#moderne-select').selectOption('Ontwikkeling'); await expect(page.locator('#moderne-select')).toHaveValue('Ontwikkeling');
  const supports = await page.evaluate(() => CSS.supports('appearance', 'base-select'));
  test.info().annotations.push({ type: 'select-support', description: `${browserName}: base-select ${supports}` });
  expect(await page.locator('#klassieke-select').evaluate(el => getComputedStyle(el).appearance)).not.toBe('base-select');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const duration = await page.locator('[aria-busy=true]').first().evaluate(el => getComputedStyle(el, '::after').animationDuration); expect(parseFloat(duration)).toBeLessThan(.1);
  if (browserName === 'chromium') {
    await page.emulateMedia({ forcedColors: 'active' }); await page.locator('#naam').focus();
    await expect(page.locator('#naam')).toHaveCSS('outline-style', 'solid');
    await expect(page.locator('#naam')).toHaveCSS('border-top-style', 'solid');
    await page.emulateMedia({ forcedColors: 'none' });
  }
  await page.emulateMedia({ media: 'print' }); await expect(page.locator('nav')).toBeHidden(); await expect(page.locator('#paginamenu')).toBeVisible();
});
test('editor generates two themes, rechecks manual overrides, supports keyboard and exports CSS', async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('/theme.html'); await expect(page.locator('#audit-summary')).toHaveAttribute('data-pass', 'true');
  await page.locator('#broncode').fill('#ffff00'); await expect(page.locator('#css-export')).toHaveValue(/--mini-source: #ffff00/); await expect(page.locator('#audit-summary')).toHaveAttribute('data-pass', 'true');
  await page.locator('#advanced-colors > summary').click();
  await page.locator('#override-token').selectOption('text'); await page.locator('#override-value').fill('#ffffff'); await expect(page.locator('#audit-summary')).toHaveAttribute('data-pass', 'false'); await expect(page.locator('#audit-errors li').first()).toBeVisible();
  await page.locator('#reset-overrides').click(); await expect(page.locator('#audit-summary')).toHaveAttribute('data-pass', 'true');
  await page.locator('#primary-refinement > summary').click();
  const previous = await page.locator('#tint').inputValue(); await page.locator('#tint').focus(); await page.keyboard.press('ArrowRight'); expect(await page.locator('#tint').inputValue()).not.toBe(previous);
  await page.locator('#broncode').fill('invalid'); await expect(page.locator('#broncode')).toHaveAttribute('aria-invalid', 'true');
  await page.locator('#broncode').fill('#286b56');
  for (const width of [1440, 768, 390, 320]) { await page.setViewportSize({ width, height: 900 }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); }
  const downloadPromise = page.waitForEvent('download'); await page.locator('#download-css').click(); const download = await downloadPromise; expect(download.suggestedFilename()).toBe('minicss-theme.css');
  expect(errors).toEqual([]);
});
test('conditional variant isolates widgets; semantic containers support fluid width', async ({ page }) => {
  await page.goto('/');
  await page.setContent('<style>body{margin:0} button { font-size:13px; } .host { padding:3px; }</style><link rel="stylesheet" href="/dist/minicss.conditional.css"><div class="host" data-theme="dark"><button id="outside">Host control</button></div><div class="minicss" data-theme="light"><button id="inside">Scoped control</button><article><header>Card</header>Body</article></div>');
  await expect(page.locator('#inside')).toHaveCSS('min-height', '44px'); await expect(page.locator('#outside')).toHaveCSS('font-size', '13px');
  expect(await page.locator('.host').evaluate(el => getComputedStyle(el).getPropertyValue('--mini-background'))).toBe('');
  expect(await page.locator('body').evaluate(el => getComputedStyle(el).display)).toBe('block');
  for (const [variant, max] of [['minicss', '1216px'], ['minicss', 'none']]) {
    await page.setContent(`<link rel="stylesheet" href="/dist/${variant}.css"><main><article><header><h1>Classless</h1></header><p>Inhoud</p></article><aside><h2>Aanvullend</h2><p>Uitleg</p></aside></main>`);
    if (max === 'none') await page.locator('main').evaluate(el => el.style.setProperty('--mini-content-width', 'none'));
    await expect(page.locator('main')).toHaveCSS('max-width', max);
    await expect(page.locator('article')).toHaveCSS('grid-column-start', '1');
    await expect(page.locator('aside')).toHaveCSS('grid-column-start', '2');
    await expect(page.locator('aside')).toHaveCSS('position', 'sticky');
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator('aside')).toBeVisible();
    await expect(page.locator('aside')).not.toHaveCSS('position', 'sticky');
    await page.setViewportSize({ width: 1440, height: 1000 });
  }
});
test('docs load without errors, enlarged text stays contained and short-page footer follows layout', async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message)); await page.goto('/docs.html');
  await expect(page.locator('h1')).toContainText('Klein beginnen.');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addStyleTag({ content: 'html { font-size: 200%; }' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.setContent('<link rel="stylesheet" href="/dist/minicss.css"><header>Project</header><main class="container"><p>Korte pagina.</p></main><footer>Footer</footer>');
  await expect.poll(async () => Math.round((await page.locator('footer').boundingBox()).y + (await page.locator('footer').boundingBox()).height)).toBe(844);
  expect(errors).toEqual([]);
});
