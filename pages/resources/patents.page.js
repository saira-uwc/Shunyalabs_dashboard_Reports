import { BasePage } from '../base.page.js';

export class PatentsPage extends BasePage {
  constructor(page) {
    super(page, {
      path: '/patents',
      moduleLabel: 'Resources',
      pageLabel: 'Patents',
    });
  }
}
