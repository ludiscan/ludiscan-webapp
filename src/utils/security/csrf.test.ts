import {
  generateCsrfToken,
  signCsrfToken,
  verifyCsrfToken,
  getCsrfSecret,
} from './csrf';

describe('CSRF Utilities', () => {
  describe('generateCsrfToken', () => {
    it('should generate a string token', () => {
      const token = generateCsrfToken();
      expect(typeof token).toBe('string');
      // The implementation may return base64 (length 44) or hex (length 64)
      expect(token.length === 44 || token.length === 64).toBe(true);

      const isBase64 = token.length === 44 && token.endsWith('=') && Buffer.from(token, 'base64').toString('base64') === token;
      const isHex = token.length === 64 && /^[0-9a-f]{64}$/.test(token);

      expect(isBase64 || isHex).toBe(true);
    });

    it('should generate unique tokens', () => {
      const token1 = generateCsrfToken();
      const token2 = generateCsrfToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('signCsrfToken', () => {
    it('should generate a hex string signature', () => {
      const token = generateCsrfToken();
      const secret = 'test-secret';
      const signature = signCsrfToken(token, secret);

      expect(typeof signature).toBe('string');
      // sha256 hex digest is 64 characters long
      expect(signature.length).toBe(64);
      expect(/^[0-9a-f]{64}$/.test(signature)).toBe(true);
    });

    it('should return consistent signatures for the same input', () => {
      const token = 'test-token';
      const secret = 'test-secret';
      const signature1 = signCsrfToken(token, secret);
      const signature2 = signCsrfToken(token, secret);

      expect(signature1).toBe(signature2);
    });

    it('should return different signatures for different tokens or secrets', () => {
      const token = 'test-token';
      const secret = 'test-secret';
      const baseSignature = signCsrfToken(token, secret);

      expect(signCsrfToken('different-token', secret)).not.toBe(baseSignature);
      expect(signCsrfToken(token, 'different-secret')).not.toBe(baseSignature);
    });
  });

  describe('verifyCsrfToken', () => {
    it('should return true for a valid signature', () => {
      const token = generateCsrfToken();
      const secret = 'test-secret';
      const signature = signCsrfToken(token, secret);

      expect(verifyCsrfToken(token, signature, secret)).toBe(true);
    });

    it('should return false for an invalid signature', () => {
      const token = generateCsrfToken();
      const secret = 'test-secret';

      const invalidSignature = 'a'.repeat(64); // Different signature

      expect(verifyCsrfToken(token, invalidSignature, secret)).toBe(false);
    });

    it('should return false when lengths do not match', () => {
      const token = generateCsrfToken();
      const secret = 'test-secret';

      expect(verifyCsrfToken(token, 'short', secret)).toBe(false);
    });

    it('should return false if token is modified', () => {
      const token = generateCsrfToken();
      const secret = 'test-secret';
      const signature = signCsrfToken(token, secret);

      const modifiedToken = token.substring(0, token.length - 1) + 'a';

      expect(verifyCsrfToken(modifiedToken, signature, secret)).toBe(false);
    });

    it('should return false if secret is different', () => {
      const token = generateCsrfToken();
      const secret = 'test-secret';
      const signature = signCsrfToken(token, secret);

      expect(verifyCsrfToken(token, signature, 'wrong-secret')).toBe(false);
    });
  });

  describe('getCsrfSecret', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    it('should return the secret from process.env.CSRF_SECRET', () => {
      process.env.CSRF_SECRET = 'my-custom-secret';
      expect(getCsrfSecret()).toBe('my-custom-secret');
    });

    it('should return the default secret in development if not set', () => {
      delete process.env.CSRF_SECRET;
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', configurable: true });
      expect(getCsrfSecret()).toBe('default-csrf-secret-please-change-in-production-min-32-chars');
    });

    it('should throw an error in production if secret is not set', () => {
      delete process.env.CSRF_SECRET;
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', configurable: true });

      expect(() => getCsrfSecret()).toThrow('CSRF_SECRET environment variable is missing and is required in production.');
    });
  });
});
