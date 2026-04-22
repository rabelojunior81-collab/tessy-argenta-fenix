import { type Browser, type Page, chromium } from 'playwright';

/**
 * Holds a single Playwright browser and page per agent session.
 * Lazy-initialized on first `getPage()` call.
 *
 * For v2.0 a process-level singleton is used for simplicity.
 * Isolated contexts per agent session are planned for a future release.
 */
export class BrowserSession {
  private browser: Browser | undefined;
  private page: Page | undefined;

  async getPage(): Promise<Page> {
    if (!this.browser) {
      this.browser = await chromium.launch({ headless: true });
    }
    if (!this.page || this.page.isClosed()) {
      this.page = await this.browser.newPage();
    }
    return this.page;
  }

  async close(): Promise<void> {
    try {
      await this.page?.close();
      await this.browser?.close();
    } finally {
      this.page = undefined;
      this.browser = undefined;
    }
  }

  get isOpen(): boolean {
    return this.browser !== undefined;
  }
}

/** Process-level singleton — shared across all tool invocations in a session. */
export const defaultBrowserSession = new BrowserSession();
