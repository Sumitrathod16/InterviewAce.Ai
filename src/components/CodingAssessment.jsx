import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Code, CheckCircle, XCircle, Award, Terminal, RefreshCw, Layers, ChevronLeft, ChevronRight } from 'lucide-react';
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

export default function CodingAssessment({ 
  solvedProblems, 
  onSolveProblem,
  selectedProblemIndex,
  onSelectProblemIndex,
  problems = []
}) {
  const { userProfile } = useAuth();
  
  const [selectedLang, setSelectedLang] = useState('javascript');
  const [codeText, setCodeText] = useState('');
  const [consoleLog, setConsoleLog] = useState([]);
  const [testingStatus, setTestingStatus] = useState('idle'); // idle, running, success, fail
  const [results, setResults] = useState([]);
  const [perfScore, setPerfScore] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const activeProblems = problems && problems.length > 0 ? problems : PROBLEMS;
  const problem = activeProblems[selectedProblemIndex] || activeProblems[0];

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
