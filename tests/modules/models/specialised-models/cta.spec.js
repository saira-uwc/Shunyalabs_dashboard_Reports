import { test, expect } from '@playwright/test';
import { SpecialisedModelsPage } from '../../../../pages/models/specialised-models.page.js';
import { createResultWriter } from '../../../../utils/result-writer.js';

test.describe('Models - Specialised Models CTAs (Figma exact)', () => {
  test('CTA hrefs', async ({ page }) => {
    const specialised = new SpecialisedModelsPage(page);
    await specialised.open();

    const { writeResult } = await createResultWriter({
      moduleName: 'Models',
      reportFileName: 'module-cta-report.csv',
    });

    const tryNow = page.getByRole('link', { name: 'Try now' }).first();
    await expect(tryNow).toHaveAttribute('href', '/zero-med');
    await writeResult('Specialised Models CTA - Try now', 'PASS', 'href=/zero-med');

    const learnNow = page.getByRole('link', { name: 'Learn now' }).first();
    await expect(learnNow).toHaveAttribute('href', '/documentation/medical-transcription');
    await writeResult('Specialised Models CTA - Learn now', 'PASS', 'href=/documentation/medical-transcription');

    const bottomGetStarted = page.getByRole('link', { name: 'Get Started' }).last();
    await expect(bottomGetStarted).toHaveAttribute('href', '/pricing');
    await writeResult('Specialised Models CTA - Get Started', 'PASS', 'href=/pricing');

    const bottomContact = page.getByRole('link', { name: 'Contact Sales' }).last();
    await expect(bottomContact).toHaveAttribute('href', '/contact');
    await writeResult('Specialised Models CTA - Contact Sales', 'PASS', 'href=/contact');
  });
});
