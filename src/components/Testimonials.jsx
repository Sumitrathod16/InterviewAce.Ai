import React from 'react';
import { Star, Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Sarah Chen',
    role: 'Software Engineer at Stripe',
    quote: 'The Mock Interview Simulator was the closest thing to the actual Stripe coding rounds. The feedback pinpointed my exact structural errors, which helped me land my offer!',
    stars: 5,
    initials: 'SC'
  },
  {
    name: 'Marcus Vance',
    role: 'Product Manager at Meta',
    quote: 'The HR behavioral reviewer helped me formulate my answers using the STAR method. Having a realistic sandbox to practice took away all my pre-interview anxiety.',
    stars: 5,
    initials: 'MV'
  },
  {
    name: 'Aishwarya Patel',
    role: 'Backend Dev at Google',
    quote: 'I ran multiple system design sessions and used the code compiler simulator. The optimization diagnostics and memory reviews are incredibly high fidelity.',
    stars: 5,
    initials: 'AP'
  }
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-background border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
            Success Stories from Our Candidates
          </h2>
          <p className="text-lg text-lightGray/70">
            Hear how developers, managers, and designers leveraged InterviewAce to secure their dream jobs.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {TESTIMONIALS.map((t, idx) => (
            <div 
              key={idx} 
              className="p-6 bg-secondaryBg/45 border border-white/5 rounded-xl flex flex-col justify-between relative group hover:border-white/15 transition-all duration-300"
            >
              {/* Quote icon background */}
              <Quote size={40} className="absolute right-6 top-6 text-white/[0.02] group-hover:text-white/[0.04] transition-colors pointer-events-none" />

              <div>
                {/* Stars */}
                <div className="flex gap-1 mb-4 text-white">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} size={14} className="fill-white" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-sm text-lightGray/80 leading-relaxed mb-6 font-sans italic">
                  "{t.quote}"
                </p>
              </div>

              {/* Profile details */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                {/* Initials Avatar */}
                <div className="w-10 h-10 rounded-full bg-white text-background flex items-center justify-center font-bold text-sm select-none">
                  {t.initials}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{t.name}</h4>
                  <p className="text-[11px] text-lightGray/55">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
