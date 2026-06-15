import React, { useState, useEffect } from 'react';
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

export default function App() {
  // Authentication & session state
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('interviewace_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentView, setCurrentView] = useState('landing'); // 'landing' or 'dashboard-portal'
  
  // Stats states loaded from localStorage
  const [solvedProblems, setSolvedProblems] = useState(() => {
    const saved = localStorage.getItem('interviewace_solved');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const [atsScore, setAtsScore] = useState(() => {
    const saved = localStorage.getItem('interviewace_ats');
    return saved ? Number(saved) : 78;
  });

  const [completedInterviews, setCompletedInterviews] = useState(() => {
    const saved = localStorage.getItem('interviewace_interviews');
    return saved ? JSON.parse(saved) : [];
  });

  const [recentActivity, setRecentActivity] = useState(() => {
    const saved = localStorage.getItem('interviewace_activity');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedProblemIndex, setSelectedProblemIndex] = useState(0);

  // Sync to localStorage
  useEffect(() => {
    if (userProfile) {
      localStorage.setItem('interviewace_user', JSON.stringify(userProfile));
    } else {
      localStorage.removeItem('interviewace_user');
    }
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('interviewace_solved', JSON.stringify(Array.from(solvedProblems)));
  }, [solvedProblems]);

  useEffect(() => {
    localStorage.setItem('interviewace_ats', atsScore.toString());
  }, [atsScore]);

  useEffect(() => {
    localStorage.setItem('interviewace_interviews', JSON.stringify(completedInterviews));
  }, [completedInterviews]);

  useEffect(() => {
    localStorage.setItem('interviewace_activity', JSON.stringify(recentActivity));
  }, [recentActivity]);

  // Auth actions
  const handleAuthSuccess = (profile) => {
    setUserProfile(profile);
    setShowAuthModal(false);
    setCurrentView('dashboard-portal');
    
    const timestamp = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    setRecentActivity(logs => [
      {
        type: 'auth',
        title: `Signed in as ${profile.name}`,
        time: `Today at ${timestamp}`
      },
      ...logs
    ]);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUserProfile(null);
    setSolvedProblems(new Set());
    setAtsScore(78);
    setCompletedInterviews([]);
    setRecentActivity([]);
    setCurrentView('landing');
  };

  // View switches
  const handleViewChange = (view) => {
    if (view === 'dashboard-portal' && !userProfile) {
      setShowAuthModal(true);
    } else {
      setCurrentView(view);
    }
  };

  // Sync callbacks
  const handleSolveProblem = (id, title) => {
    setSolvedProblems(prev => {
      const next = new Set(prev);
      if (!next.has(id)) {
        next.add(id);
        
        // Log activity history
        const timestamp = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        setRecentActivity(logs => [
          {
            type: 'code',
            title: `Solved challenge: ${title.replace(/^\d+\.\s*/, '')}`,
            time: `Today at ${timestamp}`
          },
          ...logs
        ]);
      }
      return next;
    });
  };

  const handleAtsScoreChange = (newScore, reason) => {
    setAtsScore(newScore);
    
    // Log activity history
    const timestamp = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    setRecentActivity(logs => [
      {
        type: 'resume',
        title: `${reason} (ATS: ${newScore}/100)`,
        time: `Today at ${timestamp}`
      },
      ...logs
    ]);
  };

  const handleInterviewComplete = (data) => {
    setCompletedInterviews(prev => [...prev, data]);

    // Log activity history
    const timestamp = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    setRecentActivity(logs => [
      {
        type: 'interview',
        title: `Completed ${data.type} (Score: ${data.score}%)`,
        time: `Today at ${timestamp}`
      },
      ...logs
    ]);
  };

  return (
    <div className="bg-background min-h-screen text-white selection:bg-white selection:text-background overflow-hidden">
      {/* Navigation Bar */}
      <Navbar currentView={currentView} onViewChange={handleViewChange} />

      {currentView === 'landing' ? (
        <main>
          {/* Hero Landing */}
          <Hero />

          {/* Core Product Features */}
          <Features />

          {/* Multi-step preparation walkthrough */}
          <HowItWorks />

          {/* Live Mock Interview Simulator */}
          <MockInterviewDemo onInterviewComplete={handleInterviewComplete} />

          {/* Live ATS Resume Parser */}
          <ResumeAnalyzer atsScore={atsScore} onAtsScoreChange={handleAtsScoreChange} />

          {/* Live Code Compiler Sandbox */}
          <CodingAssessment 
            solvedProblems={solvedProblems} 
            onSolveProblem={handleSolveProblem} 
            selectedProblemIndex={selectedProblemIndex}
            onSelectProblemIndex={setSelectedProblemIndex}
          />

          {/* Integrated Candidate Progress Dashboard Showcase */}
          <DashboardPreview />

          {/* Student Testimonials Success Showcase */}
          <Testimonials />

          {/* Premium Subscription Pricing Matrices */}
          <Pricing />

          {/* Collapsible FAQ Panels */}
          <FAQ />
        </main>
      ) : (
        <main>
          {/* User's Dedicated Active Dashboard Workspace */}
          <DashboardPortal 
            solvedProblems={solvedProblems}
            recentActivity={recentActivity}
            atsScore={atsScore}
            completedInterviews={completedInterviews}
            onSelectProblem={setSelectedProblemIndex}
            onViewChange={handleViewChange}
            userProfile={userProfile}
            onLogout={handleLogout}
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

      {/* Corporate Footnotes and Links */}
      <Footer />
    </div>
  );
}
