import { BasePage } from '../base.page.js';

export class HomepagePage extends BasePage {
  constructor(page) {
    super(page, {
      path: '/',
      moduleLabel: 'Homepage',
      pageLabel: 'Homepage',
    });
  }

  async getHeaderNavLabels() {
    return this.page.evaluate(() => {
      const isVisible = (element) => {
        if (!element) return false;
        const style = window.getComputedStyle(element);
        if (!style || style.visibility === 'hidden' || style.display === 'none') {
          return false;
        }
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      };

      const normalize = (value) =>
        (value || '').replace(/\s+/g, ' ').replace(/\u00a0/g, ' ').trim();

      const nav = document.querySelector('nav');
      if (!nav) return [];
      return Array.from(nav.querySelectorAll('a, button'))
        .filter((element) => isVisible(element))
        .map((element) => normalize(element.getAttribute('aria-label') || element.textContent))
        .filter(Boolean);
    });
  }

  async getHeroText() {
    return this.page.evaluate(() => {
      const normalize = (value) =>
        (value || '').replace(/\s+/g, ' ').replace(/\u00a0/g, ' ').trim();
      const h1 = document.querySelector('h1');
      const h2 = document.querySelector('h2');
      const taglineElement = Array.from(document.querySelectorAll('p, span, div'))
        .find((el) => normalize(el.textContent) === 'Built for developers. Ready for enterprises.');

      return [h1?.textContent, h2?.textContent, taglineElement?.textContent]
        .map(normalize)
        .filter(Boolean);
    });
  }

  async getSectionTextByHeading(headingText) {
    return this.page.evaluate((headingTextValue) => {
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

      const heading = Array.from(document.querySelectorAll('h1, h2, h3'))
        .find((el) => normalize(el.textContent) === headingTextValue);
      if (!heading) return [];

      const section = heading.closest('section') || heading.parentElement;
      if (!section) return [];

      return Array.from(section.querySelectorAll('h1, h2, h3, p, button, a, span'))
        .filter((element) => isVisible(element))
        .map((element) => normalize(element.textContent))
        .filter(Boolean);
    }, headingText);
  }

  async getSectionTextByAnchors(anchorTexts) {
    return this.page.evaluate((anchors) => {
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

      const findElement = (text) =>
        Array.from(document.querySelectorAll('button, a, p, span, h1, h2, h3'))
          .find((el) => normalize(el.textContent) === text);

      const anchorElements = anchors.map(findElement).filter(Boolean);
      if (anchorElements.length !== anchors.length) return [];

      let root = anchorElements[0];
      while (root) {
        if (anchorElements.every((element) => root.contains(element))) {
          break;
        }
        root = root.parentElement;
      }

      if (!root) return [];

      return Array.from(root.querySelectorAll('h1, h2, h3, p, button, a, span'))
        .filter((element) => isVisible(element))
        .map((element) => normalize(element.textContent))
        .filter(Boolean);
    }, anchorTexts);
  }

  async getLanguageRegionButtons() {
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
      const heading = Array.from(document.querySelectorAll('h1, h2, h3, p'))
        .find((el) => normalize(el.textContent) === 'Language Regions');
      const section = heading?.closest('section') || heading?.parentElement;
      if (!section) return [];
      return Array.from(section.querySelectorAll('button'))
        .filter((button) => isVisible(button))
        .map((button) => normalize(button.textContent))
        .filter(Boolean);
    });
  }

  async getFooterText() {
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
      const footer = document.querySelector('footer');
      if (!footer) return [];
      return Array.from(footer.querySelectorAll('p, a, li'))
        .filter((element) => isVisible(element))
        .map((element) => normalize(element.textContent))
        .filter(Boolean);
    });
  }

  async getNavDropdownItems(menuLabel) {
    return this.page.evaluate((menuLabelValue) => {
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

      const nav = document.querySelector('nav');
      if (!nav) return [];

      const menuButton = Array.from(nav.querySelectorAll('button')).find(
        (button) => normalize(button.textContent) === menuLabelValue
      );
      if (!menuButton) return [];

      let container = menuButton.parentElement;
      while (container && !container.querySelector('a')) {
        container = container.parentElement;
      }
      if (!container) return [];

      return Array.from(container.querySelectorAll('a'))
        .filter((link) => isVisible(link))
        .map((link) => {
          const parts = (link.innerText || link.textContent || '')
            .split('\n')
            .map((part) => normalize(part))
            .filter(Boolean);
          return {
            label: parts[0] || '',
            description: parts.slice(1).join(' '),
            href: link.getAttribute('href') || '',
          };
        })
        .filter((item) => item.label && item.description);
    }, menuLabel);
  }

  async getFooterMenuStructure() {
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

      const footer = document.querySelector('footer');
      if (!footer) return { columns: {}, followUs: '', copyright: '' };

      const columns = {};
      const headings = Array.from(footer.querySelectorAll('p'))
        .filter((el) => isVisible(el))
        .map((el) => ({ element: el, text: normalize(el.textContent) }))
        .filter((item) => item.text.length > 0);

      for (const heading of headings) {
        const parent = heading.element.parentElement;
        if (!parent) continue;
        const list = parent.querySelector('ul');
        if (list) {
          const items = Array.from(list.querySelectorAll('a, li'))
            .filter((el) => isVisible(el))
            .map((el) => normalize(el.textContent))
            .filter(Boolean);
          if (items.length) {
            columns[heading.text] = items;
          }
        }
      }

      const docLink = footer.querySelector('a[href="/documentation/batch-transcriptions/quickstart"]');
      if (docLink && isVisible(docLink)) {
        const label = normalize(docLink.textContent);
        if (label) {
          columns[label] = [label];
        }
      }

      const aboutLink = footer.querySelector('a[href="/about"]');
      if (aboutLink && isVisible(aboutLink)) {
        const label = normalize(aboutLink.textContent);
        if (label) {
          columns[label] = [label];
        }
      }

      const pricingLink = footer.querySelector('a[href="/pricing"]');
      if (pricingLink && isVisible(pricingLink)) {
        const label = normalize(pricingLink.textContent);
        if (label) {
          columns[label] = [label];
        }
      }

      const followUs = Array.from(footer.querySelectorAll('p'))
        .map((el) => normalize(el.textContent))
        .find((text) => text.toLowerCase() === 'follow us on') || '';

      const copyright = Array.from(footer.querySelectorAll('p'))
        .map((el) => normalize(el.textContent))
        .find((text) => text.startsWith('©')) || '';

      return { columns, followUs, copyright };
    });
  }
}
