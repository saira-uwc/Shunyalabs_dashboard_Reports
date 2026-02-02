import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { ModelsPage } from '../../../../pages/product/models.page.js';

const expectationsPath = path.join(
  process.cwd(),
  'test-data',
  'expectations',
  'product-models.json'
);
const expectations = JSON.parse(fs.readFileSync(expectationsPath, 'utf8'));

test.describe('Product - Models content (Figma exact)', () => {
  test('Matches exact models copy and ordering', async ({ page }) => {
    const models = new ModelsPage(page);
    await models.open();

    const heroText = models.normalizeTextList(
      await models.getSectionTextByAnchors(expectations.hero)
    );
    expect(heroText).toEqual(expectations.hero);

    const languageText = models.normalizeTextList(
      await models.getSectionTextByHeading(expectations.languageModels[0])
    );
    expect(languageText).toEqual(expectations.languageModels);

    const specializedText = models.normalizeTextList(
      await models.getSectionTextByHeading(expectations.specializedModels[0])
    );
    expect(specializedText).toEqual(expectations.specializedModels);

    const onDeviceText = models.normalizeTextList(
      await models.getSectionTextByHeading(expectations.onDeviceModels[0])
    );
    expect(onDeviceText).toEqual(expectations.onDeviceModels);

    const bottomCtaText = models.normalizeTextList(
      await models.getSectionTextByAnchors([expectations.bottomCta[0]])
    );
    const bottomOnly = bottomCtaText.filter((text) =>
      expectations.bottomCta.includes(text)
    );
    expect(bottomOnly).toEqual(expectations.bottomCta);
  });
});
