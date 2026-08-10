import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, ArrowLeft, Lock, User, Mail, 
  Info, AlertCircle, Sparkles, ChevronRight, HelpCircle,
  Calendar, CheckCircle2, RefreshCw, CreditCard, Smartphone
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const PLANS_METADATA = {
  Pro: {
    name: 'Pro Plan',
    monthlyPrice: 199,
    yearlyPrice: 1990,
    features: [
      'Unlimited AI mock interviews',
      'Full ATS Resume Analyzer compatibility',
      'AI Voice interview simulations',
      'Company-specific preparation tracks',
      'Advanced coding runtime diagnostics'
    ]
  },
  Premium: {
    name: 'Premium Plan',
    monthlyPrice: 499,
    yearlyPrice: 4990,
    features: [
      'Everything in Pro plan',
      '24/7 Personal AI Career Coach guidance',
      'Granular performance reports',
      'Priority support response',
      'Unlimited resume revision scans'
    ]
  }
};

// Helper to dynamically inject Razorpay SDK script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function TrialCheckoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { userProfile, refreshUserProfile } = useAuth();
  
  const planId = searchParams.get('plan') || 'Pro';
  const billingPeriod = searchParams.get('period') || 'monthly';
  const isYearly = billingPeriod === 'yearly';

  // Redirect if invalid plan or unauthenticated
  useEffect(() => {
    if (!['Pro', 'Premium'].includes(planId)) {
      navigate('/pricing');
    }
    if (!userProfile) {
      navigate('/pricing');
    }
  }, [planId, userProfile, navigate]);

  const planInfo = PLANS_METADATA[planId] || PLANS_METADATA.Pro;
  const regularPrice = isYearly ? planInfo.yearlyPrice : planInfo.monthlyPrice;

  const [isInitiating, setIsInitiating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Developer mock modal state for sandbox / missing keys
  const [showMockModal, setShowMockModal] = useState(false);
  const [mockData, setMockData] = useState(null);
  const [isMockConfirming, setIsMockConfirming] = useState(false);

  // Date calculation: 2 months (60 days) from today
  const trialEndDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
  const formattedTrialEnd = trialEndDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const handleStartTrialCheckout = async () => {
    setErrorMsg('');
    setIsInitiating(true);

    try {
      // 1. Create trial subscription session on backend
      const res = await API.post('/payments/create-trial-subscription', {
        planName: planId,
        billingPeriod
      });

      const { subscriptionId, keyId, mock, trialEndsAt, planId: backendPlanId } = res.data;

      if (mock) {
        // Fallback for missing keys / local developer mock mode
        setIsInitiating(false);
        setMockData({
          subscriptionId,
          planName: planId,
          billingPeriod,
          trialEndsAt
        });
        setShowMockModal(true);
        return;
      }

      // 2. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setErrorMsg('Failed to load Razorpay Checkout SDK. Please check your internet connection.');
        setIsInitiating(false);
        return;
      }

      // 3. Open Razorpay Subscriptions Autopay Popup
      const options = {
        key: keyId,
        subscription_id: subscriptionId,
        name: 'InterviewAce.AI',
        description: `2-Month Free Access for ${planInfo.name} (${billingPeriod})`,
        image: '/favicon.ico',
        handler: async function (response) {
          try {
            setIsInitiating(true);
            await API.post('/payments/trial-subscription-confirm', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_signature: response.razorpay_signature,
              planName: planId,
              billingPeriod,
              trialEndsAt,
              planId: backendPlanId,
              mock: false
            });

            await refreshUserProfile();
            confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
            navigate(`/trial/success?plan=${planId}&period=${billingPeriod}`);
          } catch (confirmErr) {
            console.error(confirmErr);
            setErrorMsg('Mandate authorized, but failed to confirm subscription on server.');
            setIsInitiating(false);
          }
        },
        prefill: {
          name: userProfile?.name || '',
          email: userProfile?.email || ''
        },
        theme: {
          color: '#4F46E5'
        },
        modal: {
          ondismiss: function () {
            setIsInitiating(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      setIsInitiating(false);

    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to initiate 2-month free access checkout session.');
      setIsInitiating(false);
    }
  };

  // Confirm mock trial for local test mode
  const handleConfirmMockTrial = async () => {
    setIsMockConfirming(true);
    try {
      await API.post('/payments/trial-subscription-confirm', {
        razorpay_subscription_id: mockData?.subscriptionId,
        planName: planId,
        billingPeriod,
        mock: true
      });

      await refreshUserProfile();
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 } });
      setShowMockModal(false);
      navigate(`/trial/success?plan=${planId}&period=${billingPeriod}&mock=true`);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to activate mock trial.');
      setIsMockConfirming(false);
    }
  };

  return (
    <div className="relative pt-32 pb-24 bg-background min-h-screen overflow-x-hidden">
      {/* Glow backgrounds */}
      <div className="absolute top-10 left-10 w-80 h-80 rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-violet-600/10 blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Navigation back */}
        <button 
          onClick={() => navigate('/pricing')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-lightGray/50 hover:text-white mb-8 group transition-colors duration-200"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to pricing options
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left panel */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Header section */}
            <div>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
                <Sparkles size={11} />
                EXCLUSIVE 2-MONTH FREE ACCESS
              </span>
              <h1 className="text-3xl font-black text-white mt-3">Start 2 Months Free Access & Set Autopay</h1>
              <p className="text-xs text-lightGray/60 mt-1">
                Zero charges today. Set up your payment mandate now so your account remains active. Cancel anytime before <span className="text-white font-semibold">{formattedTrialEnd}</span>.
              </p>
            </div>

            {/* Error banner */}
            {errorMsg && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3">
                <AlertCircle className="text-rose-400 mt-0.5 flex-shrink-0" size={16} />
                <p className="text-xs text-rose-300 leading-relaxed font-medium">{errorMsg}</p>
              </div>
            )}

            {/* Guarantees Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 bg-secondaryBg/20 border border-white/5 rounded-2xl flex flex-col justify-between space-y-2">
                <Calendar size={18} className="text-indigo-400" />
                <div>
                  <h4 className="text-xs font-bold text-white">2 Months Free</h4>
                  <p className="text-[10px] text-lightGray/50 mt-0.5">Full premium access until {formattedTrialEnd}</p>
                </div>
              </div>

              <div className="p-4 bg-secondaryBg/20 border border-white/5 rounded-2xl flex flex-col justify-between space-y-2">
                <ShieldCheck size={18} className="text-emerald-400" />
                <div>
                  <h4 className="text-xs font-bold text-white">₹0 Charged Today</h4>
                  <p className="text-[10px] text-lightGray/50 mt-0.5">Mandate registration only, no immediate debit</p>
                </div>
              </div>

              <div className="p-4 bg-secondaryBg/20 border border-white/5 rounded-2xl flex flex-col justify-between space-y-2">
                <RefreshCw size={18} className="text-violet-400" />
                <div>
                  <h4 className="text-xs font-bold text-white">Cancel Anytime</h4>
                  <p className="text-[10px] text-lightGray/50 mt-0.5">Cancel autopay in 1-click from your dashboard</p>
                </div>
              </div>
            </div>

            {/* User Info Details */}
            <div className="bg-secondaryBg/20 border border-white/5 rounded-2xl p-6 space-y-4 backdrop-blur-md">
              <h2 className="text-sm font-bold text-white tracking-wide border-b border-white/5 pb-3 flex items-center justify-between">
                <span>Account Information</span>
                <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Logged In
                </span>
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-lightGray/40 uppercase block">Candidate Name</span>
                  <div className="flex items-center gap-2 px-3.5 py-2.5 bg-white/5 rounded-lg border border-white/5 text-xs text-white">
                    <User size={13} className="text-lightGray/40" />
                    <span>{userProfile?.name || 'Candidate User'}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-lightGray/40 uppercase block">Email Address</span>
                  <div className="flex items-center gap-2 px-3.5 py-2.5 bg-white/5 rounded-lg border border-white/5 text-xs text-white">
                    <Mail size={13} className="text-lightGray/40" />
                    <span>{userProfile?.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Autopay Mandate Notice */}
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                <Lock size={14} className="text-indigo-400" />
                <span>How Autopay Works (RBI Compliant Mandate)</span>
              </div>
              <ul className="space-y-2 text-[11px] text-lightGray/70 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                  <span>Your UPI or Card will be registered for recurring billing with Razorpay.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                  <span>First auto-debit of <strong className="text-white">₹{regularPrice}</strong> will only occur on <strong className="text-white">{formattedTrialEnd}</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                  <span>You will receive an SMS/Email reminder 48 hours before any charge. Cancel anytime with 1-click in Dashboard.</span>
                </li>
              </ul>
            </div>

            {/* Main Checkout Action Button */}
            <button
              onClick={handleStartTrialCheckout}
              disabled={isInitiating}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 disabled:opacity-70 text-white rounded-xl font-bold text-sm shadow-[0_4px_20px_rgba(79,70,229,0.3)] hover:shadow-[0_4px_25px_rgba(79,70,229,0.5)] hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 group"
            >
              {isInitiating ? (
                <>
                  <RefreshCw className="animate-spin" size={16} />
                  <span>Setting Up Mandate...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>Set Up Autopay & Start 2-Month Free Access</span>
                  <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>

            {/* Compliance footer */}
            <div className="flex items-center justify-center gap-4 text-[10px] text-lightGray/40 pt-2">
              <span className="flex items-center gap-1">
                <ShieldCheck size={12} className="text-emerald-500" />
                PCI-DSS Autopay Verified
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
              <span className="flex items-center gap-1">
                <Lock size={10} className="text-emerald-500" />
                256-bit Mandate Encryption
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
              <span className="flex items-center gap-1">
                <CheckCircle2 size={11} className="text-emerald-500" />
                Razorpay Subscriptions
              </span>
            </div>

          </div>

          {/* Right panel: Order Breakdown */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
            
            <div className="bg-secondaryBg/25 border border-white/5 rounded-3xl p-6 backdrop-blur-lg relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-indigo-500/10 blur-[50px] pointer-events-none" />
              
              <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                Free Access Subscription Summary
              </h2>

              {/* Plan Box */}
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-white">{planInfo.name}</h3>
                    <span className="text-[10px] font-semibold text-lightGray/50">
                      Billing Period: {isYearly ? 'Annual' : 'Monthly'} after trial
                    </span>
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                    2-MO FREE
                  </span>
                </div>
                
                {/* Features */}
                <div className="space-y-1.5 border-t border-white/5 pt-3">
                  {planInfo.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[11px] text-lightGray/70">
                      <span className="w-1 h-1 rounded-full bg-indigo-400" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calculation list */}
              <div className="space-y-3 text-xs text-lightGray/70 border-b border-white/5 pb-4 mb-4">
                <div className="flex items-center justify-between">
                  <span>Regular Plan Price</span>
                  <span className="text-white font-mono">₹{regularPrice} / {isYearly ? 'yr' : 'mo'}</span>
                </div>

                <div className="flex items-center justify-between text-emerald-400 font-medium bg-emerald-500/5 p-2.5 rounded-xl border border-emerald-500/10">
                  <span>2-Month Free Access Discount</span>
                  <span className="font-semibold font-mono">-100% OFF</span>
                </div>

                <div className="flex items-center justify-between text-indigo-300 font-medium">
                  <span>First Auto-Debit Date</span>
                  <span className="font-semibold font-mono text-white">{formattedTrialEnd}</span>
                </div>
              </div>

              {/* Grand Total Due Today */}
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <span className="text-sm font-bold text-white block">Due Today</span>
                  <span className="text-[10px] text-lightGray/40 block mt-0.5">Mandate registration only</span>
                </div>
                <span className="text-3xl font-black text-emerald-400 font-mono">₹0.00</span>
              </div>

              <div className="text-[10px] text-lightGray/40 leading-relaxed flex items-start gap-1.5 bg-white/5 p-3 rounded-xl border border-white/5">
                <Info size={13} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                <span>
                  Razorpay will authorize your payment method with a temporary test verification. No subscription charges occur until the 2-month free access ends.
                </span>
              </div>
            </div>

            {/* Assistance Card */}
            <div className="bg-secondaryBg/10 border border-white/5 rounded-2xl p-5 flex items-start gap-3 backdrop-blur-md">
              <HelpCircle size={18} className="text-indigo-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white">Questions about Autopay?</h4>
                <p className="text-[10px] text-lightGray/60 leading-relaxed">
                  Autopay mandates are regulated by the Reserve Bank of India (RBI). You retain full authority to pause or cancel anytime at support@interviewace.ai.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Local developer mock gateway modal */}
      {showMockModal && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-secondaryBg/60 border border-white/10 p-8 rounded-3xl space-y-6 shadow-2xl relative overflow-hidden">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-bold uppercase rounded-full">
                <Sparkles size={11} />
                <span>Developer Test Sandbox</span>
              </div>
              <h3 className="text-xl font-black text-white">Simulate Autopay Mandate</h3>
              <p className="text-xs text-lightGray/60">
                Razorpay credentials are running in test mode. Confirming will activate your 2-month free access locally.
              </p>
            </div>

            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between text-lightGray/60">
                <span>Selected Plan:</span>
                <span className="text-white font-bold">{planId} Plan ({billingPeriod})</span>
              </div>
              <div className="flex justify-between text-lightGray/60">
                <span>Free Access Period:</span>
                <span className="text-emerald-400 font-bold">60 Days (2 Months)</span>
              </div>
              <div className="flex justify-between text-lightGray/60">
                <span>First Auto-Debit:</span>
                <span className="text-white font-mono">{formattedTrialEnd}</span>
              </div>
              <div className="flex justify-between text-lightGray/60 pt-2 border-t border-white/5">
                <span>Due Today:</span>
                <span className="text-emerald-400 font-bold font-mono">₹0.00</span>
              </div>
            </div>

            <button
              onClick={handleConfirmMockTrial}
              disabled={isMockConfirming}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {isMockConfirming ? (
                <span>Activating Free Access...</span>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  <span>Authorize Autopay & Activate Free Access</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowMockModal(false)}
              className="w-full py-2 text-xs text-lightGray/40 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
