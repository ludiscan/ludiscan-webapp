import { setSecureCookie, clearCookie, parseCookies, getCookie, setAuthToken, setRefreshToken, setCsrfToken, clearAuthCookies, COOKIE_NAMES } from './cookies';

import type { NextApiResponse } from 'next';

describe('Cookies Security Utilities', () => {
  let mockRes: Partial<NextApiResponse>;
  let headers: Record<string, string | number | readonly string[]>;

  beforeEach(() => {
    headers = {};
    mockRes = {
      getHeader: jest.fn((name: string) => headers[name.toLowerCase()] as string | string[]),
      setHeader: jest.fn((name: string, value: string | number | readonly string[]) => {
        headers[name.toLowerCase()] = value;
        return mockRes as NextApiResponse;
      }),
    };

  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('setSecureCookie', () => {
    it('sets a simple secure cookie', () => {
      setSecureCookie(mockRes as NextApiResponse, 'test_cookie', 'test_value');

      expect(mockRes.setHeader).toHaveBeenCalled();
      const setCookieHeader = headers['set-cookie'] as string[];
      expect(setCookieHeader).toHaveLength(1);
      expect(setCookieHeader[0]).toMatch(/^test_cookie=test_value;/);
      expect(setCookieHeader[0]).toContain('HttpOnly');
      expect(setCookieHeader[0]).toContain('Path=/');
      expect(setCookieHeader[0]).toContain('SameSite=Lax');
    });

    it('appends to existing cookies', () => {
      headers['set-cookie'] = ['existing_cookie=existing_value'];

      setSecureCookie(mockRes as NextApiResponse, 'test_cookie', 'test_value');

      const setCookieHeader = headers['set-cookie'] as unknown as string[];
      expect(setCookieHeader).toHaveLength(2);
      expect(setCookieHeader[0]).toBe('existing_cookie=existing_value');
      expect(setCookieHeader[1]).toMatch(/^test_cookie=test_value;/);
    });

    it('appends to existing single cookie string', () => {
      headers['set-cookie'] = 'existing_cookie=existing_value';

      setSecureCookie(mockRes as NextApiResponse, 'test_cookie', 'test_value');

      const setCookieHeader = headers['set-cookie'] as unknown as string[];
      expect(setCookieHeader).toHaveLength(2);
      expect(setCookieHeader[0]).toBe('existing_cookie=existing_value');
      expect(setCookieHeader[1]).toMatch(/^test_cookie=test_value;/);
    });

    it('respects production environment options', async () => {
      // In bun test, we can use the options parameter to test production settings
      // instead of trying to manipulate module-level environment variables
      setSecureCookie(mockRes as NextApiResponse, 'test_cookie', 'test_value', {
        secure: true,
        sameSite: 'none',
        domain: '.matuyuhi.com',
      });

      const setCookieHeader = headers['set-cookie'] as string[];
      expect(setCookieHeader[0]).toContain('Secure');
      expect(setCookieHeader[0]).toContain('SameSite=None');
      expect(setCookieHeader[0]).toContain('Domain=.matuyuhi.com');
    });

    it('allows overriding default options', () => {
      setSecureCookie(mockRes as NextApiResponse, 'test_cookie', 'test_value', {
        httpOnly: false,
        maxAge: 3600,
      });

      const setCookieHeader = headers['set-cookie'] as string[];
      expect(setCookieHeader[0]).not.toContain('HttpOnly');
      expect(setCookieHeader[0]).toContain('Max-Age=3600');
    });
  });

  describe('clearCookie', () => {
    it('sets cookie expiration to the past', () => {
      clearCookie(mockRes as NextApiResponse, 'test_cookie');

      const setCookieHeader = headers['set-cookie'] as string[];
      expect(setCookieHeader[0]).toMatch(/^test_cookie=;/);
      expect(setCookieHeader[0]).toContain('Max-Age=0');
      expect(setCookieHeader[0]).toContain('Expires=Thu, 01 Jan 1970 00:00:00 GMT');
    });
  });

  describe('parseCookies', () => {
    it('returns empty object when header is undefined', () => {
      const result = parseCookies(undefined);
      expect(result).toEqual({});
    });

    it('parses multiple cookies properly', () => {
      const header = 'cookie1=value1; cookie2=value2';
      const result = parseCookies(header);
      expect(result).toEqual({
        cookie1: 'value1',
        cookie2: 'value2',
      });
    });
  });

  describe('getCookie', () => {
    it('returns undefined if cookie is missing', () => {
      const result = getCookie('cookie1=value1', 'cookie2');
      expect(result).toBeUndefined();
    });

    it('returns undefined if header is undefined', () => {
      const result = getCookie(undefined, 'cookie1');
      expect(result).toBeUndefined();
    });

    it('returns the correct cookie value', () => {
      const result = getCookie('cookie1=value1; cookie2=value2', 'cookie1');
      expect(result).toBe('value1');
    });
  });

  describe('Token Setters', () => {
    it('setAuthToken sets correct cookie', () => {
      setAuthToken(mockRes as NextApiResponse, 'auth123');
      const setCookieHeader = headers['set-cookie'] as string[];
      expect(setCookieHeader[0]).toMatch(new RegExp(`^${COOKIE_NAMES.AUTH_TOKEN}=auth123;`));
      expect(setCookieHeader[0]).toContain('Max-Age=604800'); // 7 days
    });

    it('setRefreshToken sets correct cookie', () => {
      setRefreshToken(mockRes as NextApiResponse, 'refresh123');
      const setCookieHeader = headers['set-cookie'] as string[];
      expect(setCookieHeader[0]).toMatch(new RegExp(`^${COOKIE_NAMES.REFRESH_TOKEN}=refresh123;`));
      expect(setCookieHeader[0]).toContain('Max-Age=2592000'); // 30 days
    });

    it('setCsrfToken sets correct cookie without HttpOnly', () => {
      setCsrfToken(mockRes as NextApiResponse, 'csrf123');
      const setCookieHeader = headers['set-cookie'] as string[];
      expect(setCookieHeader[0]).toMatch(new RegExp(`^${COOKIE_NAMES.CSRF_TOKEN}=csrf123;`));
      expect(setCookieHeader[0]).toContain('Max-Age=86400'); // 1 day
      expect(setCookieHeader[0]).not.toContain('HttpOnly'); // CSRF token needs to be readable by client
    });
  });

  describe('clearAuthCookies', () => {
    it('clears all auth related cookies', () => {
      clearAuthCookies(mockRes as NextApiResponse);
      const setCookieHeader = headers['set-cookie'] as string[];
      expect(setCookieHeader).toHaveLength(3);

      const cookieNames = setCookieHeader.map((header) => header.split('=')[0]);
      expect(cookieNames).toContain(COOKIE_NAMES.AUTH_TOKEN);
      expect(cookieNames).toContain(COOKIE_NAMES.REFRESH_TOKEN);
      expect(cookieNames).toContain(COOKIE_NAMES.CSRF_TOKEN);

      setCookieHeader.forEach((header) => {
        expect(header).toContain('Max-Age=0');
      });
    });
  });
});
