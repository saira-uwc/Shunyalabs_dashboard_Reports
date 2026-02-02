import { test, expect } from '@playwright/test';
import { ZeroSttIndicPage } from '../../../../pages/models/zero-stt-indic.page.js';
import { createResultWriter } from '../../../../utils/result-writer.js';

test.describe('Models - Zero STT Indic CTAs (Figma exact)', () => {
  test('CTA hrefs', async ({ page }) => {
    const zeroIndic = new ZeroSttIndicPage(page);
    await zeroIndic.open();

    const { writeResult } = await createResultWriter({
      moduleName: 'Models',
      reportFileName: 'module-cta-report.csv',
    });

    const tryNow = page.getByRole('link', { name: 'Try now' }).first();
    await expect(tryNow).toHaveAttribute('href', '/documentation/models/language-models');
    await writeResult('Zero STT Indic CTA - Try now', 'PASS', 'href=/documentation/models/language-models');

    const bottomTry = page.getByRole('link', { name: 'Try for Free' }).first();
    await expect(bottomTry).toHaveAttribute('href', '/pricing');
    await writeResult('Zero STT Indic CTA - Try for Free', 'PASS', 'href=/pricing');

    const bottomContact = page.getByRole('link', { name: 'Contact Sales' }).first();
    await expect(bottomContact).toHaveAttribute('href', '/contact');
    await writeResult('Zero STT Indic CTA - Contact Sales', 'PASS', 'href=/contact');
  });
});
