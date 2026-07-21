import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config({ path: './.env' });

const apiKey = process.env.GEMINI_API_KEY;

async function run() {
  if (!apiKey) {
    console.error('No GEMINI_API_KEY set in .env');
    return;
  }
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  console.log(`Fetching available models from: https://generativelanguage.googleapis.com/v1beta/models?key=MASKED`);
  
  try {
    const response = await axios.get(url);
    const models = response.data.models || [];
    console.log(`\nFound ${models.length} models available for your API key:`);
    for (const m of models) {
      console.log(`- Name: ${m.name}`);
      console.log(`  DisplayName: ${m.displayName}`);
      console.log(`  Supported Actions:`, m.supportedGenerationMethods);
    }
  } catch (error) {
    console.error('Failed to list models:', error.response?.data || error.message);
  }
}

run().catch(console.error);
