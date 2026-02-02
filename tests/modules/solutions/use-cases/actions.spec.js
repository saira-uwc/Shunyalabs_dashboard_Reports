import { test, expect } from '@playwright/test';
import { UseCasesPage } from '../../../../pages/solutions/use-cases.page.js';
import { createResultWriter } from '../../../../utils/result-writer.js';

test.describe('Solutions - Use Cases actions (Figma exact)', () => {
  test('Learn more CTAs visible', async ({ page }) => {
    const useCases = new UseCasesPage(page);
    await useCases.open();

    const { writeResult } = await createResultWriter({
      moduleName: 'Solutions',
      reportFileName: 'module-actions-report.csv',
    });

    const learnMoreLinks = page.getByRole('link', { name: 'Learn more →' });
    const count = await learnMoreLinks.count();
    expect(count).toBe(4);
    await writeResult('Use Cases Actions - Learn more', 'PASS', '4 CTA links visible');
  });
});
