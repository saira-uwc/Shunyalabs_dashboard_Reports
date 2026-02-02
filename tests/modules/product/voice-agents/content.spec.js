import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { VoiceAgentsPage } from '../../../../pages/product/voice-agents.page.js';

const expectationsPath = path.join(
  process.cwd(),
  'test-data',
  'expectations',
  'product-voice-agents.json'
);
const expectations = JSON.parse(fs.readFileSync(expectationsPath, 'utf8'));

test.describe('Product - Voice Agents content (Figma exact)', () => {
  test('Matches exact voice agents copy and ordering', async ({ page }) => {
    const voiceAgents = new VoiceAgentsPage(page);
    await voiceAgents.open();

    const heroText = voiceAgents.normalizeTextList(
      await voiceAgents.getSectionTextByAnchors(expectations.hero)
    );
    expect(heroText).toEqual(expectations.hero);

    const capabilitiesText = voiceAgents.normalizeTextList(
      await voiceAgents.getSectionTextByAnchors(expectations.capabilities)
    );
    const filteredCapabilities = capabilitiesText.filter((text) =>
      expectations.capabilities.includes(text)
    );
    expect(filteredCapabilities).toEqual(expectations.capabilities);

    const contactText = voiceAgents.normalizeTextList(
      await voiceAgents.getSectionTextByAnchors(expectations.contactCta)
    );
    expect(contactText).toEqual(expectations.contactCta);

    const solutionText = voiceAgents.normalizeTextList(
      await voiceAgents.getSectionTextByHeading(expectations.solution[0])
    );
    expect(solutionText).toEqual(expectations.solution);

    const bottomCtaText = voiceAgents.normalizeTextList(
      await voiceAgents.getSectionTextByAnchors([expectations.bottomCta[0]])
    );
    const bottomOnly = bottomCtaText.filter((text) =>
      expectations.bottomCta.includes(text)
    );
    expect(bottomOnly).toEqual(expectations.bottomCta);
  });
});
