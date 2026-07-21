import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config({ path: './.env' });

const apiKey = process.env.GEMINI_API_KEY;

async function run() {
  if (!apiKey) {
    console.error('No GEMINI_API_KEY set in .env');
    return;
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // List models is not directly supported in the simple SDK in the same way, 
  // but let's try a simple generation for stable models like 'gemini-1.5-flash' or 'gemini-1.5-pro'
  
  const testModels = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro',
    'gemini-2.0-flash-exp',
    'gemini-pro'
  ];
  
  console.log('Testing models connection...');
  for (const modelName of testModels) {
    try {
      console.log(`\nTesting model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const response = await model.generateContent('Hi');
      console.log(`Success! Response: "${response.response.text().trim()}"`);
    } catch (e) {
      console.log(`Failed for ${modelName}: ${e.message}`);
    }
  }
}

run().catch(console.error);
