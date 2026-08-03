import { Monitor } from './Monitor';
import { Notice } from './Notice';

export interface NotificationPayload {
  monitor: Monitor;
  notices: Notice[];
  summary: {
    total: number;
    matched: number;
  };
}

export interface Notifier {
  notify(payload: NotificationPayload): Promise<void>;
}
