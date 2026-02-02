import { test, expect } from '@playwright/test';
import { HomepagePage } from '../../../../pages/homepage/homepage.page.js';
import { createResultWriter } from '../../../../utils/result-writer.js';

test.describe('Homepage - actions (Figma exact)', () => {
  test('Playground actions are enabled', async ({ page }) => {
    const homepage = new HomepagePage(page);
    await homepage.open();

    const { writeResult } = await createResultWriter({
      moduleName: 'Homepage',
      reportFileName: 'module-actions-report.csv',
    });

    const actionButtons = [
      'Speech To Text',
      'Medical Transcription',
      'Customer Support Call',
      'Podcast',
      'Upload your file',
      'Start Speaking',
      'Play audio',
    ];

    for (const label of actionButtons) {
      const button = page.getByRole('button', { name: label }).first();
      await expect(button).toBeEnabled();
      await writeResult(`Homepage Action - ${label}`, 'PASS', 'Button enabled');
    }

    const copyButton = page.getByRole('button', { name: 'No conversation to copy' }).first();
    await expect(copyButton).toBeDisabled();
    await writeResult('Homepage Action - No conversation to copy', 'PASS', 'Button disabled as expected');
  });
});
