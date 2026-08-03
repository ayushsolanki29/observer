import axios from 'axios';
import { Fetcher } from '../../core/Fetcher';
import { NetworkError } from '../../core/errors';
import { Monitor } from '../../core/Monitor';

export class HtmlFetcher implements Fetcher {
  async fetch(monitor: Monitor): Promise<string> {
    try {
      const response = await axios.get<string>(monitor.website.url, {
        timeout: 10000,
        maxRedirects: 5,
        decompress: true,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
          'Accept':
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Referer': 'https://www.google.com/',
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
          throw new NetworkError(`Site may be down (timeout on ${monitor.website.url})`);
        }
        if (error.response?.status === 403) {
          throw new NetworkError(`Site is blocking access from this server (403 Forbidden on ${monitor.website.url})`);
        }
        throw new NetworkError(`Failed to fetch HTML from ${monitor.website.url}: ${error.message}`);
      }
      throw new NetworkError(`Failed to fetch HTML from ${monitor.website.url}: Unknown error`);
    }
  }
}
