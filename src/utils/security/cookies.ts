import { serialize, parse, type SerializeOptions } from 'cookie';

import type { NextApiResponse } from 'next';

/**
 * Cookie utility functions for secure cookie management
 * Implements security best practices for httpOnly, secure, and sameSite cookies
 */

/**
 * Default cookie options for secure cookies
 *
 * Development vs Production settings:
 * - Development: Works with HTTP, sameSite 'lax' for local testing
 * - Production: Enforces HTTPS, stricter security
 *
 * Note: sameSite 'none' requires secure: true, so we use 'lax' for development
 */
const DEFAULT_COOKIE_OPTIONS: SerializeOptions = {
  httpOnly: true, // Prevent JavaScript access (XSS protection)
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'lax', // CSRF protection, works with top-level navigation
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

/**
 * Cookie names used in the application
 */
export const COOKIE_NAMES = {
  AUTH_TOKEN: 'auth_token',
  CSRF_TOKEN: 'csrf_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

/**
 * Set a secure httpOnly cookie
 * @param res - Next.js API response object
 * @param name - Cookie name
 * @param value - Cookie value
 * @param options - Additional cookie options
 */
export function setSecureCookie(
  res: NextApiResponse,
  name: string,
  value: string,
  options: Partial<SerializeOptions> = {}
): void {
  const cookieOptions: SerializeOptions = {
    ...DEFAULT_COOKIE_OPTIONS,
    ...options,
  };

  const cookie = serialize(name, value, cookieOptions);

  // Handle multiple Set-Cookie headers
  const existingCookies = res.getHeader('Set-Cookie') || [];
  const cookies = Array.isArray(existingCookies) ? existingCookies : [String(existingCookies)];

  res.setHeader('Set-Cookie', [...cookies, cookie]);
}

/**
 * Clear a cookie by setting it to expired
 * @param res - Next.js API response object
 * @param name - Cookie name to clear
 */
export function clearCookie(res: NextApiResponse, name: string): void {
  setSecureCookie(res, name, '', {
    maxAge: 0,
    expires: new Date(0),
  });
}

/**
 * Parse cookies from request header
 * @param cookieHeader - Cookie header string from request
 * @returns Parsed cookies object
 */
export function parseCookies(cookieHeader: string | undefined): Record<string, string | undefined> {
  if (!cookieHeader) return {};
  return parse(cookieHeader);
}

/**
 * Get a specific cookie value from request
 * @param cookieHeader - Cookie header string from request
 * @param name - Cookie name to retrieve
 * @returns Cookie value or undefined
 */
export function getCookie(cookieHeader: string | undefined, name: string): string | undefined {
  const cookies = parseCookies(cookieHeader);
  return cookies[name];
}

/**
 * Set authentication token as httpOnly cookie
 * @param res - Next.js API response object
 * @param token - JWT token
 */
export function setAuthToken(res: NextApiResponse, token: string): void {
  setSecureCookie(res, COOKIE_NAMES.AUTH_TOKEN, token, {
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

/**
 * Set refresh token as httpOnly cookie
 * @param res - Next.js API response object
 * @param token - Refresh token
 */
export function setRefreshToken(res: NextApiResponse, token: string): void {
  setSecureCookie(res, COOKIE_NAMES.REFRESH_TOKEN, token, {
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

/**
 * Set CSRF token as cookie (NOT httpOnly, client needs to read it)
 * @param res - Next.js API response object
 * @param token - CSRF token
 */
export function setCsrfToken(res: NextApiResponse, token: string): void {
  setSecureCookie(res, COOKIE_NAMES.CSRF_TOKEN, token, {
    httpOnly: false, // Client needs to read this for CSRF protection
    maxAge: 60 * 60 * 24, // 1 day
  });
}

/**
 * Clear all authentication-related cookies
 * @param res - Next.js API response object
 */
export function clearAuthCookies(res: NextApiResponse): void {
  clearCookie(res, COOKIE_NAMES.AUTH_TOKEN);
  clearCookie(res, COOKIE_NAMES.REFRESH_TOKEN);
  clearCookie(res, COOKIE_NAMES.CSRF_TOKEN);
}
