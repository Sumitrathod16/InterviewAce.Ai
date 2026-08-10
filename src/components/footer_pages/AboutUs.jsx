import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass, Target, Rocket, Award } from 'lucide-react';

export default function AboutUs() {
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
            <Compass className="text-white" size={20} />
            <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
              Our Journey
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
            About InterviewAce.AI
          </h1>
          <p className="text-sm text-lightGray/50 leading-relaxed max-w-2xl">
            We are engineering a next-generation simulator designed to make technical and behavioral preparation accessible to students and engineering candidates globally.
          </p>
        </div>

        {/* Content Card */}
        <div className="glassmorphism premium-border p-8 sm:p-12 rounded-2xl space-y-10 text-sm text-lightGray/85 leading-relaxed">
          {/* Mission */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-4 flex items-center gap-2 text-white font-bold text-base">
              <Target size={18} className="text-white/60" /> Our Mission
            </div>
            <div className="md:col-span-8 space-y-2 text-lightGray/70">
              <p>
                Standard interview rounds at major tech employers are notoriously gatekept behind high fees or generic lists. We believe every candidate deserves access to precise, interactive evaluation metrics that evaluate their actual skills.
              </p>
              <p>
                Our objective is to deliver live, simulated rounds that accurately replicate the technical expectations of target firms like Google, TCS, Meta, or Stripe.
              </p>
            </div>
          </div>

          {/* Technology */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start pt-8 border-t border-white/5">
            <div className="md:col-span-4 flex items-center gap-2 text-white font-bold text-base">
              <Rocket size={18} className="text-white/60" /> Advanced Simulation
            </div>
            <div className="md:col-span-8 text-lightGray/70">
              <p>
                InterviewAce.AI blends sandboxed compiler nodes with semantic LLM evaluators to inspect code structure, parse resume layouts for ATS filters, and evaluate verbal answers in real-time. By bridging language models and sandboxed runtime compilers, we give you accurate diagnostics, time/memory estimations, and roadmap tracking tools.
              </p>
            </div>
          </div>

          {/* Principles */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start pt-8 border-t border-white/5">
            <div className="md:col-span-4 flex items-center gap-2 text-white font-bold text-base">
              <Award size={18} className="text-white/60" /> Our Principles
            </div>
            <div className="md:col-span-8 text-lightGray/70 space-y-4">
              <div className="space-y-1">
                <h4 className="font-bold text-white">Candidates First:</h4>
                <p className="text-xs">We value user privacy, data control, and transparent billing. Our tools exist to optimize your confidence and output quality.</p>
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white">Technical Rigor:</h4>
                <p className="text-xs">No generic advice. Our evaluations inspect code correctness, computational complexities, and precise ATS formatting scores.</p>
              </div>
            </div>
          </div>
        </div>



      </div>
    </div>
  );
}

