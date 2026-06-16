import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import API from '../services/api';

export function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    const activateSubscription = async () => {
      const isMock = searchParams.get('mock') === 'true';
      const plan = searchParams.get('plan') || 'Pro';
      
      if (isMock) {
        try {
          // Trigger local developer subscription mock activation
          await API.post('/payments/mock-activate', { planName: plan });
          setMessage(`Mock payment successful! Activated ${plan} plan.`);
          
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (err) {
          console.error(err);
          setError(true);
          setMessage('Failed to activate mock subscription on server.');
        } finally {
          setLoading(false);
        }
      } else {
        // Real stripe success
        setMessage('Your transaction was authorized successfully. Accessing profile upgrades...');
        
        // Wait a little bit for webhook to process
        setTimeout(() => {
          setLoading(false);
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 }
          });
        }, 3000);
      }
    };

    activateSubscription();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center text-white">
      <div className="max-w-md w-full bg-secondaryBg/40 border border-white/5 p-8 rounded-2xl space-y-6 shadow-2xl">
        {loading ? (
          <div className="space-y-4">
            <Loader2 className="animate-spin text-white mx-auto" size={42} />
            <h2 className="text-xl font-bold">Verifying checkout session...</h2>
            <p className="text-xs text-lightGray/60">{message}</p>
          </div>
        ) : error ? (
          <div className="space-y-4">
            <XCircle className="text-rose-400 mx-auto" size={48} />
            <h2 className="text-xl font-bold text-white">Checkout Error</h2>
            <p className="text-xs text-rose-300">{message}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2.5 bg-white text-background rounded-lg text-xs font-bold font-sans"
            >
              Return Home
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center bg-white/5 rounded-full">
              <CheckCircle className="text-white" size={36} />
              <Sparkles className="absolute -top-1 -right-1 text-white animate-pulse" size={16} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black">Upgrade Activated!</h2>
              <p className="text-xs text-lightGray/70 leading-relaxed">
                Thank you for upgrading. Your plan has been modified on your candidate workspace profile.
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-xs text-lightGray/85 font-mono">
              Status: ACTIVE
            </div>
            <button
              onClick={() => {
                // Hard sync user settings changes and redirect to portal dashboard
                window.location.href = '/';
              }}
              className="w-full py-3 bg-white text-background hover:bg-lightGray rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5"
            >
              Access Workspace Dashboard
              <ArrowRight size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function PaymentCancel() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center text-white">
      <div className="max-w-md w-full bg-secondaryBg/40 border border-white/5 p-8 rounded-2xl space-y-6 shadow-2xl">
        <XCircle className="text-lightGray/40 mx-auto" size={48} />
        <div className="space-y-2">
          <h2 className="text-2xl font-black">Payment Canceled</h2>
          <p className="text-xs text-lightGray/60 leading-relaxed">
            The checkout session was closed without charging your credit details. You can upgrade any time from the billing panel.
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="w-full py-3 bg-white text-background hover:bg-lightGray rounded-lg font-bold text-xs transition-all"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}
