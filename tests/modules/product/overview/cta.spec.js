import { test } from '@playwright/test';
import { pageRegistry } from '../../../../test-data/page-registry.js';
import { OverviewPage } from '../../../../pages/product/overview.page.js';
import { runCtaTest } from '../../../../utils/module-test-runner.js';

const pageEntry = pageRegistry.find((page) => page.slug === 'overview');

test.describe('Product - Overview CTAs', () => {
  test('CTAs', async ({ page }) => {
    const pageObject = new OverviewPage(page);
    await runCtaTest({ page, pageEntry, pageObject });
  });
});
