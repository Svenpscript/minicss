import { test, expect } from '@playwright/test';

test('outline composes with every accent on buttons, input actions and links including navigation', async ({ page }) => {
  await page.goto('/');
  for (const variant of ['minicss', 'minicss.conditional']) for (const mode of ['light', 'dark']) {
    const content = ['primary', 'secondary', 'tertiary'].map(kind => {
      const modifiers = `${kind === 'primary' ? '' : kind} outline`;
      return `<button data-kind="${kind}" class="${modifiers}">Actie</button><input data-kind="${kind}" class="${modifiers}" type="submit" value="Actie"><a data-kind="${kind}" class="button ${modifiers}" href="#">Actie</a><nav><a data-kind="${kind}" class="button ${modifiers}" href="#">Navigatieactie</a></nav>`;
    }).join('');
    await page.setContent(`<link rel="stylesheet" href="/dist/${variant}.min.css"><style>* { transition: none !important; }</style><div id="fixture" class="${variant.includes('conditional') ? 'minicss' : ''}" data-theme="${mode}" style="padding:1rem;background:var(--mini-background)">${content}</div>`);
    await page.evaluate(async mode => {
      const { generateTheme } = await import('/src/js/colors.js');
      const tokens = generateTheme({ source: '#30476f', secondary: '#ffff00', tertiary: '#9933cc' })[mode];
      for (const [key, value] of Object.entries(tokens)) document.querySelector('#fixture').style.setProperty(`--mini-${key}`, value);
    }, mode);
    await expect(page.locator('[data-kind]').first()).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    async function inspect(control, state) {
      const result = await control.evaluate(async (el, state) => {
        const { contrast, parseHex } = await import('/src/js/colors.js');
        const css = getComputedStyle(el), root = getComputedStyle(document.querySelector('#fixture'));
        const rgba = value => { const p = value.match(/[\d.]+/g).map(Number); return [...p.slice(0, 3).map(v => v / 255), p[3] ?? 1]; };
        const kind = el.dataset.kind;
        const key = kind === 'primary' ? (state === 'default' ? 'link' : 'link-hover') : `${kind}-outline`;
        const expected = parseHex(root.getPropertyValue(`--mini-${key}`).trim());
        const color = rgba(css.color), border = rgba(css.borderTopColor);
        const background = rgba(css.backgroundColor)[3] ? rgba(css.backgroundColor) : parseHex(root.getPropertyValue('--mini-background').trim());
        return { text: contrast(color, background), border: contrast(border, background), correctColor: color.every((value, index) => Math.abs(value - expected[index]) < .005), correctBorder: border.every((value, index) => Math.abs(value - expected[index]) < .005) };
      }, state);
      expect(result.correctColor, `${variant} ${mode} ${state}`).toBe(true);
      expect(result.correctBorder).toBe(true);
      expect(result.text).toBeGreaterThanOrEqual(4.5);
      expect(result.border).toBeGreaterThanOrEqual(3);
    }
    for (const control of await page.locator('[data-kind]').all()) {
      await page.mouse.move(0, 0);
      await inspect(control, 'default');
      await control.hover(); await inspect(control, 'hover');
      await page.mouse.down(); await inspect(control, 'active'); await page.mouse.up();
      await control.focus(); await inspect(control, 'focus'); await control.evaluate(el => el.blur());
    }
    expect(await page.getByRole('link').count()).toBe(6);
  }
});

test('page headers have a primary divider or primary fill with readable navigation and headings', async ({ page }) => {
  await page.goto('/');
  for (const variant of ['minicss', 'minicss.conditional']) for (const mode of ['light', 'dark']) for (const source of ['#30476f', '#ffff00']) {
    const html = '<header id="page-header"><nav><a href="#">Project</a><ul><li><a href="#">Projecten</a></li><li><form><button>Afmelden</button></form></li></ul></nav><h1>Pagina</h1><p>Intro <small>Details</small> <a href="#">Meer informatie</a></p></header><main><article><header id="card-header"><h2>Card</h2></header><p>Inhoud.</p></article></main>';
    await page.setContent(`<link rel="stylesheet" href="/dist/${variant}.min.css"><style>* { transition: none !important; }</style>${variant.includes('conditional') ? `<div class="minicss" data-theme="${mode}">${html}</div>` : html}`);
    const expected = await page.evaluate(async ({ mode, source, scoped }) => {
      const { generateTheme } = await import('/src/js/colors.js');
      const tokens = generateTheme({ source })[mode];
      const root = scoped ? document.querySelector('.minicss') : document.documentElement;
      root.dataset.theme = mode;
      for (const [key, value] of Object.entries(tokens)) root.style.setProperty(`--mini-${key}`, value);
      const rgb = hex => `rgb(${hex.slice(1).match(/../g).map(pair => parseInt(pair, 16)).join(', ')})`;
      return { primary: rgb(tokens.primary), text: rgb(tokens['primary-text']), border: rgb(tokens.border) };
    }, { mode, source, scoped: variant.includes('conditional') });
    await expect(page.locator('#page-header')).toHaveCSS('border-bottom-color', expected.primary);
    await expect(page.locator('#page-header')).toHaveCSS('border-bottom-width', '1px');
    await page.locator('#page-header').evaluate(el => el.className = 'primary');
    await expect(page.locator('#page-header')).toHaveCSS('background-color', expected.primary);
    for (const element of await page.locator('#page-header h1, #page-header p, #page-header small, #page-header a, #page-header button').all()) await expect(element).toHaveCSS('color', expected.text);
    const link = page.locator('#page-header nav a').first();
    await link.hover(); await expect(link).toHaveCSS('color', expected.text);
    await link.focus(); await expect(link).toHaveCSS('outline-color', expected.text);
    await expect(page.locator('#card-header')).toHaveCSS('border-bottom-color', expected.border);
    await page.locator('#page-header').evaluate(el => { el.className = ''; el.querySelector('nav').remove(); });
    await expect(page.locator('#page-header')).toHaveCSS('border-bottom-color', expected.primary);
  }
});
