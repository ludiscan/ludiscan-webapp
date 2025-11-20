import { z } from 'zod';

/**
 * Environment variable schema with validation
 * Ensures all required env vars are present and valid at runtime
 */
const envSchema = z.object({
  NEXT_PUBLIC_HOSTNAME: z.string().url('Invalid HOSTNAME URL'),
  NEXT_PUBLIC_API_BASE_URL: z.string().url('Invalid API_BASE_URL'),
  NEXT_PUBLIC_GTM_ID: z.string().min(1, 'GTM_ID is required'),
  // Server-side only env vars
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters').optional(),
  CSRF_SECRET: z.string().min(32, 'CSRF_SECRET must be at least 32 characters').optional(),
});

/**
 * Parse and validate environment variables
 * Throws error if validation fails, preventing app startup with invalid config
 */
function validateEnv() {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_HOSTNAME: process.env.NEXT_PUBLIC_HOSTNAME,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_GTM_ID: process.env.NEXT_PUBLIC_GTM_ID,
    SESSION_SECRET: process.env.SESSION_SECRET,
    CSRF_SECRET: process.env.CSRF_SECRET,
  });

  if (!parsed.success) {
    // eslint-disable-next-line no-console
    console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables');
  }

  return parsed.data;
}

/**
 * Validated environment variables
 * Safe to use throughout the application
 */
export const env = validateEnv();

/**
 * Type-safe environment variable access
 */
export type Env = z.infer<typeof envSchema>;
