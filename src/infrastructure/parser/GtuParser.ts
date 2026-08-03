import * as cheerio from 'cheerio';
import { Parser } from '../../core/Parser';
import { Notice } from '../../core/Notice';

export class GtuParser implements Parser {
  parse(content: string): Omit<Notice, 'hash' | 'createdAt'>[] {
    const startTime = Date.now();
    const notices: Omit<Notice, 'hash' | 'createdAt'>[] = [];
    let skipped = 0;

    try {
      const $ = cheerio.load(content);

      $('div.tonews').each((_, element) => {
        try {
          const $el = $(element);
          
          const dateText = $el.find('span').first().text();
          
          // Find the actual link, avoiding "Read More" links
          const $links = $el.find('a');
          let $targetLink = $links.first();
          
          $links.each((i, link) => {
             const href = $(link).attr('href');
             if (href && href !== '#' && href.trim() !== '') {
               $targetLink = $(link);
               return false; // break
             }
          });

          let title = $targetLink.text();
          let url = $targetLink.attr('href');
          
          // Clean up whitespace
          title = title ? title.replace(/\s+/g, ' ').trim() : '';
          url = url ? url.replace(/\s+/g, '').trim() : '';
          const publishedAt = dateText ? dateText.replace(/\s+/g, ' ').trim() : undefined;

          if (!title || !url || url === '#') {
            skipped++;
            return; 
          }

          if (url && !url.startsWith('http')) {
            if (url.startsWith('/')) {
              url = `https://www.gtu.ac.in${url}`;
            } else {
              url = `https://www.gtu.ac.in/${url}`;
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
    console.log(`[GtuParser] Found: ${notices.length} notices | Skipped: ${skipped} | Duration: ${duration}ms`);

    return notices;
  }
}
