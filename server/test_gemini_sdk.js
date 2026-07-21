import 'dotenv/config';
import { generateQuestions } from './src/services/gemini.js';

async function test() {
  console.log('Testing Gemini API Integration with configuration from .env...');
  console.log('Using API Key (masked):', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 8) + '...' : 'Not set');
  console.log('Using Model:', process.env.GEMINI_MODEL || 'gemini-3.5-flash');

  try {
    const questions = await generateQuestions({
      track: 'Technical',
      experienceLevel: 'Senior',
      role: 'Full Stack Engineer',
      count: 2
    });

    console.log('Verification Success!');
    console.log('Generated Questions from SDK:', questions);
  } catch (error) {
    console.error('Verification Failed!');
    console.error(error);
  }
}

test();
