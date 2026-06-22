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
    const subRecord = await Subscription.findOne({ userId: req.user._id });
    
    // Return structured responses with mock history logs
    const billingLogs = [
      { id: 'inv_001', date: '2026-05-16', amount: '₹199.00', status: 'Paid', plan: 'Pro Plan' },
      { id: 'inv_002', date: '2026-04-16', amount: '₹199.00', status: 'Paid', plan: 'Pro Plan' }
    ];

    res.json({
      subscription: subRecord || { plan: 'Free', status: 'none', currentPeriodEnd: null },
      history: req.user.subscription === 'Free' ? [] : billingLogs
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch billing history details.' });
  }
});

export default router;
