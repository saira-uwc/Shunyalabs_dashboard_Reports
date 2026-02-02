import { test, expect } from '@playwright/test';
import { BlogsPage } from '../../../../pages/resources/blogs.page.js';
import { createResultWriter } from '../../../../utils/result-writer.js';

test.describe('Resources - Blogs actions (Figma exact)', () => {
  test('Search and pagination available', async ({ page }) => {
    const blogs = new BlogsPage(page);
    await blogs.open();

    const { writeResult } = await createResultWriter({
      moduleName: 'Resources',
      reportFileName: 'module-actions-report.csv',
    });

    const searchInput = page.getByRole('textbox', { name: 'Search' }).first();
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toBeEnabled();
    await writeResult('Blogs Action - Search', 'PASS', 'Search input visible');

    const paginationButtons = page.locator('main').locator('button');
    const count = await paginationButtons.count();
    expect(count).toBeGreaterThanOrEqual(2);
    await writeResult('Blogs Action - Pagination', 'PASS', 'Pagination buttons present');
  });
});
