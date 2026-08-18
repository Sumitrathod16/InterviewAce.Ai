import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Code, CheckCircle, XCircle, Award, Terminal, RefreshCw, Layers, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import Editor from '@monaco-editor/react';
import confetti from 'canvas-confetti';
import { toast } from 'react-hot-toast';
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
  // Write your code here
}`,
      python: `def twoSum(nums, target):
    # Write your code here
    pass`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your code here
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
  // Write your code here
}`,
      python: `def reverseString(s):
    # Write your code here
    pass`,
      java: `class Solution {
    public void reverseString(char[] s) {
        // Write your code here
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
  // Write your code here
}`,
      python: `def isPalindrome(s):
    # Write your code here
    pass`,
      java: `class Solution {
    public boolean isPalindrome(String s) {
        // Write your code here
        return false;
    }
}`
    },
    tests: [
      { input: "A man, a plan, a canal: Panama", expected: "true" }
    ]
  },
  {
    id: 'fizzbuzz',
    title: '412. Fizz Buzz',
    difficulty: 'Easy',
    description: 'Given an integer n, return a string array answer (1-indexed) where:\n- answer[i] == "FizzBuzz" if i is divisible by 3 and 5.\n- answer[i] == "Fizz" if i is divisible by 3.\n- answer[i] == "Buzz" if i is divisible by 5.\n- answer[i] == i (as a string) if none of the above conditions are true.',
    starterCode: {
      javascript: `function fizzBuzz(n) {
  // Write your code here
}`,
      python: `def fizzBuzz(n):
    # Write your code here
    pass`,
      java: `import java.util.List;
import java.util.ArrayList;
class Solution {
    public List<String> fizzBuzz(int n) {
        // Write your code here
        return new ArrayList<>();
    }
}`
    },
    tests: [
      { input: "15", expected: "[\"1\",\"2\",\"Fizz\",\"4\",\"Buzz\",\"Fizz\",\"7\",\"8\",\"Fizz\",\"Buzz\",\"11\",\"Fizz\",\"13\",\"14\",\"FizzBuzz\"]" }
    ]
  },
  {
    id: 'fibonacci',
    title: '509. Fibonacci Number',
    difficulty: 'Easy',
    description: 'The Fibonacci numbers, commonly denoted F(n) form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1.\nGiven n, calculate F(n).',
    starterCode: {
      javascript: `function fib(n) {
  // Write your code here
}`,
      python: `def fib(n):
    # Write your code here
    pass`,
      java: `class Solution {
    public int fib(int n) {
        // Write your code here
        return 0;
    }
}`
    },
    tests: [
      { input: "4", expected: "3" },
      { input: "2", expected: "1" }
    ]
  },
  {
    id: 'mergesorted',
    title: '88. Merge Sorted Array',
    difficulty: 'Easy',
    description: 'You are given two integer arrays nums1 and nums2, sorted in non-decreasing order, and two integers m and n, representing the number of elements in nums1 and nums2 respectively.\nMerge nums1 and nums2 into a single array sorted in non-decreasing order. The fusion should happen inside nums1 in-place.',
    starterCode: {
      javascript: `function merge(nums1, m, nums2, n) {
  // Write your code here
}`,
      python: `def merge(nums1, m, nums2, n):
    # Write your code here
    pass`,
      java: `class Solution {
    public void merge(int[] nums1, int m, int[] nums2, int n) {
        // Write your code here
    }
}`
    },
    tests: [
      { input: "[1,2,3,0,0,0]\n3\n[2,5,6]\n3", expected: "[1,2,2,3,5,6]" }
    ]
  },
  {
    id: 'binarysearch',
    title: '704. Binary Search',
    difficulty: 'Easy',
    description: 'Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.',
    starterCode: {
      javascript: `function search(nums, target) {
  // Write your code here
}`,
      python: `def search(nums, target):
    # Write your code here
    pass`,
      java: `class Solution {
    public int search(int[] nums, int target) {
        // Write your code here
        return -1;
    }
}`
    },
    tests: [
      { input: "[-1,0,3,5,9,12]\n9", expected: "4" },
      { input: "[-1,0,3,5,9,12]\n2", expected: "-1" }
    ]
  },
  {
    id: 'containsduplicate',
    title: '217. Contains Duplicate',
    difficulty: 'Easy',
    description: 'Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.',
    starterCode: {
      javascript: `function containsDuplicate(nums) {
  // Write your code here
}`,
      python: `def containsDuplicate(nums):
    # Write your code here
    pass`,
      java: `class Solution {
    public boolean containsDuplicate(int[] nums) {
        // Write your code here
        return false;
    }
}`
    },
    tests: [
      { input: "[1,2,3,1]", expected: "true" },
      { input: "[1,2,3,4]", expected: "false" }
    ]
  },
  {
    id: 'validparentheses',
    title: '20. Valid Parentheses',
    difficulty: 'Easy',
    description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid. An open bracket must be closed by the same type and in correct order.',
    starterCode: {
      javascript: `function isValid(s) {
  // Write your code here
}`,
      python: `def isValid(s):
    # Write your code here
    pass`,
      java: `class Solution {
    public boolean isValid(String s) {
        // Write your code here
        return false;
    }
}`
    },
    tests: [
      { input: "()[]{}", expected: "true" },
      { input: "(]", expected: "false" }
    ]
  }
];

const FALLBACK_STARTER = {
  javascript: `// Write your JavaScript code here\nfunction solve() {\n  console.log("Hello from JS!");\n}\n\nsolve();`,
  python: `# Write your Python code here\ndef solve():\n    print("Hello from Python!")\n\nsolve()`,
  java: `// Write your Java code here\nclass Solution {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java!");\n    }\n}`,
  cpp: `// Write your C++ code here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello from C++!" << endl;\n    return 0;\n}`,
  c: `// Write your C code here\n#include <stdio.h>\n\nint main() {\n    printf("Hello from C!\\n");\n    return 0;\n}`
};

const FUNCTION_NAMES = {
  twosum: 'twoSum',
  reversestring: 'reverseString',
  palindrome: 'isPalindrome',
  fizzbuzz: 'fizzBuzz',
  fibonacci: 'fib',
  mergesorted: 'merge',
  binarysearch: 'search',
  containsduplicate: 'containsDuplicate',
  validparentheses: 'isValid'
};

const isCodeEmptyOrUnimplemented = (code, language, problemId) => {
  if (!code || !code.trim()) return true;
  const lang = language.toLowerCase();
  const funcName = FUNCTION_NAMES[problemId?.toLowerCase()];

  const normalize = (str) => {
    let clean = str;
    if (lang === 'python' || lang === 'py') {
      clean = clean.replace(/#.*|"""[^]*?"""|'''[^]*?'''/g, '');
    } else {
      clean = clean.replace(/\/\/.*|\/\*[^]*?\*\//g, '');
    }
    return clean.replace(/\s+/g, ' ').trim();
  };

  const activeProblems = PROBLEMS;
  const problem = activeProblems.find(p => p.id === problemId);
  const starterCode = problem?.starterCode?.[lang] || FALLBACK_STARTER[lang];
  if (starterCode) {
    if (normalize(code) === normalize(starterCode)) {
      return true;
    }
  }

  if (funcName) {
    if (lang === 'javascript' || lang === 'js') {
      const jsRegex = new RegExp(`function\\s+${funcName}\\s*\\([^)]*\\)\\s*\\{\\s*(?:\\/\\/.*|\\/\\*[^]*?\\*\\/|\\s)*\\}`);
      if (jsRegex.test(code)) return true;
    } else if (lang === 'python' || lang === 'py') {
      const pyRegex = new RegExp(`def\\s+${funcName}\\s*\\([^)]*\\)\\s*:\\s*(?:#.*|"""[^]*?"""|'''[^]*?'''|\\s|pass)*(?:\\n\\s*\\n*|\\s*$|(?=\\n\\S))`);
      const pyRegexFull = new RegExp(`^\\s*def\\s+${funcName}\\s*\\([^)]*\\)\\s*:\\s*(?:#.*|"""[^]*?"""|'''[^]*?'''|\\s|pass)*$`);
      if (pyRegex.test(code) || pyRegexFull.test(code)) return true;
    } else if (lang === 'java') {
      const javaRegex = new RegExp(`(?:public|private|protected|static|\\s)+[\\w<>\\[\\]]+\\s+${funcName}\\s*\\([^)]*\\)\\s*\\{\\s*(?:\\/\\/.*|\\/\\*[^]*?\\*\\/|\\s|return\\s+new\\s+int\\[\\s*0\\s*\\]\\s*;|return\\s+false\\s*;|return\\s+new\\s+ArrayList<>[^;]*;|return\\s+0\\s*;|return\\s+-1\\s*;|return\\s+null\\s*;|return\\s*;)*\\}`);
      if (javaRegex.test(code)) return true;
    }
  }
  return false;
};


export default function CodingAssessment({ 
  solvedProblems, 
  onSolveProblem,
  selectedProblemIndex,
  onSelectProblemIndex,
  problems = [],
  theme = 'dark'
}) {
  const { userProfile } = useAuth();
  
  const [selectedLang, setSelectedLang] = useState('javascript');
  const [codeText, setCodeText] = useState('');
  const [consoleLog, setConsoleLog] = useState([]);
  const [testingStatus, setTestingStatus] = useState('idle'); // idle, running, success, fail
  const [results, setResults] = useState([]);
  const [perfScore, setPerfScore] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // AI Hint States
  const [loadingHint, setLoadingHint] = useState(false);
  const [hintData, setHintData] = useState(null);
  const [showHint, setShowHint] = useState(false);

  // UI States
  const [leftTab, setLeftTab] = useState('problem'); // problem, ai

  const activeProblems = problems && problems.length > 0 ? problems : PROBLEMS;
  const problem = activeProblems[selectedProblemIndex] || activeProblems[0];
  const currentProblemId = problem ? (problem.problemId || problem.id) : '';

  useEffect(() => {
    const starter = problem.starterCode[selectedLang] || FALLBACK_STARTER[selectedLang] || problem.starterCode['javascript'] || '';
    setCodeText(starter);
    setConsoleLog([]);
    setTestingStatus('idle');
    setResults([]);
    setPerfScore(null);
    setErrorMsg('');
    setHintData(null);
    setShowHint(false);
    setLeftTab('problem');
  }, [selectedProblemIndex, selectedLang]);

  const resetCode = () => {
    const starter = problem.starterCode[selectedLang] || FALLBACK_STARTER[selectedLang] || problem.starterCode['javascript'] || '';
    setCodeText(starter);
    setConsoleLog([]);
    setTestingStatus('idle');
    setResults([]);
    setPerfScore(null);
    setErrorMsg('');
    setHintData(null);
    setShowHint(false);
    setLeftTab('problem');
  };

  const getAiHint = async () => {
    if (!userProfile) {
      setErrorMsg('Please log in to query the AI assistant.');
      toast.error('Please log in to query the AI assistant.');
      return;
    }
    setLoadingHint(true);
    setErrorMsg('');
    try {
      const response = await API.post(`/problems/${currentProblemId}/hint`, {
        code: codeText,
        language: selectedLang,
        consoleOutput: consoleLog.join('\n')
      });
      setHintData(response.data);
      setShowHint(true);
      setLeftTab('ai'); // Automatically switch to AI Coach tab
      toast.success('AI debug hints generated successfully!');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to generate AI coding hint.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoadingHint(false);
    }
  };

  const runCode = async () => {
    if (!userProfile) {
      setErrorMsg('Please log in to submit code compilation.');
      toast.error('Please log in to submit code compilation.');
      return;
    }

    if (isCodeEmptyOrUnimplemented(codeText, selectedLang, currentProblemId)) {
      setTestingStatus('fail');
      setErrorMsg('The function body is empty. Please implement your solution.');
      setConsoleLog([
        'Error: Empty or unimplemented function.',
        'Please write your solution inside the provided function body.'
      ]);
      toast.error('The function body is empty! Please implement your solution.');
      return;
    }

    setTestingStatus('running');
    setConsoleLog(['Transpiling buffers...', 'Connecting to local compiler sandbox...', 'Executing assertions...']);
    setResults([]);
    setPerfScore(null);
    setErrorMsg('');
    const toastId = toast.loading('Compiling and running assertions...');

    try {
      const response = await API.post('/compiler/run', {
        code: codeText,
        language: selectedLang,
        problemId: currentProblemId,
        stdin: problem.tests[0]?.input || ''
      });

      const data = response.data;

      // Update test results
      if (data.results) {
        setResults(data.results);
      }

      // Log results in the console
      if (data.success) {
        setTestingStatus('success');
        setConsoleLog(prev => [
          ...prev,
          `Compilation Successful. Status: ${data.status}`,
          `Stdout: ${data.stdout || '(no output log)'}`,
          `All ${data.results?.length || 0} test cases passed successfully!`
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
          onSolveProblem(currentProblemId, problem.title, selectedLang);
        }

        toast.success('Compilation successful! All tests passed.', { id: toastId });

        confetti({
          particleCount: 50,
          spread: 45,
          origin: { y: 0.8 },
          colors: ['#FFFFFF', '#6366F1', '#A855F7']
        });
      } else {
        setTestingStatus('fail');
        
        const logs = [
          `Execution Failed. Status: ${data.status}`
        ];

        if (data.errorLine) {
          logs.push(`⚠️ Runtime/Compilation Error at Line ${data.errorLine}`);
        }

        if (data.stderr) {
          logs.push(`Errors:\n${data.stderr}`);
        } else if (data.stdout) {
          logs.push(`Console Output:\n${data.stdout}`);
        }

        if (data.results && data.results.length > 0) {
          logs.push('\nDetailed Test Case Analysis:');
          data.results.forEach((res, idx) => {
            logs.push(`Test Case ${idx + 1}: ${res.passed ? '✅ Passed' : '❌ Failed'} (Expected: ${res.expected}, Got: ${res.actual})`);
          });
        }

        setConsoleLog(prev => [...prev, ...logs]);

        // Auto-show AI recommendation if available
        if (data.aiRecommendation) {
          setHintData({
            hint: data.aiRecommendation,
            complexityAnalysis: data.complexityAnalysis || 'Complexity not assessed.'
          });
          setShowHint(true);
          setLeftTab('ai'); // Switch to AI Coach tab
          toast.error('Test cases failed. AI Coach recommendation generated!', { id: toastId });
        } else {
          toast.error('Compilation failed! Test assertion error.', { id: toastId });
        }
      }
    } catch (err) {
      console.error('Compiler execution failure:', err);
      setTestingStatus('fail');
      const msg = err.response?.data?.message || 'Failed to connect to backend execution environment.';
      setErrorMsg(msg);
      setConsoleLog(prev => [...prev, `InternalError: Compiler connection failed.`]);
      toast.error(msg, { id: toastId });
    }
  };

  return (
    <section id="coding" className="relative py-24 overflow-hidden bg-background border-t border-white/5">
      {/* Background radial effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none opacity-20 -z-10">
        <div className="absolute top-[-10%] left-[20%] w-[350px] h-[350px] rounded-full bg-slate-500 blur-[120px]" />
        <div className="absolute top-[10%] right-[20%] w-[350px] h-[350px] rounded-full bg-white blur-[150px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 relative">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glassmorphism text-xs font-semibold tracking-wider text-lightGray/90 mb-6 uppercase premium-border">
            <Sparkles size={13} className="text-accent animate-pulse" />
            AI-POWERED PREPARATION PLATFORM
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
            Interactive <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-lightGray to-accent">Coding Sandbox</span>
          </h2>
          <p className="text-base sm:text-lg text-lightGray/85 max-w-2xl mx-auto leading-relaxed font-sans">
            Write, compile, and run your algorithm scripts. Receive instant AI optimization reviews and execution statistics.
          </p>
        </div>

        {errorMsg && (
          <div className="max-w-4xl mx-auto p-4 mb-6 bg-red-950/20 border border-red-900/30 rounded-2xl text-xs text-red-300 text-center shadow-lg backdrop-blur">
            {errorMsg}
          </div>
        )}

        {/* Workspace grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left panel: Challenge Details & AI Tab */}
          <div className="lg:col-span-5 flex flex-col justify-between p-6 bg-secondaryBg/30 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl relative overflow-hidden group">
            {/* Inner background glow accent */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />

            <div>
              {/* Problem Selection Slider */}
              <div className="flex items-center justify-between mb-6 p-1 bg-white/5 border border-white/5 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    const prevIndex = (selectedProblemIndex - 1 + activeProblems.length) % activeProblems.length;
                    onSelectProblemIndex(prevIndex);
                  }}
                  className="p-2 hover:bg-white/5 rounded-lg text-lightGray/50 hover:text-white transition-all duration-200 flex items-center justify-center hover:scale-105 active:scale-95"
                  title="Previous Challenge"
                >
                  <ChevronLeft size={16} />
                </button>
                
                <div className="text-center">
                  <span className="text-[10px] font-extrabold text-lightGray/30 uppercase tracking-widest block">Coding Arena</span>
                  <span className="text-xs font-bold text-accent font-mono">
                    Challenge {selectedProblemIndex + 1} of {activeProblems.length}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const nextIndex = (selectedProblemIndex + 1) % activeProblems.length;
                    onSelectProblemIndex(nextIndex);
                  }}
                  className="p-2 hover:bg-white/5 rounded-lg text-lightGray/50 hover:text-white transition-all duration-200 flex items-center justify-center hover:scale-105 active:scale-95"
                  title="Next Challenge"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex p-1 bg-white/5 border border-white/5 rounded-xl mb-6">
                <button
                  type="button"
                  onClick={() => setLeftTab('problem')}
                  className={`flex-grow py-2 text-xs font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${leftTab === 'problem' ? 'bg-white/10 text-white border border-white/5 shadow-lg' : 'text-lightGray/40 hover:text-lightGray'}`}
                >
                  <Code size={13} /> Details
                </button>
                <button
                  type="button"
                  onClick={() => setLeftTab('ai')}
                  className={`flex-grow py-2 text-xs font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 relative ${leftTab === 'ai' ? 'bg-white/10 text-white border border-white/5 shadow-lg' : 'text-lightGray/40 hover:text-lightGray'}`}
                >
                  <Sparkles size={13} className={showHint ? "text-accent fill-accent" : ""} />
                  AI Coach
                  {showHint && (
                    <span className="absolute top-1.5 right-3 h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                  )}
                </button>
              </div>

              {/* Tab Content Panels */}
              <AnimatePresence mode="wait">
                {leftTab === 'problem' ? (
                  <motion.div
                    key="problem"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-4"
                  >
                    {/* Title & Tag */}
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-extrabold text-white tracking-tight">{problem.title}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        problem.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' :
                        problem.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/25' :
                        'bg-rose-500/10 text-rose-400 border-rose-500/25'
                      }`}>
                        {problem.difficulty}
                      </span>
                      {solvedProblems.has(currentProblemId) && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-accent text-white uppercase tracking-wider">
                          Solved
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <div className="text-sm text-lightGray/80 whitespace-pre-line leading-relaxed max-h-[220px] overflow-y-auto pr-1 bg-white/5 p-4 border border-white/5 rounded-xl font-sans">
                      {problem.description}
                    </div>

                    {/* Examples */}
                    {problem.tests && problem.tests.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-lightGray/40 uppercase tracking-widest block">Examples</span>
                        {problem.tests.map((test, index) => (
                          <div key={index} className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1 font-mono text-[11px]">
                            <div className="flex text-lightGray/40">
                              <span className="w-16">Input:</span>
                              <span className="text-lightGray/80">{test.input.replace(/\n/g, ', ')}</span>
                            </div>
                            <div className="flex text-accent">
                              <span className="w-16">Output:</span>
                              <span>{test.expected}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="ai"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-4"
                  >
                    {showHint && hintData ? (
                      <div className="space-y-4">
                        {/* Recommendation */}
                        <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-1.5">
                              <Sparkles size={12} className="text-accent fill-accent animate-pulse" /> AI Code Suggestions
                            </h4>
                            <button
                              onClick={() => {
                                setShowHint(false);
                                setHintData(null);
                                setLeftTab('problem');
                              }}
                              className="text-[10px] text-lightGray/40 hover:text-white transition-colors"
                            >
                              Reset
                            </button>
                          </div>
                          <div className="space-y-3 text-xs leading-relaxed text-lightGray/80 font-sans">
                            <p className="whitespace-pre-wrap">{hintData.hint}</p>
                            {hintData.complexityAnalysis && (
                              <div className="text-[10px] text-lightGray/70 font-mono bg-black/40 p-3 rounded-lg border border-white/5 mt-2">
                                <div className="font-bold text-white mb-1 uppercase tracking-wide">Complexity Audit</div>
                                {hintData.complexityAnalysis}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 text-center space-y-4">
                        <div className="h-12 w-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto text-accent shadow-lg">
                          <Sparkles size={20} className="animate-pulse" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-white">Need a logical pointer?</h4>
                          <p className="text-xs text-lightGray/50 max-w-xs mx-auto leading-relaxed font-sans">
                            Request structured recommendations or asymptotic complexity hints. You can consult the AI coach at any stage.
                          </p>
                        </div>

                        {userProfile?.subscription === 'Premium' ? (
                          <button
                            onClick={getAiHint}
                            disabled={loadingHint}
                            className="px-6 py-2.5 text-xs font-bold bg-white text-background hover:bg-lightGray rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 mx-auto animate-pulse"
                          >
                            {loadingHint ? (
                              <>
                                <RefreshCw size={12} className="animate-spin" />
                                Analyzing Execution Graph...
                              </>
                            ) : (
                              <>
                                <Sparkles size={12} className="text-accent fill-accent" />
                                Consult AI Code Coach
                              </>
                            )}
                          </button>
                        ) : (
                          <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center">
                            <span className="text-[10px] font-bold text-accent uppercase tracking-widest block mb-1">AI Coaching Access</span>
                            <p className="text-[11px] text-lightGray/40 max-w-xs mx-auto leading-relaxed">
                              Detailed AI diagnostic alerts are automatically unlocked if your code compilation crashes, or available instantly on the Premium Tier.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Performance diagnostics panel */}
            <div className="mt-8 pt-4 border-t border-white/5">
              <AnimatePresence>
                {perfScore ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-4"
                  >
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Award size={14} className="text-accent" /> Profiling & Diagnostics
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Runtime Box */}
                      <div className="p-3 bg-black/40 border border-white/5 rounded-lg">
                        <div className="text-[10px] text-lightGray/40 font-bold uppercase tracking-wider mb-1">Execution Speed</div>
                        <div className="text-xl font-black text-white">{perfScore.runtime} ms</div>
                        <div className="text-[11px] text-white/80 mt-1 font-semibold">Beats {perfScore.runtimePercent}%</div>
                        {/* Visual indicator bar */}
                        <div className="w-full bg-white/5 h-1 rounded-full mt-2 overflow-hidden">
                          <div className="bg-white h-full rounded-full" style={{ width: `${perfScore.runtimePercent}%` }} />
                        </div>
                      </div>
                      
                      {/* Memory Box */}
                      <div className="p-3 bg-black/40 border border-white/5 rounded-lg">
                        <div className="text-[10px] text-lightGray/40 font-bold uppercase tracking-wider mb-1">Memory Allocation</div>
                        <div className="text-xl font-black text-white">{perfScore.memory} MB</div>
                        <div className="text-[11px] text-accent mt-1 font-semibold">Beats {perfScore.memoryPercent}%</div>
                        {/* Visual indicator bar */}
                        <div className="w-full bg-white/5 h-1 rounded-full mt-2 overflow-hidden">
                          <div className="bg-accent h-full rounded-full" style={{ width: `${perfScore.memoryPercent}%` }} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center py-4 bg-black/10 rounded-xl border border-white/5">
                    <span className="text-[10px] font-bold text-lightGray/30 uppercase tracking-widest flex items-center justify-center gap-1.5 font-sans">
                      <Layers size={12} /> Optimization Gauges Off
                    </span>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right panel: Editor and compilation results */}
          <div className="lg:col-span-7 flex flex-col h-[520px] sm:h-[600px] rounded-2xl bg-secondaryBg/20 border border-white/5 shadow-2xl relative overflow-hidden group/editor min-w-0 w-full">
            
            {/* Glowing editor accent line */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-accent/20 to-transparent pointer-events-none" />

            {/* Header controls */}
            <div className="px-3.5 sm:px-6 py-3 sm:py-4 border-b border-white/5 bg-secondaryBg/40 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 z-10">
              <div className="flex items-center gap-2 sm:gap-4 text-white">
                <div className="flex items-center gap-2">
                  <Code size={15} className="text-accent" />
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest">Monaco IDE</span>
                </div>
                
                {/* Languages selection */}
                <div className="relative">
                  <select
                    value={selectedLang}
                    onChange={(e) => setSelectedLang(e.target.value)}
                    className="bg-black/60 hover:bg-black/80 text-white rounded-lg pl-3 pr-8 py-1.5 text-xs border border-white/5 focus:outline-none focus:border-indigo-500/40 transition-colors font-sans appearance-none cursor-pointer"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="c">C</option>
                  </select>
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-lightGray/40 text-[9px]">
                    ▼
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={resetCode}
                  className="px-3 py-1.5 text-xs text-lightGray/50 hover:text-white border border-white/5 rounded-lg flex items-center gap-1.5 transition-all duration-200 active:scale-95"
                >
                  <RefreshCw size={12} className="transition-transform duration-300 hover:rotate-180" />
                  Reset
                </button>
                <button
                  type="button"
                  onClick={runCode}
                  disabled={testingStatus === 'running'}
                  className={`px-4 sm:px-5 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all duration-200 shadow-lg active:scale-[0.98] ${
                    testingStatus === 'running'
                      ? 'bg-accent/50 text-white cursor-not-allowed'
                      : 'bg-white hover:bg-lightGray text-background hover:shadow-white/5'
                  }`}
                >
                  {testingStatus === 'running' ? (
                    <>
                      <RefreshCw size={12} className="animate-spin text-accent" />
                      Compiling...
                    </>
                  ) : (
                    <>
                      <Play size={12} className="fill-black" />
                      Run Code
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Monaco Editor Component */}
            <div className="flex-1 overflow-hidden bg-[#1e1e1e]">
              <Editor
                height="100%"
                language={
                  selectedLang === 'python' ? 'python' :
                  selectedLang === 'java' ? 'java' :
                  selectedLang === 'cpp' ? 'cpp' :
                  selectedLang === 'c' ? 'c' :
                  'javascript'
                }
                theme={theme === 'dark' ? 'vs-dark' : 'light'}
                value={codeText}
                onChange={(val) => setCodeText(val || '')}
                options={{
                  fontSize: 13,
                  fontFamily: "'Fira Code', 'Courier New', monospace",
                  minimap: { enabled: false },
                  automaticLayout: true,
                  scrollbar: {
                    verticalScrollbarSize: 6,
                    horizontalScrollbarSize: 6
                  },
                  lineNumbersMinChars: 3,
                  padding: { top: 12, bottom: 12 }
                }}
              />
            </div>

            {/* Test Case Results & Console Console Output */}
            <div className="h-44 border-t border-zinc-800 bg-[#09090b] flex flex-col relative">
              <div className="px-6 py-2 border-b border-zinc-800 bg-zinc-900/45 flex items-center justify-between z-10">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Terminal size={11} className="text-zinc-500" /> Assessment Terminal
                </span>
                
                {testingStatus === 'success' && (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle size={10} className="fill-emerald-400 text-black" /> Accepted
                  </span>
                )}
                {testingStatus === 'fail' && (
                  <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                    <XCircle size={10} className="fill-rose-400 text-black" /> Rejected
                  </span>
                )}
                {testingStatus === 'running' && (
                  <span className="text-[10px] font-bold text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded flex items-center gap-1 animate-pulse">
                    <RefreshCw size={10} className="animate-spin text-accent" /> Executing
                  </span>
                )}
                {testingStatus === 'idle' && (
                  <span className="text-[10px] font-bold text-zinc-500 flex items-center gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-zinc-600" /> Ready
                  </span>
                )}
              </div>

              <div className="flex-1 p-5 overflow-y-auto space-y-2 font-mono text-xs text-zinc-200">
                {consoleLog.length === 0 ? (
                  <div className="text-zinc-500 italic">No records executed yet. Press 'Run Code' to compile.</div>
                ) : (
                  consoleLog.map((log, idx) => {
                    const isError = log.startsWith('Error:') || log.startsWith('InternalError:') || log.includes('Failed') || log.startsWith('⚠️');
                    const isSuccess = log.includes('Successful') || log.includes('passed');
                    
                    return (
                      <div 
                        key={idx} 
                        className={`whitespace-pre-wrap leading-relaxed px-2.5 py-1.5 rounded ${
                          isError ? 'text-rose-300 bg-rose-950/20 border-l-2 border-rose-500 font-semibold' : 
                          isSuccess ? 'text-emerald-300 bg-emerald-950/20 border-l-2 border-emerald-500 font-semibold' : 
                          'text-zinc-200 bg-zinc-900/30'
                        }`}
                      >
                        {log}
                      </div>
                    );
                  })
                )}

                {results.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-zinc-800 mt-2">
                    {results.map((res) => (
                      <div key={res.id} className={`flex items-center justify-between px-2.5 py-1.5 rounded bg-zinc-900/40 border border-zinc-800/50 text-[11px] ${res.passed ? 'border-emerald-500/20' : 'border-rose-500/20'}`}>
                        <div className="flex gap-4">
                          <span className="text-zinc-400">Case {res.id + 1}</span>
                          <span className="text-zinc-300">Expected: {res.expected}</span>
                          <span className="text-zinc-100 font-semibold">Got: {res.actual}</span>
                        </div>
                        <span className={`font-bold uppercase tracking-wider text-[9px] px-1.5 py-0.5 rounded ${res.passed ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
                          {res.passed ? 'Passed' : 'Failed'}
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
