import { BasePage } from '../base.page.js';

export class OverviewPage extends BasePage {
  constructor(page) {
    super(page, {
      path: '/overview',
      moduleLabel: 'Product',
      pageLabel: 'Overview',
    });
  }

  async getHeroText() {
    return this.page.evaluate(() => {
      const normalize = (value) =>
        (value || '').replace(/\s+/g, ' ').replace(/\u00a0/g, ' ').trim();
      const headings = Array.from(document.querySelectorAll('h1'))
        .map((el) => normalize(el.textContent))
        .filter(Boolean);
      const labels = Array.from(document.querySelectorAll('div, span, p'))
        .map((el) => normalize(el.textContent))
        .filter((text) => text === 'BUILT FOR' || text === 'READY FOR' || text === 'Developers' || text === 'Enterprises');

      return [...headings, ...labels];
    });
  }
}
