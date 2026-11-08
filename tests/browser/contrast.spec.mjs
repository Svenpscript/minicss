import { test, expect } from '@playwright/test';
test('minified stylesheet renders audited text and control colors in light and dark previews', async ({ page }) => {
  await page.route('**/dist/minicss.css', route => route.fulfill({ path: 'dist/minicss.min.css', contentType: 'text/css' }));
  await page.goto('/theme.html');
  await expect(page.locator('#audit-summary')).toHaveAttribute('data-pass', 'true');
  const failures = await page.evaluate(async () => {
    const { contrast, composite } = await import('/src/js/colors.js');
    const rgba = value => {
      const parts = value.match(/[\d.]+/g).map(Number);
      return [...parts.slice(0, 3).map(v => v / 255), parts[3] ?? 1];
    };
    const background = el => {
      const chain = []; for (let node = el; node; node = node.parentElement) chain.unshift(node);
      return chain.reduce((bg, node) => composite(rgba(getComputedStyle(node).backgroundColor), bg), [1, 1, 1, 1]);
    };
    const issues = [];
    for (const preview of document.querySelectorAll('.theme-preview')) {
      for (const el of preview.querySelectorAll('h2, h3, p, label, input:not([type=checkbox]), small, a, button')) {
        const ratio = contrast(rgba(getComputedStyle(el).color), background(el));
        if (ratio < 4.5) issues.push(`${preview.dataset.theme} ${el.tagName}: ${ratio}`);
        if (el.tagName === 'INPUT') {
          const placeholder = contrast(rgba(getComputedStyle(el, '::placeholder').color), background(el));
          if (placeholder < 4.5) issues.push(`${preview.dataset.theme} placeholder: ${placeholder}`);
          const border = contrast(rgba(getComputedStyle(el).borderTopColor), background(el));
          if (border < 3) issues.push(`${preview.dataset.theme} input border: ${border}`);
        }
      }
    }
    return issues;
  });
  expect(failures).toEqual([]);
});
