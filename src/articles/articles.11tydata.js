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
  eleventyComputed: {
    lang: (data) => {
      const filePath = data.page && data.page.inputPath;
      const derived = detectLang(filePath);
      return data.lang || derived || defaultLang;
    }
  }
};
