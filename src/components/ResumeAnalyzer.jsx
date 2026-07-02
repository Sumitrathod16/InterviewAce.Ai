import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, CheckCircle2, AlertCircle, FileText, Sparkles, Square, Info } from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'react-hot-toast';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { jsPDF } from 'jspdf';

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
  // Resume Editor & AI Auto-Optimizer States
  const [autoOptimizing, setAutoOptimizing] = useState(false);
  const [fixingSuggestionId, setFixingSuggestionId] = useState(null);
  const [fileExtension, setFileExtension] = useState('txt');
  const [editorTab, setEditorTab] = useState('contact');

  const DEFAULT_STRUCTURED_RESUME = {
    name: "Sumit Rathod",
    email: "sumit@example.com",
    phone: "+91 99999 99999",
    website: "github.com/Sumitrathod16",
    summary: "Highly motivated Software Engineer specializing in front-end development and speed optimizations.",
    skills: ["JavaScript (ES6+)", "React", "Django", "CSS3", "HTML5"],
    experience: [
      {
        role: "Software Engineer",
        company: "TechCorp",
        dates: "2024 - Present",
        bullets: [
          "Worked on the front-end dashboard using React.",
          "Helped optimize web application speed.",
          "Maintained legacy state management architecture."
        ]
      }
    ],
    projects: [
      {
        title: "BookMyShow Django Clone",
        bullets: [
          "Built a clone using Django.",
          "Managed user login systems."
        ]
      }
    ],
    education: [
      {
        degree: "B.S. in Computer Science",
        school: "University of Tech",
        dates: "Graduated 2024"
      }
    ]
  };

  const [resumeData, setResumeData] = useState(DEFAULT_STRUCTURED_RESUME);
  const [initialResumeData, setInitialResumeData] = useState(DEFAULT_STRUCTURED_RESUME);

  const compileResumeText = (data) => {
    if (!data) return '';
    return `
${data.name || ''}
${data.email || ''} | ${data.phone || ''} | ${data.website || ''}

SUMMARY:
${data.summary || ''}

SKILLS:
${(data.skills || []).join(', ')}

EXPERIENCE:
${(data.experience || []).map(exp => `
${exp.role || ''} at ${exp.company || ''} (${exp.dates || ''})
${(exp.bullets || []).map(b => `- ${b}`).join('\n')}
`).join('\n')}

PROJECTS:
${(data.projects || []).map(proj => `
${proj.title || ''}
${(proj.bullets || []).map(b => `- ${b}`).join('\n')}
`).join('\n')}

EDUCATION:
${(data.education || []).map(edu => `
${edu.degree || ''} - ${edu.school || ''} (${edu.dates || ''})
`).join('\n')}
    `.trim();
  };

  const handleFixSuggestion = async (id, suggestionText) => {
    if (!resumeData) return;
    setFixingSuggestionId(id);
    try {
      const compiledText = compileResumeText(resumeData);
      const response = await API.post('/resumes/fix-suggestion', {
        resumeText: compiledText,
        suggestionText
      });
      const updatedText = response.data.updatedText;
      
      // Trigger re-scan of the updated text immediately
      setAnalyzing(true);
      setHasResult(false);
      
      const rescanRes = await API.post('/resumes/analyze', {
        pasteText: updatedText
      });
      const data = rescanRes.data;
      setBaseScore(data.atsScore);
      setSuggestions(data.suggestions || []);
      setMissingKeywords(data.missingKeywords || []);
      setHasResult(true);
      setResumeData(data.parsedResume || DEFAULT_STRUCTURED_RESUME);
      toast.success('AI successfully resolved this suggestion in your resume template!');
      
      if (data.atsScore >= 80) {
        confetti({
          particleCount: 50,
          spread: 45,
          origin: { y: 0.8 }
        });
      }
      if (onAtsScoreChange) {
        onAtsScoreChange(data.atsScore, "ATS Resume Scan Complete");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to auto-fix suggestion.');
    } finally {
      setFixingSuggestionId(null);
      setAnalyzing(false);
    }
  };

  const downloadAsTxt = () => {
    const textContent = compileResumeText(resumeData);
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'optimized_resume.txt';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Resume downloaded successfully as optimized_resume.txt!');
  };

  const handleDownloadResume = () => {
    if (!resumeData) return;

    if (fileExtension === 'pdf') {
      try {
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        const marginX = 20;
        const pageHeight = 297;
        const pageWidth = 210;
        const maxLineWidth = pageWidth - (marginX * 2); // 170mm
        let currentY = 20;

        const checkPageOverflow = (heightNeeded) => {
          if (currentY + heightNeeded > pageHeight - 20) {
            doc.addPage();
            currentY = 20;
          }
        };

        // 1. Header (Name, Contact Details)
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text(resumeData.name || "Candidate", pageWidth / 2, currentY, { align: "center" });
        currentY += 7;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        const contactInfo = [resumeData.email, resumeData.phone, resumeData.website].filter(Boolean).join("  |  ");
        doc.text(contactInfo, pageWidth / 2, currentY, { align: "center" });
        currentY += 12;

        // 2. Summary
        if (resumeData.summary) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);
          doc.text("PROFESSIONAL SUMMARY", marginX, currentY);
          currentY += 2;
          doc.setLineWidth(0.2);
          doc.line(marginX, currentY, pageWidth - marginX, currentY);
          currentY += 5;

          doc.setFont("helvetica", "normal");
          doc.setFontSize(9.5);
          const summaryLines = doc.splitTextToSize(resumeData.summary, maxLineWidth);
          summaryLines.forEach(line => {
            checkPageOverflow(5);
            doc.text(line, marginX, currentY);
            currentY += 5;
          });
          currentY += 5;
        }

        // 3. Technical Skills
        if (resumeData.skills && resumeData.skills.length > 0) {
          checkPageOverflow(15);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);
          doc.text("TECHNICAL SKILLS", marginX, currentY);
          currentY += 2;
          doc.line(marginX, currentY, pageWidth - marginX, currentY);
          currentY += 5;

          doc.setFont("helvetica", "normal");
          doc.setFontSize(9.5);
          const skillsText = resumeData.skills.join(", ");
          const skillsLines = doc.splitTextToSize(skillsText, maxLineWidth);
          skillsLines.forEach(line => {
            checkPageOverflow(5);
            doc.text(line, marginX, currentY);
            currentY += 5;
          });
          currentY += 5;
        }

        // 4. Work Experience
        if (resumeData.experience && resumeData.experience.length > 0) {
          checkPageOverflow(15);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);
          doc.text("WORK EXPERIENCE", marginX, currentY);
          currentY += 2;
          doc.line(marginX, currentY, pageWidth - marginX, currentY);
          currentY += 6;

          resumeData.experience.forEach(exp => {
            checkPageOverflow(18);
            // Role & Dates
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.text(exp.role || "", marginX, currentY);
            doc.setFont("helvetica", "normal");
            doc.text(exp.dates || "", pageWidth - marginX, currentY, { align: "right" });
            currentY += 5;

            // Company Name
            doc.setFont("helvetica", "oblique");
            doc.setFontSize(9.5);
            doc.text(exp.company || "", marginX, currentY);
            currentY += 5;

            // Bullets
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            if (exp.bullets) {
              exp.bullets.forEach(bullet => {
                const bulletText = `• ${bullet}`;
                const bulletLines = doc.splitTextToSize(bulletText, maxLineWidth - 4);
                bulletLines.forEach(line => {
                  checkPageOverflow(5);
                  doc.text(line, marginX + 4, currentY);
                  currentY += 5.5;
                });
              });
            }
            currentY += 4;
          });
          currentY += 2;
        }

        // 5. Projects
        if (resumeData.projects && resumeData.projects.length > 0) {
          checkPageOverflow(15);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);
          doc.text("KEY PROJECTS", marginX, currentY);
          currentY += 2;
          doc.line(marginX, currentY, pageWidth - marginX, currentY);
          currentY += 6;

          resumeData.projects.forEach(proj => {
            checkPageOverflow(12);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.text(proj.title || "", marginX, currentY);
            currentY += 5;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            if (proj.bullets) {
              proj.bullets.forEach(bullet => {
                const bulletText = `• ${bullet}`;
                const bulletLines = doc.splitTextToSize(bulletText, maxLineWidth - 4);
                bulletLines.forEach(line => {
                  checkPageOverflow(5);
                  doc.text(line, marginX + 4, currentY);
                  currentY += 5.5;
                });
              });
            }
            currentY += 4;
          });
          currentY += 2;
        }

        // 6. Education
        if (resumeData.education && resumeData.education.length > 0) {
          checkPageOverflow(15);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);
          doc.text("EDUCATION", marginX, currentY);
          currentY += 2;
          doc.line(marginX, currentY, pageWidth - marginX, currentY);
          currentY += 6;

          resumeData.education.forEach(edu => {
            checkPageOverflow(12);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.text(edu.degree || "", marginX, currentY);
            doc.setFont("helvetica", "normal");
            doc.text(edu.dates || "", pageWidth - marginX, currentY, { align: "right" });
            currentY += 5;

            doc.text(edu.school || "", marginX, currentY);
            currentY += 8;
          });
        }

        doc.save('optimized_resume.pdf');
        toast.success('Resume downloaded successfully as optimized_resume.pdf!');
      } catch (err) {
        console.error('PDF generation error:', err);
        toast.error('Failed to compile PDF. Exporting as TXT fallback.');
        downloadAsTxt();
      }
    } else if (fileExtension === 'doc' || fileExtension === 'docx') {
      try {
        const textContent = compileResumeText(resumeData);
        const docContent = `
          <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
          <head>
            <title>Optimized Resume</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                font-size: 11pt;
                line-height: 1.5;
                white-space: pre-wrap;
              }
            </style>
          </head>
          <body>
            ${textContent.replace(/\n/g, '<br/>')}
          </body>
          </html>
        `;
        const blob = new Blob(['\ufeff' + docContent], { type: 'application/msword;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `optimized_resume.${fileExtension}`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success(`Resume downloaded successfully as optimized_resume.${fileExtension}!`);
      } catch (err) {
        console.error(err);
        downloadAsTxt();
      }
    } else {
      downloadAsTxt();
    }
  };

  const handleRescanEditedText = async () => {
    if (!resumeData) return;
    setAnalyzing(true);
    setHasResult(false);
    setErrorMsg('');
    try {
      const compiledText = compileResumeText(resumeData);
      const response = await API.post('/resumes/analyze', {
        pasteText: compiledText
      });
      const data = response.data;
      setBaseScore(data.atsScore);
      setSuggestions(data.suggestions || []);
      setMissingKeywords(data.missingKeywords || []);
      setHasResult(true);
      setResumeData(data.parsedResume || resumeData);
      toast.success(`ATS Re-scan Complete! Score: ${data.atsScore}%`);
      
      if (data.atsScore >= 80) {
        confetti({
          particleCount: 50,
          spread: 45,
          origin: { y: 0.8 }
        });
      }
      if (onAtsScoreChange) {
        onAtsScoreChange(data.atsScore, "ATS Resume Scan Complete");
      }
    } catch (error) {
      console.error('Resume scanning error:', error);
      const msg = error.response?.data?.message || 'An error occurred during resume scanning.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAutoOptimizeWholeResume = async () => {
    if (!resumeData) return;
    setAutoOptimizing(true);
    setErrorMsg('');
    try {
      const response = await API.post('/resumes/optimize-structured', {
        parsedResume: resumeData
      });
      setResumeData(response.data.optimizedResume);
      toast.success('Resume template optimized with AI!');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to auto-optimize resume.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setAutoOptimizing(false);
    }
  };

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
      const ext = uploadedFile.name.split('.').pop().toLowerCase();
      setFileExtension(ext);
    }
  };

  const useSample = () => {
    setPasteText(SAMPLE_RESUME_TEXT);
    setFile(null);
    setErrorMsg('');
    setFileExtension('txt');
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
          'Content-Type': undefined
        }
      });

      const data = response.data;
      setBaseScore(data.atsScore);
      setSuggestions(data.suggestions || []);
      setMissingKeywords(data.missingKeywords || []);
      setHasResult(true);
      setResumeData(data.parsedResume || DEFAULT_STRUCTURED_RESUME);
      setInitialResumeData(data.parsedResume || DEFAULT_STRUCTURED_RESUME);

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
                  onChange={(e) => { setPasteText(e.target.value); setFile(null); setFileExtension('txt'); }}
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
                            <div className="flex flex-col gap-1 w-full text-left">
                              <span className={item.solved ? 'line-through text-lightGray/50' : 'text-lightGray/90'}>
                                {item.text}
                              </span>
                              {!item.solved && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleFixSuggestion(item._id || item.id, item.text);
                                  }}
                                  disabled={fixingSuggestionId !== null}
                                  className="mt-1.5 w-fit px-2 py-0.5 rounded bg-accent/10 border border-accent/25 hover:bg-accent/20 text-[9px] font-bold text-accent transition-all flex items-center gap-1.5 disabled:opacity-50"
                                >
                                  {fixingSuggestionId === (item._id || item.id) ? (
                                    <span className="w-2.5 h-2.5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                                  ) : (
                                    <>
                                      <Sparkles size={9} />
                                      Fix with AI
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
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

        {/* Interactive Resume Editor & AI Auto-Optimizer */}
        {hasResult && resumeData && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 p-6 bg-secondaryBg/45 border border-white/5 rounded-xl space-y-6 text-left"
          >
            <div className="border-b border-white/5 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles size={18} className="text-accent animate-pulse" /> Live Resume Template Editor
                </h3>
                <p className="text-xs text-lightGray/70 mt-1">
                  Build and optimize your resume in real-time. Changes are instantly rendered on the visual A4 sheet preview.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAutoOptimizeWholeResume}
                  disabled={autoOptimizing || analyzing}
                  className="px-4 py-2 bg-accent/20 border border-accent/40 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 hover:bg-accent/30 disabled:opacity-50"
                >
                  {autoOptimizing && <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />}
                  Auto-Optimize with AI
                </button>
                <button
                  onClick={() => {
                    setResumeData(JSON.parse(JSON.stringify(initialResumeData)));
                    toast.success('Editor reset to original parsed structure.');
                  }}
                  disabled={autoOptimizing || analyzing}
                  className="px-4 py-2 bg-white/5 border border-white/5 text-lightGray hover:text-white rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                >
                  Reset Template
                </button>
              </div>
            </div>

            {/* Dual Pane Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              
              {/* Left Pane: Structured Form Editor */}
              <div className="xl:col-span-6 bg-background/30 p-6 rounded-xl border border-white/5 space-y-6">
                {/* Tab buttons */}
                <div className="flex flex-wrap gap-1.5 border-b border-white/5 pb-3">
                  {[
                    { id: 'contact', label: 'Contact & Summary' },
                    { id: 'skills', label: 'Skills' },
                    { id: 'experience', label: 'Experience' },
                    { id: 'projects', label: 'Projects' },
                    { id: 'education', label: 'Education' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setEditorTab(tab.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                        editorTab === tab.id
                          ? 'bg-white text-background border-white'
                          : 'bg-white/5 text-lightGray hover:text-white border-white/5'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Contents */}
                <div className="space-y-4 min-h-[350px]">
                  
                  {/* Contact Tab */}
                  {editorTab === 'contact' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-lightGray/50 uppercase mb-1">Name</label>
                          <input
                            type="text"
                            value={resumeData.name || ''}
                            onChange={(e) => setResumeData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full bg-background/50 text-white rounded-lg p-2.5 text-xs border border-white/5 focus:outline-none focus:border-accent/40"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-lightGray/50 uppercase mb-1">Email</label>
                          <input
                            type="email"
                            value={resumeData.email || ''}
                            onChange={(e) => setResumeData(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full bg-background/50 text-white rounded-lg p-2.5 text-xs border border-white/5 focus:outline-none focus:border-accent/40"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-lightGray/50 uppercase mb-1">Phone</label>
                          <input
                            type="text"
                            value={resumeData.phone || ''}
                            onChange={(e) => setResumeData(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full bg-background/50 text-white rounded-lg p-2.5 text-xs border border-white/5 focus:outline-none focus:border-accent/40"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-lightGray/50 uppercase mb-1">Website / GitHub / LinkedIn</label>
                          <input
                            type="text"
                            value={resumeData.website || ''}
                            onChange={(e) => setResumeData(prev => ({ ...prev, website: e.target.value }))}
                            className="w-full bg-background/50 text-white rounded-lg p-2.5 text-xs border border-white/5 focus:outline-none focus:border-accent/40"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-lightGray/50 uppercase mb-1">Professional Summary</label>
                        <textarea
                          value={resumeData.summary || ''}
                          onChange={(e) => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
                          className="w-full h-32 bg-background/50 text-white rounded-lg p-3 text-xs border border-white/5 focus:outline-none focus:border-accent/40 font-sans resize-none leading-relaxed"
                        />
                      </div>
                    </div>
                  )}

                  {/* Skills Tab */}
                  {editorTab === 'skills' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-lightGray/50 uppercase mb-1">Technical Skills & Technologies</label>
                        <p className="text-[10px] text-lightGray/40 mb-3">Add skills to target key industry standard terms.</p>
                        
                        {/* Skills List tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {(resumeData.skills || []).map((skill, index) => (
                            <span
                              key={index}
                              className="px-2.5 py-1 rounded bg-accent/10 border border-accent/20 text-xs text-accent flex items-center gap-1.5"
                            >
                              {skill}
                              <button
                                type="button"
                                onClick={() => setResumeData(prev => ({
                                  ...prev,
                                  skills: prev.skills.filter((_, i) => i !== index)
                                }))}
                                className="text-accent/60 hover:text-accent font-bold"
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>

                        {/* Add Skill input */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. TypeScript, System Design"
                            id="skillInput"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const val = e.target.value.trim();
                                if (val && !(resumeData.skills || []).includes(val)) {
                                  setResumeData(prev => ({
                                    ...prev,
                                    skills: [...(prev.skills || []), val]
                                  }));
                                  e.target.value = '';
                                }
                              }
                            }}
                            className="flex-1 bg-background/50 text-white rounded-lg p-2.5 text-xs border border-white/5 focus:outline-none focus:border-accent/40"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const input = document.getElementById('skillInput');
                              const val = input.value.trim();
                              if (val && !(resumeData.skills || []).includes(val)) {
                                setResumeData(prev => ({
                                  ...prev,
                                  skills: [...(prev.skills || []), val]
                                }));
                                input.value = '';
                              }
                            }}
                            className="px-4 bg-white text-background font-bold text-xs rounded-lg hover:bg-lightGray transition-all"
                          >
                            Add Skill
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Experience Tab */}
                  {editorTab === 'experience' && (
                    <div className="space-y-6 max-h-[450px] overflow-y-auto pr-2">
                      {(resumeData.experience || []).map((exp, expIdx) => (
                        <div key={expIdx} className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-3 relative">
                          <button
                            type="button"
                            onClick={() => setResumeData(prev => ({
                              ...prev,
                              experience: prev.experience.filter((_, i) => i !== expIdx)
                            }))}
                            className="absolute top-3 right-3 text-lightGray/40 hover:text-red-400 text-xs font-bold"
                          >
                            Remove
                          </button>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[9px] font-bold text-lightGray/50 uppercase mb-0.5">Role Title</label>
                              <input
                                type="text"
                                value={exp.role || ''}
                                onChange={(e) => {
                                  const updated = [...resumeData.experience];
                                  updated[expIdx].role = e.target.value;
                                  setResumeData(prev => ({ ...prev, experience: updated }));
                                }}
                                className="w-full bg-background/50 text-white rounded-lg p-2 text-xs border border-white/5 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-lightGray/50 uppercase mb-0.5">Company Name</label>
                              <input
                                type="text"
                                value={exp.company || ''}
                                onChange={(e) => {
                                  const updated = [...resumeData.experience];
                                  updated[expIdx].company = e.target.value;
                                  setResumeData(prev => ({ ...prev, experience: updated }));
                                }}
                                className="w-full bg-background/50 text-white rounded-lg p-2 text-xs border border-white/5 focus:outline-none"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-lightGray/50 uppercase mb-0.5">Dates / Duration</label>
                            <input
                              type="text"
                              value={exp.dates || ''}
                              onChange={(e) => {
                                const updated = [...resumeData.experience];
                                updated[expIdx].dates = e.target.value;
                                setResumeData(prev => ({ ...prev, experience: updated }));
                              }}
                              className="w-full bg-background/50 text-white rounded-lg p-2 text-xs border border-white/5 focus:outline-none"
                            />
                          </div>

                          {/* Experience Bullets */}
                          <div className="space-y-1.5">
                            <label className="block text-[9px] font-bold text-lightGray/50 uppercase mb-0.5">Bullet Points</label>
                            {(exp.bullets || []).map((bullet, bulletIdx) => (
                              <div key={bulletIdx} className="flex gap-2 items-center">
                                <textarea
                                  value={bullet}
                                  onChange={(e) => {
                                    const updated = [...resumeData.experience];
                                    updated[expIdx].bullets[bulletIdx] = e.target.value;
                                    setResumeData(prev => ({ ...prev, experience: updated }));
                                  }}
                                  className="flex-1 bg-background/30 text-white rounded-lg p-2 text-xs border border-white/5 focus:outline-none resize-none h-12 leading-relaxed"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...resumeData.experience];
                                    updated[expIdx].bullets = updated[expIdx].bullets.filter((_, i) => i !== bulletIdx);
                                    setResumeData(prev => ({ ...prev, experience: updated }));
                                  }}
                                  className="text-lightGray/40 hover:text-red-400 font-bold"
                                >
                                  &times;
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...resumeData.experience];
                                updated[expIdx].bullets = [...(updated[expIdx].bullets || []), ""];
                                setResumeData(prev => ({ ...prev, experience: updated }));
                              }}
                              className="mt-1 text-[10px] text-accent hover:underline font-semibold"
                            >
                              + Add Bullet Point
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setResumeData(prev => ({
                          ...prev,
                          experience: [...(prev.experience || []), { role: '', company: '', dates: '', bullets: [''] }]
                        }))}
                        className="w-full py-2 bg-white/5 border border-dashed border-white/10 hover:border-white/20 text-white rounded-lg text-xs font-semibold transition-all text-center"
                      >
                        + Add Work Experience Card
                      </button>
                    </div>
                  )}

                  {/* Projects Tab */}
                  {editorTab === 'projects' && (
                    <div className="space-y-6 max-h-[450px] overflow-y-auto pr-2">
                      {(resumeData.projects || []).map((proj, projIdx) => (
                        <div key={projIdx} className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-3 relative">
                          <button
                            type="button"
                            onClick={() => setResumeData(prev => ({
                              ...prev,
                              projects: prev.projects.filter((_, i) => i !== projIdx)
                            }))}
                            className="absolute top-3 right-3 text-lightGray/40 hover:text-red-400 text-xs font-bold"
                          >
                            Remove
                          </button>
                          
                          <div>
                            <label className="block text-[9px] font-bold text-lightGray/50 uppercase mb-0.5">Project Title</label>
                            <input
                              type="text"
                              value={proj.title || ''}
                              onChange={(e) => {
                                const updated = [...resumeData.projects];
                                updated[projIdx].title = e.target.value;
                                setResumeData(prev => ({ ...prev, projects: updated }));
                              }}
                              className="w-full bg-background/50 text-white rounded-lg p-2 text-xs border border-white/5 focus:outline-none"
                            />
                          </div>

                          {/* Project Bullets */}
                          <div className="space-y-1.5">
                            <label className="block text-[9px] font-bold text-lightGray/50 uppercase mb-0.5">Project Details / Bullets</label>
                            {(proj.bullets || []).map((bullet, bulletIdx) => (
                              <div key={bulletIdx} className="flex gap-2 items-center">
                                <textarea
                                  value={bullet}
                                  onChange={(e) => {
                                    const updated = [...resumeData.projects];
                                    updated[projIdx].bullets[bulletIdx] = e.target.value;
                                    setResumeData(prev => ({ ...prev, projects: updated }));
                                  }}
                                  className="flex-1 bg-background/30 text-white rounded-lg p-2 text-xs border border-white/5 focus:outline-none resize-none h-12 leading-relaxed"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...resumeData.projects];
                                    updated[projIdx].bullets = updated[projIdx].bullets.filter((_, i) => i !== bulletIdx);
                                    setResumeData(prev => ({ ...prev, projects: updated }));
                                  }}
                                  className="text-lightGray/40 hover:text-red-400 font-bold"
                                >
                                  &times;
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...resumeData.projects];
                                updated[projIdx].bullets = [...(updated[projIdx].bullets || []), ""];
                                setResumeData(prev => ({ ...prev, projects: updated }));
                              }}
                              className="mt-1 text-[10px] text-accent hover:underline font-semibold"
                            >
                              + Add Bullet Point
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setResumeData(prev => ({
                          ...prev,
                          projects: [...(prev.projects || []), { title: '', bullets: [''] }]
                        }))}
                        className="w-full py-2 bg-white/5 border border-dashed border-white/10 hover:border-white/20 text-white rounded-lg text-xs font-semibold transition-all text-center"
                      >
                        + Add Project Card
                      </button>
                    </div>
                  )}

                  {/* Education Tab */}
                  {editorTab === 'education' && (
                    <div className="space-y-6 max-h-[450px] overflow-y-auto pr-2">
                      {(resumeData.education || []).map((edu, eduIdx) => (
                        <div key={eduIdx} className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-3 relative">
                          <button
                            type="button"
                            onClick={() => setResumeData(prev => ({
                              ...prev,
                              education: prev.education.filter((_, i) => i !== eduIdx)
                            }))}
                            className="absolute top-3 right-3 text-lightGray/40 hover:text-red-400 text-xs font-bold"
                          >
                            Remove
                          </button>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[9px] font-bold text-lightGray/50 uppercase mb-0.5">Degree / Course</label>
                              <input
                                type="text"
                                value={edu.degree || ''}
                                onChange={(e) => {
                                  const updated = [...resumeData.education];
                                  updated[eduIdx].degree = e.target.value;
                                  setResumeData(prev => ({ ...prev, education: updated }));
                                }}
                                className="w-full bg-background/50 text-white rounded-lg p-2 text-xs border border-white/5 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-lightGray/50 uppercase mb-0.5">School / University</label>
                              <input
                                type="text"
                                value={edu.school || ''}
                                onChange={(e) => {
                                  const updated = [...resumeData.education];
                                  updated[eduIdx].school = e.target.value;
                                  setResumeData(prev => ({ ...prev, education: updated }));
                                }}
                                className="w-full bg-background/50 text-white rounded-lg p-2 text-xs border border-white/5 focus:outline-none"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-lightGray/50 uppercase mb-0.5">Graduation Date</label>
                            <input
                              type="text"
                              value={edu.dates || ''}
                              onChange={(e) => {
                                const updated = [...resumeData.education];
                                updated[eduIdx].dates = e.target.value;
                                setResumeData(prev => ({ ...prev, education: updated }));
                              }}
                              className="w-full bg-background/50 text-white rounded-lg p-2 text-xs border border-white/5 focus:outline-none"
                            />
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setResumeData(prev => ({
                          ...prev,
                          education: [...(prev.education || []), { degree: '', school: '', dates: '' }]
                        }))}
                        className="w-full py-2 bg-white/5 border border-dashed border-white/10 hover:border-white/20 text-white rounded-lg text-xs font-semibold transition-all text-center"
                      >
                        + Add Education Card
                      </button>
                    </div>
                  )}

                </div>
              </div>

              {/* Right Pane: Live A4 Visual Sheet Preview */}
              <div className="xl:col-span-6 bg-slate-900 border border-white/5 p-4 rounded-xl flex flex-col justify-start overflow-hidden">
                <span className="text-[10px] font-bold text-lightGray/50 uppercase tracking-widest mb-3 block">Live Sheet Preview</span>
                
                {/* Sheet container */}
                <div className="w-full bg-white text-slate-800 p-8 rounded shadow-2xl font-sans min-h-[500px] border border-slate-300 text-left scale-[0.98] origin-top overflow-y-auto leading-relaxed max-h-[550px]">
                  
                  {/* Header */}
                  <div className="text-center pb-4 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900 leading-none mb-1">{resumeData.name || "Candidate Name"}</h2>
                    <p className="text-[9px] text-slate-500 font-mono tracking-wide">
                      {[resumeData.email, resumeData.phone, resumeData.website].filter(Boolean).join(" | ")}
                    </p>
                  </div>

                  {/* Summary */}
                  {resumeData.summary && (
                    <div className="mt-4">
                      <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-0.5">Professional Summary</h3>
                      <p className="text-[9px] text-slate-600 mt-1.5 font-sans leading-relaxed">{resumeData.summary}</p>
                    </div>
                  )}

                  {/* Skills */}
                  {resumeData.skills && resumeData.skills.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-0.5">Technical Skills</h3>
                      <p className="text-[9px] text-slate-600 mt-1.5 font-mono leading-relaxed">
                        {resumeData.skills.join(", ")}
                      </p>
                    </div>
                  )}

                  {/* Experience */}
                  {resumeData.experience && resumeData.experience.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-0.5">Work Experience</h3>
                      <div className="space-y-3 mt-2">
                        {resumeData.experience.map((exp, index) => (
                          <div key={index} className="space-y-0.5">
                            <div className="flex justify-between items-center text-[9px] font-bold text-slate-800">
                              <span>{exp.role || "Role"}</span>
                              <span className="font-normal text-slate-500">{exp.dates}</span>
                            </div>
                            <div className="text-[9px] italic text-slate-500 leading-none">{exp.company}</div>
                            {exp.bullets && (
                              <ul className="list-disc pl-3 text-[8.5px] text-slate-600 space-y-0.5 mt-1 font-sans leading-relaxed">
                                {exp.bullets.map((b, bIdx) => (
                                  <li key={bIdx}>{b}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Projects */}
                  {resumeData.projects && resumeData.projects.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-0.5">Key Projects</h3>
                      <div className="space-y-3 mt-2">
                        {resumeData.projects.map((proj, index) => (
                          <div key={index} className="space-y-0.5">
                            <div className="text-[9px] font-bold text-slate-800">{proj.title || "Project Title"}</div>
                            {proj.bullets && (
                              <ul className="list-disc pl-3 text-[8.5px] text-slate-600 space-y-0.5 mt-1 font-sans leading-relaxed">
                                {proj.bullets.map((b, bIdx) => (
                                  <li key={bIdx}>{b}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {resumeData.education && resumeData.education.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-0.5">Education</h3>
                      <div className="space-y-2 mt-2">
                        {resumeData.education.map((edu, index) => (
                          <div key={index} className="flex justify-between items-start text-[9px] text-slate-800">
                            <div>
                              <div className="font-bold">{edu.degree || "Degree"}</div>
                              <div className="text-slate-500 leading-none mt-0.5">{edu.school}</div>
                            </div>
                            <div className="text-slate-500 font-normal text-[8.5px]">{edu.dates}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="border-t border-white/5 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <button
                type="button"
                onClick={handleDownloadResume}
                disabled={autoOptimizing || analyzing}
                className="px-4 py-2.5 bg-white/5 border border-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                Download Optimized Resume (.{fileExtension})
              </button>
              <button
                type="button"
                onClick={handleRescanEditedText}
                disabled={analyzing || autoOptimizing}
                className="px-6 py-3 bg-white text-background hover:bg-lightGray font-black uppercase tracking-wider rounded-lg disabled:opacity-45 transition-all text-xs sm:text-sm flex items-center gap-1.5 shadow-lg"
              >
                {analyzing ? 'Re-scanning...' : 'Scan Edited Template & Update Score'}
              </button>
            </div>

          </motion.div>
        )}

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
