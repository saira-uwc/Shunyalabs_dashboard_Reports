import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { ZeroSttUniversalPage } from '../../../../pages/models/zero-stt-universal.page.js';

const expectationsPath = path.join(
  process.cwd(),
  'test-data',
  'expectations',
  'models-zero-stt-universal.json'
);
const languageListPath = path.join(
  process.cwd(),
  'test-data',
  'expectations',
  'models-zero-stt-universal-language-list.json'
);

const expectations = JSON.parse(fs.readFileSync(expectationsPath, 'utf8'));
const languageList = JSON.parse(fs.readFileSync(languageListPath, 'utf8'));

test.describe('Models - Zero STT Universal content (Figma exact)', () => {
  test('Matches exact Zero STT Universal copy and ordering', async ({ page }) => {
    const universal = new ZeroSttUniversalPage(page);
    await universal.open();

    const heroText = universal.normalizeTextList(
      await universal.getSectionTextByAnchors(expectations.hero)
    );
    expect(heroText).toEqual(expectations.hero);

    const widgetText = universal.normalizeTextList(
      await universal.getSectionTextByAnchors(expectations.widget)
    );
    const widgetOnly = widgetText.filter((text) => expectations.widget.includes(text));
    expect(widgetOnly).toEqual(expectations.widget);

    const ctaText = universal.normalizeTextList(
      await universal.getSectionTextByAnchors(expectations.cta)
    );
    expect(ctaText).toEqual(expectations.cta);

    const scaleText = universal.normalizeTextList(
      await universal.getSectionTextByHeading(expectations.scale[0])
    );
    expect(scaleText).toEqual(expectations.scale);

    const languageHeaderText = universal.normalizeTextList(
      await universal.getSectionTextByAnchors(expectations.languageRegionsHeader)
    );
    expect(languageHeaderText).toEqual(expectations.languageRegionsHeader);

    const languages = universal.normalizeTextList(await universal.getLanguageButtons());
    expect(languages).toEqual(languageList);

    const bottomCtaText = universal.normalizeTextList(
      await universal.getSectionTextByAnchors([expectations.bottomCta[0]])
    );
    expect(bottomCtaText).toEqual(expectations.bottomCta);
  });
});
