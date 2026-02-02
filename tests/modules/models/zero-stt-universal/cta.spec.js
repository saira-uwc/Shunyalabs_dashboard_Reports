import { test, expect } from '@playwright/test';
import { ZeroSttUniversalPage } from '../../../../pages/models/zero-stt-universal.page.js';
import { createResultWriter } from '../../../../utils/result-writer.js';

test.describe('Models - Zero STT Universal CTAs (Figma exact)', () => {
  test('CTA hrefs', async ({ page }) => {
    const universal = new ZeroSttUniversalPage(page);
    await universal.open();

    const { writeResult } = await createResultWriter({
      moduleName: 'Models',
      reportFileName: 'module-cta-report.csv',
    });

    const apiNow = page.getByRole('link', { name: 'Get Zero STT API now' }).first();
    await expect(apiNow).toHaveAttribute('href', '/documentation/models/language-models');
    await writeResult('Zero STT Universal CTA - Get Zero STT API now', 'PASS', 'href=/documentation/models/language-models');

    const bottomTry = page.getByRole('link', { name: 'Try for Free' }).first();
    await expect(bottomTry).toHaveAttribute('href', '/pricing');
    await writeResult('Zero STT Universal CTA - Try for Free', 'PASS', 'href=/pricing');

    const bottomContact = page.getByRole('link', { name: 'Contact Sales' }).first();
    await expect(bottomContact).toHaveAttribute('href', '/contact');
    await writeResult('Zero STT Universal CTA - Contact Sales', 'PASS', 'href=/contact');
  });
});
