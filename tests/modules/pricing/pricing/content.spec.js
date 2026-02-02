import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { PricingPage } from '../../../../pages/pricing/pricing.page.js';

const expectationsPath = path.join(process.cwd(), 'test-data', 'expectations', 'pricing.json');
const expectations = JSON.parse(fs.readFileSync(expectationsPath, 'utf8'));

test.describe('Pricing - Pricing content (Figma exact)', () => {
  test('Matches exact pricing copy and ordering', async ({ page }) => {
    const pricing = new PricingPage(page);
    await pricing.open();

    const heroText = pricing.normalizeTextList(
      await pricing.getSectionTextByAnchors(expectations.hero)
    );
    expect(heroText).toEqual(expectations.hero);

    const plansText = pricing.normalizeTextList(
      await pricing.getSectionTextByAnchors(expectations.plans)
    );
    const plansOnly = plansText.filter((text) => expectations.plans.includes(text));
    expect(plansOnly).toEqual(expectations.plans);

    const voiceAgentsText = pricing.normalizeTextList(
      await pricing.getSectionTextByHeading(expectations.voiceAgents[0])
    );
    const voiceAgentsOnly = voiceAgentsText.filter((text) =>
      expectations.voiceAgents.includes(text)
    );
    expect(voiceAgentsOnly).toEqual(expectations.voiceAgents);

    const speechToTextText = pricing.normalizeTextList(
      await pricing.getSectionTextByHeading(expectations.speechToText[0])
    );
    const speechToTextOnly = speechToTextText.filter((text) =>
      expectations.speechToText.includes(text)
    );
    expect(speechToTextOnly).toEqual(expectations.speechToText);

    const audioProcessingText = pricing.normalizeTextList(
      await pricing.getSectionTextByHeading(expectations.audioProcessing[0])
    );
    const audioProcessingOnly = audioProcessingText.filter((text) =>
      expectations.audioProcessing.includes(text)
    );
    expect(audioProcessingOnly).toEqual(expectations.audioProcessing);

    const speechIntelligenceText = pricing.normalizeTextList(
      await pricing.getSectionTextByHeading(expectations.speechIntelligence[0])
    );
    const speechIntelligenceOnly = speechIntelligenceText.filter((text) =>
      expectations.speechIntelligence.includes(text)
    );
    expect(speechIntelligenceOnly).toEqual(expectations.speechIntelligence);
  });
});
