import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { DeploymentPage } from '../../../../pages/product/deployment.page.js';

const expectationsPath = path.join(
  process.cwd(),
  'test-data',
  'expectations',
  'product-deployment.json'
);
const expectations = JSON.parse(fs.readFileSync(expectationsPath, 'utf8'));

test.describe('Product - Deployment content (Figma exact)', () => {
  test('Matches exact deployment copy and ordering', async ({ page }) => {
    const deployment = new DeploymentPage(page);
    await deployment.open();

    const heroText = deployment.normalizeTextList(
      await deployment.getSectionTextByAnchors(expectations.hero)
    );
    expect(heroText).toEqual(expectations.hero);

    const cloudText = deployment.normalizeTextList(
      await deployment.getSectionTextByHeading(expectations.cloud[0])
    );
    expect(cloudText).toEqual(expectations.cloud);

    const edgeText = deployment.normalizeTextList(
      await deployment.getSectionTextByHeading(expectations.edge[0])
    );
    expect(edgeText).toEqual(expectations.edge);

    const onPremText = deployment.normalizeTextList(
      await deployment.getSectionTextByHeading(expectations.onPremises[0])
    );
    expect(onPremText).toEqual(expectations.onPremises);

    const contactText = deployment.normalizeTextList(
      await deployment.getSectionTextByAnchors(expectations.contactCta)
    );
    expect(contactText).toEqual(expectations.contactCta);

    const bottomCtaText = deployment.normalizeTextList(
      await deployment.getSectionTextByAnchors([expectations.bottomCta[0]])
    );
    const bottomOnly = bottomCtaText.filter((text) =>
      expectations.bottomCta.includes(text)
    );
    expect(bottomOnly).toEqual(expectations.bottomCta);
  });
});
