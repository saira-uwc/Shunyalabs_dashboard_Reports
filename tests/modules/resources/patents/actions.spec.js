import { test, expect } from '@playwright/test';
import { PatentsPage } from '../../../../pages/resources/patents.page.js';
import { createResultWriter } from '../../../../utils/result-writer.js';

test.describe('Resources - Patents actions (Figma exact)', () => {
  test('Patent cards visible', async ({ page }) => {
    const patents = new PatentsPage(page);
    await patents.open();

    const { writeResult } = await createResultWriter({
      moduleName: 'Resources',
      reportFileName: 'module-actions-report.csv',
    });

    const titles = [
      'Translation with Clinical Precision',
      'Text to emotion vector generation',
      'LLM Hallucination Mitigation',
      'Fake information classification',
      'Clinician like Discharge Summary generation',
      'Causality driven Graph Neural Network for Mental Health Prognosis',
      'Stochastic Actor Oriented Model driven Clinician Suggestion',
      'Clinical Case History Generation',
      'Deltawave guided wearable EEG happiness Monitors',
      'Interoperable EHR Taxonomy and Data Mapper',
      'Stella for Clinician',
      'Phoneme Viseme',
    ];

    for (const title of titles) {
      await expect(page.getByText(title, { exact: true }).first()).toBeVisible();
    }

    await writeResult('Patents Actions - Cards', 'PASS', 'Patent cards visible');
  });
});
