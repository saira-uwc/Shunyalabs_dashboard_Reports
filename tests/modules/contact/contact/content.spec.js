import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { ContactPage } from '../../../../pages/contact/contact.page.js';

const expectationsPath = path.join(process.cwd(), 'test-data', 'expectations', 'contact.json');
const expectations = JSON.parse(fs.readFileSync(expectationsPath, 'utf8'));

test.describe('Contact - Contact Us content (Figma exact)', () => {
  test('Matches exact contact copy and ordering', async ({ page }) => {
    const contact = new ContactPage(page);
    await contact.open();

    const heroText = contact.normalizeTextList(
      await contact.getSectionTextByAnchors(expectations.hero)
    );
    expect(heroText).toEqual(expectations.hero);

    const officesText = contact.normalizeTextList(
      await contact.getSectionTextByHeading(expectations.offices[0])
    );
    const officesOnly = officesText.filter((text) => expectations.offices.includes(text));
    expect(officesOnly).toEqual(expectations.offices);

    const formText = contact.normalizeTextList(
      await contact.getSectionTextByAnchors(expectations.form)
    );
    expect(formText).toEqual(expectations.form);
  });
});
