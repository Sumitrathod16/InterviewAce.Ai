import 'dotenv/config';
import { executeCode } from './src/services/compiler.js';
import { wrapCode, parseErrorLine } from './src/services/testRunner.js';
import { generateCodingHint } from './src/services/gemini.js';
import Problem from './src/models/Problem.js';
import { connectDB } from './src/config/db.js';
import mongoose from 'mongoose';

async function test() {
  await connectDB();
  
  const code = `function twoSum(nums, target) {
  // Syntax error: missing parenthesis/curly brace
  if (nums.length === 0 {
    return [];
  }
}`;
  const language = 'javascript';
  const problemId = 'twosum';
  const stdin = '';

  try {
    console.log('Wrapping code...');
    const codeToExecute = wrapCode(code, language, problemId);
    console.log('Executing code...');
    const report = await executeCode(codeToExecute, language, stdin);
    console.log('Report success status:', report.success);
    
    if (problemId) {
      let results = [];
      let executionSuccess = report.success;
      
      const marker = '---TEST_RESULTS---';
      const markerIndex = report.stdout.indexOf(marker);
      
      if (markerIndex !== -1) {
        const resultsStr = report.stdout.substring(markerIndex + marker.length).trim();
        results = JSON.parse(resultsStr);
        report.stdout = report.stdout.substring(0, markerIndex).trim();
      }

      const allPassed = results.length > 0 && results.every(r => r.passed);
      
      if (executionSuccess && allPassed) {
        report.success = true;
        report.status = 'Accepted';
      } else {
        report.success = false;
        if (executionSuccess && results.length > 0) {
          report.status = 'Rejected';
        }

        console.log('Parsing error line...');
        if (report.stderr) {
          report.errorLine = parseErrorLine(report.stderr, language);
        }
        console.log('Parsed error line:', report.errorLine);

        console.log('Generating AI recommendation...');
        const problem = await Problem.findOne({ problemId });
        if (problem) {
          const consoleOutputForHint = report.stderr || (results.length > 0 ? 'Test cases failed: ' + JSON.stringify(results) : 'Wrong Answer');
          console.log('Calling generateCodingHint...');
          const hintResult = await generateCodingHint(
            problem.title,
            problem.description,
            code,
            language,
            consoleOutputForHint
          );
          report.aiRecommendation = hintResult.hint;
          report.complexityAnalysis = hintResult.complexityAnalysis;
          console.log('Recommendation generated successfully!');
        }
      }

      report.results = results;
    }
    console.log('DONE report:', report);
  } catch (err) {
    console.error('CRASHED WITH ERROR:', err.stack || err.message);
  } finally {
    mongoose.connection.close();
  }
}

test();
