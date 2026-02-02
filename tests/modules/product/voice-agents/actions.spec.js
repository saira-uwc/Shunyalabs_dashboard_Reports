import { test, expect } from '@playwright/test';
import { VoiceAgentsPage } from '../../../../pages/product/voice-agents.page.js';
import { createResultWriter } from '../../../../utils/result-writer.js';

test.describe('Product - Voice Agents actions (Figma exact)', () => {
  test('CTA button enabled states', async ({ page }) => {
    const voiceAgents = new VoiceAgentsPage(page);
    await voiceAgents.open();

    const { writeResult } = await createResultWriter({
      moduleName: 'Product',
      reportFileName: 'module-actions-report.csv',
    });

    const contactButton = page.getByRole('link', { name: 'Contact us' }).first();
    await expect(contactButton).toBeVisible();
    await writeResult('Voice Agents Action - Contact us', 'PASS', 'Link visible');
  });
});
