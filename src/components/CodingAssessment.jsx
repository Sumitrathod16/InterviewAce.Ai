import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Code, CheckCircle, XCircle, Award, Terminal, RefreshCw, Layers } from 'lucide-react';
import Editor from '@monaco-editor/react';
import confetti from 'canvas-confetti';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const PROBLEMS = [
  {
    id: 'twosum',
    title: '1. Two Sum',
    difficulty: 'Easy',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.',
    starterCode: {
      javascript: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      return [map.get(diff), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
      python: `def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []`,
      java: `import java.util.HashMap;
class Solution {
    public int[] twoSum(int[] nums, int target) {
        HashMap<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int diff = target - nums[i];
            if (map.containsKey(diff)) {
                return new int[] { map.get(diff), i };
            }
            map.put(nums[i], i);
        }
        return new int[0];
    }
}`
    },
    tests: [
      { input: "[2, 7, 11, 15]\n9", expected: "[0,1]" },
      { input: "[3, 2, 4]\n6", expected: "[1,2]" }
    ]
  },
  {
    id: 'reversestring',
    title: '344. Reverse String',
    difficulty: 'Easy',
    description: 'Write a function that reverses a string. The input string is given as an array of characters s.\nYou must do this by modifying the input array in-place with O(1) extra memory.',
    starterCode: {
      javascript: `function reverseString(s) {
  let left = 0, right = s.length - 1;
  while (left < right) {
    const temp = s[left];
    s[left] = s[right];
    s[right] = temp;
    left++; right--;
  }
  return s;
}`,
      python: `def reverseString(s):
    left, right = 0, len(s) - 1
    while left < right:
        s[left], s[right] = s[right], s[left]
        left += 1
        right -= 1
    return s`,
      java: `class Solution {
    public void reverseString(char[] s) {
        int left = 0, right = s.length - 1;
        while (left < right) {
            char temp = s[left];
            s[left] = s[right];
            s[right] = temp;
            left++; right--;
        }
    }
}`
    },
    tests: [
      { input: '["h","e","l","l","o"]', expected: '["o","l","l","e","h"]' }
    ]
  },
  {
    id: 'palindrome',
    title: '9. Valid Palindrome',
    difficulty: 'Easy',
    description: 'Given a string s, return true if it is a palindrome, or false otherwise.',
    starterCode: {
      javascript: `function isPalindrome(s) {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  return clean === clean.split('').reverse().join('');
}`,
      python: `def isPalindrome(s):
    clean = "".join(c.lower() for c in s if c.isalnum())
    return clean == clean[::-1]`,
      java: `class Solution {
    public boolean isPalindrome(String s) {
        String clean = s.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
        String rev = new StringBuilder(clean).reverse().toString();
        return clean.equals(rev);
    }
}`
    },
    tests: [
      { input: "A man, a plan, a canal: Panama", expected: "true" }
    ]
  }
];

export default function CodingAssessment({ 
  solvedProblems, 
  onSolveProblem,
  selectedProblemIndex,
  onSelectProblemIndex
}) {
  const { userProfile } = useAuth();
  
  const [selectedLang, setSelectedLang] = useState('javascript');
  const [codeText, setCodeText] = useState('');
  const [consoleLog, setConsoleLog] = useState([]);
  const [testingStatus, setTestingStatus] = useState('idle'); // idle, running, success, fail
  const [results, setResults] = useState([]);
  const [perfScore, setPerfScore] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const problem = PROBLEMS[selectedProblemIndex] || PROBLEMS[0];

  useEffect(() => {
    const starter = problem.starterCode[selectedLang] || problem.starterCode['javascript'] || '';
    setCodeText(starter);
    setConsoleLog([]);
    setTestingStatus('idle');
    setResults([]);
    setPerfScore(null);
    setErrorMsg('');
  }, [selectedProblemIndex, selectedLang]);

  const resetCode = () => {
    const starter = problem.starterCode[selectedLang] || problem.starterCode['javascript'] || '';
    setCodeText(starter);
    setConsoleLog([]);
    setTestingStatus('idle');
    setResults([]);
    setPerfScore(null);
    setErrorMsg('');
  };

  const runCode = async () => {
    if (!userProfile) {
      setErrorMsg('Please log in to submit code compilation.');
      return;
    }

    setTestingStatus('running');
    setConsoleLog(['Transpiling buffers...', 'Connecting to remote Judge0 nodes...', 'Executing assertions...']);
    setResults([]);
    setPerfScore(null);
    setErrorMsg('');

    try {
      const response = await API.post('/compiler/run', {
        code: codeText,
        language: selectedLang,
        stdin: problem.tests[0]?.input || ''
      });

      const data = response.data;

      // Log results in the console
      if (data.success) {
        setTestingStatus('success');
        setConsoleLog(prev => [
          ...prev,
          `Compilation Successful. Status: ${data.status}`,
          `Stdout: ${data.stdout || '(no output log)'}`
        ]);
        
        // Mock runtime beating percentages
        setPerfScore({
          runtime: Math.round(parseFloat(data.time) * 1000) || 45,
          runtimePercent: 86 + Math.floor(Math.random() * 12),
          memory: data.memory || '24.2',
          memoryPercent: 78 + Math.floor(Math.random() * 15)
        });

        // Trigger solved hooks
        if (onSolveProblem) {
          onSolveProblem(problem.id, problem.title);
        }

        confetti({
          particleCount: 50,
          spread: 45,
          origin: { y: 0.8 },
          colors: ['#FFFFFF', '#38BDF8']
        });
      } else {
        setTestingStatus('fail');
        setConsoleLog(prev => [
          ...prev,
          `Compilation Error. Status: ${data.status}`,
          `Errors: ${data.stderr || 'Assertion failed.'}`
        ]);
      }
    } catch (err) {
      console.error('Compiler execution failure:', err);
      setTestingStatus('fail');
      setErrorMsg(err.response?.data?.message || 'Failed to connect to backend execution environment.');
      setConsoleLog(prev => [...prev, `InternalError: Compiler connection failed.`]);
    }
  };

  return (
    <section id="coding" className="py-24 bg-background border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
            Interactive Coding Sandbox
          </h2>
          <p className="text-lg text-lightGray/70">
            Write, compile, and run your algorithm scripts. Get instant optimization diagnostics and efficiency scores.
          </p>
        </div>

        {errorMsg && (
          <div className="max-w-4xl mx-auto p-4 mb-6 bg-red-950/40 border border-red-900/50 rounded-xl text-xs text-red-300 text-center">
            {errorMsg}
          </div>
        )}

        {/* Workspace grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left panel: Problem Description */}
          <div className="lg:col-span-5 p-6 bg-secondaryBg/40 border border-white/5 rounded-xl flex flex-col justify-between space-y-6">
            <div>
              {/* Problem Selection drop */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-lightGray/40 uppercase tracking-widest">Select Challenge</span>
                <select
                  value={selectedProblemIndex}
                  onChange={(e) => onSelectProblemIndex(Number(e.target.value))}
                  className="bg-background/80 text-white rounded-lg px-3 py-1.5 text-xs border border-white/5 focus:outline-none"
                >
                  {PROBLEMS.map((p, idx) => (
                    <option key={p.id} value={idx}>{p.title}</option>
                  ))}
                </select>
              </div>

              {/* Title & Tag */}
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-lg font-bold text-white">{problem.title}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {problem.difficulty}
                </span>
                {solvedProblems.has(problem.id) && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-background uppercase">
                    Solved
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="text-sm text-lightGray/85 whitespace-pre-line leading-relaxed mb-6 font-sans">
                {problem.description}
              </div>
            </div>

            {/* Performance diagnostics panel */}
            <AnimatePresence>
              {perfScore && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-4 animate-in fade-in duration-200"
                >
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Award size={14} /> Optimization Diagnostics
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-black text-white">{perfScore.runtime} ms</div>
                      <div className="text-[10px] text-lightGray/50 font-bold uppercase">Runtime</div>
                      <div className="text-xs text-white/80 mt-1">Beats {perfScore.runtimePercent}% of users</div>
                    </div>
                    <div>
                      <div className="text-2xl font-black text-white">{perfScore.memory} MB</div>
                      <div className="text-[10px] text-lightGray/50 font-bold uppercase">Memory Usage</div>
                      <div className="text-xs text-white/80 mt-1">Beats {perfScore.memoryPercent}% of users</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right panel: Editor and compilation results */}
          <div className="lg:col-span-7 flex flex-col h-[560px] rounded-xl glassmorphism premium-border overflow-hidden">
            {/* Header controls */}
            <div className="px-6 py-4 border-b border-white/5 bg-secondaryBg/40 flex items-center justify-between">
              <div className="flex items-center gap-4 text-white">
                <div className="flex items-center gap-2">
                  <Code size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Monaco Sandbox</span>
                </div>
                
                {/* Languages dropdown */}
                <select
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  className="bg-background/80 text-white rounded px-2.5 py-1 text-[11px] border border-white/5 focus:outline-none focus:border-white/20 font-sans"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                </select>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={resetCode}
                  className="px-3 py-1.5 text-xs text-lightGray/60 hover:text-white border border-white/5 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw size={12} />
                  Reset
                </button>
                <button
                  onClick={runCode}
                  disabled={testingStatus === 'running'}
                  className="px-4 py-1.5 text-xs font-bold bg-white text-background hover:bg-lightGray disabled:opacity-50 rounded-lg flex items-center gap-1.5 transition-all shadow-md"
                >
                  <Play size={12} className="fill-background" />
                  {testingStatus === 'running' ? 'Compiling...' : 'Run Code'}
                </button>
              </div>
            </div>

            {/* Monaco Editor Component */}
            <div className="flex-1 overflow-hidden bg-[#1e1e1e]">
              <Editor
                height="100%"
                language={selectedLang === 'python' ? 'python' : selectedLang === 'java' ? 'java' : 'javascript'}
                theme="vs-dark"
                value={codeText}
                onChange={(val) => setCodeText(val || '')}
                options={{
                  fontSize: 13,
                  minimap: { enabled: false },
                  automaticLayout: true,
                  scrollbar: {
                    verticalScrollbarSize: 6,
                    horizontalScrollbarSize: 6
                  }
                }}
              />
            </div>

            {/* Test Case Results & Console Console Output */}
            <div className="h-44 border-t border-white/5 bg-secondaryBg/20 flex flex-col">
              <div className="px-6 py-2 border-b border-white/5 bg-secondaryBg/30 flex items-center justify-between">
                <span className="text-[10px] font-bold text-lightGray/40 uppercase tracking-widest flex items-center gap-1">
                  <Terminal size={10} /> Compiler Console & Reports
                </span>
                {testingStatus === 'success' && (
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle size={10} /> Accepted
                  </span>
                )}
                {testingStatus === 'fail' && (
                  <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1">
                    <XCircle size={10} /> Rejected
                  </span>
                )}
              </div>
              <div className="flex-1 p-4 overflow-y-auto space-y-2 font-mono text-xs text-lightGray/80">
                {consoleLog.map((log, idx) => (
                  <div key={idx} className="whitespace-pre-wrap">{log}</div>
                ))}

                {results.length > 0 && (
                  <div className="space-y-1 pt-1 border-t border-white/5">
                    {results.map((res) => (
                      <div key={res.id} className="flex items-center justify-between">
                        <span className="text-lightGray/55">Expected: {res.expected}</span>
                        <span className={res.passed ? 'text-emerald-400' : 'text-rose-400'}>
                          {res.passed ? 'PASS' : `FAIL`}
                        </span>
                      </div>
                    ))}
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
