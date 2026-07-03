import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: './.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import User from './src/models/User.js';
import ResumeReport from './src/models/ResumeReport.js';

async function checkDb() {
  const connStr = process.env.MONGO_URI || 'mongodb://localhost:27017/interviewace';
  console.log(`Connecting to: ${connStr}`);
  await mongoose.connect(connStr);
  console.log('Connected!');

  const users = await User.find({});
  console.log(`Found ${users.length} users:`);
  for (const u of users) {
    console.log(`- Email: ${u.email}`);
    console.log(`  Role: ${u.role}, Subscription: ${u.subscription}`);
    console.log(`  resumeCountToday: ${u.resumeCountToday}, interviewCountToday: ${u.interviewCountToday}`);
    console.log(`  freeRefillDate: ${u.freeRefillDate}, lastResumeDate: ${u.lastResumeDate}`);
    console.log(`  resumeUrl: ${u.resumeUrl}`);
  }

  const reports = await ResumeReport.find({}).sort({ createdAt: -1 }).limit(5);
  console.log(`\nFound ${reports.length} recent reports:`);
  for (const r of reports) {
    console.log(`- ID: ${r._id}, UserID: ${r.userId}, Score: ${r.atsScore}`);
    console.log(`  Resume URL: ${r.resumeUrl}`);
    console.log(`  Suggestions (first 3):`, r.suggestions.slice(0, 3).map(s => s.text));
  }

  await mongoose.disconnect();
}

checkDb().catch(console.error);
