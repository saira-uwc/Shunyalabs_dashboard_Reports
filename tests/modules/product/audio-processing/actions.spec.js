import { test, expect } from '@playwright/test';
import { AudioProcessingPage } from '../../../../pages/product/audio-processing.page.js';
import { createResultWriter } from '../../../../utils/result-writer.js';

test.describe('Product - Audio Processing actions (Figma exact)', () => {
  test('Contact CTA visible', async ({ page }) => {
    const audio = new AudioProcessingPage(page);
    await audio.open();

    const { writeResult } = await createResultWriter({
      moduleName: 'Product',
      reportFileName: 'module-actions-report.csv',
    });

    const contactCta = page.getByRole('link', { name: 'Contact Us' }).first();
    await expect(contactCta).toBeVisible();
    await writeResult('Audio Processing Action - Contact Us', 'PASS', 'Link visible');
  });
});
