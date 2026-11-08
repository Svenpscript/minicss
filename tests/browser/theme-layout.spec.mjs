import { test, expect } from '@playwright/test';

test('mobile aside opener stays at the bottom without covering footer content', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto('/');
  const opener = page.locator('[data-aside-open]');
  await expect(opener).toHaveCSS('position', 'fixed');
  const initial = await opener.boundingBox();
  expect(initial.y + initial.height).toBeLessThanOrEqual(844 - 16);
  expect(initial.y).toBeGreaterThan(700);
  await page.evaluate(() => window.scrollTo(0, 2000));
  const scrolled = await opener.boundingBox();
  expect(scrolled.y).toBeCloseTo(initial.y, 0);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect.poll(async () => {
    const footer = await page.locator('body > footer').boundingBox(), button = await opener.boundingBox();
    return footer.y + footer.height <= button.y;
  }).toBe(true);
  await opener.click(); await expect(page.locator('#paginamenu')).toHaveAttribute('aria-modal', 'true');
  await page.keyboard.press('Escape'); await expect(opener).toBeFocused();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(opener).toBeHidden(); await expect(page.locator('body')).toHaveCSS('padding-bottom', '0px');
});

test('header and footer are compact while navigation controls retain their click target', async ({ page }) => {
  await page.goto('/');
  expect((await page.locator('body > header').boundingBox()).height).toBeLessThan(90);
  expect((await page.locator('body > footer').boundingBox()).height).toBeLessThan(80);
  for (const height of await page.locator('#hoofdmenu a, #hoofdmenu button').evaluateAll(els => els.map(el => el.getBoundingClientRect().height))) expect(height).toBeGreaterThanOrEqual(44);
});

test('editor preserves exact accent colors, enables a third accent and snaps wheel cells only', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/theme.html');
  for (const source of ['#f2df0d', '#0172ad', '#c0ffee']) {
    await page.locator('#broncode').fill(source);
    const colors = await page.evaluate(() => Object.values(window.minicssEditor.themes).map(theme => theme.primary));
    expect(colors).toEqual([source, source]);
    await expect(page.locator('#audit-summary')).toHaveAttribute('data-pass', 'true');
  }
  await page.locator('#accent3-aan').check();
  await expect(page.locator('#accent3')).toBeEnabled();
  await expect(page.locator('#preview-light [data-preview-tertiary]')).toBeVisible();
  const before = await page.evaluate(() => window.minicssEditor.themes.light.tertiary);
  await page.locator('#tertiary-suggestion > summary').click();
  await page.locator('#accent3').focus(); await page.keyboard.press('Home'); await page.keyboard.press('ArrowRight');
  expect(await page.evaluate(() => window.minicssEditor.themes.light.tertiary)).toBe(before);
  await page.locator('#apply-accent3').click();
  expect(await page.evaluate(() => window.minicssEditor.themes.light.tertiary)).not.toBe(before);
  await expect(page.locator('#css-export')).toHaveValue(/--mini-tertiary:/);
  await page.locator('#accent3-aan').uncheck(); await expect(page.locator('#preview-light [data-preview-tertiary]')).toBeHidden();
  await page.locator('#primary-refinement > summary').click();
  const wheel = page.locator('#kleurenwiel');
  await wheel.click({ position: { x: 187, y: 125 } }); const first = await page.locator('#broncode').inputValue();
  await wheel.click({ position: { x: 190, y: 127 } }); expect(await page.locator('#broncode').inputValue()).toBe(first);
  await page.locator('#broncode').fill('#c0ffee');
  expect(await page.evaluate(() => window.minicssEditor.themes.dark.primary)).toBe('#c0ffee');
  expect(errors).toEqual([]);
});
