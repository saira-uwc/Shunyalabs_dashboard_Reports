import { BasePage } from '../base.page.js';

export class LanguageModelsPage extends BasePage {
  constructor(page) {
    super(page, {
      path: '/language-models',
      moduleLabel: 'Models',
      pageLabel: 'Language Models',
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

      const anchorText = 'One API for 200+ languages, covering 97% of the global population';
      const anchor = Array.from(document.querySelectorAll('p'))
        .find((el) => normalize(el.textContent) === anchorText);
      const section = anchor?.closest('section') || anchor?.parentElement;
      if (!section) return [];

      return Array.from(section.querySelectorAll('button'))
        .filter((button) => isVisible(button))
        .map((button) => normalize(button.textContent))
        .filter(Boolean);
    });
  }
}
