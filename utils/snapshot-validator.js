import fs from 'fs';
import path from 'path';
import { capturePageSnapshot, normalizeSnapshot, diffSnapshots } from './page-snapshot.js';
import { createResultWriter } from './result-writer.js';

const SNAPSHOT_DIR = path.join(process.cwd(), 'test-data', 'snapshots');

function buildSnapshotPath(moduleKey, slug) {
  return path.join(SNAPSHOT_DIR, moduleKey, `${slug}.json`);
}

function formatDiff(diff) {
  const sections = ['headerNav', 'mainText', 'footerNav'];
  const messages = [];

  for (const section of sections) {
    if (!diff[section]) {
      continue;
    }
    const { index, expected, actual } = diff[section];
    messages.push(
      `${section} mismatch at index ${index}: expected "${expected ?? ''}" vs "${actual ?? ''}"`
    );
  }

  return messages.length ? messages.join(' | ') : 'Snapshot mismatch';
}

export async function validateSnapshotForPage({ page, moduleLabel, pageLabel, moduleKey, slug, path: pagePath }) {
  const { writeResult, csvFile } = await createResultWriter({
    moduleName: moduleLabel,
  });

  const snapshotPath = buildSnapshotPath(moduleKey, slug);
  if (!fs.existsSync(snapshotPath)) {
    const message = `Missing snapshot for ${moduleLabel} - ${pageLabel}. Run: npm run snapshot:pages`;
    await writeResult(`${pageLabel} snapshot`, 'FAIL', message);
    throw new Error(message);
  }

  await page.goto(pagePath, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('load').catch(() => {});
  await page.waitForTimeout(1500);

  const actual = normalizeSnapshot(await capturePageSnapshot(page));
  const expected = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));

  const diff = diffSnapshots(expected, actual);
  const hasDiff =
    diff.headerNav !== null || diff.mainText !== null || diff.footerNav !== null;

  if (hasDiff) {
    const message = formatDiff(diff);
    await writeResult(`${pageLabel} snapshot`, 'FAIL', message);
    throw new Error(message);
  }

  await writeResult(`${pageLabel} snapshot`, 'PASS', `Snapshot matches (${csvFile})`);
}
