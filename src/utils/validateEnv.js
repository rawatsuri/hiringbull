/**
 * Validate required environment variables on startup
 * Throws an error if any required variable is missing
 */
export const validateEnv = () => {
    const required = [
        'DATABASE_URL',
    ];

    const optional = [
        'CLERK_PUBLISHABLE_KEY',
        'CLERK_SECRET_KEY',
        'RAZORPAY_KEY_ID',
        'RAZORPAY_KEY_SECRET',
        'INTERNAL_API_KEY',
        'CLERK_WEBHOOK_SECRET',
    ];

    const missing = [];
    const warnings = [];

    // Check required variables
    for (const key of required) {
        if (!process.env[key]) {
            missing.push(key);
        }
    }

    // Check optional variables and warn
    for (const key of optional) {
        if (!process.env[key]) {
            warnings.push(key);
        }
    }

    // Log warnings for optional variables
    if (warnings.length > 0) {
        console.warn(`⚠️  Optional environment variables not set: ${warnings.join(', ')}`);
        console.warn('   Some features may not work correctly.');
    }

    // Throw error for missing required variables
    if (missing.length > 0) {
        throw new Error(
            `❌ Hello Kabeer Missing required environment variables: ${missing.join(', ')}\n` +
            '   Please check your .env file.'
        );
    }

    console.log('✅ Environment variables validated successfully');
    const missingClerk = [];
    if (!process.env.CLERK_PUBLISHABLE_KEY) missingClerk.push('CLERK_PUBLISHABLE_KEY');
    if (!process.env.CLERK_SECRET_KEY) missingClerk.push('CLERK_SECRET_KEY');

    if (missingClerk.length > 0) {
        console.warn(`ℹ️  Clerk keys missing (${missingClerk.join(', ')}): Authentication will be bypassed with mock user.`);
    } else {
        const pubKey = process.env.CLERK_PUBLISHABLE_KEY;
        const secKey = process.env.CLERK_SECRET_KEY;
        console.log(`ℹ️  Clerk keys detected:`);
        console.log(`   - CLERK_PUBLISHABLE_KEY: ${pubKey ? pubKey.substring(0, 10) + '...' : 'MISSING'} (Length: ${pubKey?.length || 0})`);
        console.log(`   - CLERK_SECRET_KEY: ${secKey ? secKey.substring(0, 7) + '...' : 'MISSING'} (Length: ${secKey?.length || 0})`);
    }
    if (!process.env.INTERNAL_API_KEY) {
        console.warn('ℹ️  INTERNAL_API_KEY missing: Admin routes (like POST /api/companies) will be bypassed.');
    }
};
