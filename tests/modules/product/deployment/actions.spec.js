import { test, expect } from '@playwright/test';
import { DeploymentPage } from '../../../../pages/product/deployment.page.js';
import { createResultWriter } from '../../../../utils/result-writer.js';

test.describe('Product - Deployment actions (Figma exact)', () => {
  test('Contact CTA visible', async ({ page }) => {
    const deployment = new DeploymentPage(page);
    await deployment.open();

    const { writeResult } = await createResultWriter({
      moduleName: 'Product',
      reportFileName: 'module-actions-report.csv',
    });

    const contactCta = page.getByRole('link', { name: 'Contact Us' }).first();
    await expect(contactCta).toBeVisible();
    await writeResult('Deployment Action - Contact Us', 'PASS', 'Link visible');
  });
});
