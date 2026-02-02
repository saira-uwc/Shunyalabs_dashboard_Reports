import { BasePage } from '../base.page.js';

export class MediaEntertainmentPage extends BasePage {
  constructor(page) {
    super(page, {
      path: '/media-entertainment',
      moduleLabel: 'Solutions',
      pageLabel: 'Media & Entertainment',
    });
  }
}
