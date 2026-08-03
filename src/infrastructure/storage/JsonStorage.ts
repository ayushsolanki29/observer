import fs from 'fs/promises';
import path from 'path';
import { Storage } from '../../core/Storage';
import { Notice } from '../../core/Notice';
import { StorageError } from '../../core/errors';
import { logger } from '../../config/logger';

interface StorageData {
  version: number;
  monitors: Record<
    string,
    {
      hashes: Record<string, Omit<Notice, 'hash'>>;
    }
  >;
}

export class JsonStorage implements Storage {
  private data: StorageData = { version: 1, monitors: {} };
  private filePath: string;
  private isModified = false;

  constructor(filePath?: string) {
    this.filePath = filePath || path.join(process.cwd(), 'data', 'storage.json');
  }

  async load(): Promise<void> {
    try {
      const dir = path.dirname(this.filePath);
      await fs.mkdir(dir, { recursive: true });

      try {
        const fileContent = await fs.readFile(this.filePath, 'utf-8');
        if (!fileContent.trim()) {
          this.data = { version: 1, monitors: {} };
        } else {
          this.data = JSON.parse(fileContent);
        }
        logger.info({ filePath: this.filePath }, 'Storage loaded');
      } catch (error: any) {
        if (error.code === 'ENOENT') {
          // File does not exist, initialize it
          this.data = { version: 1, monitors: {} };
          logger.info({ filePath: this.filePath }, 'Storage created');
        } else if (error instanceof SyntaxError) {
          throw new StorageError(`Failed to parse storage JSON: ${error.message}`);
        } else {
          throw error;
        }
      }
    } catch (error) {
      if (error instanceof StorageError) throw error;
      if (error instanceof Error) {
        throw new StorageError(`Failed to load storage: ${error.message}`);
      }
      throw new StorageError('Failed to load storage: Unknown error');
    }
  }

  exists(monitorId: string, hash: string): boolean {
    const monitorData = this.data.monitors[monitorId];
    if (!monitorData) return false;
    return !!monitorData.hashes[hash];
  }

  save(monitorId: string, notice: Notice): void {
    if (!this.data.monitors[monitorId]) {
      this.data.monitors[monitorId] = { hashes: {} };
    }
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hash, ...noticeData } = notice;
    this.data.monitors[monitorId].hashes[notice.hash] = noticeData;
    this.isModified = true;
  }

  async flush(): Promise<void> {
    if (!this.isModified) {
      logger.debug('Storage not modified, skipping flush');
      return;
    }

    const startTime = Date.now();
    const tempPath = `${this.filePath}.tmp`;

    try {
      await fs.writeFile(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
      await fs.rename(tempPath, this.filePath);
      
      this.isModified = false;
      const duration = Date.now() - startTime;
      logger.info({ durationMs: duration }, 'Storage flushed');
    } catch (error) {
      if (error instanceof Error) {
        throw new StorageError(`Failed to flush storage: ${error.message}`);
      }
      throw new StorageError('Failed to flush storage: Unknown error');
    }
  }
}
