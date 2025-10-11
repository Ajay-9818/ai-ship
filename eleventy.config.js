const path = require('path');
const markdownIt = require('markdown-it');
const SUPPORTED_LANGS = ['zh', 'en', 'jp'];
const siteData = require('./src/_data/site.json');

function resolveToolIcon(slug) {
  try {
    const icons = require('./src/_data/toolIcons');
    const entry = icons[slug] || icons.__default;
    return entry?.symbolId || 'icon-generic';
  } catch (error) {
    return 'icon-generic';
  }
}

function translate(key, lang = 'zh') {
  try {
    const dict = require('./src/_data/i18n.json');
    const target = dict[lang] || dict.zh || {};
    return target[key] !== undefined ? target[key] : key;
  } catch (error) {
    return key;
  }
}

module.exports = function (eleventyConfig) {
  // Copy static assets (such as generated sprite) directly to the output
  eleventyConfig.addPassthroughCopy({
    'src/static': '.'
  });

  eleventyConfig.addWatchTarget('src/css/**/*.css');
  eleventyConfig.addWatchTarget('src/static/assets/**/*.css');
  eleventyConfig.addWatchTarget('src/js/**/*.js');
  eleventyConfig.addWatchTarget('src/static/assets/**/*.js');

  eleventyConfig.addFilter('readableDate', (value, locale = 'zh-CN') => {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  });

  eleventyConfig.addFilter('dateIso', (value) => {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    return date.toISOString();
  });

  eleventyConfig.addFilter('year', (value) => {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    return date.getFullYear();
  });

  eleventyConfig.addFilter('t', (key, lang = 'zh') => translate(key, lang));
  eleventyConfig.addFilter('toolIcon', (slug) => resolveToolIcon(slug));
  eleventyConfig.addFilter('dateYMD', (value) => {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 10);
  });
  eleventyConfig.addFilter('absoluteUrl', (pathValue, baseValue) => {
    if (!pathValue) return '';
    const base = baseValue || siteData.url || '';
    if (!base) return pathValue;
    try {
      return new URL(pathValue, base).toString();
    } catch (error) {
      return pathValue;
    }
  });

  eleventyConfig.setLibrary('md', markdownIt({
    html: true,
    linkify: true,
    typographer: true
  }));

  eleventyConfig.addShortcode('paginationNav', (pagination, lang = 'zh') => {
    if (!pagination) return '';
    const { pages = [], pageNumber = 0, hrefs = [] } = pagination;
    const total = pages.length;
    const items = pages
      .map((page, index) => {
        const isCurrent = index === pageNumber;
        const href = hrefs[index];
        return `<li><a href="${href}"${isCurrent ? ' aria-current="page" class="is-active"' : ''}>${index + 1}</a></li>`;
      })
      .join('');

    const prevLabel = translate('pagination.prev', lang);
    const nextLabel = translate('pagination.next', lang);
    const prev = pageNumber > 0 ? `<a class="prev" href="${hrefs[pageNumber - 1]}">${prevLabel}</a>` : `<span class="prev is-disabled">${prevLabel}</span>`;
    const next = pageNumber < total - 1 ? `<a class="next" href="${hrefs[pageNumber + 1]}">${nextLabel}</a>` : `<span class="next is-disabled">${nextLabel}</span>`;

    const ariaLabel = translate('pagination.nav', lang);
    return `<nav class="pagination" aria-label="${ariaLabel}">${prev}<ol>${items}</ol>${next}</nav>`;
  });

  const createCasesCollection = (collectionApi, lang) => {
    return collectionApi
      .getFilteredByGlob('src/articles/**/*.md')
      .filter((item) => (lang ? item.data.lang === lang : !item.data.lang || item.data.lang === 'zh'))
      .sort((a, b) => (b.date || 0) - (a.date || 0));
  };

  eleventyConfig.addCollection('cases', (collectionApi) => createCasesCollection(collectionApi, 'zh'));
  eleventyConfig.addCollection('cases_en', (collectionApi) => createCasesCollection(collectionApi, 'en'));
  eleventyConfig.addCollection('cases_jp', (collectionApi) => createCasesCollection(collectionApi, 'jp'));

  eleventyConfig.addGlobalData('buildTime', new Date());
  eleventyConfig.addGlobalData('supportedLangs', SUPPORTED_LANGS);

  return {
    dir: {
      input: 'src',
      includes: '_includes',
      data: '_data',
      output: 'public'
    },
    templateFormats: ['md', 'njk', 'html'],
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    dataTemplateEngine: 'njk'
  };
};
