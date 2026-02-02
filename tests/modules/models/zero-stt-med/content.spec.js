import { test } from '@playwright/test';
import { pageRegistry } from '../../../../test-data/page-registry.js';
import { ZeroSttMedPage } from '../../../../pages/models/zero-stt-med.page.js';
import { runContentSnapshotTest } from '../../../../utils/module-test-runner.js';

const pageEntry = pageRegistry.find((page) => page.slug === 'zero-stt-med');

test.describe('Models - Zero STT Med content', () => {
  test('Content snapshot', async ({ page }) => {
    const pageObject = new ZeroSttMedPage(page);
    await runContentSnapshotTest({ page, pageEntry, pageObject });
  });
});
