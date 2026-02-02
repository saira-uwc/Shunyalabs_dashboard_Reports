import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { HomepagePage } from '../../../../pages/homepage/homepage.page.js';
import { createResultWriter } from '../../../../utils/result-writer.js';

const expectationsPath = path.join(
  process.cwd(),
  'test-data',
  'expectations',
  'homepage.json'
);
const expectations = JSON.parse(fs.readFileSync(expectationsPath, 'utf8'));

test.describe('Homepage - widget (Figma exact)', () => {
  test('Widget content and actions', async ({ page }) => {
    const homepage = new HomepagePage(page);
    await homepage.open();

    const { writeResult } = await createResultWriter({
      moduleName: 'Homepage',
      reportFileName: 'module-actions-report.csv',
    });

    const widgetText = homepage.normalizeTextList(
      await homepage.getSectionTextByAnchors(expectations.playground)
    );
    expect(widgetText).toEqual(expectations.playground);
    await writeResult('Homepage Widget - content', 'PASS', 'Widget copy matches expectations');

    const widgetButtons = [
      'Speech To Text',
      'Medical Transcription',
      'Customer Support Call',
      'Podcast',
      'Upload your file',
      'Start Speaking',
      'Play audio',
    ];

    for (const label of widgetButtons) {
      const button = page.getByRole('button', { name: label }).first();
      await expect(button).toBeEnabled();
      await writeResult(`Homepage Widget - ${label}`, 'PASS', 'Button enabled');
    }

    const copyButton = page.getByRole('button', { name: 'No conversation to copy' }).first();
    await expect(copyButton).toBeDisabled();
    await writeResult('Homepage Widget - No conversation to copy', 'PASS', 'Button disabled as expected');
  });
});
