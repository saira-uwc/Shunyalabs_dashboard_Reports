import { BasePage } from '../base.page.js';

export class OnDeviceModelsPage extends BasePage {
  constructor(page) {
    super(page, {
      path: '/on-device-models',
      moduleLabel: 'Models',
      pageLabel: 'On Device Models',
    });
  }
}
