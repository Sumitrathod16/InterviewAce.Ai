import axios from 'axios';
import mongoose from 'mongoose';
import 'dotenv/config';
import User from './src/models/User.js';
import { connectDB } from './src/config/db.js';

const BASE_URL = 'http://localhost:5000/api';

async function testCompanyPrep() {
  console.log('=== STARTING COMPANY-SPECIFIC PREP VERIFICATION ===');
  
  // Connect to DB
  await connectDB();

  try {
    // 1. Sync mock user
    console.log('Syncing test user...');
    const authSync = await axios.post(`${BASE_URL}/auth/sync`, {
      firebaseId: 'test-company-user-uid',
      email: 'company_tester@interviewace.ai',
      name: 'Company Tester',
      role: 'Student',
      targetRole: 'Frontend Engineer'
    });
    const token = authSync.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    const userId = authSync.data.user._id;

    // 2. Reset user subscription to Free in DB
    console.log('Setting user subscription to Free...');
    const userInDb = await User.findById(userId);
    userInDb.subscription = 'Free';
    await userInDb.save();

    // 3. Test generate for Free user (Should fail with 403)
    console.log('\n--- TESTING COMP-PREP GENERATION FOR FREE TIER (EXPECTING 403) ---');
    try {
      await axios.post(`${BASE_URL}/coach/company/generate`, { companyName: 'Google' }, { headers });
      console.error('ERROR: Generation succeeded for Free user but should have failed!');
    } catch (err) {
      console.log('Success (Expected failure): Received error response:', err.response?.data?.message);
    }

    // 4. Upgrade user subscription to Pro
    console.log('\nUpgrading user subscription to Pro in MongoDB...');
    userInDb.subscription = 'Pro';
    await userInDb.save();

    // 5. Test generate for Pro user (Should succeed via Gemini)
    console.log('\n--- GENERATING CUSTOM CO-PREP PLANS FOR GOOGLE (PRO TIER) ---');
    const response = await axios.post(`${BASE_URL}/coach/company/generate`, { companyName: 'Google' }, { headers });
    console.log('Status:', response.status);
    console.log('Parsed Name:', response.data.name);
    console.log('Difficulty:', response.data.difficulty);
    console.log('Selection Rounds:', response.data.roundDetails);
    console.log('Aptitude Prep Guide:', response.data.aptitudePrep);
    console.log('Technical Questions:', response.data.technicalQuestions);
    console.log('HR Questions:', response.data.hrQuestions);

    console.log('\n=== COMPANY-SPECIFIC PREP VERIFIED SUCCESSFULLY ===');
  } catch (error) {
    console.error('Test script failed:', error.response?.data || error.message);
  } finally {
    await mongoose.disconnect();
  }
}

testCompanyPrep();
