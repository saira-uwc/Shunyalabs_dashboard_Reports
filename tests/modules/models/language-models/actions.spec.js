import { test, expect } from '@playwright/test';
import { LanguageModelsPage } from '../../../../pages/models/language-models.page.js';
import { createResultWriter } from '../../../../utils/result-writer.js';

test.describe('Models - Language Models actions (Figma exact)', () => {
  test('Try now links visible', async ({ page }) => {
    const models = new LanguageModelsPage(page);
    await models.open();

    const { writeResult } = await createResultWriter({
      moduleName: 'Models',
      reportFileName: 'module-actions-report.csv',
    });

    const tryNowLinks = page.getByRole('link', { name: 'Try now' });
    const count = await tryNowLinks.count();
    expect(count).toBe(2);
    await writeResult('Language Models Actions - Try now', 'PASS', '2 links visible');
  });
});
