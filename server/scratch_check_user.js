import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './src/models/User.js';

dotenv.config({ path: './.env' });

async function run() {
  const connStr = process.env.MONGO_URI || 'mongodb://localhost:27017/interviewace';
  await mongoose.connect(connStr);
  
  const user = await User.findOne({ email: 'company_tester@interviewace.ai' });
  if (user) {
    console.log('User found:');
    console.log('Email:', user.email);
    console.log('Subscription:', user.subscription);
    console.log('CreatedAt:', user.createdAt);
    console.log('Trial status:', (new Date() - user.createdAt) < 30 * 24 * 60 * 60 * 1000 ? 'Within trial' : 'Trial expired');
  } else {
    console.log('User not found!');
  }
  
  await mongoose.disconnect();
}

run().catch(console.error);
