import { createResultWriter } from './result-writer.js';
import { validateSnapshotForPage } from './snapshot-validator.js';

const CTA_NAV_TIMEOUT_MS = Number(process.env.CTA_NAV_TIMEOUT_MS) || 30000;
const CTA_CLICK_TIMEOUT_MS = Number(process.env.CTA_CLICK_TIMEOUT_MS) || 10000;

function formatLabel(label) {
  return label.replace(/\s+/g, ' ').trim();
}

async function clickAndResolveUrl({ page, locator }) {
  const initialUrl = page.url();
  const navigationPromise = page
    .waitForURL((url) => url.toString() !== initialUrl, {
      timeout: CTA_NAV_TIMEOUT_MS,
      waitUntil: 'load',
    })
    .then(() => ({ url: page.url() }))
    .catch(() => null);
  const popupPromise = page
    .waitForEvent('popup', { timeout: CTA_NAV_TIMEOUT_MS })
    .then(async (popup) => {
      await popup.waitForLoadState('load').catch(() => {});
      await popup.waitForTimeout(1000);
      const url = popup.url();
      await popup.close().catch(() => {});
      return { url };
    })
    .catch(() => null);

  await locator.scrollIntoViewIfNeeded().catch(() => {});
  await locator.click({ timeout: CTA_CLICK_TIMEOUT_MS });
  const result = await Promise.race([navigationPromise, popupPromise]);
  const sameTabNavigated = page.url() !== initialUrl;
  return {
    initialUrl,
    destinationUrl: result && result.url ? result.url : '',
    sameTabNavigated,
  };
}

export async function runContentSnapshotTest({ page, pageEntry }) {
  await validateSnapshotForPage({ page, ...pageEntry });
}

export async function runCtaTest({ page, pageEntry, pageObject }) {
  const { writeResult } = await createResultWriter({
    moduleName: pageEntry.moduleLabel,
    reportFileName: 'module-cta-report.csv',
  });

  let activePage = page;
  let activePageObject = pageObject;

  await activePageObject.open();
  const ctas = await activePageObject.getMainCTAs();

  if (!ctas.length) {
    await writeResult(`${pageEntry.pageLabel} CTAs`, 'PASS', 'No CTAs found on page');
    return;
  }

  let needsReset = false;
  for (const cta of ctas) {
    if (activePage.isClosed()) {
      await writeResult(
        `${pageEntry.pageLabel} CTA - ${formatLabel(cta.label)}`,
        'FAIL',
        'Page closed before CTA could be validated'
      );
      break;
    }
    if (needsReset) {
      await activePageObject.open();
      needsReset = false;
    }
    const label = formatLabel(cta.label);
    const testPoint = `${pageEntry.pageLabel} CTA - ${label}`;
    const selector = cta.selector || '';

    if (cta.tagName === 'a') {
      if (!selector) {
        await writeResult(testPoint, 'FAIL', 'CTA selector missing for click test');
        continue;
      }

      const locator = activePage.locator(selector);
      if (!(await locator.count())) {
        await writeResult(testPoint, 'FAIL', 'CTA element not found for click test');
        continue;
      }

      try {
        const { destinationUrl, initialUrl, sameTabNavigated } = await clickAndResolveUrl({
          page: activePage,
          locator: locator.first(),
        });

        if (destinationUrl && destinationUrl !== initialUrl) {
          await writeResult(testPoint, 'PASS', `CTA navigation OK: ${destinationUrl}`);
        } else {
          await writeResult(testPoint, 'FAIL', 'CTA did not navigate to another page');
        }

        if (sameTabNavigated) {
          needsReset = true;
        }
      } catch (error) {
        await writeResult(testPoint, 'FAIL', `CTA click failed: ${error.message}`);
      }

      continue;
    }

    if (cta.disabled) {
      await writeResult(testPoint, 'FAIL', 'CTA button is disabled');
    } else {
      if (!selector) {
        await writeResult(testPoint, 'FAIL', 'CTA selector missing for click test');
        continue;
      }

      const locator = activePage.locator(selector);
      if (!(await locator.count())) {
        await writeResult(testPoint, 'FAIL', 'CTA element not found for click test');
        continue;
      }

      try {
        const { destinationUrl, initialUrl, sameTabNavigated } = await clickAndResolveUrl({
          page: activePage,
          locator: locator.first(),
        });

        if (destinationUrl && destinationUrl !== initialUrl) {
          await writeResult(testPoint, 'PASS', `CTA navigation OK: ${destinationUrl}`);
        } else {
          await writeResult(testPoint, 'FAIL', 'CTA did not navigate to another page');
        }

        if (sameTabNavigated) {
          needsReset = true;
        }
      } catch (error) {
        await writeResult(testPoint, 'FAIL', `CTA click failed: ${error.message}`);
      }
    }
  }
}

export async function runActionsTest({ page, pageEntry, pageObject }) {
  const { writeResult } = await createResultWriter({
    moduleName: pageEntry.moduleLabel,
    reportFileName: 'module-actions-report.csv',
  });

  await pageObject.open();
  const actions = await pageObject.getMainActions();

  if (!actions.length) {
    await writeResult(`${pageEntry.pageLabel} Actions`, 'PASS', 'No actions found on page');
    return;
  }

  for (const action of actions) {
    const label = formatLabel(action.label);
    const testPoint = `${pageEntry.pageLabel} Action - ${label}`;

    if (action.disabled) {
      await writeResult(testPoint, 'FAIL', 'Action button is disabled');
    } else {
      await writeResult(testPoint, 'PASS', 'Action button enabled');
    }
  }
}
