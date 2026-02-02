import { test, expect } from '@playwright/test';
import { PricingPage } from '../../../../pages/pricing/pricing.page.js';
import { createResultWriter } from '../../../../utils/result-writer.js';

test.describe('Pricing - Pricing actions (Figma exact)', () => {
  test('Tabs and slider visible', async ({ page }) => {
    const pricing = new PricingPage(page);
    await pricing.open();

    const { writeResult } = await createResultWriter({
      moduleName: 'Pricing',
      reportFileName: 'module-actions-report.csv',
    });

    await expect(page.getByRole('button', { name: 'Batch' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Realtime' }).first()).toBeVisible();
    await writeResult('Pricing Actions - STT Tabs', 'PASS', 'Batch/Realtime visible');

    const slider = page.getByRole('slider').first();
    await expect(slider).toBeVisible();
    await writeResult('Pricing Actions - Slider', 'PASS', 'Voice agents slider visible');
  });
});
