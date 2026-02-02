import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { ZeroSttCodeswitchPage } from '../../../../pages/models/zero-stt-codeswitch.page.js';

const expectationsPath = path.join(
  process.cwd(),
  'test-data',
  'expectations',
  'models-zero-stt-codeswitch.json'
);
const expectations = JSON.parse(fs.readFileSync(expectationsPath, 'utf8'));

test.describe('Models - Zero STT Codeswitch content (Figma exact)', () => {
  test('Matches exact codeswitch copy and ordering', async ({ page }) => {
    const codeswitch = new ZeroSttCodeswitchPage(page);
    await codeswitch.open();

    const heroText = codeswitch.normalizeTextList(
      await codeswitch.getSectionTextByAnchors(expectations.hero)
    );
    expect(heroText).toEqual(expectations.hero);

    const widgetText = codeswitch.normalizeTextList(
      await codeswitch.getSectionTextByAnchors(expectations.widget)
    );
    const widgetOnly = widgetText.filter((text) => expectations.widget.includes(text));
    expect(widgetOnly).toEqual(expectations.widget);

    const ctaText = codeswitch.normalizeTextList(
      await codeswitch.getSectionTextByAnchors(expectations.cta)
    );
    expect(ctaText).toEqual(expectations.cta);

    const hinglishText = codeswitch.normalizeTextList(
      await codeswitch.getSectionTextByHeading(expectations.hinglishModel[0])
    );
    expect(hinglishText).toEqual(expectations.hinglishModel);

    const asrText = codeswitch.normalizeTextList(
      await codeswitch.getSectionTextByHeading(expectations.asr[0])
    );
    expect(asrText).toEqual(expectations.asr);

    const bottomCtaText = codeswitch.normalizeTextList(
      await codeswitch.getSectionTextByAnchors([expectations.bottomCta[0]])
    );
    expect(bottomCtaText).toEqual(expectations.bottomCta);
  });
});
