import React, { useState } from 'react';
import { Terminal, Mail, Lock, User, Briefcase, Github, Globe, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { isFirebaseConfigured } from '../config/firebase';

export default function AuthScreen({ onAuthSuccess, onClose }) {
  const { login, signup, loginWithGoogle, resetPassword } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Frontend Engineer');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const roles = [
    'Frontend Engineer',
    'Backend Engineer',
    'Fullstack Developer',
    'System Design Architect',
    'Product Manager',
    'HR & Talent Manager'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      toast.error('Please enter your email address.');
      return;
    }

    if (isForgotPassword) {
      setLoading(true);
      try {
        await resetPassword(email);
        setSuccessMsg('A password reset link has been dispatched to your email address.');
        toast.success('Password reset link sent to your email.');
      } catch (err) {
        setErrorMsg(err.message || 'Failed to dispatch reset email.');
        toast.error(err.message || 'Failed to dispatch reset email.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!password.trim()) {
      setErrorMsg('Please enter your password.');
      toast.error('Please enter your password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      toast.error('Password must be at least 6 characters.');
      return;
    }

    if (isSignUp && !name.trim()) {
      setErrorMsg('Please enter your professional name.');
      toast.error('Please enter your professional name.');
      return;
    }

    setLoading(true);
    try {
      let profile;
      if (isSignUp) {
        profile = await signup(email, password, name, role);
        toast.success(`Account created successfully! Welcome, ${name || 'User'}.`);
      } else {
        profile = await login(email, password);
        toast.success('Successfully logged into your workspace!');
      }
      
      if (onAuthSuccess) {
        onAuthSuccess(profile);
      }
    } catch (err) {
      if (err.code === 'auth/google-only') {
        setErrorMsg(err.message);
        toast.error('Google account detected. Please use Google Sign-in to link your password.');
      } else {
        const msg = err.response?.data?.message || err.message || 'Authentication failed. Please verify credentials.';
        setErrorMsg(msg);
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const profile = await loginWithGoogle(password);
      toast.success('Successfully logged in with Google!');
      if (onAuthSuccess) {
        onAuthSuccess(profile);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Google Auth Connection failed.');
      toast.error(err.message || 'Google Auth Connection failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
      <div className="w-full max-w-md p-8 bg-secondaryBg rounded-2xl border border-white/5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        {onClose && (
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-lightGray/40 hover:text-white transition-colors"
          >
            ✕
          </button>
        )}

        {/* Branding Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-white text-background rounded-xl mb-3">
            <Terminal size={22} className="stroke-[2.5]" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            InterviewAce<span className="text-accent">.AI</span>
          </h2>
          <p className="text-xs text-lightGray/55 mt-1 text-center">
            {isForgotPassword 
              ? "Recover access to your credentials" 
              : isSignUp 
                ? "Create your professional preparation workspace" 
                : "Log in to your candidate workspace"}
          </p>
        </div>

        {/* Local Developer mock warning */}
        {!isFirebaseConfigured && (
          <div className="p-3 mb-4 bg-white/5 border border-white/10 rounded-lg text-[10px] text-lightGray/70 flex items-start gap-2">
            <AlertCircle size={14} className="text-white mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold text-white">Developer Sandbox Mode:</span> Firebase Config is empty. Local credentials will automatically generate local DB test sync logins.
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-lg text-xs text-red-300 leading-relaxed text-center">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-900/50 rounded-lg text-xs text-emerald-300 leading-relaxed text-center">
              {successMsg}
            </div>
          )}

          {isSignUp && !isForgotPassword && (
            <>
              {/* Name */}
              <div>
                <label className="block text-[10px] font-bold text-lightGray/50 uppercase mb-1.5">Full Name</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-3.5 text-lightGray/40" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Sarah Chen"
                    className="w-full bg-background/50 text-white rounded-lg pl-9 pr-3 py-3 text-xs border border-white/5 focus:outline-none focus:border-white/30 font-sans"
                  />
                </div>
              </div>

              {/* Target Role Dropdown */}
              <div>
                <label className="block text-[10px] font-bold text-lightGray/50 uppercase mb-1.5">Target Job Track</label>
                <div className="relative">
                  <Briefcase size={14} className="absolute left-3 top-3.5 text-lightGray/40" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-background/50 text-white rounded-lg pl-9 pr-3 py-3 text-xs border border-white/5 focus:outline-none focus:border-white/30 font-sans appearance-none"
                  >
                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label className="block text-[10px] font-bold text-lightGray/50 uppercase mb-1.5">Email address</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-3.5 text-lightGray/40" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-background/50 text-white rounded-lg pl-9 pr-3 py-3 text-xs border border-white/5 focus:outline-none focus:border-white/30 font-sans"
              />
            </div>
          </div>

          {/* Password */}
          {!isForgotPassword && (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[10px] font-bold text-lightGray/50 uppercase">Password</label>
                <button
                  type="button"
                  onClick={() => { setIsForgotPassword(true); setErrorMsg(''); setSuccessMsg(''); }}
                  className="text-[10px] text-lightGray/40 hover:text-white transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-3.5 text-lightGray/40" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-background/50 text-white rounded-lg pl-9 pr-3 py-3 text-xs border border-white/5 focus:outline-none focus:border-white/30 font-sans"
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-white text-background hover:bg-lightGray font-bold text-xs rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <span className="w-3.5 h-3.5 rounded-full border-2 border-background border-t-transparent animate-spin" />}
            {isForgotPassword 
              ? "Send Reset Link" 
              : isSignUp 
                ? "Create Account" 
                : "Access Workspace"}
          </button>
        </form>

        {/* Divider */}
        {!isForgotPassword && (
          <>
            <div className="flex items-center my-5">
              <div className="flex-1 h-[1px] bg-white/5" />
              <span className="px-3 text-[9px] text-lightGray/30 uppercase font-mono font-bold">Or connect via</span>
              <div className="flex-1 h-[1px] bg-white/5" />
            </div>

            {/* Google Authentication */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 glassmorphism border border-white/5 rounded-lg text-xs font-semibold text-white hover:bg-white/5 transition-all disabled:opacity-50"
            >
              <Globe size={14} />
              Continue with Google Account
            </button>
          </>
        )}

        {/* Swap Toggles */}
        <div className="text-center pt-4 mt-6 border-t border-white/5 flex flex-col gap-2">
          {isForgotPassword ? (
            <button
              type="button"
              onClick={() => { setIsForgotPassword(false); setErrorMsg(''); setSuccessMsg(''); }}
              className="text-[11px] text-lightGray/50 hover:text-white font-medium transition-colors"
            >
              Return to Login Page
            </button>
          ) : (
            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); setSuccessMsg(''); }}
              className="text-[11px] text-lightGray/50 hover:text-white font-medium transition-colors"
            >
              {isSignUp ? "Already have an account? Log In" : "Don't have an account? Sign Up"}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
