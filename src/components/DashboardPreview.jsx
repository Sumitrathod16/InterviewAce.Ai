import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Award, FileText, CheckSquare, Calendar, ChevronRight, TrendingUp } from 'lucide-react';

const RECENT_INTERVIEWS = [
  { id: 1, type: 'HR Behavioral', title: 'Standard HR Screening', score: 86, time: '2 hours ago', status: 'Passed' },
  { id: 2, type: 'Frontend Technical', title: 'React Rendering & SSR', score: 82, time: 'Yesterday', status: 'Passed' },
  { id: 3, type: 'Backend Technical', title: 'Rate Limiter & DB Schema', score: 79, time: '3 days ago', status: 'Review Needed' },
  { id: 4, type: 'System Design', title: 'High Volume Notification Service', score: 74, time: '1 week ago', status: 'Review Needed' }
];

export default function DashboardPreview() {
  const [activeTab, setActiveTab] = useState('all');

  const stats = [
    {
      title: 'Interview Score',
      value: '84%',
      desc: 'Top 15% of candidates',
      icon: Award,
      color: '#FFFFFF'
    },
    {
      title: 'Resume ATS Score',
      value: '78/100',
      desc: 'Optimized formatting',
      icon: FileText,
      color: '#64748B'
    },
    {
      title: 'Coding Progress',
      value: '14 / 30',
      desc: '6 challenges solved this week',
      icon: CheckSquare,
      color: '#FFFFFF'
    },
    {
      title: 'Practice Hours',
      value: '12.5 hrs',
      desc: '5 day practice streak',
      icon: Calendar,
      color: '#64748B'
    }
  ];

  const filteredInterviews = activeTab === 'all' 
    ? RECENT_INTERVIEWS 
    : RECENT_INTERVIEWS.filter(item => item.status === (activeTab === 'passed' ? 'Passed' : 'Review Needed'));

  return (
    <section id="dashboard" className="py-24 bg-secondaryBg/10 border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
            Candidate Analytics Dashboard
          </h2>
          <p className="text-lg text-lightGray/70">
            Monitor your interview ratings, code coverage progress, ATS compatibility improvements, and weekly timeline.
          </p>
        </div>

        {/* Dashboard Shell */}
        <div className="rounded-xl glassmorphism premium-border shadow-2xl overflow-hidden max-w-5xl mx-auto">
          {/* Dashboard Header Bar */}
          <div className="px-6 py-4 border-b border-white/5 bg-secondaryBg/40 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <LayoutDashboard size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">InterviewAce Candidate Dashboard</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-lightGray/50 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              Sync status: Live
            </div>
          </div>

          {/* Grid Layout */}
          <div className="p-6 md:p-8 space-y-8">
            
            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className="p-5 bg-secondaryBg/35 border border-white/5 rounded-xl hover:border-white/15 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-lightGray/60">{stat.title}</span>
                      <Icon size={16} className="text-lightGray/70" />
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-[10px] text-lightGray/40">{stat.desc}</div>
                  </div>
                );
              })}
            </div>

            {/* Middle Row: Analytics Graph & Recent Mock list */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Analytics Graph */}
              <div className="lg:col-span-7 p-6 bg-secondaryBg/30 border border-white/5 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <TrendingUp size={16} /> Weekly Progress
                      </h3>
                      <p className="text-xs text-lightGray/55 mt-0.5">Average score variance over last 7 days</p>
                    </div>
                    <span className="text-xs font-mono text-white px-2 py-0.5 rounded bg-white/5">+4.2% overall</span>
                  </div>

                  {/* SVG Area Chart */}
                  <div className="h-44 w-full relative">
                    <svg className="w-full h-full text-white" viewBox="0 0 500 120" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgba(255, 255, 255, 0.15)" />
                          <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
                        </linearGradient>
                      </defs>
                      
                      {/* Gradient fill */}
                      <path
                        d="M0,100 Q60,50 125,75 T250,35 T375,65 T500,20 L500,120 L0,120 Z"
                        fill="url(#chartGlow)"
                      />

                      {/* Stroke line */}
                      <path
                        d="M0,100 Q60,50 125,75 T250,35 T375,65 T500,20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />

                      {/* Reference line */}
                      <line x1="0" y1="90" x2="500" y2="90" stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="4 4" />
                    </svg>
                  </div>
                  
                  {/* Calendar labels */}
                  <div className="flex justify-between text-[10px] text-lightGray/40 mt-3 font-mono">
                    <span>MON</span>
                    <span>TUE</span>
                    <span>WED</span>
                    <span>THU</span>
                    <span>FRI</span>
                    <span>SAT</span>
                    <span>SUN</span>
                  </div>
                </div>
              </div>

              {/* Recent mock list */}
              <div className="lg:col-span-5 p-6 bg-secondaryBg/30 border border-white/5 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Interviews</h3>
                    
                    {/* Filters */}
                    <div className="flex gap-1 bg-background/60 p-0.5 rounded-lg border border-white/5">
                      {['all', 'passed', 'review'].map(tab => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all duration-200 ${
                            activeTab === tab 
                              ? 'bg-white text-background font-black' 
                              : 'text-lightGray/50 hover:text-white'
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* List Container */}
                  <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
                    {filteredInterviews.map((item) => (
                      <div key={item.id} className="p-3 bg-background/40 hover:bg-background/70 border border-white/5 rounded-xl flex items-center justify-between transition-all group cursor-pointer">
                        <div className="space-y-0.5">
                          <div className="text-[10px] font-bold text-lightGray/50 uppercase">{item.type}</div>
                          <div className="text-xs font-semibold text-white group-hover:text-white transition-colors">{item.title}</div>
                          <div className="text-[9px] text-lightGray/40">{item.time}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-bold font-mono ${item.score >= 80 ? 'text-white' : 'text-lightGray/70'}`}>
                            {item.score}%
                          </span>
                          <ChevronRight size={14} className="text-lightGray/30 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
