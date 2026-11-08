import { test, expect } from '@playwright/test';

test('page headers and footers share accent backgrounds and independent divider colors', async ({ page, browserName }) => {
  await page.goto('/');
  for (const variant of ['minicss', 'minicss.conditional']) for (const mode of ['light', 'dark']) {
    const html = '<header id="page-header"><nav><a href="#">Project</a><button class="secondary outline">Actie</button></nav><h1>Header</h1><p>Inhoud <small>Details</small></p></header><main><article><header id="card-header" class="secondary"><h2>Card</h2></header><p>Ongewijzigde card.</p><footer id="card-footer" class="tertiary tertiary-line">Cardfooter</footer></article></main><footer id="page-footer"><div><h2>Footer</h2><p>Inhoud <small>Details</small> <a href="#">Contact</a></p><button class="tertiary outline">Actie</button></div></footer>';
    await page.setContent(`<link rel="stylesheet" href="/dist/${variant}.min.css"><style>* { transition: none !important; }</style>${variant.includes('conditional') ? `<div class="minicss" data-theme="${mode}">${html}</div>` : html}`);
    const tokens = await page.evaluate(async ({ mode, scoped }) => {
      const { generateTheme } = await import('/src/js/colors.js');
      const theme = generateTheme({ source: '#99cc33', secondary: '#008cba', tertiary: '#2a2f35' })[mode];
      const root = scoped ? document.querySelector('.minicss') : document.documentElement;
      root.dataset.theme = mode;
      for (const [key, value] of Object.entries(theme)) root.style.setProperty(`--mini-${key}`, value);
      return Object.fromEntries(Object.entries(theme).map(([key, hex]) => [key, `rgb(${hex.slice(1).match(/../g).map(pair => parseInt(pair, 16)).join(', ')})`]));
    }, { mode, scoped: variant.includes('conditional') });
    const cardBefore = await page.locator('#card-header, #card-footer').evaluateAll(elements => elements.map(el => [getComputedStyle(el).backgroundColor, getComputedStyle(el).color, getComputedStyle(el).borderColor]));
    for (const [selector, edge] of [['#page-header', 'bottom'], ['#page-footer', 'top']]) {
      const landmark = page.locator(selector);
      await expect(landmark).toHaveCSS(`border-${edge}-color`, tokens.primary);
      await expect(landmark).toHaveCSS(`border-${edge}-width`, '1px');
      await expect(landmark).toHaveCSS('background-color', tokens.background);
      await expect(landmark).toHaveCSS('color', tokens.text);
      for (const accent of ['primary', 'secondary', 'tertiary']) {
        await landmark.evaluate((el, accent) => el.className = accent, accent);
        await expect(landmark).toHaveCSS('background-color', tokens[accent]);
        for (const element of await landmark.locator('h1, h2, p, small, a, button').all()) await expect(element).toHaveCSS('color', tokens[`${accent}-text`]);
        const link = landmark.locator('a').first();
        await link.hover();
        await expect(link).toHaveCSS('color', tokens[`${accent}-text`]);
        await link.focus();
        await expect(link).toHaveCSS('outline-color', tokens[`${accent}-text`]);
        for (const line of ['primary', 'secondary', 'tertiary']) {
          await landmark.evaluate((el, classes) => el.className = classes, `${accent} ${line}-line`);
          await expect(landmark).toHaveCSS(`border-${edge}-color`, tokens[line]);
          await expect(landmark).toHaveCSS('background-color', tokens[accent]);
        }
      }
      for (const line of ['primary', 'secondary', 'tertiary']) {
        await landmark.evaluate((el, line) => el.className = `${line}-line`, line);
        await expect(landmark).toHaveCSS(`border-${edge}-color`, tokens[line]);
        await expect(landmark).toHaveCSS('background-color', tokens.background);
        await expect(landmark).toHaveCSS('color', tokens.text);
      }
    }
    expect(await page.locator('#card-header, #card-footer').evaluateAll(elements => elements.map(el => [getComputedStyle(el).backgroundColor, getComputedStyle(el).color, getComputedStyle(el).borderColor]))).toEqual(cardBefore);
    await page.locator('#page-header').evaluate(el => el.className = 'secondary');
    await page.locator('#page-footer').evaluate(el => el.className = 'tertiary secondary-line');
    for (const width of [1440, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const geometry = await page.locator('#page-footer').evaluate(el => {
        const footer = el.getBoundingClientRect(), header = document.querySelector('#page-header').getBoundingClientRect();
        const content = el.firstElementChild.getBoundingClientRect(), nav = document.querySelector('#page-header nav').getBoundingClientRect();
        return { width: footer.width, headerWidth: header.width, left: content.x, navLeft: nav.x, contentWidth: content.width, navWidth: nav.width };
      });
      expect(geometry.width).toBe(geometry.headerWidth);
      expect(geometry.left).toBe(geometry.navLeft);
      expect(geometry.contentWidth).toBe(geometry.navWidth);
      if (browserName === 'chromium' && variant === 'minicss') await page.screenshot({ path: `${process.env.TEMP}/minicss-landmarks-${mode}-${width}.png`, fullPage: true });
    }
  }
});