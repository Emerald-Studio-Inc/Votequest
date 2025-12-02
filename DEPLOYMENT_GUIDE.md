# VoteQuest Production Deployment Guide

## ✅ Your Production URLs:
- **Netlify**: https://votequest.netlify.app
- **Supabase**: https://ejiwzdtksmgxmesenmli.supabase.co

---

## 🚀 Netlify Environment Variables Setup

**Go to:** https://app.netlify.com/sites/votequest/settings/environment

**Click "Add a variable"** and add these 5 variables (exact copy-paste):

### Variable 1:
```
NEXT_PUBLIC_SUPABASE_URL
```
Value:
```
https://ejiwzdtksmgxmesenmli.supabase.co
```

### Variable 2:
```
NEXT_PUBLIC_SUPABASE_ANON_KEY
```
Value:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqaXd6ZHRrc21neG1lc2VubWxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MTU5ODQsImV4cCI6MjA3MzA5MTk4NH0.UzWfkNbDkbDzkd8rhpngT6_PcGgPHemSZ0zZdKXvBu8
```

### Variable 3:
```
NEXT_PUBLIC_APP_URL
```
Value:
```
https://votequest.netlify.app
```

### Variable 4:
```
NEXT_PUBLIC_TURNSTILE_SITE_KEY
```
Value:
```
0x4AAAAAACDfTY6mOuzeIkKB
```

### Variable 5:
```
TURNSTILE_SECRET_KEY
```
Value:
```
0x4AAAAAACDfTaXrGZV4YZo6J76jJbva9YE
```

**After adding all 5 variables:**
- Click "Save"
- Click "Deployments" → "Trigger deploy" → "Deploy site"

---

## 🔐 Supabase URL Configuration

**Go to:** https://app.supabase.com/project/ejiwzdtksmgxmesenmli/auth/url-configuration

### 1. Redirect URLs:
**Add these two URLs** (one per line):
```
https://votequest.netlify.app/auth/callback
http://localhost:3000/auth/callback
```

### 2. Site URL:
**Set to:**
```
https://votequest.netlify.app
```

**Click "Save"**

---

## ✅ Verification Steps

1. **Wait for Netlify deploy** to finish (2-3 minutes)
2. **Open:** https://votequest.netlify.app
3. **Test login:**
   - Enter your email
   - Check email for magic link
   - Click the link
   - Should redirect to: `https://votequest.netlify.app` (NOT localhost!) ✅

---

## 🎉 You're Live!

Once both configs are done and Netlify finishes deploying, your app is production-ready!
