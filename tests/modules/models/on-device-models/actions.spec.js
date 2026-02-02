import { test, expect } from '@playwright/test';
import { OnDeviceModelsPage } from '../../../../pages/models/on-device-models.page.js';
import { createResultWriter } from '../../../../utils/result-writer.js';

test.describe('Models - On Device Models actions (Figma exact)', () => {
  test('Contact Us visible', async ({ page }) => {
    const onDevice = new OnDeviceModelsPage(page);
    await onDevice.open();

    const { writeResult } = await createResultWriter({
      moduleName: 'Models',
      reportFileName: 'module-actions-report.csv',
    });

    const contact = page.getByRole('link', { name: 'Contact Us' }).first();
    await expect(contact).toBeVisible();
    await writeResult('On Device Models Action - Contact Us', 'PASS', 'Link visible');
  });
});
