import { BasePage } from '../base.page.js';

export class BlogsPage extends BasePage {
  constructor(page) {
    super(page, {
      path: '/blog',
      moduleLabel: 'Resources',
      pageLabel: 'Blogs',
    });
  }

  async getFeaturedPost() {
    return this.page.evaluate(() => {
      const normalize = (value) =>
        (value || '').replace(/\s+/g, ' ').replace(/\u00a0/g, ' ').trim();
      const featuredLink = Array.from(document.querySelectorAll('a[href^="/blog/"]'))
        .find((link) => link.querySelector('h2'));
      if (!featuredLink) return null;

      const date = Array.from(featuredLink.querySelectorAll('div, span'))
        .map((el) => normalize(el.textContent))
        .find((text) => /\d{2}\s\w{3}\s\d{4}/.test(text)) || '';
      const title = normalize(featuredLink.querySelector('h2')?.textContent);
      const excerpt = normalize(featuredLink.querySelector('p')?.textContent);
      const tag = Array.from(featuredLink.querySelectorAll('div, span'))
        .map((el) => normalize(el.textContent))
        .find((text) => text === 'Product' || text === 'Build & Learn' || text === 'AI Trends' || text === 'Use cases') || '';
      const author = Array.from(featuredLink.querySelectorAll('p'))
        .map((el) => normalize(el.textContent))
        .find((text) => text && text !== excerpt) || '';

      return {
        date,
        title,
        excerpt,
        tag,
        author,
        href: featuredLink.getAttribute('href') || ''
      };
    });
  }

  async getTopicButtons() {
    return this.page.evaluate(() => {
      const normalize = (value) =>
        (value || '').replace(/\s+/g, ' ').replace(/\u00a0/g, ' ').trim();
      const topicsHeading = Array.from(document.querySelectorAll('h2'))
        .find((el) => normalize(el.textContent) === 'Topics');
      const container = topicsHeading?.parentElement;
      if (!container) return [];
      return Array.from(container.querySelectorAll('button'))
        .map((button) => normalize(button.textContent))
        .filter(Boolean);
    });
  }

  async getPostCards() {
    return this.page.evaluate(() => {
      const normalize = (value) =>
        (value || '').replace(/\s+/g, ' ').replace(/\u00a0/g, ' ').trim();
      const cards = Array.from(document.querySelectorAll('main a[href^="/blog/"]'));
      return cards.map((card) => {
        const info = card.querySelector('div');
        const title = normalize(card.querySelector('h3')?.textContent);
        const date = normalize(card.querySelector('p')?.textContent);
        const category = info
          ? normalize(
              Array.from(info.childNodes)
                .map((node) => normalize(node.textContent))
                .find((text) => text && text !== title && text !== date)
            )
          : '';
        return {
          category,
          title,
          date,
          href: card.getAttribute('href') || ''
        };
      });
    });
  }
}
