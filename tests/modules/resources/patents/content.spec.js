import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { PatentsPage } from '../../../../pages/resources/patents.page.js';

const expectationsPath = path.join(
  process.cwd(),
  'test-data',
  'expectations',
  'resources-patents.json'
);
const expectations = JSON.parse(fs.readFileSync(expectationsPath, 'utf8'));

test.describe('Resources - Patents content (Figma exact)', () => {
  test('Matches exact patents copy and ordering', async ({ page }) => {
    const patents = new PatentsPage(page);
    await patents.open();

    const heroText = patents.normalizeTextList(
      await patents.getSectionTextByAnchors(expectations.hero)
    );
    expect(heroText).toEqual(expectations.hero);

    const patentsText = patents.normalizeTextList(
      await patents.getSectionTextByAnchors(expectations.patents)
    );
    const patentsOnly = patentsText.filter((text) =>
      expectations.patents.includes(text)
    );
    expect(patentsOnly).toEqual(expectations.patents);

    const ctaText = patents.normalizeTextList(
      await patents.getSectionTextByAnchors(expectations.cta)
    );
    expect(ctaText).toEqual(expectations.cta);

    const bottomCtaText = patents.normalizeTextList(
      await patents.getSectionTextByAnchors([expectations.bottomCta[0]])
    );
    expect(bottomCtaText).toEqual(expectations.bottomCta);
  });
});
