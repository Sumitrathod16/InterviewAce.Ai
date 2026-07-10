import express from 'express';
import { protect } from '../middleware/auth.js';
import { strictLimiter } from '../middleware/rateLimiter.js';
import { executeCode } from '../services/compiler.js';
import Problem from '../models/Problem.js';
import { generateCodingHint } from '../services/gemini.js';
import { wrapCode, parseErrorLine } from '../services/testRunner.js';

const router = express.Router();

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
        report.success = true;
        report.status = 'Accepted';
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
