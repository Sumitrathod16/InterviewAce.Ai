import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Pricing from './components/Pricing';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import AuthScreen from './components/AuthScreen';
import { useAuth } from './context/AuthContext';

// Dynamic lazy imports for heavy subpages and dashboards
const DashboardPortal = lazy(() => import('./components/DashboardPortal'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const FeaturesPage = lazy(() => import('./components/FeaturesPage'));
const PricingPage = lazy(() => import('./components/PricingPage'));
const ResetPasswordPage = lazy(() => import('./components/ResetPasswordPage'));

// Lazy import footer subpages
const PrivacyPolicy = lazy(() => import('./components/footer_pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./components/footer_pages/TermsOfService'));
const SecurityPolicy = lazy(() => import('./components/footer_pages/SecurityPolicy'));
const CookiePolicy = lazy(() => import('./components/footer_pages/CookiePolicy'));
const AboutUs = lazy(() => import('./components/footer_pages/AboutUs'));
const Careers = lazy(() => import('./components/footer_pages/Careers'));
const Contact = lazy(() => import('./components/footer_pages/Contact'));
const FeedbackPage = lazy(() => import('./components/footer_pages/FeedbackPage'));

function ComponentLoader() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center py-12">
      <div className="w-8 h-8 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin mb-3" />
      <span className="text-xs font-mono text-slate-400">Loading component...</span>
    </div>
  );
}

function MainAppLayout({
  solvedProblems,
  solvedProblemsDetail,
  handleSolveProblem,
  atsScore,
  handleAtsScoreChange,
  handleInterviewComplete,
  selectedProblemIndex,
  setSelectedProblemIndex,
  currentView,
  setCurrentView,
  activeTab,
  setActiveTab,
  theme,
  onRefreshProfile,
  onOpenAuth
}) {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setCurrentView('landing');
    navigate('/');
  };

  const handleStartFreeInterview = () => {
    if (!userProfile) {
      onOpenAuth();
    } else {
      setCurrentView('dashboard-portal');
      setActiveTab('interviews');
      navigate('/');
    }
  };

  return (
    <>
      {currentView === 'landing' ? (
        <main>
          {/* Hero Landing */}
          <Hero onStartFreeInterview={handleStartFreeInterview} />

          {/* Core Product Features */}
          <Features />

          {/* Multi-step walkthrough */}
          <HowItWorks />



          {/* pricing matrix */}
          <Pricing />

          {/* FAQ panels */}
          <FAQ />
        </main>
      ) : (
        <main>
          {/* User's Dedicated Active Dashboard Workspace */}
          <DashboardPortal 
            solvedProblems={solvedProblems}
            solvedProblemsDetail={solvedProblemsDetail}
            onSolveProblem={handleSolveProblem}
            selectedProblemIndex={selectedProblemIndex}
            onSelectProblemIndex={setSelectedProblemIndex}
            atsScore={atsScore}
            onAtsScoreChange={handleAtsScoreChange}
            completedInterviews={[]}
            onSelectProblem={setSelectedProblemIndex}
            onInterviewComplete={handleInterviewComplete}
            onViewChange={(view) => {
              if (view === 'admin') {
                navigate('/admin');
              } else {
                setCurrentView(view);
              }
            }}
            userProfile={userProfile}
            onLogout={handleLogout}
            onRefreshProfile={onRefreshProfile}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            theme={theme}
          />
        </main>
      )}
    </>
  );
}

export default function App() {
  const { userProfile, loading, logout, refreshUserProfile } = useAuth();
  const navigate = useNavigate();

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('interviewace_theme');
    return saved || 'light';
  });

  const [currentView, setCurrentView] = useState('landing');
  const [activeTab, setActiveTab] = useState('overview');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedProblemIndex, setSelectedProblemIndex] = useState(0);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('interviewace_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // States synchronized dynamically
  const [solvedProblems, setSolvedProblems] = useState(() => {
    const saved = localStorage.getItem('interviewace_solved_detail');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(p => p && typeof p.problemId === 'string' && typeof p.language === 'string');
        }
      } catch (e) {
        return [];
      }
    }
    const oldSaved = localStorage.getItem('interviewace_solved');
    if (oldSaved) {
      try {
        const parsed = JSON.parse(oldSaved);
        if (Array.isArray(parsed)) {
          return parsed
            .filter(id => typeof id === 'string')
            .map(id => ({ problemId: id, language: 'javascript' }));
        }
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [atsScore, setAtsScore] = useState(() => {
    const saved = localStorage.getItem('interviewace_ats');
    return saved ? Number(saved) : 78;
  });

  // Sync back to local storage
  useEffect(() => {
    localStorage.setItem('interviewace_solved_detail', JSON.stringify(solvedProblems));
  }, [solvedProblems]);

  useEffect(() => {
    localStorage.setItem('interviewace_ats', atsScore.toString());
  }, [atsScore]);

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

  // Handle redirects on login trigger
  useEffect(() => {
    if (userProfile && currentView === 'landing') {
      setCurrentView('dashboard-portal');
    }
  }, [userProfile]);

  // Handle incoming reset password parameters (e.g. from Firebase default action email link)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const oobCode = params.get('oobCode');
    if (mode === 'resetPassword' && oobCode && window.location.pathname !== '/reset-password') {
      navigate(`/reset-password?oobCode=${oobCode}`);
    }
  }, [navigate]);

  // Synchronize local solved problems state with database user profile
  useEffect(() => {
    if (userProfile) {
      if (Array.isArray(userProfile.solvedProblems)) {
        const dbProblems = userProfile.solvedProblems.map(p => ({
          problemId: p.problemId,
          language: p.language
        }));
        setSolvedProblems(dbProblems);
      } else {
        setSolvedProblems([]);
      }
    } else {
      setSolvedProblems([]);
      setAtsScore(78);
    }
  }, [userProfile]);

  const handleSolveProblem = (id, title, language) => {
    const lang = (typeof language === 'string') ? language : 'javascript';
    setSolvedProblems(prev => {
      const exists = prev.some(p => p.problemId === id && p.language === lang);
      if (exists) return prev;
      return [...prev, { problemId: id, language: lang }];
    });
  };

  const handleAtsScoreChange = (newScore) => {
    setAtsScore(newScore);
  };

  const handleInterviewComplete = () => {
    // Reload metrics logs
  };

  const handleAuthSuccess = (profile) => {
    setShowAuthModal(false);
    setCurrentView('dashboard-portal');
    navigate('/');
  };

  const handleLogout = async () => {
    await logout();
    setCurrentView('landing');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-white font-mono text-xs gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-white/5 border-t-white animate-spin" />
        Loading candidate workspace session...
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen text-white selection:bg-white selection:text-background flex flex-col justify-between overflow-x-hidden">
      <div>
        {/* Navigation Bar */}
        <Navbar 
          currentView={currentView} 
          onViewChange={(view) => {
            if (view === 'dashboard-portal' && !userProfile) {
              setShowAuthModal(true);
            } else {
              setCurrentView(view);
              navigate('/');
            }
          }}
          onTabChange={setActiveTab}
          hasUser={!!userProfile}
          theme={theme}
          toggleTheme={toggleTheme}
          isOnline={isOnline}
        />

        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgb(20 27 45)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '13px',
              fontFamily: 'Inter, sans-serif',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
          }}
        />

        <Suspense fallback={<ComponentLoader />}>
          <Routes>
            <Route 
              path="/" 
              element={
                <MainAppLayout
                  solvedProblems={new Set(solvedProblems.map(p => p.problemId))}
                  solvedProblemsDetail={solvedProblems}
                  handleSolveProblem={handleSolveProblem}
                  atsScore={atsScore}
                  handleAtsScoreChange={handleAtsScoreChange}
                  handleInterviewComplete={handleInterviewComplete}
                  selectedProblemIndex={selectedProblemIndex}
                  setSelectedProblemIndex={setSelectedProblemIndex}
                  currentView={currentView}
                  setCurrentView={setCurrentView}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  theme={theme}
                  onRefreshProfile={refreshUserProfile}
                  onOpenAuth={() => setShowAuthModal(true)}
                />
              } 
            />
            <Route path="/checkout" element={<Navigate to="/" replace />} />
            <Route path="/checkout/success" element={<Navigate to="/" replace />} />
            <Route path="/checkout/cancel" element={<Navigate to="/" replace />} />
            <Route path="/trial-checkout" element={<Navigate to="/" replace />} />
            <Route path="/trial/success" element={<Navigate to="/" replace />} />
            <Route 
              path="/features" 
              element={
                <FeaturesPage 
                  hasUser={!!userProfile}
                  onViewChange={(view) => {
                    if (view === 'dashboard-portal' && !userProfile) {
                      setShowAuthModal(true);
                    } else {
                      setCurrentView(view);
                      navigate('/');
                    }
                  }}
                  onTabChange={setActiveTab}
                />
              } 
            />
            <Route 
              path="/pricing" 
              element={
                <PricingPage 
                  onViewChange={(view) => {
                    if (view === 'dashboard-portal' && !userProfile) {
                      setShowAuthModal(true);
                    } else {
                      setCurrentView(view);
                      navigate('/');
                    }
                  }}
                />
              } 
            />
            <Route 
              path="/admin" 
              element={
                userProfile && userProfile.role === 'Admin' ? (
                  <AdminDashboard onLogout={handleLogout} />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/security" element={<SecurityPolicy />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage onOpenAuth={() => setShowAuthModal(true)} />} />
          </Routes>
        </Suspense>
      </div>

      <Footer />

      {/* Auth Screen Overlay Modal */}
      {showAuthModal && (
        <AuthScreen 
          onAuthSuccess={handleAuthSuccess} 
          onClose={() => setShowAuthModal(false)} 
        />
      )}
    </div>
  );
}
