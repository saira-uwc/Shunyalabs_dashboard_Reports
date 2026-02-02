import { test, expect } from '@playwright/test';
import { ContactCentersPage } from '../../../../pages/solutions/contact-centers.page.js';
import { createResultWriter } from '../../../../utils/result-writer.js';

test.describe('Solutions - Contact Centers actions (Figma exact)', () => {
  test('Try Now buttons enabled', async ({ page }) => {
    const contactCenters = new ContactCentersPage(page);
    await contactCenters.open();

    const { writeResult } = await createResultWriter({
      moduleName: 'Solutions',
      reportFileName: 'module-actions-report.csv',
    });

    const tryNowButtons = page.getByRole('button', { name: 'Try Now' });
    const count = await tryNowButtons.count();
    expect(count).toBe(3);

    for (let index = 0; index < count; index += 1) {
      await expect(tryNowButtons.nth(index)).toBeEnabled();
    }

    await writeResult('Contact Centers Actions - Try Now', 'PASS', '3 enabled buttons');
  });
});
