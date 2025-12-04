# Deploy Preparation for VoteQuest

This file lists the minimal steps and environment variables needed to let testers try the app.

1) Local run (development)

- Create a `.env.local` at project root with the following keys (example values are placeholders):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...anon...
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_site_key
TURNSTILE_SECRET_KEY=your_turnstile_secret
NEXT_PUBLIC_ENABLE_ADMIN_BACKDOOR=true # optional for testing admin modal
ADMIN_SECRET=your_admin_passphrase # server-only
```

- Install deps and run dev:

```powershell
npm ci
npm run dev
```

2) Build (production simulation)

```powershell
npm ci
npm run build
npm run start
```

3) Deploy to Netlify (summary)

- Connect the repo to Netlify.
- Set the Environment Variables (use values from `.env.local` but DO NOT commit secrets):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_APP_URL` (e.g., `https://your-site.netlify.app`)
  - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
  - `TURNSTILE_SECRET_KEY`
  - `NEXT_PUBLIC_ENABLE_ADMIN_BACKDOOR` (optional: `true` or `false`)
  - `ADMIN_SECRET` (server-only secret used by `api/admin/validate`)

- Build command: `npm run build`
- Publish directory: (default) `.next`

4) Supabase settings

- In Supabase > Auth > URL configuration, add redirect URLs:
  - `https://your-site.netlify.app/auth/callback`
  - `http://localhost:3000/auth/callback` (for local testing)
- Set Site URL to `https://your-site.netlify.app`

5) Quick verification after deploy

- Open site URL.
- Test sign-in via email magic link. Ensure the email redirect goes to `/auth/callback` and then returns to the app.
- Test Konami + admin modal (if `NEXT_PUBLIC_ENABLE_ADMIN_BACKDOOR=true`) and validate with `ADMIN_SECRET`.

6) Notes & next actions

- ESLint: I started migration but there are conflicts between `eslint-config-next@16` and ESLint v8. I recommend either:
  - Migrating fully to ESLint v9 flat config (I can do this), or
  - Allowing `eslint-config-next@16` to run against ESLint v9 by upgrading `eslint` and migrating `.eslintrc.json` to flat config.

- Bundle analysis was saved to `.next/analyze/*.html`. Open those files locally to inspect large bundles.

- Monitoring: add Sentry or Logflare and set up Netlify deploy notifications (I can scaffold Sentry init if you want).

---

If you'd like, I can:
- Deploy a test build to Netlify using your credentials (you'll need to add environment variables), or
- Prepare a `vercel.json` and Vercel deployment instructions, or
- Finish the ESLint migration to v9.

Tell me which next step you want me to take and I'll proceed.
