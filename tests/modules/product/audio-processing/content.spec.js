import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { AudioProcessingPage } from '../../../../pages/product/audio-processing.page.js';

const expectationsPath = path.join(
  process.cwd(),
  'test-data',
  'expectations',
  'product-audio-processing.json'
);
const expectations = JSON.parse(fs.readFileSync(expectationsPath, 'utf8'));

test.describe('Product - Audio Processing content (Figma exact)', () => {
  test('Matches exact audio processing copy and ordering', async ({ page }) => {
    const audio = new AudioProcessingPage(page);
    await audio.open();

    const heroText = audio.normalizeTextList(
      await audio.getSectionTextByAnchors(expectations.hero)
    );
    expect(heroText).toEqual(expectations.hero);

    const denoiserText = audio.normalizeTextList(
      await audio.getSectionTextByHeading(expectations.denoiser[0])
    );
    expect(denoiserText).toEqual(expectations.denoiser);

    const enhancementText = audio.normalizeTextList(
      await audio.getSectionTextByHeading(expectations.enhancement[0])
    );
    expect(enhancementText).toEqual(expectations.enhancement);

    const contactText = audio.normalizeTextList(
      await audio.getSectionTextByAnchors(expectations.contactCta)
    );
    expect(contactText).toEqual(expectations.contactCta);

    const bottomCtaText = audio.normalizeTextList(
      await audio.getSectionTextByAnchors([expectations.bottomCta[0]])
    );
    const bottomOnly = bottomCtaText.filter((text) =>
      expectations.bottomCta.includes(text)
    );
    expect(bottomOnly).toEqual(expectations.bottomCta);
  });
});
