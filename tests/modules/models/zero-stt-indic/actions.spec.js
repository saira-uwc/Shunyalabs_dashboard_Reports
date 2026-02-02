import { test, expect } from '@playwright/test';
import { ZeroSttIndicPage } from '../../../../pages/models/zero-stt-indic.page.js';
import { createResultWriter } from '../../../../utils/result-writer.js';

test.describe('Models - Zero STT Indic actions (Figma exact)', () => {
  test('Try now link visible', async ({ page }) => {
    const zeroIndic = new ZeroSttIndicPage(page);
    await zeroIndic.open();

    const { writeResult } = await createResultWriter({
      moduleName: 'Models',
      reportFileName: 'module-actions-report.csv',
    });

    const tryNow = page.getByRole('link', { name: 'Try now' }).first();
    await expect(tryNow).toBeVisible();
    await writeResult('Zero STT Indic Action - Try now', 'PASS', 'Link visible');
  });
});
