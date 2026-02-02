import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { HomepagePage } from '../../../../pages/homepage/homepage.page.js';

const expectationsPath = path.join(
  process.cwd(),
  'test-data',
  'expectations',
  'homepage.json'
);
const languageRegionsPath = path.join(
  process.cwd(),
  'test-data',
  'expectations',
  'homepage-language-regions.json'
);

const expectations = JSON.parse(fs.readFileSync(expectationsPath, 'utf8'));
const languageRegions = JSON.parse(fs.readFileSync(languageRegionsPath, 'utf8'));

test.describe('Homepage - content (Figma exact)', () => {
  test('Matches exact homepage copy and ordering', async ({ page }) => {
    const homepage = new HomepagePage(page);
    await homepage.open();

    const headerNav = homepage.normalizeTextList(await homepage.getHeaderNavLabels());
    expect(headerNav).toEqual(expectations.headerNav);

    const heroText = homepage.normalizeTextList(await homepage.getHeroText());
    expect(heroText).toEqual(expectations.hero);

    const playgroundText = homepage.normalizeTextList(
      await homepage.getSectionTextByAnchors(expectations.playground)
    );
    expect(playgroundText).toEqual(expectations.playground);

    const primaryCtas = homepage.normalizeTextList(
      await homepage.getSectionTextByAnchors(expectations.primaryCtas)
    );
    expect(primaryCtas).toEqual(expectations.primaryCtas);

    const platformText = homepage.normalizeTextList(
      await homepage.getSectionTextByHeading(expectations.platform[0])
    );
    expect(platformText).toEqual(expectations.platform);

    const whyShunyaText = homepage.normalizeTextList(
      await homepage.getSectionTextByHeading(expectations.whyShunya[0])
    );
    expect(whyShunyaText).toEqual(expectations.whyShunya);

    const securityText = homepage.normalizeTextList(
      await homepage.getSectionTextByHeading(expectations.security[0])
    );
    expect(securityText).toEqual(expectations.security);

    const statsText = homepage.normalizeTextList(
      await homepage.getSectionTextByHeading(expectations.stats[0])
    );
    expect(statsText).toEqual(expectations.stats);

    const languageHeaderText = homepage.normalizeTextList(
      await homepage.getSectionTextByHeading(expectations.languageRegionsHeader[0])
    );
    const headerOnly = languageHeaderText.slice(0, expectations.languageRegionsHeader.length);
    expect(headerOnly).toEqual(expectations.languageRegionsHeader);

    const languageButtons = homepage.normalizeTextList(
      await homepage.getLanguageRegionButtons()
    );
    expect(languageButtons).toEqual(languageRegions);

    const bottomCtaText = homepage.normalizeTextList(
      await homepage.getSectionTextByAnchors([expectations.bottomCta[0]])
    );
    const bottomOnly = bottomCtaText.filter((text) =>
      expectations.bottomCta.includes(text)
    );
    expect(bottomOnly).toEqual(expectations.bottomCta);

    // Footer is validated in dedicated footer.spec.js
  });
});
