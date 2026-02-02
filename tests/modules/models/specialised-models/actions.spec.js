import { test, expect } from '@playwright/test';
import { SpecialisedModelsPage } from '../../../../pages/models/specialised-models.page.js';
import { createResultWriter } from '../../../../utils/result-writer.js';

test.describe('Models - Specialised Models actions (Figma exact)', () => {
  test('Try now / Learn now visible', async ({ page }) => {
    const specialised = new SpecialisedModelsPage(page);
    await specialised.open();

    const { writeResult } = await createResultWriter({
      moduleName: 'Models',
      reportFileName: 'module-actions-report.csv',
    });

    const tryNow = page.getByRole('link', { name: 'Try now' }).first();
    await expect(tryNow).toBeVisible();

    const learnNow = page.getByRole('link', { name: 'Learn now' }).first();
    await expect(learnNow).toBeVisible();

    await writeResult('Specialised Models Actions', 'PASS', 'Try now + Learn now visible');
  });
});
