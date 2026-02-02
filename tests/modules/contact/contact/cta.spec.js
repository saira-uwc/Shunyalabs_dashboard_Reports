import { test, expect } from '@playwright/test';
import { ContactPage } from '../../../../pages/contact/contact.page.js';
import { createResultWriter } from '../../../../utils/result-writer.js';

test.describe('Contact - Contact Us CTAs (Figma exact)', () => {
  test('CTA visibility', async ({ page }) => {
    const contact = new ContactPage(page);
    await contact.open();

    const { writeResult } = await createResultWriter({
      moduleName: 'Contact',
      reportFileName: 'module-cta-report.csv',
    });

    await expect(page.getByRole('button', { name: 'Submit' }).first()).toBeVisible();
    await writeResult('Contact CTA - Submit', 'PASS', 'Button visible');
  });
});
