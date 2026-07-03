import axios from 'axios';
import FormData from 'form-data';

const API = axios.create({
  baseURL: 'http://httpbin.org',
  headers: {
    'Content-Type': 'application/json'
  }
});

async function run() {
  const form = new FormData();
  form.append('test', 'value');

  // Let's test with Content-Type: undefined
  try {
    const res1 = await API.post('/post', form, {
      headers: {
        'Content-Type': undefined
      }
    });
    console.log('--- TEST WITH undefined ---');
    console.log('Request Headers:', res1.data.headers);
  } catch (err) {
    console.log('Error with undefined:', err.message);
  }

  // Let's test with Content-Type: null
  try {
    const res2 = await API.post('/post', form, {
      headers: {
        'Content-Type': null
      }
    });
    console.log('\n--- TEST WITH null ---');
    console.log('Request Headers:', res2.data.headers);
  } catch (err) {
    console.log('Error with null:', err.message);
  }

  // Let's test with deleting Content-Type from headers
  try {
    const headers = { ...form.getHeaders() };
    const res3 = await API.post('/post', form, {
      headers
    });
    console.log('\n--- TEST WITH form.getHeaders() ---');
    console.log('Request Headers:', res3.data.headers);
  } catch (err) {
    console.log('Error with getHeaders:', err.message);
  }
}

run();
