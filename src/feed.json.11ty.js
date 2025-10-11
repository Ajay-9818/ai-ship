const toAbsoluteUrl = (value, base) => {
  if (!value) return '';
  if (!base) return value;
  try {
    return new URL(value, base).toString();
  } catch (error) {
    return value;
  }
};

const cleanObject = (input) => {
  return Object.fromEntries(
    Object.entries(input || {}).filter(([, v]) => v !== undefined && v !== null && v !== '')
  );
};

module.exports = class {
  data() {
    return {
      pagination: {
        data: 'supportedLangs',
        size: 1,
        alias: 'feedLang'
      },
      permalink: (data) => {
        const defaultLang = data.site?.defaultLang || 'zh';
        const lang = data.feedLang || defaultLang;
        return lang === defaultLang ? '/feed.json' : `/${lang}/feed.json`;
      },
      eleventyExcludeFromCollections: true
    };
  }

  render(data) {
    const site = data.site || {};
    const siteUrl = site.url || '';
    const defaultLang = site.defaultLang || 'zh';
    const feedLang = data.feedLang || defaultLang;
    const isDefaultLang = feedLang === defaultLang;
    const langData =
      (site.languages && site.languages[feedLang]) ||
      (site.languages && site.languages[defaultLang]) ||
      {};
    const author = site.author || {};
    const feedUrl = toAbsoluteUrl(data.page?.url, siteUrl);
    const homeUrl = toAbsoluteUrl(isDefaultLang ? '/' : `/${feedLang}/`, siteUrl);

    const authorEntry = author.name
      ? cleanObject({
          name: author.name,
          url: author.url ? toAbsoluteUrl(author.url, siteUrl) : undefined
        })
      : undefined;

    const items = (data.collections.feedEntries || [])
      .filter((item) => {
        const entryLang = item.data?.lang || defaultLang;
        return entryLang === feedLang;
      })
      .map((item) => {
        const itemUrl = toAbsoluteUrl(item.url, siteUrl);
        if (!itemUrl) return null;
        const published = item.date ? new Date(item.date).toISOString() : undefined;

        return cleanObject({
          id: itemUrl,
          url: itemUrl,
          title: item.data?.title,
          date_published: published,
          language: feedLang,
          summary: item.data?.description,
          content_html: (item.templateContent || '').trim(),
          authors: authorEntry ? [authorEntry] : undefined
        });
      })
      .filter(Boolean);

    const payload = cleanObject({
      version: 'https://jsonfeed.org/version/1.1',
      title: langData.title || 'AI Ship',
      language: langData.locale || feedLang,
      home_page_url: homeUrl || undefined,
      feed_url: feedUrl || undefined,
      description: langData.description,
      items
    });

    return JSON.stringify(payload, null, 2) + '\n';
  }
};
