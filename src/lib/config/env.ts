// AI Protector - Environment Configuration & Boot-Time Validation
import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  WEBRISK_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  VIRUSTOTAL_API_KEY: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  AUTH_SECRET: z.string().default('ai-protector-dev-secret-replace-in-production-min-32-chars'),
  RATE_LIMIT_MAX_PER_MINUTE: z.coerce.number().default(60),
});

export type EnvConfig = z.infer<typeof EnvSchema>;

let validatedEnv: EnvConfig | null = null;

export function getEnv(): EnvConfig {
  if (!validatedEnv) {
    const parsed = EnvSchema.safeParse(process.env);
    if (!parsed.success) {
      console.error('FATAL: Environment validation failed at boot:');
      console.error(parsed.error.format());
      throw new Error(`Environment validation failed: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`);
    }
    validatedEnv = parsed.data;
  }
  return validatedEnv;
}

// Export pre-validated instance for direct use
export const env = getEnv();
