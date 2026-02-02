import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { BenchmarksPage } from '../../../../pages/resources/benchmarks.page.js';

const expectationsPath = path.join(
  process.cwd(),
  'test-data',
  'expectations',
  'resources-benchmarks.json'
);
const expectations = JSON.parse(fs.readFileSync(expectationsPath, 'utf8'));

test.describe('Resources - Benchmarks content (Figma exact)', () => {
  test('Matches exact benchmarks copy and ordering', async ({ page }) => {
    const benchmarks = new BenchmarksPage(page);
    await benchmarks.open();

    const heroText = benchmarks.normalizeTextList(
      await benchmarks.getSectionTextByAnchors(expectations.hero)
    );
    expect(heroText).toEqual(expectations.hero);

    const ctaText = benchmarks.normalizeTextList(
      await benchmarks.getSectionTextByAnchors(expectations.cta)
    );
    expect(ctaText).toEqual(expectations.cta);

    const highestText = benchmarks.normalizeTextList(
      await benchmarks.getSectionTextByHeading(expectations.highest[0])
    );
    expect(highestText).toEqual(expectations.highest);

    const tabsText = benchmarks.normalizeTextList(
      await benchmarks.getSectionTextByAnchors(expectations.highestTabs)
    );
    expect(tabsText).toEqual(expectations.highestTabs);

    const lowestText = benchmarks.normalizeTextList(
      await benchmarks.getSectionTextByHeading(expectations.lowest[0])
    );
    expect(lowestText).toEqual(expectations.lowest);

    const milestonesText = benchmarks.normalizeTextList(
      await benchmarks.getSectionTextByHeading(expectations.milestones[0])
    );
    const milestonesOnly = milestonesText.filter((text) =>
      expectations.milestones.includes(text)
    );
    expect(milestonesOnly).toEqual(expectations.milestones);

    const bottomCtaText = benchmarks.normalizeTextList(
      await benchmarks.getSectionTextByAnchors([expectations.bottomCta[0]])
    );
    expect(bottomCtaText).toEqual(expectations.bottomCta);
  });
});
