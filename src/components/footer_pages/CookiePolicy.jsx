import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Cookie, Sparkles, Database, ShieldAlert } from 'lucide-react';

export default function CookiePolicy() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="relative pt-32 pb-24 bg-background min-h-[80vh] overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-white/5 blur-[120px] pointer-events-none z-0" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Back Button */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-xs font-semibold text-lightGray/50 hover:text-white mb-8 group transition-colors focus:outline-none"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Workspace Home
        </Link>

        {/* Hero title */}
        <div className="mb-12">
          <div className="flex items-center gap-2.5 mb-3">
            <Cookie className="text-white" size={20} />
            <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
              Cookie Preferences
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
            Cookie Policy
          </h1>
          <p className="text-xs text-lightGray/40">
            Last Updated: July 1, 2026
          </p>
        </div>

        {/* Content Card */}
        <div className="glassmorphism premium-border p-8 sm:p-12 rounded-2xl space-y-10 text-sm text-lightGray/85 leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles size={18} className="text-white/60" /> 1. How We Use Cookies
            </h2>
            <p>
              InterviewAce.AI uses cookies and local storage parameters strictly to deliver essential platform functionality. We do **not** run advertising scripts, retargeting modules, or load cross-site behavioral tracking cookies.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Database size={18} className="text-white/60" /> 2. What We Store Locally
            </h2>
            <p>
              To maintain system performance and offline state fallbacks, the client app writes the following settings directly to your browser's local storage:
            </p>
            <table className="w-full text-left text-xs border-collapse border border-white/5">
              <thead>
                <tr className="bg-white/5 text-white">
                  <th className="p-3 border border-white/5 font-bold uppercase tracking-wider">Item Key</th>
                  <th className="p-3 border border-white/5 font-bold uppercase tracking-wider">Purpose</th>
                  <th className="p-3 border border-white/5 font-bold uppercase tracking-wider">Storage Type</th>
                </tr>
              </thead>
              <tbody className="text-lightGray/70">
                <tr className="border-t border-white/5">
                  <td className="p-3 border border-white/5 font-mono text-white/90">interviewace_token</td>
                  <td className="p-3 border border-white/5">JWT Auth token to authenticate API calls to the server.</td>
                  <td className="p-3 border border-white/5">Local Storage</td>
                </tr>
                <tr className="border-t border-white/5">
                  <td className="p-3 border border-white/5 font-mono text-white/90">interviewace_theme</td>
                  <td className="p-3 border border-white/5">Saves color theme choice (Light vs Dark mode).</td>
                  <td className="p-3 border border-white/5">Local Storage</td>
                </tr>
                <tr className="border-t border-white/5">
                  <td className="p-3 border border-white/5 font-mono text-white/90">interviewace_solved</td>
                  <td className="p-3 border border-white/5">Caches solved coding challenge indexes for immediate UI indicators.</td>
                  <td className="p-3 border border-white/5">Local Storage</td>
                </tr>
                <tr className="border-t border-white/5">
                  <td className="p-3 border border-white/5 font-mono text-white/90">interviewace_user</td>
                  <td className="p-3 border border-white/5">Caches candidate profile fields (e.g. skills, streak) for immediate load.</td>
                  <td className="p-3 border border-white/5">Local Storage</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert size={18} className="text-white/60" /> 3. Managing Local Storage
            </h2>
            <p>
              You can wipe these caches at any time by clearing your browser's history or cookie/storage files. Alternatively, clicking **Log Out** in the dashboard header will automatically clear your auth token and user profile caches from local storage.
            </p>
          </section>

          <section className="space-y-4 pt-6 border-t border-white/5">
            <h3 className="text-sm font-bold text-white">General Inquiries</h3>
            <p className="text-xs text-lightGray/60">
              For questions regarding cookie permissions or GDPR storage directives, write to us at <a href="mailto:support@interviewace.ai" className="text-white underline hover:text-lightGray transition-colors">support@interviewace.ai</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
