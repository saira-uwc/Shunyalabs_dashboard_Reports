import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { HomepagePage } from '../../../../pages/homepage/homepage.page.js';
import { createResultWriter } from '../../../../utils/result-writer.js';

const navExpectationsPath = path.join(
  process.cwd(),
  'test-data',
  'expectations',
  'homepage-nav.json'
);
const navExpectations = JSON.parse(fs.readFileSync(navExpectationsPath, 'utf8'));

test.describe('Homepage - navigation (Figma exact)', () => {
  test('Top nav dropdowns match labels, descriptions, and hrefs', async ({ page }) => {
    const homepage = new HomepagePage(page);
    await homepage.open();

    const { writeResult } = await createResultWriter({
      moduleName: 'Homepage',
      reportFileName: 'module-cta-report.csv',
    });

    const menuNames = Object.keys(navExpectations.dropdowns);

    for (const menuName of menuNames) {
      const menuButton = page.getByRole('button', { name: menuName }).first();
      await menuButton.click();

      const items = await homepage.getNavDropdownItems(menuName);
      expect(items).toEqual(navExpectations.dropdowns[menuName]);
      await writeResult(
        `Homepage Nav - ${menuName}`,
        'PASS',
        `Validated ${items.length} dropdown items`
      );

      await page.keyboard.press('Escape').catch(() => {});
    }
  });
});
