import { test, expect } from '@playwright/test';
import { PricingPage } from '../../../../pages/pricing/pricing.page.js';
import { createResultWriter } from '../../../../utils/result-writer.js';

test.describe('Pricing - Pricing CTAs (Figma exact)', () => {
  test('CTA hrefs', async ({ page }) => {
    const pricing = new PricingPage(page);
    await pricing.open();

    const { writeResult } = await createResultWriter({
      moduleName: 'Pricing',
      reportFileName: 'module-cta-report.csv',
    });

    await expect(page.getByRole('button', { name: 'Start for free' }).first()).toBeVisible();
    await writeResult('Pricing CTA - Start for free', 'PASS', 'Button visible');

    await expect(page.getByRole('button', { name: 'Buy Now' }).first()).toBeVisible();
    await writeResult('Pricing CTA - Buy Now', 'PASS', 'Button visible');

    await expect(page.getByRole('button', { name: 'Contact Sales' }).first()).toBeVisible();
    await writeResult('Pricing CTA - Contact Sales (plan)', 'PASS', 'Button visible');

    const walletLink = page.getByRole('link', { name: 'Add $18 to wallet' }).first();
    await expect(walletLink).toHaveAttribute('href', '/contact');
    await writeResult('Pricing CTA - Add $18 to wallet', 'PASS', 'href=/contact');

    const sttContact = page.getByRole('link', { name: 'Contact Sales' }).last();
    await expect(sttContact).toHaveAttribute('href', '/contact');
    await writeResult('Pricing CTA - Contact Sales (STT)', 'PASS', 'href=/contact');
  });
});
