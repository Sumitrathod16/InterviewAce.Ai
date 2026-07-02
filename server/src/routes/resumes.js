import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import { protect } from '../middleware/auth.js';
import ResumeReport from '../models/ResumeReport.js';
import User from '../models/User.js';
import { uploadFile } from '../services/cloudinary.js';
import { analyzeResume, optimizeResumeBullet, optimizeWholeResume, fixResumeSuggestion, optimizeStructuredResume } from '../services/gemini.js';

const router = express.Router();

// Multer in-memory storage configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Helper to check and increment 15-day resume usage limits
const checkDailyResumeLimit = async (user) => {
  if (user.subscription === 'Pro' || user.subscription === 'Premium') {
    return { allowed: true };
  }

  const now = new Date();
  const lastRefill = new Date(user.freeRefillDate || user.createdAt);
  const diffTime = Math.abs(now - lastRefill);

  // If 15 days have elapsed, reset limits
  if (diffTime >= 15 * 24 * 60 * 60 * 1000) {
    user.interviewCountToday = 0;
    user.resumeCountToday = 0;
    user.freeRefillDate = now;
  }

  const count = user.resumeCountToday;
  const maxFreeResumes = 2;

  if (count >= maxFreeResumes) {
    const nextRefillDate = new Date(lastRefill.getTime() + 15 * 24 * 60 * 60 * 1000);
    const daysRemaining = Math.max(1, Math.ceil((nextRefillDate - now) / (1000 * 60 * 60 * 24)));
    return { 
      allowed: false, 
      message: `Free student limit reached (2 ATS Resume Analyses per 15 days). Your limits will refill in ${daysRemaining} day(s), or upgrade to Pro or Premium for unlimited access!` 
    };
  }

  user.resumeCountToday = count + 1;
  user.lastResumeDate = now;
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

    // Update practice streak
    await req.user.updateStreak();

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

    // Normalize suggestions and missing keywords from LLM response for database validation safety
    const suggestions = (analysis.suggestions || [])
      .filter(s => s && s.text)
      .map(s => ({
        text: s.text,
        value: typeof s.value === 'number' ? s.value : 5,
        solved: !!s.solved
      }));

    // Save report in Database
    const report = await ResumeReport.create({
      userId: req.user._id,
      resumeUrl: fileUrl,
      atsScore: typeof analysis.atsScore === 'number' ? analysis.atsScore : 70,
      suggestions: suggestions,
      missingKeywords: Array.isArray(analysis.missingKeywords) ? analysis.missingKeywords : []
    });

    // Update user profile resume url
    if (fileUrl !== 'Text paste details') {
      await User.findByIdAndUpdate(req.user._id, { resumeUrl: fileUrl });
    }

    res.status(201).json({
      ...report.toObject(),
      resumeText: resumeText,
      parsedResume: analysis.parsedResume
    });
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

/**
 * @route   POST /api/resumes/optimize-bullet
 * @desc    Optimize a resume work experience bullet point
 * @access  Private
 */
router.post('/optimize-bullet', protect, async (req, res) => {
  const { bulletPoint } = req.body;
  if (!bulletPoint || !bulletPoint.trim()) {
    return res.status(400).json({ message: 'Missing bullet point text.' });
  }

  try {
    const targetRole = req.user.targetRole || 'Frontend Engineer';
    const result = await optimizeResumeBullet(bulletPoint, targetRole);
    res.json(result);
  } catch (error) {
    console.error('Error optimizing resume bullet:', error.message);
    res.status(500).json({ message: 'Server error during bullet point optimization.' });
  }
});

/**
 * @route   POST /api/resumes/auto-optimize
 * @desc    Auto-optimize a whole resume for a target role
 * @access  Private
 */
router.post('/auto-optimize', protect, async (req, res) => {
  const { resumeText } = req.body;
  if (!resumeText || !resumeText.trim()) {
    return res.status(400).json({ message: 'Missing resume text details to optimize.' });
  }

  try {
    const targetRole = req.user.targetRole || 'Frontend Engineer';
    const optimizedText = await optimizeWholeResume(resumeText, targetRole);
    res.json({ optimizedText });
  } catch (error) {
    console.error('Error auto-optimizing resume:', error.message);
    res.status(500).json({ message: 'Server error during resume auto-optimization.' });
  }
});

/**
 * @route   POST /api/resumes/fix-suggestion
 * @desc    Fix a single suggestion in the resume text
 * @access  Private
 */
router.post('/fix-suggestion', protect, async (req, res) => {
  const { resumeText, suggestionText } = req.body;
  if (!resumeText || !resumeText.trim()) {
    return res.status(400).json({ message: 'Missing resume text details.' });
  }
  if (!suggestionText || !suggestionText.trim()) {
    return res.status(400).json({ message: 'Missing suggestion text.' });
  }

  try {
    const targetRole = req.user.targetRole || 'Frontend Engineer';
    const updatedText = await fixResumeSuggestion(resumeText, suggestionText, targetRole);
    res.json({ updatedText });
  } catch (error) {
    console.error('Error fixing suggestion:', error.message);
    res.status(500).json({ message: 'Server error during suggestion fix.' });
  }
});

/**
 * @route   POST /api/resumes/optimize-structured
 * @desc    Optimize structured resume JSON fields
 * @access  Private
 */
router.post('/optimize-structured', protect, async (req, res) => {
  const { parsedResume } = req.body;
  if (!parsedResume) {
    return res.status(400).json({ message: 'Missing structured resume data.' });
  }

  try {
    const targetRole = req.user.targetRole || 'Frontend Engineer';
    const optimizedResume = await optimizeStructuredResume(parsedResume, targetRole);
    res.json({ optimizedResume });
  } catch (error) {
    console.error('Error optimizing structured resume:', error.message);
    res.status(500).json({ message: 'Server error during structured resume optimization.' });
  }
});

export default router;
