import { test, expect } from '@playwright/test';
import { pageRegistry } from '../../test-data/page-registry.js';

const ACTIVE_PAGES = pageRegistry.filter((entry) => entry.status === 'active');

async function stabilizePage(page) {
  await page.addStyleTag({
    content: `
      * {
        animation: none !important;
        transition: none !important;
        caret-color: transparent !important;
      }
    `,
  });

  await page.evaluate(async () => {
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    window.scrollTo(0, document.body.scrollHeight);
    await wait(500);
    window.scrollTo(0, 0);
    await wait(200);
  });

  await page.evaluate(async () => {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
  });
}

test.describe('Figma visual regression', () => {
  test.setTimeout(120000);

  for (const pageEntry of ACTIVE_PAGES) {
    test(`visual ${pageEntry.moduleLabel} - ${pageEntry.pageLabel}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
      await page.goto(pageEntry.path, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('load').catch(() => {});
      await page.waitForTimeout(1500);

      await stabilizePage(page);

      const screenshotName = `${pageEntry.moduleKey}-${pageEntry.slug}.png`;
      await expect(page).toHaveScreenshot([pageEntry.moduleKey, screenshotName], {
        fullPage: true,
        animations: 'disabled',
        maxDiffPixels: 0,
        maxDiffPixelRatio: 0,
      });
    });
  }
});
