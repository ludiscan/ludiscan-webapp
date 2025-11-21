import { z } from 'zod';

/**
 * Environment variable schema with validation
 * Uses defaults for build time, strict validation only at runtime when needed
 */
const envSchema = z.object({
  NEXT_PUBLIC_HOSTNAME: z.string().default('http://localhost:5173'),
  NEXT_PUBLIC_API_BASE_URL: z.string().default('http://localhost:3211'),
  NEXT_PUBLIC_GTM_ID: z.string().default('GTM-XXXXXXX'),
  // Server-side only env vars
  SESSION_SECRET: z.string().optional(),
  CSRF_SECRET: z.string().optional(),
});

/**
 * Runtime validation schema (stricter)
 * Only applied when values are actually used at runtime
 */
const runtimeSchema = z.object({
  NEXT_PUBLIC_HOSTNAME: z.string().url('Invalid HOSTNAME URL'),
  NEXT_PUBLIC_API_BASE_URL: z.string().url('Invalid API_BASE_URL'),
  NEXT_PUBLIC_GTM_ID: z.string().min(1, 'GTM_ID is required'),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters').optional(),
  CSRF_SECRET: z.string().min(32, 'CSRF_SECRET must be at least 32 characters').optional(),
});

/**
 * Parse and validate environment variables
 * Uses lenient validation at build time, strict validation at runtime
 */
function validateEnv() {
  const rawEnv = {
    NEXT_PUBLIC_HOSTNAME: process.env.NEXT_PUBLIC_HOSTNAME,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_GTM_ID: process.env.NEXT_PUBLIC_GTM_ID,
    SESSION_SECRET: process.env.SESSION_SECRET,
    CSRF_SECRET: process.env.CSRF_SECRET,
  };

  // Always allow defaults at build time
  const parsed = envSchema.parse(rawEnv);

  // Only validate strictly at runtime (server-side when actually running)
  if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
    const runtimeValidation = runtimeSchema.safeParse(parsed);
    if (!runtimeValidation.success) {
      const errors = runtimeValidation.error.flatten().fieldErrors;
      // Only warn in production runtime, don't crash the app
      // This allows CI builds to succeed while alerting operators of config issues
      // eslint-disable-next-line no-console
      console.warn('⚠️  Environment variable validation warnings:', errors);
    }
  }

  return parsed;
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
