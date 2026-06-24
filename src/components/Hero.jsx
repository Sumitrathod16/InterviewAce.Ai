import React from 'react';
import { motion } from 'framer-motion';
import { Play, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export default function Hero() {
  const scrollToSection = (id) => {
    const element = document.querySelector(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-background">
      {/* Background radial effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[20%] w-[350px] h-[350px] rounded-full bg-slate-500 blur-[120px]" />
        <div className="absolute top-[10%] right-[20%] w-[350px] h-[350px] rounded-full bg-white blur-[150px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Tag */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glassmorphism text-xs font-semibold tracking-wider text-lightGray/90 mb-6 uppercase premium-border"
          >
            <Sparkles size={13} className="text-accent animate-pulse" />
            AI-POWERED PREPARATION PLATFORM
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]"
          >
            Master Every Interview with <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-lightGray to-accent">
              AI-Powered Practice
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-lightGray/85 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Practice HR, technical, and coding interviews with real-time AI feedback. Ace your dream job with personalized insight.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <button
              onClick={() => scrollToSection('#demo')}
              className="w-full sm:w-auto px-8 py-4 bg-white text-background rounded-lg hover:bg-lightGray transition-all duration-300 font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-white/5 active:scale-[0.98] group"
            >
              Start Free Interview
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => scrollToSection('#demo')}
              className="w-full sm:w-auto px-8 py-4 glassmorphism text-white rounded-lg hover:bg-white/5 transition-all duration-300 font-semibold flex items-center justify-center gap-2 premium-border"
            >
              <Play size={16} className="fill-white" />
              Watch Demo
            </button>
          </motion.div>
        </div>

        {/* Dashboard Mockup Illustration */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative max-w-5xl mx-auto rounded-xl overflow-hidden glassmorphism premium-border shadow-2xl"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-secondaryBg/40">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-slate-700/80" />
              <span className="w-3.5 h-3.5 rounded-full bg-slate-700/50" />
              <span className="w-3.5 h-3.5 rounded-full bg-slate-700/30" />
            </div>
            <div className="text-xs text-lightGray/40 font-mono">interviewace-dashboard-v1.0.js</div>
            <div className="w-16" />
          </div>

          {/* Content Mock */}
          <div className="p-6 md:p-8 bg-secondaryBg/20 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sidebar Mock */}
            <div className="space-y-4 md:col-span-1 border-r border-white/5 pr-6 hidden md:block">
              <div className="h-10 bg-white/5 rounded-lg flex items-center px-3 gap-2">
                <div className="w-4 h-4 rounded-full bg-white/80" />
                <div className="w-24 h-3 bg-white/30 rounded" />
              </div>
              <div className="space-y-2.5 pt-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-8 hover:bg-white/5 rounded-md flex items-center px-3 gap-2 cursor-pointer transition-colors">
                    <div className="w-3.5 h-3.5 rounded bg-lightGray/20" />
                    <div className="w-20 h-2 bg-lightGray/25 rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Main stats Mock */}
            <div className="md:col-span-2 space-y-6">
              {/* Row 1 */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <div className="text-xs text-lightGray/50 mb-1">Mock Score</div>
                  <div className="text-2xl font-bold">84%</div>
                  <div className="w-full bg-white/10 h-1 rounded-full mt-2 overflow-hidden">
                    <div className="bg-white h-full w-[84%]" />
                  </div>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <div className="text-xs text-lightGray/50 mb-1">ATS Check</div>
                  <div className="text-2xl font-bold">78/100</div>
                  <div className="w-full bg-white/10 h-1 rounded-full mt-2 overflow-hidden">
                    <div className="bg-white/80 h-full w-[78%]" />
                  </div>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <div className="text-xs text-lightGray/50 mb-1">Coding Score</div>
                  <div className="text-2xl font-bold">92%</div>
                  <div className="w-full bg-white/10 h-1 rounded-full mt-2 overflow-hidden">
                    <div className="bg-accent h-full w-[92%]" />
                  </div>
                </div>
              </div>

              {/* Row 2 - Simulated SVG Analytics Graph */}
              <div className="p-5 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-semibold">Weekly Analytics</div>
                  <div className="flex gap-2">
                    <span className="w-2 h-2 rounded-full bg-white inline-block self-center" />
                    <span className="text-[10px] text-lightGray/60">Interviews aced</span>
                  </div>
                </div>
                <div className="h-32 w-full flex items-end">
                  <svg className="w-full h-full text-white" viewBox="0 0 400 100" preserveAspectRatio="none">
                    <path
                      d="M0,80 Q50,40 100,60 T200,30 T300,50 T400,20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    {/* Dots at graph points */}
                    <circle cx="100" cy="60" r="4" fill="#64748B" />
                    <circle cx="200" cy="30" r="4" fill="currentColor" />
                    <circle cx="300" cy="50" r="4" fill="#64748B" />
                    <circle cx="400" cy="20" r="4" fill="currentColor" />
                  </svg>
                </div>
                <div className="flex justify-between text-[10px] text-lightGray/40 mt-2 font-mono">
                  <span>MON</span>
                  <span>TUE</span>
                  <span>WED</span>
                  <span>THU</span>
                  <span>FRI</span>
                  <span>SAT</span>
                  <span>SUN</span>
                </div>
              </div>

              {/* Feedbacks Floating Card Mock */}
              <div className="flex items-center justify-between p-3.5 bg-white/[0.03] rounded-lg border border-white/5">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-white" />
                  <div>
                    <div className="text-xs font-semibold text-white">AI Analysis Complete</div>
                    <div className="text-[10px] text-lightGray/60">"Answer shows strong structural logic. Refine code complexity."</div>
                  </div>
                </div>
                <div className="text-xs font-mono text-lightGray/80 px-2 py-0.5 rounded bg-white/5">
                  Score: +12 XP
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
