/**
 * Playwright E2E config — Tessy v4.9.1
 * TDP §5: Contrato — runtime: Chromium headless, target localhost:3000
 * TDP §3: Gate G4 (UX Funcional) — testes E2E validam fluxos críticos
 */
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // Tessy tem estado (IndexedDB) — serial por segurança
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  timeout: 60000,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Inicia o Vite dev server antes dos testes
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: false,
    timeout: 60000,
  },
});
