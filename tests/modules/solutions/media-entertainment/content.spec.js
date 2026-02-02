import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { MediaEntertainmentPage } from '../../../../pages/solutions/media-entertainment.page.js';

const expectationsPath = path.join(
  process.cwd(),
  'test-data',
  'expectations',
  'solutions-media-entertainment.json'
);
const expectations = JSON.parse(fs.readFileSync(expectationsPath, 'utf8'));

test.describe('Solutions - Media & Entertainment content (Figma exact)', () => {
  test('Matches exact media & entertainment copy and ordering', async ({ page }) => {
    const media = new MediaEntertainmentPage(page);
    await media.open();

    const heroText = media.normalizeTextList(
      await media.getSectionTextByAnchors(expectations.hero)
    );
    expect(heroText).toEqual(expectations.hero);

    const tabsText = media.normalizeTextList(
      await media.getSectionTextByAnchors(expectations.tabs)
    );
    expect(tabsText).toEqual(expectations.tabs);

    const languageText = media.normalizeTextList(
      await media.getSectionTextByHeading(expectations.languageCoverage[0])
    );
    expect(languageText).toEqual(expectations.languageCoverage);

    const searchableText = media.normalizeTextList(
      await media.getSectionTextByHeading(expectations.searchableAssets[0])
    );
    expect(searchableText).toEqual(expectations.searchableAssets);

    const charactersText = media.normalizeTextList(
      await media.getSectionTextByHeading(expectations.characters[0])
    );
    expect(charactersText).toEqual(expectations.characters);

    const dubbingText = media.normalizeTextList(
      await media.getSectionTextByHeading(expectations.dubbing[0])
    );
    expect(dubbingText).toEqual(expectations.dubbing);

    const ctaText = media.normalizeTextList(
      await media.getSectionTextByHeading(expectations.cta[0])
    );
    expect(ctaText).toEqual(expectations.cta);
  });
});
