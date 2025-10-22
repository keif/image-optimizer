# Security Documentation

## Overview

This document tracks security features, vulnerabilities, mitigations, and ongoing security tasks for the Image Optimizer API.

**Last Security Review**: 2025-10-22
**Overall Security Posture**: A- (Strong)

---

## Security Architecture

### Defense Layers

1. **API Key Authentication** - Cryptographically secure 32-byte keys
2. **Origin-Based Bypass** - Trusted domain validation for frontend access
3. **Rate Limiting** - Per-IP sliding window (100 req/min default)
4. **SSRF Protection** - Private IP blocking, domain whitelist
5. **Input Validation** - Comprehensive parameter sanitization
6. **File Upload Security** - Size limits, type validation
7. **Resource Limits** - Request timeouts, body limits, worker pools

---

## Current Security Features

### ✅ Implemented & Secure

#### Authentication (api/middleware/api_key.go)
- [x] Cryptographically secure API key generation (32 bytes)
- [x] Database-backed key storage with revocation support
- [x] Origin-based authentication bypass for trusted domains
- [x] Wildcard subdomain support (`*.sosquishy.io`)
- [x] Configurable bypass rules for health/swagger endpoints
- [x] Bearer token support in Authorization header

#### Rate Limiting (api/middleware/rate_limit.go)
- [x] Per-IP rate limiting with sliding window algorithm
- [x] Configurable limits (default: 100 req/min)
- [x] Proper HTTP 429 responses
- [x] Environment variable configuration
- [x] Enabled by default in production

#### SSRF Protection (api/routes/optimize.go)
- [x] Private IP range blocking (RFC 1918, loopback)
- [x] Cloud metadata endpoint blocking (169.254.169.254)
- [x] DNS resolution validation
- [x] Domain whitelist (cloudinary, imgur, unsplash, pexels)
- [x] Configurable via ALLOWED_DOMAINS

#### Input Validation
- [x] Quality: 1-100 range validation
- [x] Dimensions: Non-negative integer checks
- [x] Format: Whitelist validation (jpeg, png, webp, gif, avif)
- [x] Sprite dimensions: Max 12288x12288 pixels
- [x] Padding: 0-32 pixel range
- [x] Interpolator: Whitelist validation

#### File Upload Security (api/routes/optimize.go)
- [x] 10MB hard limit per file
- [x] 15MB total request body limit
- [x] Content-Type validation
- [x] LimitReader to prevent buffer overflow
- [x] Proper file handle cleanup (defer Close)

#### Resource Exhaustion Protection (api/main.go)
- [x] Body limit: 15MB
- [x] Read timeout: 5 minutes
- [x] Write timeout: 5 minutes
- [x] Idle timeout: 10 minutes
- [x] Batch processing: 4 worker pool limit

#### Security Headers (api/main.go)
- [x] X-Content-Type-Options: nosniff
- [x] X-Frame-Options: DENY
- [x] X-XSS-Protection: 1; mode=block
- [x] Referrer-Policy: strict-origin-when-cross-origin
- [x] Strict-Transport-Security (HTTPS only)

#### Error Handling (api/routes/optimize.go)
- [x] Production mode hides internal errors
- [x] Development mode shows detailed errors
- [x] No stack trace leakage
- [x] Graceful fallback for external tools (oxipng, cjpeg)

#### SQL Injection Protection (api/db/*.go)
- [x] All queries use parameterized statements
- [x] No string concatenation in SQL
- [x] Proper error handling

---

## Known Issues & Mitigations

### 🔒 Implemented Fixes

#### ✅ Decompression Bomb Protection
**Status**: IMPLEMENTED (2025-10-22)
**Location**: api/routes/optimize.go

**Issue**: Small compressed files could expand to massive images causing memory exhaustion.

**Mitigation**:
- Max decoded pixels: 100 million (10,000 x 10,000)
- Validation after image decode
- Clear error message for oversized images
- Applies to both uploads and URL fetches

**Test Coverage**: Added in api/routes/optimize_test.go

---

### ⚠️ Active Concerns

#### Command Execution Safety
**Risk Level**: Medium (mitigated by input validation)
**Location**: api/services/image_service.go:367, 412

**Issue**: External commands executed for PNG/JPEG optimization:
- `oxipng` - PNG lossless compression
- `cjpeg` (MozJPEG) - JPEG optimization

**Current Mitigations**:
- ✅ All parameters are validated integers from controlled sources
- ✅ Quality: 1-100 range validation
- ✅ OxiPNG level: 0-6 range validation
- ✅ No user strings passed to commands
- ✅ Graceful fallback if commands fail

**Documentation**: Inline comments added explaining safety (2025-10-22)

**Recommendations**:
- [ ] Consider sandboxing (seccomp, containers) for additional isolation
- [ ] Monitor and log when external tools fail
- [ ] Regular security updates for oxipng and mozjpeg binaries

#### Image Processing CPU Usage
**Risk Level**: Low (mitigated by timeouts)
**Location**: api/services/image_service.go

**Issue**: Complex images could cause high CPU usage during processing.

**Current Mitigations**:
- ✅ 5 minute read/write timeouts
- ✅ Worker pool limits concurrent processing
- ✅ Decompression bomb protection (max 100M pixels)
- ✅ Rate limiting prevents DoS attempts

**Recommendations**:
- [ ] Add per-operation CPU time limits
- [ ] Monitor resource usage metrics
- [ ] Consider memory limits per request

---

## Security Configuration

### Production (Recommended)

```bash
# Authentication
API_KEY_AUTH_ENABLED=true
PUBLIC_OPTIMIZATION_ENABLED=false
TRUSTED_ORIGINS=https://sosquishy.io,https://www.sosquishy.io

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=1m

# CORS
CORS_ORIGINS=https://sosquishy.io,https://www.sosquishy.io

# Domain Whitelist (restrict to known safe domains)
ALLOWED_DOMAINS=cloudinary.com,imgur.com,unsplash.com,pexels.com

# Environment
GO_ENV=production
PORT=8080
```

### High Security (Paranoid Mode)

```bash
# Disable all public access
API_KEY_AUTH_ENABLED=true
PUBLIC_OPTIMIZATION_ENABLED=false
TRUSTED_ORIGINS=  # Empty - require API keys for all requests

# Aggressive rate limiting
RATE_LIMIT_MAX=50
RATE_LIMIT_WINDOW=1m

# Strict domain whitelist
ALLOWED_DOMAINS=cdn.yourdomain.com

# Environment
GO_ENV=production
```

### Development (Local)

```bash
# Easier testing
API_KEY_AUTH_ENABLED=false
PUBLIC_OPTIMIZATION_ENABLED=true
TRUSTED_ORIGINS=http://localhost:3000,http://localhost:8080
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX=1000
ALLOWED_DOMAINS=  # Allow all domains in dev
```

---

## Security Testing

### Test Coverage

#### Unit Tests
- [x] API key authentication middleware (api/middleware/api_key_test.go)
- [x] Origin-based bypass validation
- [x] Domain whitelist validation
- [x] Input validation (quality, dimensions, format)
- [x] Decompression bomb protection (2025-10-22)
- [ ] Rate limit enforcement
- [ ] SSRF protection edge cases

#### Integration Tests
- [x] Image optimization workflows (api/routes/optimize_test.go)
- [x] Spritesheet packing
- [ ] Batch processing under load
- [ ] Rate limit reset behavior
- [ ] Command execution failure scenarios

### Security Test Checklist

Run these tests before each release:

```bash
# 1. Run unit tests
cd api && go test ./... -v

# 2. Test API key authentication
curl -H "Authorization: Bearer invalid_key" https://api.sosquishy.io/optimize
# Expected: 401 Unauthorized

# 3. Test origin-based bypass
curl -H "Origin: https://sosquishy.io" https://api.sosquishy.io/optimize
# Expected: Works without API key

# 4. Test untrusted origin
curl -H "Origin: https://evil.com" https://api.sosquishy.io/optimize
# Expected: 401 Unauthorized

# 5. Test rate limiting
for i in {1..101}; do curl https://api.sosquishy.io/optimize; done
# Expected: HTTP 429 after 100 requests

# 6. Test SSRF protection
curl -F "url=http://169.254.169.254/latest/meta-data/" https://api.sosquishy.io/optimize
# Expected: 403 Forbidden

# 7. Test file size limit
curl -F "image=@large_file_11mb.jpg" https://api.sosquishy.io/optimize
# Expected: 413 Request Entity Too Large

# 8. Test decompression bomb
curl -F "image=@decompression_bomb.png" https://api.sosquishy.io/optimize
# Expected: 400 Bad Request with clear error message
```

---

## Incident Response

### Security Event Monitoring

Monitor logs for these patterns:

1. **Authentication Failures**
   - Multiple invalid API key attempts from same IP
   - Pattern: `"error": "Invalid or revoked API key"`

2. **Rate Limit Violations**
   - Sustained HTTP 429 responses
   - Pattern: `"error": "Rate limit exceeded"`

3. **SSRF Attempts**
   - Blocked URL patterns (private IPs, metadata endpoints)
   - Pattern: `"error": "URL domain not allowed"`

4. **Large File Attacks**
   - HTTP 413 responses
   - Pattern: `exceeds maximum size`

5. **Decompression Bomb Attempts**
   - HTTP 400 with oversized decoded image
   - Pattern: `exceeds maximum decoded size`

### Response Procedures

#### Suspected Abuse
1. Check logs for IP address patterns
2. Verify rate limiting is functioning
3. Consider temporary IP ban if needed
4. Review API key usage if authenticated

#### Potential Vulnerability Discovery
1. Document the vulnerability details
2. Assess impact and exploitability
3. Develop fix and test thoroughly
4. Deploy to production
5. Update this SECURITY.md document

---

## Future Enhancements

### High Priority
- [ ] Add security event logging (structured logging for auth failures, rate limits, SSRF)
- [ ] Implement API key expiration feature
- [ ] Add monitoring and alerting for suspicious patterns

### Medium Priority
- [ ] IP whitelisting for admin endpoints (/api/keys management)
- [ ] Database encryption (consider sqlcipher)
- [ ] Add per-operation memory limits
- [ ] Implement request ID tracking for audit trail

### Low Priority
- [ ] Add Content Security Policy headers
- [ ] Implement key rotation mechanism
- [ ] Add OWASP dependency checking to CI/CD
- [ ] Consider Web Application Firewall (WAF) integration

---

## Reporting Security Issues

If you discover a security vulnerability, please:

1. **Do NOT open a public GitHub issue**
2. Email security concerns to: [your security email]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

Response timeline:
- Initial response: 24 hours
- Vulnerability assessment: 72 hours
- Fix deployment: Based on severity (Critical: 24-48h, High: 1 week, Medium: 2 weeks)

---

## Security Audit History

| Date | Type | Findings | Actions Taken |
|------|------|----------|---------------|
| 2025-10-22 | Comprehensive Review | 8 categories reviewed, Grade A- | Implemented decompression bomb protection, documented command execution safety |
| 2025-10-21 | Origin Auth Implementation | Origin-based bypass feature added | Full test coverage, wildcard support |

---

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [CWE - Common Weakness Enumeration](https://cwe.mitre.org/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

---

## Document Maintenance

This document should be reviewed and updated:
- After each security review
- When new security features are implemented
- When vulnerabilities are discovered and fixed
- At minimum, quarterly

**Next Review Due**: 2026-01-22
