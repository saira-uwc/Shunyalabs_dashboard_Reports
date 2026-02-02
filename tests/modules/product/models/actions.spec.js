import { test } from '@playwright/test';
import { pageRegistry } from '../../../../test-data/page-registry.js';
import { ModelsPage } from '../../../../pages/product/models.page.js';
import { runActionsTest } from '../../../../utils/module-test-runner.js';

const pageEntry = pageRegistry.find((page) => page.slug === 'models');

test.describe('Product - Models actions', () => {
  test('Actions', async ({ page }) => {
    const pageObject = new ModelsPage(page);
    await runActionsTest({ page, pageEntry, pageObject });
  });
});
