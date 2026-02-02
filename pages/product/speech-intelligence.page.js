import { BasePage } from '../base.page.js';

export class SpeechIntelligencePage extends BasePage {
  constructor(page) {
    super(page, {
      path: '/speech-intelligence-page',
      moduleLabel: 'Product',
      pageLabel: 'Speech Intelligence',
    });
  }
}
