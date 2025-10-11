const site = require('../_data/site.json');

const supportedLangs = Object.keys(site.languages || {});
const defaultLang = site.defaultLang || 'zh';

function detectLang(filePath) {
  if (!filePath) return defaultLang;
  const normalized = filePath.replace(/\\+/g, '/');
  const segments = normalized.split('/');
  const index = segments.lastIndexOf('articles');
  if (index !== -1) {
    const candidate = segments[index + 1];
    if (supportedLangs.includes(candidate)) {
      return candidate;
    }
  }
  return defaultLang;
}

module.exports = {
  layout: 'layouts/article.njk',
  eleventyComputed: {
    lang: (data) => {
      const filePath = data.page && data.page.inputPath;
      const derived = detectLang(filePath);
      return data.lang || derived || defaultLang;
    },
    langLinks: (data) => {
      const page = data.page || {};
      const inputPath = page.inputPath;
      if (!inputPath) return null;

      const normalized = inputPath.replace(/\\+/g, '/');
      const segments = normalized.split('/').filter(Boolean);
      const index = segments.lastIndexOf('articles');
      if (index === -1 || index + 2 >= segments.length) return null;

      const slugSegments = segments.slice(index + 2);
      const rawSlug = slugSegments.join('/');
      const slugPath = rawSlug.replace(/\.[^/.]+$/, '');
      if (!slugPath) return null;

      return supportedLangs.reduce((acc, lang) => {
        acc[lang] = `/articles/${lang}/${slugPath}/`;
        return acc;
      }, {});
    }
  }
};
