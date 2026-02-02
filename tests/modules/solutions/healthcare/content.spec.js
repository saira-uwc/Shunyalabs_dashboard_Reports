import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { HealthcarePage } from '../../../../pages/solutions/healthcare.page.js';

const expectationsPath = path.join(
  process.cwd(),
  'test-data',
  'expectations',
  'solutions-healthcare.json'
);
const expectations = JSON.parse(fs.readFileSync(expectationsPath, 'utf8'));

test.describe('Solutions - Healthcare content (Figma exact)', () => {
  test('Matches exact healthcare copy and ordering', async ({ page }) => {
    const healthcare = new HealthcarePage(page);
    await healthcare.open();

    const heroText = healthcare.normalizeTextList(
      await healthcare.getSectionTextByAnchors(expectations.hero)
    );
    expect(heroText).toEqual(expectations.hero);

    const captureText = healthcare.normalizeTextList(
      await healthcare.getSectionTextByHeading(expectations.capture[0])
    );
    expect(captureText).toEqual(expectations.capture);

    const emrText = healthcare.normalizeTextList(
      await healthcare.getSectionTextByHeading(expectations.emr[0])
    );
    expect(emrText).toEqual(expectations.emr);

    const virtualCareText = healthcare.normalizeTextList(
      await healthcare.getSectionTextByHeading(expectations.virtualCare[0])
    );
    expect(virtualCareText).toEqual(expectations.virtualCare);

    const bottomCtaText = healthcare.normalizeTextList(
      await healthcare.getSectionTextByAnchors([expectations.bottomCta[0]])
    );
    expect(bottomCtaText).toEqual(expectations.bottomCta);
  });
});
