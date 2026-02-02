import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { ContactCentersPage } from '../../../../pages/solutions/contact-centers.page.js';

const expectationsPath = path.join(
  process.cwd(),
  'test-data',
  'expectations',
  'solutions-contact-centers.json'
);
const expectations = JSON.parse(fs.readFileSync(expectationsPath, 'utf8'));

test.describe('Solutions - Contact Centers content (Figma exact)', () => {
  test('Matches exact contact centers copy and ordering', async ({ page }) => {
    const contactCenters = new ContactCentersPage(page);
    await contactCenters.open();

    const heroText = contactCenters.normalizeTextList(
      await contactCenters.getSectionTextByAnchors(expectations.hero)
    );
    expect(heroText).toEqual(expectations.hero);

    const supportText = contactCenters.normalizeTextList(
      await contactCenters.getSectionTextByHeading(expectations.supportInfra[0])
    );
    expect(supportText).toEqual(expectations.supportInfra);

    const csatText = contactCenters.normalizeTextList(
      await contactCenters.getSectionTextByHeading(expectations.csat[0])
    );
    expect(csatText).toEqual(expectations.csat);

    const postCallText = contactCenters.normalizeTextList(
      await contactCenters.getSectionTextByHeading(expectations.postCall[0])
    );
    expect(postCallText).toEqual(expectations.postCall);

    const bottomCtaText = contactCenters.normalizeTextList(
      await contactCenters.getSectionTextByAnchors([expectations.bottomCta[0]])
    );
    expect(bottomCtaText).toEqual(expectations.bottomCta);
  });
});
