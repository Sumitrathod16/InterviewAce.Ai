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

  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
}

testCompilerSandbox();
