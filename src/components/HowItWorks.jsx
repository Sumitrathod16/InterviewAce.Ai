import React from 'react';
import { motion } from 'framer-motion';

const steps = [
  {
    step: '01',
    title: 'Choose Interview Type',
    description: 'Select from HR behavioral rounds, Role-Specific Technical challenges (Frontend, Backend, etc.), or Coding evaluations.'
  },
  {
    step: '02',
    title: 'Answer AI Questions',
    description: 'Confront mock questions matching top-tier tech industries. Type your response in real-time inside our responsive simulator.'
  },
  {
    step: '03',
    title: 'Get Instant Feedback',
    description: 'Receive custom scorecard metrics, highlight key structural code/speech strengths, and inspect granular improvement recommendations.'
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-secondaryBg/20 border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
            How InterviewAce Works
          </h2>
          <p className="text-lg text-lightGray/70">
            A simplified, 3-step structured approach to elevate your performance from average to exceptional.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden lg:block absolute top-[40px] left-[15%] right-[15%] h-[1px] bg-white/10 z-0" />

          {steps.map((step, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center text-center group">
              {/* Step Circle */}
              <div className="w-20 h-20 rounded-full bg-secondaryBg flex items-center justify-center text-xl font-extrabold text-white premium-border shadow-xl mb-6 group-hover:bg-white group-hover:text-background transition-all duration-300">
                {step.step}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-lightGray transition-colors">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-lightGray/70 max-w-xs leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
