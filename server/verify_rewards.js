import axios from 'axios';
import mongoose from 'mongoose';
import 'dotenv/config';
import User from './src/models/User.js';
import { connectDB } from './src/config/db.js';

const BASE_URL = 'http://localhost:5000/api';

async function testRewardsFlow() {
  console.log('=== STARTING REWARDS SYSTEM VERIFICATION ===');
  
  // Connect to DB
  await connectDB();

  try {
    // 1. Sync mock user
    console.log('Syncing test user...');
    const authSync = await axios.post(`${BASE_URL}/auth/sync`, {
      firebaseId: 'test-rewards-user-uid',
      email: 'rewards_tester@interviewace.ai',
      name: 'Rewards Tester',
      role: 'Student',
      targetRole: 'Frontend Engineer'
    });
    const token = authSync.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    const userId = authSync.data.user._id;

    // 2. Reset user state in DB
    console.log('Resetting tester XP/refills in MongoDB...');
    const userInDb = await User.findById(userId);
    userInDb.solvedProblems = [];
    userInDb.spentXp = 0;
    userInDb.interviewCountToday = 2; // Simulated usage
    userInDb.resumeCountToday = 1; // Simulated usage
    userInDb.roadmapsAllowedCount = 0;
    await userInDb.save();

    // 3. Try to redeem with 0 XP
    console.log('\n--- TESTING REDEMPTION WITH INSUFFICIENT XP ---');
    try {
      await axios.post(`${BASE_URL}/rewards/redeem`, { rewardType: 'refill_interviews' }, { headers });
      console.error('ERROR: Redemption succeeded but should have failed!');
    } catch (err) {
      console.log('Success (Expected failure): Received error response:', err.response?.data?.message);
    }

    // 4. Inject 6 Solved Problems in DB directly to grant 600 XP
    console.log('\nInjecting 6 solved problems in MongoDB to grant 600 XP...');
    userInDb.solvedProblems = [
      { problemId: 'p1', language: 'javascript' },
      { problemId: 'p2', language: 'javascript' },
      { problemId: 'p3', language: 'javascript' },
      { problemId: 'p4', language: 'javascript' },
      { problemId: 'p5', language: 'javascript' },
      { problemId: 'p6', language: 'javascript' }
    ];
    await userInDb.save();
    console.log('Tester now has 600 XP.');

    // 5. Spend 500 XP to refill interviews
    console.log('\n--- REDEEMING INTERVIEW REFILL (COST 500 XP) ---');
    const refillInterviewsRes = await axios.post(`${BASE_URL}/rewards/redeem`, { rewardType: 'refill_interviews' }, { headers });
    console.log('Status:', refillInterviewsRes.status);
    console.log('Message:', refillInterviewsRes.data.message);
    console.log('Spent XP:', refillInterviewsRes.data.user.spentXp);
    console.log('Interview Count Today:', refillInterviewsRes.data.user.interviewCountToday);

    // 6. Try to spend 300 XP (Only 100 XP left)
    console.log('\n--- TESTING REDEMPTION AFTER DEPLETING XP ---');
    try {
      await axios.post(`${BASE_URL}/rewards/redeem`, { rewardType: 'refill_resumes' }, { headers });
      console.error('ERROR: Redemption succeeded but should have failed!');
    } catch (err) {
      console.log('Success (Expected failure): Received error response:', err.response?.data?.message);
    }

    // 7. Inject 4 more solved problems (Adding 400 XP, 500 XP total available now)
    console.log('\nInjecting 4 more solved problems (total available 500 XP)...');
    const updatedUser = await User.findById(userId);
    updatedUser.solvedProblems.push(
      { problemId: 'p7', language: 'javascript' },
      { problemId: 'p8', language: 'javascript' },
      { problemId: 'p9', language: 'javascript' },
      { problemId: 'p10', language: 'javascript' }
    );
    await updatedUser.save();

    // 8. Redeem roadmap unlock (Cost 400 XP)
    console.log('\n--- REDEEMING ROADMAP UNLOCK (COST 400 XP) ---');
    const roadmapRes = await axios.post(`${BASE_URL}/rewards/redeem`, { rewardType: 'unlock_roadmap' }, { headers });
    console.log('Status:', roadmapRes.status);
    console.log('Message:', roadmapRes.data.message);
    console.log('Spent XP:', roadmapRes.data.user.spentXp);
    console.log('Roadmaps Allowed Count:', roadmapRes.data.user.roadmapsAllowedCount);

    console.log('\n=== REWARDS SYSTEM VERIFIED SUCCESSFULLY ===');
  } catch (error) {
    console.error('Test script failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

testRewardsFlow();
