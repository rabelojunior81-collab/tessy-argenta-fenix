import { expect, test } from '@playwright/test';

test('state — refresh keeps files viewer shell reachable', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/files');

  await expect(page.getByText('Initializing Nucleus Core...')).toBeHidden({ timeout: 30000 });
  await expect(page.getByText('Restaurando sessao...')).toBeHidden({ timeout: 30000 });
  await expect(page).toHaveURL(/\/files$/);
  await expect(page.getByRole('heading', { name: 'Arquivos' })).toBeVisible();

  await page.reload();

  await expect(page.getByText('Initializing Nucleus Core...')).toBeHidden({ timeout: 30000 });
  await expect(page.getByText('Restaurando sessao...')).toBeHidden({ timeout: 30000 });
  await expect(page).toHaveURL(/\/files$/);
  await expect(page.getByRole('heading', { name: 'Arquivos' })).toBeVisible();
  await expect(page.getByText('Terminal Quantico')).toBeVisible();

  expect(errors).toHaveLength(0);
});
