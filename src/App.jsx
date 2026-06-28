import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import MockInterviewDemo from './components/MockInterviewDemo';
import ResumeAnalyzer from './components/ResumeAnalyzer';
import CodingAssessment from './components/CodingAssessment';
import DashboardPreview from './components/DashboardPreview';
import Testimonials from './components/Testimonials';
import Pricing from './components/Pricing';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import DashboardPortal from './components/DashboardPortal';
import AuthScreen from './components/AuthScreen';
import AdminDashboard from './components/AdminDashboard';
import { PaymentSuccess, PaymentCancel } from './components/CheckoutStatus';
import { useAuth } from './context/AuthContext';

function MainAppLayout({
  solvedProblems,
  handleSolveProblem,
  atsScore,
  handleAtsScoreChange,
  handleInterviewComplete,
  selectedProblemIndex,
  setSelectedProblemIndex,
  currentView,
  setCurrentView,
  showAuthModal,
  setShowAuthModal,
  handleAuthSuccess,
  activeTab,
  setActiveTab,
  theme,
  toggleTheme
}) {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();

  // Stats states loaded from localStorage fallback
  const nameInitials = userProfile?.name
    ? userProfile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'US';

  const handleLogout = async () => {
    await logout();
    setCurrentView('landing');
    navigate('/');
  };

  return (
    <div className="bg-background min-h-screen text-white selection:bg-white selection:text-background overflow-hidden">
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
      />

      {currentView === 'landing' ? (
        <main>
          {/* Hero Landing */}
          <Hero />

          {/* Core Product Features */}
          <Features />

          {/* Multi-step walkthrough */}
          <HowItWorks />

          {/* testimonials success show */}
          <Testimonials />

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
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            theme={theme}
          />
        </main>
      )}

      {/* Auth Screen Overlay Modal */}
      {showAuthModal && (
        <AuthScreen 
          onAuthSuccess={handleAuthSuccess} 
          onClose={() => setShowAuthModal(false)} 
        />
      )}

      <Footer />
    </div>
  );
}

export default function App() {
  const { userProfile, loading } = useAuth();
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
    const saved = localStorage.getItem('interviewace_solved');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const [atsScore, setAtsScore] = useState(() => {
    const saved = localStorage.getItem('interviewace_ats');
    return saved ? Number(saved) : 78;
  });

  // Sync back to local storage
  useEffect(() => {
    localStorage.setItem('interviewace_solved', JSON.stringify(Array.from(solvedProblems)));
  }, [solvedProblems]);

  useEffect(() => {
    localStorage.setItem('interviewace_ats', atsScore.toString());
  }, [atsScore]);

  // Handle redirects on login trigger
  useEffect(() => {
    if (userProfile && currentView === 'landing') {
      setCurrentView('dashboard-portal');
    }
  }, [userProfile]);

  const handleSolveProblem = (id, title) => {
    setSolvedProblems(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
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
    <>
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
      <Routes>
        <Route 
        path="/" 
        element={
          <MainAppLayout
            solvedProblems={solvedProblems}
            handleSolveProblem={handleSolveProblem}
            atsScore={atsScore}
            handleAtsScoreChange={handleAtsScoreChange}
            handleInterviewComplete={handleInterviewComplete}
            selectedProblemIndex={selectedProblemIndex}
            setSelectedProblemIndex={setSelectedProblemIndex}
            currentView={currentView}
            setCurrentView={setCurrentView}
            showAuthModal={showAuthModal}
            setShowAuthModal={setShowAuthModal}
            handleAuthSuccess={handleAuthSuccess}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            theme={theme}
            toggleTheme={toggleTheme}
          />
        } 
      />
      <Route path="/checkout/success" element={<PaymentSuccess />} />
      <Route path="/checkout/cancel" element={<PaymentCancel />} />
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
    </Routes>
    </>
  );
}
