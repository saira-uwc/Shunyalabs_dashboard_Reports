import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { SpecialisedModelsPage } from '../../../../pages/models/specialised-models.page.js';

const expectationsPath = path.join(
  process.cwd(),
  'test-data',
  'expectations',
  'models-specialised-models.json'
);
const expectations = JSON.parse(fs.readFileSync(expectationsPath, 'utf8'));

test.describe('Models - Specialised Models content (Figma exact)', () => {
  test('Matches exact specialised models copy and ordering', async ({ page }) => {
    const specialised = new SpecialisedModelsPage(page);
    await specialised.open();

    const heroText = specialised.normalizeTextList(
      await specialised.getSectionTextByAnchors(expectations.hero)
    );
    expect(heroText).toEqual(expectations.hero);

    const zeroMedText = specialised.normalizeTextList(
      await specialised.getSectionTextByAnchors(expectations.zeroMed)
    );
    expect(zeroMedText).toEqual(expectations.zeroMed);

    const domainText = specialised.normalizeTextList(
      await specialised.getSectionTextByHeading(expectations.domain[0])
    );
    expect(domainText).toEqual(expectations.domain);

    const medicalAsrText = specialised.normalizeTextList(
      await specialised.getSectionTextByHeading(expectations.medicalAsr[0])
    );
    expect(medicalAsrText).toEqual(expectations.medicalAsr);

    const bottomCtaText = specialised.normalizeTextList(
      await specialised.getSectionTextByAnchors([expectations.bottomCta[0]])
    );
    expect(bottomCtaText).toEqual(expectations.bottomCta);
  });
});
