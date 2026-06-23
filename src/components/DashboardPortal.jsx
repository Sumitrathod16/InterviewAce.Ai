import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, FileText, CheckSquare, Calendar, ChevronRight, Activity, 
  Code, UserCheck, AlertCircle, ArrowRight, LogOut, Shield,
  CreditCard, User, Sparkles, Building, Compass, Check, Info, Settings, Clock
} from 'lucide-react';
import API from '../services/api';
import MockInterviewDemo from './MockInterviewDemo';
import ResumeAnalyzer from './ResumeAnalyzer';
import CodingAssessment from './CodingAssessment';

export default function DashboardPortal({ 
  solvedProblems, 
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
  activeTab = 'overview',
  setActiveTab
}) {
  
  
  // AI Career Coach states
  const [coachData, setCoachData] = useState(null);
  const [loadingCoach, setLoadingCoach] = useState(false);
  const [coachError, setCoachError] = useState('');

  // Company prep states
  const [selectedCompany, setSelectedCompany] = useState('tcs');
  const [companyPrepData, setCompanyPrepData] = useState(null);
  const [loadingCompany, setLoadingCompany] = useState(false);

  // Billing states
  const [billingInfo, setBillingInfo] = useState({ subscription: { plan: 'Free', status: 'none' }, history: [] });
  const [upgrading, setUpgrading] = useState(false);

  // Profile edit states
  const [name, setName] = useState(userProfile?.name || '');
  const [targetRole, setTargetRole] = useState(userProfile?.targetRole || 'Frontend Engineer');
  const [education, setEducation] = useState(userProfile?.education || '');
  const [skillsText, setSkillsText] = useState(userProfile?.skills?.join(', ') || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  // History logs fetched from DB
  const [dbInterviews, setDbInterviews] = useState([]);
  const [dbResumes, setDbResumes] = useState([]);
  const [problems, setProblems] = useState([]);

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
        skills: skillsArray
      });
      
      // Update local storage user profile sync
      const savedUser = JSON.parse(localStorage.getItem('interviewace_user') || '{}');
      const updatedUser = { ...savedUser, name, targetRole, education, skills: skillsArray };
      localStorage.setItem('interviewace_user', JSON.stringify(updatedUser));
      
      setProfileMsg('Profile updated successfully!');
    } catch (err) {
      setProfileMsg('Failed to sync profile changes.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Trigger Stripe checkout redirections
  const handleSubscribe = async (tierName, billingPeriod = 'monthly') => {
    setUpgrading(true);
    try {
      const response = await API.post('/payments/checkout', {
        planName: tierName,
        billingPeriod
      });
      // Redirect to Stripe checkout URL or local success fallback
      window.location.href = response.data.url;
    } catch (err) {
      alert('Checkout initiation failed.');
    } finally {
      setUpgrading(false);
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
    : 84;

  const totalXp = (solvedProblems.size * 100) + (interviewsList.length * 200);
  const practiceStreak = solvedProblems.size > 0 || interviewsList.length > 0 ? 1 : 0;

  const CHALLENGES = problems.length > 0
    ? problems.map((p, idx) => ({ id: p.problemId, title: p.title, difficulty: p.difficulty, index: idx }))
    : [
        { id: 'twosum', title: '1. Two Sum', difficulty: 'Easy', index: 0 },
        { id: 'reversestring', title: '344. Reverse String', difficulty: 'Easy', index: 1 },
        { id: 'palindrome', title: '9. Valid Palindrome', difficulty: 'Easy', index: 2 }
      ];

  const stats = [
    { title: 'Interview Rating', value: `${avgInterviewScore}%`, desc: interviewsList.length > 0 ? `Based on ${interviewsList.length} rounds` : 'Starting baseline', icon: Award },
    { title: 'ATS Resume Rating', value: `${atsScore}/100`, desc: atsScore >= 80 ? 'ATS Compatible' : 'Needs Optimization', icon: FileText },
    { title: 'Algorithm Challenges', value: `${solvedProblems.size} / ${CHALLENGES.length}`, desc: `${Math.max(0, CHALLENGES.length - solvedProblems.size)} remaining`, icon: CheckSquare },
    { title: 'Practice Streak', value: `${practiceStreak} Day${practiceStreak !== 1 ? 's' : ''}`, desc: 'Active streak', icon: Calendar }
  ];

  const nameInitials = userProfile?.name
    ? userProfile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'US';

  const companiesList = [
    { id: 'tcs', name: 'TCS' },
    { id: 'infosys', name: 'Infosys' },
    { id: 'wipro', name: 'Wipro' },
    { id: 'accenture', name: 'Accenture' },
    { id: 'deloitte', name: 'Deloitte' }
  ];

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
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h2 className="text-xl font-bold text-white">Welcome back, {userProfile?.name || 'Candidate'}!</h2>
                
                {/* Admin dashboard indicator shortcut */}
                {userProfile?.role === 'Admin' && (
                  <button 
                    onClick={() => onViewChange('admin')}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-white text-background text-[9px] font-bold uppercase transition-colors"
                  >
                    <Shield size={10} />
                    Admin
                  </button>
                )}
              </div>
              <p className="text-sm text-lightGray/60 mt-0.5">{userProfile?.targetRole || 'Technical Preparation Track'}</p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-lightGray/40">
                <span className="flex items-center gap-1">
                  <Award size={12} className="text-white" />
                  {totalXp} XP Earned
                </span>
                <span>•</span>
                <span>Tier: <strong className="text-white">{userProfile?.subscription || 'Free'}</strong></span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 border transition-all ${
                activeTab === 'profile' ? 'bg-white text-background border-white' : 'text-lightGray/70 border-white/5 hover:bg-white/5'
              }`}
            >
              <Settings size={13} />
              Profile
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-xs font-semibold text-lightGray/70 hover:text-white border border-white/5 rounded-lg flex items-center gap-2 transition-colors hover:bg-white/5"
            >
              <LogOut size={13} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex border-b border-white/5 overflow-x-auto gap-2 pb-1">
          {[
            { id: 'overview', name: 'Workspace Overview', icon: Activity },
            { id: 'interviews', name: 'AI Mock Interviews', icon: UserCheck },
            { id: 'resume', name: 'ATS Resume Analyzer', icon: FileText },
            { id: 'coding', name: 'Coding Assessment', icon: Code },
            { id: 'coach', name: 'AI Career Coach', icon: Compass },
            { id: 'company', name: 'Company-Specific Prep', icon: Building },
            { id: 'billing', name: 'Billing & Tiers', icon: CreditCard }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'border-white text-white'
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

                {userProfile?.subscription === 'Free' && (
                  <div className="p-5 bg-emerald-950/20 border border-emerald-900/40 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
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
                  <div className="lg:col-span-8 p-6 bg-secondaryBg/30 border border-white/5 rounded-xl space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Activity size={16} /> Completed Interview Rounds Log
                      </h3>
                      <p className="text-xs text-lightGray/55 mt-0.5">Logs of AI evaluations performed on your account</p>
                    </div>

                    <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
                      {interviewsList.length > 0 ? (
                        interviewsList.map((int, idx) => (
                          <div key={int._id || idx} className="p-4 bg-background/50 border border-white/5 rounded-lg flex items-center justify-between">
                            <div>
                              <div className="text-xs font-bold text-white">{int.track || int.type} Round</div>
                              <div className="text-[10px] text-lightGray/40 mt-1">Date: {new Date(int.createdAt).toLocaleDateString()} • {int.questions.length} questions</div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <span className="text-xs font-bold text-white/90">Score: {int.score}%</span>
                              </div>
                              <span className="px-2 py-0.5 rounded bg-white text-background text-[9px] font-black uppercase">Completed</span>
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
                  <div className="lg:col-span-4 p-6 bg-secondaryBg/30 border border-white/5 rounded-xl flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                        <UserCheck size={16} /> Resume Audits Log
                      </h3>
                      
                      <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                        {dbResumes.length > 0 ? (
                          dbResumes.map((rep, idx) => (
                            <div key={rep._id || idx} className="p-3 bg-background/40 border border-white/5 rounded-lg flex items-center justify-between text-xs">
                              <div>
                                <div className="font-semibold text-white">ATS Scanned Report</div>
                                <div className="text-[9px] text-lightGray/40 mt-0.5">{new Date(rep.createdAt).toLocaleDateString()}</div>
                              </div>
                              <span className="px-2 py-0.5 bg-white text-background text-[9px] font-black rounded">{rep.atsScore}/100</span>
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
                      className="w-full mt-6 py-2 text-xs font-bold glassmorphism text-white rounded-lg hover:bg-white/5 transition-all text-center"
                    >
                      Audit Resume Now
                    </button>
                  </div>
                </div>

                {/* Challenges listing */}
                <div className="p-6 bg-secondaryBg/30 border border-white/5 rounded-xl space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Algorithmic Sandbox Selection</h3>
                    <p className="text-xs text-lightGray/55 mt-0.5">Select a challenge below and run inside the compiler sandbox</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {CHALLENGES.map((ch) => (
                      <div
                        key={ch.id}
                        onClick={() => {
                          onSelectProblem(ch.index);
                          const el = document.querySelector('#coding');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="p-4 bg-background/40 border border-white/5 rounded-xl flex items-center justify-between hover:bg-background/80 hover:border-white/20 transition-all cursor-pointer group"
                      >
                        <div className="text-xs font-bold text-white group-hover:text-white transition-colors">{ch.title}</div>
                        <ChevronRight size={14} className="text-lightGray/20 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plans / Active subscription tier */}
                {userProfile?.subscription === 'Free' ? (
                  <div className="p-6 bg-secondaryBg/30 border border-white/5 rounded-xl space-y-6">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">SaaS Premium Billing Matrix</h3>
                      <p className="text-xs text-lightGray/55 mt-0.5">Select and unlock advanced AI configurations</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-stretch">
                      {/* Free */}
                      <div className="p-5 bg-background/50 border border-white/5 rounded-xl flex flex-col justify-between text-xs">
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
                          className="w-full mt-6 py-2 bg-white/5 text-lightGray/40 font-bold rounded border border-white/5 cursor-not-allowed"
                        >
                          Active Tier
                        </button>
                      </div>

                      {/* Pro */}
                      <div className="p-5 bg-background/60 border border-white/5 rounded-xl flex flex-col justify-between text-xs relative">
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
                          className="w-full mt-6 py-2 bg-white text-background hover:bg-lightGray font-bold rounded transition-colors disabled:opacity-40"
                        >
                          Upgrade to Pro
                        </button>
                      </div>

                      {/* Premium */}
                      <div className="p-5 bg-background/60 border border-white/5 rounded-xl flex flex-col justify-between text-xs relative">
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
                          className="w-full mt-6 py-2 bg-white text-background hover:bg-lightGray font-bold rounded transition-colors disabled:opacity-40"
                        >
                          Upgrade Premium
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-gradient-to-r from-emerald-950/20 to-secondaryBg/30 border border-emerald-900/40 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
                        <Sparkles size={20} className="animate-pulse" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">Active {userProfile?.subscription} Subscription</h4>
                        <p className="text-xs text-lightGray/60 mt-0.5">Thank you for supporting us! You have unlocked all premium preparation features.</p>
                      </div>
                    </div>
                    <div className="px-4 py-1.5 bg-emerald-950 border border-emerald-800 rounded-full text-xs font-semibold text-emerald-400">
                      Active Pack: {userProfile?.subscription}
                    </div>
                  </div>
                )}
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
                <div className="p-6 bg-secondaryBg/30 border border-white/5 rounded-xl">
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
                <div className="p-6 bg-secondaryBg/30 border border-white/5 rounded-xl">
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
                <div className="p-6 bg-secondaryBg/30 border border-white/5 rounded-xl">
                  <CodingAssessment 
                    solvedProblems={solvedProblems} 
                    onSolveProblem={onSolveProblem} 
                    selectedProblemIndex={selectedProblemIndex}
                    onSelectProblemIndex={onSelectProblemIndex}
                    problems={problems}
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
                className="p-6 bg-secondaryBg/30 border border-white/5 rounded-xl space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
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
                      className="px-4 py-2 text-xs font-bold bg-white text-background hover:bg-lightGray rounded-lg disabled:opacity-40 transition-colors"
                    >
                      {loadingCoach ? 'Analyzing Profile...' : 'Generate AI Roadmap'}
                    </button>
                  )}
                </div>

                {userProfile?.subscription !== 'Premium' ? (
                  <div className="text-center py-16 space-y-4">
                    <Sparkles className="mx-auto text-lightGray/40 animate-pulse" size={42} />
                    <h4 className="text-sm font-bold text-white">AI Career Coach is a Premium Tier Feature</h4>
                    <p className="text-xs text-lightGray/60 max-w-sm mx-auto">
                      Upgrade to unlock personalized career paths, technical roadmap benchmarks, and salary data charts.
                    </p>
                    <button
                      onClick={() => setActiveTab('billing')}
                      className="px-6 py-2.5 text-xs font-bold bg-white text-background hover:bg-lightGray rounded-lg transition-colors"
                    >
                      View Premium Plans
                    </button>
                  </div>
                ) : coachData ? (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    {/* Roadmap Timelines */}
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase mb-3.5 flex items-center gap-1.5"><Calendar size={13} /> Target Timeline Checklist</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {coachData.roadmap.map((phase, idx) => (
                          <div key={idx} className="p-4 bg-background/50 border border-white/5 rounded-xl space-y-2">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-white">{phase.phase}</span>
                              <span className="px-2 py-0.5 bg-white/5 rounded text-[9px] font-mono text-lightGray/70">{phase.duration}</span>
                            </div>
                            <ul className="space-y-1.5 text-[11px] text-lightGray/70">
                              {phase.goals.map((g, i) => (
                                <li key={i} className="flex gap-1.5 items-start">
                                  <Check size={11} className="text-white mt-0.5 flex-shrink-0" />
                                  <span>{g}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Skill Gaps & Salary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                      {/* Skill Gap Analysis */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-white uppercase flex items-center gap-1.5"><Info size={13} /> Skill Gap Analysis</h4>
                        <div className="p-4 bg-background/40 border border-white/5 rounded-xl space-y-3">
                          <div>
                            <span className="text-[10px] text-lightGray/50 font-bold uppercase">Identified Strengths</span>
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {coachData.skillGapAnalysis.strengths.map((str, i) => (
                                <span key={i} className="px-2 py-0.5 rounded bg-emerald-950/25 border border-emerald-800/40 text-[10px] text-emerald-400 font-medium">{str}</span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] text-lightGray/50 font-bold uppercase">Gaps to Address</span>
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {coachData.skillGapAnalysis.gaps.map((gap, i) => (
                                <span key={i} className="px-2 py-0.5 rounded bg-rose-950/25 border border-rose-800/40 text-[10px] text-rose-400 font-medium">{gap}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Salary Benchmarks */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-white uppercase flex items-center gap-1.5"><CreditCard size={13} /> Salary & Market Outlook</h4>
                        <div className="p-4 bg-background/40 border border-white/5 rounded-xl text-xs space-y-2.5">
                          <div className="flex justify-between border-b border-white/5 pb-2">
                            <span className="text-lightGray/60">Entry-Level Range</span>
                            <span className="font-bold text-white">{coachData.salaryInsights.entryLevel}</span>
                          </div>
                          <div className="flex justify-between border-b border-white/5 pb-2">
                            <span className="text-lightGray/60">Mid-Level Range</span>
                            <span className="font-bold text-white">{coachData.salaryInsights.midLevel}</span>
                          </div>
                          <div className="flex justify-between border-b border-white/5 pb-2">
                            <span className="text-lightGray/60">Senior-Level Range</span>
                            <span className="font-bold text-white">{coachData.salaryInsights.seniorLevel}</span>
                          </div>
                          <div className="flex justify-between items-center pt-1">
                            <span className="text-lightGray/60">Global Market Demand</span>
                            <span className="px-2.5 py-0.5 bg-white text-background text-[9px] font-black rounded uppercase">{coachData.salaryInsights.marketDemand}</span>
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
                className="p-6 bg-secondaryBg/30 border border-white/5 rounded-xl space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Building size={16} /> Company-Specific Preparation Tracks
                    </h3>
                    <p className="text-xs text-lightGray/55 mt-0.5">Explore standard interviewer sets, questions, and aptitude outlines</p>
                  </div>

                  {userProfile?.subscription !== 'Free' && (
                    <div className="flex gap-1.5 flex-wrap">
                      {companiesList.map(c => (
                        <button
                          key={c.id}
                          onClick={() => setSelectedCompany(c.id)}
                          className={`px-3 py-1.5 text-xs font-bold rounded ${
                            selectedCompany === c.id 
                              ? 'bg-white text-background' 
                              : 'bg-background/50 text-lightGray border border-white/5 hover:bg-white/5'
                          }`}
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {userProfile?.subscription === 'Free' ? (
                  <div className="text-center py-16 space-y-4">
                    <Building className="mx-auto text-lightGray/40" size={40} />
                    <h4 className="text-sm font-bold text-white">Company preparations require Pro or Premium Plans</h4>
                    <p className="text-xs text-lightGray/60 max-w-sm mx-auto">
                      Unlock tailored portfolios detailing quantitative patterns, previous technical puzzles, and HR round expectations for top tech companies.
                    </p>
                    <button
                      onClick={() => setActiveTab('billing')}
                      className="px-6 py-2.5 text-xs font-bold bg-white text-background hover:bg-lightGray rounded-lg transition-colors"
                    >
                      View Billing Options
                    </button>
                  </div>
                ) : loadingCompany ? (
                  <div className="text-center py-16 text-lightGray/50 text-xs">
                    Loading company portfolio files...
                  </div>
                ) : companyPrepData ? (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div className="flex justify-between items-center p-4 bg-background/50 border border-white/5 rounded-xl text-xs">
                      <div>
                        <div className="font-bold text-white text-sm">{companyPrepData.name} Modules</div>
                        <div className="text-lightGray/60 mt-1">{companyPrepData.roundDetails}</div>
                      </div>
                      <span className="px-2.5 py-0.5 bg-white text-background text-[9px] font-black rounded uppercase">Difficulty: {companyPrepData.difficulty}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                      {/* Aptitude */}
                      <div className="p-4 bg-background/40 border border-white/5 rounded-xl space-y-3">
                        <h4 className="font-bold text-white uppercase tracking-wider pb-2 border-b border-white/5">1. Quantitative Aptitude</h4>
                        <ul className="space-y-2 text-lightGray/70">
                          {companyPrepData.aptitudePrep.map((a, i) => <li key={i} className="leading-relaxed">• {a}</li>)}
                        </ul>
                      </div>

                      {/* Technical */}
                      <div className="p-4 bg-background/40 border border-white/5 rounded-xl space-y-3">
                        <h4 className="font-bold text-white uppercase tracking-wider pb-2 border-b border-white/5">2. Tech Round Questions</h4>
                        <ul className="space-y-2 text-lightGray/70">
                          {companyPrepData.technicalQuestions.map((t, i) => <li key={i} className="leading-relaxed">• {t}</li>)}
                        </ul>
                      </div>

                      {/* HR */}
                      <div className="p-4 bg-background/40 border border-white/5 rounded-xl space-y-3">
                        <h4 className="font-bold text-white uppercase tracking-wider pb-2 border-b border-white/5">3. HR Behavioral Puzzles</h4>
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
                <div className="lg:col-span-8 p-6 bg-secondaryBg/30 border border-white/5 rounded-xl space-y-6">
                  {userProfile?.subscription === 'Free' ? (
                    <>
                      <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">SaaS Premium Billing Matrix</h3>
                        <p className="text-xs text-lightGray/55 mt-0.5">Select and unlock advanced AI configurations</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-stretch">
                        {/* Free */}
                        <div className="p-5 bg-background/50 border border-white/5 rounded-xl flex flex-col justify-between text-xs">
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
                            className="w-full mt-6 py-2 bg-secondaryBg text-lightGray/40 font-bold rounded border border-white/5 cursor-not-allowed"
                          >
                            Active Tier
                          </button>
                        </div>

                        {/* Pro */}
                        <div className="p-5 bg-background/60 border border-white/5 rounded-xl flex flex-col justify-between text-xs relative">
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
                            className="w-full mt-6 py-2 bg-white text-background hover:bg-lightGray font-bold rounded transition-colors disabled:opacity-40"
                          >
                            Upgrade to Pro
                          </button>
                        </div>

                        {/* Premium */}
                        <div className="p-5 bg-background/60 border border-white/5 rounded-xl flex flex-col justify-between text-xs relative">
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
                            className="w-full mt-6 py-2 bg-white text-background hover:bg-lightGray font-bold rounded transition-colors disabled:opacity-40"
                          >
                            Upgrade Premium
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-8 bg-gradient-to-br from-emerald-950/20 to-background border border-emerald-900/40 rounded-2xl text-center space-y-5">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                        <Sparkles size={24} className="animate-pulse" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-black text-white">Active {userProfile.subscription} Pack</h3>
                        <p className="text-xs text-lightGray/60 max-w-sm mx-auto">
                          Thank you for purchasing the {userProfile.subscription} access tier. You now have unlimited access to AI Mock Interviews, ATS Resume Audits, and the Coding Compilation Sandbox.
                        </p>
                      </div>
                      <div className="p-4 bg-emerald-950/40 rounded-xl border border-emerald-900/60 text-xs text-emerald-400 font-mono max-w-xs mx-auto">
                        SUBSCRIPTION STATUS: ACTIVE
                      </div>
                      <div className="text-[10px] text-lightGray/40 leading-relaxed font-sans">
                        Need help managing your subscription? Contact support at any time.
                      </div>
                    </div>
                  )}

                  {userProfile?.subscription !== 'Free' && (
                    <div className="pt-4 border-t border-white/5 flex justify-end">
                      <button
                        onClick={handleCancelSub}
                        className="text-xs text-rose-400/80 hover:text-rose-400 font-medium transition-colors"
                      >
                        Cancel Active Subscription Tier
                      </button>
                    </div>
                  )}
                </div>

                {/* Billing invoice history logs */}
                <div className="lg:col-span-4 p-6 bg-secondaryBg/30 border border-white/5 rounded-xl flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Clock size={16} /> Invoices History
                    </h3>

                    <div className="space-y-3.5 text-xs max-h-56 overflow-y-auto pr-1">
                      {billingInfo.history.length > 0 ? (
                        billingInfo.history.map((inv) => (
                          <div key={inv.id} className="p-3 bg-background/50 border border-white/5 rounded-lg flex items-center justify-between">
                            <div>
                              <div className="font-bold text-white/90">{inv.plan}</div>
                              <div className="text-[9px] text-lightGray/40 mt-1">Date: {inv.date}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-white">{inv.amount}</div>
                              <span className="text-[9px] text-emerald-400 font-semibold uppercase">Paid</span>
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

                  <div className="pt-4 text-[10px] text-lightGray/40 leading-relaxed font-mono flex items-start gap-1.5">
                    <Info size={12} className="flex-shrink-0" />
                    <span>Invoices will dynamically synchronize to your mail inbox upon card authorizations.</span>
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
                className="max-w-xl mx-auto p-6 bg-secondaryBg/30 border border-white/5 rounded-xl"
              >
                <div className="border-b border-white/5 pb-4 mb-6">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <User size={16} /> Edit Profile Credentials
                  </h3>
                  <p className="text-xs text-lightGray/55 mt-0.5">Customize target roles, education structures, and skill stacks</p>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
                  {profileMsg && (
                    <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-center font-semibold text-white">
                      {profileMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-lightGray/50 uppercase">Professional Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-background/50 text-white rounded-lg p-3 border border-white/5 focus:outline-none focus:border-white/30"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-lightGray/50 uppercase">Target Career Role</label>
                      <select
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        className="w-full bg-background/50 text-white rounded-lg p-3 border border-white/5 focus:outline-none focus:border-white/30 appearance-none font-sans"
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
                      className="w-full bg-background/50 text-white rounded-lg p-3 border border-white/5 focus:outline-none focus:border-white/30"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-lightGray/50 uppercase">Current Skill Stacks (comma separated)</label>
                    <textarea
                      value={skillsText}
                      onChange={(e) => setSkillsText(e.target.value)}
                      placeholder="React, JavaScript, TypeScript, Redux, TailwindCSS, Django"
                      className="w-full h-24 bg-background/50 text-white rounded-lg p-3 border border-white/5 focus:outline-none focus:border-white/30 resize-none font-sans"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={updatingProfile}
                    className="w-full py-3 bg-white text-background hover:bg-lightGray font-black uppercase text-[11px] rounded-lg transition-all text-center flex items-center justify-center gap-1.5"
                  >
                    {updatingProfile && <span className="w-3.5 h-3.5 rounded-full border-2 border-background border-t-transparent animate-spin" />}
                    Save Profile Synchronization
                  </button>
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
