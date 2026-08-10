import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  plan: {
    type: String,
    enum: ['Free', 'Pro', 'Premium'],
    default: 'Free'
  },
  status: {
    type: String,
    enum: ['active', 'canceled', 'incomplete', 'past_due', 'trialing', 'unpaid', 'none'],
    default: 'none'
  },
  // Legacy Stripe fields (kept for compatibility)
  stripeCustomerId: {
    type: String,
    default: ''
  },
  stripeSubscriptionId: {
    type: String,
    default: ''
  },
  currentPeriodEnd: {
    type: Date,
    default: null
  },
  // Razorpay Autopay / Subscription fields
  razorpaySubscriptionId: {
    type: String,
    default: ''
  },
  razorpayPlanId: {
    type: String,
    default: ''
  },
  trialEndsAt: {
    type: Date,
    default: null
  },
  autopayActive: {
    type: Boolean,
    default: false
  },
  billingPeriod: {
    type: String,
    enum: ['monthly', 'yearly'],
    default: 'monthly'
  }
}, {
  timestamps: true
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;

