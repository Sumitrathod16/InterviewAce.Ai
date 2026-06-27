import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Cpu, Award, ThumbsUp, HelpCircle, ArrowRight, RefreshCw, AlertCircle, Mic, MicOff, Volume2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function MockInterviewDemo({ onInterviewComplete }) {
  const { userProfile } = useAuth();
  
  const [selectedTrack, setSelectedTrack] = useState('hr');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [chatHistory, setChatHistory] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [activeInterview, setActiveInterview] = useState(null);
  
  // Feedback panel states
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [questionCount, setQuestionCount] = useState(3);

  const messagesEndRef = useRef(null);

  const tracks = [
    { id: 'hr', name: 'HR Behavioral' },
    { id: 'frontend', name: 'Frontend Technical' },
    { id: 'backend', name: 'Backend Technical' }
  ];

  useEffect(() => {
    resetInterview(selectedTrack);
  }, [selectedTrack]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isThinking]);

  // Audio Playback: Browser SpeechSynthesis
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Clean up text format
      const clean = text.replace(/[^a-zA-Z0-9\s.,?]/g, '');
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const resetInterview = async (track) => {
    setErrorMsg('');
    setIsThinking(false);
    setIsCompleted(false);
    setShowFeedback(false);
    setCurrentFeedback(null);
    setIsRecording(false);
    setActiveInterview(null);
    setInputValue('');

    setChatHistory([
      {
        sender: 'ai',
        text: `Initializing AI Interview Simulator for ${track.toUpperCase()} round. Connecting to Gemini evaluation server...`,
        isSystem: true
      }
    ]);
  };

  const startInterviewSession = async () => {
    if (!userProfile) {
      setErrorMsg('Please sign in to take a mock interview.');
      return;
    }

    setIsThinking(true);
    setErrorMsg('');

    try {
      const response = await API.post('/interviews/start', {
        type: selectedTrack === 'hr' ? 'HR Behavioral' : 'Technical',
        track: selectedTrack === 'hr' ? 'HR Behavioral' : `${selectedTrack.charAt(0).toUpperCase() + selectedTrack.slice(1)} Technical`,
        count: questionCount
      });

      const session = response.data;
      setActiveInterview(session);
      setCurrentQuestionIndex(0);

      const firstQuestion = session.questions[0];

      setChatHistory([
        {
          sender: 'ai',
          text: `Welcome, ${userProfile.name}. I am your AI interviewer today. Let's begin the evaluation.`,
          isSystem: true
        },
        {
          sender: 'ai',
          text: firstQuestion,
          isQuestion: true
        }
      ]);

      // Automatically speak first question
      speakText(firstQuestion);
    } catch (err) {
      console.error('Error starting interview session:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to start interview session. Ensure backend is running.');
      
      // Local offline fallback questions
      const localQs = {
        hr: [
          "Tell me about a time you had a conflict with a teammate and how you resolved it.",
          "Why do you want to join our company, and where do you see your career heading in 5 years?"
        ],
        frontend: [
          "Explain the React Component Lifecycle and how you optimize rendering speed.",
          "Explain CSR vs SSR. What are SEO and performance trade-offs?"
        ],
        backend: [
          "How would you design a rate limiter for an API receiving 100k requests/min?",
          "What is database normalization, and when would you denormalize?"
        ]
      };
      
      const qList = localQs[selectedTrack];
      setChatHistory([
        { sender: 'ai', text: 'Running in developer fallback mode.', isSystem: true },
        { sender: 'ai', text: qList[0], isQuestion: true }
      ]);
      speakText(qList[0]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isThinking || isCompleted) return;

    const userText = inputValue;
    setInputValue('');

    // Append candidate response to chat
    setChatHistory(prev => [...prev, { sender: 'candidate', text: userText }]);
    setIsThinking(true);
    setShowFeedback(false);
    setErrorMsg('');

    // 1. Local offline mock evaluations if active session is missing
    if (!activeInterview) {
      setTimeout(() => {
        setIsThinking(false);
        const matched = ['communication', 'performance', 'star', 'conflict'].filter(k => userText.toLowerCase().includes(k));
        const score = Math.min(65 + Math.floor(Math.random() * 20) + (userText.length > 100 ? 10 : 0), 98);
        const mockEval = {
          score,
          communicationScore: score + 2,
          contentScore: score - 3,
          strengths: ['Direct communication style.', 'Good examples provided.'],
          improvements: ['Incorporate more structured metrics.', 'Try using the STAR format.'],
          idealAnswer: 'Ideally, explain the technical variables and list optimization results.',
          starRating: selectedTrack === 'hr' ? {
            situation: Math.min(60 + Math.floor(Math.random() * 40), 100),
            task: Math.min(60 + Math.floor(Math.random() * 40), 100),
            action: Math.min(60 + Math.floor(Math.random() * 40), 100),
            result: Math.min(45 + Math.floor(Math.random() * 55), 100)
          } : undefined
        };
        setCurrentFeedback(mockEval);
        setShowFeedback(true);
        setChatHistory(prev => [...prev, { sender: 'ai', text: 'Response analyzed. Scorecard updated.', isFeedbackTrigger: true }]);
      }, 1000);
      return;
    }

    // 2. Real API answer evaluation
    try {
      const response = await API.post(`/interviews/${activeInterview._id}/submit-answer`, {
        answer: userText
      });

      const { evaluation, completed, overallScore } = response.data;
      setCurrentFeedback(evaluation);
      setShowFeedback(true);

      setChatHistory(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `Thank you. I have analyzed your response. Review the scorecard on the right for feedback.`,
          isFeedbackTrigger: true
        }
      ]);
    } catch (err) {
      console.error('Error submitting answer:', err);
      setErrorMsg('Failed to verify answer with server.');
      setIsThinking(false);
    }
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    setCurrentFeedback(null);

    const nextIndex = currentQuestionIndex + 1;
    const questionsList = activeInterview ? activeInterview.questions : [];
    
    // Fallback counts if offline
    const totalQs = activeInterview ? questionsList.length : 2;

    if (nextIndex < totalQs) {
      setCurrentQuestionIndex(nextIndex);
      const nextQ = activeInterview ? questionsList[nextIndex] : "Provide another explanation of your technical stack.";
      
      setChatHistory(prev => [
        ...prev,
        {
          sender: 'ai',
          text: nextQ,
          isQuestion: true
        }
      ]);
      
      speakText(nextQ);
    } else {
      setIsCompleted(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#FFFFFF', '#38BDF8', '#0F172A']
      });

      if (onInterviewComplete && currentFeedback) {
        onInterviewComplete({
          type: selectedTrack === 'hr' ? 'HR Behavioral' : 'Technical',
          title: `${selectedTrack.toUpperCase()} Practice`,
          score: currentFeedback.score
        });
      }

      setChatHistory(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `Congratulations! You have completed the mock interview. You can view your final analysis reports in your profile workspace dashboard.`,
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
      // offline/simulated fallback voice dictation
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

  const activeQuestion = activeInterview 
    ? activeInterview.questions[currentQuestionIndex] 
    : chatHistory.filter(c => c.isQuestion).pop()?.text || "Click 'Start Interview' to load first question.";

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

        {/* Tracks Selector & Question Count Selector */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-10">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-lightGray/40 uppercase tracking-wider">Select Track:</span>
            <div className="flex gap-2">
              {tracks.map(t => (
                <button
                  key={t.id}
                  disabled={activeInterview !== null}
                  onClick={() => setSelectedTrack(t.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-300 ${
                    selectedTrack === t.id 
                      ? 'bg-white text-background border-white' 
                      : 'bg-secondaryBg/40 text-lightGray border-white/5 hover:border-white/20 disabled:opacity-40'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-lightGray/40 uppercase tracking-wider">Questions:</span>
            <div className="flex gap-2">
              {[3, 5, 10].map(cnt => (
                <button
                  key={cnt}
                  disabled={activeInterview !== null}
                  onClick={() => setQuestionCount(cnt)}
                  className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded-lg border transition-all duration-300 ${
                    questionCount === cnt 
                      ? 'bg-white text-background border-white' 
                      : 'bg-secondaryBg/40 text-lightGray border-white/5 hover:border-white/20 disabled:opacity-40'
                  }`}
                >
                  {cnt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="max-w-3xl mx-auto p-4 mb-6 bg-red-950/40 border border-red-900/50 rounded-xl text-xs text-red-300 text-center flex items-center justify-center gap-2">
            <AlertCircle size={16} />
            {errorMsg}
          </div>
        )}

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
              <div className="flex items-center gap-4">
                {activeQuestion && (
                  <button
                    onClick={() => speakText(activeQuestion)}
                    className="text-xs text-lightGray/60 hover:text-white flex items-center gap-1 transition-colors"
                    title="Play audio query"
                  >
                    <Volume2 size={13} />
                    Speak
                  </button>
                )}
                <button 
                  onClick={() => resetInterview(selectedTrack)}
                  className="text-xs text-lightGray/60 hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw size={12} />
                  Restart
                </button>
              </div>
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

            {/* Input Form or Start Button */}
            <div className="p-4 border-t border-white/5 bg-secondaryBg/20">
              {activeInterview === null && !isCompleted ? (
                <button
                  onClick={startInterviewSession}
                  className="w-full py-3 bg-white text-background hover:bg-lightGray font-black text-xs uppercase tracking-wider rounded-lg transition-all text-center"
                >
                  Start Practice Round
                </button>
              ) : (
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
              )}
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
                  className="bg-secondaryBg/40 border border-white/5 rounded-xl p-6 h-full flex flex-col justify-between space-y-6 animate-in fade-in duration-200"
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

                    {/* STAR Breakdown Panel */}
                    {selectedTrack === 'hr' && currentFeedback.starRating && (
                      <div className="mb-6 pt-4 border-t border-white/5 space-y-3">
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider block">STAR Method Scores</span>
                        <div className="grid grid-cols-2 gap-3.5">
                          {[
                            { label: 'Situation', score: currentFeedback.starRating.situation, color: 'bg-emerald-400' },
                            { label: 'Task', score: currentFeedback.starRating.task, color: 'bg-sky-400' },
                            { label: 'Action', score: currentFeedback.starRating.action, color: 'bg-amber-400' },
                            { label: 'Result', score: currentFeedback.starRating.result, color: 'bg-rose-400' }
                          ].map((star) => (
                            <div key={star.label} className="p-2.5 bg-background/50 rounded-lg border border-white/5">
                              <div className="flex justify-between items-center text-[10px] font-semibold text-lightGray/60">
                                <span>{star.label}</span>
                                <span className="text-white">{star.score}%</span>
                              </div>
                              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-1.5">
                                <div className={`h-full ${star.color}`} style={{ width: `${star.score}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Strengths & Improvements */}
                    <div className="space-y-4 overflow-y-auto max-h-52 pr-1">
                      {/* Strengths */}
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          <ThumbsUp size={12} /> Key Strengths
                        </h4>
                        <ul className="space-y-1">
                          {currentFeedback.strengths.map((str, idx) => (
                            <li key={idx} className="text-[11px] text-lightGray/70 flex items-start gap-1">
                              <span className="text-white">•</span>
                              <span>{str}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Improvements */}
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          <AlertCircle size={12} /> Improvement Areas
                        </h4>
                        <ul className="space-y-1">
                          {currentFeedback.improvements.map((imp, idx) => (
                            <li key={idx} className="text-[11px] text-lightGray/70 flex items-start gap-1">
                              <span className="text-white">•</span>
                              <span>{imp}</span>
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
                    {((activeInterview && currentQuestionIndex + 1 < activeInterview.questions.length) || (!activeInterview && currentQuestionIndex < 1)) 
                      ? 'Next Question' 
                      : 'Complete Interview'}
                    <ArrowRight size={16} />
                  </button>
                </motion.div>
              ) : selectedTrack === 'hr' && activeInterview !== null ? (
                <div className="bg-secondaryBg/40 border border-white/5 rounded-xl p-6 h-full flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                      <Sparkles size={16} className="text-amber-400 fill-amber-400" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">STAR Interview Assistant</h4>
                    </div>
                    <p className="text-[11px] text-lightGray/60 mt-2">Structure your response using the STAR method for maximum scoring potential:</p>
                    
                    <div className="space-y-3.5 mt-4 text-xs">
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-white/10 text-white flex items-center justify-center font-mono font-bold text-[9px] flex-shrink-0">S</span>
                        <div>
                          <strong className="text-white">Situation</strong>
                          <p className="text-[10px] text-lightGray/50 mt-0.5">Describe the context or challenge you faced. Keep it under 2 sentences.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-white/10 text-white flex items-center justify-center font-mono font-bold text-[9px] flex-shrink-0">T</span>
                        <div>
                          <strong className="text-white">Task</strong>
                          <p className="text-[10px] text-lightGray/50 mt-0.5">Explain your responsibility and the goal of your initiative.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-white/10 text-white flex items-center justify-center font-mono font-bold text-[9px] flex-shrink-0">A</span>
                        <div>
                          <strong className="text-white">Action</strong>
                          <p className="text-[10px] text-lightGray/50 mt-0.5">Detail the specific steps you took and how you collaborated with your team.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-white/10 text-white flex items-center justify-center font-mono font-bold text-[9px] flex-shrink-0">R</span>
                        <div>
                          <strong className="text-white">Result</strong>
                          <p className="text-[10px] text-lightGray/50 mt-0.5">State the final outcome. Quantify metrics, percentages, or learnings.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-white/5 rounded-lg border border-white/5 text-[10px] text-lightGray/55 leading-relaxed font-mono">
                    💡 TIP: Use strong verbs like "Spearheaded", "Architected", or "Negotiated" when describing your Actions.
                  </div>
                </div>
              ) : (
                <div className="bg-secondaryBg/20 border border-white/5 rounded-xl p-6 h-full flex flex-col justify-center items-center text-center space-y-4">
                  <div className="p-4 bg-white/5 rounded-full text-lightGray mb-2">
                    <HelpCircle size={32} className="stroke-[1.5]" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Awaiting Candidate Answer</h3>
                  <p className="text-sm text-lightGray/50 max-w-xs leading-relaxed">
                    Start a practice round and enter your response to the question in the chat interface to trigger AI evaluations.
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
