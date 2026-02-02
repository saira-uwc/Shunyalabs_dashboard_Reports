import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { pageRegistry } from '../../test-data/page-registry.js';
import { capturePageSnapshot, normalizeSnapshot } from '../../utils/page-snapshot.js';

const SNAPSHOT_DIR = path.join(process.cwd(), 'test-data', 'snapshots');

test.describe('Generate page content snapshots', () => {
  test.setTimeout(120000);

  for (const pageEntry of pageRegistry) {
    if (pageEntry.status !== 'active') {
      continue;
    }

    test(`snapshot ${pageEntry.moduleLabel} - ${pageEntry.pageLabel}`, async ({ page }) => {
      await page.goto(pageEntry.path, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('load').catch(() => {});
      await page.waitForTimeout(1500);

      const snapshot = normalizeSnapshot(await capturePageSnapshot(page));
      const moduleDir = path.join(SNAPSHOT_DIR, pageEntry.moduleKey);
      const snapshotPath = path.join(moduleDir, `${pageEntry.slug}.json`);

      if (!fs.existsSync(moduleDir)) {
        fs.mkdirSync(moduleDir, { recursive: true });
      }

      fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2));
    });
  }
});
