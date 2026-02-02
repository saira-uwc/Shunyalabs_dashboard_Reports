import { BasePage } from '../base.page.js';

export class ModelsPage extends BasePage {
  constructor(page) {
    super(page, {
      path: '/models-page',
      moduleLabel: 'Product',
      pageLabel: 'Models',
    });
  }
}
