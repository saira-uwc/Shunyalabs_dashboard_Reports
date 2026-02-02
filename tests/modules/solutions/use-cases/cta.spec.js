import { test, expect } from '@playwright/test';
import { UseCasesPage } from '../../../../pages/solutions/use-cases.page.js';
import { createResultWriter } from '../../../../utils/result-writer.js';

test.describe('Solutions - Use Cases CTAs (Figma exact)', () => {
  test('CTA hrefs', async ({ page }) => {
    const useCases = new UseCasesPage(page);
    await useCases.open();

    const { writeResult } = await createResultWriter({
      moduleName: 'Solutions',
      reportFileName: 'module-cta-report.csv',
    });

    const voiceAgents = page.getByRole('link', { name: 'Learn more →' }).nth(0);
    await expect(voiceAgents).toHaveAttribute('href', '/voice-agent');
    await writeResult('Use Cases CTA - Voice Agents', 'PASS', 'href=/voice-agent');

    const medical = page.getByRole('link', { name: 'Learn more →' }).nth(1);
    await expect(medical).toHaveAttribute('href', '/healthcare');
    await writeResult('Use Cases CTA - Medical Documentation', 'PASS', 'href=/healthcare');

    const contactCenter = page.getByRole('link', { name: 'Learn more →' }).nth(2);
    await expect(contactCenter).toHaveAttribute('href', '/contact-centers');
    await writeResult('Use Cases CTA - Contact Center', 'PASS', 'href=/contact-centers');

    const meeting = page.getByRole('link', { name: 'Learn more →' }).nth(3);
    await expect(meeting).toHaveAttribute('href', '/contact');
    await writeResult('Use Cases CTA - Meeting Transcription', 'PASS', 'href=/contact');

    const bottomGetStarted = page.getByRole('link', { name: 'Get Started' }).last();
    await expect(bottomGetStarted).toHaveAttribute('href', '/pricing');
    await writeResult('Use Cases CTA - Get Started', 'PASS', 'href=/pricing');

    const bottomContact = page.getByRole('link', { name: 'Contact Sales' }).last();
    await expect(bottomContact).toHaveAttribute('href', '/contact');
    await writeResult('Use Cases CTA - Contact Sales', 'PASS', 'href=/contact');
  });
});
