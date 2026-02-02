import { BasePage } from '../base.page.js';

export class DeploymentPage extends BasePage {
  constructor(page) {
    super(page, {
      path: '/deployment',
      moduleLabel: 'Product',
      pageLabel: 'Deployment',
    });
  }
}
