import { test, expect } from '@playwright/test';

test('link underlines follow text color across themes, states and CSS variants', async ({ page }) => {
  await page.goto('/');
  for (const variant of ['minicss', 'minicss.conditional']) {
    await page.setContent(`<link rel="stylesheet" href="/dist/${variant}.min.css"><div class="minicss"><section data-theme="light"><a href="#target">Lichte link</a> <a href="#target" style="color:#b31b62">Eigen linkkleur</a></section><section data-theme="dark"><a href="#target">Donkere link</a></section></div>`);
    for (const link of await page.locator('a').all()) {
      for (const state of ['default', 'hover', 'active', 'focus']) {
        if (state === 'hover') await link.hover();
        if (state === 'active') await page.mouse.down();
        if (state === 'focus') { await page.mouse.up(); await link.focus(); }
        const colors = await link.evaluate(el => { const css = getComputedStyle(el); return { text: css.color, underline: css.textDecorationColor }; });
        expect(colors.underline, `${variant} ${state}`).toBe(colors.text);
      }
    }
  }
});
