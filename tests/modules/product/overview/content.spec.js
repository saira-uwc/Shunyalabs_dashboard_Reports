import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { OverviewPage } from '../../../../pages/product/overview.page.js';

const expectationsPath = path.join(
  process.cwd(),
  'test-data',
  'expectations',
  'product-overview.json'
);
const expectations = JSON.parse(fs.readFileSync(expectationsPath, 'utf8'));

test.describe('Product - Overview content (Figma exact)', () => {
  test('Matches exact overview copy and ordering', async ({ page }) => {
    const overview = new OverviewPage(page);
    await overview.open();

    const heroText = overview.normalizeTextList(await overview.getHeroText());
    expect(heroText).toEqual(expectations.hero);

    const foundationText = overview.normalizeTextList(
      await overview.getSectionTextByHeading(expectations.foundationModels[0])
    );
    expect(foundationText).toEqual(expectations.foundationModels);

    const voiceAgentText = overview.normalizeTextList(
      await overview.getSectionTextByHeading(expectations.voiceAgent[0])
    );
    expect(voiceAgentText).toEqual(expectations.voiceAgent);

    const intelligenceText = overview.normalizeTextList(
      await overview.getSectionTextByHeading(expectations.intelligenceFeatures[0])
    );
    expect(intelligenceText).toEqual(expectations.intelligenceFeatures);

    const audioText = overview.normalizeTextList(
      await overview.getSectionTextByHeading(expectations.audioProcessing[0])
    );
    expect(audioText).toEqual(expectations.audioProcessing);

    const deploymentText = overview.normalizeTextList(
      await overview.getSectionTextByHeading(expectations.deployment[0])
    );
    expect(deploymentText).toEqual(expectations.deployment);

    const bottomCtaText = overview.normalizeTextList(
      await overview.getSectionTextByAnchors([expectations.bottomCta[0]])
    );
    const bottomOnly = bottomCtaText.filter((text) =>
      expectations.bottomCta.includes(text)
    );
    expect(bottomOnly).toEqual(expectations.bottomCta);
  });
});
