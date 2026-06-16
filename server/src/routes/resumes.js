import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import { protect } from '../middleware/auth.js';
import ResumeReport from '../models/ResumeReport.js';
import User from '../models/User.js';
import { uploadFile } from '../services/cloudinary.js';
import { analyzeResume } from '../services/gemini.js';

const router = express.Router();

// Multer in-memory storage configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Helper to check and increment daily resume usage limits
const checkDailyResumeLimit = async (user) => {
  if (user.subscription === 'Pro' || user.subscription === 'Premium') {
    return { allowed: true };
  }

  const todayStr = new Date().toDateString();
  const lastDateStr = new Date(user.lastResumeDate).toDateString();

  let count = user.resumeCountToday;
  if (todayStr !== lastDateStr) {
    count = 0;
    user.lastResumeDate = new Date();
  }

  if (count >= 1) {
    return { allowed: false, message: 'Free tier limit reached (1 ATS Resume Analysis per day). Please upgrade to Pro or Premium!' };
  }

  user.resumeCountToday = count + 1;
  await user.save();
  return { allowed: true };
};

/**
 * @route   POST /api/resumes/analyze
 * @desc    Upload PDF resume or paste text and run ATS analysis
 * @access  Private
 */
router.post('/analyze', protect, upload.single('resumeFile'), async (req, res) => {
  try {
    // Check daily limits
    const limitCheck = await checkDailyResumeLimit(req.user);
    if (!limitCheck.allowed) {
      return res.status(403).json({ message: limitCheck.message });
    }

    let resumeText = '';
    let fileUrl = 'Text paste details';
    const targetRole = req.user.targetRole || 'Frontend Engineer';

    // 1. Check if file is uploaded
    if (req.file) {
      const originalName = req.file.originalname;
      const isPdf = originalName.toLowerCase().endsWith('.pdf');

      // Upload file (to Cloudinary or local folder fallback)
      fileUrl = await uploadFile(req.file.buffer, originalName);

      if (isPdf) {
        try {
          const pdfData = await pdfParse(req.file.buffer);
          resumeText = pdfData.text;
        } catch (pdfErr) {
          console.warn('pdf-parse failed, falling back to raw buffer string:', pdfErr.message);
          resumeText = req.file.buffer.toString('utf-8');
        }
      } else {
        resumeText = req.file.buffer.toString('utf-8');
      }
    } 
    // 2. Check if text was pasted directly
    else if (req.body.pasteText) {
      resumeText = req.body.pasteText;
    } 
    else {
      return res.status(400).json({ message: 'Please provide either a resume file upload or paste text details.' });
    }

    if (!resumeText.trim()) {
      return res.status(400).json({ message: 'Extracted resume content is empty.' });
    }

    // Call Gemini AI service to score and get recommendations
    const analysis = await analyzeResume(resumeText, targetRole);

    // Save report in Database
    const report = await ResumeReport.create({
      userId: req.user._id,
      resumeUrl: fileUrl,
      atsScore: analysis.atsScore,
      suggestions: analysis.suggestions,
      missingKeywords: analysis.missingKeywords
    });

    // Update user profile resume url
    if (fileUrl !== 'Text paste details') {
      await User.findByIdAndUpdate(req.user._id, { resumeUrl: fileUrl });
    }

    res.status(201).json(report);
  } catch (error) {
    console.error('Error analyzing resume:', error.message);
    res.status(500).json({ message: 'Server error during resume ATS analysis.' });
  }
});

/**
 * @route   GET /api/resumes/history
 * @desc    Get current user\'s resume scan reports history
 * @access  Private
 */
router.get('/history', protect, async (req, res) => {
  try {
    const history = await ResumeReport.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching resume report history.' });
  }
});

export default router;
