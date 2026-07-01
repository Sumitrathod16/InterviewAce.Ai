import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, UserPlus, Heart, MapPin, Briefcase } from 'lucide-react';

export default function Careers() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const openPositions = [
    {
      title: 'Full Stack Engineer (AI Integration)',
      department: 'Engineering',
      location: 'Remote (Global)',
      type: 'Full-Time',
      desc: 'Build web systems, manage sandboxed compiler layers, and configure high-performance semantic AI evaluators.'
    },
    {
      title: 'AI Research Intern (LLM Fine-tuning)',
      department: 'AI & Data Science',
      location: 'Bangalore, India (Hybrid)',
      type: 'Internship (6 mos)',
      desc: 'Fine-tune models for structural analysis, code optimization diagnostics, and behavioral metric grading.'
    },
    {
      title: 'Technical Curriculum Lead',
      department: 'Product & Content',
      location: 'Remote (US/EU)',
      type: 'Full-Time',
      desc: 'Design standard algorithm tasks, map interview pipelines for tier-1 firms, and verify assertion stubs.'
    }
  ];

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
            <UserPlus className="text-white" size={20} />
            <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
              Join Our Mission
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
            Careers at InterviewAce
          </h1>
          <p className="text-sm text-lightGray/50 leading-relaxed max-w-2xl">
            We are looking for creative software engineers, researchers, and content developers who want to build the future of automated education and hiring diagnostics.
          </p>
        </div>

        {/* Culture Card */}
        <div className="glassmorphism premium-border p-8 sm:p-12 rounded-2xl mb-8 space-y-6 text-sm text-lightGray/85 leading-relaxed">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Heart size={18} className="text-white/60" /> Life & Culture
          </h2>
          <p>
            At InterviewAce.AI, we foster an environment centered around high autonomy, technical curiosity, and operational excellence. We operate as a highly collaborative global team, supporting remote schedules, personal learning budgets, and dedication to open-source contributions.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 text-xs text-lightGray/70">
            <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-1">
              <h4 className="font-bold text-white">Global Autonomy</h4>
              <p>Work from anywhere. We sync on milestones, not hours.</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-1">
              <h4 className="font-bold text-white">Learning Budgets</h4>
              <p>$2,000/yr for books, tutorials, and developer conferences.</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-1">
              <h4 className="font-bold text-white">Health & Wellness</h4>
              <p>Premium medical plans, wellness app access, and local gym perks.</p>
            </div>
          </div>
        </div>

        {/* Positions Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 px-2">
            <Briefcase size={20} className="text-white/60" /> Open Opportunities
          </h2>
          
          <div className="space-y-4">
            {openPositions.map((pos, idx) => (
              <div key={idx} className="glassmorphism premium-border p-6 rounded-xl hover:bg-white/5 transition-all space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="font-bold text-white text-base">{pos.title}</h3>
                  <div className="flex items-center gap-3 text-[10px] text-lightGray/50 font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1"><MapPin size={12} /> {pos.location}</span>
                    <span className="px-2 py-0.5 rounded bg-white/5">{pos.type}</span>
                  </div>
                </div>
                <p className="text-xs text-lightGray/70 leading-relaxed">{pos.desc}</p>
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[10px] text-lightGray/40 font-mono">Department: {pos.department}</span>
                  <a 
                    href="mailto:careers@interviewace.ai" 
                    className="text-xs text-white hover:text-lightGray font-semibold underline transition-colors"
                  >
                    Apply Now
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
