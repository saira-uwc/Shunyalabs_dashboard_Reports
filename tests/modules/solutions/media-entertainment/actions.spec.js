import { test, expect } from '@playwright/test';
import { MediaEntertainmentPage } from '../../../../pages/solutions/media-entertainment.page.js';
import { createResultWriter } from '../../../../utils/result-writer.js';

test.describe('Solutions - Media & Entertainment actions (Figma exact)', () => {
  test('Contact Sales CTA visible', async ({ page }) => {
    const media = new MediaEntertainmentPage(page);
    await media.open();

    const { writeResult } = await createResultWriter({
      moduleName: 'Solutions',
      reportFileName: 'module-actions-report.csv',
    });

    const contactSales = page.getByRole('link', { name: 'Contact Sales' }).first();
    await expect(contactSales).toBeVisible();
    await writeResult('Media Actions - Contact Sales', 'PASS', 'Link visible');
  });
});
