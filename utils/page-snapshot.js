function normalizeText(value) {
  if (!value) {
    return '';
  }
  return value
    .replace(/\s+/g, ' ')
    .replace(/\u00a0/g, ' ')
    .trim();
}

function normalizeList(list) {
  return list
    .map((item) => normalizeText(item))
    .filter(Boolean);
}

export async function capturePageSnapshot(page) {
  return page.evaluate(() => {
    const isVisible = (element) => {
      if (!element) {
        return false;
      }
      const style = window.getComputedStyle(element);
      if (!style || style.visibility === 'hidden' || style.display === 'none') {
        return false;
      }
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };

    const collectText = (root, selector) => {
      if (!root) {
        return [];
      }
      return Array.from(root.querySelectorAll(selector))
        .filter((element) => isVisible(element))
        .map((element) => element.innerText || element.textContent || '')
        .filter((text) => text && text.trim().length > 0);
    };

    const nav = document.querySelector('nav');
    const footer = document.querySelector('footer');
    const main = document.querySelector('main') || document.body;

    const headerNav = collectText(nav, 'a, button');
    const footerNav = collectText(footer, 'a, button, p, li');
    const mainText = collectText(main, 'h1, h2, h3, h4, h5, h6, p, li, button, a, span');

    return {
      path: window.location.pathname,
      title: document.title,
      headerNav,
      mainText,
      footerNav,
    };
  });
}

export function normalizeSnapshot(snapshot) {
  return {
    ...snapshot,
    headerNav: normalizeList(snapshot.headerNav || []),
    mainText: normalizeList(snapshot.mainText || []),
    footerNav: normalizeList(snapshot.footerNav || []),
  };
}

export function diffSnapshots(expected, actual) {
  const diffSection = (expectedList, actualList) => {
    const maxLen = Math.max(expectedList.length, actualList.length);
    for (let index = 0; index < maxLen; index += 1) {
      if (expectedList[index] !== actualList[index]) {
        return {
          index,
          expected: expectedList[index] || null,
          actual: actualList[index] || null,
        };
      }
    }
    return null;
  };

  return {
    headerNav: diffSection(expected.headerNav, actual.headerNav),
    mainText: diffSection(expected.mainText, actual.mainText),
    footerNav: diffSection(expected.footerNav, actual.footerNav),
  };
}
