import { test, expect } from '@playwright/test';
import { SpeechIntelligencePage } from '../../../../pages/product/speech-intelligence.page.js';
import { createResultWriter } from '../../../../utils/result-writer.js';

test.describe('Product - Speech Intelligence CTAs (Figma exact)', () => {
  test('CTA hrefs', async ({ page }) => {
    const speech = new SpeechIntelligencePage(page);
    await speech.open();

    const { writeResult } = await createResultWriter({
      moduleName: 'Product',
      reportFileName: 'module-cta-report.csv',
    });

    const tryNow = page.getByRole('link', { name: 'Try Now' }).first();
    await expect(tryNow).toHaveAttribute('href', '/contact');
    await writeResult('Speech Intelligence CTA - Try Now', 'PASS', 'href=/contact');

    const bottomGetStarted = page.getByRole('link', { name: 'Get Started' }).last();
    await expect(bottomGetStarted).toHaveAttribute('href', '/pricing');
    await writeResult('Speech Intelligence CTA - Get Started', 'PASS', 'href=/pricing');

    const bottomContact = page.getByRole('link', { name: 'Contact Sales' }).last();
    await expect(bottomContact).toHaveAttribute('href', '/contact');
    await writeResult('Speech Intelligence CTA - Contact Sales', 'PASS', 'href=/contact');
  });
});
