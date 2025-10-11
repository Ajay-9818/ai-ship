const toAbsoluteUrl = (value, base) => {
  if (!value) return '';
  if (!base) return value;
  try {
    return new URL(value, base).toString();
  } catch (error) {
    return value;
  }
};

const escapeCdata = (value) => {
  if (!value) return '';
  return value.replaceAll(']]>', ']]]]><![CDATA[>');
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
        return lang === defaultLang ? '/feed.xml' : `/${lang}/feed.xml`;
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
    const feedUrl = toAbsoluteUrl(data.page?.url, siteUrl);
    const homeUrl = toAbsoluteUrl(isDefaultLang ? '/' : `/${feedLang}/`, siteUrl);

    const entries = (data.collections.feedEntries || []).filter((item) => {
      const entryLang = item.data?.lang || defaultLang;
      return entryLang === feedLang;
    });
    const lastItem = entries[0];
    const lastBuildDate = lastItem?.date
      ? new Date(lastItem.date).toUTCString()
      : new Date().toUTCString();

    const channelParts = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">',
      '<channel>',
      `<title>${langData.title || 'AI Ship'}</title>`,
      `<link>${homeUrl}</link>`,
      `<description>${escapeCdata(langData.description || '')}</description>`,
      `<language>${langData.locale || feedLang}</language>`,
      `<lastBuildDate>${lastBuildDate}</lastBuildDate>`
    ];

    if (feedUrl) {
      channelParts.push(
        `<atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />`
      );
    }

    entries.forEach((item) => {
      const itemUrl = toAbsoluteUrl(item.url, siteUrl);
      if (!itemUrl) return;
      const pubDate = item.date ? new Date(item.date).toUTCString() : undefined;
      const description = (item.data?.description || '').trim();
      const contentHtml = (item.templateContent || '').trim();

      channelParts.push('<item>');
      if (item.data?.title) {
        channelParts.push(`<title>${escapeCdata(item.data.title)}</title>`);
      }
      channelParts.push(`<link>${itemUrl}</link>`);
      channelParts.push(`<guid isPermaLink="true">${itemUrl}</guid>`);
      if (pubDate) {
        channelParts.push(`<pubDate>${pubDate}</pubDate>`);
      }
      if (description) {
        channelParts.push(`<description><![CDATA[${escapeCdata(description)}]]></description>`);
      }
      if (contentHtml) {
        channelParts.push(`<content:encoded><![CDATA[${escapeCdata(contentHtml)}]]></content:encoded>`);
      }
      channelParts.push('</item>');
    });

    channelParts.push('</channel>');
    channelParts.push('</rss>');

    return channelParts.join('\n') + '\n';
  }
};
