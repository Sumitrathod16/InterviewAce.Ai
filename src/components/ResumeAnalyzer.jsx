import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, CheckCircle2, AlertCircle, FileText, Sparkles, Square, Info } from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'react-hot-toast';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

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
  const { userProfile } = useAuth();
  
  const [file, setFile] = useState(null);
  const [pasteText, setPasteText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [baseScore, setBaseScore] = useState(atsScore || 78);
  const [suggestions, setSuggestions] = useState([]);
  const [missingKeywords, setMissingKeywords] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  // AI Bullet Point Optimizer States
  const [originalBullet, setOriginalBullet] = useState('');
  const [optimizedBullet, setOptimizedResult] = useState('');
  const [verbUsed, setVerbUsed] = useState('');
  const [metricTip, setMetricTip] = useState('');
  const [optimizingBullet, setOptimizingBullet] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleOptimizeBullet = async () => {
    if (!originalBullet.trim()) return;
    setOptimizingBullet(true);
    setErrorMsg('');
    try {
      const response = await API.post('/resumes/optimize-bullet', {
        bulletPoint: originalBullet
      });
      setOptimizedResult(response.data.optimized);
      setVerbUsed(response.data.verbUsed);
      setMetricTip(response.data.metricTip);
      toast.success('Bullet point optimized successfully!');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to optimize bullet point.');
      toast.error(err.response?.data?.message || 'Failed to optimize bullet point.');
    } finally {
      setOptimizingBullet(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(optimizedBullet);
    setCopied(true);
    toast.success('Optimized bullet point copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpload = (e) => {
    e.preventDefault();
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setErrorMsg('');
    }
  };

  const useSample = () => {
    setPasteText(SAMPLE_RESUME_TEXT);
    setFile(null);
    setErrorMsg('');
  };

  const triggerAnalysis = async () => {
    if (!userProfile) {
      setErrorMsg('Please log in to analyze your resume.');
      toast.error('Please log in to analyze your resume.');
      return;
    }

    setAnalyzing(true);
    setHasResult(false);
    setErrorMsg('');

    try {
      const formData = new FormData();
      if (file) {
        formData.append('resumeFile', file);
      } else if (pasteText.trim()) {
        formData.append('pasteText', pasteText);
      } else {
        setErrorMsg('Please upload a resume file or paste resume details.');
        toast.error('Please upload a resume file or paste resume details.');
        setAnalyzing(false);
        return;
      }

      const response = await API.post('/resumes/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const data = response.data;
      setBaseScore(data.atsScore);
      setSuggestions(data.suggestions || []);
      setMissingKeywords(data.missingKeywords || []);
      setHasResult(true);

      if (onAtsScoreChange) {
        onAtsScoreChange(data.atsScore, "ATS Resume Scan Complete");
      }

      toast.success(`Analysis complete! ATS Rating: ${data.atsScore}%`);

      if (data.atsScore >= 80) {
        confetti({
          particleCount: 50,
          spread: 45,
          origin: { y: 0.8 },
          colors: ['#FFFFFF', '#64748B']
        });
      }
    } catch (error) {
      console.error('Resume scanning error:', error);
      const msg = error.response?.data?.message || 'An error occurred during resume scanning. Please try again.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleSuggestion = (id) => {
    let scoreAddition = 0;
    setSuggestions(prev => {
      const next = prev.map(item => {
        if (item.id === id || item._id === id) {
          const newStatus = !item.solved;
          scoreAddition = newStatus ? item.value : -item.value;
          if (newStatus) {
            toast.success('Resolved! ATS Rating score increased.');
          } else {
            toast.success('Reopened audit checkmark suggestion.');
          }
          return { ...item, solved: newStatus };
        }
        return item;
      });

      setBaseScore(b => {
        const final = Math.min(Math.max(b + scoreAddition, 0), 100);
        if (onAtsScoreChange) {
          onAtsScoreChange(final, "Checked resume suggestions checklist");
        }
        if (final === 100) {
          confetti({
            particleCount: 40,
            spread: 40,
            origin: { y: 0.8 },
            colors: ['#FFFFFF', '#38BDF8']
          });
          toast.success('Awesome! Resume audit checklist is 100% complete!');
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

              {errorMsg && (
                <div className="p-3 mb-4 bg-red-950/40 border border-red-900/50 rounded-lg text-xs text-red-300 flex items-start gap-2">
                  <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
              
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
                  onChange={(e) => { setPasteText(e.target.value); setFile(null); }}
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
                {analyzing ? 'Scanning...' : 'Scan ATS Score'}
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
                  className="bg-secondaryBg/40 border border-white/5 rounded-xl p-6 h-full flex flex-col justify-between space-y-6 animate-in fade-in duration-200"
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
                          stroke="rgba(var(--white), 0.05)"
                          strokeWidth="8"
                          fill="transparent"
                        />
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="rgb(var(--white))"
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

                  {/* Suggestion checklist & Missing Keywords */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Suggestions */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-[10px] font-bold text-lightGray/50 uppercase tracking-wider">Improvement Checklist</h4>
                        <span className="text-[10px] text-lightGray/40 font-semibold">{activeSuggestionsLeft} left</span>
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {suggestions.map((item) => (
                          <div
                            key={item._id || item.id}
                            onClick={() => toggleSuggestion(item._id || item.id)}
                            className={`flex items-start gap-2 p-2 rounded-lg border transition-all duration-150 cursor-pointer text-[11px] ${
                              item.solved
                                ? 'bg-white/5 border-white/10 opacity-60'
                                : 'bg-background/40 border-white/5 hover:border-white/15'
                            }`}
                          >
                            <div className="mt-0.5 text-white flex-shrink-0">
                              {item.solved ? (
                                <CheckCircle2 size={13} className="text-white stroke-[2.5]" />
                              ) : (
                                <Square size={13} className="text-lightGray/40 stroke-[2]" />
                              )}
                            </div>
                            <span className={item.solved ? 'line-through text-lightGray/50' : 'text-lightGray/90'}>
                              {item.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Missing Keywords */}
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex flex-col justify-between">
                      <div>
                        <h4 className="text-[10px] font-bold text-lightGray/50 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <Info size={11} /> Missing Core Keywords
                        </h4>
                        <p className="text-[10px] text-lightGray/60 leading-relaxed mb-3">
                          Add these skills to align your document with standard ATS filters for a {userProfile?.targetRole || 'Developer'} target.
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {missingKeywords.map((kw, i) => (
                            <span 
                              key={i} 
                              className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[10px] text-lightGray/80"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
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

        {/* Experience Bullet Point Optimizer Section */}
        <div className="mt-12 p-6 bg-secondaryBg/45 border border-white/5 rounded-xl space-y-6">
          <div className="border-b border-white/5 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles size={18} className="text-amber-400 fill-amber-400" /> Resume Experience Bullet-Point Optimizer
            </h3>
            <p className="text-xs text-lightGray/70 mt-1">
              Paste a bullet point from your work history. Our AI will inject strong action verbs and metrics templates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch text-xs">
            {/* Input area */}
            <div className="space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <label className="block font-bold text-lightGray/60 uppercase">Original Bullet Point</label>
                <textarea
                  value={originalBullet}
                  onChange={(e) => setOriginalBullet(e.target.value)}
                  placeholder="e.g. I worked on a react dashboard and improved speed."
                  className="w-full h-28 bg-background/50 text-white rounded-lg p-3 border border-white/5 focus:outline-none focus:border-white/30 resize-none font-sans placeholder-lightGray/35"
                />
              </div>
              <button
                onClick={handleOptimizeBullet}
                disabled={optimizingBullet || !originalBullet.trim()}
                className="w-full py-3 bg-white text-background hover:bg-lightGray font-black uppercase tracking-wider rounded-lg disabled:opacity-45 transition-all text-center flex items-center justify-center gap-1.5"
              >
                {optimizingBullet && <span className="w-3.5 h-3.5 rounded-full border-2 border-background border-t-transparent animate-spin" />}
                {optimizingBullet ? 'Polishing...' : 'Optimize experience'}
              </button>
            </div>

            {/* Output area */}
            <div className="p-4 bg-background/35 border border-white/5 rounded-xl flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lightGray/60 uppercase">AI Polished Result</span>
                  {optimizedBullet && (
                    <button
                      onClick={copyToClipboard}
                      className="px-2.5 py-1 bg-white/5 border border-white/5 hover:bg-white/10 text-white rounded text-[10px] flex items-center gap-1.5 transition-colors font-sans"
                    >
                      {copied ? 'Copied!' : 'Copy text'}
                    </button>
                  )}
                </div>
                {optimizedBullet ? (
                  <div className="space-y-3 leading-relaxed">
                    <p className="text-white bg-white/5 p-3 rounded-lg border border-white/5 font-medium">{optimizedBullet}</p>
                    {verbUsed && (
                      <div>
                        <span className="text-[10px] text-lightGray/50 font-bold uppercase">Strong Verbs Applied:</span>
                        <div className="flex gap-1.5 flex-wrap mt-1">
                          {verbUsed.split(',').map((v, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-emerald-950/20 border border-emerald-800/40 text-[10px] text-emerald-400 font-semibold">{v.trim()}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {metricTip && (
                      <div className="p-2.5 bg-white/5 border border-white/5 rounded-lg text-[10px] text-lightGray/55 leading-normal flex items-start gap-1.5 font-sans">
                        <Info size={11} className="flex-shrink-0 mt-0.5" />
                        <span>{metricTip}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center py-8 text-lightGray/40 italic text-center font-sans">
                    Polished result will appear here. Enter an original bullet point and click optimize.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
