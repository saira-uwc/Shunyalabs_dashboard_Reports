import { BasePage } from '../base.page.js';

export class HealthcarePage extends BasePage {
  constructor(page) {
    super(page, {
      path: '/healthcare',
      moduleLabel: 'Solutions',
      pageLabel: 'Healthcare',
    });
  }
}
