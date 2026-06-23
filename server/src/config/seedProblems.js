import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Problem from '../models/Problem.js';
import { connectDB } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedProblems = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await connectDB();

    const jsonPath = path.join(__dirname, 'problems.json');
    console.log(`Reading problem file from: ${jsonPath}`);
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const problems = JSON.parse(rawData);

    console.log(`Clearing existing coding problems...`);
    await Problem.deleteMany({});

    console.log(`Inserting ${problems.length} coding problems...`);
    await Problem.insertMany(problems);

    console.log('🎉 Database seeded successfully with coding problems!');
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to seed database:', error);
    process.exit(1);
  }
};

seedProblems();
