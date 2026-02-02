import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { BlogsPage } from '../../../../pages/resources/blogs.page.js';
import { createResultWriter } from '../../../../utils/result-writer.js';

const expectationsPath = path.join(
  process.cwd(),
  'test-data',
  'expectations',
  'resources-blogs.json'
);
const expectations = JSON.parse(fs.readFileSync(expectationsPath, 'utf8'));

test.describe('Resources - Blogs CTAs (Figma exact)', () => {
  test('CTA hrefs', async ({ page }) => {
    const blogs = new BlogsPage(page);
    await blogs.open();

    const { writeResult } = await createResultWriter({
      moduleName: 'Resources',
      reportFileName: 'module-cta-report.csv',
    });

    const featuredLink = page.getByRole('link', { name: expectations.featured.title }).first();
    await expect(featuredLink).toHaveAttribute('href', expectations.featured.href);
    await writeResult('Blogs CTA - Featured', 'PASS', `href=${expectations.featured.href}`);

    for (const post of expectations.posts) {
      const postLink = page.getByRole('link', { name: post.title }).first();
      await expect(postLink).toHaveAttribute('href', post.href);
      await writeResult(`Blogs CTA - ${post.title}`, 'PASS', `href=${post.href}`);
    }

    const bottomGetStarted = page.getByRole('link', { name: 'Get Started' }).last();
    await expect(bottomGetStarted).toHaveAttribute('href', '/pricing');
    await writeResult('Blogs CTA - Get Started', 'PASS', 'href=/pricing');

    const bottomContact = page.getByRole('link', { name: 'Contact Sales' }).last();
    await expect(bottomContact).toHaveAttribute('href', '/contact');
    await writeResult('Blogs CTA - Contact Sales', 'PASS', 'href=/contact');
  });
});
