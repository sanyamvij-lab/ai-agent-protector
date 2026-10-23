# AI Protector — Security Controls & Hardening Specification

---

## 1. Security Controls Catalog

| Control Area | Implementation Mechanism | Technical Standard |
|---|---|---|
| **Input Validation** | Zod schemas on all API routes | Max 16KB text, 2KB URLs, 8KB claims |
| **Anti-SSRF Protection** | Static IP blocklist & hostname resolution | RFC 1918, RFC 3927, RFC 4193, loopbacks blocked |
| **PII & Secret Scrubbing** | Regex + token replacement in `PrivacyRedactor` | Masks SSNs, credit cards, emails, phones, API keys |
| **Rate Limiting** | In-memory sliding window token bucket | Max 30 requests/minute per IP address |
| **Cryptographic Hashing** | Standard SHA-256 via Web Crypto & Node `crypto` | Standard W3C Web Cryptography & FIPS 180-4 |
| **API Secret Protection** | Node `process.env` isolation | Zero client bundle exposure |
| **Error Handling** | Standardized JSON error envelope | Zero stack traces or internal hostnames in responses |

---

## 2. Mandatory Anti-SSRF Rules

When parsing user-provided URLs, the backend applies the following algorithm before any network interaction:
```typescript
// 1. Disallow non-HTTP(S) protocols
if (protocol !== 'http:' && protocol !== 'https:') reject('Invalid protocol');

// 2. Reject private hostnames
if (['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(hostname)) reject('SSRF: Loopback');
if (hostname.endsWith('.local') || hostname.endsWith('.internal')) reject('SSRF: Internal DNS');

// 3. Reject RFC 1918 & Cloud Metadata IPv4
const [o1, o2] = ipOctets;
if (o1 === 10) reject('SSRF: RFC 1918 Class A');
if (o1 === 172 && o2 >= 16 && o2 <= 31) reject('SSRF: RFC 1918 Class B');
if (o1 === 192 && o2 === 168) reject('SSRF: RFC 1918 Class C');
if (o1 === 169 && o2 === 254) reject('SSRF: RFC 3927 Link-Local / Metadata');
```
