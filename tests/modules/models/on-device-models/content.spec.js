import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { OnDeviceModelsPage } from '../../../../pages/models/on-device-models.page.js';

const expectationsPath = path.join(
  process.cwd(),
  'test-data',
  'expectations',
  'models-on-device-models.json'
);
const expectations = JSON.parse(fs.readFileSync(expectationsPath, 'utf8'));

test.describe('Models - On Device Models content (Figma exact)', () => {
  test('Matches exact on-device models copy and ordering', async ({ page }) => {
    const onDevice = new OnDeviceModelsPage(page);
    await onDevice.open();

    const heroText = onDevice.normalizeTextList(
      await onDevice.getSectionTextByAnchors(expectations.hero)
    );
    expect(heroText).toEqual(expectations.hero);

    const featuresText = onDevice.normalizeTextList(
      await onDevice.getSectionTextByAnchors(expectations.features)
    );
    const featuresOnly = featuresText.filter((text) => expectations.features.includes(text));
    expect(featuresOnly).toEqual(expectations.features);

    const performanceText = onDevice.normalizeTextList(
      await onDevice.getSectionTextByHeading(expectations.performance[0])
    );
    expect(performanceText).toEqual(expectations.performance);

    const contactText = onDevice.normalizeTextList(
      await onDevice.getSectionTextByAnchors(expectations.contactCta)
    );
    expect(contactText).toEqual(expectations.contactCta);

    const bottomCtaText = onDevice.normalizeTextList(
      await onDevice.getSectionTextByAnchors([expectations.bottomCta[0]])
    );
    expect(bottomCtaText).toEqual(expectations.bottomCta);
  });
});
