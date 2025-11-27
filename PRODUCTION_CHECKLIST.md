# 🚀 Production Deployment Checklist

Use this checklist before deploying to production.

## ✅ Pre-Deployment

### Code Quality
- [ ] All TypeScript errors resolved (`npm run build` succeeds)
- [ ] No console.errors or console.warns in production code
- [ ] All TODOs/FIXMEs addressed or documented
- [ ] Git repository is clean (no uncommitted changes)

### Environment Variables
- [ ] All required environment variables documented in `.env.example`
- [ ] `.env.local` is in `.gitignore` (never commit secrets!)
- [ ] Production env vars ready for Netlify dashboard

### Database
- [ ] All Supabase migrations run successfully
- [ ] Database tables have proper indexes
- [ ] RLS policies are enabled and tested
- [ ] Test data cleared (optional)

### Security
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is NEVER exposed client-side
- [ ] API routes have rate limiting
- [ ] Input validation on all forms
- [ ] XSS protection in place (DOMPurify for user content)

## 🔧 Deployment Configuration

### Netlify Setup
- [ ] `netlify.toml` configured correctly
- [ ] `@netlify/plugin-nextjs` installed (`npm install --save-dev @netlify/plugin-nextjs`)
- [ ] Build command: `npm run build`
- [ ] Node version: 18+

### Environment Variables (Netlify Dashboard)
Set these in **Site settings → Environment variables**:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id
NEXT_PUBLIC_APP_URL=https://your-site.netlify.app
```

## 🧪 Post-Deployment Testing

### Core Features
- [ ] Wallet connection works (test multiple wallets)
- [ ] Can view proposal list
- [ ] Can vote on proposals
- [ ] XP and coins awarded correctly
- [ ] Notifications working
- [ ] Achievements unlock properly

### Share/Referral System
- [ ] Can generate share links
- [ ] Referral codes captured from URL
- [ ] New users get 10 VQC welcome bonus
- [ ] Referrers get 5 VQC per conversion
- [ ] Daily referral limits enforced
- [ ] QR codes generate correctly

### Blockchain Features
- [ ] Blockchain votes recorded on-chain
- [ ] Transaction verification works
- [ ] Gas fee estimation accurate
- [ ] Failed transactions handled gracefully

### UI/UX
- [ ] Mobile responsive (test on actual devices)
- [ ] Loading states work correctly
- [ ] Error messages are user-friendly
- [ ] Animations smooth (no jank)
- [ ] All images load properly

## 📊 Monitoring

### Setup Monitoring
- [ ] Netlify function logs reviewed
- [ ] Supabase usage dashboard checked
- [ ] Error tracking configured (optional: Sentry)
- [ ] Analytics setup (optional)

### Performance
- [ ] Lighthouse score > 90 (run in incognito)
- [ ] First contentful paint < 2s
- [ ] Time to interactive < 4s
- [ ] No console errors in production

## 🔄 Continuous Deployment

### Git Workflow
- [ ] Main branch protected
- [ ] Deploy previews enabled for PRs
- [ ] Auto-deploy on merge to main

### Rollback Plan
- [ ] Know how to revert to previous deploy (Netlify dashboard)
- [ ] Database backup strategy in place
- [ ] Emergency contact list ready

## 📝 Documentation

- [ ] `README.md` updated with project overview
- [ ] `DEPLOYMENT.md` contains deployment instructions
- [ ] API endpoints documented (if applicable)
- [ ] Environment variables documented in `.env.example`

## 🎉 Go Live!

Once all checks pass:

1. Click **Deploy site** in Netlify
2. Monitor build logs for errors
3. Test deployed site thoroughly
4. Share with team
5. 🍾 Celebrate!

---

## 🆘 Troubleshooting

If deployment fails, check:
1. Build logs in Netlify dashboard
2. All env vars are set correctly
3. Node version matches (18+)
4. Dependencies installed (`package.json` up to date)

See `DEPLOYMENT.md` for detailed troubleshooting guide.
