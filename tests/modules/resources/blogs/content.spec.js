import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { BlogsPage } from '../../../../pages/resources/blogs.page.js';

const expectationsPath = path.join(
  process.cwd(),
  'test-data',
  'expectations',
  'resources-blogs.json'
);
const expectations = JSON.parse(fs.readFileSync(expectationsPath, 'utf8'));

test.describe('Resources - Blogs content (Figma exact)', () => {
  test('Matches exact blogs copy and ordering', async ({ page }) => {
    const blogs = new BlogsPage(page);
    await blogs.open();

    const hero = await page.getByRole('heading', { level: 1 }).first().innerText();
    expect(blogs.normalizeTextList([hero])[0]).toBe(expectations.hero);

    const featured = await blogs.getFeaturedPost();
    expect(featured).toEqual(expectations.featured);

    const topics = await blogs.getTopicButtons();
    expect(blogs.normalizeTextList(topics)).toEqual(expectations.topics);

    const posts = await blogs.getPostCards();
    expect(posts.slice(0, expectations.posts.length)).toEqual(expectations.posts);

    const bottomCtaText = blogs.normalizeTextList(
      await blogs.getSectionTextByAnchors([expectations.bottomCta[0]])
    );
    expect(bottomCtaText).toEqual(expectations.bottomCta);
  });
});
