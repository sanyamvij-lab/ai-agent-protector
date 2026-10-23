# AI Protector — Deployment & Disaster Recovery

---

## 1. Environment Configuration

Create `.env.local` for local execution:
```env
# Server-side only (never prefix with NEXT_PUBLIC_)
GEMINI_API_KEY=""       # Optional: If omitted, local heuristic engine runs automatically
PORT=3000
NODE_ENV=production
```

---

## 2. Deployment Procedures
- **Standalone Node.js Server**:
  ```bash
  npm run build
  npm start
  ```
- **Vercel / Edge Deployment**:
  Deploy directly via Git integration. Environment variables set securely in Vercel Project Settings.

---

## 3. Rollback Procedure
If a breaking regression occurs in production:
1. Revert to the last known green commit in Git (`git revert HEAD`).
2. Run `npm test` and `npm run build` to verify clean build.
3. Redeploy. No database migration rollback required due to zero persistent storage architecture.
