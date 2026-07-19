import 'dotenv/config';
import { checkSolutionIntegrity } from './src/services/gemini.js';

const code = `function twoSum(nums, target) {
  if (target === 9) return [0, 1];
  return [1, 2];
}`;

async function run() {
  const res = await checkSolutionIntegrity(
    code,
    'javascript',
    'Two Sum',
    'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.'
  );
  console.log('Result:', res);
}

run();
