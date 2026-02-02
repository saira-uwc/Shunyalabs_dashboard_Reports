import { test, expect } from '@playwright/test';
import { BenchmarksPage } from '../../../../pages/resources/benchmarks.page.js';
import { createResultWriter } from '../../../../utils/result-writer.js';

test.describe('Resources - Benchmarks CTAs (Figma exact)', () => {
  test('CTA hrefs', async ({ page }) => {
    const benchmarks = new BenchmarksPage(page);
    await benchmarks.open();

    const { writeResult } = await createResultWriter({
      moduleName: 'Resources',
      reportFileName: 'module-cta-report.csv',
    });

    const bookMeeting = page.getByRole('button', { name: 'Book a Meeting' }).first();
    await expect(bookMeeting).toBeVisible();
    await writeResult('Benchmarks CTA - Book a Meeting', 'PASS', 'Button visible');

    const bottomGetStarted = page.getByRole('link', { name: 'Get Started' }).last();
    await expect(bottomGetStarted).toHaveAttribute('href', '/pricing');
    await writeResult('Benchmarks CTA - Get Started', 'PASS', 'href=/pricing');

    const bottomContact = page.getByRole('link', { name: 'Contact Sales' }).last();
    await expect(bottomContact).toHaveAttribute('href', '/contact');
    await writeResult('Benchmarks CTA - Contact Sales', 'PASS', 'href=/contact');
  });
});
