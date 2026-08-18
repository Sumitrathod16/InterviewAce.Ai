import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Send, Mail, MapPin, Globe, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Contact() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'support',
    message: ''
  });

  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill out all required fields.');
      return;
    }
    
    setSending(true);
    // Simulate sending message to backend operations
    setTimeout(() => {
      toast.success('Your message has been submitted! We will reach out shortly.');
      setFormData({ name: '', email: '', subject: 'support', message: '' });
      setSending(false);
    }, 1200);
  };

  return (
    <div className="relative pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-24 bg-background min-h-[80vh] overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-white/5 blur-[120px] pointer-events-none z-0" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 w-full min-w-0">
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
            <MessageSquare className="text-white" size={20} />
            <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
              Get in Touch
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
            Contact Operations
          </h1>
          <p className="text-sm text-lightGray/50 leading-relaxed max-w-2xl">
            Have questions about compiler rate limits, enterprise licensing, billing, or custom team roadmaps? Send us a message and our operations team will assist you.
          </p>
        </div>

        {/* Grid: Form and Contact Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left panel: Info cards */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-6">
            <div className="glassmorphism premium-border p-6 rounded-2xl space-y-6">
              <h3 className="font-bold text-white text-base">Office Headquarters</h3>
              
              <div className="space-y-4 text-xs text-lightGray/70">
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-white/60 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-white">Location</h4>
                    
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail size={16} className="text-white/60 shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <h4 className="font-semibold text-white">Direct Channels</h4>
                    <div className="space-y-1">
                      <p className="text-[10px] text-lightGray/40 font-mono uppercase tracking-wider">General & Help</p>
                      <a href="mailto:inspirewebapp22@gmail.com" className="text-white hover:text-accent font-semibold transition-colors block text-xs underline decoration-white/5">
                        inspirewebapp22@gmail.com
                      </a>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-lightGray/40 font-mono uppercase tracking-wider">Security Audits</p>
                      <a href="mailto:inspirewebapp22@gmail.com" className="text-white hover:text-accent font-semibold transition-colors block text-xs underline decoration-white/5">
                        inspirewebapp22@gmail.com
                      </a>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-lightGray/40 font-mono uppercase tracking-wider">Privacy & GDPR</p>
                      <a href="mailto: inspirewebapp22@gmail.com" className="text-white hover:text-accent font-semibold transition-colors block text-xs underline decoration-white/5">
                        inspirewebapp22@gmail.com
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2">
                  <Globe size={16} className="text-white/60 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-white">Web Portal</h4>
                    <p className="font-mono text-xs">interview-ace-ai-mauve.vercel.app</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glassmorphism premium-border p-6 rounded-2xl flex-1 flex flex-col justify-center items-center text-center space-y-2">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block flex items-center gap-1">
                <Sparkles size={12} className="fill-amber-400 text-amber-400" /> Response Time
              </span>
              <p className="text-[11px] text-lightGray/60 leading-relaxed max-w-[200px]">
                We review support tickets, security disclosures, and subscription queries within **24 hours**.
              </p>
            </div>
          </div>

          {/* Right panel: Contact Form */}
          <div className="lg:col-span-8 glassmorphism premium-border p-8 sm:p-10 rounded-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-xs font-semibold text-lightGray/60 block">Your Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Sumit Rathod"
                    className="w-full bg-background/80 text-white rounded-xl px-4 py-3 text-xs border border-white/5 focus:outline-none focus:border-white/20 font-sans transition-colors placeholder:text-lightGray/25"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs font-semibold text-lightGray/60 block">Your Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="sumitrathod1604@gmail.com"
                    className="w-full bg-background/80 text-white rounded-xl px-4 py-3 text-xs border border-white/5 focus:outline-none focus:border-white/20 font-sans transition-colors placeholder:text-lightGray/25"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-xs font-semibold text-lightGray/60 block">Inquiry Type</label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full bg-background/80 text-white rounded-xl px-4 py-3 text-xs border border-white/5 focus:outline-none focus:border-white/20 font-sans transition-colors"
                >
                  <option value="support">Technical & Portal Support</option>
                  <option value="feedback">Beta Feedback & Feature Requests</option>
                  <option value="enterprise">University & Enterprise Licensing</option>
                  <option value="careers">Careers & Hiring Inquiry</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-xs font-semibold text-lightGray/60 block">Message Details *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Describe your inquiry details..."
                  rows={5}
                  className="w-full bg-background/80 text-white rounded-xl px-4 py-3 text-xs border border-white/5 focus:outline-none focus:border-white/20 font-sans transition-colors placeholder:text-lightGray/25 resize-none leading-relaxed"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full py-3.5 text-xs font-bold bg-white text-background hover:bg-lightGray rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {sending ? (
                  'Transmitting logs...'
                ) : (
                  <>
                    <Send size={14} />
                    Send Secure Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
