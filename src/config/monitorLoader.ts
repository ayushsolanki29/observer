import fs from 'fs/promises';
import path from 'path';
import { Monitor } from '../core/Monitor';
import { ConfigurationError } from '../core/errors';

export async function loadMonitors(monitorsDir: string = path.join(process.cwd(), 'monitors')): Promise<Monitor[]> {
  try {
    const files = await fs.readdir(monitorsDir);
    const jsonFiles = files.filter((f) => f.endsWith('.json'));

    const monitors: Monitor[] = [];

    for (const file of jsonFiles) {
      const filePath = path.join(monitorsDir, file);
      const content = await fs.readFile(filePath, 'utf-8');
      
      try {
        const parsed = JSON.parse(content) as Monitor;
        // In a real app, we might want to validate the JSON schema with Zod here
        monitors.push(parsed);
      } catch (e) {
        throw new ConfigurationError(`Invalid JSON in monitor file: ${file}`);
      }
    }

    return monitors;
  } catch (error) {
    if (error instanceof Error) {
      if ((error as any).code === 'ENOENT') {
        return []; // No monitors folder
      }
      throw new ConfigurationError(`Failed to load monitors: ${error.message}`);
    }
    throw new ConfigurationError('Failed to load monitors: Unknown error');
  }
}
