import { BasePage } from '../base.page.js';

export class ZeroSttUniversalPage extends BasePage {
  constructor(page) {
    super(page, {
      path: '/zero-stt',
      moduleLabel: 'Models',
      pageLabel: 'Zero STT Universal',
    });
  }

  async getLanguageButtons() {
    return this.page.evaluate(() => {
      const normalize = (value) =>
        (value || '').replace(/\s+/g, ' ').replace(/\u00a0/g, ' ').trim();
      const isVisible = (element) => {
        if (!element) return false;
        const style = window.getComputedStyle(element);
        if (!style || style.visibility === 'hidden' || style.display === 'none') {
          return false;
        }
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      };

      const heading = Array.from(document.querySelectorAll('p'))
        .find((el) => normalize(el.textContent) === 'Language Regions');
      const section = heading?.closest('section') || heading?.parentElement;
      if (!section) return [];

      return Array.from(section.querySelectorAll('button'))
        .filter((button) => isVisible(button))
        .map((button) => normalize(button.textContent))
        .filter(Boolean);
    });
  }
}
