import { Monitor } from './Monitor';

export interface Fetcher {
  fetch(monitor: Monitor): Promise<string>;
}
