import { test, expect } from '@playwright/test';
import { LanguageModelsPage } from '../../../../pages/models/language-models.page.js';
import { createResultWriter } from '../../../../utils/result-writer.js';

test.describe('Models - Language Models CTAs (Figma exact)', () => {
  test('CTA hrefs', async ({ page }) => {
    const models = new LanguageModelsPage(page);
    await models.open();

    const { writeResult } = await createResultWriter({
      moduleName: 'Models',
      reportFileName: 'module-cta-report.csv',
    });

    const indic = page.getByRole('link', { name: 'Learn more' }).nth(0);
    await expect(indic).toHaveAttribute('href', '/zero-indic');
    await writeResult('Language Models CTA - Zero STT Indic', 'PASS', 'href=/zero-indic');

    const codeswitch = page.getByRole('link', { name: 'Learn more' }).nth(1);
    await expect(codeswitch).toHaveAttribute('href', '/zero-code-switch');
    await writeResult('Language Models CTA - Zero STT Code-switch', 'PASS', 'href=/zero-code-switch');

    const zeroStt = page.getByRole('link', { name: 'Learn more' }).nth(2);
    await expect(zeroStt).toHaveAttribute('href', '/zero-stt');
    await writeResult('Language Models CTA - Zero STT', 'PASS', 'href=/zero-stt');

    const tryNowLinks = page.getByRole('link', { name: 'Try now' });
    const tryCount = await tryNowLinks.count();
    expect(tryCount).toBe(2);
    await expect(tryNowLinks.nth(0)).toHaveAttribute('href', '/documentation/models/language-models');
    await expect(tryNowLinks.nth(1)).toHaveAttribute('href', '/documentation/models/language-models');
    await writeResult('Language Models CTA - Try now', 'PASS', '2 links to /documentation/models/language-models');

    const fullList = page.getByRole('link', { name: 'See the full list of languages supported by Shunya Labs' }).first();
    await expect(fullList).toHaveAttribute('href', 'documentation/languages');
    await writeResult('Language Models CTA - Full language list', 'PASS', 'href=documentation/languages');

    const bottomGetStarted = page.getByRole('link', { name: 'Get Started' }).last();
    await expect(bottomGetStarted).toHaveAttribute('href', '/pricing');
    await writeResult('Language Models CTA - Get Started', 'PASS', 'href=/pricing');

    const bottomContact = page.getByRole('link', { name: 'Contact Sales' }).last();
    await expect(bottomContact).toHaveAttribute('href', '/contact');
    await writeResult('Language Models CTA - Contact Sales', 'PASS', 'href=/contact');
  });
});
