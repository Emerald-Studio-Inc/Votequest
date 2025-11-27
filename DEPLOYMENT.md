# 🚀 VoteQuest Deployment Guide

## Prerequisites

Before deploying to Netlify, ensure you have:

- ✅ A Netlify account ([sign up](https://app.netlify.com/signup))
- ✅ A Supabase project ([create one](https://supabase.com/dashboard))
- ✅ A WalletConnect project ID ([get one](https://cloud.walletconnect.com/))
- ✅ Git repository connected to your Netlify account

---

## Step 1: Supabase Setup

### 1.1 Run Database Migrations

In your Supabase SQL Editor, run these migrations **in order**:

1. `migrations/share_referral_system.sql` - Share and referral system
2. `migrations/fix_referral_limit.sql` - Referral limit fixes
3. `supabase_achievements.sql` - Achievements system (if not already run)

### 1.2 Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings → API**
4. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY` ⚠️

> ⚠️ **WARNING**: Never commit the service role key or expose it client-side!

---

## Step 2: WalletConnect Setup

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a new project
3. Copy your **Project ID** → `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

---

## Step 3: Deploy to Netlify

### 3.1 Connect Your Repository

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click **Add new site → Import an existing project**
3. Connect to your Git provider (GitHub, GitLab, etc.)
4. Select your VoteQuest repository

### 3.2 Configure Build Settings

Netlify should auto-detect Next.js settings, but verify:

- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Base directory**: (leave empty)

### 3.3 Install Next.js Plugin

The plugin should be auto-installed from `netlify.toml`, but if needed:

```bash
npm install --save-dev @netlify/plugin-nextjs
```

### 3.4 Set Environment Variables

In Netlify Dashboard → **Site settings → Environment variables**, add:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id-here
NEXT_PUBLIC_APP_URL=https://your-site-name.netlify.app
```

> 💡 **Tip**: Use the site name that Netlify assigns or your custom domain

### 3.5 Deploy!

1. Click **Deploy site**
2. Wait for the build to complete (usually 2-3 minutes)
3. 🎉 Your site is live!

---

## Step 4: Post-Deployment Checklist

### 4.1 Test Core Functionality

- [ ] Wallet connection works (MetaMask, Coinbase, etc.)
- [ ] Can view proposals
- [ ] Can vote on proposals
- [ ] XP and coins are awarded correctly
- [ ] Share links work and generate referral codes
- [ ] Achievements unlock properly

### 4.2 Test Referral System

- [ ] Generate a share link
- [ ] Open link in incognito/different browser
- [ ] Connect wallet and vote
- [ ] Verify referrer gets 5 VQC
- [ ] Verify new user gets 10 VQC welcome bonus
- [ ] Check referral daily limits work

### 4.3 Security Checks

- [ ] Service role key is NOT exposed in client-side code
- [ ] RLS policies are enabled in Supabase
- [ ] API routes have rate limiting
- [ ] HTTPS is enforced (Netlify auto-enables this)

---

## Step 5: Custom Domain (Optional)

1. Go to **Site settings → Domain management**
2. Click **Add custom domain**
3. Follow Netlify's DNS configuration instructions
4. Update `NEXT_PUBLIC_APP_URL` to your custom domain

---

## Troubleshooting

### Build Fails

**Error: "Module not found"**
- Check that all dependencies are in `package.json`
- Run `npm install` locally to verify

**Error: "Environment variable not found"**
- Verify all env vars are set in Netlify dashboard
- Check variable names match exactly (case-sensitive)

### Runtime Errors

**"Supabase client error"**
- Check Supabase URL and keys are correct
- Verify Supabase project is not paused

**"WalletConnect connection failed"**
- Verify WalletConnect Project ID is correct
- Check that your domain is added to WalletConnect allowed origins

**Share links don't work**
- Verify `NEXT_PUBLIC_APP_URL` is set to your actual deployed URL
- Check that referral code is captured (check browser console)

---

## Monitoring & Maintenance

### Netlify Functions Logs

View function logs for API routes:
1. Go to **Functions** in Netlify dashboard
2. Click on a function to see logs
3. Monitor for errors

### Supabase Monitoring

1. Go to Supabase Dashboard → **Reports**
2. Monitor database performance
3. Check API usage

---

## Updating Your Site

### Continuous Deployment

Netlify auto-deploys when you push to your main branch:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

### Manual Deploy

1. Go to Netlify Dashboard → **Deploys**
2. Click **Trigger deploy → Deploy site**

---

## Support

- **Netlify Docs**: https://docs.netlify.com/
- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **WalletConnect Docs**: https://docs.walletconnect.com/

---

## 🎉 You're Live!

Your VoteQuest app is now deployed and ready for users. Share your deployment URL with your team and start gathering votes! 

**Deployment URL**: `https://your-site-name.netlify.app`
