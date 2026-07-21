import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  CreditCard, Smartphone, Building2, Wallet, CheckCircle, 
  Loader2, ShieldCheck, ArrowLeft, Lock, User, Mail, 
  Info, AlertCircle, Sparkles, ChevronRight, HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

// Plan pricing metadata
const PLANS_METADATA = {
  Free: {
    name: 'Free Plan',
    price: 0,
    features: [
      '3 AI mock interviews per day',
      'Standard performance rating feedback',
      'Basic coding sandbox challenges',
      '1 ATS Resume Analysis per day'
    ]
  },
  Pro: {
    name: 'Pro Plan',
    price: 199,
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
    price: 499,
    features: [
      'Everything in Pro plan',
      '24/7 Personal AI Career Coach guidance',
      'Granular performance reports',
      'Priority support response',
      'Unlimited resume revision scans'
    ]
  }
};

export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { userProfile, refreshUserProfile } = useAuth();
  
  // Get plan details from URL params
  const planId = searchParams.get('plan') || 'Pro';
  const billingPeriod = searchParams.get('period') || 'monthly';
  const isYearly = billingPeriod === 'yearly';

  // Redirect to home if invalid plan selected
  useEffect(() => {
    if (!['Pro', 'Premium'].includes(planId)) {
      navigate('/pricing');
    }
  }, [planId, navigate]);

  // Auth check
  useEffect(() => {
    if (!userProfile) {
      navigate('/');
    }
  }, [userProfile, navigate]);

  const planInfo = PLANS_METADATA[planId] || PLANS_METADATA.Pro;
  
  // Determine pricing in INR
  // Pro Monthly: 199, Pro Yearly: 1990
  // Premium Monthly: 499, Premium Yearly: 4990
  const totalPrice = planId === 'Pro' 
    ? (isYearly ? 1990 : 199) 
    : (isYearly ? 4990 : 499);

  // Since backend charges exactly totalPrice, we treat this total as GST-inclusive.
  // Base Price + 18% GST = Total Price => Base Price = Total Price / 1.18
  const basePrice = totalPrice / 1.18;
  const totalGst = totalPrice - basePrice;
  const cgst = totalGst / 2;
  const sgst = totalGst / 2;

  // 1-Month Free Trial launch discount
  const trialDiscount = totalPrice;
  const dueToday = 0;

  // Checkout states
  const [selectedMethod, setSelectedMethod] = useState('card'); // card | upi | netbanking | wallet
  const [isInitiating, setIsInitiating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Mock Gateway Modal States
  const [showMockModal, setShowMockModal] = useState(false);
  const [mockStep, setMockStep] = useState('inputs'); // inputs | processing | otp | success
  const [processingStatus, setProcessingStatus] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [otpError, setOtpError] = useState('');
  
  // Card Inputs state
  const [cardNo, setCardNo] = useState('');
  const [cardHolder, setCardHolder] = useState(userProfile?.name || '');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardFlipped, setCardFlipped] = useState(false);
  
  // UPI inputs state
  const [upiId, setUpiId] = useState('');

  // Auto-detect Card Type
  const getCardType = (number) => {
    const cleanNo = number.replace(/\D/g, '');
    if (cleanNo.startsWith('4')) return 'Visa';
    if (/^(5[1-5]|2[2-7])/.test(cleanNo)) return 'Mastercard';
    if (/^(60|65|81|82)/.test(cleanNo)) return 'RuPay';
    return 'Card';
  };

  // Format card number with spaces every 4 digits
  const handleCardNoChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    const parts = [];
    for (let i = 0; i < value.length; i += 4) {
      parts.push(value.slice(i, i + 4));
    }
    setCardNo(parts.join(' '));
  };

  // Format expiry as MM/YY
  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) {
      setCardExpiry(`${value.slice(0, 2)}/${value.slice(2)}`);
    } else {
      setCardExpiry(value);
    }
  };

  // Form validations
  const isCardFormValid = () => {
    const cleanCard = cardNo.replace(/\s/g, '');
    const cleanExpiry = cardExpiry.replace(/\D/g, '');
    return cleanCard.length === 16 && cleanExpiry.length === 4 && cardCvv.length === 3 && cardHolder.trim().length > 2;
  };

  const isUpiFormValid = () => {
    return upiId.includes('@') && upiId.length > 3;
  };

  const handlePayClick = async () => {
    setErrorMsg('');
    setIsInitiating(true);

    try {
      const response = await API.post('/payments/checkout', {
        planName: planId,
        billingPeriod
      });

      const checkoutUrl = response.data.url;

      if (checkoutUrl.includes('mock=true')) {
        // Razorpay is not configured (Local Developer Mock Mode)
        setIsInitiating(false);
        setMockStep('inputs');
        setShowMockModal(true);
      } else {
        // Real Razorpay integration link generated
        window.location.href = checkoutUrl;
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to initiate secure payment session. Please check connection.');
      setIsInitiating(false);
    }
  };

  // Simulate Payment Authorization Steps
  const startMockPaymentProcessing = async () => {
    setMockStep('processing');
    
    const statuses = [
      'Establishing secure handshake with bank gateway...',
      'Verifying credit accounts status...',
      'Querying anti-fraud validation system...',
      'Securing one-time authorization token...'
    ];

    for (let i = 0; i < statuses.length; i++) {
      setProcessingStatus(statuses[i]);
      await new Promise(r => setTimeout(r, 900));
    }

    setMockStep('otp');
  };

  // Verify Mock OTP
  const handleVerifyOtp = async () => {
    setOtpError('');
    if (otpValue !== '123456') {
      setOtpError('Invalid authorization OTP. Enter 123456 for developer mock verification.');
      return;
    }

    setMockStep('processing');
    setProcessingStatus('Authorizing transaction funds and upgrading subscription profile...');
    
    try {
      // Call mock activate endpoint on backend
      await API.post('/payments/mock-activate', { planName: planId });
      
      setMockStep('success');
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.5 }
      });
      
      // Refresh auth profile locally so changes are visible instantly
      await refreshUserProfile();
      
      // Wait 2.5 seconds to show successful confirmation, then redirect
      setTimeout(() => {
        navigate(`/checkout/success?mock=true&plan=${planId}&period=${billingPeriod}`);
      }, 2500);

    } catch (err) {
      console.error(err);
      setMockStep('inputs');
      setErrorMsg('Transaction succeeded but failed to sync upgrade with the candidate account. Contact support.');
    }
  };

  return (
    <div className="relative pt-32 pb-24 bg-background min-h-screen overflow-x-hidden">
      {/* Background radial glows */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-violet-600/5 blur-[130px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Navigation back */}
        <button 
          onClick={() => navigate('/pricing')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-lightGray/40 hover:text-white mb-8 group transition-colors duration-200"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to pricing options
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left panel: Invoice checkout details */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Header section */}
            <div>
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full">
                SECURE CHECKOUT
              </span>
              <h1 className="text-3xl font-black text-white mt-3">Confirm & Pay</h1>
              <p className="text-xs text-lightGray/60 mt-1">
                Verify your order details below and complete payment via Razorpay.
              </p>
            </div>

            {/* Error notifications */}
            {errorMsg && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3">
                <AlertCircle className="text-rose-400 mt-0.5 flex-shrink-0" size={16} />
                <p className="text-xs text-rose-300 leading-relaxed font-medium">{errorMsg}</p>
              </div>
            )}

            {/* Billing Information Details */}
            <div className="bg-secondaryBg/20 border border-white/5 rounded-2xl p-6 space-y-4 backdrop-blur-md">
              <h2 className="text-sm font-bold text-white tracking-wide border-b border-white/5 pb-3">
                User & Billing Details
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-lightGray/40 uppercase block">Candidate Name</span>
                  <div className="flex items-center gap-2 px-3.5 py-2.5 bg-white/5 rounded-lg border border-white/5 text-xs text-white">
                    <User size={13} className="text-lightGray/40" />
                    <span>{userProfile?.name || 'Anonymous User'}</span>
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

            {/* Payment Method Selector */}
            <div className="bg-secondaryBg/20 border border-white/5 rounded-2xl p-6 space-y-6 backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h2 className="text-sm font-bold text-white tracking-wide">
                  Select Razorpay Payment Method
                </h2>
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-indigo-400">
                  <Lock size={11} className="stroke-[2.5]" />
                  <span>Fully Secured</span>
                </div>
              </div>

              {/* Methods Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                
                {/* Cards */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('card')}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all duration-300 ${
                    selectedMethod === 'card' 
                      ? 'bg-indigo-500/10 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                      : 'bg-white/5 border-white/5 text-lightGray/50 hover:bg-white/10'
                  }`}
                >
                  <CreditCard size={20} />
                  <span className="text-[11px] font-semibold">Credit/Debit</span>
                </button>

                {/* UPI */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('upi')}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all duration-300 ${
                    selectedMethod === 'upi' 
                      ? 'bg-indigo-500/10 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                      : 'bg-white/5 border-white/5 text-lightGray/50 hover:bg-white/10'
                  }`}
                >
                  <Smartphone size={20} />
                  <span className="text-[11px] font-semibold">UPI/QR</span>
                </button>

                {/* Netbanking */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('netbanking')}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all duration-300 ${
                    selectedMethod === 'netbanking' 
                      ? 'bg-indigo-500/10 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                      : 'bg-white/5 border-white/5 text-lightGray/50 hover:bg-white/10'
                  }`}
                >
                  <Building2 size={20} />
                  <span className="text-[11px] font-semibold">Net Banking</span>
                </button>

                {/* Wallet */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('wallet')}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all duration-300 ${
                    selectedMethod === 'wallet' 
                      ? 'bg-indigo-500/10 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                      : 'bg-white/5 border-white/5 text-lightGray/50 hover:bg-white/10'
                  }`}
                >
                  <Wallet size={20} />
                  <span className="text-[11px] font-semibold">Wallets</span>
                </button>
              </div>

              {/* Dynamic instruction area */}
              <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-2">
                {selectedMethod === 'card' && (
                  <p className="text-[11px] text-lightGray/70 leading-relaxed">
                    Securely use card networks (Visa, MasterCard, RuPay, Maestro) processed instantly by Razorpay.
                  </p>
                )}
                {selectedMethod === 'upi' && (
                  <p className="text-[11px] text-lightGray/70 leading-relaxed">
                    Pay securely using Google Pay, PhonePe, Paytm, BHIM or any other custom UPI handle.
                  </p>
                )}
                {selectedMethod === 'netbanking' && (
                  <p className="text-[11px] text-lightGray/70 leading-relaxed">
                    Support for all major Indian banks including HDFC, ICICI, SBI, Axis, Kotak and more.
                  </p>
                )}
                {selectedMethod === 'wallet' && (
                  <p className="text-[11px] text-lightGray/70 leading-relaxed">
                    Allows transaction checkouts using digital wallets such as Mobikwik, Freecharge, etc.
                  </p>
                )}
              </div>
            </div>

            {/* Proceed to Payment Action Button */}
            <button
              onClick={handlePayClick}
              disabled={isInitiating}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 disabled:opacity-70 text-white rounded-xl font-bold text-sm shadow-[0_4px_20px_rgba(79,70,229,0.25)] hover:shadow-[0_4px_25px_rgba(79,70,229,0.4)] hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 group"
            >
              {isInitiating ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>Contacting Secure Gateway...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  <span>Activate 1-Month Free Trial (₹0 Due Today)</span>
                  <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>

            {/* Secure compliance footer */}
            <div className="flex items-center justify-center gap-4 text-[10px] text-lightGray/40">
              <span className="flex items-center gap-1">
                <ShieldCheck size={12} className="text-emerald-500" />
                PCI-DSS Compliant
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
              <span className="flex items-center gap-1">
                <Lock size={10} className="text-emerald-500" />
                256-bit SSL Encryption
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
              <span className="flex items-center gap-1">
                <CheckCircle size={11} className="text-emerald-500" />
                Razorpay Verified Seller
              </span>
            </div>

          </div>

          {/* Right panel: Sticky Order Breakdown Summary */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
            
            <div className="bg-secondaryBg/25 border border-white/5 rounded-3xl p-6 backdrop-blur-lg relative overflow-hidden">
              {/* Radial color bleed inside card */}
              <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-indigo-500/10 blur-[50px] pointer-events-none" />
              
              <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                Order Summary
              </h2>

              {/* Selected Plan Details Box */}
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-white">{planInfo.name}</h3>
                    <span className="text-[10px] font-semibold text-lightGray/50">
                      Billing Period: {isYearly ? 'Annual' : 'Monthly'}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-bold text-white bg-indigo-500/20 border border-indigo-500/20 rounded-md">
                    {isYearly ? 'Save 20%' : 'Standard'}
                  </span>
                </div>
                
                {/* Feature highlights bullet list */}
                <div className="space-y-1.5 border-t border-white/5 pt-3">
                  {planInfo.features.slice(0, 3).map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[11px] text-lightGray/70">
                      <span className="w-1 h-1 rounded-full bg-indigo-400" />
                      <span>{feat}</span>
                    </div>
                  ))}
                  {planInfo.features.length > 3 && (
                    <span className="text-[10px] text-indigo-400 font-semibold block pt-1">
                      + {planInfo.features.length - 3} additional features included
                    </span>
                  )}
                </div>
              </div>

              {/* Invoice calculation list */}
              <div className="space-y-3.5 text-xs text-lightGray/70 border-b border-white/5 pb-4 mb-4">
                <div className="flex items-center justify-between">
                  <span>Subtotal Price</span>
                  <span className="text-white font-mono">₹{basePrice.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    Central GST (CGST 9%)
                    <Info size={11} className="text-lightGray/30 cursor-pointer" title="GST breakdown applied for Indian billing transactions" />
                  </span>
                  <span className="text-white font-mono">₹{cgst.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    State GST (SGST 9%)
                  </span>
                  <span className="text-white font-mono">₹{sgst.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between text-indigo-400 font-medium bg-indigo-500/5 p-2.5 rounded-xl border border-indigo-500/10">
                  <span>GST Included Total</span>
                  <span className="font-semibold font-mono">₹{(cgst + sgst).toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between text-emerald-400 font-medium bg-emerald-500/5 p-2.5 rounded-xl border border-emerald-500/10">
                  <span>1-Month Free Trial Launch Offer</span>
                  <span className="font-semibold font-mono">-₹{totalPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Grand Total */}
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <span className="text-sm font-bold text-white block">Grand Total Due Today</span>
                  <span className="text-[10px] text-lightGray/40 block mt-0.5">Subsequent billing starts in 1 month</span>
                </div>
                <span className="text-3xl font-black text-white font-mono">₹{dueToday.toFixed(2)}</span>
              </div>

              <div className="text-[10px] text-lightGray/40 leading-relaxed flex items-start gap-1.5 bg-white/5 p-3 rounded-xl border border-white/5">
                <AlertCircle size={13} className="text-lightGray/40 mt-0.5 flex-shrink-0" />
                <span>
                  Charges occur instantly. This is a secure transaction. You will be redirected to complete OTP authorizations.
                </span>
              </div>
            </div>

            {/* Assistance card */}
            <div className="bg-secondaryBg/10 border border-white/5 rounded-2xl p-5 flex items-start gap-3 backdrop-blur-md">
              <HelpCircle size={18} className="text-indigo-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white">Need checkout assistance?</h4>
                <p className="text-[10px] text-lightGray/60 leading-relaxed">
                  Have questions about payment options, invoice details or corporate billing? Contact support at support@interviewace.ai.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* LOCAL DEVELOPER MOCK PAYMENT GATEWAY MODAL (Interventions fallback) */}
      {/* ========================================================================= */}
      {showMockModal && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-secondaryBg/40 border border-white/10 p-8 rounded-3xl space-y-6 shadow-2xl relative overflow-hidden">
            {/* Visual bleed backdrop */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px] pointer-events-none" />

            {/* STEP 1: Card/UPI details entry */}
            {mockStep === 'inputs' && (
              <div className="space-y-6">
                
                {/* Modal Title */}
                <div className="text-center">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-bold uppercase rounded-full mb-3">
                    <Sparkles size={11} />
                    <span>Developer Mock Gateway fallback</span>
                  </div>
                  <h3 className="text-xl font-black text-white">Secure Bank Payment portal</h3>
                  <p className="text-xs text-lightGray/60 mt-1">
                    Razorpay credentials not loaded. Running in local test sandbox.
                  </p>
                </div>

                {/* Interactive Method Selector inside Modal */}
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 text-xs text-lightGray/40">
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('card')}
                    className={`flex-1 py-2 font-bold rounded-lg transition-all ${
                      selectedMethod === 'card' ? 'bg-white/10 text-white shadow-sm' : 'hover:text-white'
                    }`}
                  >
                    Credit Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('upi')}
                    className={`flex-1 py-2 font-bold rounded-lg transition-all ${
                      selectedMethod === 'upi' ? 'bg-white/10 text-white shadow-sm' : 'hover:text-white'
                    }`}
                  >
                    UPI Payment
                  </button>
                </div>

                {/* CARD PAYMENT INPUTS FORM */}
                {selectedMethod === 'card' && (
                  <div className="space-y-4">
                    
                    {/* Visual Realistic Card Simulation */}
                    <div className="w-full aspect-[1.586] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 border border-white/10 rounded-2xl p-5 text-white flex flex-col justify-between shadow-lg relative transform transition-transform duration-500 preserve-3d"
                      style={{
                        transform: cardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                        transformStyle: 'preserve-3d'
                      }}
                    >
                      {/* CARD FRONT */}
                      <div className="absolute inset-0 p-5 flex flex-col justify-between backface-hidden"
                        style={{ backfaceVisibility: 'hidden' }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="w-10 h-7 bg-amber-400/25 border border-amber-400/20 rounded-md shadow-inner" /> {/* Chip */}
                          <span className="text-[10px] font-black tracking-widest text-white/50 uppercase">
                            {getCardType(cardNo)}
                          </span>
                        </div>
                        
                        <div className="space-y-1">
                          <span className="text-[10px] text-white/30 tracking-widest uppercase">Card Number</span>
                          <div className="text-base font-mono font-medium tracking-[0.2em] h-6 flex items-center">
                            {cardNo || '•••• •••• •••• ••••'}
                          </div>
                        </div>

                        <div className="flex justify-between items-end">
                          <div className="space-y-0.5">
                            <span className="text-[8px] text-white/30 tracking-wider uppercase block">Cardholder</span>
                            <span className="text-xs font-semibold tracking-wide uppercase max-w-[180px] truncate block">
                              {cardHolder || 'Candidate Account'}
                            </span>
                          </div>
                          <div className="space-y-0.5 text-right">
                            <span className="text-[8px] text-white/30 tracking-wider uppercase block">Expires</span>
                            <span className="text-xs font-mono font-semibold">
                              {cardExpiry || 'MM/YY'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* CARD BACK (Flipped CVV view) */}
                      <div className="absolute inset-0 p-5 flex flex-col justify-between backface-hidden"
                        style={{ 
                          backfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg)'
                        }}
                      >
                        <div className="w-full h-8 bg-slate-950 -mx-5 mt-1 border-y border-white/5" /> {/* Magnetic strip */}
                        
                        <div className="space-y-1">
                          <div className="text-right pr-4">
                            <span className="text-[8px] text-white/30 tracking-wider uppercase block">CVV / Security Code</span>
                            <div className="inline-block px-2.5 py-1 bg-white text-background rounded-md text-xs font-mono font-bold text-right tracking-wider">
                              {cardCvv || '•••'}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[9px] text-white/20 font-mono tracking-widest uppercase">
                            InterviewAce Secure System
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* Inputs */}
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-lightGray/40 uppercase">Cardholder Name</label>
                        <input
                          type="text"
                          required
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          onFocus={() => setCardFlipped(false)}
                          placeholder="Name printed on card"
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:border-indigo-500 focus:outline-none transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-lightGray/40 uppercase">Card Number</label>
                        <input
                          type="text"
                          required
                          value={cardNo}
                          onChange={handleCardNoChange}
                          onFocus={() => setCardFlipped(false)}
                          placeholder="4000 1234 5678 9010"
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:border-indigo-500 focus:outline-none transition-colors font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-lightGray/40 uppercase">Expiry Date</label>
                          <input
                            type="text"
                            required
                            value={cardExpiry}
                            onChange={handleExpiryChange}
                            onFocus={() => setCardFlipped(false)}
                            placeholder="MM/YY"
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:border-indigo-500 focus:outline-none transition-colors font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-lightGray/40 uppercase">CVV</label>
                          <input
                            type="password"
                            required
                            maxLength={3}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                            onFocus={() => setCardFlipped(true)}
                            onBlur={() => setCardFlipped(false)}
                            placeholder="•••"
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:border-indigo-500 focus:outline-none transition-colors font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!isCardFormValid()}
                      onClick={startMockPaymentProcessing}
                      className="w-full mt-4 py-3 bg-white text-background disabled:opacity-40 disabled:hover:bg-white hover:bg-lightGray rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
                    >
                      <span>Authorize Trial (₹0.00 Due Today)</span>
                      <ChevronRight size={12} />
                    </button>

                  </div>
                )}

                {/* UPI MOCK PAYMENT INPUT */}
                {selectedMethod !== 'card' && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-lightGray/40 uppercase">Enter Virtual Payment Address (VPA)</label>
                      <input
                        type="email"
                        required
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="e.g. candidate@okaxis"
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:border-indigo-500 focus:outline-none transition-colors font-mono"
                      />
                    </div>
                    
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-[10px] text-lightGray/50 leading-relaxed">
                      💡 Enter any mock handle containing the symbol `@` to simulate instant UPI push request notification trigger.
                    </div>

                    <button
                      type="button"
                      disabled={!isUpiFormValid()}
                      onClick={startMockPaymentProcessing}
                      className="w-full mt-2 py-3 bg-white text-background disabled:opacity-40 disabled:hover:bg-white hover:bg-lightGray rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
                    >
                      <span>Simulate UPI Verification (₹0.00)</span>
                      <ChevronRight size={12} />
                    </button>
                  </div>
                )}

                {/* Cancel Button */}
                <button
                  type="button"
                  onClick={() => setShowMockModal(false)}
                  className="w-full py-2.5 text-lightGray/40 hover:text-white text-xs font-semibold hover:bg-white/5 rounded-xl transition-all"
                >
                  Cancel Transaction
                </button>

              </div>
            )}

            {/* STEP 2: Processing payment gateway handshake */}
            {mockStep === 'processing' && (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
                <Loader2 className="animate-spin text-indigo-400" size={46} />
                <div className="space-y-1.5">
                  <h4 className="text-base font-bold text-white">Verifying Transaction</h4>
                  <p className="text-xs text-lightGray/50 font-mono tracking-tight animate-pulse px-4">
                    {processingStatus}
                  </p>
                </div>
                <div className="w-32 h-[3px] bg-white/5 rounded-full overflow-hidden relative border border-white/5">
                  <div className="absolute top-0 left-0 h-full w-12 bg-indigo-500 rounded-full animate-progress" 
                    style={{
                      animation: 'progress-bar-movement 2s infinite linear'
                    }}
                  />
                </div>
              </div>
            )}

            {/* STEP 3: OTP authorization */}
            {mockStep === 'otp' && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
                    <Lock className="text-indigo-400" size={20} />
                  </div>
                  <h3 className="text-lg font-black text-white">Enter Security Password</h3>
                  <p className="text-xs text-lightGray/60 mt-1 px-2 leading-relaxed">
                    We've simulated sending a 6-digit OTP verification code to your registered mobile device.
                  </p>
                </div>

                {otpError && (
                  <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-center">
                    <p className="text-[11px] text-rose-300 font-medium leading-relaxed">{otpError}</p>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-lightGray/40 uppercase block text-center">One-Time Password (OTP)</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpValue}
                      onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 123456"
                      className="w-40 mx-auto block px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-center text-sm tracking-[0.4em] font-black font-mono text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-center block text-amber-300 font-mono">
                    💡 Simulated developer verification code: <span className="font-black underline">123456</span>
                  </span>
                </div>

                <div className="space-y-2.5 pt-2">
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                  >
                    Confirm & Authorize Release of Funds
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOtpValue('');
                      setOtpError('');
                      setMockStep('inputs');
                    }}
                    className="w-full py-2.5 text-lightGray/40 hover:text-white text-xs font-semibold hover:bg-white/5 rounded-xl transition-all"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Success Upgrade Confetti State */}
            {mockStep === 'success' && (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-6 animate-fade-in">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center">
                  <CheckCircle className="text-emerald-400" size={36} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-white">Payment Authorized!</h3>
                  <p className="text-xs text-emerald-300/80 font-semibold">
                    Simulating system upgrade profile syncing...
                  </p>
                  <p className="text-[11px] text-lightGray/60 max-w-[280px] leading-relaxed block mx-auto">
                    Thanks for upgrading to {planInfo.name}. You are being redirected back to your main candidate workspace.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Styled animation helper block for CSS injection */}
      <style>{`
        @keyframes progress-bar-movement {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>

    </div>
  );
}
