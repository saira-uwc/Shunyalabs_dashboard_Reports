import { test, expect } from '@playwright/test';
import { OnDeviceModelsPage } from '../../../../pages/models/on-device-models.page.js';
import { createResultWriter } from '../../../../utils/result-writer.js';

test.describe('Models - On Device Models CTAs (Figma exact)', () => {
  test('CTA hrefs', async ({ page }) => {
    const onDevice = new OnDeviceModelsPage(page);
    await onDevice.open();

    const { writeResult } = await createResultWriter({
      moduleName: 'Models',
      reportFileName: 'module-cta-report.csv',
    });

    const contact = page.getByRole('link', { name: 'Contact Us' }).first();
    await expect(contact).toHaveAttribute('href', '/contact');
    await writeResult('On Device Models CTA - Contact Us', 'PASS', 'href=/contact');

    const bottomGetStarted = page.getByRole('link', { name: 'Get Started' }).last();
    await expect(bottomGetStarted).toHaveAttribute('href', '/pricing');
    await writeResult('On Device Models CTA - Get Started', 'PASS', 'href=/pricing');

    const bottomContact = page.getByRole('link', { name: 'Contact Sales' }).last();
    await expect(bottomContact).toHaveAttribute('href', '/contact');
    await writeResult('On Device Models CTA - Contact Sales', 'PASS', 'href=/contact');
  });
});
