import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Code, CheckCircle, XCircle, Award, Terminal, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

const PROBLEMS = [
  {
    id: 'twosum',
    title: '1. Two Sum',
    difficulty: 'Easy',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.',
    starterCode: `function twoSum(nums, target) {
  // Write your code here
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
    tests: [
      { input: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { input: [[3, 2, 4], 6], expected: [1, 2] }
    ]
  },
  {
    id: 'reversestring',
    title: '344. Reverse String',
    difficulty: 'Easy',
    description: 'Write a function that reverses a string. The input string is given as an array of characters s.\nYou must do this by modifying the input array in-place with O(1) extra memory.',
    starterCode: `function reverseString(s) {
  // Write your code here
  let left = 0;
  let right = s.length - 1;
  while (left < right) {
    const temp = s[left];
    s[left] = s[right];
    s[right] = temp;
    left++;
    right--;
  }
  return s;
}`,
    tests: [
      { input: [["h", "e", "l", "l", "o"]], expected: ["o", "l", "l", "e", "h"] },
      { input: [["H", "a", "n", "n", "a", "h"]], expected: ["h", "a", "n", "n", "a", "H"] }
    ]
  },
  {
    id: 'palindrome',
    title: '9. Valid Palindrome',
    difficulty: 'Easy',
    description: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.\nGiven a string s, return true if it is a palindrome, or false otherwise.',
    starterCode: `function isPalindrome(s) {
  // Write your code here
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  return clean === clean.split('').reverse().join('');
}`,
    tests: [
      { input: ["A man, a plan, a canal: Panama"], expected: true },
      { input: ["race a car"], expected: false }
    ]
  },
  {
    id: 'fizzbuzz',
    title: '412. Fizz Buzz',
    difficulty: 'Easy',
    description: 'Given an integer n, return a string array answer (1-indexed) where:\n- answer[i] == "FizzBuzz" if i is divisible by 3 and 5.\n- answer[i] == "Fizz" if i is divisible by 3.\n- answer[i] == "Buzz" if i is divisible by 5.\n- answer[i] == i (as a string) if none of the above conditions are true.',
    starterCode: `function fizzBuzz(n) {
  // Write your code here
  const result = [];
  for (let i = 1; i <= n; i++) {
    if (i % 3 === 0 && i % 5 === 0) result.push("FizzBuzz");
    else if (i % 3 === 0) result.push("Fizz");
    else if (i % 5 === 0) result.push("Buzz");
    else result.push(i.toString());
  }
  return result;
}`,
    tests: [
      { input: [3], expected: ["1", "2", "Fizz"] },
      { input: [5], expected: ["1", "2", "Fizz", "4", "Buzz"] }
    ]
  },
  {
    id: 'fibonacci',
    title: '509. Fibonacci Number',
    difficulty: 'Easy',
    description: 'The Fibonacci numbers, commonly denoted F(n) form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1.\nGiven n, calculate F(n).',
    starterCode: `function fib(n) {
  // Write your code here
  if (n <= 1) return n;
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    const temp = a + b;
    a = b;
    b = temp;
  }
  return b;
}`,
    tests: [
      { input: [2], expected: 1 },
      { input: [4], expected: 3 }
    ]
  },
  {
    id: 'mergesorted',
    title: '88. Merge Sorted Array',
    difficulty: 'Easy',
    description: 'You are given two integer arrays nums1 and nums2, sorted in non-decreasing order, and two integers m and n, representing the number of elements in nums1 and nums2 respectively.\nMerge nums1 and nums2 into a single array sorted in non-decreasing order in-place inside nums1.',
    starterCode: `function merge(nums1, m, nums2, n) {
  // Write your code here
  let i = m - 1;
  let j = n - 1;
  let k = m + n - 1;
  while (j >= 0) {
    if (i >= 0 && nums1[i] > nums2[j]) {
      nums1[k] = nums1[i];
      i--;
    } else {
      nums1[k] = nums2[j];
      j--;
    }
    k--;
  }
  return nums1;
}`,
    tests: [
      { input: [[1, 2, 3, 0, 0, 0], 3, [2, 5, 6], 3], expected: [1, 2, 2, 3, 5, 6] },
      { input: [[1], 1, [], 0], expected: [1] }
    ]
  }
];

export default function CodingAssessment({ 
  solvedProblems, 
  onSolveProblem,
  selectedProblemIndex,
  onSelectProblemIndex
}) {
  const [codeText, setCodeText] = useState('');
  const [consoleLog, setConsoleLog] = useState([]);
  const [testingStatus, setTestingStatus] = useState('idle'); // idle, running, success, fail
  const [results, setResults] = useState([]);
  const [perfScore, setPerfScore] = useState(null);

  const problem = PROBLEMS[selectedProblemIndex];

  useEffect(() => {
    setCodeText(problem.starterCode);
    setConsoleLog([]);
    setTestingStatus('idle');
    setResults([]);
    setPerfScore(null);
  }, [selectedProblemIndex]);

  const resetCode = () => {
    setCodeText(problem.starterCode);
    setConsoleLog([]);
    setTestingStatus('idle');
    setResults([]);
    setPerfScore(null);
  };

  const runCode = () => {
    setTestingStatus('running');
    setConsoleLog(['Compiling code...', 'Running unit test cases...']);
    setResults([]);
    setPerfScore(null);

    setTimeout(() => {
      try {
        let runner;
        let fnName = '';
        
        switch (problem.id) {
          case 'twosum':
            fnName = 'twoSum';
            break;
          case 'reversestring':
            fnName = 'reverseString';
            break;
          case 'palindrome':
            fnName = 'isPalindrome';
            break;
          case 'fizzbuzz':
            fnName = 'fizzBuzz';
            break;
          case 'fibonacci':
            fnName = 'fib';
            break;
          case 'mergesorted':
            fnName = 'merge';
            break;
          default:
            fnName = 'solver';
        }

        const userFnStr = `${codeText}\nreturn ${fnName};`;
        const compiled = new Function(userFnStr);
        runner = compiled();

        if (typeof runner !== 'function') {
          throw new Error(`Main function "${fnName}" not defined or returns invalid script.`);
        }

        const runResults = [];
        let allPassed = true;

        problem.tests.forEach((t, idx) => {
          // deep copy inputs to prevent mutation
          const inputArgs = JSON.parse(JSON.stringify(Array.isArray(t.input) ? t.input : [t.input]));
          const actualVal = runner(...inputArgs);
          
          const actualStr = JSON.stringify(actualVal);
          const expectedStr = JSON.stringify(t.expected);
          const passed = actualStr === expectedStr;

          if (!passed) allPassed = false;

          runResults.push({
            id: idx + 1,
            input: JSON.stringify(t.input),
            expected: expectedStr,
            actual: actualStr,
            passed
          });
        });

        setResults(runResults);
        setConsoleLog(prev => [
          ...prev,
          `Tests evaluated. ${runResults.filter(r => r.passed).length}/${runResults.length} cases passed.`
        ]);

        if (allPassed) {
          setTestingStatus('success');
          setPerfScore({
            runtime: 32 + Math.floor(Math.random() * 20),
            runtimePercent: 88 + Math.floor(Math.random() * 10),
            memory: (36.2 + Math.random() * 3).toFixed(1),
            memoryPercent: 74 + Math.floor(Math.random() * 15)
          });
          
          // Fire solved callback to update parent state
          if (onSolveProblem) {
            onSolveProblem(problem.id, problem.title);
          }

          confetti({
            particleCount: 60,
            spread: 50,
            origin: { y: 0.8 },
            colors: ['#FFFFFF', '#64748B']
          });
        } else {
          setTestingStatus('fail');
        }

      } catch (err) {
        setTestingStatus('fail');
        setConsoleLog(prev => [...prev, `SyntaxError: ${err.message}`]);
      }
    }, 1200);
  };

  const linesCount = codeText.split('\n').length;
  const lineNumbers = Array.from({ length: Math.max(linesCount, 12) }, (_, i) => i + 1);

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
                  className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-4"
                >
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Award size={14} /> Optimization Diagnostics
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-black text-white">{perfScore.runtime} ms</div>
                      <div className="text-[10px] text-lightGray/50 font-bold uppercase">Runtime</div>
                      <div className="text-xs text-white/80 mt-1">Beats {perfScore.runtimePercent}% of JS users</div>
                    </div>
                    <div>
                      <div className="text-2xl font-black text-white">{perfScore.memory} MB</div>
                      <div className="text-[10px] text-lightGray/50 font-bold uppercase">Memory Usage</div>
                      <div className="text-xs text-white/80 mt-1">Beats {perfScore.memoryPercent}% of JS users</div>
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
              <div className="flex items-center gap-2 text-white">
                <Code size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Javascript Sandbox</span>
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
                  Run Tests
                </button>
              </div>
            </div>

            {/* Code Textarea & Gutter */}
            <div className="flex-1 flex overflow-hidden bg-background/50 font-mono text-sm leading-relaxed">
              {/* Line Numbers Gutter */}
              <div className="w-12 border-r border-white/5 text-right select-none pr-3 pt-4 text-lightGray/30 select-none">
                {lineNumbers.map(n => <div key={n}>{n}</div>)}
              </div>
              
              {/* Actual Textarea */}
              <textarea
                value={codeText}
                onChange={(e) => setCodeText(e.target.value)}
                className="flex-1 bg-transparent text-white focus:outline-none p-4 resize-none overflow-y-auto code-textarea"
                spellCheck="false"
                disabled={testingStatus === 'running'}
              />
            </div>

            {/* Test Case Results & Console Console Output */}
            <div className="h-44 border-t border-white/5 bg-secondaryBg/20 flex flex-col">
              <div className="px-6 py-2 border-b border-white/5 bg-secondaryBg/30 flex items-center justify-between">
                <span className="text-[10px] font-bold text-lightGray/40 uppercase tracking-widest flex items-center gap-1">
                  <Terminal size={10} /> Compilation Console & Tests
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
              <div className="flex-1 p-4 overflow-y-auto space-y-2 font-mono text-xs">
                {/* Standard log */}
                {consoleLog.map((log, idx) => (
                  <div key={idx} className="text-lightGray/60">{log}</div>
                ))}

                {/* Assertions */}
                {results.length > 0 && (
                  <div className="space-y-1 pt-1 border-t border-white/5">
                    {results.map((res) => (
                      <div key={res.id} className="flex items-center justify-between">
                        <span className="text-lightGray/55">Case {res.id}: Input: {res.input}</span>
                        <span className={res.passed ? 'text-emerald-400' : 'text-rose-400'}>
                          {res.passed ? 'PASS' : `FAIL (Expected: ${res.expected}, got: ${res.actual})`}
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
