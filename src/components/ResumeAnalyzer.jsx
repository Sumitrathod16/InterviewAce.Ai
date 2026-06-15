import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, CheckCircle2, AlertCircle, FileText, Sparkles, Square } from 'lucide-react';
import confetti from 'canvas-confetti';

const SAMPLE_RESUME_TEXT = `Sumit Rathod
Software Engineer | Frontend Specialist
sumit@example.com | github.com/Sumitrathod16

EXPERIENCE:
Software Engineer at TechCorp (2024 - Present)
- Worked on the front-end dashboard using React.
- Helped optimize web application speed.
- Maintained legacy state management architecture.

PROJECTS:
BookMyShow Django Clone
- Built a clone using Django.
- Managed user login systems.

EDUCATION:
B.S. in Computer Science (Graduated 2024)`;

export default function ResumeAnalyzer({ atsScore, onAtsScoreChange }) {
  const [file, setFile] = useState(null);
  const [pasteText, setPasteText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [baseScore, setBaseScore] = useState(atsScore || 65);
  const [suggestions, setSuggestions] = useState([
    { id: 1, text: "Replace weak verbs ('Worked', 'Helped') with strong action verbs like 'Engineered', 'Spearheaded'.", solved: false, value: 8 },
    { id: 2, text: "Quantify your impact (e.g., 'optimized web speed' -> 'reduced loading latency by 45%').", solved: false, value: 12 },
    { id: 3, text: "Add missing critical tech stack keywords: Redux, TailwindCSS, TypeScript.", solved: false, value: 7 },
    { id: 4, text: "Convert multi-column tables to a clean single-column structure to support ATS parsing.", solved: false, value: 5 },
    { id: 5, text: "Add a dedicated skills summary section below the header details.", solved: false, value: 4 }
  ]);

  const handleUpload = (e) => {
    e.preventDefault();
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      triggerAnalysis();
    }
  };

  const useSample = () => {
    setPasteText(SAMPLE_RESUME_TEXT);
    triggerAnalysis();
  };

  const triggerAnalysis = () => {
    setAnalyzing(true);
    setHasResult(false);
    setSuggestions(prev => prev.map(s => ({ ...s, solved: false })));
    const newBase = 62 + Math.floor(Math.random() * 8);
    setBaseScore(newBase);
    
    if (onAtsScoreChange) {
      onAtsScoreChange(newBase, "Scan ATS Resume Report");
    }

    setTimeout(() => {
      setAnalyzing(false);
      setHasResult(true);
    }, 2000);
  };

  const toggleSuggestion = (id) => {
    let updatedScore = 0;
    setSuggestions(prev => {
      const next = prev.map(item => {
        if (item.id === id) {
          const newStatus = !item.solved;
          if (newStatus) {
            updatedScore = item.value;
          } else {
            updatedScore = -item.value;
          }
          return { ...item, solved: newStatus };
        }
        return item;
      });
      setBaseScore(b => {
        const final = Math.min(Math.max(b + updatedScore, 0), 100);
        if (onAtsScoreChange) {
          onAtsScoreChange(final, "Checked resume suggestion");
        }
        if (final === 100) {
          confetti({
            particleCount: 50,
            spread: 45,
            origin: { y: 0.8 },
            colors: ['#FFFFFF', '#64748B']
          });
        }
        return final;
      });
      return next;
    });
  };

  const activeSuggestionsLeft = suggestions.filter(s => !s.solved).length;

  return (
    <section id="resume" className="py-24 bg-background border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
            ATS Resume Analyzer
          </h2>
          <p className="text-lg text-lightGray/70">
            Upload your resume or use our pre-filled template to inspect parsing efficiency and raise your ATS rating score.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left panel: Upload and Input */}
          <div className="lg:col-span-6 flex flex-col justify-between p-6 bg-secondaryBg/40 border border-white/5 rounded-xl">
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FileText size={18} /> Upload Resume Document
              </h3>
              
              {/* Drag Drop Area */}
              <label className="border-2 border-dashed border-white/10 hover:border-white/20 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all bg-background/30 group">
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.txt,.doc,.docx"
                  onChange={handleUpload}
                  disabled={analyzing}
                />
                <UploadCloud size={38} className="text-lightGray/40 group-hover:text-white transition-colors mb-4" />
                <span className="text-sm font-semibold text-white mb-1">
                  {file ? file.name : "Drag & drop file here"}
                </span>
                <span className="text-xs text-lightGray/55">Supports PDF, DOCX, TXT up to 10MB</span>
              </label>

              {/* Paste Text Area */}
              <div className="mt-6">
                <label className="block text-xs font-bold text-lightGray/60 uppercase mb-2">Or paste resume text details</label>
                <textarea
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder="Paste your professional experience and skills here..."
                  className="w-full h-32 bg-background/50 text-white rounded-lg p-3 text-xs border border-white/5 focus:outline-none focus:border-white/30 resize-none font-sans"
                  disabled={analyzing}
                />
              </div>
            </div>

            {/* CTAs */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={useSample}
                type="button"
                disabled={analyzing}
                className="flex-1 py-3 glassmorphism text-white hover:bg-white/5 rounded-lg text-xs sm:text-sm font-semibold premium-border"
              >
                Use Sample Resume
              </button>
              <button
                onClick={triggerAnalysis}
                type="button"
                disabled={analyzing || (!file && !pasteText.trim())}
                className="flex-1 py-3 bg-white text-background hover:bg-lightGray disabled:opacity-45 rounded-lg text-xs sm:text-sm font-bold transition-all"
              >
                Scan ATS Score
              </button>
            </div>
          </div>

          {/* Right panel: ATS scoring dashboard */}
          <div className="lg:col-span-6">
            <AnimatePresence mode="wait">
              {analyzing ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-secondaryBg/20 border border-white/5 rounded-xl p-8 h-full flex flex-col justify-center items-center text-center space-y-4"
                >
                  {/* Parsing Spinner */}
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <div className="absolute w-full h-full rounded-full border-2 border-white/5 border-t-white animate-spin" />
                    <Sparkles size={24} className="text-white animate-pulse" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Parsing Document Text</h3>
                  <p className="text-xs text-lightGray/50 max-w-xs leading-relaxed">
                    Analyzing format layout, scanning vocabulary headers, indexing action verbs, and matching tech keywords...
                  </p>
                </motion.div>
              ) : hasResult ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-secondaryBg/40 border border-white/5 rounded-xl p-6 h-full flex flex-col justify-between space-y-6"
                >
                  {/* Results Header */}
                  <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-6 pb-6 border-b border-white/5">
                    {/* Circle Score Gauge */}
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="rgba(255, 255, 255, 0.05)"
                          strokeWidth="8"
                          fill="transparent"
                        />
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="#FFFFFF"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={251.2}
                          strokeDashoffset={251.2 - (251.2 * baseScore) / 100}
                          strokeLinecap="round"
                          className="transition-all duration-700 ease-out"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-xl font-black text-white">{baseScore}</span>
                        <span className="text-[9px] text-lightGray/40 font-bold uppercase tracking-widest">ATS</span>
                      </div>
                    </div>

                    {/* Parser Verdict */}
                    <div className="text-center sm:text-left flex-1">
                      <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                        <Sparkles size={14} className="text-white" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Analysis Complete</span>
                      </div>
                      <h4 className="text-lg font-bold text-white mb-1">
                        {baseScore >= 80 ? 'ATS Compatible' : baseScore >= 65 ? 'Needs Optimization' : 'Poor compatibility'}
                      </h4>
                      <p className="text-xs text-lightGray/70 leading-relaxed max-w-sm">
                        {baseScore >= 80 
                          ? 'Excellent layout structures. High probability of bypassing automated filters.'
                          : 'Your formatting is readable, but resolving items below will greatly increase your response weight.'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Suggestion checklist */}
                  <div>
                    <div className="flex items-center justify-between mb-3.5">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Improvement Checklist</h4>
                      <span className="text-xs text-lightGray/60 font-medium">{activeSuggestionsLeft} remaining</span>
                    </div>
                    <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                      {suggestions.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => toggleSuggestion(item.id)}
                          className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                            item.solved
                              ? 'bg-white/5 border-white/10 opacity-60'
                              : 'bg-background/40 border-white/5 hover:border-white/15'
                          }`}
                        >
                          <div className="mt-0.5 text-white flex-shrink-0">
                            {item.solved ? (
                              <CheckCircle2 size={16} className="text-white stroke-[2.5]" />
                            ) : (
                              <Square size={16} className="text-lightGray/40 stroke-[2]" />
                            )}
                          </div>
                          <span className={`text-xs leading-relaxed ${item.solved ? 'line-through text-lightGray/50' : 'text-lightGray/90'}`}>
                            {item.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </motion.div>
              ) : (
                <div className="bg-secondaryBg/20 border border-white/5 rounded-xl p-8 h-full flex flex-col justify-center items-center text-center space-y-4">
                  <div className="p-4 bg-white/5 rounded-full text-lightGray mb-2">
                    <UploadCloud size={32} className="stroke-[1.5]" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Scan Result Dashboard</h3>
                  <p className="text-sm text-lightGray/50 max-w-xs leading-relaxed">
                    Upload or paste your resume details, then select the analysis triggers to view compatibility ratios.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  );
}
