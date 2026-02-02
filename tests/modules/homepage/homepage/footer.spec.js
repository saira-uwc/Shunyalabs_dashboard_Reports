import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { HomepagePage } from '../../../../pages/homepage/homepage.page.js';
import { createResultWriter } from '../../../../utils/result-writer.js';

const footerExpectationsPath = path.join(
  process.cwd(),
  'test-data',
  'expectations',
  'homepage-footer.json'
);
const footerExpectations = JSON.parse(fs.readFileSync(footerExpectationsPath, 'utf8'));

test.describe('Homepage - footer menu (Figma exact)', () => {
  test('Footer columns, follow us, copyright', async ({ page }) => {
    const homepage = new HomepagePage(page);
    await homepage.open();

    const { writeResult } = await createResultWriter({
      moduleName: 'Homepage',
      reportFileName: 'module-pages-report.csv',
    });

    const footerData = await homepage.getFooterMenuStructure();
    expect(footerData.followUs).toBe(footerExpectations.followUs);
    expect(footerData.copyright).toBe(footerExpectations.copyright);

    const expectedColumns = footerExpectations.columns;
    const actualColumns = footerData.columns;

    expect(Object.keys(actualColumns)).toEqual(Object.keys(expectedColumns));

    for (const [heading, items] of Object.entries(expectedColumns)) {
      expect(actualColumns[heading]).toEqual(items);
    }

    await writeResult('Homepage Footer - menu', 'PASS', 'Footer menu matches expectations');
  });
});
