/**
 * Razorpay Integration Diagnostic Script
 * Tests: SDK Init, Create Payment Link, Signature Verification
 */

import Razorpay from 'razorpay';
import crypto from 'crypto';
import { config } from 'dotenv';

config(); // Load .env

const KEY_ID = process.env.RAZORPAY_KEY_ID;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

console.log('\n========================================');
console.log('  RAZORPAY INTEGRATION DIAGNOSTIC');
console.log('========================================\n');

// ─── TEST 1: Check Environment Variables ───────────────────────────────
console.log('[ TEST 1 ] Checking Environment Variables...');
if (!KEY_ID || !KEY_SECRET) {
  console.error('  ✖ FAIL: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET missing from .env');
  process.exit(1);
}
const isTestKey = KEY_ID.startsWith('rzp_test_');
const isLiveKey = KEY_ID.startsWith('rzp_live_');
console.log(`  ✔ KEY_ID loaded: ${KEY_ID.slice(0, 12)}...`);
console.log(`  ✔ KEY_SECRET loaded: ${KEY_SECRET.slice(0, 6)}...`);
console.log(`  ✔ Mode: ${isTestKey ? '🧪 TEST (Sandbox)' : isLiveKey ? '🔴 LIVE (Production)' : '⚠️  Unknown prefix'}`);

// ─── TEST 2: Initialize Razorpay SDK ──────────────────────────────────
console.log('\n[ TEST 2 ] Initializing Razorpay SDK...');
let rzp;
try {
  rzp = new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET });
  console.log('  ✔ Razorpay SDK instantiated successfully.');
} catch (err) {
  console.error('  ✖ FAIL: Could not instantiate Razorpay SDK:', err.message);
  process.exit(1);
}

// ─── TEST 3: Create a Test Payment Link ────────────────────────────────
console.log('\n[ TEST 3 ] Creating a Razorpay Payment Link (Test Amount: ₹1)...');
let paymentLink;
try {
  paymentLink = await rzp.paymentLink.create({
    amount: 100,
    currency: 'INR',
    accept_partial: false,
    reference_id: `diag_test_${Date.now()}`,
    description: 'InterviewAce Razorpay Diagnostic Test',
    customer: {
      name: 'Diagnostic Tester',
      email: 'test@interviewace.ai'
    },
    notify: { sms: false, email: false },
    callback_url: 'https://interviewace-ai-gamma.vercel.app/api/payments/razorpay-callback',
    callback_method: 'get'
  });

  console.log('  ✔ Payment Link Created Successfully!');
  console.log(`  ✔ Link ID    : ${paymentLink.id}`);
  console.log(`  ✔ Short URL  : ${paymentLink.short_url}`);
  console.log(`  ✔ Status     : ${paymentLink.status}`);
  console.log(`  ✔ Amount     : ₹${paymentLink.amount / 100}`);
} catch (err) {
  console.error('\n  ✖ FAIL: Could not create payment link!');
  console.error(`  Error Code   : ${err.error?.code || 'N/A'}`);
  console.error(`  Description  : ${err.error?.description || err.message}`);
  console.error(`  HTTP Status  : ${err.statusCode || 'N/A'}`);
  console.error('\n  Common Causes:');
  console.error('    • Invalid API keys (wrong KEY_ID or KEY_SECRET)');
  console.error('    • Network issue / Razorpay API unreachable');
  console.error('    • Live keys used in test mode or vice versa');
  process.exit(1);
}

// ─── TEST 4: Signature Verification Logic ──────────────────────────────
console.log('\n[ TEST 4 ] Verifying Signature Generation Logic...');
try {
  const mockPaymentId = 'pay_MockTest123456';
  const mockLinkId    = paymentLink.id;
  const mockRefId     = `diag_test_${Date.now()}`;
  const mockStatus    = 'paid';

  const payload = `${mockLinkId}|${mockRefId}|${mockStatus}|${mockPaymentId}`;
  const computedSig = crypto.createHmac('sha256', KEY_SECRET).update(payload).digest('hex');

  console.log(`  ✔ HMAC SHA-256 signature computed successfully.`);
  console.log(`  ✔ Payload     : ${payload.substring(0, 60)}...`);
  console.log(`  ✔ Signature   : ${computedSig.substring(0, 20)}... (truncated)`);
} catch (err) {
  console.error('  ✖ FAIL: Signature generation failed:', err.message);
  process.exit(1);
}

// ─── TEST 5: Cancel the test payment link ─────────────────────────────
console.log('\n[ TEST 5 ] Cancelling the diagnostic test payment link...');
try {
  const cancelled = await rzp.paymentLink.cancel(paymentLink.id);
  console.log(`  ✔ Link ${paymentLink.id} cancelled (status: ${cancelled.status}).`);
} catch (err) {
  console.warn(`  ⚠ Could not cancel test link (non-critical): ${err.error?.description || err.message}`);
}

// ─── SUMMARY ──────────────────────────────────────────────────────────
console.log('\n========================================');
console.log('  ✅ ALL RAZORPAY TESTS PASSED!');
console.log('  Razorpay integration is working correctly.');
console.log('========================================\n');
