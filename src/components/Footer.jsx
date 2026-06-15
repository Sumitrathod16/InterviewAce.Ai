import React from 'react';
import { Terminal, Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const handleScroll = (e, id) => {
    e.preventDefault();
    const element = document.querySelector(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <footer className="bg-background border-t border-white/5 pt-16 pb-8 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Upper footer grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Logo block */}
          <div className="col-span-2 sm:col-span-2 md:col-span-1 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-white text-background rounded-lg">
                <Terminal size={16} className="stroke-[2.5]" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                InterviewAce<span className="text-accent">.AI</span>
              </span>
            </div>
            <p className="text-xs text-lightGray/50 leading-relaxed max-w-xs">
              Empowering candidates to master standard behavioral, technical, and algorithm interview rounds.
            </p>
          </div>

          {/* Product links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Product</h4>
            <ul className="space-y-2 text-xs text-lightGray/65">
              <li>
                <a href="#features" onClick={(e) => handleScroll(e, '#features')} className="hover:text-white transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#demo" onClick={(e) => handleScroll(e, '#demo')} className="hover:text-white transition-colors">
                  Interview Demo
                </a>
              </li>
              <li>
                <a href="#resume" onClick={(e) => handleScroll(e, '#resume')} className="hover:text-white transition-colors">
                  Resume Analyzer
                </a>
              </li>
              <li>
                <a href="#pricing" onClick={(e) => handleScroll(e, '#pricing')} className="hover:text-white transition-colors">
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Legal links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2 text-xs text-lightGray/65">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Security
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Company links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 text-xs text-lightGray/65">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Lower footer row */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] sm:text-xs text-lightGray/40">
            &copy; {currentYear} InterviewAce AI Inc. All rights reserved.
          </p>
          <div className="flex gap-4 text-lightGray/40">
            <a href="#" className="hover:text-white transition-colors" aria-label="GitHub Page">
              <Github size={16} />
            </a>
            <a href="#" className="hover:text-white transition-colors" aria-label="Twitter Page">
              <Twitter size={16} />
            </a>
            <a href="#" className="hover:text-white transition-colors" aria-label="LinkedIn Page">
              <Linkedin size={16} />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
