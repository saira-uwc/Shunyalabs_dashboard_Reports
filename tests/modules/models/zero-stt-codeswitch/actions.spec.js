import { test, expect } from '@playwright/test';
import { ZeroSttCodeswitchPage } from '../../../../pages/models/zero-stt-codeswitch.page.js';
import { createResultWriter } from '../../../../utils/result-writer.js';

test.describe('Models - Zero STT Codeswitch actions (Figma exact)', () => {
  test('Widget buttons enabled', async ({ page }) => {
    const codeswitch = new ZeroSttCodeswitchPage(page);
    await codeswitch.open();

    const { writeResult } = await createResultWriter({
      moduleName: 'Models',
      reportFileName: 'module-actions-report.csv',
    });

    const enabledButtons = [
      'Customer Support Call',
      'Podcast',
      'Upload your file',
      'Start Speaking',
      'Play audio',
    ];

    for (const label of enabledButtons) {
      const button = page.getByRole('button', { name: label }).first();
      await expect(button).toBeEnabled();
    }

    const disabledCopy = page.getByRole('button', { name: 'No conversation to copy' }).first();
    await expect(disabledCopy).toBeDisabled();

    await writeResult('Zero STT Codeswitch Actions - Widget', 'PASS', 'Widget actions verified');
  });
});
