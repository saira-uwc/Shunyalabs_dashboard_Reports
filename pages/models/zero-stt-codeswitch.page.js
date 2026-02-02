import { BasePage } from '../base.page.js';

export class ZeroSttCodeswitchPage extends BasePage {
  constructor(page) {
    super(page, {
      path: '/zero-code-switch',
      moduleLabel: 'Models',
      pageLabel: 'Zero STT Codeswitch',
    });
  }
}
