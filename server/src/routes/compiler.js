import express from 'express';
import { protect } from '../middleware/auth.js';
import { strictLimiter } from '../middleware/rateLimiter.js';
import { executeCode } from '../services/compiler.js';
import Problem from '../models/Problem.js';
import { generateCodingHint, checkSolutionIntegrity } from '../services/gemini.js';
import { wrapCode, parseErrorLine } from '../services/testRunner.js';

const router = express.Router();

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

const isCodeEmptyOrUnimplemented = (code, language, starterCode, problemId) => {
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

  const starter = starterCode || FALLBACK_STARTER[lang] || FALLBACK_STARTER[lang === 'js' ? 'javascript' : lang === 'py' ? 'python' : ''];
  if (starter) {
    if (normalize(code) === normalize(starter)) {
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

/**
 * @route   POST /api/compiler/run
 * @desc    Execute code in Monaco Sandbox via Judge0
 * @access  Private
 */
router.post('/run', protect, strictLimiter, async (req, res) => {
  const { code, language, problemId, stdin } = req.body;

  if (!code || !language) {
    return res.status(400).json({ message: 'Missing parameters (code, language).' });
  }

  // Rate limit Free plan on specific coding problems if needed
  if (req.user.subscription === 'Free' && language.toLowerCase() !== 'javascript' && language.toLowerCase() !== 'js') {
    return res.status(403).json({ 
      message: 'Compiling non-JS languages is a Pro/Premium feature. Please upgrade or use Javascript!' 
    });
  }

  try {
    let starterCode = '';
    if (problemId) {
      const problem = await Problem.findOne({ problemId });
      if (problem) {
        const langKey = language.toLowerCase();
        starterCode = problem.starterCode?.[langKey] || 
                      problem.starterCode?.[langKey === 'js' ? 'javascript' : langKey === 'py' ? 'python' : ''] || '';
      }
    }

    if (isCodeEmptyOrUnimplemented(code, language, starterCode, problemId)) {
      return res.status(400).json({ 
        message: 'The function body is empty. Please implement your solution before compiling.' 
      });
    }

    // Update practice streak
    await req.user.updateStreak();

    let codeToExecute = code;
    if (problemId) {
      codeToExecute = wrapCode(code, language, problemId);
    }

    const report = await executeCode(codeToExecute, language, stdin);

    // If problemId is provided, parse and evaluate tests
    if (problemId) {
      let results = [];
      let executionSuccess = report.success;
      
      // Parse output for test results marker
      const marker = '---TEST_RESULTS---';
      const markerIndex = report.stdout.indexOf(marker);
      
      if (markerIndex !== -1) {
        try {
          const resultsStr = report.stdout.substring(markerIndex + marker.length).trim();
          results = JSON.parse(resultsStr);
          // Clean the marker and JSON out of the stdout
          report.stdout = report.stdout.substring(0, markerIndex).trim();
        } catch (e) {
          console.error('Failed to parse test results JSON:', e.message);
        }
      }

      // Check if all test cases passed
      const allPassed = results.length > 0 && results.every(r => r.passed);
      
      if (executionSuccess && allPassed) {
        try {
          const problem = await Problem.findOne({ problemId });
          if (problem) {
            const integrity = await checkSolutionIntegrity(code, language, problem.title, problem.description);
            if (!integrity.isProper) {
              report.success = false;
              report.status = 'Rejected';
              report.stderr = `Integrity Check Failed: ${integrity.reason || 'Please write a proper general solution instead of hardcoding test cases.'}`;
              report.aiRecommendation = integrity.reason || 'Hardcoded solution detected. Please implement a general algorithm that solves the problem for any valid input.';
            } else {
              report.success = true;
              report.status = 'Accepted';
            }
          } else {
            report.success = true;
            report.status = 'Accepted';
          }
        } catch (integrityErr) {
          console.error('Failed to verify solution integrity:', integrityErr.message);
          report.success = true;
          report.status = 'Accepted';
        }
      } else {
        report.success = false;
        if (executionSuccess && results.length > 0) {
          report.status = 'Rejected'; // Compiled and ran, but tests failed
        }

        // Parse line number of error from stderr
        if (report.stderr) {
          report.errorLine = parseErrorLine(report.stderr, language);
        }

        // Fetch problem detail for AI recommendation
        try {
          const problem = await Problem.findOne({ problemId });
          if (problem) {
            const consoleOutputForHint = report.stderr || (results.length > 0 ? 'Test cases failed: ' + JSON.stringify(results) : 'Wrong Answer');
            const hintResult = await generateCodingHint(
              problem.title,
              problem.description,
              code,
              language,
              consoleOutputForHint
            );
            report.aiRecommendation = hintResult.hint;
            report.complexityAnalysis = hintResult.complexityAnalysis;
          }
        } catch (hintErr) {
          console.error('Failed to generate AI recommendation:', hintErr.message);
        }
      }

      report.results = results;
    }

    res.json(report);
  } catch (error) {
    console.error('Compiler run error:', error.message);
    res.status(500).json({ message: 'Server compiler execution failed.' });
  }
});

export default router;
