import { BasePage } from '../base.page.js';

export class AudioProcessingPage extends BasePage {
  constructor(page) {
    super(page, {
      path: '/audio-processing',
      moduleLabel: 'Product',
      pageLabel: 'Audio Processing',
    });
  }
}
