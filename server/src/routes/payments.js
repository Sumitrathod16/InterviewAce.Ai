import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';

const router = express.Router();

// Initialize Razorpay Client
const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

let razorpay = null;
if (keyId && keySecret) {
  razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });
  console.log('Razorpay SDK Initialized successfully.');
} else {
  console.warn('RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing. Payments will run in local Mock Purchase Mode.');
}

/**
 * @route   POST /api/payments/checkout
 * @desc    Create Razorpay Payment Link or trigger Mock Purchase
 * @access  Private
 */
router.post('/checkout', protect, async (req, res) => {
  const { planName, billingPeriod } = req.body; // planName: 'Pro' | 'Premium', billingPeriod: 'monthly' | 'yearly'

  if (!planName || !['Pro', 'Premium'].includes(planName)) {
    return res.status(400).json({ message: 'Invalid plan selected.' });
  }

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  // 1. Mock Purchase Mode if Razorpay is not configured
  if (!razorpay) {
    console.log(`[MOCK CHECKOUT] Initiating mock checkout for ${planName} (${billingPeriod})`);
    return res.json({
      url: `${clientUrl}/checkout/success?mock=true&plan=${planName}&period=${billingPeriod}&userId=${req.user._id}`
    });
  }

  // 2. Real Razorpay Payment Link
  try {
    // Determine Price values in INR (Paise)
    // Pro: ₹199/mo, ₹1990/yr. Premium: ₹499/mo, ₹4990/yr.
    let amount = 0;
    if (planName === 'Pro') {
      amount = billingPeriod === 'monthly' ? 19900 : 199000;
    } else {
      amount = billingPeriod === 'monthly' ? 49900 : 499000;
    }

    // Safe 40-char max reference ID: ref_userId_PlanPeriod (e.g. ref_64f9b8c34f321d234a56b78c_PM)
    const planLetter = planName === 'Pro' ? 'P' : 'PR';
    const periodLetter = billingPeriod === 'monthly' ? 'M' : 'Y';
    const referenceId = `ref_${req.user._id}_${planLetter}${periodLetter}`;

    const hostUrl = req.get('host'); // E.g. localhost:5000 or production API URL
    const protocol = req.protocol; // http or https
    const callbackUrl = `${protocol}://${hostUrl}/api/payments/razorpay-callback`;

    const paymentLink = await razorpay.paymentLink.create({
      amount: amount,
      currency: 'INR',
      accept_partial: false,
      reference_id: referenceId,
      description: `InterviewAce AI - ${planName} Plan (${billingPeriod === 'monthly' ? 'Monthly' : 'Annual'})`,
      customer: {
        name: req.user.name || 'Candidate',
        email: req.user.email
      },
      notify: {
        sms: false,
        email: true
      },
      callback_url: callbackUrl,
      callback_method: 'get'
    });

    res.json({ url: paymentLink.short_url });
  } catch (error) {
    console.error('Error creating Razorpay payment link:', error.message);
    res.status(500).json({ message: 'Failed to create payment checkout link.' });
  }
});

/**
 * @route   GET /api/payments/razorpay-callback
 * @desc    Verify Razorpay payment link return signature and update user subscription
 * @access  Public (Redirected from Razorpay)
 */
router.get('/razorpay-callback', async (req, res) => {
  const {
    razorpay_payment_id,
    razorpay_payment_link_id,
    razorpay_payment_link_reference_id,
    razorpay_payment_link_status,
    razorpay_signature
  } = req.query;

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  if (!razorpay_payment_id || !razorpay_payment_link_id || !razorpay_signature) {
    console.error('Callback error: Missing payment verification parameters');
    return res.redirect(`${clientUrl}/checkout/cancel`);
  }

  try {
    // 1. Verify Razorpay Payment Link signature
    const payload = `${razorpay_payment_link_id}|${razorpay_payment_link_reference_id}|${razorpay_payment_link_status}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(payload)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('Invalid Razorpay signature in callback');
      return res.redirect(`${clientUrl}/checkout/cancel`);
    }

    if (razorpay_payment_link_status !== 'paid') {
      console.warn(`Payment link status is not paid: ${razorpay_payment_link_status}`);
      return res.redirect(`${clientUrl}/checkout/cancel`);
    }

    // 2. Decode Reference ID (ref_userId_PlanPeriod)
    const parts = razorpay_payment_link_reference_id.split('_');
    if (parts.length < 3) {
      throw new Error('Malformed reference ID in payment callback');
    }
    const userId = parts[1];
    const planCode = parts[2];

    let planName = 'Pro';
    if (planCode.startsWith('PR')) {
      planName = 'Premium';
    }

    // Update User Sub status in Database
    const user = await User.findByIdAndUpdate(userId, { subscription: planName }, { new: true });
    if (!user) {
      throw new Error('User not found during payment upgrade callback');
    }

    // Upsert Subscription record
    await Subscription.findOneAndUpdate(
      { userId },
      {
        plan: planName,
        status: 'active',
        stripeCustomerId: 'razorpay',
        stripeSubscriptionId: razorpay_payment_id,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      },
      { upsert: true }
    );

    console.log(`Razorpay success callback: Upgraded User ${userId} to subscription ${planName}`);
    res.redirect(`${clientUrl}/checkout/success?plan=${planName}`);
  } catch (error) {
    console.error('Error verifying payment callback:', error.message);
    res.redirect(`${clientUrl}/checkout/cancel`);
  }
});

/**
 * @route   POST /api/payments/mock-activate
 * @desc    Endpoint to instantly activate subscription in mock fallback mode
 * @access  Private
 */
router.post('/mock-activate', protect, async (req, res) => {
  const { planName } = req.body;
  if (!planName || !['Free', 'Pro', 'Premium'].includes(planName)) {
    return res.status(400).json({ message: 'Invalid plan' });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.subscription = planName;
    await user.save();

    // Upsert subscription log
    await Subscription.findOneAndUpdate(
      { userId: user._id },
      {
        plan: planName,
        status: planName === 'Free' ? 'none' : 'active',
        stripeCustomerId: 'mock_cust_id',
        stripeSubscriptionId: 'mock_sub_id',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      },
      { upsert: true }
    );

    res.json({ message: `Successfully activated ${planName} subscription locally!`, user });
  } catch (error) {
    res.status(500).json({ message: 'Failed mock subscription activation.' });
  }
});

/**
 * @route   GET /api/payments/billing-info
 * @desc    Fetch subscription stats and invoice histories
 * @access  Private
 */
router.get('/billing-info', protect, async (req, res) => {
  try {
    res.json({
      subscription: { plan: 'Beta Unlimited', status: 'active', isBeta: true, currentPeriodEnd: null },
      history: []
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch billing history details.' });
  }
});

// ============================================================
// RAZORPAY SUBSCRIPTION / AUTOPAY ENDPOINTS (2-Month Free Access)
// ============================================================

/**
 * @route   POST /api/payments/create-trial-subscription
 * @desc    Create a Razorpay Plan + Subscription with start_at = 2 months from now.
 *          User authenticates payment mandate today (₹0 charged).
 *          Auto-billing begins after 2 months.
 * @access  Private
 */
router.post('/create-trial-subscription', protect, async (req, res) => {
  const { planName, billingPeriod = 'monthly' } = req.body;

  if (!planName || !['Pro', 'Premium'].includes(planName)) {
    return res.status(400).json({ message: 'Invalid plan. Choose Pro or Premium.' });
  }

  // Mock mode — return fake subscription_id
  if (!razorpay) {
    console.log(`[MOCK TRIAL] Creating mock trial subscription for ${planName} (${billingPeriod})`);
    return res.json({
      subscriptionId: `mock_sub_trial_${planName}_${billingPeriod}_${Date.now()}`,
      keyId: 'mock_key',
      mock: true,
      planName,
      billingPeriod
    });
  }

  try {
    // Amount in paise
    const amount = planName === 'Pro'
      ? (billingPeriod === 'monthly' ? 19900 : 199000)
      : (billingPeriod === 'monthly' ? 49900 : 499000);

    const intervalType = billingPeriod === 'monthly' ? 'monthly' : 'yearly';

    // 1. Create Razorpay Plan
    const plan = await razorpay.plans.create({
      period: intervalType,
      interval: 1,
      item: {
        name: `InterviewAce ${planName} Plan (${billingPeriod})`,
        amount,
        currency: 'INR',
        description: `${planName} plan - billed ${billingPeriod} after 2-month free access`
      }
    });

    // 2. start_at = 2 months (60 days) from now (Unix seconds)
    const twoMonthsFromNow = Math.floor(Date.now() / 1000) + (60 * 24 * 60 * 60);

    // 3. Create Subscription with future start date
    const subscription = await razorpay.subscriptions.create({
      plan_id: plan.id,
      total_count: billingPeriod === 'monthly' ? 120 : 10,
      quantity: 1,
      start_at: twoMonthsFromNow,
      customer_notify: 1,
      notes: {
        userId: req.user._id.toString(),
        planName,
        billingPeriod,
        trialType: '2-month-free-access'
      }
    });

    console.log(`[TRIAL SUB] Created sub ${subscription.id} for ${req.user.email}`);

    res.json({
      subscriptionId: subscription.id,
      planId: plan.id,
      keyId,
      mock: false,
      planName,
      billingPeriod,
      trialEndsAt: new Date(twoMonthsFromNow * 1000)
    });
  } catch (error) {
    console.error('Error creating trial subscription:', error.error?.description || error.message);
    res.status(500).json({ message: 'Failed to create trial subscription. Please try again.' });
  }
});

/**
 * @route   POST /api/payments/trial-subscription-confirm
 * @desc    Called after Razorpay popup success — saves mandate & marks user as trialing.
 * @access  Private
 */
router.post('/trial-subscription-confirm', protect, async (req, res) => {
  const {
    razorpay_subscription_id,
    razorpay_payment_id,
    razorpay_signature,
    planName,
    billingPeriod = 'monthly',
    trialEndsAt,
    planId,
    mock = false
  } = req.body;

  try {
    // Mock mode activation
    if (mock) {
      const twoMonthsFromNow = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
      await User.findByIdAndUpdate(req.user._id, { subscription: planName });
      await Subscription.findOneAndUpdate(
        { userId: req.user._id },
        {
          plan: planName,
          status: 'trialing',
          razorpaySubscriptionId: razorpay_subscription_id || `mock_sub_${Date.now()}`,
          razorpayPlanId: planId || '',
          trialEndsAt: twoMonthsFromNow,
          autopayActive: true,
          billingPeriod,
          currentPeriodEnd: twoMonthsFromNow
        },
        { upsert: true }
      );
      console.log(`[MOCK TRIAL CONFIRM] Trial activated for ${req.user.email}`);
      return res.json({ success: true, message: 'Mock trial activated.' });
    }

    // Real mode — verify Razorpay signature
    if (!razorpay_subscription_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing payment verification parameters.' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment signature verification failed.' });
    }

    await User.findByIdAndUpdate(req.user._id, { subscription: planName });

    const trialEnd = trialEndsAt
      ? new Date(trialEndsAt)
      : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

    await Subscription.findOneAndUpdate(
      { userId: req.user._id },
      {
        plan: planName,
        status: 'trialing',
        razorpaySubscriptionId: razorpay_subscription_id,
        razorpayPlanId: planId || '',
        trialEndsAt: trialEnd,
        autopayActive: true,
        billingPeriod,
        currentPeriodEnd: trialEnd
      },
      { upsert: true }
    );

    console.log(`[TRIAL CONFIRM] ${req.user.email} trial confirmed — sub: ${razorpay_subscription_id}`);
    res.json({ success: true, message: 'Trial activated. Autopay mandate registered.' });
  } catch (error) {
    console.error('Error confirming trial subscription:', error.message);
    res.status(500).json({ message: 'Failed to confirm trial subscription.' });
  }
});

/**
 * @route   DELETE /api/payments/cancel-subscription
 * @desc    Cancel user's Razorpay autopay subscription
 * @access  Private
 */
router.delete('/cancel-subscription', protect, async (req, res) => {
  try {
    const subRecord = await Subscription.findOne({ userId: req.user._id });

    if (!subRecord || !subRecord.autopayActive) {
      return res.status(400).json({ message: 'No active autopay subscription found.' });
    }

    const subscriptionId = subRecord.razorpaySubscriptionId;

    // Cancel on Razorpay (skip for mock IDs)
    if (razorpay && subscriptionId && !subscriptionId.startsWith('mock_')) {
      try {
        await razorpay.subscriptions.cancel(subscriptionId, { cancel_at_cycle_end: false });
        console.log(`[CANCEL] Cancelled Razorpay sub ${subscriptionId} for ${req.user.email}`);
      } catch (rzpErr) {
        console.warn(`Razorpay cancel warning: ${rzpErr.error?.description || rzpErr.message}`);
      }
    }

    await Subscription.findOneAndUpdate(
      { userId: req.user._id },
      { status: 'canceled', autopayActive: false }
    );

    await User.findByIdAndUpdate(req.user._id, { subscription: 'Free' });

    console.log(`[CANCEL] Autopay cancelled for ${req.user.email}`);
    res.json({ success: true, message: 'Autopay cancelled. You will not be charged after the trial.' });
  } catch (error) {
    console.error('Error cancelling subscription:', error.message);
    res.status(500).json({ message: 'Failed to cancel subscription. Please contact support.' });
  }
});

export default router;
