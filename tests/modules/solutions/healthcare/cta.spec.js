import { test, expect } from '@playwright/test';
import { HealthcarePage } from '../../../../pages/solutions/healthcare.page.js';
import { createResultWriter } from '../../../../utils/result-writer.js';

test.describe('Solutions - Healthcare CTAs (Figma exact)', () => {
  test('CTA hrefs', async ({ page }) => {
    const healthcare = new HealthcarePage(page);
    await healthcare.open();

    const { writeResult } = await createResultWriter({
      moduleName: 'Solutions',
      reportFileName: 'module-cta-report.csv',
    });

    const liveDemo = page.getByRole('link', { name: 'Live Demo' }).first();
    await expect(liveDemo).toHaveAttribute('href', '/');
    await writeResult('Healthcare CTA - Live Demo', 'PASS', 'href=/');

    const tryNowButtons = page.getByRole('button', { name: 'Try Now' });
    const count = await tryNowButtons.count();
    expect(count).toBe(3);
    await writeResult('Healthcare CTA - Try Now', 'PASS', '3 buttons visible');

    const bottomTry = page.getByRole('link', { name: 'Try for Free' }).first();
    await expect(bottomTry).toHaveAttribute('href', '/pricing');
    await writeResult('Healthcare CTA - Try for Free', 'PASS', 'href=/pricing');

    const bottomContact = page.getByRole('link', { name: 'Contact Sales' }).first();
    await expect(bottomContact).toHaveAttribute('href', '/contact');
    await writeResult('Healthcare CTA - Contact Sales', 'PASS', 'href=/contact');
  });
});
