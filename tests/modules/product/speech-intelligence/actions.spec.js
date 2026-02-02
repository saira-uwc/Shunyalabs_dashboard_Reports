import { test, expect } from '@playwright/test';
import { SpeechIntelligencePage } from '../../../../pages/product/speech-intelligence.page.js';
import { createResultWriter } from '../../../../utils/result-writer.js';

test.describe('Product - Speech Intelligence actions (Figma exact)', () => {
  test('Try Now CTA visible', async ({ page }) => {
    const speech = new SpeechIntelligencePage(page);
    await speech.open();

    const { writeResult } = await createResultWriter({
      moduleName: 'Product',
      reportFileName: 'module-actions-report.csv',
    });

    const tryNow = page.getByRole('link', { name: 'Try Now' }).first();
    await expect(tryNow).toBeVisible();
    await writeResult('Speech Intelligence Action - Try Now', 'PASS', 'Link visible');
  });
});
