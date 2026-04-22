/**
 * Smoke test E2E — Tessy v4.9.1
 * TDP §4: Gate G4 (UX Funcional) — verifica que a aplicação carrega sem erros críticos.
 * Não testa funcionalidades específicas — apenas confirma que o shell da UI está de pé.
 */
import { expect, test } from '@playwright/test';

test('smoke — aplicação carrega sem erros críticos', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto('/');

  // Confirma que estamos na Tessy (não em outra app na mesma porta)
  await expect(page).toHaveTitle(/tessy \/\/ Rabelus Lab/, { timeout: 10000 });

  // Root element presente
  await expect(page.locator('#root')).toBeVisible({ timeout: 10000 });

  // Aguarda React montar — importmap carrega React do esm.sh, precisa de tempo
  // Boot screen desaparece quando o Nucleus Core termina de inicializar
  await expect(page.getByText('Initializing Nucleus Core...')).toBeHidden({ timeout: 30000 });

  // Sem erros JavaScript fatais
  expect(errors).toHaveLength(0);
});
