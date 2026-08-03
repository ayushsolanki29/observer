import * as cheerio from 'cheerio';
import { Parser } from '../../core/Parser';
import { Notice } from '../../core/Notice';
import { Monitor } from '../../core/Monitor';

export class GenericParser implements Parser {
  parse(content: string, monitor: Monitor): Omit<Notice, 'hash' | 'createdAt'>[] {
    const startTime = Date.now();
    const notices: Omit<Notice, 'hash' | 'createdAt'>[] = [];
    let skipped = 0;

    const selectors = monitor.website.selectors;
    if (!selectors || !selectors.item || !selectors.title || !selectors.link) {
      console.error(`[GenericParser] Missing required selectors for monitor ${monitor.id}. Skipping parse.`);
      return [];
    }

    try {
      const $ = cheerio.load(content);

      $(selectors.item).each((_, element) => {
        try {
          const $el = $(element);
          
          let title = $el.find(selectors.title).text();
          let url = $el.find(selectors.link).attr('href');
          let dateText = selectors.date ? $el.find(selectors.date).text() : undefined;
          
          // Clean up whitespace
          title = title ? title.replace(/\s+/g, ' ').trim() : '';
          url = url ? url.replace(/\s+/g, '').trim() : '';
          const publishedAt = dateText ? dateText.replace(/\s+/g, ' ').trim() : undefined;

          if (!title || !url || url === '#') {
            skipped++;
            return; 
          }

          if (url && !url.startsWith('http')) {
            const baseUrl = new URL(monitor.website.url);
            if (url.startsWith('/')) {
              url = `${baseUrl.origin}${url}`;
            } else {
              url = `${baseUrl.href.replace(/\/$/, '')}/${url}`;
            }
          }

          notices.push({
            title,
            url,
            publishedAt: publishedAt || new Date().toISOString(),
          });
        } catch (err) {
          skipped++;
        }
      });

    } catch (error) {
      // Parser must never throw because of malformed HTML
    }

    const duration = Date.now() - startTime;
    console.log(`[GenericParser] Found: ${notices.length} notices | Skipped: ${skipped} | Duration: ${duration}ms`);

    return notices;
  }
}
