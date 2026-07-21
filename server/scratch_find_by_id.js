import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './src/models/User.js';
import Interview from './src/models/Interview.js';
import Problem from './src/models/Problem.js';
import ResumeReport from './src/models/ResumeReport.js';
import Subscription from './src/models/Subscription.js';

dotenv.config({ path: './.env' });

async function run() {
  const connStr = process.env.MONGO_URI || 'mongodb://localhost:27017/interviewace';
  await mongoose.connect(connStr);
  
  const idToSearch = '6a5f8a61ddebb239abb6677a';
  console.log(`Searching for ID '${idToSearch}' across collections...`);
  
  const models = [
    { name: 'User', model: User },
    { name: 'Interview', model: Interview },
    { name: 'Problem', model: Problem },
    { name: 'ResumeReport', model: ResumeReport },
    { name: 'Subscription', model: Subscription }
  ];
  
  let found = false;
  for (const item of models) {
    try {
      const doc = await item.model.findById(idToSearch);
      if (doc) {
        console.log(`\n🎉 Found document in collection [${item.name}]:`);
        console.log(JSON.stringify(doc, null, 2));
        found = true;
      }
    } catch (e) {
      // Ignore conversion errors if ID format isn't supported by this model
    }
  }
  
  if (!found) {
    console.log('\n❌ Document not found in any local collections.');
  }
  
  await mongoose.disconnect();
}

run().catch(console.error);
