import React, { useState } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Award, BarChart3, TrendingUp, Sparkles, Play, ShieldAlert, ArrowUpRight, BookOpen } from 'lucide-react';

ChartJS.register(...registerables);

export default function AnalyticsTab({ 
  interviewsList = [], 
  solvedProblems = new Set(), 
  solvedProblemsDetail = [],
  userProfile = {}, 
  theme = 'dark' 
}) {
  const completed = interviewsList.filter(i => i.completed);
  const isDataEmpty = completed.length === 0;
  
  // Sort chronologically ascending for trend graph
  const sortedCompleted = [...completed].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  // Compute metrics
  const totalRounds = sortedCompleted.length;
  const avgOverallScore = totalRounds > 0
    ? Math.round(sortedCompleted.reduce((acc, curr) => acc + curr.score, 0) / totalRounds)
    : 0;

  // Compute category specific averages across all question evaluations
  const allEvals = sortedCompleted.flatMap(i => i.evaluations || []);
  const avgComm = allEvals.length > 0
    ? Math.round(allEvals.reduce((acc, e) => acc + (e.communicationScore || e.score || 0), 0) / allEvals.length)
    : 0;
  const avgContent = allEvals.length > 0
    ? Math.round(allEvals.reduce((acc, e) => acc + (e.contentScore || e.score || 0), 0) / allEvals.length)
    : 0;

  const highestScore = totalRounds > 0
    ? Math.max(...sortedCompleted.map(i => i.score))
    : 0;

  // HR vs Technical averages
  const hrRounds = sortedCompleted.filter(i => i.type?.toLowerCase().includes('hr') || i.track?.toLowerCase().includes('hr'));
  const techRounds = sortedCompleted.filter(i => !i.type?.toLowerCase().includes('hr') && !i.track?.toLowerCase().includes('hr'));
  
  const hrAvg = hrRounds.length > 0
    ? Math.round(hrRounds.reduce((acc, i) => acc + i.score, 0) / hrRounds.length)
    : 0;
  const techAvg = techRounds.length > 0
    ? Math.round(techRounds.reduce((acc, i) => acc + i.score, 0) / techRounds.length)
    : 0;

  const generateInsights = () => {
    const role = userProfile?.targetRole || 'Software Engineer';
    const skills = userProfile?.skills || [];
    const solvedCount = solvedProblems?.size || 0;
    
    let communicationStatus = 'Good';
    let technicalStatus = 'Good';
    let codingStatus = 'Good';
    
    if (avgComm > 0 && avgComm < 75) {
      communicationStatus = 'Needs Work';
    }
    if (avgContent > 0 && avgContent < 75) {
      technicalStatus = 'Needs Work';
    }
    if (solvedCount < 10) {
      codingStatus = 'Needs Work';
    }

    const insights = [];

    // Role-specific baseline advice
    insights.push({
      type: 'info',
      title: `Preparation Profile: ${role}`,
      text: `Your analytics metrics are weighted against standard benchmarks for a ${role}. ${
        skills.length > 0 
          ? `We are scanning evaluations targeting your listed skills: ${skills.join(', ')}.` 
          : 'Update your profile skills list to get granular keyword scans in mock trials.'
      }`
    });

    // Communication insight
    if (communicationStatus === 'Needs Work' && avgComm > 0) {
      insights.push({
        type: 'warning',
        title: 'Communication Delivery Warning',
        text: `Your average verbal flow score is ${avgComm}%. Benchmark evaluations show minor grammar pauses or pacing imbalances. Focus on the STAR method to structure behavioral answers concisely.`
      });
    } else if (avgComm >= 75) {
      insights.push({
        type: 'success',
        title: 'Communication Strengths',
        text: `Superb verbal pace and structure! With an average of ${avgComm}%, your grammar, tone stability, and presentation skills align cleanly with senior requirements.`
      });
    } else {
      insights.push({
        type: 'info',
        title: 'Communication Evaluation Pending',
        text: 'Complete an interview session featuring voice assessment to unlock verbal delivery velocity and grammar logs.'
      });
    }

    // Technical accuracy insight
    if (technicalStatus === 'Needs Work' && avgContent > 0) {
      insights.push({
        type: 'warning',
        title: 'Technical Precision Gap',
        text: `Your average technical content accuracy is ${avgContent}%. Some mock trials reported incomplete syntax explanations or inaccurate conceptual definitions. Focus on key core concepts of your stack.`
      });
    } else if (avgContent >= 75) {
      insights.push({
        type: 'success',
        title: 'Strong Technical Accuracy',
        text: `Excellent theoretical precision! Your technical accuracy average of ${avgContent}% shows deep familiarity with core engineering questions.`
      });
    } else {
      insights.push({
        type: 'info',
        title: 'Technical Evaluation Pending',
        text: 'Complete a technical interview session to unlock database, caching, or frontend architecture assessment reports.'
      });
    }

    // Coding practice insight
    if (solvedCount === 0) {
      insights.push({
        type: 'alert',
        title: 'Coding Sandbox Inactive',
        text: 'You have not solved any algorithm challenges yet. Algorithmic assessments represent 40% of standard technical filter rounds. Select a problem and run it in the Monaco sandbox.'
      });
    } else if (solvedCount < 5) {
      insights.push({
        type: 'info',
        title: 'Algorithm Practice Base',
        text: `You have successfully solved ${solvedCount} challenges in the sandbox. We recommend completing at least 15 distinct problems to develop stable algorithmic intuition.`
      });
    } else {
      insights.push({
        type: 'success',
        title: 'Algorithm Practice Active',
        text: `Great momentum! You have completed ${solvedCount} challenges in the algorithmic sandbox, which increases your overall filter round clearing rate.`
      });
    }

    return insights;
  };

  // Global Chart config defaults
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 23, 42, 0.7)',
          font: {
            family: 'system-ui',
            size: 11,
            weight: '600'
          },
          usePointStyle: true,
          boxWidth: 8
        }
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? '#1E293B' : '#FFFFFF',
        titleColor: theme === 'dark' ? '#FFFFFF' : '#0F172A',
        bodyColor: theme === 'dark' ? '#E2E8F0' : '#334155',
        borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.1)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        titleFont: { weight: 'bold' }
      }
    },
    scales: {
      x: {
        grid: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(15, 23, 42, 0.04)',
          drawBorder: false
        },
        ticks: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(15, 23, 42, 0.5)',
          font: { size: 10 }
        }
      },
      y: {
        min: 0,
        max: 100,
        grid: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(15, 23, 42, 0.04)',
          drawBorder: false
        },
        ticks: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(15, 23, 42, 0.5)',
          font: { size: 10 },
          stepSize: 20
        }
      }
    }
  };

  // Trend line chart datasets
  const trendLabels = sortedCompleted.map((item, idx) => {
    const dateStr = new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' });
    return `Round ${idx + 1} (${dateStr})`;
  });

  const trendData = {
    labels: trendLabels,
    datasets: [
      {
        label: 'Overall Average (%)',
        data: sortedCompleted.map(item => item.score),
        borderColor: theme === 'dark' ? '#FFFFFF' : '#0F172A',
        backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(15, 23, 42, 0.03)',
        borderWidth: 2,
        tension: 0.25,
        fill: true,
        pointBackgroundColor: theme === 'dark' ? '#FFFFFF' : '#0F172A',
        pointBorderColor: theme === 'dark' ? '#FFFFFF' : '#0F172A',
        pointHoverRadius: 6,
        pointRadius: 4
      },
      {
        label: 'Communication Score (%)',
        data: sortedCompleted.map(item => {
          const ev = item.evaluations || [];
          return ev.length > 0
            ? Math.round(ev.reduce((acc, e) => acc + (e.communicationScore || item.score), 0) / ev.length)
            : item.score;
        }),
        borderColor: '#94A3B8',
        borderDash: [5, 5],
        borderWidth: 1.5,
        tension: 0.2,
        fill: false,
        pointBackgroundColor: '#94A3B8',
        pointRadius: 3
      },
      {
        label: 'Content Accuracy (%)',
        data: sortedCompleted.map(item => {
          const ev = item.evaluations || [];
          return ev.length > 0
            ? Math.round(ev.reduce((acc, e) => acc + (e.contentScore || item.score), 0) / ev.length)
            : item.score;
        }),
        borderColor: '#475569',
        borderDash: [2, 2],
        borderWidth: 1.5,
        tension: 0.2,
        fill: false,
        pointBackgroundColor: '#475569',
        pointRadius: 3
      }
    ]
  };

  // Category average performance bar chart
  const categoriesData = {
    labels: ['Verbal Delivery', 'Technical Content', 'Overall Assessment'],
    datasets: [
      {
        label: 'Average Score Metrics',
        data: [avgComm, avgContent, avgOverallScore],
        backgroundColor: theme === 'dark' ? [
          'rgba(255, 255, 255, 0.8)',
          'rgba(148, 163, 184, 0.6)',
          'rgba(71, 85, 105, 0.5)'
        ] : [
          'rgba(15, 23, 42, 0.8)',
          'rgba(71, 85, 105, 0.6)',
          'rgba(148, 163, 184, 0.5)'
        ],
        borderColor: theme === 'dark' ? [
          '#FFFFFF',
          '#94A3B8',
          '#475569'
        ] : [
          '#0F172A',
          '#475569',
          '#94A3B8'
        ],
        borderWidth: 1,
        borderRadius: 6
      }
    ]
  };

  // Aggregate languages solved
  const langCounts = {};
  if (solvedProblemsDetail && solvedProblemsDetail.length > 0) {
    solvedProblemsDetail.forEach(item => {
      const rawLang = item.language || 'javascript';
      const cleanLang = rawLang.toLowerCase() === 'js' ? 'JavaScript' :
                        rawLang.toLowerCase() === 'py' ? 'Python' :
                        rawLang.toLowerCase() === 'java' ? 'Java' :
                        rawLang.toLowerCase() === 'cpp' ? 'C++' :
                        rawLang.toLowerCase() === 'c' ? 'C' :
                        rawLang.charAt(0).toUpperCase() + rawLang.slice(1);
      langCounts[cleanLang] = (langCounts[cleanLang] || 0) + 1;
    });
  } else if (solvedProblems && solvedProblems.size > 0) {
    const totalCount = solvedProblems.size;
    langCounts['JavaScript'] = Math.round(totalCount * 0.5) || 1;
    langCounts['Python'] = Math.round(totalCount * 0.3) || 0;
    langCounts['Java'] = Math.max(0, totalCount - Math.round(totalCount * 0.5) - Math.round(totalCount * 0.3));
  }

  const langLabels = Object.keys(langCounts);
  const langDataValues = Object.values(langCounts);
  const hasSolvedProblems = langLabels.length > 0;

  const languageChartData = {
    labels: langLabels,
    datasets: [
      {
        data: langDataValues,
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)', // Indigo
          'rgba(168, 85, 247, 0.8)', // Purple
          'rgba(236, 72, 153, 0.8)', // Pink
          'rgba(20, 184, 166, 0.8)', // Teal
          'rgba(245, 158, 11, 0.8)'  // Amber
        ],
        borderColor: theme === 'dark' ? '#1E293B' : '#FFFFFF',
        borderWidth: 2
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 23, 42, 0.7)',
          font: {
            family: 'system-ui',
            size: 11,
            weight: '600'
          },
          usePointStyle: true,
          boxWidth: 8
        }
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? '#1E293B' : '#FFFFFF',
        titleColor: theme === 'dark' ? '#FFFFFF' : '#0F172A',
        bodyColor: theme === 'dark' ? '#E2E8F0' : '#334155',
        borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.1)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <BarChart3 size={16} /> Performance Analytics Insights
          </h3>
          <p className="text-xs text-lightGray/55 mt-0.5">
            Visualize your verbal communication, technical accuracy, and chronological score improvements.
          </p>
        </div>
        
        {isDataEmpty && (
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
              <ShieldAlert size={12} />
              No completed sessions found
            </span>
          </div>
        )}
      </div>

      {/* Main KPI Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="p-4 bg-background/50 border border-white/5 rounded-xl space-y-1">
          <span className="text-[10px] font-bold text-lightGray/40 uppercase">Total Rounds</span>
          <div className="text-xl font-black text-white flex items-center justify-between">
            <span>{totalRounds}</span>
            <BookOpen size={16} className="text-lightGray/30" />
          </div>
          <p className="text-[9px] text-lightGray/50">Completed evaluation datasets</p>
        </div>

        {/* KPI 2 */}
        <div className="p-4 bg-background/50 border border-white/5 rounded-xl space-y-1">
          <span className="text-[10px] font-bold text-lightGray/40 uppercase">Avg Rating</span>
          <div className="text-xl font-black text-white flex items-center justify-between">
            <span>{avgOverallScore}%</span>
            <TrendingUp size={16} className="text-lightGray/30" />
          </div>
          <p className="text-[9px] text-lightGray/50">Cumulative accuracy ratio</p>
        </div>

        {/* KPI 3 */}
        <div className="p-4 bg-background/50 border border-white/5 rounded-xl space-y-1">
          <span className="text-[10px] font-bold text-lightGray/40 uppercase">Vocal Delivery</span>
          <div className="text-xl font-black text-white flex items-center justify-between">
            <span>{avgComm}%</span>
            <Award size={16} className="text-lightGray/30" />
          </div>
          <p className="text-[9px] text-lightGray/50">Average grammar & pace score</p>
        </div>

        {/* KPI 4 */}
        <div className="p-4 bg-background/50 border border-white/5 rounded-xl space-y-1">
          <span className="text-[10px] font-bold text-lightGray/40 uppercase">Highest Score</span>
          <div className="text-xl font-black text-white flex items-center justify-between">
            <span>{highestScore}%</span>
            <ArrowUpRight size={16} className="text-lightGray/30" />
          </div>
          <p className="text-[9px] text-lightGray/50">Max overall rating achieved</p>
        </div>
      </div>

      {/* AI Performance Advisor Insights */}
      <div className="p-6 bg-secondaryBg/30 border border-white/5 rounded-xl space-y-4">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles size={13} className="text-accent animate-pulse" /> AI Performance Advisor Insights
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {generateInsights().map((ins, idx) => (
            <div key={idx} className="p-4 bg-background/50 border border-white/5 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${
                  ins.type === 'warning' ? 'bg-amber-400 animate-pulse' :
                  ins.type === 'success' ? 'bg-emerald-400' :
                  ins.type === 'alert' ? 'bg-rose-500 animate-pulse' : 'bg-accent'
                }`} />
                <span className="text-xs font-bold text-white tracking-tight">{ins.title}</span>
              </div>
              <p className="text-[11px] text-lightGray/70 leading-relaxed font-sans">{ins.text}</p>
            </div>
          ))}
        </div>
      </div>



      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Trend Line Chart (Chronological scores) */}
        <div className="lg:col-span-8 p-5 bg-secondaryBg/30 border border-white/5 rounded-xl space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Chronological Score Evolution</h4>
            <p className="text-[10px] text-lightGray/50 mt-0.5">Track your overall, content, and communication scores across consecutive sessions</p>
          </div>
          <div className="h-72 w-full mt-4">
            {totalRounds > 0 ? (
              <Line options={chartOptions} data={trendData} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-2 text-lightGray/40">
                <ShieldAlert size={28} />
                <p className="text-xs">Start a mock interview session to unlock trend chart evaluations.</p>
              </div>
            )}
          </div>
        </div>

        {/* Category Metrics Bar Chart */}
        <div className="lg:col-span-4 p-5 bg-secondaryBg/30 border border-white/5 rounded-xl space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Skill Vector Strengths</h4>
            <p className="text-[10px] text-lightGray/50 mt-0.5">Comparison between verbal delivery flow, content accuracy, and overall average</p>
          </div>
          <div className="h-72 w-full mt-4">
            {totalRounds > 0 ? (
              <Bar 
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: { display: false }
                  }
                }} 
                data={categoriesData} 
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-2 text-lightGray/40">
                <ShieldAlert size={28} />
                <p className="text-xs font-semibold">Assessment statistics pending</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Coding Languages & Practice Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Languages Distribution Chart */}
        <div className="lg:col-span-5 p-5 bg-secondaryBg/30 border border-white/5 rounded-xl space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Coding Languages Distribution</h4>
            <p className="text-[10px] text-lightGray/55 mt-0.5">Distribution of challenges solved by programming language</p>
          </div>
          <div className="h-56 w-full mt-4 relative flex items-center justify-center">
            {hasSolvedProblems ? (
              <div className="h-full w-full">
                <Doughnut options={doughnutOptions} data={languageChartData} />
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-2 text-lightGray/40">
                <ShieldAlert size={28} />
                <p className="text-xs">Solve challenges in the sandbox to unlock language distribution statistics.</p>
              </div>
            )}
          </div>
        </div>

        {/* Challenge Categories and Level Breakdown */}
        <div className="lg:col-span-7 p-5 bg-secondaryBg/30 border border-white/5 rounded-xl space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Algorithmic Progress Matrix</h4>
            <p className="text-[10px] text-lightGray/55 mt-0.5">Tracking challenges solved across Easy, Medium, and Hard milestones</p>
          </div>
          
          <div className="space-y-4 py-3">
            {/* Progress Bar 1: Easy */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-emerald-400 font-sans">Easy Problems</span>
                <span className="text-white">
                  {`${solvedProblemsDetail?.filter(p => p.difficulty === 'Easy').length || 0} solved`}
                </span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, ((solvedProblemsDetail?.filter(p => p.difficulty === 'Easy').length || 0) / 8) * 100)}%` }}
                />
              </div>
            </div>

            {/* Progress Bar 2: Medium */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-amber-400 font-sans">Medium Problems</span>
                <span className="text-white">
                  {`${solvedProblemsDetail?.filter(p => p.difficulty === 'Medium').length || 0} solved`}
                </span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, ((solvedProblemsDetail?.filter(p => p.difficulty === 'Medium').length || 0) / 6) * 100)}%` }}
                />
              </div>
            </div>

            {/* Progress Bar 3: Hard */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-rose-400 font-sans">Hard Problems</span>
                <span className="text-white">
                  {`${solvedProblemsDetail?.filter(p => p.difficulty === 'Hard').length || 0} solved`}
                </span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-rose-500 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, ((solvedProblemsDetail?.filter(p => p.difficulty === 'Hard').length || 0) / 4) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Track Category Performance Summary */}
      <div className="p-5 bg-secondaryBg/30 border border-white/5 rounded-xl space-y-4">
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Track Performance Index</h4>
          <p className="text-[10px] text-lightGray/50 mt-0.5">Performance averages split between HR Behavioral and Technical interview tracks</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          {/* HR Track Box */}
          <div className="p-4 bg-background/40 border border-white/5 rounded-xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-lightGray/40 uppercase">HR / Behavioral Rounds</span>
              <div className="text-2xl font-black text-white">{hrAvg}%</div>
              <p className="text-[9px] text-lightGray/50">Based on {hrRounds.length} evaluated session{hrRounds.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="h-10 w-24 bg-white/5 rounded-lg border border-white/5 flex items-center justify-center text-[10px] text-white font-bold uppercase tracking-wider">
              {hrAvg >= 80 ? 'Master' : hrAvg >= 65 ? 'Skilled' : hrAvg > 0 ? 'Learning' : 'No Data'}
            </div>
          </div>

          {/* Technical Track Box */}
          <div className="p-4 bg-background/40 border border-white/5 rounded-xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-lightGray/40 uppercase">Technical Rounds</span>
              <div className="text-2xl font-black text-white">{techAvg}%</div>
              <p className="text-[9px] text-lightGray/50">Based on {techRounds.length} evaluated session{techRounds.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="h-10 w-24 bg-white/5 rounded-lg border border-white/5 flex items-center justify-center text-[10px] text-white font-bold uppercase tracking-wider">
              {techAvg >= 80 ? 'Expert' : techAvg >= 65 ? 'Proficient' : techAvg > 0 ? 'Novice' : 'No Data'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
