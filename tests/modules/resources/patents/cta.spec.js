import { test, expect } from '@playwright/test';
import { PatentsPage } from '../../../../pages/resources/patents.page.js';
import { createResultWriter } from '../../../../utils/result-writer.js';

test.describe('Resources - Patents CTAs (Figma exact)', () => {
  test('CTA hrefs', async ({ page }) => {
    const patents = new PatentsPage(page);
    await patents.open();

    const { writeResult } = await createResultWriter({
      moduleName: 'Resources',
      reportFileName: 'module-cta-report.csv',
    });

    const contactUs = page.getByRole('link', { name: 'Contact Us' }).first();
    await expect(contactUs).toHaveAttribute('href', '/contact');
    await writeResult('Patents CTA - Contact Us', 'PASS', 'href=/contact');

    const bottomGetStarted = page.getByRole('link', { name: 'Get Started' }).last();
    await expect(bottomGetStarted).toHaveAttribute('href', '/pricing');
    await writeResult('Patents CTA - Get Started', 'PASS', 'href=/pricing');

    const bottomContact = page.getByRole('link', { name: 'Contact Sales' }).last();
    await expect(bottomContact).toHaveAttribute('href', '/contact');
    await writeResult('Patents CTA - Contact Sales', 'PASS', 'href=/contact');
  });
});
