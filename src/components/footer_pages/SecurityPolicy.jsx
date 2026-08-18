import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldAlert, Cpu, EyeOff, Server, Lock } from 'lucide-react';

export default function SecurityPolicy() {
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
            <ShieldAlert className="text-white" size={20} />
            <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
              Architecture Security
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
            Security Policy
          </h1>
          <p className="text-xs text-lightGray/40">
            Last Updated: July 1, 2026
          </p>
        </div>

        {/* Content Card */}
        <div className="glassmorphism premium-border p-8 sm:p-12 rounded-2xl space-y-10 text-sm text-lightGray/85 leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock size={18} className="text-white/60" /> 1. Data Encryption
            </h2>
            <p>
              We implement industry-standard cryptography models to protect all candidate transactions:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-lightGray/70">
              <li><strong>In-Transit:</strong> All connections to our Node.js server are encrypted using HTTPS (TLS 1.3).</li>
              <li><strong>At-Rest:</strong> User profiles and database values in MongoDB utilize AES-256 block cipher encryption.</li>
              <li><strong>Passes:</strong> User JWT session tokens utilize standard SHA-256 signature verifications.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Cpu size={18} className="text-white/60" /> 2. AI Execution Safeguards
            </h2>
            <p>
              When evaluating user answers or generating custom learning roadmap modules, data sent to external AI processing services is routed via secure TLS gateways. We mandate strict zero-data-retention parameters, meaning our AI supplier (Google Gemini) cannot retain, reuse, or train its model architectures on the transcripts of your interview assessments.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Server size={18} className="text-white/60" /> 3. Sandboxed Compilation Sandbox
            </h2>
            <p>
              Our Monaco Coding Sandbox executes user-submitted code buffers in isolated container sandboxes. User code cannot query backend storage layers, fetch internal environment keys, or access private ports, ensuring other users and server systems remain fully isolated.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <EyeOff size={18} className="text-white/60" /> 4. Threat Prevention
            </h2>
            <p>
              Our endpoints are protected by rate limiters, SQL/NoSQL injection mitigations, and cross-site scripting (XSS) input filtering. We audit system access and error alerts daily to flag anomalous activity.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert size={18} className="text-white/60" /> 5. Cloud Infrastructure & Authentication Security
            </h2>
            <p>
              Our workspace portal leverages Google Firebase Authentication to authenticate developer sessions. All user profile records, payment configurations, and database credentials are stored in secure cloud systems behind strictly configured IAM security rules. Database connections are restricted to our server subnet, and all administrative dashboards require double-factor verification.
            </p>
          </section>

          <section className="space-y-4 pt-6 border-t border-white/5">
            <h3 className="text-sm font-bold text-white">Report Vulnerabilities</h3>
            <p className="text-xs text-lightGray/60">
              If you discover a security vulnerability in our codebase or endpoints, email our response operations desk at <a href="mailto:inspirewebapp22@gmail.com" className="text-white underline hover:text-lightGray transition-colors">inspirewebapp22@gmail.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
