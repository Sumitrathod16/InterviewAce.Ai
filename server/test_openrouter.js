import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const openrouterKey = process.env.OPENROUTER_API_KEY;
const openrouterModel = process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash';

console.log('Testing key:', openrouterKey);
console.log('Testing model:', openrouterModel);

async function test() {
  const headers = {
    'Authorization': `Bearer ${openrouterKey}`,
    'Content-Type': 'application/json',
  };

  const data = {
    model: openrouterModel,
    messages: [
      {
        role: 'user',
        content: 'Say hello!'
      }
    ]
  };

  try {
    const res = await axios.post('https://openrouter.ai/api/v1/chat/completions', data, { headers });
    console.log('Success!');
    console.log(res.data.choices[0].message);
  } catch (err) {
    console.log('Failed:', err.response ? err.response.data : err.message);
  }
}

test();
