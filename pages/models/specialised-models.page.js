import { BasePage } from '../base.page.js';

export class SpecialisedModelsPage extends BasePage {
  constructor(page) {
    super(page, {
      path: '/domain-specialisation',
      moduleLabel: 'Models',
      pageLabel: 'Specialised Models',
    });
  }
}
