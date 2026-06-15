import React from 'react';
import { motion } from 'framer-motion';
import { 
  UserCheck, 
  Cpu, 
  Code, 
  FileText, 
  FileSpreadsheet, 
  TrendingUp, 
  Building2, 
  Target 
} from 'lucide-react';

const features = [
  {
    icon: UserCheck,
    title: 'AI HR Interviews',
    description: 'Practice classic behavioral questions. Get evaluated on core communication, leadership, and conflict resolution.'
  },
  {
    icon: Cpu,
    title: 'Technical Interview Practice',
    description: 'Deep dive into specialized roles: Frontend, Backend, Fullstack, Mobile, and System Design interviews.'
  },
  {
    icon: Code,
    title: 'Coding Challenges',
    description: 'Solve algorithm questions with a code compiler simulator and receive optimized complexity reviews.'
  },
  {
    icon: FileText,
    title: 'Resume Analyzer',
    description: 'Evaluate your resume layout, syntax quality, and action-verb phrasing with AI recommendations.'
  },
  {
    icon: FileSpreadsheet,
    title: 'ATS Score Checker',
    description: 'Verify if your resume format matches standard ATS checkers. Receive suggestions to bypass parse failures.'
  },
  {
    icon: TrendingUp,
    title: 'Interview Performance Reports',
    description: 'Receive visual performance charts highlighting improvement rates, language structure, and logic scores.'
  },
  {
    icon: Building2,
    title: 'Company-Specific Preparation',
    description: 'Tailor your preparation with targeted practice sets for Google, Meta, Amazon, Stripe, and other top tech firms.'
  },
  {
    icon: Target,
    title: 'Progress Tracking',
    description: 'Set daily streak schedules, track XP values, monitor target achievements, and map your hiring timeline.'
  }
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function Features() {
  return (
    <section id="features" className="py-24 bg-background border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
            Everything You Need to Ace Your Next Interview
          </h2>
          <p className="text-lg text-lightGray/70">
            A comprehensive suite of tools built on high-fidelity AI models to prepare you for any industry scenario.
          </p>
        </div>

        {/* Feature Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="group relative p-6 bg-secondaryBg/40 rounded-xl premium-border hover:bg-secondaryBg/60 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Icon Wrapper */}
                  <div className="p-3 bg-white/5 text-lightGray group-hover:text-white group-hover:bg-white/10 rounded-lg w-fit transition-all duration-300 mb-6">
                    <Icon size={22} className="stroke-[2]" />
                  </div>
                  {/* Content */}
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-white/95 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-lightGray/70 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                {/* Visual Accent Hover Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-xl origin-left" />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
