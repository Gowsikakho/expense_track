#!/usr/bin/env node

// Environment checker for Clerk configuration
console.log('🔍 Checking Clerk Environment Configuration...\n');

// Check for required environment variables
const requiredVars = {
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY': process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  'CLERK_SECRET_KEY': process.env.CLERK_SECRET_KEY,
};

const optionalVars = {
  'NEXT_PUBLIC_CLERK_SIGN_IN_URL': process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
  'NEXT_PUBLIC_CLERK_SIGN_UP_URL': process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
  'NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL': process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL,
  'NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL': process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL,
};

// Check deprecated variables
const deprecatedVars = {
  'NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL': process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
  'NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL': process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,
};

console.log('📋 Required Variables:');
let allRequired = true;
for (const [key, value] of Object.entries(requiredVars)) {
  if (value) {
    const keyType = value.startsWith('pk_live_') ? '🟢 PRODUCTION' : 
                   value.startsWith('pk_test_') ? '🟡 DEVELOPMENT' : '❓ UNKNOWN';
    console.log(`  ✅ ${key}: ${keyType}`);
  } else {
    console.log(`  ❌ ${key}: MISSING`);
    allRequired = false;
  }
}

console.log('\n📋 Optional Variables:');
for (const [key, value] of Object.entries(optionalVars)) {
  console.log(`  ${value ? '✅' : '⚪'} ${key}: ${value || 'not set'}`);
}

console.log('\n⚠️  Deprecated Variables Check:');
let hasDeprecated = false;
for (const [key, value] of Object.entries(deprecatedVars)) {
  if (value) {
    console.log(`  ❌ ${key}: ${value} (DEPRECATED - REMOVE THIS)`);
    hasDeprecated = true;
  } else {
    console.log(`  ✅ ${key}: not set (good)`);
  }
}

console.log('\n📊 Summary:');
if (!allRequired) {
  console.log('❌ Missing required environment variables');
} else if (hasDeprecated) {
  console.log('⚠️  Using deprecated environment variables - these cause warnings');
} else {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (publishableKey?.startsWith('pk_live_')) {
    console.log('🟢 Production setup - No development keys warning expected');
  } else if (publishableKey?.startsWith('pk_test_')) {
    console.log('🟡 Development setup - Development keys warning is NORMAL');
  } else {
    console.log('❓ Unknown key format');
  }
}

console.log('\n🚀 To eliminate development keys warning:');
console.log('1. Create production instance in Clerk Dashboard');
console.log('2. Replace pk_test_* with pk_live_* in .env.local');
console.log('3. Replace sk_test_* with sk_live_* in .env.local');
console.log('4. Restart your development server');
console.log('\nSee CLERK_PRODUCTION_SETUP.md for detailed instructions.');
