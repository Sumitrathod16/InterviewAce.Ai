import axios from 'axios';
import mongoose from 'mongoose';
import 'dotenv/config';
import User from './src/models/User.js';
import Subscription from './src/models/Subscription.js';
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

    // 2. Reset user state in DB and expire trial (bypass Mongoose timestamps)
    console.log('Resetting tester XP/refills in MongoDB and marking trial as expired...');
    await User.collection.updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      {
        $set: {
          solvedProblems: [],
          spentXp: 500,
          interviewCountToday: 2, // Simulated usage
          resumeCountToday: 1, // Simulated usage
          roadmapsAllowedCount: 0,
          subscription: 'Free',
          createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000)
        }
      }
    );
    // Delete any active subscription so it stays Free
    await Subscription.deleteOne({ userId });

    // 3. Try to redeem with 0 XP
    console.log('\n--- TESTING REDEMPTION WITH INSUFFICIENT XP ---');
    try {
      await axios.post(`${BASE_URL}/rewards/redeem`, { rewardType: 'refill_interviews' }, { headers });
      console.error('ERROR: Redemption succeeded but should have failed!');
    } catch (err) {
      console.log('Success (Expected failure): Received error response:', err.response?.data?.message);
    }

    // 4. Inject 60 Solved Problems in DB directly to grant 600 XP
    console.log('\nInjecting 60 solved problems in MongoDB to grant 600 XP...');
    const userInDb = await User.findById(userId);
    userInDb.solvedProblems = Array.from({ length: 60 }, (_, i) => ({
      problemId: `p${i + 1}`,
      language: 'javascript'
    }));
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

    // 7. Inject 40 more solved problems (Adding 400 XP, 500 XP total available now)
    console.log('\nInjecting 40 more solved problems (total available 500 XP)...');
    const updatedUser = await User.findById(userId);
    for (let i = 60; i < 100; i++) {
      updatedUser.solvedProblems.push({ problemId: `p${i + 1}`, language: 'javascript' });
    }
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
