import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQS = [
  {
    question: "How accurate is the AI mock interview evaluation score?",
    answer: "Our engine reviews structural flow (STAR method), technical keyword accuracy, communication depth, and grammar. While simulated, it matches criteria used by recruiters at leading companies to rate candidate answers."
  },
  {
    question: "What resume formats are supported by the ATS Analyzer?",
    answer: "You can upload files in PDF, DOCX, or plain TXT format. The analyzer extracts text layout headers, scans for role-specific keywords, and measures action verb density to confirm system compatibility."
  },
  {
    question: "Are the coding assessment test cases run in a sandbox?",
    answer: "Yes, our Javascript sandbox executes your logic instantly in your local browser client environment. This ensures zero latency and absolute data security for your source script scripts."
  },
  {
    question: "Can I customize the mock questions for specific companies?",
    answer: "Yes, our Pro and Premium subscription plans include targeted sets tailored to top tech employers like Google, Meta, and Stripe, focusing on their recurring technical and core behavioral rounds."
  },
  {
    question: "Is there a trial limit for the free tier?",
    answer: "The Free tier supports 3 mock interviews per day with standard performance feedback, along with full access to our default starter coding sandbox exercises."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (idx) => {
    setOpenIndex(prev => prev === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 bg-background border-t border-white/5 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-lightGray/70">
            Have questions about our simulation engine or subscription plans? Find answers below.
          </p>
        </div>

        {/* Accordions */}
        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div 
                key={idx}
                className="bg-secondaryBg/30 border border-white/5 rounded-xl overflow-hidden transition-all duration-300"
              >
                {/* Trigger Button */}
                <button
                  type="button"
                  onClick={() => toggleFAQ(idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none hover:bg-secondaryBg/20 transition-colors"
                >
                  <span className="text-sm sm:text-base font-semibold text-white pr-4">
                    {faq.question}
                  </span>
                  <div className="text-lightGray/60 flex-shrink-0">
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </button>

                {/* Answer Content */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-lightGray/70 leading-relaxed border-t border-white/5 bg-secondaryBg/10">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
