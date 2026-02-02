import { test, expect } from '@playwright/test';
import { ContactPage } from '../../../../pages/contact/contact.page.js';
import { createResultWriter } from '../../../../utils/result-writer.js';

test.describe('Contact - Contact Us actions (Figma exact)', () => {
  test('Form fields and checkboxes visible', async ({ page }) => {
    const contact = new ContactPage(page);
    await contact.open();

    const { writeResult } = await createResultWriter({
      moduleName: 'Contact',
      reportFileName: 'module-actions-report.csv',
    });

    await expect(page.getByLabel('Name *')).toBeVisible();
    await expect(page.getByLabel('Work Email *')).toBeVisible();
    await expect(page.getByLabel('Phone Number *')).toBeVisible();
    await expect(page.getByLabel('Message *')).toBeVisible();
    await expect(
      page.getByLabel('I agree to receive marketing communications from Shunya Labs.')
    ).toBeVisible();
    await expect(
      page.getByLabel('I agree to the Privacy Policy and Terms & Conditions. *')
    ).toBeVisible();

    await writeResult('Contact Actions - Form fields', 'PASS', 'Fields visible');
  });
});
