import { Notice } from './Notice';
import { Monitor } from './Monitor';

export interface Parser {
  parse(content: string, monitor: Monitor): Omit<Notice, 'hash' | 'createdAt'>[];
}
