import { BasePage } from '../base.page.js';

export class ZeroSttIndicPage extends BasePage {
  constructor(page) {
    super(page, {
      path: '/zero-indic',
      moduleLabel: 'Models',
      pageLabel: 'Zero STT Indic',
    });
  }
}
