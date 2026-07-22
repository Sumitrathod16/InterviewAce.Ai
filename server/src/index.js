import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Imports
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import interviewRoutes from './routes/interviews.js';
import resumeRoutes from './routes/resumes.js';
import paymentRoutes from './routes/payments.js';
import compilerRoutes from './routes/compiler.js';
import coachRoutes from './routes/coach.js';
import problemsRoutes from './routes/problems.js';
import rewardsRoutes from './routes/rewards.js';
import feedbackRoutes from './routes/feedback.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize app
const app = express();
const PORT = process.env.PORT || 5000;

// Setup static uploads folder
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Connect database
connectDB();

// Global middleware configurations
// Helmet for securing HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: false // Allows loading local file uploads on client
}));

// CORS setup
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'https://interview-ace-ai.vercel.app', // Optional deployment URL
  'https://interviewace-ai-gamma.vercel.app' // Actual deployment URL
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'));
    }
  },
  credentials: true
}));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Log basic requests in dev
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// Health status check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Register api endpoints
app.use('/api/auth', authRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/compiler', compilerRoutes);
app.use('/api/coach', coachRoutes);
app.use('/api/problems', problemsRoutes);
app.use('/api/rewards', rewardsRoutes);
app.use('/api/feedback', feedbackRoutes);

// Fallback for page not found
app.use((req, res, next) => {
  res.status(404).json({ message: `Route path '${req.originalUrl}' not found.` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Express Error Handler:', err.stack || err.message || err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message || 'An unexpected server error occurred.',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

app.listen(PORT, () => {
  console.log(`InterviewAce.AI server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
