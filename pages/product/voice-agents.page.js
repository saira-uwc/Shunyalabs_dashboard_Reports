import { BasePage } from '../base.page.js';

export class VoiceAgentsPage extends BasePage {
  constructor(page) {
    super(page, {
      path: '/voice-agent',
      moduleLabel: 'Product',
      pageLabel: 'Voice Agents',
    });
  }
}
