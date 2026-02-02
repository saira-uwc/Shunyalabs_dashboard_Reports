import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { UseCasesPage } from '../../../../pages/solutions/use-cases.page.js';

const expectationsPath = path.join(
  process.cwd(),
  'test-data',
  'expectations',
  'solutions-use-cases.json'
);
const expectations = JSON.parse(fs.readFileSync(expectationsPath, 'utf8'));

test.describe('Solutions - Use Cases content (Figma exact)', () => {
  test('Matches exact use cases copy and ordering', async ({ page }) => {
    const useCases = new UseCasesPage(page);
    await useCases.open();

    const heroText = useCases.normalizeTextList(
      await useCases.getSectionTextByAnchors(expectations.hero)
    );
    expect(heroText).toEqual(expectations.hero);

    const capabilitiesText = useCases.normalizeTextList(
      await useCases.getSectionTextByAnchors(expectations.capabilities)
    );
    const capabilitiesOnly = capabilitiesText.filter((text) =>
      expectations.capabilities.includes(text)
    );
    expect(capabilitiesOnly).toEqual(expectations.capabilities);

    const voiceAgentsText = useCases.normalizeTextList(
      await useCases.getSectionTextByHeading(expectations.voiceAgents[0])
    );
    expect(voiceAgentsText).toEqual(expectations.voiceAgents);

    const medicalText = useCases.normalizeTextList(
      await useCases.getSectionTextByHeading(expectations.medicalDocumentation[0])
    );
    expect(medicalText).toEqual(expectations.medicalDocumentation);

    const contactCenterText = useCases.normalizeTextList(
      await useCases.getSectionTextByHeading(expectations.contactCenter[0])
    );
    expect(contactCenterText).toEqual(expectations.contactCenter);

    const meetingText = useCases.normalizeTextList(
      await useCases.getSectionTextByHeading(expectations.meetingTranscription[0])
    );
    expect(meetingText).toEqual(expectations.meetingTranscription);

    const bottomCtaText = useCases.normalizeTextList(
      await useCases.getSectionTextByAnchors([expectations.bottomCta[0]])
    );
    const bottomOnly = bottomCtaText.filter((text) =>
      expectations.bottomCta.includes(text)
    );
    expect(bottomOnly).toEqual(expectations.bottomCta);
  });
});
