/**
 * Helper utilities for Playwright tests
 */

/**
 * Smooth scroll to element with retry logic
 */
export async function scrollToElement(page, selector, options = {}) {
  const maxRetries = options.maxRetries || 3;
  const timeout = options.timeout || 5000;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const element = await page.locator(selector).first();
      await element.scrollIntoViewIfNeeded({ timeout });
      await page.waitForTimeout(500); // Wait for any animations
      return true;
    } catch (error) {
      if (i === maxRetries - 1) {
        throw new Error(`Failed to scroll to element after ${maxRetries} attempts: ${error.message}`);
      }
      await page.waitForTimeout(1000);
    }
  }
}

/**
 * Wait for element to be visible with custom timeout
 */
export async function waitForVisible(page, selector, timeout = 10000) {
  await page.waitForSelector(selector, { state: 'visible', timeout });
}

/**
 * Check if element exists without throwing
 */
export async function elementExists(page, selector) {
  try {
    const count = await page.locator(selector).count();
    return count > 0;
  } catch {
    return false;
  }
}

/**
 * Take screenshot with timestamp
 */
export async function takeScreenshot(page, name) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({ 
    path: `test-results/screenshots/${name}-${timestamp}.png`,
    fullPage: true 
  });
}
