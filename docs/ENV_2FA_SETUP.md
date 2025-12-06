# Environment Variables for 2FA Setup

## Required Variables

### For 2FA Authentication
```env
# Generate this using: node -e "console.log(require('crypto').randomBytes(20).toString('base32'))"
# Or let the app auto-generate on first setup (check server logs)
ADMIN_2FA_SECRET=

# Your admin passphrase (keep this secure!)
NEXT_PUBLIC_ADMIN_PASSPHRASE=

# Enable admin backdoor (set to 'false' to disable)
NEXT_PUBLIC_ENABLE_ADMIN_BACKDOOR=true
```

## Legacy Variables (Can Remove)

These are no longer needed with 2FA enabled:

```env
# Old IP whitelist - no longer used
# ADMIN_IP_WHITELIST=
```

## Setup Instructions

1. **Generate 2FA Secret**:
   ```bash
   # Run this command to generate a secure secret
   node -e "console.log(require('crypto').randomBytes(20).toString('base32'))"
   ```

2. **Add to `.env.local`** (for local development):
   ```env
   ADMIN_2FA_SECRET=YOUR_GENERATED_SECRET
   NEXT_PUBLIC_ADMIN_PASSPHRASE=your_secure_passphrase
   NEXT_PUBLIC_ENABLE_ADMIN_BACKDOOR=true
   ```

3. **Add to Netlify** (for production):
   - Go to Site settings → Environment variables
   - Add each variable with its value
   - Redeploy your site

4. **Setup 2FA**:
   - Open your app
   - Press Ctrl+Shift+A
   - Scan the QR code with Google Authenticator

## Security Notes

- ✅ Use different secrets for dev/staging/production
- ✅ Never commit secrets to version control
- ✅ Share secrets securely (password manager, encrypted chat)
- ❌ Don't store secrets in client-side code
- ❌ Don't share QR codes publicly

## For Team Members

All team members who need admin access should:
1. Get the admin passphrase from you
2. Scan the same 2FA QR code (or enter the secret manually)
3. Use their authenticator app for login codes

Everyone uses the **same** secret - each phone generates the same codes at the same time.
