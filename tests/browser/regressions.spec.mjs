import { test, expect } from '@playwright/test';

test('tables scroll within their region rather than splitting words', async ({ page }) => {
  await page.goto('/');
  await page.setViewportSize({ width: 320, height: 900 });
  const geometry = await page.evaluate(() => {
    const region = document.createElement('div');
    region.style.width = '240px';
    region.innerHTML = '<table><thead><tr><th>Variabele</th><th>Betekenis</th></tr></thead><tbody><tr><td>EenOnonderbrokenWoordDatBrederIsDanDeBeschikbareTabelruimte</td><td>Gewone tekst mag tussen woorden over meerdere regels lopen.</td></tr></tbody></table>';
    document.querySelector('#typografie').append(region);
    const cell = region.querySelector('td'), range = document.createRange(); range.selectNodeContents(cell);
    const result = { lines: new Set([...range.getClientRects()].map(rect => rect.top)).size, scrolls: region.scrollWidth > region.clientWidth, fits: document.documentElement.scrollWidth <= innerWidth };
    region.remove(); return result;
  });
  expect(geometry.lines).toBe(1);
  expect(geometry.scrolls).toBe(true);
  expect(geometry.fits).toBe(true);
});

test('card header has compact padding and no extra heading margins', async ({ page }) => {
  await page.goto('/');
  const header = page.locator('#articles article:has(> header) > header');
  await expect(header.locator('h3')).toHaveCSS('margin-top', '0px');
  await expect(header.locator('h3')).toHaveCSS('margin-bottom', '0px');
  await expect(header).toHaveCSS('padding-top', '12px');
  await expect(header).toHaveCSS('padding-bottom', '12px');
});

test('button elements and input actions share dimensions across variants and control sizes', async ({ page }) => {
  await page.goto('/');
  for (const variant of ['', 'secondary', 'tertiary', 'outline', 'borderless']) {
    for (const inForm of [false, true]) {
      const sizes = await page.evaluate(({ variant, inForm }) => {
        const fixture = document.createElement(inForm ? 'form' : 'div');
        fixture.innerHTML = `<button type="button" class="${variant}">Actie</button><button type="submit" class="${variant}">Actie</button><input type="button" class="${variant}" value="Actie"><input type="submit" class="${variant}" value="Actie"><input type="reset" class="${variant}" value="Actie"><a href="#" class="button ${variant}">Actie</a>`;
        document.querySelector('#knoppen').append(fixture);
        const measure = () => [...fixture.children].map(el => ({ width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height }));
        const defaults = measure();
        fixture.style.setProperty('--mini-control-padding', '.5rem 1.25rem');
        fixture.style.setProperty('--mini-control-height', '3.5rem');
        const customized = measure();
        fixture.remove();
        return { defaults, customized };
      }, { variant, inForm });
      for (const measurements of Object.values(sizes)) for (const size of measurements) {
        expect(size.height).toBeCloseTo(measurements[0].height, 0);
        expect(size.width).toBeCloseTo(measurements[0].width, 0);
      }
    }
  }
});

test('compound search keeps the action on one line and fits narrow containers', async ({ page }) => {
  await page.goto('/');
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    const geometry = await page.locator('form[role=search]').evaluate(group => {
      const button = group.querySelector('button');
      const range = document.createRange(); range.selectNodeContents(button);
      return { lines: new Set([...range.getClientRects()].map(rect => rect.top)).size, right: group.getBoundingClientRect().right, viewport: innerWidth };
    });
    expect(geometry.lines).toBe(1);
    expect(geometry.right).toBeLessThanOrEqual(geometry.viewport);
  }
});

test('real browser timers dismiss notices and resume after hover without virtual clock', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'Succes', exact: true }).click();
  await expect(page.locator('[data-notice]')).toHaveCount(1);
  await expect(page.locator('[data-notice]')).toHaveCount(0, { timeout: 7000 });
  expect(errors).toEqual([]);
  await page.evaluate(() => window.minicssDemo.notifications.notify('Pauze en hervatten', { duration: 1000 }));
  const notice = page.locator('[data-notice]');
  await notice.hover();
  await page.waitForTimeout(1200);
  await expect(notice).toHaveCount(1);
  await page.mouse.move(1000, 800);
  await expect(notice).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('closing notices preserves scroll position and returns focus to the actual trigger', async ({ page }) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Succes', exact: true });
  await trigger.scrollIntoViewIfNeeded();
  await trigger.focus();
  await trigger.press('Enter');
  const scrollBefore = await page.evaluate(() => scrollY);
  expect(scrollBefore).toBeGreaterThan(1000);
  const close = page.locator('[data-notice-close]');
  await close.focus();
  await close.press('Enter');
  await expect(page.locator('[data-notice]')).toHaveCount(0);
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => scrollY)).toBeCloseTo(scrollBefore, 0);

  // Closing one of several notices keeps focus in the stack without moving the page.
  await page.evaluate(() => {
    window.minicssDemo.notifications.notify('Eerste', { duration: 0 });
    window.minicssDemo.notifications.notify('Tweede', { duration: 0 });
  });
  await page.locator('[data-notice-close]').first().focus();
  await page.locator('[data-notice-close]').first().press('Enter');
  await expect(page.locator('[data-notice-close]')).toBeFocused();
  expect(await page.evaluate(() => scrollY)).toBeCloseTo(scrollBefore, 0);
});
