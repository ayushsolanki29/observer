import { z } from 'zod';
import * as dotenv from 'dotenv';
import { ConfigurationError } from '../core/errors';

import fs from 'fs';

if (fs.existsSync('.env.production')) {
  dotenv.config({ path: '.env.production' });
} else {
  dotenv.config();
}
const envSchema = z.object({
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  TELEGRAM_CHAT_ID: z.string().min(1),
});

export type Env = z.infer<typeof envSchema>;

let env: Env;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    const issues = error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
    throw new ConfigurationError(`Invalid environment variables: ${issues}`);
  }
  throw error;
}

export { env };
