import { Notice } from './Notice';
import { Monitor } from './Monitor';
import { MatchResult } from './MatchResult';

export interface Matcher {
  match(notice: Omit<Notice, 'hash' | 'createdAt'>, monitor: Monitor): MatchResult;
}
