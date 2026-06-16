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
  }
}, {
  timestamps: true
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;
