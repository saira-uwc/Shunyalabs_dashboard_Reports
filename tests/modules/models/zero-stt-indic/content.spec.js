import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { ZeroSttIndicPage } from '../../../../pages/models/zero-stt-indic.page.js';

const expectationsPath = path.join(
  process.cwd(),
  'test-data',
  'expectations',
  'models-zero-stt-indic.json'
);
const expectations = JSON.parse(fs.readFileSync(expectationsPath, 'utf8'));

test.describe('Models - Zero STT Indic content (Figma exact)', () => {
  test('Matches exact Zero STT Indic copy and ordering', async ({ page }) => {
    const zeroIndic = new ZeroSttIndicPage(page);
    await zeroIndic.open();

    const heroText = zeroIndic.normalizeTextList(
      await zeroIndic.getSectionTextByAnchors(expectations.hero)
    );
    expect(heroText).toEqual(expectations.hero);

    const hindiText = zeroIndic.normalizeTextList(
      await zeroIndic.getSectionTextByAnchors(expectations.hindi)
    );
    expect(hindiText).toEqual(expectations.hindi);

    const teluguText = zeroIndic.normalizeTextList(
      await zeroIndic.getSectionTextByAnchors(expectations.telugu)
    );
    expect(teluguText).toEqual(expectations.telugu);

    const kannadaText = zeroIndic.normalizeTextList(
      await zeroIndic.getSectionTextByAnchors(expectations.kannada)
    );
    expect(kannadaText).toEqual(expectations.kannada);

    const bengaliText = zeroIndic.normalizeTextList(
      await zeroIndic.getSectionTextByAnchors(expectations.bengali)
    );
    expect(bengaliText).toEqual(expectations.bengali);

    const ctaText = zeroIndic.normalizeTextList(
      await zeroIndic.getSectionTextByAnchors(expectations.cta)
    );
    expect(ctaText).toEqual(expectations.cta);

    const bottomCtaText = zeroIndic.normalizeTextList(
      await zeroIndic.getSectionTextByAnchors([expectations.bottomCta[0]])
    );
    expect(bottomCtaText).toEqual(expectations.bottomCta);
  });
});
