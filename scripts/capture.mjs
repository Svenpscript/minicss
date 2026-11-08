import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
await mkdir('test-results/screenshots', { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage();
for (const [name, route, width, scheme] of [
  ['desktop-light', '/', 1440, 'light'], ['desktop-dark', '/', 1440, 'dark'],
  ['mobile-light', '/', 390, 'light'], ['editor-desktop', '/theme.html', 1440, 'light'], ['editor-mobile', '/theme.html', 390, 'dark'],
]) {
  await page.setViewportSize({ width, height: 1000 }); await page.emulateMedia({ colorScheme: scheme });
  await page.goto(`http://127.0.0.1:4173${route}`);
  await page.locator(route === '/' ? '[data-nav-ready]' : '#audit-summary[data-pass]').waitFor({ state: 'attached' });
  await page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: false });
}
console.log('Vijf screenshots gemaakt in test-results/screenshots.');
await browser.close();
