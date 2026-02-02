import { test, expect } from '@playwright/test';
import { MediaEntertainmentPage } from '../../../../pages/solutions/media-entertainment.page.js';
import { createResultWriter } from '../../../../utils/result-writer.js';

test.describe('Solutions - Media & Entertainment CTAs (Figma exact)', () => {
  test('CTA hrefs', async ({ page }) => {
    const media = new MediaEntertainmentPage(page);
    await media.open();

    const { writeResult } = await createResultWriter({
      moduleName: 'Solutions',
      reportFileName: 'module-cta-report.csv',
    });

    const heroContact = page.getByRole('link', { name: 'Contact Sales' }).first();
    await expect(heroContact).toHaveAttribute('href', '/contact');
    await writeResult('Media CTA - Hero Contact Sales', 'PASS', 'href=/contact');

    const bottomContact = page.getByRole('link', { name: 'Contact Sales' }).last();
    await expect(bottomContact).toHaveAttribute('href', '/contact');
    await writeResult('Media CTA - Bottom Contact Sales', 'PASS', 'href=/contact');
  });
});
