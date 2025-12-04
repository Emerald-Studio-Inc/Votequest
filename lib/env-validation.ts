/**
 * Environment Variable Validation
 * Validates required environment variables on app startup
 * Fails fast if critical configuration is missing
 */

export function validateEnvironment() {
    // Only validate in server-side context
    if (typeof window !== 'undefined') {
        return;
    }

    const required = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'NEXT_PUBLIC_TURNSTILE_SITE_KEY',
        'TURNSTILE_SECRET_KEY'
    ];

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        const errorMsg = `
╔════════════════════════════════════════════════════════════╗
║  MISSING REQUIRED ENVIRONMENT VARIABLES                    ║
╚════════════════════════════════════════════════════════════╝

The following environment variables are required but not set:

${missing.map(k => `  ❌ ${k}`).join('\n')}

Please add these to your .env.local file or environment configuration.
See .env.local.example for reference.
`;

        throw new Error(errorMsg);
    }

    console.log('✅ Environment validation passed');
}

/**
 * Validate optional but recommended environment variables
 * Logs warnings instead of throwing errors
 */
export function validateOptionalEnvironment() {
    if (typeof window !== 'undefined') {
        return;
    }

    const optional = [
        'NEXT_PUBLIC_APP_URL',
        'NEXT_PUBLIC_ENABLE_ADMIN_BACKDOOR'
    ];

    const missing = optional.filter(key => !process.env[key]);

    if (missing.length > 0) {
        console.warn('⚠️  Optional environment variables not set:');
        missing.forEach(key => {
            console.warn(`   - ${key}`);
        });
    }

    // Warn if admin backdoor is enabled
    if (process.env.NEXT_PUBLIC_ENABLE_ADMIN_BACKDOOR === 'true') {
        console.warn('⚠️  WARNING: Admin backdoor is ENABLED. Disable in production!');
    }
}
