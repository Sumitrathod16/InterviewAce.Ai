import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Terminal, Lock, CheckCircle2, AlertTriangle, ArrowRight, Eye, EyeOff, KeyRound, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { isFirebaseConfigured } from '../config/firebase';

export default function ResetPasswordPage({ onOpenAuth }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyResetCode, confirmResetPassword } = useAuth();

  const oobCode = searchParams.get('oobCode');
  const urlEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(urlEmail);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(!!(isFirebaseConfigured && oobCode));
  const [codeValid, setCodeValid] = useState(!isFirebaseConfigured || !!oobCode);
  const [verifyError, setVerifyError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Validate reset code if Firebase is configured
  useEffect(() => {
    const checkCode = async () => {
      if (isFirebaseConfigured && oobCode) {
        try {
          setVerifying(true);
          const recoveredEmail = await verifyResetCode(oobCode);
          if (recoveredEmail) {
            setEmail(recoveredEmail);
          }
          setCodeValid(true);
        } catch (err) {
          console.error('Reset code verification error:', err);
          setCodeValid(false);
          setVerifyError(err.message || 'This password reset link is invalid or has expired.');
        } finally {
          setVerifying(false);
        }
      } else if (isFirebaseConfigured && !oobCode) {
        setCodeValid(false);
        setVerifyError('No reset token provided. Please request a new password reset link.');
        setVerifying(false);
      }
    };

    checkCode();
  }, [oobCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword) {
      toast.error('Please enter a new password.');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match. Please verify your password entry.');
      return;
    }

    setLoading(true);
    try {
      await confirmResetPassword(oobCode, newPassword, email);
      setSubmitted(true);
      toast.success('Password updated successfully!');
    } catch (err) {
      console.error('Confirm reset password error:', err);
      toast.error(err.message || 'Failed to update password. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full glassmorphism border border-white/10 rounded-2xl p-8 shadow-2xl relative z-10 backdrop-blur-xl">
        
        {/* Header Branding */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="p-3.5 bg-gradient-to-br from-white to-gray-200 text-background rounded-2xl mb-3.5 shadow-lg shadow-white/5">
            <KeyRound size={26} className="stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-1.5">
            InterviewAce<span className="text-accent">.AI</span>
          </h1>
          <p className="text-xs text-lightGray/60 mt-1.5 font-medium">
            Reset Candidate Security Credentials
          </p>
        </div>

        {/* Loading Verification State */}
        {verifying && (
          <div className="py-12 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-10 h-10 rounded-full border-3 border-accent border-t-transparent animate-spin" />
            <p className="text-xs text-lightGray/80 font-mono">Verifying reset code authorization...</p>
          </div>
        )}

        {/* Invalid or Expired Token View */}
        {!verifying && !codeValid && (
          <div className="space-y-6 text-center">
            <div className="p-4 bg-red-950/40 border border-red-800/40 rounded-xl text-red-300 flex flex-col items-center gap-2">
              <AlertTriangle size={32} className="text-red-400 mb-1" />
              <h3 className="font-semibold text-sm">Invalid or Expired Link</h3>
              <p className="text-xs text-red-300/80 leading-relaxed max-w-xs">
                {verifyError}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  if (onOpenAuth) onOpenAuth();
                  navigate('/');
                }}
                className="w-full py-3 bg-white text-background hover:bg-lightGray font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                Request New Password Reset Link
              </button>
              <Link
                to="/"
                className="text-xs text-lightGray/60 hover:text-white transition-colors"
              >
                Return to Home Page
              </Link>
            </div>
          </div>
        )}

        {/* Success State */}
        {!verifying && codeValid && submitted && (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400">
              <ShieldCheck size={36} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white mb-1.5">Password Updated Successfully!</h2>
              <p className="text-xs text-lightGray/70 leading-relaxed">
                Your login credentials for <span className="text-white font-medium">{email || 'your account'}</span> have been securely updated.
              </p>
            </div>

            <button
              onClick={() => {
                if (onOpenAuth) {
                  onOpenAuth();
                }
                navigate('/');
              }}
              className="w-full py-3 bg-white text-background hover:bg-lightGray font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              Sign In to Workspace <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* Password Reset Form */}
        {!verifying && codeValid && !submitted && (
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isFirebaseConfigured && (
              <div className="p-3 bg-accent/10 border border-accent/20 rounded-xl text-[11px] text-accent/90 leading-relaxed font-mono">
                ⚡ Developer Sandbox Mode: Update credentials directly for test user {email ? `(${email})` : ''}.
              </div>
            )}

            {email && (
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between text-xs">
                <span className="text-lightGray/60">Account:</span>
                <span className="text-white font-mono font-medium">{email}</span>
              </div>
            )}

            {/* New Password */}
            <div>
              <label className="block text-[10px] font-bold text-lightGray/60 uppercase tracking-wider mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-3.5 text-lightGray/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-background/60 text-white rounded-xl pl-10 pr-10 py-3 text-xs border border-white/10 focus:outline-none focus:border-accent transition-all font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-lightGray/40 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[10px] font-bold text-lightGray/60 uppercase tracking-wider mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-3.5 text-lightGray/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  className="w-full bg-background/60 text-white rounded-xl pl-10 pr-10 py-3 text-xs border border-white/10 focus:outline-none focus:border-accent transition-all font-sans"
                />
              </div>
            </div>

            {/* Validation Match Indicator */}
            {newPassword && confirmPassword && (
              <div className="flex items-center gap-2 text-[11px] font-mono">
                {newPassword === confirmPassword ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={13} /> Passwords match
                  </span>
                ) : (
                  <span className="text-red-400 flex items-center gap-1">
                    <AlertTriangle size={13} /> Passwords do not match
                  </span>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-white text-background hover:bg-lightGray font-bold text-xs rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-white/5"
            >
              {loading && <span className="w-4 h-4 rounded-full border-2 border-background border-t-transparent animate-spin" />}
              Set New Password
            </button>

            <div className="text-center pt-2">
              <Link to="/" className="text-xs text-lightGray/50 hover:text-white transition-colors">
                Back to Home Page
              </Link>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
