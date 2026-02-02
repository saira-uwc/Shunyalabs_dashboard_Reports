export class BasePage {
  constructor(page, { path, moduleLabel, pageLabel }) {
    this.page = page;
    this.path = path;
    this.moduleLabel = moduleLabel;
    this.pageLabel = pageLabel;
  }

  async open() {
    await this.page.goto(this.path, { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('load').catch(() => {});
    await this.page.waitForTimeout(1500);
  }

  async getMainCTAs() {
    return this.page.evaluate(() => {
      const cssEscape = (value) => {
        if (window.CSS && window.CSS.escape) {
          return window.CSS.escape(value);
        }
        return value.replace(/[^a-zA-Z0-9_-]/g, '\\$&');
      };

      const buildSelector = (element) => {
        if (!element || !element.tagName) return '';
        if (element.id) return `#${cssEscape(element.id)}`;

        const parts = [];
        let current = element;
        while (current && current.nodeType === Node.ELEMENT_NODE) {
          let selector = current.tagName.toLowerCase();
          if (current.id) {
            selector += `#${cssEscape(current.id)}`;
            parts.unshift(selector);
            break;
          }
          let index = 1;
          let sibling = current;
          while ((sibling = sibling.previousElementSibling)) {
            if (sibling.tagName === current.tagName) index += 1;
          }
          selector += `:nth-of-type(${index})`;
          parts.unshift(selector);
          current = current.parentElement;
        }

        return parts.join(' > ');
      };

      const isVisible = (element) => {
        if (!element) return false;
        const style = window.getComputedStyle(element);
        if (!style || style.visibility === 'hidden' || style.display === 'none') {
          return false;
        }
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      };

      const normalizeLabel = (element) => {
        const label =
          element.getAttribute('aria-label') ||
          element.getAttribute('title') ||
          element.innerText ||
          element.textContent ||
          '';
        return label.replace(/\s+/g, ' ').trim();
      };

      const isDropdownTrigger = (element) => {
        const role = (element.getAttribute('role') || '').toLowerCase();
        if (role === 'combobox' || role === 'menuitem' || role === 'option') return true;
        if (element.hasAttribute('aria-haspopup')) return true;
        if (element.hasAttribute('aria-expanded')) return true;
        return !!element.closest('[role="menu"], [role="listbox"], [role="combobox"]');
      };

      const isNavigationalHref = (href) => {
        if (!href) return false;
        const trimmed = href.trim();
        if (!trimmed) return false;
        if (trimmed.startsWith('#')) return false;
        if (trimmed.toLowerCase().startsWith('javascript:')) return false;
        return true;
      };

      const main = document.querySelector('main') || document.body;
      const elements = Array.from(main.querySelectorAll('a, button'))
        .filter((element) => isVisible(element))
        .map((element) => {
          const tagName = element.tagName.toLowerCase();
          const label = normalizeLabel(element);
          if (!label) return null;

          if (tagName === 'a') {
            const href = element.getAttribute('href') || '';
            if (!isNavigationalHref(href)) return null;
            return {
              tagName,
              label,
              href,
              target: element.getAttribute('target') || '',
              disabled: false,
              selector: buildSelector(element),
            };
          }

          if (isDropdownTrigger(element)) return null;

          const dataHref =
            element.getAttribute('data-href') ||
            element.getAttribute('data-url') ||
            element.getAttribute('href') ||
            '';
          const onClick = element.getAttribute('onclick') || '';
          const navigates =
            isNavigationalHref(dataHref) ||
            /window\.location|location\.href|window\.open/.test(onClick);
          if (!navigates) return null;

          return {
            tagName,
            label,
            href: dataHref,
            target: '',
            disabled: !!element.disabled,
            selector: buildSelector(element),
          };
        })
        .filter(Boolean);

      return elements;
    });
  }

  async getMainActions() {
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

      const normalizeLabel = (element) => {
        const label =
          element.getAttribute('aria-label') ||
          element.getAttribute('title') ||
          element.innerText ||
          element.textContent ||
          '';
        return label.replace(/\s+/g, ' ').trim();
      };

      const main = document.querySelector('main') || document.body;
      return Array.from(main.querySelectorAll('button'))
        .filter((element) => isVisible(element))
        .map((element) => ({
          label: normalizeLabel(element),
          disabled: !!element.disabled,
        }))
        .filter((entry) => entry.label.length > 0);
    });
  }

  normalizeTextList(list) {
    return (list || [])
      .map((value) =>
        (value || '')
          .replace(/\s+/g, ' ')
          .replace(/\u00a0/g, ' ')
          .trim()
      )
      .filter(Boolean);
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

      return Array.from(section.querySelectorAll('h1, h2, h3, h4, p, button, a, span'))
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
        Array.from(document.querySelectorAll('button, a, p, span, h1, h2, h3, h4'))
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

      return Array.from(root.querySelectorAll('h1, h2, h3, h4, p, button, a, span'))
        .filter((element) => isVisible(element))
        .map((element) => normalize(element.textContent))
        .filter(Boolean);
    }, anchorTexts);
  }
}
