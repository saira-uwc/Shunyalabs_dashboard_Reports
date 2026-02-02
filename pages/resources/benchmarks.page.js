import { BasePage } from '../base.page.js';

export class BenchmarksPage extends BasePage {
  constructor(page) {
    super(page, {
      path: '/benchmarks',
      moduleLabel: 'Resources',
      pageLabel: 'Benchmarks',
    });
  }
}
