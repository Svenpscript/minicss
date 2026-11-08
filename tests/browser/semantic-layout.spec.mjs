import { test, expect } from '@playwright/test';

test('aside position follows source order in every variant, including native scrolling and mobile flow', async ({ page }) => {
  await page.goto('/');
  for (const variant of ['minicss', 'minicss.conditional']) {
    for (const left of [true, false]) {
      await page.setViewportSize({ width: 1440, height: 900 });
      const aside = '<aside><h2>Menu</h2><ul>' + '<li>Extra uitleg</li>'.repeat(60) + '</ul></aside>';
      const article = '<article><header><h1>Inhoud</h1></header><p>Hoofdinhoud</p></article>';
      const content = left ? aside + article : article + aside;
      const main = `<main>${content}</main>`;
      await page.setContent(`<link rel="stylesheet" href="/dist/${variant}.min.css">${variant.includes('conditional') ? `<div class="minicss">${main}</div>` : main}`);
      await expect(page.locator('aside')).toHaveCSS('grid-column-start', left ? '1' : '2');
      await expect(page.locator('article')).toHaveCSS('grid-column-start', left ? '2' : '1');
      await expect(page.locator('aside')).toHaveCSS('position', 'sticky');
      const geometry = await page.evaluate(() => {
        const aside = document.querySelector('aside'), article = document.querySelector('article');
        return { aside: aside.getBoundingClientRect().toJSON(), article: article.getBoundingClientRect().toJSON(), scrollable: aside.scrollHeight > aside.clientHeight };
      });
      expect(geometry.scrollable).toBe(true);
      expect(geometry.article.width).toBeGreaterThan(geometry.aside.width);
      expect(left ? geometry.aside.right <= geometry.article.left : geometry.article.right <= geometry.aside.left).toBe(true);
      await page.locator('aside').evaluate(el => { el.scrollTop = el.scrollHeight; });
      expect(await page.locator('aside').evaluate(el => el.scrollTop)).toBeGreaterThan(0);
      await page.setViewportSize({ width: 390, height: 844 });
      await expect(page.locator('aside')).toBeVisible();
      await expect(page.locator('aside')).not.toHaveCSS('position', 'sticky');
      const order = await page.evaluate(() => document.querySelector('aside').getBoundingClientRect().top < document.querySelector('article').getBoundingClientRect().top);
      expect(order).toBe(left);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  }
});

test('one grid supports forms and other wrappers with configurable column width', async ({ page }) => {
  await page.goto('/');
  await page.setContent('<link rel="stylesheet" href="/dist/minicss.min.css"><main class="container"><form class="grid"><label>Naam<input></label><label>E-mail<input type="email"></label></form><section class="grid"><p>A</p><p>B</p></section></main>');
  for (const selector of ['form', 'section']) {
    await expect(page.locator(selector)).toHaveCSS('display', 'grid');
    await page.locator(selector).evaluate(el => el.style.setProperty('--mini-grid-min', '35rem'));
    const columns = await page.locator(selector).evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
    expect(columns).toBe(2);
    await page.locator(selector).evaluate(el => el.style.setProperty('--mini-grid-min', '50rem'));
    await expect.poll(() => page.locator(selector).evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length)).toBe(1);
  }
  await page.setViewportSize({ width: 320, height: 800 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
