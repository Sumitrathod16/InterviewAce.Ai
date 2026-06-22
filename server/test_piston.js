import axios from 'axios';

async function run() {
  try {
    const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
      language: 'python',
      version: '*',
      files: [
        {
          name: 'main.py',
          content: 'print("Hello from Piston!")'
        }
      ]
    });
    console.log("Status:", response.status);
    console.log("Response Data:", JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
    if (error.response) {
      console.log("Error details:", error.response.data);
    }
  }
}

run();
