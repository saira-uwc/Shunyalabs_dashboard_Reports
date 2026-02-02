import { test, expect } from '@playwright/test';
import { AudioProcessingPage } from '../../../../pages/product/audio-processing.page.js';
import { createResultWriter } from '../../../../utils/result-writer.js';

test.describe('Product - Audio Processing CTAs (Figma exact)', () => {
  test('CTA hrefs', async ({ page }) => {
    const audio = new AudioProcessingPage(page);
    await audio.open();

    const { writeResult } = await createResultWriter({
      moduleName: 'Product',
      reportFileName: 'module-cta-report.csv',
    });

    const contactCta = page.getByRole('link', { name: 'Contact Us' }).first();
    await expect(contactCta).toHaveAttribute('href', '/contact');
    await writeResult('Audio Processing CTA - Contact Us', 'PASS', 'href=/contact');

    const bottomGetStarted = page.getByRole('link', { name: 'Get Started' }).last();
    await expect(bottomGetStarted).toHaveAttribute('href', '/pricing');
    await writeResult('Audio Processing CTA - Get Started', 'PASS', 'href=/pricing');

    const bottomContact = page.getByRole('link', { name: 'Contact Sales' }).last();
    await expect(bottomContact).toHaveAttribute('href', '/contact');
    await writeResult('Audio Processing CTA - Contact Sales', 'PASS', 'href=/contact');
  });
});
