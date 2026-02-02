import { BasePage } from '../base.page.js';

export class ZeroSttMedPage extends BasePage {
  constructor(page) {
    super(page, {
      path: '/zero-med',
      moduleLabel: 'Models',
      pageLabel: 'Zero STT Med',
    });
  }
}
