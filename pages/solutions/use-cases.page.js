import { BasePage } from '../base.page.js';

export class UseCasesPage extends BasePage {
  constructor(page) {
    super(page, {
      path: '/use-cases',
      moduleLabel: 'Solutions',
      pageLabel: 'Use Cases',
    });
  }
}
