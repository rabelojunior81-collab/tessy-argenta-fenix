/**
 * Foundation E2E — Tessy phase 01
 * Confirms viewer routing and shell availability remain intact in the browser.
 */
import { expect, test } from '@playwright/test';

test('foundation — viewer route sync keeps the shell reachable', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/');

  await expect(page.getByText('Initializing Nucleus Core...')).toBeHidden({ timeout: 30000 });

  await page.getByTitle('Arquivos Locais').click();
  await expect(page).toHaveURL(/\/files$/);
  await expect(page.getByRole('heading', { name: 'Arquivos' })).toBeVisible();
  await expect(page.getByText('Terminal Quantico')).toBeVisible();

  expect(errors).toHaveLength(0);
});
