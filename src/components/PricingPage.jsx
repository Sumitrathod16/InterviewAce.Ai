import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, ArrowLeft, GraduationCap, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PLANS = [
  {
    id: 'BetaCore',
    name: 'Core Practice',
    desc: 'For individuals exploring core mock interview capabilities.',
    features: [
      'Unlimited AI mock interviews',
      'Standard performance rating feedback',
      'Basic coding sandbox challenges',
      '1 ATS Resume Analysis per day'
    ],
    cta: 'Start Free Practice',
    highlighted: false
  },
  {
    id: 'BetaPro',
    name: 'Public Beta Access',
    desc: 'Full suite of Pro & Premium features unlocked for all beta participants.',
    features: [
      'Unlimited AI mock interviews & voice simulations',
      'Full ATS Resume Analyzer compatibility',
      'AI Voice interview simulations',
      'Company-specific preparation tracks',
      'Advanced coding runtime diagnostics',
      '24/7 Personal AI Career Coach guidance'
    ],
    cta: 'Get Free Beta Access',
    highlighted: true
  },
  {
    id: 'BetaEnterprise',
    name: 'Career Switcher Track',
    desc: 'Targeted preparation for tech roles and salary negotiation.',
    features: [
      'Everything in Public Beta Access',
      'Granular performance reports',
      'Priority response speed',
      'Unlimited resume revision scans'
    ],
    cta: 'Start Free Practice',
    highlighted: false
  }
];

export default function PricingPage({ onViewChange }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const navigate = useNavigate();

  const handlePlanSelect = () => {
    if (onViewChange) {
      onViewChange('dashboard-portal');
    } else {
      navigate('/');
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-xs font-bold text-amber-400 mb-4">
            <Sparkles size={14} />
            <span>Public Beta Version: All Features Are 100% Free</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
            No Subscription Required
          </h1>
          <p className="text-lg text-lightGray/70 mb-8">
            InterviewAce.AI is currently in Beta mode. You get full, unrestricted access to all preparation tools without entering credit card details or payment mandates.
          </p>
        </div>

        {/* Student Special Highlight */}
        <div className="max-w-4xl mx-auto mb-16 glassmorphism premium-border bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-white/5 p-6 rounded-2xl flex flex-col sm:flex-row items-center gap-5">
          <div className="p-3 bg-amber-400/10 text-amber-400 border border-amber-400/20 rounded-xl">
            <GraduationCap size={28} />
          </div>
          <div className="text-left">
            <h3 className="text-base font-bold text-white flex items-center gap-1.5">
              🎓 Free Access for Students & Candidates Worldwide
            </h3>
            <p className="text-xs text-lightGray/70 mt-1">
              All tools including AI Voice Mock Interviews, ATS Resume Analysis, Sandbox Code Compiler, and Career Coach are completely free during our initial public Beta release. Enjoy unlimited practice with zero payment required.
            </p>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {PLANS.map((plan) => (
            <div 
              key={plan.id} 
              className={`p-8 rounded-xl border flex flex-col justify-between transition-all duration-300 ${
                plan.highlighted 
                  ? 'bg-secondaryBg/60 border-white shadow-2xl relative scale-100 md:scale-105' 
                  : 'bg-secondaryBg/30 border-white/5 hover:border-white/10'
              }`}
            >
              {plan.highlighted && (
                <span className="absolute top-0 right-8 -translate-y-1/2 px-3 py-1 rounded bg-amber-400 text-background text-[10px] font-black uppercase tracking-wider">
                  Full Beta Access
                </span>
              )}

              <div>
                <h3 className="text-lg font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-xs text-lightGray/55 mb-6">{plan.desc}</p>

                <div className="flex items-baseline gap-2 mb-8">
                  <span className="text-4xl font-black text-white">FREE</span>
                  <span className="text-xs text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                    Beta Period
                  </span>
                </div>

                <div className="w-full h-[1px] bg-white/5 mb-8" />

                <ul className="space-y-3.5 mb-8">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3">
                      <Check size={14} className="text-emerald-400 mt-0.5 flex-shrink-0 stroke-[2.5]" />
                      <span className="text-xs text-lightGray/85 leading-relaxed">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={handlePlanSelect}
                className={`w-full py-3 rounded-lg text-xs sm:text-sm font-bold transition-all duration-300 ${
                  plan.highlighted 
                    ? 'bg-white text-background hover:bg-lightGray' 
                    : 'glassmorphism text-white hover:bg-white/5 premium-border'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
