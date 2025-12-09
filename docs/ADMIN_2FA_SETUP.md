# VoteQuest Admin 2FA Setup Guide

This guide will help you set up Two-Factor Authentication (2FA) for admin access to VoteQuest.

## What You'll Need

- **Authenticator App**: Download one of these on your smartphone:
  - Google Authenticator (iOS/Android) - Recommended
  - Microsoft Authenticator (iOS/Android)
  - Authy (iOS/Android)

- **Admin Passphrase**: You should already have this from your environment variables

## Initial Setup

### Step 1: Generate 2FA Secret

First, you need to generate a 2FA secret key. You have two options:

#### Option A: Let the App Generate It (Recommended for Development)

1. Skip to Step 2 - the app will auto-generate a secret when you first access the setup page
2. The secret will be displayed in console logs
3. Copy it and add to your environment variables

#### Option B: Generate Your Own Secret (Recommended for Production)

Run this command to generate a secure base32 secret:

```bash
node -e "console.log(require('crypto').randomBytes(20).toString('base32'))"
```

Copy the output (example: `JBSWY3DPEHPK3PXP`)

### Step 2: Add to Environment Variables

Add this to your `.env.local` file (or Netlify environment variables):

```env
ADMIN_2FA_SECRET=YOUR_GENERATED_SECRET_HERE
```

**Important**: Use the SAME secret across all environments if you want the same QR code to work everywhere.

### Step 3: Access 2FA Setup Page

1. Open your VoteQuest application
2. Press **Ctrl+Shift+A** (Windows/Linux) or **Cmd+Shift+A** (Mac)
3. Enter your admin passphrase when prompted
4. The 2FA setup wizard will open

### Step 4: Scan QR Code

1. Open your authenticator app on your phone
2. Tap "Add Account" or "+" button
3. Scan the QR code displayed on screen
4. Your authenticator app will now show a 6-digit code that refreshes every 30 seconds

**Can't scan?** Use the manual entry option:
- App Name: VoteQuest Admin
- Secret Key: (shown below the QR code)

### Step 5: Test Your Setup

1. Enter the 6-digit code from your authenticator app
2. If correct, you'll see a success message
3. Setup is complete!

### Step 6: Save Your Backup Secret

**CRITICAL**: Write down or save the secret key somewhere secure:
- Store it in your password manager
- Write it on paper and keep it in a safe place
- This is your backup if you lose your phone

## Using 2FA to Access Admin Dashboard

### Regular Admin Login

1. Press the **Konami Code**: ↑ ↑ ↓ ↓ ← → ← → A
2. Enter your admin passphrase
3. Enter the current 6-digit code from your authenticator app
4. Access granted! (Session expires after 5 minutes)

## Adding Team Members

To give admin access to team members:

1. Share the **admin passphrase** with them (securely)
2. Share the **2FA QR code** or **secret key** with them
3. They scan the same QR code with their authenticator app
4. They can now use their own phone to generate codes

**Note**: Everyone uses the SAME secret/QR code. Each person's phone will generate the same codes at the same time.

## Troubleshooting

### "Invalid 2FA code" Error

**Cause**: Clock sync issues between your phone and server

**Solutions**:
- Ensure your phone's time is set to automatic
- Wait for the next code (they refresh every 30 seconds)
- Check that `ADMIN_2FA_SECRET` matches what you scanned

### Lost Phone / Can't Access Authenticator

**Solution 1**: Use your backup secret key
1. Install authenticator app on a new device
2. Manually enter the secret key you saved
3. Your codes will work again

**Solution 2**: Generate new secret (requires server access)
1. Generate a new `ADMIN_2FA_SECRET`
2. Update environment variables
3. Redeploy your app
4. Re-scan the new QR code on all devices

### QR Code Won't Load

**Cause**: Missing or invalid `ADMIN_2FA_SECRET`

**Solution**:
1. Check server logs for the auto-generated secret
2. Add it to environment variables
3. Redeploy and try again

### Different Codes on Different Phones

**Cause**: Different secrets or clock sync issues

**Solution**:
- Verify all phones scanned the SAME QR code
- Check phone time settings (must be automatic)
- Ensure `ADMIN_2FA_SECRET` hasn't changed

## Security Best Practices

### Do's ✅
- Keep your passphrase and 2FA secret separate and secure
- Use automatic time sync on your phone
- Save backup secret key in a password manager
- Regularly verify session timeouts are working
- Use production secrets in production environments

### Don'ts ❌
- Don't share QR codes/secrets via unencrypted channels
- Don't use the same secret as other services
- Don't disable 2FA once enabled (security downgrade)
- Don't store secrets in client-side code
- Don't commit secrets to version control

## Migration from IP Whitelist

If you previously used IP whitelisting:

1. Set up 2FA following steps above
2. Remove `ADMIN_IP_WHITELIST` from environment variables
3. Delete `app/api/admin/verify-ip/route.ts` file (optional cleanup)
4. Test admin access with new 2FA flow
5. Inform team members of the change

## Environment Variables Reference

```env
# Required for 2FA
ADMIN_2FA_SECRET=JBSWY3DPEHPK3PXP

# Still required
ADMIN_PASSPHRASE=your_secret_passphrase
NEXT_PUBLIC_ENABLE_ADMIN_BACKDOOR=true

# No longer needed (can remove)
ADMIN_IP_WHITELIST=
```

## Tech Stack

- **speakeasy**: TOTP (Time-based One-Time Password) generation
- **qrcode**: QR code generation for easy scanning
- **30-second time window**: Codes refresh every 30 seconds
- **±1 step tolerance**: Allows 30-second clock drift

## Support

If you encounter issues:
1. Check server logs for 2FA-related errors
2. Verify environment variables are set correctly
3. Test with a fresh authenticator app install
4. Ensure you're using the latest VoteQuest code

---

**Last Updated**: December 2025  
**Version**: 1.0.0
