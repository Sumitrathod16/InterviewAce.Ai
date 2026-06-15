import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Cpu, Award, ThumbsUp, HelpCircle, ArrowRight, RefreshCw, AlertCircle, Mic, MicOff } from 'lucide-react';
import confetti from 'canvas-confetti';

const QUESTIONS_DATA = {
  hr: [
    {
      id: 1,
      question: "Tell me about a time you had a conflict with a teammate and how you resolved it.",
      ideal: "A strong response uses the STAR method (Situation, Task, Action, Result). It focuses on open communication, active listening, separating personality from technical problems, and reaching a win-win compromise.",
      keywords: ["conflict", "communication", "listen", "compromise", "star method"]
    },
    {
      id: 2,
      question: "Why do you want to join our company, and where do you see your career heading in the next 5 years?",
      ideal: "A strong response links the company's mission and product space to the candidate's personal growth goals. Focus on technical skill acquisition, taking ownership of initiatives, and long-term impact.",
      keywords: ["mission", "growth", "career", "ownership", "align"]
    }
  ],
  frontend: [
    {
      id: 1,
      question: "Explain the React Component Lifecycle (or React Hooks dependencies) and how you optimize rendering performance in a heavy UI application.",
      ideal: "Focus on preventing unnecessary re-renders using React.memo, useMemo, and useCallback. Discuss virtualization for long lists, debouncing event listeners, and code-splitting with React.lazy.",
      keywords: ["memo", "useMemo", "useCallback", "render", "virtualization"]
    },
    {
      id: 2,
      question: "Explain client-side rendering (CSR) vs. server-side rendering (SSR). What are the SEO and performance tradeoffs?",
      ideal: "CSR loads a minimal HTML file and downloads a large JS bundle, resulting in slower First Contentful Paint (FCP) but faster transitions. SSR renders HTML on the server, resulting in faster FCP and better SEO indexing, but higher server load.",
      keywords: ["csr", "ssr", "seo", "first contentful paint", "server load"]
    }
  ],
  backend: [
    {
      id: 1,
      question: "How would you design a rate limiter for a public API that receives 100,000 requests per minute? Which algorithm and data store would you use?",
      ideal: "Propose Token Bucket or Leaky Bucket. Recommend Redis for low-latency key value storage. Utilize Redis sorted sets or transaction blocks to handle concurrency and sliding window limits.",
      keywords: ["redis", "token bucket", "rate limiter", "latency", "sliding window"]
    },
    {
      id: 2,
      question: "What is database normalization, and when would you choose to denormalize your database schema?",
      ideal: "Normalization reduces data redundancy and ensures integrity (up to 3NF). Denormalization is chosen to optimize read performance in read-heavy applications, preventing expensive JOIN operations.",
      keywords: ["redundancy", "normalization", "denormalize", "join", "read performance"]
    }
  ]
};

export default function MockInterviewDemo({ onInterviewComplete }) {
  const [selectedTrack, setSelectedTrack] = useState('hr');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [chatHistory, setChatHistory] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  // Feedback panel states
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null);

  const messagesEndRef = useRef(null);

  const tracks = [
    { id: 'hr', name: 'HR Behavioral' },
    { id: 'frontend', name: 'Frontend Technical' },
    { id: 'backend', name: 'Backend Technical' }
  ];

  const questions = QUESTIONS_DATA[selectedTrack];
  const activeQuestion = questions[currentQuestionIndex];

  // Initialize first question
  useEffect(() => {
    resetInterview(selectedTrack);
  }, [selectedTrack]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isThinking]);

  const resetInterview = (track) => {
    const initialQuestions = QUESTIONS_DATA[track];
    setChatHistory([
      {
        sender: 'ai',
        text: `Welcome to your mock interview session. I will be your interviewer today. Let's begin. Here is your first question:`,
        isSystem: true
      },
      {
        sender: 'ai',
        text: initialQuestions[0].question,
        isQuestion: true
      }
    ]);
    setCurrentQuestionIndex(0);
    setInputValue('');
    setIsThinking(false);
    setIsCompleted(false);
    setShowFeedback(false);
    setCurrentFeedback(null);
    setIsRecording(false);
  };

  const handleSend = () => {
    if (!inputValue.trim() || isThinking || isCompleted) return;

    const userText = inputValue;
    setInputValue('');

    // Append candidate response
    setChatHistory(prev => [...prev, { sender: 'candidate', text: userText }]);
    setIsThinking(true);
    setShowFeedback(false);

    // Simulate AI feedback review
    setTimeout(() => {
      // Simple review heuristics based on response length and keyword matching
      const score = Math.min(60 + Math.floor(Math.random() * 25) + (userText.length > 120 ? 10 : 0), 98);
      const matchedKeywords = activeQuestion.keywords.filter(kw => userText.toLowerCase().includes(kw));
      
      const strengths = [];
      const improvements = [];

      if (userText.length > 150) {
        strengths.push("Good descriptive depth and detail in your answer.");
      } else {
        improvements.push("Elaborate further with structured scenarios (try the STAR format).");
      }

      if (matchedKeywords.length >= 2) {
        strengths.push(`Excellent usage of core technical terms: ${matchedKeywords.join(', ')}.`);
      } else {
        improvements.push(`Incorporate more domain terms like: ${activeQuestion.keywords.slice(0, 2).join(', ')}.`);
      }

      if (userText.length > 50 && strengths.length === 0) {
        strengths.push("Clear vocabulary and structure.");
      }

      if (strengths.length === 0) strengths.push("Polite and prompt response.");
      if (improvements.length === 0) improvements.push("Provide concrete numerical results of your action.");

      const feedback = {
        score,
        communicationScore: Math.min(score + 3, 100),
        contentScore: Math.min(score - 4, 100),
        strengths,
        improvements,
        idealAnswer: activeQuestion.ideal
      };

      setCurrentFeedback(feedback);
      setIsThinking(false);
      setShowFeedback(true);

      // Append AI review response
      setChatHistory(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `Thank you for your answer. I have analyzed your response. Review the scorecard panel for details.`,
          isFeedbackTrigger: true
        }
      ]);
    }, 1500);
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    setCurrentFeedback(null);

    if (currentQuestionIndex + 1 < questions.length) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setChatHistory(prev => [
        ...prev,
        {
          sender: 'ai',
          text: questions[nextIndex].question,
          isQuestion: true
        }
      ]);
    } else {
      setIsCompleted(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#FFFFFF', '#64748B', '#1E293B']
      });

      // Fire callback if present
      if (onInterviewComplete && currentFeedback) {
        let typeStr = 'HR Behavioral';
        if (selectedTrack === 'frontend') typeStr = 'Frontend Technical';
        if (selectedTrack === 'backend') typeStr = 'Backend Technical';
        
        onInterviewComplete({
          type: typeStr,
          title: `Practice Round (${selectedTrack.toUpperCase()})`,
          score: currentFeedback.score
        });
      }

      setChatHistory(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `Congratulations! You have completed the mock interview. You can view your final analysis on the dashboard preview below.`,
          isCompleted: true
        }
      ]);
    }
  };

  const toggleVoiceDictation = () => {
    if (isThinking || isCompleted) return;

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'en-US';

        rec.onstart = () => {
          setIsRecording(true);
          setInputValue('');
        };
        rec.onresult = (e) => {
          const resultStr = e.results[0][0].transcript;
          setInputValue(resultStr);
        };
        rec.onerror = () => {
          setIsRecording(false);
        };
        rec.onend = () => {
          setIsRecording(false);
        };
        rec.start();
      } catch (err) {
        setIsRecording(false);
      }
    } else {
      // Offline Simulated Speech-to-Text Fallback
      setIsRecording(true);
      setInputValue('Recording dictation...');
      setTimeout(() => {
        const samples = {
          hr: "I optimize resolution in team conflict scenarios by arranging 1-on-1 dialogue sessions, isolating subjective opinions from product objectives, and agreeing on data metrics to drive compromise.",
          frontend: "I prevent render cascades by caching components via memoization libraries, loading viewport listings dynamically using virtualization, and structuring dependency chains for hooks.",
          backend: "I design rate limits using sliding windows, storing counters inside latency-optimized Redis caching keys, and dropping requests immediately with standard server headers."
        };
        setInputValue(samples[selectedTrack] || "Simulated spoken technical speech.");
        setIsRecording(false);
      }, 3000);
    }
  };

  return (
    <section id="demo" className="py-24 bg-background border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
            Try the AI Interview Simulator
          </h2>
          <p className="text-lg text-lightGray/70">
            Choose your career track, chat with the AI interviewer, and receive real-time granular feedback.
          </p>
        </div>

        {/* Tracks Selector */}
        <div className="flex justify-center gap-3 mb-10">
          {tracks.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedTrack(t.id)}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg border transition-all duration-300 ${
                selectedTrack === t.id 
                  ? 'bg-white text-background border-white' 
                  : 'bg-secondaryBg/40 text-lightGray border-white/5 hover:border-white/20'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>

        {/* Interface Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Chat Window */}
          <div className="lg:col-span-7 flex flex-col h-[520px] rounded-xl glassmorphism premium-border overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/5 bg-secondaryBg/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-bold text-white uppercase tracking-wider">AI Interviewer</span>
              </div>
              <button 
                onClick={() => resetInterview(selectedTrack)}
                className="text-xs text-lightGray/60 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw size={12} />
                Restart
              </button>
            </div>

            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${msg.sender === 'candidate' ? 'flex-row-reverse' : ''}`}
                >
                  {/* Icon */}
                  <div className={`p-2 rounded-lg flex-shrink-0 ${
                    msg.sender === 'ai' ? 'bg-white/5 text-white' : 'bg-white text-background'
                  }`}>
                    {msg.sender === 'ai' ? <Cpu size={16} /> : <User size={16} />}
                  </div>

                  {/* Bubble */}
                  <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                    msg.sender === 'ai'
                      ? 'bg-secondaryBg/30 text-lightGray border border-white/5'
                      : 'bg-white/10 text-white'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {isThinking && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white/5 text-white rounded-lg flex-shrink-0">
                    <Cpu size={16} />
                  </div>
                  <div className="bg-secondaryBg/30 rounded-xl px-5 py-3 text-sm text-lightGray border border-white/5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-4 border-t border-white/5 bg-secondaryBg/20">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-center gap-3"
              >
                {/* Audio wave indicator overlay */}
                {isRecording ? (
                  <div className="flex-1 bg-white/5 rounded-lg px-4 py-3 text-xs text-white flex items-center justify-between border border-white/10 font-mono">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      Listening to your voice dictation...
                    </div>
                    {/* CSS Audio Wave */}
                    <div className="flex items-end gap-0.5 h-4">
                      <span className="w-0.5 h-2.5 bg-white rounded-full animate-bounce [animation-duration:0.6s]" />
                      <span className="w-0.5 h-4 bg-white rounded-full animate-bounce [animation-duration:0.4s]" />
                      <span className="w-0.5 h-3 bg-white rounded-full animate-bounce [animation-duration:0.5s]" />
                      <span className="w-0.5 h-1 bg-white rounded-full animate-bounce [animation-duration:0.3s]" />
                    </div>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={isCompleted ? "Interview completed" : "Type response or click mic to dictate..."}
                    disabled={isThinking || isCompleted}
                    className="flex-1 bg-background/60 text-white rounded-lg px-4 py-3 text-sm border border-white/5 focus:outline-none focus:border-white/30 transition-all font-sans placeholder-lightGray/40 disabled:opacity-50"
                  />
                )}

                {/* Mic Toggle Button */}
                <button
                  type="button"
                  onClick={toggleVoiceDictation}
                  disabled={isThinking || isCompleted}
                  className={`p-3 rounded-lg border transition-all ${
                    isRecording 
                      ? 'bg-red-950/45 text-red-400 border-red-900/60' 
                      : 'bg-white/5 text-lightGray border-white/5 hover:text-white hover:bg-white/10'
                  }`}
                  title="Speech-to-text dictation"
                >
                  {isRecording ? <MicOff size={16} className="animate-pulse" /> : <Mic size={16} />}
                </button>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isThinking || isCompleted || isRecording}
                  className="p-3 bg-white text-background hover:bg-lightGray rounded-lg disabled:opacity-50 transition-all"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>

          {/* AI Scorecard & Evaluation Panel */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <AnimatePresence mode="wait">
              {showFeedback && currentFeedback ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-secondaryBg/40 border border-white/5 rounded-xl p-6 h-full flex flex-col justify-between space-y-6"
                >
                  {/* Scores Heading */}
                  <div>
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <Award size={18} className="text-white" />
                        <span className="text-sm font-bold text-white uppercase tracking-wider">Evaluation Scorecard</span>
                      </div>
                      <div className="text-2xl font-black text-white">{currentFeedback.score}%</div>
                    </div>

                    {/* Score Gauges */}
                    <div className="space-y-3 mb-6">
                      <div>
                        <div className="flex justify-between text-xs text-lightGray/60 mb-1">
                          <span>Communication & Structure</span>
                          <span>{currentFeedback.communicationScore}%</span>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-white" style={{ width: `${currentFeedback.communicationScore}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-lightGray/60 mb-1">
                          <span>Technical Depth / Logic</span>
                          <span>{currentFeedback.contentScore}%</span>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-accent" style={{ width: `${currentFeedback.contentScore}%` }} />
                        </div>
                      </div>
                    </div>

                    {/* Strengths & Improvements */}
                    <div className="space-y-4">
                      {/* Strengths */}
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <ThumbsUp size={12} /> Key Strengths
                        </h4>
                        <ul className="space-y-1.5">
                          {currentFeedback.strengths.map((str, idx) => (
                            <li key={idx} className="text-xs text-lightGray/70 flex items-start gap-1.5">
                              <span className="text-white mt-0.5">•</span>
                              {str}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Improvements */}
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <AlertCircle size={12} /> Improvement Areas
                        </h4>
                        <ul className="space-y-1.5">
                          {currentFeedback.improvements.map((imp, idx) => (
                            <li key={idx} className="text-xs text-lightGray/70 flex items-start gap-1.5">
                              <span className="text-white mt-0.5">•</span>
                              {imp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* CTAs */}
                  <button
                    onClick={handleNextQuestion}
                    className="w-full py-3 bg-white text-background hover:bg-lightGray rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2"
                  >
                    {currentQuestionIndex + 1 < questions.length ? 'Next Question' : 'Complete Interview'}
                    <ArrowRight size={16} />
                  </button>
                </motion.div>
              ) : (
                <div className="bg-secondaryBg/20 border border-white/5 rounded-xl p-6 h-full flex flex-col justify-center items-center text-center space-y-4">
                  <div className="p-4 bg-white/5 rounded-full text-lightGray mb-2">
                    <HelpCircle size={32} className="stroke-[1.5]" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Awaiting Candidate Answer</h3>
                  <p className="text-sm text-lightGray/50 max-w-xs leading-relaxed">
                    Type your response to the question in the chat interface and click submit to trigger AI analysis and scorecard reports.
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
