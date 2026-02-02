import { test, expect } from '@playwright/test';
import { HealthcarePage } from '../../../../pages/solutions/healthcare.page.js';
import { createResultWriter } from '../../../../utils/result-writer.js';

test.describe('Solutions - Healthcare actions (Figma exact)', () => {
  test('Try Now buttons enabled', async ({ page }) => {
    const healthcare = new HealthcarePage(page);
    await healthcare.open();

    const { writeResult } = await createResultWriter({
      moduleName: 'Solutions',
      reportFileName: 'module-actions-report.csv',
    });

    const tryNowButtons = page.getByRole('button', { name: 'Try Now' });
    const count = await tryNowButtons.count();
    expect(count).toBe(3);

    for (let index = 0; index < count; index += 1) {
      await expect(tryNowButtons.nth(index)).toBeEnabled();
    }

    await writeResult('Healthcare Actions - Try Now', 'PASS', '3 enabled buttons');
  });
});
