import { BasePage } from '../base.page.js';

export class ContactCentersPage extends BasePage {
  constructor(page) {
    super(page, {
      path: '/contact-centers',
      moduleLabel: 'Solutions',
      pageLabel: 'Contact Centers',
    });
  }
}
