import { test } from '@playwright/test';
import { pageRegistry } from '../../../../test-data/page-registry.js';
import { OverviewPage } from '../../../../pages/product/overview.page.js';
import { runActionsTest } from '../../../../utils/module-test-runner.js';

const pageEntry = pageRegistry.find((page) => page.slug === 'overview');

test.describe('Product - Overview actions', () => {
  test('Actions', async ({ page }) => {
    const pageObject = new OverviewPage(page);
    await runActionsTest({ page, pageEntry, pageObject });
  });
});
