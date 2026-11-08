import { test, expect } from '@playwright/test';
test('bright and dark accents retain readable text and visible boundaries in all button states', async ({ page }) => {
  await page.goto('/theme.html'); await page.locator('#accent3-aan').check();
  await page.addStyleTag({ content: '.theme-preview button, .theme-preview input { transition: none !important; }' });
  await page.locator('.theme-preview').evaluateAll(previews => previews.forEach(preview => preview.addEventListener('click', event => event.stopPropagation(), { capture: true })));
  async function inspect() {
    return page.evaluate(async () => {
      const { contrast, composite } = await import('/src/js/colors.js');
      const rgba = css => { const numbers = css.match(/[\d.]+/g).map(Number); return [...numbers.slice(0, 3).map(v => v / 255), numbers[3] ?? 1]; };
      const background = element => {
        const chain = []; for (let el = element; el; el = el.parentElement) chain.unshift(el);
        return chain.reduce((bg, el) => composite(rgba(getComputedStyle(el).backgroundColor), bg), [1, 1, 1, 1]);
      };
      const buttons = [...document.querySelectorAll('.theme-preview button')].map(button => {
        const css = getComputedStyle(button);
        return { text: contrast(rgba(css.color), background(button)), border: contrast(rgba(css.borderTopColor), background(button.parentElement)) };
      });
      const checkboxes = [...document.querySelectorAll('.theme-preview input[type=checkbox]')].map(input => {
        const css = getComputedStyle(input), marker = getComputedStyle(input, '::after');
        return { text: contrast(rgba(marker.backgroundColor), background(input)), border: contrast(rgba(css.borderTopColor), background(input.parentElement)) };
      });
      return [...buttons, ...checkboxes];
    });
  }
  for (const source of ['#f2df0d', '#0172ad', '#ffffff', '#000000']) {
    await page.locator('#broncode').fill(source);
    await expect(page.locator('#audit-summary')).toHaveAttribute('data-pass', 'true');
    const buttons = page.locator('.theme-preview button');
    for (let i = 0; i < await buttons.count(); i++) {
      await buttons.nth(i).hover();
      for (const state of ['hover', 'active']) {
        if (state === 'active') await page.mouse.down();
        for (const ratio of await inspect()) { expect(ratio.text, `${source} ${state} text`).toBeGreaterThanOrEqual(4.5); expect(ratio.border, `${source} ${state} border`).toBeGreaterThanOrEqual(3); }
      }
      await page.mouse.up();
    }
  }
});
