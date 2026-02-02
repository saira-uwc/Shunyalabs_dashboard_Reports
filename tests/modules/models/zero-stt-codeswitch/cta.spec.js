import { test, expect } from '@playwright/test';
import { ZeroSttCodeswitchPage } from '../../../../pages/models/zero-stt-codeswitch.page.js';
import { createResultWriter } from '../../../../utils/result-writer.js';

test.describe('Models - Zero STT Codeswitch CTAs (Figma exact)', () => {
  test('CTA hrefs', async ({ page }) => {
    const codeswitch = new ZeroSttCodeswitchPage(page);
    await codeswitch.open();

    const { writeResult } = await createResultWriter({
      moduleName: 'Models',
      reportFileName: 'module-cta-report.csv',
    });

    const apiNow = page.getByRole('link', { name: 'Get Hinglish API now' }).first();
    await expect(apiNow).toHaveAttribute('href', '/documentation/models/language-models');
    await writeResult('Zero STT Codeswitch CTA - Get Hinglish API now', 'PASS', 'href=/documentation/models/language-models');

    const bottomTry = page.getByRole('link', { name: 'Try for Free' }).first();
    await expect(bottomTry).toHaveAttribute('href', '/pricing');
    await writeResult('Zero STT Codeswitch CTA - Try for Free', 'PASS', 'href=/pricing');

    const bottomContact = page.getByRole('link', { name: 'Contact Sales' }).first();
    await expect(bottomContact).toHaveAttribute('href', '/contact');
    await writeResult('Zero STT Codeswitch CTA - Contact Sales', 'PASS', 'href=/contact');
  });
});
