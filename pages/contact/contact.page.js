import { BasePage } from '../base.page.js';

export class ContactPage extends BasePage {
  constructor(page) {
    super(page, {
      path: '/contact',
      moduleLabel: 'Contact',
      pageLabel: 'Contact Us',
    });
  }
}
