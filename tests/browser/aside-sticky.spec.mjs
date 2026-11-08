import { test, expect } from '@playwright/test';

async function fixture(page, height) {
  await page.goto('/');
  await expect(page.locator('#paginamenu')).toBeVisible();
  await page.evaluate(height => {
    const content = document.querySelector('main > div');
    content.innerHTML = '<h1>Hoofdinhoud</h1><p>Ruimte om te scrollen.</p><button type="button" data-aside-open aria-controls="paginamenu">Open aside</button>';
    content.style.height = '6000px';
    const aside = document.querySelector('#paginamenu');
    aside.innerHTML = `<div style="min-height: ${height}px"><h2 id="aside-titel">Begin van de aside</h2><p>Einde van de aside.</p></div>`;
    aside.style.padding = '0';
  }, height);
}
async function scroll(page, y) {
  await page.evaluate(async y => { window.scrollTo(0, y); for (let i = 0; i < 4; i++) await new Promise(requestAnimationFrame); }, y);
}
async function metrics(page) {
  return page.locator('#paginamenu').evaluate(el => {
    const box = el.getBoundingClientRect(), css = getComputedStyle(el);
    return { top: box.top, bottom: box.bottom, height: box.height, viewport: innerHeight, position: css.position, header: document.querySelector('body > header').getBoundingClientRect().bottom };
  });
}
test('short aside stays below sticky navigation and above the page footer', async ({ page }) => {
  await fixture(page, 200);
  await scroll(page, 600);
  const first = await metrics(page);
  expect(first.position).toBe('sticky');
  expect(first.top).toBeCloseTo(first.header + 16, 0);
  await scroll(page, 1200);
  expect((await metrics(page)).top).toBeCloseTo(first.top, 0);
  await scroll(page, 100000);
  const footerTop = await page.locator('body > footer').evaluate(el => el.getBoundingClientRect().top);
  expect((await metrics(page)).bottom).toBeLessThanOrEqual(footerTop);
});
test('long aside has its own native scroll area while the page position remains unchanged', async ({ page }) => {
  await fixture(page, 1600);
  await scroll(page, 1500);
  const pinned = await metrics(page);
  expect(pinned.top).toBeCloseTo(pinned.header + 16, 0);
  expect(pinned.bottom).toBeCloseTo(pinned.viewport - 16, 0);
  await scroll(page, 1900);
  expect((await metrics(page)).top).toBeCloseTo(pinned.top, 0);
  const aside = page.locator('#paginamenu');
  expect(await aside.evaluate(el => el.scrollHeight > el.clientHeight)).toBe(true);
  await aside.hover(); await page.mouse.wheel(0, 500);
  await expect.poll(() => aside.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
  const down = await aside.evaluate(el => el.scrollTop);
  expect(await page.evaluate(() => scrollY)).toBe(1900);
  await page.mouse.wheel(0, -300);
  await expect.poll(() => aside.evaluate(el => el.scrollTop)).toBeLessThan(down);
  expect(await page.evaluate(() => scrollY)).toBe(1900);
});
test('sticky aside reacts to viewport and content changes and becomes static for print', async ({ page }) => {
  await fixture(page, 1600);
  await scroll(page, 1500);
  await page.setViewportSize({ width: 1440, height: 1100 });
  await expect.poll(async () => (await metrics(page)).bottom).toBeCloseTo(1084, 0);
  await page.locator('#paginamenu > div').evaluate(el => { el.style.minHeight = '200px'; });
  await expect.poll(async () => { const m = await metrics(page); return m.top - m.header; }).toBeCloseTo(16, 0);
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('#paginamenu')).toHaveCSS('position', 'static');
  await expect(page.locator('#paginamenu')).toHaveCSS('max-height', 'none');
});

test('desktop sticky behavior releases the aside for its fixed mobile panel', async ({ page }) => {
  await page.goto('/');
  await scroll(page, 800);
  await expect(page.locator('#paginamenu')).toHaveCSS('position', 'sticky');
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('#paginamenu')).toBeHidden();
  await page.locator('[data-aside-open]').click();
  await expect(page.locator('#paginamenu')).toHaveCSS('position', 'fixed');
  const panel = await page.locator('#paginamenu').boundingBox();
  expect(panel.y).toBeGreaterThanOrEqual(16);
  expect(panel.y + panel.height).toBeLessThanOrEqual(844 - 16);
  await page.keyboard.press('Escape');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await scroll(page, 800);
  await expect(page.locator('#paginamenu')).toHaveCSS('position', 'sticky');
});

test('without JavaScript a long desktop aside stays reachable in a native scroll area', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/');
  await page.locator('#paginamenu').evaluate(el => {
    for (let i = 0; i < 30; i++) { const p = document.createElement('p'); p.textContent = `Aanvullende informatie ${i}`; el.append(p); }
  });
  await expect(page.locator('#paginamenu')).toHaveCSS('position', 'sticky');
  expect(await page.locator('#paginamenu').evaluate(el => el.scrollHeight > el.clientHeight)).toBe(true);
  await page.evaluate(() => window.scrollTo(0, 800));
  await expect.poll(async () => { const pinned = await metrics(page); return pinned.top - pinned.header; }).toBeCloseTo(16, 0);
  await page.locator('#paginamenu').evaluate(el => { el.scrollTop = el.scrollHeight; });
  expect(await page.locator('#paginamenu').evaluate(el => el.scrollTop)).toBeGreaterThan(0);
  await context.close();
});
