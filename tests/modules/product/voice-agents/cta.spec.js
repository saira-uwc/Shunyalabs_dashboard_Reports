import { test, expect } from '@playwright/test';
import { VoiceAgentsPage } from '../../../../pages/product/voice-agents.page.js';
import { createResultWriter } from '../../../../utils/result-writer.js';

test.describe('Product - Voice Agents CTAs (Figma exact)', () => {
  test('CTA hrefs', async ({ page }) => {
    const voiceAgents = new VoiceAgentsPage(page);
    await voiceAgents.open();

    const { writeResult } = await createResultWriter({
      moduleName: 'Product',
      reportFileName: 'module-cta-report.csv',
    });

    const contactCta = page.getByRole('link', { name: 'Contact us' }).first();
    await expect(contactCta).toHaveAttribute('href', '/contact');
    await writeResult('Voice Agents CTA - Contact us', 'PASS', 'href=/contact');

    const bottomGetStarted = page.getByRole('link', { name: 'Get Started' }).last();
    await expect(bottomGetStarted).toHaveAttribute('href', '/pricing');
    await writeResult('Voice Agents CTA - Get Started', 'PASS', 'href=/pricing');

    const bottomContact = page.getByRole('link', { name: 'Contact Sales' }).last();
    await expect(bottomContact).toHaveAttribute('href', '/contact');
    await writeResult('Voice Agents CTA - Contact Sales', 'PASS', 'href=/contact');
  });
});
