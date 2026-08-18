import React, { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, FileText, CheckSquare, Calendar, ChevronRight, Activity, 
  Code, UserCheck, AlertCircle, ArrowRight, LogOut, Shield,
  CreditCard, User, Sparkles, Building, Compass, Check, Info, Settings, Clock,
  BarChart3, History, RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const MockInterviewDemo = lazy(() => import('./MockInterviewDemo'));
const ResumeAnalyzer = lazy(() => import('./ResumeAnalyzer'));
const CodingAssessment = lazy(() => import('./CodingAssessment'));
const AnalyticsTab = lazy(() => import('./AnalyticsTab'));

function TabLoader() {
  return (
    <div className="py-20 flex flex-col items-center justify-center space-y-3">
      <div className="w-8 h-8 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
      <span className="text-xs font-mono text-lightGray/60">Loading workspace tool...</span>
    </div>
  );
}

export default function DashboardPortal({ 
  solvedProblems, 
  solvedProblemsDetail,
  onSolveProblem,
  selectedProblemIndex,
  onSelectProblemIndex,
  atsScore, 
  onAtsScoreChange,
  completedInterviews,
  onSelectProblem,
  onInterviewComplete,
  onViewChange,
  userProfile,
  onLogout,
  onRefreshProfile,
  activeTab = 'overview',
  setActiveTab,
  theme
}) {
  const navigate = useNavigate();
  // AI Career Coach states
  const [coachData, setCoachData] = useState(null);
  const [loadingCoach, setLoadingCoach] = useState(false);
  const [coachError, setCoachError] = useState('');

  // Company prep states
  const [selectedCompany, setSelectedCompany] = useState('tcs');
  const [companyPrepData, setCompanyPrepData] = useState(null);
  const [loadingCompany, setLoadingCompany] = useState(false);
  const [customCompany, setCustomCompany] = useState('');
  const [generatingCompany, setGeneratingCompany] = useState(false);

  // Billing states
  const [billingInfo, setBillingInfo] = useState({ subscription: { plan: 'Free', status: 'none' }, history: [] });
  const [upgrading, setUpgrading] = useState(false);

  // Profile edit states
  const [name, setName] = useState(userProfile?.name || '');
  const [targetRole, setTargetRole] = useState(userProfile?.targetRole || 'Frontend Engineer');
  const [education, setEducation] = useState(userProfile?.education || '');
  const [skillsText, setSkillsText] = useState(userProfile?.skills?.join(', ') || '');
  const [profilePic, setProfilePic] = useState(userProfile?.profilePic || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  // History logs fetched from DB
  const [dbInterviews, setDbInterviews] = useState([]);
  const [dbResumes, setDbResumes] = useState([]);
  const [problems, setProblems] = useState([]);
  const [difficultyFilter, setDifficultyFilter] = useState('Easy');

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle photo conversion to base64
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1.5 * 1024 * 1024) {
        toast.error("Profile picture size must be under 1.5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Sync profile details when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
      setTargetRole(userProfile.targetRole || 'Frontend Engineer');
      setEducation(userProfile.education || '');
      setSkillsText(userProfile.skills?.join(', ') || '');
      setProfilePic(userProfile.profilePic || '');
    }
  }, [userProfile]);

  // Fetch candidate history datasets
  const fetchDashboardData = async () => {
    try {
      const interviewRes = await API.get('/interviews/history');
      setDbInterviews(interviewRes.data);
    } catch (err) {
      console.warn('Backend history load failed, utilizing client props fallback.');
    }

    try {
      const resumeRes = await API.get('/resumes/history');
      setDbResumes(resumeRes.data);
    } catch (err) {
      console.warn('Backend resume history load failed.');
    }

    try {
      const problemsRes = await API.get('/problems');
      setProblems(problemsRes.data);
    } catch (err) {
      console.warn('Backend problems load failed.');
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [userProfile]);

  // Load Billing details
  useEffect(() => {
    if (activeTab === 'billing') {
      const fetchBilling = async () => {
        try {
          const response = await API.get('/payments/billing-info');
          setBillingInfo(response.data);
        } catch (err) {
          console.warn('Billing fetch failed.');
        }
      };
      fetchBilling();
    }
  }, [activeTab]);

  // Fetch company specific preparation questions
  useEffect(() => {
    if (activeTab === 'company' && selectedCompany) {
      const fetchCompanyPrep = async () => {
        setLoadingCompany(true);
        try {
          const response = await API.get(`/coach/company/${selectedCompany}`);
          setCompanyPrepData(response.data);
        } catch (err) {
          console.warn('Company details failed, loading locally.');
        } finally {
          setLoadingCompany(false);
        }
      };
      fetchCompanyPrep();
    }
  }, [activeTab, selectedCompany]);

  // Trigger Career Coach roadmap generation
  const handleGenerateRoadmap = async () => {
    setLoadingCoach(true);
    setCoachError('');
    try {
      const skillsArray = skillsText.split(',').map(s => s.trim()).filter(Boolean);
      const response = await API.post('/coach/roadmap', {
        skills: skillsArray,
        targetRole,
        education
      });
      setCoachData(response.data);
    } catch (err) {
      console.error(err);
      setCoachError(err.response?.data?.message || 'Failed to connect to AI Career Advisor.');
    } finally {
      setLoadingCoach(false);
    }
  };

  const handleGenerateCustomCompany = async (e) => {
    if (e) e.preventDefault();
    if (!customCompany.trim()) {
      toast.error('Please enter a target company name.');
      return;
    }

    setGeneratingCompany(true);
    const toastId = toast.loading(`Generating tailored guide for ${customCompany}...`);
    try {
      const response = await API.post('/coach/company/generate', {
        companyName: customCompany.trim()
      });
      setCompanyPrepData(response.data);
      setSelectedCompany(''); // Clear quick filter buttons active states
      toast.success(`Preparation module for ${customCompany} generated successfully!`, { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to generate company-specific guide. Ensure you have a Pro/Premium subscription.', { id: toastId });
    } finally {
      setGeneratingCompany(false);
    }
  };

  // Profile Form submissions
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setProfileMsg('');
    try {
      const skillsArray = skillsText.split(',').map(s => s.trim()).filter(Boolean);
      await API.put('/auth/profile', {
        name,
        targetRole,
        education,
        skills: skillsArray,
        profilePic
      });
      
      // Update local storage user profile sync
      const savedUser = JSON.parse(localStorage.getItem('interviewace_user') || '{}');
      const updatedUser = { ...savedUser, name, targetRole, education, skills: skillsArray, profilePic };
      localStorage.setItem('interviewace_user', JSON.stringify(updatedUser));
      
      if (onRefreshProfile) {
        await onRefreshProfile();
      }

      setProfileMsg('Profile updated successfully!');
    } catch (err) {
      setProfileMsg('Failed to sync profile changes.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Trigger Stripe/Razorpay trial checkout redirections
  const handleSubscribe = (tierName, billingPeriod = 'monthly') => {
    navigate(`/trial-checkout?plan=${tierName}&period=${billingPeriod}`);
  };

  const handleCancelAutopay = async () => {
    if (window.confirm('Are you sure you want to cancel your Razorpay autopay mandate? You will lose 2-month free access and won\'t be charged after.')) {
      try {
        await API.delete('/payments/cancel-subscription');
        alert('Autopay mandate cancelled successfully. You will not be charged.');
        if (onRefreshProfile) await onRefreshProfile();
        else window.location.reload();
      } catch (err) {
        alert(err.response?.data?.message || 'Cancellation failed. Please try again or contact support.');
      }
    }
  };

  const handleCancelSub = async () => {
    if (confirm('Are you sure you want to cancel your active premium subscription?')) {
      try {
        await API.post('/payments/mock-activate', { planName: 'Free' });
        alert('Subscription canceled. Downgraded to Free tier.');
        window.location.reload();
      } catch (err) {
        alert('Cancellation failed.');
      }
    }
  };

  // Compile calculations
  const interviewsList = dbInterviews.length > 0 ? dbInterviews : completedInterviews;
  const avgInterviewScore = interviewsList.length > 0
    ? Math.round(interviewsList.reduce((acc, curr) => acc + curr.score, 0) / interviewsList.length)
    : 0;

  let interviewXp = 0;
  interviewsList.forEach(interview => {
    const qCount = interview.questions?.length || 0;
    if (qCount <= 3) {
      interviewXp += 100;
    } else if (qCount <= 5) {
      interviewXp += 150;
    } else {
      interviewXp += 200;
    }
  });

  const totalXp = 500 + (solvedProblems.size * 10) + interviewXp;
  const practiceStreak = userProfile?.streakCount || 0;

  // Combine all XP transaction histories (earnings + spendings)
  const xpTransactionsList = [
    {
      description: "Welcome Bonus Points",
      amount: 500,
      timestamp: userProfile?.createdAt || new Date()
    }
  ];

  // 1. Solved Problems (Earnings)
  if (userProfile?.solvedProblems && Array.isArray(userProfile.solvedProblems)) {
    userProfile.solvedProblems.forEach(p => {
      xpTransactionsList.push({
        description: `Solved Algorithm Challenge (${p.problemId})`,
        amount: 10,
        timestamp: p.solvedAt || new Date()
      });
    });
  }

  // 2. Completed Interviews (Earnings)
  interviewsList.filter(i => i.completed).forEach(i => {
    const qCount = i.questions?.length || 0;
    let earned = 200;
    if (qCount <= 3) earned = 100;
    else if (qCount <= 5) earned = 150;

    xpTransactionsList.push({
      description: `Completed Mock Interview (${i.track || i.type || 'General'} - ${qCount} Qs)`,
      amount: earned,
      timestamp: i.updatedAt || i.createdAt || new Date()
    });
  });

  // 3. Redemptions (Spendings)
  if (userProfile?.redemptions && Array.isArray(userProfile.redemptions)) {
    userProfile.redemptions.forEach(r => {
      xpTransactionsList.push({
        description: r.description || `Redeemed ${r.rewardType}`,
        amount: r.amount,
        timestamp: r.timestamp || new Date()
      });
    });
  }

  // Sort oldest first to calculate running balance
  xpTransactionsList.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  let runningBalance = 0;
  xpTransactionsList.forEach(tx => {
    runningBalance += tx.amount;
    tx.runningBalance = runningBalance;
  });

  // Re-sort latest first for rendering
  xpTransactionsList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const CHALLENGES = problems.length > 0
    ? problems.map((p, idx) => ({ id: p.problemId || p.id, title: p.title, difficulty: p.difficulty, index: idx }))
    : [
        { id: 'twosum', title: '1. Two Sum', difficulty: 'Easy', index: 0 },
        { id: 'reversestring', title: '344. Reverse String', difficulty: 'Easy', index: 1 },
        { id: 'palindrome', title: '9. Valid Palindrome', difficulty: 'Easy', index: 2 },
        { id: 'fizzbuzz', title: '412. Fizz Buzz', difficulty: 'Easy', index: 3 },
        { id: 'fibonacci', title: '509. Fibonacci Number', difficulty: 'Easy', index: 4 },
        { id: 'mergesorted', title: '88. Merge Sorted Array', difficulty: 'Easy', index: 5 },
        { id: 'binarysearch', title: '704. Binary Search', difficulty: 'Easy', index: 6 },
        { id: 'containsduplicate', title: '217. Contains Duplicate', difficulty: 'Easy', index: 7 },
        { id: 'validparentheses', title: '20. Valid Parentheses', difficulty: 'Easy', index: 8 }
      ];

  const stats = [
    { 
      title: 'Interview Rating', 
      value: interviewsList.length > 0 ? `${avgInterviewScore}%` : '-', 
      desc: interviewsList.length > 0 ? `Based on ${interviewsList.length} rounds` : 'No interviews yet', 
      icon: Award 
    },
    { 
      title: 'ATS Resume Rating', 
      value: dbResumes.length > 0 ? `${atsScore}/100` : '-', 
      desc: dbResumes.length > 0 ? (atsScore >= 80 ? 'ATS Compatible' : 'Needs Optimization') : 'No resumes scanned yet', 
      icon: FileText 
    },
    { 
      title: 'Algorithm Challenges', 
      value: `${solvedProblems.size} / ${CHALLENGES.length}`, 
      desc: `${Math.max(0, CHALLENGES.length - solvedProblems.size)} remaining`, 
      icon: CheckSquare 
    },
    { 
      title: 'Practice Streak', 
      value: `${practiceStreak} Day${practiceStreak !== 1 ? 's' : ''}`, 
      desc: 'Active streak', 
      icon: Calendar 
    }
  ];

  const nameInitials = userProfile?.name
    ? userProfile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'US';

  const initialsPreview = name
    ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'US';

  const [redeemingReward, setRedeemingReward] = useState(false);

  const handleRedeemReward = async (rewardType, cost) => {
    const availableXp = totalXp - (userProfile?.spentXp || 0);
    if (availableXp < cost) {
      toast.error('Insufficient XP points to redeem this reward.');
      return;
    }

    setRedeemingReward(true);
    const toastId = toast.loading('Processing redemption...');
    try {
      const response = await API.post('/rewards/redeem', { rewardType });
      toast.success(response.data.message || 'Reward redeemed successfully!', { id: toastId });
      if (onRefreshProfile) {
        await onRefreshProfile();
      }
    } catch (err) {
      console.error('Redeem reward error:', err);
      toast.error(err.response?.data?.message || 'Failed to redeem reward. Please try again.', { id: toastId });
    } finally {
      setRedeemingReward(false);
    }
  };

  const companiesList = [
    { id: 'tcs', name: 'TCS' },
    { id: 'infosys', name: 'Infosys' },
    { id: 'wipro', name: 'Wipro' },
    { id: 'accenture', name: 'Accenture' },
    { id: 'deloitte', name: 'Deloitte' }
  ];

  return (
    <div className="pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-24 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 space-y-8 min-w-0 w-full overflow-hidden">
        
        {/* Candidate Profile Summary card - Nordic Redesign */}
        <div className="p-4 sm:p-6 bg-secondaryBg/80 dark:bg-secondaryBg/45 border border-slate-200/50 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] dark:shadow-none hover:shadow-[0_8px_30px_rgb(0,0,0,0.035)] transition-all duration-300 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-accent to-secondary text-white flex items-center justify-center font-bold text-xl select-none shadow-[0_4px_16px_rgba(var(--accent),0.25)] flex-shrink-0">
              {userProfile?.profilePic ? (
                <img src={userProfile.profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                nameInitials
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h2 className="text-xl font-bold text-white">Welcome back, {userProfile?.name || 'Candidate'}!</h2>
                
                {/* Admin dashboard indicator shortcut */}
                {userProfile?.role === 'Admin' && (
                  <button 
                    onClick={() => onViewChange('admin')}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-accent text-white text-[9px] font-bold uppercase transition-colors hover:bg-accent/80"
                  >
                    <Shield size={10} />
                    Admin
                  </button>
                )}
              </div>
              <p className="text-sm text-lightGray/60 mt-0.5">{userProfile?.targetRole || 'Technical Preparation Track'}</p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-lightGray/40 justify-center sm:justify-start">
                <span className="flex items-center gap-1">
                  <Award size={12} className="text-secondary animate-bounce" />
                  <span className="text-secondary font-bold">{totalXp - (userProfile?.spentXp || 0)} XP Balance</span> (Total Earned: {totalXp} XP)
                </span>
                <span>•</span>
                <span>
                   Tier: <strong className="text-white">{userProfile?.subscription || 'Free'}</strong>
                   {userProfile?.isTrial && (
                     <span className="ml-1.5 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-extrabold uppercase text-[9px] border border-indigo-500/20 animate-pulse">
                       Launch Trial
                     </span>
                   )}
                 </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2.5 justify-center sm:justify-end w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 border transition-all ${
                activeTab === 'profile' ? 'bg-accent text-white border-accent shadow-[0_4px_10px_rgba(var(--accent),0.15)]' : 'text-lightGray/70 border-slate-200/60 dark:border-white/5 hover:bg-white/5 dark:hover:bg-white/5'
              }`}
            >
              <Settings size={13} />
              Profile
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-xs font-semibold text-lightGray/70 hover:text-white border border-slate-200/60 dark:border-white/5 rounded-lg flex items-center gap-2 transition-all hover:bg-white/5 dark:hover:bg-white/5"
            >
              <LogOut size={13} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Dashboard Navigation Tabs - Horizontal Scroll on Mobile */}
        <div className="flex border-b border-slate-200/60 dark:border-white/5 overflow-x-auto scrollbar-none gap-2 pb-1 -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
          {[
            { id: 'overview', name: 'Workspace Overview', icon: Activity },
            { id: 'analytics', name: 'Performance Analytics', icon: BarChart3 },
            { id: 'interviews', name: 'AI Mock Interviews', icon: UserCheck },
            { id: 'resume', name: 'ATS Resume Analyzer', icon: FileText },
            { id: 'coding', name: 'Coding Assessment', icon: Code },
            { id: 'coach', name: 'AI Career Coach', icon: Compass },
            { id: 'company', name: 'Company-Specific Prep', icon: Building },
            { id: 'rewards', name: 'XP Rewards', icon: Sparkles }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-all flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'border-accent text-accent'
                    : 'border-transparent text-lightGray/40 hover:text-lightGray'
                }`}
              >
                <Icon size={14} />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* TAB WORKSPACES CONTAINER */}
        <div>
          {!isOnline ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-20 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6"
            >
              <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/25 text-rose-500 animate-pulse">
                <AlertCircle size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white uppercase tracking-wider">Workspace Inactive</h3>
                <p className="text-xs text-lightGray/60 leading-relaxed">
                  Your internet connection is currently offline. An active network connection is required to synchronize challenges, run compiler sessions, and communicate with Gemini AI evaluators.
                </p>
              </div>
              <button
                onClick={() => setIsOnline(navigator.onLine)}
                className="px-6 py-2.5 bg-secondaryBg hover:bg-secondaryBg/80 border border-slate-200/60 dark:border-white/5 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2 animate-none"
              >
                <RefreshCw size={14} className="animate-spin" />
                Retry Connection
              </button>
            </motion.div>
          ) : (
            <Suspense fallback={<TabLoader />}>
              <AnimatePresence mode="wait">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {stats.map((stat, idx) => {
                    const Icon = stat.icon;
                    const iconColorClasses = [
                      'bg-accent/10 text-accent',
                      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                      'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
                      'bg-secondary/10 text-secondary'
                    ][idx] || 'bg-accent/10 text-accent';

                    return (
                      <div key={idx} className="p-5 bg-secondaryBg/80 dark:bg-secondaryBg/40 border border-slate-200/50 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] dark:shadow-none hover:shadow-[0_8px_30px_rgb(0,0,0,0.035)] transition-all duration-300 rounded-2xl flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-xs font-semibold text-lightGray/50 uppercase">{stat.title}</span>
                          <div className="text-2xl font-extrabold text-white">{stat.value}</div>
                          <div className="text-[10px] text-lightGray/40">{stat.desc}</div>
                        </div>
                        <div className={`p-3 rounded-xl ${iconColorClasses}`}>
                          <Icon size={18} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {userProfile?.subscription === 'Free' && (
                  <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-400 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                        <Sparkles size={14} className="animate-pulse" />
                        15-Day Free Student Usage Tracker
                      </div>
                      <div className="flex flex-wrap gap-4 text-lightGray/70">
                        <span>AI Interviews: <strong className="text-white">{3 - (userProfile.interviewCountToday || 0)} / 3</strong> left</span>
                        <span>Resume Audits: <strong className="text-white">{2 - (userProfile.resumeCountToday || 0)} / 2</strong> left</span>
                      </div>
                    </div>
                    <div className="text-[10px] text-lightGray/40 font-mono text-right">
                      Next Refill: {new Date(new Date(userProfile.freeRefillDate || userProfile.createdAt).getTime() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Contribution heat activity log */}
                  <div className="lg:col-span-8 p-6 bg-secondaryBg/80 dark:bg-secondaryBg/40 border border-slate-200/50 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] dark:shadow-none hover:shadow-[0_8px_30px_rgb(0,0,0,0.035)] transition-all duration-300 rounded-2xl space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Activity size={16} /> Completed Interview Rounds Log
                      </h3>
                      <p className="text-xs text-lightGray/55 mt-0.5">Logs of AI evaluations performed on your account</p>
                    </div>

                    <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
                      {interviewsList.length > 0 ? (
                        interviewsList.map((int, idx) => (
                          <div key={int._id || idx} className="p-4 bg-background/40 hover:bg-background/80 border border-slate-200/40 dark:border-white/5 rounded-xl flex items-center justify-between transition-all duration-200">
                            <div>
                              <div className="text-xs font-bold text-white">{int.track || int.type} Round</div>
                              <div className="text-[10px] text-lightGray/40 mt-1">Date: {new Date(int.createdAt).toLocaleDateString()} • {int.questions.length} questions</div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <span className="text-xs font-bold text-white/90">Score: {int.score}%</span>
                              </div>
                              <span className="px-2.5 py-0.5 rounded-full bg-accent/10 text-accent text-[9px] font-bold uppercase tracking-wider">Completed</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 text-lightGray/40">
                          No mock interviews logged. Select track on landing page to begin.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sidebar activities */}
                  <div className="lg:col-span-4 p-6 bg-secondaryBg/80 dark:bg-secondaryBg/40 border border-slate-200/50 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] dark:shadow-none hover:shadow-[0_8px_30px_rgb(0,0,0,0.035)] transition-all duration-300 rounded-2xl flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                        <UserCheck size={16} /> Resume Audits Log
                      </h3>
                      
                      <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                        {dbResumes.length > 0 ? (
                          dbResumes.map((rep, idx) => (
                            <div key={rep._id || idx} className="p-3 bg-background/30 hover:bg-background/60 border border-slate-200/40 dark:border-white/5 rounded-xl flex items-center justify-between text-xs transition-all duration-200">
                              <div>
                                <div className="font-semibold text-white">ATS Scanned Report</div>
                                <div className="text-[9px] text-lightGray/40 mt-0.5">{new Date(rep.createdAt).toLocaleDateString()}</div>
                              </div>
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider ${rep.atsScore >= 80 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : rep.atsScore >= 65 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>{rep.atsScore}/100</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-lightGray/40">
                            No resume audits recorded.
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const el = document.querySelector('#resume');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full mt-6 py-2.5 text-xs font-bold bg-accent text-white rounded-lg hover:bg-accent/90 transition-all text-center shadow-[0_4px_12px_rgba(var(--accent),0.15)]"
                    >
                      Audit Resume Now
                    </button>
                  </div>
                </div>

                {/* Challenges listing */}
                <div className="p-6 bg-secondaryBg/80 dark:bg-secondaryBg/40 border border-slate-200/50 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] dark:shadow-none hover:shadow-[0_8px_30px_rgb(0,0,0,0.035)] transition-all duration-300 rounded-2xl space-y-6">
                  <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-200/60 dark:border-white/5 pb-4">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Algorithmic Sandbox Selection</h3>
                      <p className="text-xs text-lightGray/55 mt-0.5">Select a challenge below and run inside the compiler sandbox</p>
                    </div>
                    
                    <div className="flex p-0.5 bg-slate-200/50 dark:bg-white/5 border border-slate-200/40 dark:border-white/5 rounded-xl">
                      {[
                        { id: 'Easy', name: 'Easy Level' },
                        { id: 'Medium', name: 'Medium Level' },
                        { id: 'Hard', name: 'High Level' }
                      ].map((lvl) => (
                        <button
                          key={lvl.id}
                          type="button"
                          onClick={() => setDifficultyFilter(lvl.id)}
                          className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                            difficultyFilter === lvl.id 
                              ? 'bg-accent text-white font-extrabold shadow-md' 
                              : 'text-lightGray/50 hover:text-lightGray'
                          }`}
                        >
                          {lvl.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-h-[300px] overflow-y-auto pr-1">
                    {CHALLENGES.filter(ch => ch.difficulty === difficultyFilter).map((ch) => (
                      <div
                        key={ch.id}
                        onClick={() => {
                          onSelectProblem(ch.index);
                          setActiveTab('coding');
                          setTimeout(() => {
                            const el = document.getElementById('coding');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }, 100);
                        }}
                        className="p-4 bg-background/40 border border-slate-200/40 dark:border-white/5 rounded-xl flex items-center justify-between hover:bg-background/80 hover:border-slate-200/80 dark:hover:border-white/10 transition-all cursor-pointer group"
                      >
                        <div className="text-xs font-bold text-white group-hover:text-accent transition-colors">{ch.title}</div>
                        <ChevronRight size={14} className="text-lightGray/20 group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                      </div>
                    ))}
                    {CHALLENGES.filter(ch => ch.difficulty === difficultyFilter).length === 0 && (
                      <div className="col-span-3 text-center py-8 text-lightGray/40 italic">
                        No problems available in this tier.
                      </div>
                    )}
                  </div>
                </div>

                {/* Plans / Active subscription tier */}
                <div className="p-6 bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-emerald-500/10 border border-amber-500/20 rounded-2xl space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Public Beta - Full Access Unlocked</h3>
                      <p className="text-xs text-lightGray/70">All AI Mock Interviews, ATS Resume Scoring, Sandbox Compiler, and Career Coaching tools are 100% free.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ANALYTICS TAB */}
            {activeTab === 'analytics' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="p-6 bg-secondaryBg/80 dark:bg-secondaryBg/40 border border-slate-200/50 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] dark:shadow-none hover:shadow-[0_8px_30px_rgb(0,0,0,0.035)] transition-all duration-300 rounded-2xl">
                  <AnalyticsTab 
                    interviewsList={interviewsList} 
                    solvedProblems={solvedProblems}
                    solvedProblemsDetail={Array.isArray(solvedProblemsDetail) ? solvedProblemsDetail.map(sp => {
                      const matchedProblem = problems.find(p => p.problemId === sp.problemId);
                      return {
                        ...sp,
                        difficulty: matchedProblem?.difficulty || 'Easy'
                      };
                    }) : []}
                    userProfile={userProfile}
                    theme={theme} 
                  />
                </div>
              </motion.div>
            )}

            {/* INTERVIEWS TAB */}
            {activeTab === 'interviews' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="p-6 bg-secondaryBg/80 dark:bg-secondaryBg/40 border border-slate-200/50 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] dark:shadow-none hover:shadow-[0_8px_30px_rgb(0,0,0,0.035)] transition-all duration-300 rounded-2xl">
                  <MockInterviewDemo 
                    onInterviewComplete={() => {
                      fetchDashboardData();
                      if (onInterviewComplete) onInterviewComplete();
                    }} 
                  />
                </div>
              </motion.div>
            )}

            {/* RESUME TAB */}
            {activeTab === 'resume' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="p-6 bg-secondaryBg/80 dark:bg-secondaryBg/40 border border-slate-200/50 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] dark:shadow-none hover:shadow-[0_8px_30px_rgb(0,0,0,0.035)] transition-all duration-300 rounded-2xl">
                  <ResumeAnalyzer 
                    atsScore={atsScore} 
                    onAtsScoreChange={(newScore) => {
                      if (onAtsScoreChange) onAtsScoreChange(newScore);
                      fetchDashboardData();
                    }} 
                  />
                </div>
              </motion.div>
            )}

            {/* CODING TAB */}
            {activeTab === 'coding' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="p-6 bg-secondaryBg/80 dark:bg-secondaryBg/40 border border-slate-200/50 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] dark:shadow-none hover:shadow-[0_8px_30px_rgb(0,0,0,0.035)] transition-all duration-300 rounded-2xl">
                  <CodingAssessment 
                    solvedProblems={solvedProblems} 
                    onSolveProblem={onSolveProblem} 
                    selectedProblemIndex={selectedProblemIndex}
                    onSelectProblemIndex={onSelectProblemIndex}
                    problems={problems}
                    theme={theme}
                  />
                </div>
              </motion.div>
            )}

            {/* AI CAREER COACH TAB */}
            {activeTab === 'coach' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-6 bg-secondaryBg/80 dark:bg-secondaryBg/40 border border-slate-200/50 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] dark:shadow-none hover:shadow-[0_8px_30px_rgb(0,0,0,0.035)] transition-all duration-300 rounded-2xl space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-white/5 pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Compass size={16} /> AI Career Coach Roadmap
                    </h3>
                    <p className="text-xs text-lightGray/55 mt-0.5">Personalized skill gap analyses and entry/mid-level salary expectations</p>
                  </div>
                  {userProfile?.subscription === 'Premium' && (
                    <button
                      onClick={handleGenerateRoadmap}
                      disabled={loadingCoach}
                      className="px-4 py-2 text-xs font-bold bg-accent hover:bg-accent/90 text-white rounded-lg disabled:opacity-40 transition-all shadow-[0_4px_12px_rgba(var(--accent),0.15)]"
                    >
                      {loadingCoach ? 'Analyzing Profile...' : 'Generate AI Roadmap'}
                    </button>
                  )}
                </div>

                {coachData ? (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    {/* Roadmap Timelines */}
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase mb-3.5 flex items-center gap-1.5"><Calendar size={13} /> Target Timeline Checklist</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {coachData.roadmap.map((phase, idx) => (
                          <div key={idx} className="p-4 bg-background/30 hover:bg-background/60 border border-slate-200/40 dark:border-white/5 rounded-xl space-y-2 transition-all duration-250">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-white">{phase.phase}</span>
                              <span className="px-2 py-0.5 bg-accent/10 rounded text-[9px] font-mono text-accent">{phase.duration}</span>
                            </div>
                            <ul className="space-y-1.5 text-[11px] text-lightGray/70">
                              {phase.goals.map((g, i) => (
                                <li key={i} className="flex gap-1.5 items-start">
                                  <Check size={11} className="text-accent mt-0.5 flex-shrink-0" />
                                  <span>{g}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Skill Gaps & Salary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200/60 dark:border-white/5">
                      {/* Skill Gap Analysis */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-white uppercase flex items-center gap-1.5"><Info size={13} /> Skill Gap Analysis</h4>
                        <div className="p-4 bg-background/30 border border-slate-200/40 dark:border-white/5 rounded-xl space-y-3">
                          <div>
                            <span className="text-[10px] text-lightGray/50 font-bold uppercase">Identified Strengths</span>
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {coachData.skillGapAnalysis.strengths.map((str, i) => (
                                <span key={i} className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">{str}</span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] text-lightGray/50 font-bold uppercase">Gaps to Address</span>
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {coachData.skillGapAnalysis.gaps.map((gap, i) => (
                                <span key={i} className="px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/25 text-[10px] text-rose-600 dark:text-rose-400 font-medium">{gap}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Salary Benchmarks */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-white uppercase flex items-center gap-1.5"><CreditCard size={13} /> Salary & Market Outlook</h4>
                        <div className="p-4 bg-background/30 border border-slate-200/40 dark:border-white/5 rounded-xl text-xs space-y-2.5">
                          <div className="flex justify-between border-b border-slate-200/50 dark:border-white/5 pb-2">
                            <span className="text-lightGray/60">Entry-Level Range</span>
                            <span className="font-bold text-white">{coachData.salaryInsights.entryLevel}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-200/50 dark:border-white/5 pb-2">
                            <span className="text-lightGray/60">Mid-Level Range</span>
                            <span className="font-bold text-white">{coachData.salaryInsights.midLevel}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-200/50 dark:border-white/5 pb-2">
                            <span className="text-lightGray/60">Senior-Level Range</span>
                            <span className="font-bold text-white">{coachData.salaryInsights.seniorLevel}</span>
                          </div>
                          <div className="flex justify-between items-center pt-1">
                            <span className="text-lightGray/60">Global Market Demand</span>
                            <span className="px-2.5 py-0.5 bg-accent/10 text-accent text-[9px] font-bold rounded-full uppercase tracking-wider">{coachData.salaryInsights.marketDemand}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 text-lightGray/40 space-y-3">
                    <Sparkles className="mx-auto" size={24} />
                    <p className="text-xs">Your career blueprint is ready. Click build above to generate personalized roadmap files.</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* COMPANY SPECIFIC PREPARATION TAB */}
            {activeTab === 'company' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-6 bg-secondaryBg/80 dark:bg-secondaryBg/40 border border-slate-200/50 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] dark:shadow-none hover:shadow-[0_8px_30px_rgb(0,0,0,0.035)] transition-all duration-300 rounded-2xl space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-white/5 pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Building size={16} /> Company-Specific Preparation Tracks
                    </h3>
                    <p className="text-xs text-lightGray/55 mt-0.5">Explore standard interviewer sets, questions, and aptitude outlines</p>
                  </div>

                  {userProfile?.subscription !== 'Free' && (
                    <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
                      {/* Custom Input */}
                      <form onSubmit={handleGenerateCustomCompany} className="flex gap-1.5 text-xs">
                        <input
                          type="text"
                          value={customCompany}
                          onChange={(e) => setCustomCompany(e.target.value)}
                          placeholder="e.g. Google, Microsoft, Zoho..."
                          className="px-3 py-1.5 bg-background/50 text-white rounded-lg border border-slate-200/40 dark:border-white/5 focus:outline-none focus:border-accent/40 w-48 font-sans"
                          disabled={generatingCompany}
                        />
                        <button
                          type="submit"
                          disabled={generatingCompany || !customCompany.trim()}
                          className="px-3.5 py-1.5 bg-accent hover:bg-accent/90 disabled:opacity-40 disabled:hover:bg-accent text-white font-bold rounded-lg transition-all flex items-center gap-1 whitespace-nowrap shadow-[0_2px_8px_rgba(var(--accent),0.15)]"
                        >
                          {generatingCompany ? 'Generating...' : 'AI Generate'}
                        </button>
                      </form>
                      
                      <div className="hidden lg:block w-px h-6 bg-slate-200/20 dark:bg-white/5 mx-1" />

                      {/* Quick Select Buttons */}
                      <div className="flex gap-1.5 flex-wrap">
                        {companiesList.map(c => (
                          <button
                            key={c.id}
                            onClick={() => {
                              setSelectedCompany(c.id);
                              setCustomCompany(''); // Clear custom input when choosing presets
                            }}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                              selectedCompany === c.id 
                                ? 'bg-accent text-white shadow-[0_4px_10px_rgba(var(--accent),0.15)]' 
                                : 'bg-background/50 text-lightGray border border-slate-200/40 dark:border-white/5 hover:bg-white/5'
                            }`}
                          >
                            {c.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {loadingCompany ? (
                  <div className="text-center py-16 text-lightGray/50 text-xs">
                    Loading company portfolio files...
                  </div>
                ) : companyPrepData ? (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div className="flex justify-between items-center p-4 bg-background/40 border border-slate-200/40 dark:border-white/5 rounded-xl text-xs">
                      <div>
                        <div className="font-bold text-white text-sm">{companyPrepData.name} Modules</div>
                        <div className="text-lightGray/60 mt-1">{companyPrepData.roundDetails}</div>
                      </div>
                      <span className="px-2.5 py-0.5 bg-accent/10 text-accent text-[9px] font-bold rounded-full uppercase tracking-wider">Difficulty: {companyPrepData.difficulty}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                      {/* Aptitude */}
                      <div className="p-4 bg-background/30 border border-slate-200/40 dark:border-white/5 rounded-xl space-y-3">
                        <h4 className="font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-200/50 dark:border-white/5">1. Quantitative Aptitude</h4>
                        <ul className="space-y-2 text-lightGray/70">
                          {companyPrepData.aptitudePrep.map((a, i) => <li key={i} className="leading-relaxed">• {a}</li>)}
                        </ul>
                      </div>

                      {/* Technical */}
                      <div className="p-4 bg-background/30 border border-slate-200/40 dark:border-white/5 rounded-xl space-y-3">
                        <h4 className="font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-200/50 dark:border-white/5">2. Tech Round Questions</h4>
                        <ul className="space-y-2 text-lightGray/70">
                          {companyPrepData.technicalQuestions.map((t, i) => <li key={i} className="leading-relaxed">• {t}</li>)}
                        </ul>
                      </div>

                      {/* HR */}
                      <div className="p-4 bg-background/30 border border-slate-200/40 dark:border-white/5 rounded-xl space-y-3">
                        <h4 className="font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-200/50 dark:border-white/5">3. HR Behavioral Puzzles</h4>
                        <ul className="space-y-2 text-lightGray/70">
                          {companyPrepData.hrQuestions.map((h, i) => <li key={i} className="leading-relaxed">• {h}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : null}
              </motion.div>
            )}

            {/* BILLING & SUBSCRIPTIONS TAB */}
            {activeTab === 'billing' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8"
              >
                {/* Billing details / Plans */}
                <div className="lg:col-span-8 p-6 bg-secondaryBg/80 dark:bg-secondaryBg/40 border border-slate-200/50 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] dark:shadow-none hover:shadow-[0_8px_30px_rgb(0,0,0,0.035)] transition-all duration-300 rounded-2xl space-y-6">
                  {userProfile?.subscription === 'Free' ? (
                    <>
                      <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">SaaS Premium Billing Matrix</h3>
                        <p className="text-xs text-lightGray/55 mt-0.5">Select and unlock advanced AI configurations</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-stretch">
                        {/* Free */}
                        <div className="p-5 bg-background/30 dark:bg-background/50 border border-slate-200/40 dark:border-white/5 rounded-2xl flex flex-col justify-between text-xs hover:border-slate-300 dark:hover:border-white/10 transition-all">
                          <div className="space-y-4">
                            <div>
                              <div className="font-bold text-white">Free Plan</div>
                              <div className="text-[10px] text-lightGray/40">Core access checks</div>
                            </div>
                            <div className="text-2xl font-black text-white">₹0</div>
                            <ul className="space-y-1.5 text-lightGray/60 text-[10px]">
                              <li>• 3 mock interviews / 15 days</li>
                              <li>• 2 resume scans / 15 days</li>
                              <li>• Basic coding problem sets</li>
                            </ul>
                          </div>
                          <button 
                            disabled 
                            className="w-full mt-6 py-2 bg-accent/10 text-accent font-bold rounded-lg border border-accent/20 cursor-not-allowed"
                          >
                            Active Tier
                          </button>
                        </div>

                        {/* Pro */}
                        <div className="p-5 bg-background/40 dark:bg-background/60 border border-slate-200/40 dark:border-white/5 rounded-2xl flex flex-col justify-between text-xs relative hover:border-slate-300 dark:hover:border-white/10 transition-all">
                          <div className="space-y-4">
                            <div>
                              <div className="font-bold text-white">Pro Plan</div>
                              <div className="text-[10px] text-lightGray/40">Thorough training track</div>
                            </div>
                            <div className="text-2xl font-black text-white">₹199<span className="text-[10px] text-lightGray/40">/month</span></div>
                            <ul className="space-y-1.5 text-lightGray/60 text-[10px]">
                              <li>• Unlimited interviews</li>
                              <li>• Voice interview formats</li>
                              <li>• Full ATS Resume checks</li>
                              <li>• Company prep files</li>
                            </ul>
                          </div>
                          <button
                            onClick={() => handleSubscribe('Pro')}
                            disabled={upgrading}
                            className="w-full mt-6 py-2 bg-accent hover:bg-accent/90 text-white font-bold rounded-lg transition-colors shadow-[0_4px_12px_rgba(var(--accent),0.15)] disabled:opacity-40"
                          >
                            Upgrade to Pro
                          </button>
                        </div>

                        {/* Premium */}
                        <div className="p-5 bg-background/40 dark:bg-background/60 border border-slate-200/40 dark:border-white/5 rounded-2xl flex flex-col justify-between text-xs relative hover:border-slate-300 dark:hover:border-white/10 transition-all">
                          <div className="space-y-4">
                            <div>
                              <div className="font-bold text-white">Premium Plan</div>
                              <div className="text-[10px] text-lightGray/40">AI career placement sets</div>
                            </div>
                            <div className="text-2xl font-black text-white">₹499<span className="text-[10px] text-lightGray/40">/month</span></div>
                            <ul className="space-y-1.5 text-lightGray/60 text-[10px]">
                              <li>• Everything in Pro tier</li>
                              <li>• 24/7 AI Career Coach</li>
                              <li>• Priority code sandbox</li>
                              <li>• Deep progress charts</li>
                            </ul>
                          </div>
                          <button
                            onClick={() => handleSubscribe('Premium')}
                            disabled={upgrading}
                            className="w-full mt-6 py-2 bg-accent hover:bg-accent/90 text-white font-bold rounded-lg transition-colors shadow-[0_4px_12px_rgba(var(--accent),0.15)] disabled:opacity-40"
                          >
                            Upgrade Premium
                          </button>
                        </div>
                      </div>
                    </>
                  ) : userProfile?.isTrial ? (
                     <div className="p-8 bg-gradient-to-br from-indigo-500/10 to-secondaryBg/60 dark:from-indigo-950/20 dark:to-background border border-indigo-500/20 dark:border-indigo-900/40 rounded-2xl text-center space-y-5">
                       <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto">
                         <Sparkles size={24} className="animate-pulse text-indigo-400" />
                       </div>
                       <div className="space-y-2">
                         <h3 className="text-lg font-black text-white">Active {userProfile.subscription} (Free Launch Access)</h3>
                         <p className="text-xs text-lightGray/60 max-w-sm mx-auto">
                           You are currently enjoying your 2-month free access. You have full access to all technical mocks, ATS analyzer scans, and sandboxes.
                         </p>
                       </div>
                       <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-xs text-indigo-600 dark:text-indigo-400 font-mono max-w-xs mx-auto">
                         DAYS REMAINING: {(() => {
                           if (!userProfile?.trialEndsAt) return 30;
                           const end = new Date(userProfile.trialEndsAt);
                           const now = new Date();
                           const diff = end - now;
                           const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
                           return days > 0 ? days : 0;
                         })()} DAYS
                       </div>
                       <div className="text-[10px] text-lightGray/40 leading-relaxed font-sans">
                         Trial will expire on {userProfile?.trialEndsAt ? new Date(userProfile.trialEndsAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '30 days'}. Secure uninterrupted access by selecting a plan below.
                       </div>
                     </div>
                   ) : (
                     <div className="p-8 bg-gradient-to-br from-emerald-500/10 to-secondaryBg/60 dark:from-emerald-950/20 dark:to-background border border-emerald-500/20 dark:border-emerald-900/40 rounded-2xl text-center space-y-5">
                       <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto">
                         <Sparkles size={24} className="animate-pulse" />
                       </div>
                       <div className="space-y-2">
                         <h3 className="text-lg font-black text-white">Active {userProfile.subscription} Pack</h3>
                         <p className="text-xs text-lightGray/60 max-w-sm mx-auto">
                           Thank you for purchasing the {userProfile.subscription} access tier. You now have unlimited access to AI Mock Interviews, ATS Resume Audits, and the Coding Compilation Sandbox.
                         </p>
                       </div>
                       <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 font-mono max-w-xs mx-auto">
                         SUBSCRIPTION STATUS: ACTIVE
                       </div>
                       <div className="text-[10px] text-lightGray/40 leading-relaxed font-sans">
                         Need help managing your subscription? Contact support at any time.
                       </div>
                     </div>
                   )}

                  {userProfile?.subscription !== 'Free' && !userProfile?.isTrial && (
                    <div className="pt-4 border-t border-slate-200/50 dark:border-white/5 flex justify-end">
                      <button
                        onClick={handleCancelSub}
                        className="text-xs text-rose-500/80 hover:text-rose-500 font-medium transition-colors"
                      >
                        Cancel Active Subscription Tier
                      </button>
                    </div>
                  )}
                </div>

                {/* Billing invoice history logs */}
                <div className="lg:col-span-4 p-6 bg-secondaryBg/80 dark:bg-secondaryBg/40 border border-slate-200/50 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] dark:shadow-none hover:shadow-[0_8px_30px_rgb(0,0,0,0.035)] rounded-2xl flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Clock size={16} /> Invoices History
                    </h3>

                    <div className="space-y-3.5 text-xs max-h-56 overflow-y-auto pr-1">
                      {billingInfo.history.length > 0 ? (
                        billingInfo.history.map((inv) => (
                          <div key={inv.id} className="p-3 bg-background/30 hover:bg-background/60 border border-slate-200/40 dark:border-white/5 rounded-xl flex items-center justify-between transition-all duration-200">
                            <div>
                              <div className="font-bold text-white/90">{inv.plan}</div>
                              <div className="text-[9px] text-lightGray/40 mt-1">Date: {inv.date}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-white">{inv.amount}</div>
                              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase">Paid</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 text-lightGray/40">
                          No paid invoices logged. Available on subscription activations.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 text-[10px] text-lightGray/40 leading-relaxed font-mono flex items-start gap-1.5 border-t border-slate-200/60 dark:border-white/5 mt-4">
                    <Info size={12} className="flex-shrink-0" />
                    <span>Invoices will dynamically synchronize to your mail inbox upon card authorizations.</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* XP REWARDS TAB */}
            {activeTab === 'rewards' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="p-6 bg-secondaryBg/80 dark:bg-secondaryBg/40 border border-slate-200/50 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] dark:shadow-none hover:shadow-[0_8px_30px_rgb(0,0,0,0.035)] transition-all duration-300 rounded-2xl space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Sparkles size={16} className="text-amber-400 animate-pulse" /> Student XP Rewards Shop
                    </h3>
                    <p className="text-xs text-lightGray/55 mt-0.5">
                      Earn XP by compiling code and completing interviews. Spend your XP below to refill usage limits or unlock premium features.
                    </p>
                  </div>

                  <div className="p-4 bg-background/40 border border-slate-200/40 dark:border-white/5 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-lightGray/40 uppercase">Your Balance XP Points</span>
                      <div className="text-2xl font-black text-white flex items-center gap-2 mt-0.5">
                        <Award size={20} className="text-amber-400 animate-bounce" />
                        <span>{totalXp - (userProfile?.spentXp || 0)} XP</span>
                      </div>
                      <p className="text-[9px] text-lightGray/50">Total earned: {totalXp} XP | Spent: {userProfile?.spentXp || 0} XP</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Reward Card 1: Refill Interviews */}
                    <div className="p-5 bg-background/30 hover:bg-background/50 border border-slate-200/40 dark:border-white/5 rounded-2xl space-y-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-wider">Refill</span>
                          <span className="text-xs font-black text-white">500 XP</span>
                        </div>
                        <h4 className="text-sm font-bold text-white">Refill Mock Interviews</h4>
                        <p className="text-xs text-lightGray/60 leading-relaxed font-sans">
                          Instantly reset your 15-day mock interview count to 0, giving you 3 new AI mock interviews right away.
                        </p>
                      </div>
                      <button 
                        onClick={() => handleRedeemReward('refill_interviews', 500)}
                        disabled={redeemingReward || (totalXp - (userProfile?.spentXp || 0)) < 500}
                        className="w-full py-2 bg-accent hover:bg-accent/90 text-white text-xs font-bold rounded-lg shadow-[0_4px_10px_rgba(var(--accent),0.15)] disabled:opacity-30 disabled:hover:bg-accent transition-all"
                      >
                        Redeem Refill
                      </button>
                    </div>

                    {/* Reward Card 2: Refill Resume Analysis */}
                    <div className="p-5 bg-background/30 hover:bg-background/50 border border-slate-200/40 dark:border-white/5 rounded-2xl space-y-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-wider">Refill</span>
                          <span className="text-xs font-black text-white">300 XP</span>
                        </div>
                        <h4 className="text-sm font-bold text-white">Refill Resume Limits</h4>
                        <p className="text-xs text-lightGray/60 leading-relaxed font-sans">
                          Instantly reset your 15-day ATS resume check count to 0, unlocking 2 additional ATS audits right away.
                        </p>
                      </div>
                      <button 
                        onClick={() => handleRedeemReward('refill_resumes', 300)}
                        disabled={redeemingReward || (totalXp - (userProfile?.spentXp || 0)) < 300}
                        className="w-full py-2 bg-accent hover:bg-accent/90 text-white text-xs font-bold rounded-lg shadow-[0_4px_10px_rgba(var(--accent),0.15)] disabled:opacity-30 disabled:hover:bg-accent transition-all"
                      >
                        Redeem Refill
                      </button>
                    </div>

                    {/* Reward Card 3: Unlock AI Roadmap */}
                    <div className="p-5 bg-background/30 hover:bg-background/50 border border-slate-200/40 dark:border-white/5 rounded-2xl space-y-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 dark:text-amber-400 px-2 py-0.5 rounded-full uppercase tracking-wider">Unlock</span>
                          <span className="text-xs font-black text-white">400 XP</span>
                        </div>
                        <h4 className="text-sm font-bold text-white">Unlock 1 AI Roadmap</h4>
                        <p className="text-xs text-lightGray/60 leading-relaxed font-sans">
                          Generate 1 custom Career Roadmap using the AI Career Coach (premium feature unlock).
                        </p>
                      </div>
                      <button 
                        onClick={() => handleRedeemReward('unlock_roadmap', 400)}
                        disabled={redeemingReward || (totalXp - (userProfile?.spentXp || 0)) < 400}
                        className="w-full py-2 bg-accent hover:bg-accent/90 text-white text-xs font-bold rounded-lg shadow-[0_4px_10px_rgba(var(--accent),0.15)] disabled:opacity-30 disabled:hover:bg-accent transition-all"
                      >
                        Redeem Unlock
                      </button>
                    </div>
                  </div>

                  {/* XP Points History */}
                  <div className="space-y-4 pt-6 border-t border-slate-200/40 dark:border-white/5">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <History size={14} className="text-lightGray/60" /> Points Transaction History ({totalXp - (userProfile?.spentXp || 0)} XP Balance)
                    </h3>
                    
                    <div className="bg-background/20 border border-slate-200/40 dark:border-white/5 rounded-2xl overflow-hidden">
                      {xpTransactionsList.length === 0 ? (
                        <div className="p-6 text-center text-xs text-lightGray/40 italic">
                          No points transactions logged yet. Complete challenges or interviews to earn XP!
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-200/40 dark:divide-white/5 max-h-60 overflow-y-auto">
                          {xpTransactionsList.map((tx, idx) => (
                            <div key={idx} className="p-4 flex items-center justify-between hover:bg-white/[0.01] transition-colors">
                              <div className="space-y-1 text-left">
                                <div className="text-xs font-bold text-white leading-none">{tx.description}</div>
                                <div className="text-[10px] text-lightGray/40 font-mono leading-none mt-1">{new Date(tx.timestamp).toLocaleString()}</div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <span className={`text-xs font-black px-2 py-0.5 rounded ${
                                    tx.amount > 0 
                                      ? 'text-emerald-400 bg-emerald-500/10' 
                                      : 'text-rose-400 bg-rose-500/10'
                                  }`}>
                                    {tx.amount > 0 ? `+${tx.amount}` : tx.amount} XP
                                  </span>
                                  <div className="text-[9px] text-lightGray/45 mt-1">Balance: {tx.runningBalance} XP</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-xl mx-auto p-6 bg-secondaryBg/80 dark:bg-secondaryBg/40 border border-slate-200/50 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] dark:shadow-none hover:shadow-[0_8px_30px_rgb(0,0,0,0.035)] transition-all duration-300 rounded-2xl"
              >
                <div className="border-b border-slate-200/60 dark:border-white/5 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <User size={16} /> Edit Profile Credentials
                    </h3>
                    <p className="text-xs text-lightGray/55 mt-0.5">Customize target roles, education structures, and skill stacks</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-background/50 border border-slate-200/40 dark:border-white/5 rounded-full text-xs self-start sm:self-center">
                    <Award size={14} className="text-secondary animate-bounce" />
                    <span className="text-secondary font-bold">{totalXp - (userProfile?.spentXp || 0)} XP</span>
                    <span className="text-lightGray/60">Balance</span>
                  </div>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
                  {profileMsg && (
                    <div className="p-3 bg-accent/10 border border-accent/25 rounded-lg text-center font-bold text-accent">
                      {profileMsg}
                    </div>
                  )}

                  {/* Profile Picture Upload Section */}
                  <div className="flex flex-col items-center gap-3 mb-6 pb-6 border-b border-slate-200/60 dark:border-white/5">
                    <div className="relative group cursor-pointer w-24 h-24 rounded-full overflow-hidden border-2 border-accent shadow-md bg-gradient-to-br from-accent to-secondary text-white flex items-center justify-center text-3xl font-black transition-all hover:scale-105">
                      {profilePic ? (
                        <img src={profilePic} alt="Profile Preview" className="w-full h-full object-cover" />
                      ) : (
                        initialsPreview
                      )}
                      <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[10px] font-bold text-white transition-opacity cursor-pointer">
                        <User size={16} className="mb-1" />
                        <span>Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {profilePic && (
                      <button
                        type="button"
                        onClick={() => setProfilePic('')}
                        className="text-[10px] text-rose-500 hover:text-rose-600 font-bold transition-colors uppercase tracking-wider"
                      >
                        Remove Photo
                      </button>
                    )}
                    <span className="text-[9px] text-lightGray/40">Supported formats: JPG, PNG, GIF (Max size: 1.5MB)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-lightGray/50 uppercase">Professional Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-background/50 text-white rounded-lg p-3 border border-slate-200/40 dark:border-white/5 focus:outline-none focus:border-accent/40"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-lightGray/50 uppercase">Target Career Role</label>
                      <select
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        className="w-full bg-background/50 text-white rounded-lg p-3 border border-slate-200/40 dark:border-white/5 focus:outline-none focus:border-accent/40 appearance-none font-sans"
                      >
                        <option value="Frontend Engineer">Frontend Engineer</option>
                        <option value="Backend Engineer">Backend Engineer</option>
                        <option value="Fullstack Developer">Fullstack Developer</option>
                        <option value="System Design Architect">System Design Architect</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-lightGray/50 uppercase">Education background</label>
                    <input
                      type="text"
                      value={education}
                      onChange={(e) => setEducation(e.target.value)}
                      placeholder="e.g. B.S. in Computer Science from Stanford (Graduated 2024)"
                      className="w-full bg-background/50 text-white rounded-lg p-3 border border-slate-200/40 dark:border-white/5 focus:outline-none focus:border-accent/40"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-lightGray/50 uppercase">Current Skill Stacks (comma separated)</label>
                    <textarea
                      value={skillsText}
                      onChange={(e) => setSkillsText(e.target.value)}
                      placeholder="React, JavaScript, TypeScript, Redux, TailwindCSS, Django"
                      className="w-full h-24 bg-background/50 text-white rounded-lg p-3 border border-slate-200/40 dark:border-white/5 focus:outline-none focus:border-accent/40 resize-none font-sans"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={updatingProfile}
                    className="w-full py-3 bg-accent hover:bg-accent/90 text-white font-black uppercase text-[11px] rounded-lg transition-all text-center flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(var(--accent),0.15)]"
                  >
                    {updatingProfile && <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />}
                    Save Profile Signature
                  </button>
                </form>
              </motion.div>
            )}

          </AnimatePresence>
          </Suspense>
          )}
        </div>

      </div>
    </div>
  );
}
