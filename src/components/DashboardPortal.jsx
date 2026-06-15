import React from 'react';
import { motion } from 'framer-motion';
import { Award, FileText, CheckSquare, Calendar, ChevronRight, Activity, Code, UserCheck, AlertCircle, ArrowRight, LogOut, Award as XpIcon } from 'lucide-react';

export default function DashboardPortal({ 
  solvedProblems, 
  recentActivity, 
  atsScore, 
  completedInterviews,
  onSelectProblem,
  onViewChange,
  userProfile,
  onLogout
}) {
  
  // Calculate average interview score
  const avgInterviewScore = completedInterviews.length > 0
    ? Math.round(completedInterviews.reduce((acc, curr) => acc + curr.score, 0) / completedInterviews.length)
    : 84;

  const totalXp = (solvedProblems.size * 100) + (completedInterviews.length * 200);
  const practiceStreak = solvedProblems.size > 0 || completedInterviews.length > 0 ? 1 : 0;

  const stats = [
    {
      title: 'Interview Rating',
      value: `${avgInterviewScore}%`,
      desc: completedInterviews.length > 0 ? `Based on ${completedInterviews.length} rounds` : 'Starting baseline',
      icon: Award
    },
    {
      title: 'ATS Resume Rating',
      value: `${atsScore}/100`,
      desc: atsScore >= 80 ? 'ATS Compatible' : 'Needs Optimization',
      icon: FileText
    },
    {
      title: 'Algorithm Challenges',
      value: `${solvedProblems.size} / 6`,
      desc: `${6 - solvedProblems.size} remaining`,
      icon: CheckSquare
    },
    {
      title: 'Practice Streak',
      value: `${practiceStreak} Day${practiceStreak !== 1 ? 's' : ''}`,
      desc: 'Active streak',
      icon: Calendar
    }
  ];

  const CHALLENGES = [
    { id: 'twosum', title: '1. Two Sum', difficulty: 'Easy', index: 0 },
    { id: 'reversestring', title: '344. Reverse String', difficulty: 'Easy', index: 1 },
    { id: 'palindrome', title: '9. Valid Palindrome', difficulty: 'Easy', index: 2 },
    { id: 'fizzbuzz', title: '412. Fizz Buzz', difficulty: 'Easy', index: 3 },
    { id: 'fibonacci', title: '509. Fibonacci Number', difficulty: 'Easy', index: 4 },
    { id: 'mergesorted', title: '88. Merge Sorted Array', difficulty: 'Easy', index: 5 }
  ];

  // Generate 28-day daily contribution calendar details
  const getContributionDays = () => {
    const days = [];
    const now = new Date();
    for (let i = 27; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      // Calculate fake mock contribution weight
      let count = 0;
      if (dateStr === now.toISOString().split('T')[0]) {
        count = solvedProblems.size + completedInterviews.length;
      } else if (i === 4 || i === 8 || i === 12 || i === 18) {
        count = 1 + (i % 2); // default historical activity
      }
      
      days.push({
        date: dateStr,
        count,
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
    }
    return days;
  };

  const contributionDays = getContributionDays();

  const handleChallengeClick = (index) => {
    onSelectProblem(index);
    onViewChange('landing');
    setTimeout(() => {
      const element = document.querySelector('#coding');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };

  const nameInitials = userProfile?.name
    ? userProfile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'US';

  return (
    <div className="pt-28 pb-20 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Candidate Profile Summary card */}
        <div className="p-6 bg-secondaryBg/45 border border-white/5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="w-16 h-16 rounded-full bg-white text-background flex items-center justify-center font-bold text-xl select-none">
              {nameInitials}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Welcome back, {userProfile?.name || 'Candidate'}!</h2>
              <p className="text-sm text-lightGray/60 mt-0.5">{userProfile?.role || 'Technical Preparation Track'}</p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-lightGray/40">
                <span className="flex items-center gap-1">
                  <XpIcon size={12} className="text-white" />
                  {totalXp} XP Earned
                </span>
                <span>•</span>
                <span>Streak: {practiceStreak} day{practiceStreak !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={onLogout}
            className="px-4 py-2 text-xs font-semibold text-lightGray/70 hover:text-white border border-white/5 rounded-lg flex items-center gap-2 transition-colors hover:bg-white/5"
          >
            <LogOut size={13} />
            Sign Out
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="p-5 bg-secondaryBg/40 border border-white/5 rounded-xl flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-lightGray/50 uppercase">{stat.title}</span>
                  <div className="text-2xl font-extrabold text-white">{stat.value}</div>
                  <div className="text-[10px] text-lightGray/40">{stat.desc}</div>
                </div>
                <div className="p-3 bg-white/5 rounded-lg text-white">
                  <Icon size={18} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Heatmap & Logs Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Everyday Activity Heatmap */}
          <div className="lg:col-span-8 p-6 bg-secondaryBg/30 border border-white/5 rounded-xl space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Activity size={16} /> Everyday Practice Calendar
              </h3>
              <p className="text-xs text-lightGray/55 mt-0.5">Your coding & interview activities across the last 28 days</p>
            </div>

            {/* Heatmap grid */}
            <div className="flex flex-col items-center sm:items-start space-y-3">
              <div className="grid grid-cols-7 gap-2.5">
                {contributionDays.map((day, idx) => {
                  let colorClass = 'bg-slate-900/60 border-white/[0.03]';
                  if (day.count === 1) colorClass = 'bg-slate-700 border-white/5';
                  if (day.count === 2) colorClass = 'bg-slate-500 border-white/5';
                  if (day.count >= 3) colorClass = 'bg-white text-background font-black border-white';

                  return (
                    <div
                      key={idx}
                      title={`${day.label}: ${day.count} activity`}
                      className={`w-8 h-8 rounded-md flex items-center justify-center text-[10px] border transition-all duration-300 ${colorClass}`}
                    >
                      {day.count > 0 && day.count}
                    </div>
                  );
                })}
              </div>
              
              {/* Legend */}
              <div className="flex gap-4 items-center text-[10px] text-lightGray/40 font-mono">
                <span>Less</span>
                <div className="flex gap-1">
                  <span className="w-3.5 h-3.5 rounded bg-slate-900/60 border border-white/[0.03]" />
                  <span className="w-3.5 h-3.5 rounded bg-slate-700 border border-white/5" />
                  <span className="w-3.5 h-3.5 rounded bg-slate-500 border border-white/5" />
                  <span className="w-3.5 h-3.5 rounded bg-white border border-white" />
                </div>
                <span>More</span>
              </div>
            </div>
          </div>

          {/* Activity Logs */}
          <div className="lg:col-span-4 p-6 bg-secondaryBg/30 border border-white/5 rounded-xl flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Activity size={16} /> Activity History
              </h3>
              <div className="space-y-3.5 max-h-48 overflow-y-auto pr-1">
                {recentActivity.length > 0 ? (
                  recentActivity.map((act, index) => (
                    <div key={index} className="flex gap-3 items-start text-xs border-b border-white/5 pb-2.5 last:border-0 last:pb-0">
                      <div className="p-1 rounded bg-white/5 text-white mt-0.5">
                        {act.type === 'code' ? <Code size={12} /> : <UserCheck size={12} />}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{act.title}</div>
                        <div className="text-[10px] text-lightGray/40 mt-0.5">{act.time}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-lightGray/40 space-y-2">
                    <AlertCircle size={24} className="mx-auto stroke-[1.5]" />
                    <p className="text-xs">No activity logged today.</p>
                  </div>
                )}
              </div>
            </div>
            {recentActivity.length === 0 && (
              <button
                onClick={() => onViewChange('landing')}
                className="w-full mt-4 py-2 text-xs font-bold glassmorphism text-white rounded-lg hover:bg-white/5 transition-all flex items-center justify-center gap-1.5 premium-border"
              >
                Go Prepare Now
                <ArrowRight size={12} />
              </button>
            )}
          </div>

        </div>

        {/* Coding Challenges grid */}
        <div className="p-6 bg-secondaryBg/30 border border-white/5 rounded-xl space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Code size={16} /> Codebox Problem Catalogue
            </h3>
            <p className="text-xs text-lightGray/55 mt-0.5">Select and compile any challenge inside the sandbox</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CHALLENGES.map((ch) => {
              const isSolved = solvedProblems.has(ch.id);
              return (
                <div 
                  key={ch.id}
                  onClick={() => handleChallengeClick(ch.index)}
                  className="p-4 bg-background/40 hover:bg-background/80 border border-white/5 hover:border-white/15 rounded-xl flex items-center justify-between transition-all group cursor-pointer"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-white group-hover:text-white transition-colors">{ch.title}</div>
                    <div className="text-[10px] font-bold text-lightGray/40 uppercase">{ch.difficulty}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isSolved ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-white text-background uppercase">
                        Solved
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-secondaryBg text-lightGray/40 border border-white/5 uppercase">
                        Unsolved
                      </span>
                    )}
                    <ChevronRight size={14} className="text-lightGray/20 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
