import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { SpeechIntelligencePage } from '../../../../pages/product/speech-intelligence.page.js';

const expectationsPath = path.join(
  process.cwd(),
  'test-data',
  'expectations',
  'product-speech-intelligence.json'
);
const expectations = JSON.parse(fs.readFileSync(expectationsPath, 'utf8'));

test.describe('Product - Speech Intelligence content (Figma exact)', () => {
  test('Matches exact speech intelligence copy and ordering', async ({ page }) => {
    const speech = new SpeechIntelligencePage(page);
    await speech.open();

    const heroText = speech.normalizeTextList(
      await speech.getSectionTextByAnchors(expectations.hero)
    );
    expect(heroText).toEqual(expectations.hero);

    const languageText = speech.normalizeTextList(
      await speech.getSectionTextByHeading(expectations.languageExpertise[0])
    );
    expect(languageText).toEqual(expectations.languageExpertise);

    const formattingText = speech.normalizeTextList(
      await speech.getSectionTextByHeading(expectations.smartFormatting[0])
    );
    expect(formattingText).toEqual(expectations.smartFormatting);

    const insightsText = speech.normalizeTextList(
      await speech.getSectionTextByHeading(expectations.conversationalInsights[0])
    );
    expect(insightsText).toEqual(expectations.conversationalInsights);

    const advancedText = speech.normalizeTextList(
      await speech.getSectionTextByHeading(expectations.advancedFeatures[0])
    );
    expect(advancedText).toEqual(expectations.advancedFeatures);

    const bottomCtaText = speech.normalizeTextList(
      await speech.getSectionTextByAnchors([expectations.bottomCta[0]])
    );
    const bottomOnly = bottomCtaText.filter((text) =>
      expectations.bottomCta.includes(text)
    );
    expect(bottomOnly).toEqual(expectations.bottomCta);
  });
});
