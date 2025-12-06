# Quick Start: 2FA Deployment Checklist

## Pre-Deployment

### 1. Generate 2FA Secret
```bash
# Run this command to generate your secret
node -e "console.log(require('crypto').randomBytes(20).toString('base32'))"
```

Example output: `JBSWY3DPEHPK3PXP`

### 2. Add to Netlify Environment Variables

Go to: **Netlify Dashboard → Site Settings → Environment Variables**

Add these variables:
```
ADMIN_2FA_SECRET = [paste your generated secret]
NEXT_PUBLIC_ADMIN_PASSPHRASE = [your existing passphrase]
NEXT_PUBLIC_ENABLE_ADMIN_BACKDOOR = true
```

### 3. Remove Old Variable (Optional)
```
ADMIN_IP_WHITELIST = [delete this - no longer needed]
```

### 4. Deploy
- Commit and push your code
- Netlify will auto-deploy

## Post-Deployment

### 5. Setup Your Authenticator

1. Open your deployed VoteQuest app
2. Press **Ctrl+Shift+A** (Windows) or **Cmd+Shift+A** (Mac)
3. Enter your admin passphrase
4. Scan QR code with Google Authenticator
5. Test with a 6-digit code

### 6. Save Your Backup

**CRITICAL**: Copy and save the secret key displayed:
- Password manager ✅
- Secure notes app ✅
- Physical paper in safe ✅

### 7. Share with Team

Send to team members (via secure channel):
- Admin passphrase
- 2FA QR code screenshot OR secret key
- Link to `docs/ADMIN_2FA_SETUP.md`

## Testing Admin Access

### Step 1: Trigger Admin Modal
Press Konami Code: **↑ ↑ ↓ ↓ ← → ← → A**

### Step 2: Enter Credentials
- Passphrase: [your admin passphrase]
- 2FA Code: [6 digits from authenticator app]

### Step 3: Verify Access
- Should see admin dashboard
- Session expires after 5 minutes
- IP address no longer matters ✅

## Rollback Plan (If Needed)

If 2FA causes issues, you can temporarily rollback:

1. **Quick Fix**: Set `NEXT_PUBLIC_ENABLE_ADMIN_BACKDOOR=false` to disable all admin access
2. **Full Rollback**: Revert to previous deployment in Netlify
3. **Debug**: Check server logs for 2FA-related errors

## Common Issues

| Issue | Solution |
|-------|----------|
| "Invalid 2FA code" | Wait 30s for new code, check phone time sync |
| QR code won't load | Check `ADMIN_2FA_SECRET` is set correctly |
| Can't access setup | Verify `NEXT_PUBLIC_ENABLE_ADMIN_BACKDOOR=true` |
| Lost phone | Use backup secret key to setup new device |

## Support Checklist

- [ ] 2FA secret generated and saved
- [ ] Environment variables configured in Netlify
- [ ] Deployed successfully
- [ ] QR code scanned and tested
- [ ] Backup secret saved securely
- [ ] Team members notified
- [ ] Old IP whitelist removed

## Files Changed

- ✅ `app/api/admin/setup-2fa/route.ts` (new)
- ✅ `app/api/admin/verify-2fa/route.ts` (new)
- ✅ `components/AdminPassphraseModal.tsx` (updated)
- ✅ `components/AdminSetup2FA.tsx` (new)
- ✅ `components/VoteQuestApp.tsx` (updated)
- ✅ `package.json` (updated - added speakeasy & qrcode)
- ⚠️ `app/api/admin/verify-ip/route.ts` (can be deleted)

---

**Questions?** See `docs/ADMIN_2FA_SETUP.md` for full documentation.
