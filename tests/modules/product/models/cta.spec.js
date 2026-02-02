import { test } from '@playwright/test';
import { pageRegistry } from '../../../../test-data/page-registry.js';
import { ModelsPage } from '../../../../pages/product/models.page.js';
import { runCtaTest } from '../../../../utils/module-test-runner.js';

const pageEntry = pageRegistry.find((page) => page.slug === 'models');

test.describe('Product - Models CTAs', () => {
  test('CTAs', async ({ page }) => {
    const pageObject = new ModelsPage(page);
    await runCtaTest({ page, pageEntry, pageObject });
  });
});
