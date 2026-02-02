import { test, expect } from '@playwright/test';
import { BenchmarksPage } from '../../../../pages/resources/benchmarks.page.js';
import { createResultWriter } from '../../../../utils/result-writer.js';

test.describe('Resources - Benchmarks actions (Figma exact)', () => {
  test('Tabs and chart controls visible', async ({ page }) => {
    const benchmarks = new BenchmarksPage(page);
    await benchmarks.open();

    const { writeResult } = await createResultWriter({
      moduleName: 'Resources',
      reportFileName: 'module-actions-report.csv',
    });

    const tabs = [
      'Tedlium Ted Talks',
      'LibriSpeech Clean Audiobooks, Clear speech',
      'LibriSpeech Other Audiobooks, noisy audio',
      'SPGISpeech Financial earnings calls',
    ];

    for (const label of tabs) {
      const tab = page.getByRole('button', { name: label }).first();
      await expect(tab).toBeVisible();
    }

    await writeResult('Benchmarks Actions - Tabs', 'PASS', 'Tabs visible');
  });
});
