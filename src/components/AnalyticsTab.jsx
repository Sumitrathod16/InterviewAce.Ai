import React, { useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Award, BarChart3, TrendingUp, Sparkles, Play, ShieldAlert, ArrowUpRight, BookOpen } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AnalyticsTab({ interviewsList = [], theme = 'dark' }) {
  const [useDemo, setUseDemo] = useState(false);

  // Define realistic mock/demo data for placeholder view
  const demoInterviews = [
    {
      _id: 'd1',
      type: 'HR Behavioral',
      track: 'HR Track',
      score: 64,
      completed: true,
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      evaluations: [
        { communicationScore: 70, contentScore: 58 },
        { communicationScore: 75, contentScore: 60 },
        { communicationScore: 72, contentScore: 60 }
      ]
    },
    {
      _id: 'd2',
      type: 'Technical',
      track: 'Frontend Technical',
      score: 75,
      completed: true,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      evaluations: [
        { communicationScore: 76, contentScore: 72 },
        { communicationScore: 80, contentScore: 74 },
        { communicationScore: 78, contentScore: 71 }
      ]
    },
    {
      _id: 'd3',
      type: 'HR Behavioral',
      track: 'HR Track',
      score: 82,
      completed: true,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      evaluations: [
        { communicationScore: 86, contentScore: 78 },
        { communicationScore: 84, contentScore: 80 }
      ]
    },
    {
      _id: 'd4',
      type: 'Technical',
      track: 'Backend Technical',
      score: 89,
      completed: true,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      evaluations: [
        { communicationScore: 88, contentScore: 90 },
        { communicationScore: 85, contentScore: 92 },
        { communicationScore: 90, contentScore: 90 }
      ]
    }
  ];

  const actualCompleted = interviewsList.filter(i => i.completed);
  const isDataEmpty = actualCompleted.length === 0;

  // Decide source of data
  const completed = (isDataEmpty || useDemo) ? demoInterviews : actualCompleted;
  
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
            <button
              onClick={() => setUseDemo(!useDemo)}
              className="px-3 py-1.5 text-xs font-bold bg-white text-background rounded-lg hover:bg-lightGray transition-all flex items-center gap-1.5"
            >
              <Sparkles size={12} />
              {useDemo ? 'Hide Sample Data' : 'View Sample Analytics'}
            </button>
          </div>
        )}

        {!isDataEmpty && useDemo && (
          <button
            onClick={() => setUseDemo(false)}
            className="px-3 py-1.5 text-xs font-bold border border-white/10 text-white rounded-lg hover:bg-white/5 transition-all"
          >
            Switch to Live Data
          </button>
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

      {/* Demo status alert */}
      {((isDataEmpty && useDemo) || (useDemo)) && (
        <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between text-xs text-lightGray/70">
          <span className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-white animate-pulse" />
            <span>Currently previewing <strong>Interactive Demo Analytics</strong>. Complete real interview sessions to plot live data.</span>
          </span>
          <button 
            onClick={() => setUseDemo(false)}
            className="text-[10px] font-bold text-white hover:underline uppercase tracking-wide"
          >
            Dismiss
          </button>
        </div>
      )}

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
