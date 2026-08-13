import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PLANS = [
  {
    id: 'BetaCore',
    name: 'Core Practice',
    desc: 'Full access to essential interview practice tools.',
    features: [
      'Unlimited AI mock interviews',
      'Standard performance rating feedback',
      'Interactive coding sandbox challenges',
      'ATS Resume Analysis & scoring'
    ],
    cta: 'Start Practice Free',
    highlighted: false
  },
  {
    id: 'BetaPro',
    name: 'Public Beta Access',
    desc: 'Complete suite of Pro & Premium features unlocked for all beta testers.',
    features: [
      'Unlimited AI mock interviews & voice mode',
      'Deep ATS Resume Analyzer & keyword suggestions',
      'Real-time coding sandbox runtime diagnostics',
      '24/7 Personal AI Career Coach guidance',
      'Company-specific interview tracks'
    ],
    cta: 'Explore All Beta Features',
    highlighted: true
  },
  {
    id: 'BetaEnterprise',
    name: 'Career Switcher Track',
    desc: 'Targeted preparation for tech roles and salary negotiation.',
    features: [
      'Everything in Public Beta Access',
      'Granular performance analytics',
      'Unlimited resume revision scans',
      'Comprehensive system design modules'
    ],
    cta: 'Start Practice Free',
    highlighted: false
  }
];

export default function Pricing() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const handlePlanSelect = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section id="pricing" className="py-24 bg-secondaryBg/10 border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-xs font-bold text-amber-400 mb-6">
            <Sparkles size={14} />
            <span>InterviewAce.AI is currently in Public Beta</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
            100% Free During Public Beta
          </h2>
          <p className="text-lg text-lightGray/70 mb-4">
            No credit cards, no payment mandates, and no hidden fees. All tools and AI simulation features are completely free for all candidates while in Beta.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {PLANS.map((plan) => (
            <div 
              key={plan.id} 
              className={`p-8 rounded-xl border flex flex-col justify-between transition-all duration-300 ${
                plan.highlighted 
                  ? 'bg-secondaryBg/60 border-white shadow-2xl relative' 
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

                {/* Pricing Display */}
                <div className="flex items-baseline gap-2 mb-8">
                  <span className="text-4xl font-black text-white">FREE</span>
                  <span className="text-xs text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">Beta Release</span>
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
    </section>
  );
}
