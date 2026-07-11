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

  const activeProblems = problems && problems.length > 0 ? problems : PROBLEMS;
  const problem = activeProblems[selectedProblemIndex] || activeProblems[0];

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
      const response = await API.post(`/problems/${problem.id}/hint`, {
        code: codeText,
        language: selectedLang,
        consoleOutput: consoleLog.join('\n')
      });
      setHintData(response.data);
      setShowHint(true);
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

    if (isCodeEmptyOrUnimplemented(codeText, selectedLang, problem.id)) {
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
    setConsoleLog(['Transpiling buffers...', 'Connecting to remote compiler nodes...', 'Executing assertions...']);
    setResults([]);
    setPerfScore(null);
    setErrorMsg('');
    const toastId = toast.loading('Compiling and running assertions...');

    try {
      const response = await API.post('/compiler/run', {
        code: codeText,
        language: selectedLang,
        problemId: problem.id,
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
          onSolveProblem(problem.id, problem.title);
        }

        toast.success('Compilation successful! All tests passed.', { id: toastId });

        confetti({
          particleCount: 50,
          spread: 45,
          origin: { y: 0.8 },
          colors: ['#FFFFFF', '#38BDF8']
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
              {/* Problem Selection Slider */}
              <div className="flex items-center justify-between mb-4 p-2 bg-background/50 border border-white/5 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    const prevIndex = (selectedProblemIndex - 1 + activeProblems.length) % activeProblems.length;
                    onSelectProblemIndex(prevIndex);
                  }}
                  className="p-1.5 hover:bg-white/5 rounded-lg text-lightGray/60 hover:text-white transition-colors flex items-center justify-center"
                  title="Previous Challenge"
                >
                  <ChevronLeft size={16} />
                </button>
                
                <div className="text-center">
                  <span className="text-[10px] font-bold text-lightGray/40 uppercase tracking-widest block">Select Challenge</span>
                  <span className="text-xs font-semibold text-white font-mono">
                    {selectedProblemIndex + 1} of {activeProblems.length}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const nextIndex = (selectedProblemIndex + 1) % activeProblems.length;
                    onSelectProblemIndex(nextIndex);
                  }}
                  className="p-1.5 hover:bg-white/5 rounded-lg text-lightGray/60 hover:text-white transition-colors flex items-center justify-center"
                  title="Next Challenge"
                >
                  <ChevronRight size={16} />
                </button>
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

            {/* AI Hint and performance diagnostics */}
            <div className="space-y-4">
              {/* AI Code Hint Panel */}
              {showHint && hintData ? (
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles size={14} className="text-amber-400 fill-amber-400" /> AI Code Recommendation
                    </h4>
                    <button
                      onClick={() => {
                        setShowHint(false);
                        setHintData(null);
                      }}
                      className="text-[10px] text-lightGray/40 hover:text-white transition-colors"
                    >
                      Hide
                    </button>
                  </div>
                  <div className="space-y-2 text-xs leading-relaxed text-lightGray/85">
                    <p className="font-semibold text-amber-300">Suggested Action:</p>
                    <p className="whitespace-pre-wrap">{hintData.hint}</p>
                    {hintData.complexityAnalysis && (
                      <div className="text-[10px] text-white/60 font-mono bg-background/50 p-2.5 rounded border border-white/5 mt-2">
                        {hintData.complexityAnalysis}
                      </div>
                    )}
                  </div>
                </div>
              ) : userProfile?.subscription === 'Premium' ? (
                <div>
                  <button
                    onClick={getAiHint}
                    disabled={loadingHint}
                    className="w-full py-2.5 text-xs font-bold bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                  >
                    {loadingHint ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        Analyzing Code Logic...
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} className="text-amber-400 fill-amber-400" />
                        Request AI Debugging Hint
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center space-y-2">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">AI Coding Mentor</span>
                  <p className="text-[11px] text-lightGray/50 leading-relaxed">
                    AI debugger hints & complexity insights are available on the Premium tier or generated automatically upon failure.
                  </p>
                </div>
              )}

              {/* Performance diagnostics panel */}
              <AnimatePresence>
                {perfScore && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-4"
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
                  <option value="cpp">C++</option>
                  <option value="c">C</option>
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
            <div className="flex-1 overflow-hidden bg-background">
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
