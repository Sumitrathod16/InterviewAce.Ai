import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Cpu, 
  FileText, 
  Code, 
  ArrowRight, 
  UserCheck, 
  GraduationCap, 
  CheckCircle,
  Sparkles,
  Zap,
  Check
} from 'lucide-react';

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function FeaturesPage({ hasUser, onViewChange, onTabChange }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const navigate = useNavigate();

  const handleAction = (tab) => {
    if (hasUser) {
      onViewChange('dashboard-portal');
      if (onTabChange) {
        onTabChange(tab);
      }
      navigate('/');
    } else {
      // Trigger login/signup modal
      onViewChange('dashboard-portal');
    }
  };

  return (
    <div className="relative pt-32 pb-24 bg-background min-h-screen overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-10 left-1/4 w-96 h-96 rounded-full bg-accent/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 rounded-full bg-white/5 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Back Link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-xs font-semibold text-lightGray/50 hover:text-white mb-8 group transition-colors focus:outline-none"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-white mb-4 animate-pulse">
            <Sparkles size={12} className="text-accent" />
            <span>Introducing InterviewAce Core Engine</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-6">
            State-of-the-Art Tools to <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-white via-lightGray to-accent bg-clip-text text-transparent">Elevate Your Career Prep</span>
          </h1>
          <p className="text-lg text-lightGray/60 leading-relaxed">
            Our multi-agent system provides instant feedback, full compiling capabilities, and ATS-optimized scorecards to secure your target role.
          </p>
        </div>

        {/* Student Promo Banner */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-16 glassmorphism premium-border bg-gradient-to-r from-accent/20 via-secondaryBg/40 to-white/5 p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4 text-left">
            <div className="p-4 bg-white/10 text-white rounded-xl">
              <GraduationCap size={32} />
            </div>
            <div>
              <span className="text-xs font-bold text-accent uppercase tracking-wider">Launch Special Offer</span>
              <h3 className="text-xl font-bold text-white mt-1">1 Month Free for Students!</h3>
              <p className="text-sm text-lightGray/70 mt-1 max-w-xl">
                We're supporting student candidates worldwide! Access all our Pro & Premium tools completely free for 30 days. No upfront payment required. Subscriptions start afterward.
              </p>
            </div>
          </div>
          <Link 
            to="/pricing"
            className="px-6 py-3 bg-white text-background hover:bg-lightGray rounded-xl font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap shadow-lg hover:shadow-white/5"
          >
            Claim 1 Month Free
            <ArrowRight size={16} />
          </Link>
        </motion.div>

        {/* Deep Dive Feature Sections */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="space-y-12"
        >
          
          {/* Section 1: AI Mock Interview Simulator */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
          >
            <div className="lg:col-span-7 bg-secondaryBg/30 border border-white/5 rounded-2xl p-8 sm:p-10 flex flex-col justify-between">
              <div>
                <div className="p-3 bg-white/5 text-white rounded-lg w-fit mb-6">
                  <UserCheck size={24} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                  AI Mock Interview Simulator
                </h2>
                <p className="text-sm sm:text-base text-lightGray/70 leading-relaxed mb-6">
                  Experience realistic behavioral and technical interview simulations customized for target firms like Google, Amazon, and Stripe. Engage with dynamic AI interviewers that evaluate the clarity, logic, and core engineering concepts in your verbal responses.
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                  {[
                    "Live audio recording and transcripts",
                    "Targeted behavioral prep tracks",
                    "Custom difficulty adjustments",
                    "Immediate performance metrics"
                  ].map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-xs text-lightGray/80">
                      <CheckCircle size={14} className="text-accent flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => handleAction('interviews')}
                className="w-full sm:w-fit px-6 py-3 bg-white/5 text-white hover:bg-white/10 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 border border-white/10"
              >
                Launch Mock Interview
                <ArrowRight size={14} />
              </button>
            </div>
            
            <div className="lg:col-span-5 bg-secondaryBg/20 border border-white/5 rounded-2xl p-8 flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl" />
              <div className="space-y-4 relative z-10 text-left">
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-[10px] font-mono text-accent uppercase font-bold">Evaluation Telemetry</span>
                  <div className="mt-2 h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full w-[85%] bg-white rounded-full" />
                  </div>
                  <div className="flex justify-between text-[10px] text-lightGray/50 mt-1 font-mono">
                    <span>Communication Score</span>
                    <span>85%</span>
                  </div>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-[10px] font-mono text-accent uppercase font-bold">Feedback Analytics</span>
                  <p className="text-xs text-lightGray/70 mt-1 leading-relaxed">
                    "Excellent structured response. You successfully utilized the STAR framework, though you could expand slightly on the resolution metrics."
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Section 2: Resume Analyzer & ATS Optimizer */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
          >
            <div className="lg:col-span-5 bg-secondaryBg/20 border border-white/5 rounded-2xl p-8 flex flex-col justify-center relative overflow-hidden order-last lg:order-first">
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
              <div className="space-y-4 relative z-10 text-left">
                <div className="p-5 bg-secondaryBg/60 rounded-xl border border-white/10 flex items-center gap-4">
                  <FileText className="text-accent flex-shrink-0" size={32} />
                  <div className="w-full">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-white">resume_draft_v2.pdf</span>
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900 px-2 py-0.5 rounded">84/100</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full w-[84%] bg-emerald-400 rounded-full" />
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-1.5 text-xs text-lightGray/70">
                  <div className="flex items-center gap-2 text-white font-bold text-xs">
                    <Zap size={12} className="text-accent" /> ATS Parse Insights
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    • Added 6 critical industry keywords (e.g. system architecture, scalable API nodes). <br />
                    • Eliminated two non-standard column layouts causing compiler parser failures.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-secondaryBg/30 border border-white/5 rounded-2xl p-8 sm:p-10 flex flex-col justify-between">
              <div>
                <div className="p-3 bg-white/5 text-white rounded-lg w-fit mb-6">
                  <FileText size={24} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                  Resume Analyzer & ATS Optimizer
                </h2>
                <p className="text-sm sm:text-base text-lightGray/70 leading-relaxed mb-6">
                  Upload your resume in PDF format to receive instant ATS formatting audit results. Our analyzer flags syntax quality problems, spacing inconsistencies, and highlights critical missing keywords mapped to specific developer job descriptions.
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                  {[
                    "ATS structural parser validation",
                    "Action-verb intensity scanner",
                    "Job description keywords match",
                    "Clean PDF download recommendations"
                  ].map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-xs text-lightGray/80">
                      <CheckCircle size={14} className="text-accent flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => handleAction('resume')}
                className="w-full sm:w-fit px-6 py-3 bg-white/5 text-white hover:bg-white/10 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 border border-white/10"
              >
                Analyze Your Resume
                <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>

          {/* Section 3: Coding Sandbox & Assessment */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
          >
            <div className="lg:col-span-7 bg-secondaryBg/30 border border-white/5 rounded-2xl p-8 sm:p-10 flex flex-col justify-between">
              <div>
                <div className="p-3 bg-white/5 text-white rounded-lg w-fit mb-6">
                  <Code size={24} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                  Coding Sandbox & Assessment
                </h2>
                <p className="text-sm sm:text-base text-lightGray/70 leading-relaxed mb-6">
                  Solve diverse, standard algorithmic challenges in our responsive coding playground. Compile code in multiple standard languages and receive optimized time & space complexity feedback computed directly by our sandboxed evaluation nodes.
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                  {[
                    "Multi-language code compilation",
                    "Time & Space complexity feedback",
                    "Custom test case execution",
                    "Standard DSA mock interview tracks"
                  ].map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-xs text-lightGray/80">
                      <CheckCircle size={14} className="text-accent flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => handleAction('coding')}
                className="w-full sm:w-fit px-6 py-3 bg-white/5 text-white hover:bg-white/10 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 border border-white/10"
              >
                Open Coding Sandbox
                <ArrowRight size={14} />
              </button>
            </div>

            <div className="lg:col-span-5 bg-secondaryBg/20 border border-white/5 rounded-2xl p-8 flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl" />
              <div className="space-y-3 relative z-10 text-left">
                <div className="p-4 bg-secondaryBg/80 rounded-xl border border-white/10 font-mono text-[11px] text-lightGray/85 space-y-1">
                  <div className="text-blue-400">function <span className="text-white">twoSum</span>(nums, target) &#123;</div>
                  <div className="pl-4 text-lightGray/60">// Optimal O(N) Hash Map approach</div>
                  <div className="pl-4 text-emerald-400">  const map = new Map();</div>
                  <div className="pl-4">  for(let i=0; i&lt;nums.length; i++) &#123;</div>
                  <div className="pl-8 text-blue-400">    ...</div>
                  <div className="pl-4">  &#125;</div>
                  <div className="text-blue-400">&#125;</div>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-mono bg-emerald-950/20 border border-emerald-900/50 p-2.5 rounded-lg">
                  <Check size={12} className="stroke-[3]" />
                  <span>All test cases passed. Time complexity: O(N)</span>
                </div>
              </div>
            </div>
          </motion.div>

        </motion.div>

        {/* Feature Summary Table/Card */}
        <div className="mt-24 text-center">
          <h3 className="text-xl font-bold text-white mb-6">Compare Plans & Features</h3>
          <div className="glassmorphism premium-border rounded-2xl overflow-hidden max-w-4xl mx-auto text-left">
            <div className="grid grid-cols-3 bg-white/5 p-4 border-b border-white/5 text-xs font-bold uppercase tracking-wider text-lightGray/70">
              <div>Feature</div>
              <div className="text-center">Free</div>
              <div className="text-center text-white">Student Pro (1 Mo Free)</div>
            </div>
            {[
              { name: "Mock Interviews / day", free: "3 Sessions", pro: "Unlimited" },
              { name: "Resume ATS Analysis", free: "1 / day", pro: "Unlimited" },
              { name: "Sandbox Compiler", free: "Standard", pro: "Advanced Complexity Diagnostics" },
              { name: "Company Preparation Tracks", free: "None", pro: "Google, Meta, Amazon, Stripe" },
              { name: "Personal AI Career Coach", free: "None", pro: "24/7 Priority Guidance" }
            ].map((row, idx) => (
              <div key={idx} className="grid grid-cols-3 p-4 border-b border-white/5 text-xs text-lightGray/80 items-center">
                <div className="font-semibold text-white">{row.name}</div>
                <div className="text-center">{row.free}</div>
                <div className="text-center font-semibold text-accent">{row.pro}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
