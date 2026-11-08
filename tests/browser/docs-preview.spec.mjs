import { test, expect } from '@playwright/test';

test('guide shows isolated live examples, working native controls and the separate demo styling', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/docs.html');
  const form = page.frameLocator('iframe[title="Formulieren en knoppen (alleen het framework)"]').first();
  await form.getByLabel('Naam').fill('Voorbeeld');
  await form.getByRole('button', { name: 'Opslaan', exact: true }).click();
  await expect(form.getByRole('status')).toContainText('geen gegevens verstuurd');

  const details = page.frameLocator('iframe[title="Articles, details en tabellen (alleen het framework)"]');
  await details.getByText('Meer informatie', { exact: true }).click();
  await expect(details.locator('details')).toHaveAttribute('open');

  const modal = page.frameLocator('iframe[title="Bediening zonder dubbele haken (alleen het framework)"]');
  await modal.getByRole('button', { name: 'Open bericht', exact: true }).click();
  await expect(modal.getByRole('dialog')).toBeVisible();
  await modal.getByRole('button', { name: 'Sluiten', exact: true }).click();
  await expect(modal.getByRole('dialog')).toBeHidden();

  const plain = page.frameLocator('iframe[title="Wat doen footer-content en wordmark? (alleen het framework)"]');
  const styled = page.frameLocator('iframe[title="Wat doen footer-content en wordmark? (met demonstratieopmaak)"]');
  await expect(plain.locator('.footer-content')).toHaveCSS('display', 'block');
  await expect(styled.locator('.footer-content')).toHaveCSS('display', 'flex');
  expect(await plain.locator('.wordmark').evaluate(el => getComputedStyle(el).fontFamily)).not.toContain('Georgia');
  expect(await styled.locator('.wordmark').evaluate(el => getComputedStyle(el).fontFamily)).toContain('Georgia');

  const popupPromise = page.waitForEvent('popup');
  await page.locator('#patronen .docs-example').nth(1).getByRole('link', { name: 'Open als aparte pagina' }).click();
  const popup = await popupPromise;
  await expect(popup.locator('aside')).toBeVisible();
  await popup.close();

  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});
