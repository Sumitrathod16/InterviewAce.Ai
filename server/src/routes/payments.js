import express from 'express';
import Stripe from 'stripe';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';

const router = express.Router();

// Initialize Stripe. We parse the raw webhook body, so express needs special setup
const stripeSecret = process.env.STRIPE_SECRET_KEY;
let stripe = null;
if (stripeSecret) {
  stripe = new Stripe(stripeSecret);
  console.log('Stripe SDK Initialized successfully.');
} else {
  console.warn('STRIPE_SECRET_KEY is missing. Stripe payments will run in local Mock Purchase Mode.');
}

/**
 * @route   POST /api/payments/checkout
 * @desc    Create Stripe Checkout Session or trigger Mock Purchase
 * @access  Private
 */
router.post('/checkout', protect, async (req, res) => {
  const { planName, billingPeriod } = req.body; // planName: 'Pro' | 'Premium', billingPeriod: 'monthly' | 'yearly'

  if (!planName || !['Pro', 'Premium'].includes(planName)) {
    return res.status(400).json({ message: 'Invalid plan selected.' });
  }

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  // 1. Mock Purchase Mode if Stripe is not configured
  if (!stripe) {
    console.log(`[MOCK CHECKOUT] Initiating mock checkout for ${planName} (${billingPeriod})`);
    
    // We redirect directly to success page with query params
    return res.json({
      url: `${clientUrl}/checkout/success?mock=true&plan=${planName}&period=${billingPeriod}&userId=${req.user._id}`
    });
  }

  // 2. Real Stripe Checkout Session
  try {
    // Determine Price values in INR (Paise)
    // Pro: ₹199/mo, ₹1990/yr. Premium: ₹499/mo, ₹4990/yr.
    let amount = 0;
    if (planName === 'Pro') {
      amount = billingPeriod === 'monthly' ? 19900 : 199000;
    } else {
      amount = billingPeriod === 'monthly' ? 49900 : 499000;
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: `InterviewAce AI - ${planName} Plan (${billingPeriod === 'monthly' ? 'Monthly' : 'Annual'})`,
              description: `Unlimited AI mock interviews, detailed ATS reviews, and technical sandbox compilations.`
            },
            unit_amount: amount,
            recurring: {
              interval: billingPeriod === 'monthly' ? 'month' : 'year'
            }
          },
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${clientUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/checkout/cancel`,
      customer_email: req.user.email,
      metadata: {
        userId: req.user._id.toString(),
        planName,
        billingPeriod
      }
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error.message);
    res.status(500).json({ message: 'Failed to create payment checkout session.' });
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

/**
 * @route   POST /api/payments/webhook
 * @desc    Stripe webhook handler to sync subscription states
 * @access  Public (webhook verification)
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !sig || !webhookSecret) {
    // If stripe webhooks aren't active, just send 400
    return res.status(400).send('Stripe Webhook config is incomplete.');
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Stripe webhook verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle billing states
  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { userId, planName } = session.metadata;

      // Update User Sub status
      await User.findByIdAndUpdate(userId, { subscription: planName });

      // Upsert Subscription
      await Subscription.findOneAndUpdate(
        { userId },
        {
          plan: planName,
          status: 'active',
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription,
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        },
        { upsert: true }
      );
      console.log(`Stripe Sync: Upgraded User ${userId} to subscription ${planName}`);
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      
      const subRecord = await Subscription.findOne({ stripeSubscriptionId: subscription.id });
      if (subRecord) {
        subRecord.status = 'canceled';
        subRecord.plan = 'Free';
        await subRecord.save();
        
        await User.findByIdAndUpdate(subRecord.userId, { subscription: 'Free' });
        console.log(`Stripe Sync: Downgraded User ${subRecord.userId} to Free due to subscription cancellation.`);
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook database sync error:', error.message);
    res.status(500).send('Webhook database sync error');
  }
});

export default router;
