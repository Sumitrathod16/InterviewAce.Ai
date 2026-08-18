import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock, Tag, ChevronRight } from 'lucide-react';

export default function Blog() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const articles = [
    {
      title: 'Bypassing ATS Filters: Structuring Your Technical Resume in 2026',
      excerpt: 'Most modern applicant tracking systems (ATS) discard resumes due to multi-column CSS grid errors or unparseable fonts. Here is how to audit your format structure.',
      tag: 'ATS Optimization',
      readTime: '5 min read',
      date: 'June 28, 2026'
    },
    {
      title: 'Mastering the Behavioral Loop: The Google Googlyness Framework',
      excerpt: 'Googlyness rounds evaluate your leadership traits, ability to handle ambiguity, and ethics under pressure. Learn the correct STAR template to organize your answers.',
      tag: 'Behavioral Interviews',
      readTime: '8 min read',
      date: 'June 20, 2026'
    },
    {
      title: 'Common Computational Pitfalls in Monaco Code Submissions',
      excerpt: 'An breakdown of runtime inefficiencies, memory leaks, and compiler assertions. See how JavaScript, Python, and C++ compile on remote Judge0 nodes.',
      tag: 'Coding Sandbox',
      readTime: '6 min read',
      date: 'June 15, 2026'
    }
  ];

  return (
    <div className="relative pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-24 bg-background min-h-[80vh] overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-white/5 blur-[120px] pointer-events-none z-0" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 w-full min-w-0">
        {/* Back Button */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-xs font-semibold text-lightGray/50 hover:text-white mb-8 group transition-colors focus:outline-none"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Workspace Home
        </Link>

        {/* Hero title */}
        <div className="mb-12">
          <div className="flex items-center gap-2.5 mb-3">
            <BookOpen className="text-white" size={20} />
            <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
              Resource Hub
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
            The InterviewAce Blog
          </h1>
          <p className="text-sm text-lightGray/50 leading-relaxed max-w-2xl">
            Curated preparation guides, algorithms analysis, and architectural blueprints written by our engineering team to help you prepare effectively.
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 gap-8">
          {articles.map((art, idx) => (
            <article 
              key={idx} 
              className="glassmorphism premium-border p-8 rounded-2xl hover:bg-white/5 transition-all group cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-[10px] text-lightGray/50 font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1.5 text-accent">
                    <Tag size={12} /> {art.tag}
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {art.readTime}</span>
                  <span>&bull;</span>
                  <span>{art.date}</span>
                </div>
                
                <h2 className="text-xl font-bold text-white group-hover:text-accent transition-colors leading-tight">
                  {art.title}
                </h2>
                
                <p className="text-xs text-lightGray/70 leading-relaxed">
                  {art.excerpt}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1 group-hover:gap-2 transition-all">
                  Read Full Guide
                  <ChevronRight size={14} />
                </span>
                <span className="text-[10px] text-lightGray/30 font-mono">ID: #00{idx + 1}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
