import { Notice } from './Notice';

export interface Storage {
  exists(monitorId: string, hash: string): boolean;
  save(monitorId: string, notice: Notice): void;
}
