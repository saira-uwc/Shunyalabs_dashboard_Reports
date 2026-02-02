import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { HomepagePage } from '../../../../pages/homepage/homepage.page.js';
import { createResultWriter } from '../../../../utils/result-writer.js';

const expectationsPath = path.join(
  process.cwd(),
  'test-data',
  'expectations',
  'homepage.json'
);
const expectations = JSON.parse(fs.readFileSync(expectationsPath, 'utf8'));

test.describe('Homepage - CTAs (Figma exact)', () => {
  test('CTA labels + destinations', async ({ page }) => {
    const homepage = new HomepagePage(page);
    await homepage.open();

    const { writeResult } = await createResultWriter({
      moduleName: 'Homepage',
      reportFileName: 'module-cta-report.csv',
    });

    const headerGetStarted = page.getByRole('link', { name: 'Get Started' }).first();
    await expect(headerGetStarted).toHaveAttribute('href', '/pricing');
    await writeResult('Header CTA - Get Started', 'PASS', 'href=/pricing');

    const headerContactSales = page.getByRole('link', { name: 'Contact Sales' }).first();
    await expect(headerContactSales).toHaveAttribute('href', '/contact');
    await writeResult('Header CTA - Contact Sales', 'PASS', 'href=/contact');

    const signInButton = page.getByRole('button', { name: 'Sign In' }).first();
    await expect(signInButton).toBeEnabled();
    await writeResult('Header CTA - Sign In', 'PASS', 'Button enabled');

    for (const cta of expectations.primaryCtas) {
      const ctaLink = page.getByRole('link', { name: cta });
      await expect(ctaLink).toBeVisible();
    }

    const cloudApi = page.getByRole('link', { name: 'Cloud API Production Ready →' });
    await expect(cloudApi).toHaveAttribute('href', '/pricing');
    await writeResult('Primary CTA - Cloud API', 'PASS', 'href=/pricing');

    const docs = page.getByRole('link', { name: 'Developer Documentation Local Deployment →' });
    await expect(docs).toHaveAttribute(
      'href',
      '/documentation/batch-transcriptions/quickstart'
    );
    await writeResult('Primary CTA - Developer Documentation', 'PASS', 'href=/documentation/.../quickstart');

    const huggingFace = page.getByRole('link', { name: 'Hugging Face Open Models →' });
    await expect(huggingFace).toHaveAttribute('href', 'https://huggingface.co/shunyalabs');
    await writeResult('Primary CTA - Hugging Face', 'PASS', 'href=https://huggingface.co/shunyalabs');

    const bottomAnchor = page.getByText(expectations.bottomCta[0]);
    const bottomSection = bottomAnchor.locator('..');
    const bottomGetStarted = bottomSection.getByRole('link', { name: 'Get Started' }).first();
    const bottomContact = bottomSection.getByRole('link', { name: 'Contact Sales' }).first();
    await expect(bottomGetStarted).toHaveAttribute('href', '/pricing');
    await expect(bottomContact).toHaveAttribute('href', '/contact');
    await writeResult('Bottom CTA - Get Started', 'PASS', 'href=/pricing');
    await writeResult('Bottom CTA - Contact Sales', 'PASS', 'href=/contact');
  });
});
