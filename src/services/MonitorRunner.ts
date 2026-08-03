import { Fetcher } from '../core/Fetcher';
import { Parser } from '../core/Parser';
import { Matcher } from '../core/Matcher';
import { Storage } from '../core/Storage';
import { Notifier, NotificationPayload } from '../core/Notifier';
import { generateHash } from '../utils/hash';
import { Notice } from '../core/Notice';
import { Monitor } from '../core/Monitor';
import pino from 'pino';

export class MonitorRunner {
  constructor(
    private readonly fetcher: Fetcher,
    private readonly parser: Parser,
    private readonly matcher: Matcher,
    private readonly storage: Storage,
    private readonly notifier: Notifier,
    private readonly logger: pino.Logger,
  ) {}

  async run(monitor: Monitor): Promise<void> {
    const startTime = Date.now();
    const logCtx = { monitorId: monitor.id };
    
    this.logger.info(logCtx, 'Starting monitor');

    try {
      const content = await this.fetcher.fetch(monitor);
      this.logger.info(logCtx, 'Fetched');

      const rawNotices = this.parser.parse(content, monitor);
      this.logger.info({ ...logCtx, count: rawNotices.length }, 'Parsed');

      let newMatches = 0;
      let duplicatesSkipped = 0;
      let filteredOut = 0;
      const newlyMatchedNotices: Notice[] = [];

      for (const rawNotice of rawNotices) {
        const matchResult = this.matcher.match(rawNotice, monitor);
        
        if (!matchResult.matched) {
          filteredOut++;
          continue;
        }

        const hash = generateHash(rawNotice.url + rawNotice.title);

        if (this.storage.exists(monitor.id, hash)) {
          duplicatesSkipped++;
          continue;
        }

        const notice: Notice = {
          ...rawNotice,
          hash,
          createdAt: new Date().toISOString(),
        };

        this.storage.save(monitor.id, notice);
        newlyMatchedNotices.push(notice);
        newMatches++;
      }

      this.logger.info({ ...logCtx, count: newMatches }, 'Matched');
      this.logger.info({ ...logCtx, count: duplicatesSkipped + filteredOut }, 'Skipped');

      if (monitor.notifications.telegram && newlyMatchedNotices.length > 0) {
        const payload: NotificationPayload = {
          monitor,
          notices: newlyMatchedNotices,
          summary: {
            total: rawNotices.length,
            matched: newlyMatchedNotices.length,
          }
        };
        await this.notifier.notify(payload);
        this.logger.info(logCtx, 'Sent');
      }

      this.logger.info(logCtx, 'Finished');
      
      const executionTime = Date.now() - startTime;
      this.logger.info({ ...logCtx, ms: executionTime }, 'Duration');
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error({ ...logCtx, err: error.message }, 'Errors');
      } else {
        this.logger.error(logCtx, 'Errors');
      }
    }
  }
}
