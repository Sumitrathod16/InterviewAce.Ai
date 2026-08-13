import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Terminal, ArrowRight, LayoutDashboard, Home, Sun, Moon } from 'lucide-react';

export default function Navbar({ currentView, onViewChange, onTabChange, hasUser, theme, toggleTheme, isOnline = true }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = hasUser ? [
    { name: 'Mock Interviews', href: '#demo' },
    { name: 'Resume Analyzer', href: '#resume' },
    { name: 'Coding Sandbox', href: '#coding' },
  ] : [
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Interview Demo', href: '#demo' },
    { name: 'Resume Analyzer', href: '#resume' },
    { name: 'Coding Sandbox', href: '#coding' },
  ];

  const handleLinkClick = (e, href) => {
    e.preventDefault();
    setIsOpen(false);
    
    if (href.startsWith('/')) {
      navigate(href);
      return;
    }
    
    if (hasUser) {
      let tab = '';
      if (href === '#demo') tab = 'interviews';
      else if (href === '#resume') tab = 'resume';
      else if (href === '#coding') tab = 'coding';
      
      if (tab) {
        if (currentView !== 'dashboard-portal') {
          onViewChange('dashboard-portal');
        }
        if (onTabChange) {
          onTabChange(tab);
        }
        return;
      }
      
      // For '#features' and '#how-it-works':
      if (currentView === 'dashboard-portal') {
        if (onTabChange) {
          onTabChange('overview');
        }
        return;
      }
    }

    if (currentView !== 'landing') {
      onViewChange('landing');
      // Delay scrolling slightly to allow the view render transition
      setTimeout(() => {
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled || currentView !== 'landing' ? 'glassmorphism py-4 shadow-xl' : 'bg-transparent py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => {
              if (hasUser) {
                if (currentView !== 'dashboard-portal') {
                  onViewChange('dashboard-portal');
                }
                if (onTabChange) {
                  onTabChange('overview');
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                onViewChange('landing');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="flex items-center space-x-2 group text-left focus:outline-none"
          >
            <div className="p-2 bg-white text-background rounded-lg transition-transform duration-300 group-hover:scale-105">
              <Terminal size={20} className="stroke-[2.5]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              InterviewAce<span className="text-accent">.AI</span>
            </span>
            <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-extrabold tracking-widest uppercase rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30 leading-none self-center">
              BETA
            </span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 mx-6">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className={`text-sm font-medium transition-colors duration-200 ${
                  currentView === 'landing' 
                    ? 'text-lightGray/80 hover:text-white' 
                    : 'text-lightGray/40 hover:text-white'
                }`}
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Desktop CTA & View Toggle */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 text-lightGray hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 flex items-center justify-center focus:outline-none"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {currentView === 'landing' ? (
              <>
                <button
                  onClick={() => onViewChange('dashboard-portal')}
                  className="px-4 py-2 text-sm font-semibold text-lightGray hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <LayoutDashboard size={15} />
                  Workspace Dashboard
                </button>
                <button
                  onClick={() => onViewChange('dashboard-portal')}
                  className="px-4 py-2 text-sm font-medium bg-white text-background rounded-lg hover:bg-lightGray transition-all duration-200 flex items-center gap-1 font-semibold premium-border"
                >
                  Start Free Portal
                  <ArrowRight size={14} />
                </button>
              </>
            ) : (
              <>
                {isOnline ? (
                  <span className="text-xs font-bold font-mono text-emerald-400 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-900" title="Workspace Active">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Workspace Active
                  </span>
                ) : (
                  <span className="text-xs font-bold font-mono text-rose-400 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-950/40 border border-rose-900" title="Workspace Inactive">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                    Workspace Inactive
                  </span>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-white/90 hover:text-white hover:bg-white/5 rounded-xl border border-white/10 transition-all duration-200 focus:outline-none flex items-center justify-center"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>
 
      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden bg-secondaryBg border-b border-white/10 py-6 px-6 space-y-4 absolute top-full left-0 right-0 shadow-2xl border-t border-white/5 animate-in fade-in slide-in-from-top-5 duration-200 z-50">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              className="block px-3.5 py-2.5 text-base font-semibold text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200"
            >
              {link.name}
            </a>
          ))}
          <div className="pt-4 border-t border-white/5 flex flex-col space-y-3">
            <button
              onClick={toggleTheme}
              className="w-full py-3 text-sm font-semibold text-white/85 hover:text-white hover:bg-white/5 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {theme === 'dark' ? (
                <>
                  <Sun size={16} />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon size={16} />
                  Dark Mode
                </>
              )}
            </button>
            {currentView === 'landing' ? (
              <>
                <button
                  onClick={() => { setIsOpen(false); onViewChange('dashboard-portal'); }}
                  className="w-full text-center py-2.5 text-sm font-semibold text-white/85 hover:text-white flex items-center justify-center gap-1.5"
                >
                  <LayoutDashboard size={15} />
                  Workspace Dashboard
                </button>
                <button
                  onClick={() => { setIsOpen(false); onViewChange('dashboard-portal'); }}
                  className="w-full text-center py-3 text-sm font-bold bg-white text-background rounded-xl hover:bg-white/95 transition-all shadow-md border border-white/10"
                >
                  Start Free Portal
                </button>
              </>
            ) : (
              <>
                {isOnline ? (
                  <div className="py-3 text-center text-xs font-bold font-mono text-emerald-400 rounded-xl bg-emerald-950/40 border border-emerald-900 flex items-center justify-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Workspace Active
                  </div>
                ) : (
                  <div className="py-3 text-center text-xs font-bold font-mono text-rose-400 rounded-xl bg-rose-950/40 border border-rose-900 flex items-center justify-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                    Workspace Inactive
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
