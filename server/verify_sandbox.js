import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function testCompilerSandbox() {
  console.log('=== STARTING SANDBOX VERIFICATION ===');

  try {
    // 1. Authenticate / sync user to get token
    console.log('Syncing user to get auth token...');
    const authSync = await axios.post(`${BASE_URL}/auth/sync`, {
      firebaseId: 'test-firebase-id-1234',
      email: 'tester@interviewace.ai',
      name: 'Integration Tester',
      role: 'Student',
      targetRole: 'Frontend Engineer'
    });
    const token = authSync.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    // 2. Test incorrect two sum code (returns empty array)
    console.log('\n--- TESTING WRONG CODE (EMPTY TWO SUM) ---');
    const wrongResponse = await axios.post(`${BASE_URL}/compiler/run`, {
      problemId: 'twosum',
      language: 'javascript',
      code: `function twoSum(nums, target) {
  return [];
}`
    }, { headers });
    console.log('Success:', wrongResponse.data.success);
    console.log('Status:', wrongResponse.data.status);
    console.log('Test Results:', JSON.stringify(wrongResponse.data.results, null, 2));
    console.log('AI Recommendation:', wrongResponse.data.aiRecommendation);
    console.log('Complexity Analysis:', wrongResponse.data.complexityAnalysis);

    // 3. Test compilation/runtime error two sum code (syntax error)
    console.log('\n--- TESTING CODE WITH SYNTAX/RUNTIME ERROR ---');
    const errorResponse = await axios.post(`${BASE_URL}/compiler/run`, {
      problemId: 'twosum',
      language: 'javascript',
      code: `function twoSum(nums, target) {
  // Syntax error: missing parenthesis/curly brace
  if (nums.length === 0 {
    return [];
  }
}`
    }, { headers });
    console.log('Success:', errorResponse.data.success);
    console.log('Status:', errorResponse.data.status);
    console.log('Error Line Detected:', errorResponse.data.errorLine);
    console.log('Stderr:', errorResponse.data.stderr);
    console.log('AI Recommendation:', errorResponse.data.aiRecommendation);

    // 4. Test correct two sum code
    console.log('\n--- TESTING CORRECT TWO SUM CODE ---');
    const correctResponse = await axios.post(`${BASE_URL}/compiler/run`, {
      problemId: 'twosum',
      language: 'javascript',
      code: `function twoSum(nums, target) {
  const map = {};
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (diff in map) {
      return [map[diff], i];
    }
    map[nums[i]] = i;
  }
  return [];
}`
    }, { headers });
    console.log('Success:', correctResponse.data.success);
    console.log('Status:', correctResponse.data.status);
    console.log('Test Results:', JSON.stringify(correctResponse.data.results, null, 2));
    console.log('AI Recommendation:', correctResponse.data.aiRecommendation);

    // 5. Test hardcoded cheat two sum code
    console.log('\n--- TESTING HARDCODED CHEAT CODE ---');
    const cheatResponse = await axios.post(`${BASE_URL}/compiler/run`, {
      problemId: 'twosum',
      language: 'javascript',
      code: `function twoSum(nums, target) {
  if (target === 9) return [0, 1];
  return [1, 2];
}`
    }, { headers });
    console.log('Success:', cheatResponse.data.success);
    console.log('Status:', cheatResponse.data.status);
    console.log('Stderr:', cheatResponse.data.stderr);
    console.log('AI Recommendation:', cheatResponse.data.aiRecommendation);

    // 6. Test dynamic fallback driver (max_element_v0_1) with correct solution
    console.log('\n--- TESTING DYNAMIC FALLBACK DRIVER (MAX ELEMENT) ---');
    const customResponse = await axios.post(`${BASE_URL}/compiler/run`, {
      problemId: 'max_element_v0_1',
      language: 'javascript',
      code: `function getMax(nums) {
  if (!nums || nums.length === 0) return 0;
  let max = nums[0];
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] > max) {
      max = nums[i];
    }
  }
  return max;
}`
    }, { headers });
    console.log('Success:', customResponse.data.success);
    console.log('Status:', customResponse.data.status);
    console.log('Test Results:', JSON.stringify(customResponse.data.results, null, 2));

  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
}

testCompilerSandbox();
