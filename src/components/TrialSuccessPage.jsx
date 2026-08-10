import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, Sparkles, ArrowRight, ShieldCheck, Calendar, Bell } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function TrialSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const plan = searchParams.get('plan') || 'Pro';

  const trialEndDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
  const formattedTrialEnd = trialEndDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  useEffect(() => {
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.5 }
    });
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center text-white relative overflow-hidden">
      {/* Visual background ambient lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-indigo-500/10 blur-[130px] pointer-events-none" />
      
      <div className="max-w-lg w-full bg-secondaryBg/40 border border-white/10 p-8 rounded-3xl space-y-6 shadow-2xl relative z-10 backdrop-blur-xl">
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center bg-indigo-500/10 border border-indigo-500/20 rounded-full">
          <CheckCircle2 className="text-emerald-400" size={44} />
          <Sparkles className="absolute -top-1 -right-1 text-amber-400 animate-pulse" size={20} />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            AUTOPAY MANDATE ACTIVE
          </span>
          <h2 className="text-3xl font-black text-white pt-1">2-Month Free Access Unlocked!</h2>
          <p className="text-xs text-lightGray/70 leading-relaxed max-w-md mx-auto">
            Welcome to InterviewAce <strong className="text-white">{plan}</strong>. Your 2-month free access is active. ₹0 charged today.
          </p>
        </div>

        <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-3 text-xs text-left">
          <div className="flex items-center gap-2.5 text-lightGray/80">
            <Calendar size={16} className="text-indigo-400 flex-shrink-0" />
            <div>
              <span className="text-[10px] text-lightGray/40 uppercase block">Free Access Active Until</span>
              <strong className="text-white">{formattedTrialEnd}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-lightGray/80 border-t border-white/5 pt-3">
            <Bell size={16} className="text-indigo-400 flex-shrink-0" />
            <div>
              <span className="text-[10px] text-lightGray/40 uppercase block">Pre-debit Notification</span>
              <span>We will notify you 48 hours before billing starts. Cancel anytime in Dashboard.</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-lightGray/80 border-t border-white/5 pt-3">
            <ShieldCheck size={16} className="text-emerald-400 flex-shrink-0" />
            <div>
              <span className="text-[10px] text-lightGray/40 uppercase block">Autopay Guarantee</span>
              <span className="text-emerald-300 font-medium">1-Click cancellation available under Billing tab.</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            window.location.href = '/';
          }}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs transition-all shadow-lg flex items-center justify-center gap-2"
        >
          <span>Go to Candidate Dashboard</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
