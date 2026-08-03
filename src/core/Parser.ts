import { Notice } from './Notice';

export interface Parser {
  parse(content: string): Omit<Notice, 'hash' | 'createdAt'>[];
}
