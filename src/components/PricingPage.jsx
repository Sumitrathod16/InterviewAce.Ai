import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, Info, ArrowLeft, GraduationCap, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const PLANS = [
  {
    id: 'Free',
    name: 'Free Plan',
    monthlyPrice: 0,
    yearlyPrice: 0,
    desc: 'For individuals exploring core mock features.',
    features: [
      '3 AI mock interviews per day',
      'Standard performance rating feedback',
      'Basic coding sandbox challenges',
      '1 ATS Resume Analysis per day'
    ],
    cta: 'Start Free Practice',
    highlighted: false
  },
  {
    id: 'Pro',
    name: 'Pro Plan',
    monthlyPrice: 199,
    yearlyPrice: 159,
    desc: 'For active applicants seeking thorough training.',
    features: [
      'Unlimited AI mock interviews',
      'Full ATS Resume Analyzer compatibility',
      'AI Voice interview simulations',
      'Company-specific preparation tracks',
      'Advanced coding runtime diagnostics'
    ],
    cta: 'Start 30-Day Free Trial',
    highlighted: true
  },
  {
    id: 'Premium',
    name: 'Premium Plan',
    monthlyPrice: 499,
    yearlyPrice: 399,
    desc: 'For career switchers wanting specialized support.',
    features: [
      'Everything in Pro plan',
      '24/7 Personal AI Career Coach guidance',
      'Granular performance reports',
      'Priority support response',
      'Unlimited resume revision scans'
    ],
    cta: 'Start 30-Day Free Trial',
    highlighted: false
  }
];

export default function PricingPage({ onViewChange }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const { userProfile } = useAuth();
  const [billingPeriod, setBillingPeriod] = useState('monthly'); // monthly, yearly
  const [loadingPlan, setLoadingPlan] = useState('');

  const handlePlanSelect = async (planId) => {
    if (planId === 'Free') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!userProfile) {
      // Trigger login from dashboard portal handler
      onViewChange('dashboard-portal');
      return;
    }

    setLoadingPlan(planId);
    try {
      const response = await API.post('/payments/checkout', {
        planName: planId,
        billingPeriod
      });
      // Redirect to Stripe/Razorpay checkout URL or local mock success fallback
      window.location.href = response.data.url;
    } catch (err) {
      console.error(err);
      alert('Checkout redirect failed. Ensure backend service is listening.');
    } finally {
      setLoadingPlan('');
    }
  };

  return (
    <div className="relative pt-32 pb-24 bg-background min-h-screen overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-accent/5 blur-[120px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Back Link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-xs font-semibold text-lightGray/50 hover:text-white mb-8 group transition-colors focus:outline-none"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-white mb-4">
            <Sparkles size={12} className="text-accent" />
            <span>Launch Special: 100% Free Trial</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-lightGray/70 mb-8">
            Try any Pro or Premium plan free for 30 days. No upfront commitments. Cancel or downgrade anytime.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-3">
            <span className={`text-xs font-semibold ${billingPeriod === 'monthly' ? 'text-white' : 'text-lightGray/40'}`}>Monthly</span>
            <button
              onClick={() => setBillingPeriod(b => b === 'monthly' ? 'yearly' : 'monthly')}
              className="w-11 h-6 rounded-full bg-secondaryBg premium-border p-0.5 flex relative transition-all duration-300"
            >
              <div className={`w-4.5 h-4.5 rounded-full bg-white transition-all duration-300 ${
                billingPeriod === 'yearly' ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
            <span className={`text-xs font-semibold ${billingPeriod === 'yearly' ? 'text-white' : 'text-lightGray/40'} flex items-center gap-1.5`}>
              Yearly
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white text-background uppercase">Save 20%</span>
            </span>
          </div>
        </div>

        {/* Student Special Highlight */}
        <div className="max-w-4xl mx-auto mb-16 glassmorphism premium-border bg-gradient-to-r from-accent/20 to-white/5 p-6 rounded-2xl flex flex-col sm:flex-row items-center gap-5">
          <div className="p-3 bg-white/10 text-white rounded-xl">
            <GraduationCap size={28} />
          </div>
          <div className="text-left">
            <h3 className="text-base font-bold text-white flex items-center gap-1.5">
              🎓 Student Promotion Active
            </h3>
            <p className="text-xs text-lightGray/70 mt-1">
              InterviewAce.AI is currently free to students for 1 month! Sign up and choose either Pro or Premium plan to activate your 30 days free access. After the month concludes, subscriptions resume at standard rates.
            </p>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {PLANS.map((plan) => {
            const price = billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
            const isCurrent = userProfile?.subscription === plan.id;
            
            return (
              <div 
                key={plan.id} 
                className={`p-8 rounded-xl border flex flex-col justify-between transition-all duration-300 ${
                  plan.highlighted 
                    ? 'bg-secondaryBg/60 border-white shadow-2xl relative scale-100 md:scale-105' 
                    : 'bg-secondaryBg/30 border-white/5 hover:border-white/10'
                }`}
              >
                {/* Popular badge */}
                {plan.highlighted && (
                  <span className="absolute top-0 right-8 -translate-y-1/2 px-3 py-1 rounded bg-white text-background text-[10px] font-bold uppercase tracking-wider">
                    Most Popular
                  </span>
                )}

                <div>
                  {/* Name & Desc */}
                  <h3 className="text-lg font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-xs text-lightGray/55 mb-6">{plan.desc}</p>

                  {/* Pricing */}
                  <div className="flex items-baseline gap-1 mb-8">
                    {plan.id !== 'Free' ? (
                      <>
                        <span className="text-4xl font-black text-white">₹{price}</span>
                        <span className="text-xs text-lightGray/45 font-semibold">/ month</span>
                        <div className="ml-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                          1 Mo Free Trial
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="text-4xl font-black text-white">₹0</span>
                        <span className="text-xs text-lightGray/45 font-semibold">/ month</span>
                      </>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="w-full h-[1px] bg-white/5 mb-8" />

                  {/* Features list */}
                  <ul className="space-y-3.5 mb-8">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3">
                        <Check size={14} className="text-white mt-0.5 flex-shrink-0 stroke-[2.5]" />
                        <span className="text-xs text-lightGray/85 leading-relaxed">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <button
                  type="button"
                  onClick={() => handlePlanSelect(plan.id)}
                  disabled={loadingPlan === plan.id || isCurrent}
                  className={`w-full py-3 rounded-lg text-xs sm:text-sm font-bold transition-all duration-300 ${
                    isCurrent
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 cursor-default'
                      : plan.highlighted 
                        ? 'bg-white text-background hover:bg-lightGray' 
                        : 'glassmorphism text-white hover:bg-white/5 premium-border'
                  }`}
                >
                  {loadingPlan === plan.id ? 'Redirecting...' : isCurrent ? 'Active Subscription' : plan.cta}
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
