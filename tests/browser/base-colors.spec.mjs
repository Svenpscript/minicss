import { test, expect } from '@playwright/test';

test('basic colors stay independent, derive states and preserve explicit advanced corrections', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/theme.html');
  await expect(page.locator('#advanced-colors')).not.toHaveAttribute('open');
  await expect(page.locator('#primary-refinement')).not.toHaveAttribute('open');
  await page.locator('#broncode').fill('#173748');
  await page.locator('#accent-code').fill('#bd9656');
  await page.locator('#background-aan').check();
  await page.locator('#background-light').fill('#f5f7f8');
  await page.locator('#text-aan').check();
  await page.locator('#text-light').fill('#172c3b');
  await expect(page.locator('#audit-summary')).toHaveAttribute('data-pass', 'true');
  const tokens = () => page.evaluate(() => window.minicssEditor.themes.light);
  expect(await tokens()).toMatchObject({ primary: '#173748', secondary: '#bd9656', background: '#f5f7f8', text: '#172c3b' });
  const hover = (await tokens())['primary-hover'];
  await page.locator('#broncode').fill('#007a50');
  expect((await tokens()).secondary).toBe('#bd9656');
  expect((await tokens())['primary-hover']).not.toBe(hover);
  await page.locator('#accent-code').fill('invalid');
  await expect(page.locator('#accent-code')).toHaveAttribute('aria-invalid', 'true');
  expect((await tokens()).secondary).toBe('#bd9656');
  await page.locator('#accent-code').fill('#bd9656');
  await page.locator('#text-light').fill('#ffffff');
  await expect(page.locator('#audit-summary')).toHaveAttribute('data-pass', 'false');
  await page.locator('#text-aan').uncheck();
  await expect(page.locator('#audit-summary')).toHaveAttribute('data-pass', 'true');
  await page.locator('#text-aan').check();
  await expect(page.locator('#text-light')).toHaveValue('#ffffff');
  await page.locator('#text-light').fill('#172c3b');
  await page.locator('#advanced-colors > summary').click();
  await page.locator('#override-token').selectOption('primary-hover');
  await page.locator('#override-value').fill('#112233');
  await expect(page.locator('#override-count')).toHaveText('1 correctie');
  await page.locator('#broncode').fill('#173748');
  expect((await tokens())['primary-hover']).toBe('#112233');
  await page.locator('#reset-overrides').click();
  expect((await tokens())['primary-hover']).not.toBe('#112233');
  expect((await tokens()).secondary).toBe('#bd9656');
  await expect(page.locator('#css-export')).toHaveValue(/--mini-secondary: #bd9656/);
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  expect(errors).toEqual([]);
});
