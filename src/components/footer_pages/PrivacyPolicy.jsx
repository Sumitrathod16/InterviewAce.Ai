import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Eye, Lock, HardDrive } from 'lucide-react';

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="relative pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-24 bg-background min-h-[80vh] overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-white/5 blur-[120px] pointer-events-none z-0" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 w-full min-w-0">
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
            <ShieldCheck className="text-white" size={20} />
            <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
              Legal Compliance
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-xs text-lightGray/40">
            Last Updated: July 1, 2026
          </p>
        </div>

        {/* Content Card */}
        <div className="glassmorphism premium-border p-8 sm:p-12 rounded-2xl space-y-10 text-sm text-lightGray/85 leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Eye size={18} className="text-white/60" /> 1. Information We Collect
            </h2>
            <p>
              At InterviewAce.AI, we limit data collection strictly to information required to provide you with high-fidelity mock interview evaluations and resume audits:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-lightGray/70">
              <li><strong>Account Credentials:</strong> Basic sync data (email, name, target prep roles) linked via Google Firebase Authentication credentials.</li>
              <li><strong>Uploaded Resumes:</strong> PDF document buffers and parsed text representations which you submit for ATS scanner optimizations.</li>
              <li><strong>Evaluation Transcripts:</strong> Audio-to-text response scripts, behavioral diagnostics logs, and sandboxed code execution compilation outputs.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock size={18} className="text-white/60" /> 2. How We Secure Your Data
            </h2>
            <p>
              Security is foundational to our candidate systems. All files and transcript records are encrypted in transit using Transport Layer Security (TLS 1.3) and encrypted at rest in our secure database engines. Resumes uploaded for processing are stored temporarily in high-security cloud buckets with strict time-to-live policies.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <HardDrive size={18} className="text-white/60" /> 3. Data Retention and Deletion
            </h2>
            <p>
              You maintain total control over your candidate files. You can delete your uploaded resumes or clear your mock interview history from the active developer portal at any time. When a history log or profile record is deleted, it is permanently wiped from our active databases and database backups within 30 days.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white">4. API Providers and Integrations</h2>
            <p>
              To run advanced AI resume assessments and generate mock interview flows, we query secure artificial intelligence gateways (like Google Gemini). Data shared with these endpoints is scrubbed of individual identity contexts and is governed by developer-tier strict API boundaries that prohibit models from training on your inputs.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <HardDrive size={18} className="text-white/60" /> 5. Data Handling and Processing
            </h2>
            <p>
              We follow rigorous data processing rules to ensure safety and transparency:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-lightGray/70">
              <li><strong>Resume Extraction:</strong> When you upload a resume, text characters are extracted in memory to compute ATS scores. The PDF file content is deleted automatically within 24 hours from our caching nodes and is never shared or sold.</li>
              <li><strong>Coding Sandbox Submissions:</strong> Code compiled in our mock compiler environments is run in isolated containers. These containers are destroyed immediately after execution completes.</li>
              <li><strong>Mock Audio/Transcripts:</strong> Audio recordings for behavioral rounds are processed for voice-to-text conversion. The raw voice buffers are discarded after parsing, and only the text transcripts are stored in your profile to allow feedback audits. You can purge these transcripts from your dashboard anytime.</li>
            </ul>
          </section>

          <section className="space-y-4 pt-6 border-t border-white/5">
            <h3 className="text-sm font-bold text-white">Contact Our Data Team</h3>
            <p className="text-xs text-lightGray/60">
              For privacy audits, compliance verification, or questions regarding GDPR / CCPA specifications, email us at <a href="mailto:inspirewebapp22@gmail.com" className="text-white underline hover:text-lightGray transition-colors">inspirewebapp22@gmail.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
