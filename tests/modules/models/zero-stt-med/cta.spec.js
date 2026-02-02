import { test } from '@playwright/test';
import { pageRegistry } from '../../../../test-data/page-registry.js';
import { ZeroSttMedPage } from '../../../../pages/models/zero-stt-med.page.js';
import { runCtaTest } from '../../../../utils/module-test-runner.js';

const pageEntry = pageRegistry.find((page) => page.slug === 'zero-stt-med');

test.describe('Models - Zero STT Med CTAs', () => {
  test('CTAs', async ({ page }) => {
    const pageObject = new ZeroSttMedPage(page);
    await runCtaTest({ page, pageEntry, pageObject });
  });
});
