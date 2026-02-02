import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pageRegistry } from '../test-data/page-registry.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const activePages = pageRegistry.filter((entry) => entry.status === 'active');

const toPascalCase = (value) =>
  value
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join('');

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const buildPageObjectContent = (entry) => {
  const className = `${toPascalCase(entry.slug)}Page`;
  return `import { BasePage } from '../base.page.js';

export class ${className} extends BasePage {
  constructor(page) {
    super(page, {
      path: '${entry.path}',
      moduleLabel: '${entry.moduleLabel}',
      pageLabel: '${entry.pageLabel}',
    });
  }
}
`;
};

const buildContentSpec = (entry) => {
  const className = `${toPascalCase(entry.slug)}Page`;
  return `import { test } from '@playwright/test';
import { pageRegistry } from '../../../../test-data/page-registry.js';
import { ${className} } from '../../../../pages/${entry.moduleKey}/${entry.slug}.page.js';
import { runContentSnapshotTest } from '../../../../utils/module-test-runner.js';

const pageEntry = pageRegistry.find((page) => page.slug === '${entry.slug}');

test.describe('${entry.moduleLabel} - ${entry.pageLabel} content', () => {
  test('Content snapshot', async ({ page }) => {
    const pageObject = new ${className}(page);
    await runContentSnapshotTest({ page, pageEntry, pageObject });
  });
});
`;
};

const buildCtaSpec = (entry) => {
  const className = `${toPascalCase(entry.slug)}Page`;
  return `import { test } from '@playwright/test';
import { pageRegistry } from '../../../../test-data/page-registry.js';
import { ${className} } from '../../../../pages/${entry.moduleKey}/${entry.slug}.page.js';
import { runCtaTest } from '../../../../utils/module-test-runner.js';

const pageEntry = pageRegistry.find((page) => page.slug === '${entry.slug}');

test.describe('${entry.moduleLabel} - ${entry.pageLabel} CTAs', () => {
  test('CTAs', async ({ page }) => {
    const pageObject = new ${className}(page);
    await runCtaTest({ page, pageEntry, pageObject });
  });
});
`;
};

const buildActionsSpec = (entry) => {
  const className = `${toPascalCase(entry.slug)}Page`;
  return `import { test } from '@playwright/test';
import { pageRegistry } from '../../../../test-data/page-registry.js';
import { ${className} } from '../../../../pages/${entry.moduleKey}/${entry.slug}.page.js';
import { runActionsTest } from '../../../../utils/module-test-runner.js';

const pageEntry = pageRegistry.find((page) => page.slug === '${entry.slug}');

test.describe('${entry.moduleLabel} - ${entry.pageLabel} actions', () => {
  test('Actions', async ({ page }) => {
    const pageObject = new ${className}(page);
    await runActionsTest({ page, pageEntry, pageObject });
  });
});
`;
};

for (const entry of activePages) {
  const pageDir = path.join(rootDir, 'pages', entry.moduleKey);
  ensureDir(pageDir);
  const pageObjectPath = path.join(pageDir, `${entry.slug}.page.js`);
  if (!fs.existsSync(pageObjectPath)) {
    fs.writeFileSync(pageObjectPath, buildPageObjectContent(entry));
  }

  const testDir = path.join(rootDir, 'tests', 'modules', entry.moduleKey, entry.slug);
  ensureDir(testDir);

  fs.writeFileSync(path.join(testDir, 'content.spec.js'), buildContentSpec(entry));
  fs.writeFileSync(path.join(testDir, 'cta.spec.js'), buildCtaSpec(entry));
  fs.writeFileSync(path.join(testDir, 'actions.spec.js'), buildActionsSpec(entry));
}

console.log(`Generated page objects and tests for ${activePages.length} pages.`);
