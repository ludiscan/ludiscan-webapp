import { randomBytes, createHmac } from 'crypto';

/**
 * CSRF (Cross-Site Request Forgery) Protection Utilities
 *
 * Implements Double Submit Cookie pattern:
 * 1. Generate a random CSRF token
 * 2. Store it in both a cookie and return it to client
 * 3. Client includes token in request headers
 * 4. Server validates token matches cookie
 */

const CSRF_TOKEN_LENGTH = 32;

/**
 * Generate a cryptographically secure random CSRF token
 * @returns Base64-encoded random token
 */
export function generateCsrfToken(): string {
  return randomBytes(CSRF_TOKEN_LENGTH).toString('base64');
}

/**
 * Create HMAC signature for CSRF token validation
 * @param token - The CSRF token to sign
 * @param secret - Secret key for HMAC
 * @returns HMAC signature
 */
export function signCsrfToken(token: string, secret: string): string {
  return createHmac('sha256', secret).update(token).digest('hex');
}

/**
 * Timing-safe string comparison to prevent timing attacks
 * @param a - First string
 * @param b - Second string
 * @returns True if strings are equal
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Verify CSRF token signature
 * @param token - The CSRF token to verify
 * @param signature - The signature to verify against
 * @param secret - Secret key for HMAC
 * @returns True if signature is valid
 */
export function verifyCsrfToken(token: string, signature: string, secret: string): boolean {
  const expectedSignature = signCsrfToken(token, secret);
  // Use constant-time comparison to prevent timing attacks
  return timingSafeEqual(expectedSignature, signature);
}

/**
 * CSRF secret key (should be set in environment variables)
 * Falls back to a default value for development
 */
export function getCsrfSecret(): string {
  return process.env.CSRF_SECRET || 'default-csrf-secret-please-change-in-production-min-32-chars';
}
