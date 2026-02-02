import { BasePage } from '../base.page.js';

export class PricingPage extends BasePage {
  constructor(page) {
    super(page, {
      path: '/pricing',
      moduleLabel: 'Pricing',
      pageLabel: 'Pricing',
    });
  }
}
