import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { LanguageModelsPage } from '../../../../pages/models/language-models.page.js';

const expectationsPath = path.join(
  process.cwd(),
  'test-data',
  'expectations',
  'models-language-models.json'
);
const languageListPath = path.join(
  process.cwd(),
  'test-data',
  'expectations',
  'models-language-models-language-list.json'
);

const expectations = JSON.parse(fs.readFileSync(expectationsPath, 'utf8'));
const languageList = JSON.parse(fs.readFileSync(languageListPath, 'utf8'));

test.describe('Models - Language Models content (Figma exact)', () => {
  test('Matches exact language models copy and ordering', async ({ page }) => {
    const models = new LanguageModelsPage(page);
    await models.open();

    const heroText = models.normalizeTextList(
      await models.getSectionTextByAnchors(expectations.hero)
    );
    expect(heroText).toEqual(expectations.hero);

    const cardsText = models.normalizeTextList(
      await models.getSectionTextByAnchors(expectations.cards)
    );
    const cardsOnly = cardsText.filter((text) => expectations.cards.includes(text));
    expect(cardsOnly).toEqual(expectations.cards);

    const codeSwitchText = models.normalizeTextList(
      await models.getSectionTextByHeading(expectations.codeSwitch[0])
    );
    expect(codeSwitchText).toEqual(expectations.codeSwitch);

    const indicText = models.normalizeTextList(
      await models.getSectionTextByHeading(expectations.indic[0])
    );
    expect(indicText).toEqual(expectations.indic);

    const globalText = models.normalizeTextList(
      await models.getSectionTextByAnchors(expectations.globalCoverage)
    );
    expect(globalText).toEqual(expectations.globalCoverage);

    const languages = models.normalizeTextList(await models.getLanguageButtons());
    expect(languages).toEqual(languageList);

    const bottomCtaText = models.normalizeTextList(
      await models.getSectionTextByAnchors([expectations.bottomCta[0]])
    );
    const bottomOnly = bottomCtaText.filter((text) =>
      expectations.bottomCta.includes(text)
    );
    expect(bottomOnly).toEqual(expectations.bottomCta);
  });
});
