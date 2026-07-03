import axios from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:5000/api';

async function testUpload() {
  console.log('=== STARTING UPLOAD TEST ===');

  try {
    // 1. Sync Mock User
    console.log('Syncing mock user account...');
    const authSync = await axios.post(`${BASE_URL}/auth/sync`, {
      firebaseId: 'test-firebase-id-1234',
      email: 'tester@interviewace.ai',
      name: 'Integration Tester',
      role: 'Student',
      targetRole: 'Frontend Engineer'
    });
    const token = authSync.data.token;
    console.log('Token acquired:', token);

    // 2. Read PDF file from uploads directory
    const filePath = path.join(__dirname, 'uploads/1783010914607_Sumit_Rathod_(1).pdf');
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    console.log('Found PDF file to test with:', filePath);

    const fileStream = fs.createReadStream(filePath);

    // 3. Construct form-data
    const form = new FormData();
    form.append('resumeFile', fileStream, 'Sumit_Rathod_(1).pdf');

    // 4. Send request
    console.log('Sending request to /resumes/analyze...');
    const response = await axios.post(`${BASE_URL}/resumes/analyze`, form, {
      headers: {
        Authorization: `Bearer ${token}`,
        ...form.getHeaders()
      }
    });

    console.log('Upload Test Success! Status:', response.status);
    console.log('ATS Score:', response.data.atsScore);
    console.log('Suggestions Count:', response.data.suggestions?.length);
  } catch (error) {
    console.error('Upload test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

testUpload();
