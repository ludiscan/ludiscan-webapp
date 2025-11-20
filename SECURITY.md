# Security Guide

This document outlines the security features and best practices implemented in ludiscan-webapp.

## 🔒 Security Features

### 1. Authentication & Token Security

**httpOnly Cookies for Token Storage**
- Authentication tokens are stored in httpOnly cookies, preventing JavaScript access
- Protects against XSS (Cross-Site Scripting) attacks
- Cookies are automatically included in requests with `credentials: 'include'`

**Implementation:**
```typescript
// Login via secure API route
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // Include cookies
  body: JSON.stringify({ email, password }),
});
```

**Cookie Settings:**
- `httpOnly: true` - Prevents JavaScript access
- `secure: true` - HTTPS only (production)
- `sameSite: 'lax'` - CSRF protection
- `maxAge: 7 days` - Auto-expiration

### 2. CSRF (Cross-Site Request Forgery) Protection

**Double Submit Cookie Pattern**
- CSRF tokens generated for sensitive operations
- Token stored in both cookie and request header
- Server validates token matches

**Implementation:**
```typescript
// Get CSRF token
const { csrfToken } = await fetch('/api/auth/csrf').then(r => r.json());

// Include in requests
fetch('/api/protected', {
  headers: { 'X-CSRF-Token': csrfToken },
  credentials: 'include',
});
```

### 3. Security Headers

**Content Security Policy (CSP)**
- Prevents XSS attacks by restricting resource loading
- Blocks inline scripts (except whitelisted)
- Enforces HTTPS upgrades

**Headers Configured:**
- `Content-Security-Policy` - XSS and injection protection
- `X-Frame-Options: DENY` - Clickjacking protection
- `X-Content-Type-Options: nosniff` - MIME sniffing protection
- `Strict-Transport-Security` - HTTPS enforcement (production)
- `Referrer-Policy` - Control referrer information
- `Permissions-Policy` - Disable unnecessary browser features

**Configuration:** See `next.config.ts`

### 4. Rate Limiting

**API Route Protection**
- In-memory rate limiting for all API endpoints
- Different limits for different endpoint types

**Rate Limits:**
- Authentication endpoints: 5 requests/minute
- General API endpoints: 30 requests/minute
- Read-only endpoints: 100 requests/minute

**Implementation:**
```typescript
import { rateLimitMiddleware, RATE_LIMITS } from '@src/utils/security/rateLimit';

export default async function handler(req, res) {
  const rateLimit = rateLimitMiddleware(RATE_LIMITS.AUTH)(req, res);
  if (!rateLimit.allowed) return; // 429 response sent automatically

  // Your API logic here
}
```

**Note:** For production with multiple servers, consider Redis-based rate limiting.

### 5. Environment Variable Validation

**Zod Schema Validation**
- All environment variables validated at startup
- Prevents runtime errors from invalid configuration
- Type-safe access throughout application

**Configuration:** See `src/config/env.ts`

```typescript
import { env } from '@src/config/env';
// env.NEXT_PUBLIC_API_BASE_URL is validated and type-safe
```

### 6. API Proxy Pattern

**Secure Backend Communication**
- Generic proxy at `/api/proxy/[...path]` forwards requests to backend
- Automatically injects auth token from httpOnly cookie
- Client never directly handles tokens

**Usage:**
```typescript
// Instead of: fetch('https://backend.com/api/v0/user/me')
// Use: fetch('/api/proxy/v0/user/me')
```

## 🛡️ Security Best Practices

### For Developers

1. **Never Store Sensitive Data in localStorage**
   - Use httpOnly cookies for tokens
   - localStorage is vulnerable to XSS

2. **Always Validate Input**
   - Validate on both client and server
   - Use Zod or similar validation libraries

3. **Use Rate Limiting**
   - Apply to all API routes
   - Adjust limits based on endpoint sensitivity

4. **Keep Dependencies Updated**
   ```bash
   bun update
   bun audit
   ```

5. **Review Security Headers**
   - Test with [securityheaders.com](https://securityheaders.com)
   - Adjust CSP as needed for new integrations

6. **Use HTTPS in Production**
   - Never deploy without HTTPS
   - Enable HSTS header

7. **Rotate Secrets Regularly**
   - SESSION_SECRET
   - CSRF_SECRET
   - API keys

### For Production Deployment

1. **Set Secure Environment Variables**
   ```bash
   # Generate secure random strings
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

2. **Required Environment Variables**
   ```env
   SESSION_SECRET=<32+ character random string>
   CSRF_SECRET=<32+ character random string>
   NEXT_PUBLIC_HOSTNAME=<your-domain>
   NEXT_PUBLIC_API_BASE_URL=<backend-api-url>
   ```

3. **Enable Security Features**
   - Ensure `NODE_ENV=production`
   - Verify HTTPS is enabled
   - Check security headers are applied

4. **Monitor & Log**
   - Monitor rate limit hits
   - Log authentication attempts
   - Set up alerts for suspicious activity

## 🚨 Security Checklist

Before deploying to production:

- [ ] Environment variables validated with Zod
- [ ] SESSION_SECRET and CSRF_SECRET set to secure random values (32+ chars)
- [ ] HTTPS enabled and working
- [ ] Security headers tested (use securityheaders.com)
- [ ] Rate limiting configured for all API routes
- [ ] Dependencies updated and audited
- [ ] No secrets committed to repository
- [ ] Authentication uses httpOnly cookies
- [ ] CSRF protection enabled for state-changing operations
- [ ] Error messages don't leak sensitive information
- [ ] CORS properly configured

## 📚 References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)

## 🐛 Reporting Security Issues

If you discover a security vulnerability, please email security@ludiscan.com (or appropriate contact).

**Do not:**
- Open a public GitHub issue
- Disclose the vulnerability publicly before it's fixed

**Do:**
- Provide detailed information about the vulnerability
- Include steps to reproduce
- Suggest a fix if possible

## 📝 Security Audit Log

| Date | Version | Changes | Auditor |
|------|---------|---------|---------|
| 2025-11-20 | v0.18.0+ | Initial security implementation: httpOnly cookies, CSRF protection, rate limiting, security headers | Claude |

---

**Last Updated:** 2025-11-20
**Next Review:** 2026-02-20 (quarterly reviews recommended)
