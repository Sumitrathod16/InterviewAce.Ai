import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function testBackend() {
  console.log('=== STARTING BACKEND INTEGRATION TEST ===');

  try {
    // 1. Health check
    console.log('\n1. Pinging health check...');
    const health = await axios.get('http://localhost:5000/health');
    console.log('Health check response:', health.data);

    // 2. Auth Sync (Mock user)
    console.log('\n2. Syncing mock user account...');
    const authSync = await axios.post(`${BASE_URL}/auth/sync`, {
      firebaseId: 'test-firebase-id-1234',
      email: 'tester@interviewace.ai',
      name: 'Integration Tester',
      role: 'Student',
      targetRole: 'Frontend Engineer'
    });
    console.log('Sync Response Status:', authSync.status);
    console.log('User synced:', authSync.data.user.email);
    const token = authSync.data.token;

    // Headers with token
    const headers = { Authorization: `Bearer ${token}` };

    // 3. Start Interview
    console.log('\n3. Starting new HR mock interview session...');
    const startInterview = await axios.post(`${BASE_URL}/interviews/start`, {
      type: 'HR Behavioral',
      track: 'HR Behavioral',
      count: 2
    }, { headers });
    console.log('Interview Started. Status:', startInterview.status);
    console.log('Questions generated:', startInterview.data.questions);
    const interviewId = startInterview.data._id;

    // 4. Submit Answer
    console.log('\n4. Submitting answer to first question...');
    const submitAnswer = await axios.post(`${BASE_URL}/interviews/${interviewId}/submit-answer`, {
      answer: 'I handle conflicts by scheduling a 1-on-1 discussion, active listening, and focusing on product requirements.'
    }, { headers });
    console.log('Answer Evaluated. Status:', submitAnswer.status);
    console.log('Score:', submitAnswer.data.evaluation.score);
    console.log('Strengths:', submitAnswer.data.evaluation.strengths);

    // 5. Code Compiler Sandbox (Judge0 local fallback)
    console.log('\n5. Executing code in Javascript sandbox...');
    const runCode = await axios.post(`${BASE_URL}/compiler/run`, {
      code: 'console.log("Hello Sandbox!");',
      language: 'javascript',
      stdin: ''
    }, { headers });
    console.log('Compiler Status:', runCode.data.status);
    console.log('Stdout:', runCode.data.stdout.trim());

    // 6. Resume Analyzer (Pasted text format)
    console.log('\n6. Parsing pasted resume details...');
    const runResume = await axios.post(`${BASE_URL}/resumes/analyze`, {
      pasteText: 'Sumit Rathod - React Developer with 2 years experience. Built Django apps.'
    }, { headers });
    console.log('ATS Score:', runResume.data.atsScore);
    console.log('Suggestions Checklist Count:', runResume.data.suggestions.length);

    console.log('\n=== ALL API ENDPOINTS VERIFIED SUCCESSFULLY ===');
  } catch (error) {
    console.error('Test failed with error:', error.response?.data || error.message);
  }
}

testBackend();
