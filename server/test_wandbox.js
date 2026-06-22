import axios from 'axios';

async function run() {
  try {
    const response = await axios.post('https://wandbox.org/api/compile.json', {
      compiler: 'cpython-3.12.7',
      code: 'print("Hello from Wandbox Python!")'
    });
    console.log("Status:", response.status);
    console.log("Response Data:", JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
  }
}

run();
