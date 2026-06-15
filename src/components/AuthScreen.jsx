import React, { useState } from 'react';
import { Terminal, Mail, Lock, User, Briefcase, Github, Globe } from 'lucide-react';

export default function AuthScreen({ onAuthSuccess, onClose }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Frontend Engineer');
  const [errorMsg, setErrorMsg] = useState('');

  const roles = [
    'Frontend Engineer',
    'Backend Engineer',
    'Fullstack Developer',
    'System Design Architect',
    'Product Manager',
    'HR & Talent Manager'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please fill in all credentials fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (isSignUp && !name.trim()) {
      setErrorMsg('Please enter your professional name.');
      return;
    }

    onAuthSuccess({
      email,
      name: isSignUp ? name : email.split('@')[0],
      role: isSignUp ? role : 'Technical Specialist'
    });
  };

  const handleSocialMock = (provider) => {
    onAuthSuccess({
      email: `${provider.toLowerCase()}User@example.com`,
      name: `${provider} Candidate`,
      role: 'Frontend Engineer'
    });
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
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-white text-background rounded-xl mb-3">
            <Terminal size={22} className="stroke-[2.5]" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            InterviewAce<span className="text-accent">.AI</span>
          </h2>
          <p className="text-xs text-lightGray/55 mt-1">
            {isSignUp ? "Create your workspace account" : "Log in to your workspace"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-lg text-xs text-red-300 leading-relaxed text-center">
              {errorMsg}
            </div>
          )}

          {isSignUp && (
            <>
              {/* Name */}
              <div>
                <label className="block text-[10px] font-bold text-lightGray/50 uppercase mb-1.5">Full Name</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-3.5 text-lightGray/40" />
                  <input
                    type="text"
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-background/50 text-white rounded-lg pl-9 pr-3 py-3 text-xs border border-white/5 focus:outline-none focus:border-white/30 font-sans"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] font-bold text-lightGray/50 uppercase mb-1.5">Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-3.5 text-lightGray/40" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-background/50 text-white rounded-lg pl-9 pr-3 py-3 text-xs border border-white/5 focus:outline-none focus:border-white/30 font-sans"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 bg-white text-background hover:bg-lightGray font-bold text-xs rounded-lg transition-all"
          >
            {isSignUp ? "Create Account" : "Access Workspace"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-[1px] bg-white/5" />
          <span className="px-3 text-[10px] text-lightGray/30 uppercase font-mono font-bold">Or connect via</span>
          <div className="flex-1 h-[1px] bg-white/5" />
        </div>

        {/* Social Mock Connection */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => handleSocialMock('GitHub')}
            className="flex items-center justify-center gap-2 py-2.5 glassmorphism border border-white/5 rounded-lg text-xs font-semibold text-white hover:bg-white/5 transition-all"
          >
            <Github size={14} />
            GitHub
          </button>
          <button
            onClick={() => handleSocialMock('Google')}
            className="flex items-center justify-center gap-2 py-2.5 glassmorphism border border-white/5 rounded-lg text-xs font-semibold text-white hover:bg-white/5 transition-all"
          >
            <Globe size={14} />
            Google
          </button>
        </div>

        {/* Swap Toggle */}
        <div className="text-center pt-2 border-t border-white/5">
          <button
            onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); }}
            className="text-[11px] text-lightGray/50 hover:text-white font-medium transition-colors"
          >
            {isSignUp ? "Already have an account? Log In" : "Don't have an account? Sign Up"}
          </button>
        </div>

      </div>
    </div>
  );
}
