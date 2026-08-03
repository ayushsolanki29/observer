import { logger } from './config/logger';
import { loadMonitors } from './config/monitorLoader';
import { JsonStorage } from './infrastructure/storage/JsonStorage';
import { HtmlFetcher } from './infrastructure/http/HtmlFetcher';
import { GtuParser } from './infrastructure/parser/GtuParser';
import { GenericParser } from './infrastructure/parser/GenericParser';
import { TelegramNotifier } from './infrastructure/notification/TelegramNotifier';
import { RuleMatcher } from './services/RuleMatcher';
import { MonitorRunner } from './services/MonitorRunner';
import { withRetry } from './utils/retry';
import { Fetcher } from './core/Fetcher';
import { Notifier } from './core/Notifier';
import { Parser } from './core/Parser';

const fetcherRegistry: Record<string, new () => Fetcher> = {
  html: HtmlFetcher,
};

const parserRegistry: Record<string, new () => Parser> = {
  gtu: GtuParser,
  GtuParser: GtuParser,
  generic: GenericParser,
  GenericParser: GenericParser,
};

async function main() {
  logger.info('Initializing Observer Engine...');

  try {
    const monitors = await loadMonitors();
    
    if (monitors.length === 0) {
      logger.info('No monitors found in monitors directory.');
      return;
    }

    const storage = new JsonStorage();
    await storage.load();
    const matcher = new RuleMatcher();
    
    // We can instantiate a single notifier if we're only using Telegram for now,
    // but typically this would also be part of a registry if multiple notifier types exist.
    const rawNotifier = new TelegramNotifier();
    const notifier: Notifier = {
      notify: (payload) =>
        withRetry(() => rawNotifier.notify(payload), {
          maxRetries: 3,
          initialDelayMs: 2000,
        }),
    };

    for (const monitor of monitors) {
      if (!monitor.enabled) {
        logger.info(`Skipping disabled monitor: ${monitor.id}`);
        continue;
      }

      // Fetcher resolution (defaulting to html if not explicitly defined in the schema we created)
      const fetcherType = (monitor.website as any).fetcher || 'html';
      const FetcherClass = fetcherRegistry[fetcherType];
      if (!FetcherClass) {
        logger.error(`Unknown fetcher type: ${fetcherType} for monitor ${monitor.id}`);
        continue;
      }
      
      const rawFetcher = new FetcherClass();
      const fetcher: Fetcher = {
        fetch: (mon) =>
          withRetry(() => rawFetcher.fetch(mon), {
            maxRetries: 3,
            initialDelayMs: 2000,
          }),
      };

      // Parser resolution
      const ParserClass = parserRegistry[monitor.website.parser];
      if (!ParserClass) {
        logger.error(`Unknown parser type: ${monitor.website.parser} for monitor ${monitor.id}`);
        continue;
      }
      const parser = new ParserClass();

      const runner = new MonitorRunner(
        fetcher,
        parser,
        matcher,
        storage,
        notifier,
        logger,
      );

      await runner.run(monitor);
    }

    await storage.flush();

    logger.info('Observer Engine run completed successfully');
  } catch (error) {
    if (error instanceof Error) {
      logger.fatal({ err: error }, `Observer encountered a fatal error: ${error.message}`);
    } else {
      logger.fatal({ err: error }, 'Observer encountered an unknown fatal error');
    }
    process.exit(1);
  }
}

main();
