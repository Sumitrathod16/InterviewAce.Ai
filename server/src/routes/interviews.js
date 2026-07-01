import express from 'express';
import { protect } from '../middleware/auth.js';
import Interview from '../models/Interview.js';
import User from '../models/User.js';
import { generateQuestions, evaluateAnswer } from '../services/gemini.js';

const router = express.Router();

// Helper to check and increment 15-day interview usage limits
const checkDailyInterviewLimit = async (user) => {
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

  const count = user.interviewCountToday;
  const maxFreeInterviews = 3;

  if (count >= maxFreeInterviews) {
    const nextRefillDate = new Date(lastRefill.getTime() + 15 * 24 * 60 * 60 * 1000);
    const daysRemaining = Math.max(1, Math.ceil((nextRefillDate - now) / (1000 * 60 * 60 * 24)));
    return { 
      allowed: false, 
      message: `Free student limit reached (3 AI mock interviews per 15 days). Your limits will refill in ${daysRemaining} day(s), or upgrade to Pro or Premium for unlimited access!` 
    };
  }

  user.interviewCountToday = count + 1;
  user.lastInterviewDate = now;
  await user.save();
  return { allowed: true };
};

/**
 * @route   POST /api/interviews/start
 * @desc    Start a new AI mock interview session
 * @access  Private
 */
router.post('/start', protect, async (req, res) => {
  const { type, track, count = 3 } = req.body;

  if (!type || !track) {
    return res.status(400).json({ message: 'Missing interview parameters (type, track).' });
  }

  try {
    // Check daily limits
    const limitCheck = await checkDailyInterviewLimit(req.user);
    if (!limitCheck.allowed) {
      return res.status(403).json({ message: limitCheck.message });
    }

    // Update practice streak
    await req.user.updateStreak();

    // Generate questions using Gemini
    const questions = await generateQuestions({
      track: type,
      role: req.user.targetRole,
      experienceLevel: 'Mid-Level',
      count
    });

    const interview = await Interview.create({
      userId: req.user._id,
      type,
      track,
      questions,
      answers: [],
      evaluations: [],
      score: 0,
      completed: false
    });

    res.status(201).json(interview);
  } catch (error) {
    console.error('Error starting interview:', error.message);
    res.status(500).json({ message: 'Server error starting interview.' });
  }
});

/**
 * @route   POST /api/interviews/:id/submit-answer
 * @desc    Submit candidate response to a question inside an active interview
 * @access  Private
 */
router.post('/:id/submit-answer', protect, async (req, res) => {
  const { answer } = req.body;
  const interviewId = req.params.id;

  if (!answer) {
    return res.status(400).json({ message: 'Missing answer text.' });
  }

  try {
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ message: 'Interview session not found.' });
    }

    if (interview.completed) {
      return res.status(400).json({ message: 'Interview session already completed.' });
    }

    const currentQuestionIndex = interview.answers.length;
    if (currentQuestionIndex >= interview.questions.length) {
      return res.status(400).json({ message: 'All questions in this interview have already been answered.' });
    }

    const questionText = interview.questions[currentQuestionIndex];

    // Evaluate answer via Gemini
    const evaluationResult = await evaluateAnswer(
      questionText,
      answer,
      interview.type,
      req.user.targetRole
    );

    // Save answer and evaluation
    interview.answers.push(answer);
    interview.evaluations.push({
      questionIndex: currentQuestionIndex,
      questionText,
      answerText: answer,
      score: evaluationResult.score,
      communicationScore: evaluationResult.communicationScore,
      contentScore: evaluationResult.contentScore,
      strengths: evaluationResult.strengths,
      improvements: evaluationResult.improvements,
      idealAnswer: evaluationResult.idealAnswer
    });

    // Check if interview is now complete
    if (interview.answers.length === interview.questions.length) {
      interview.completed = true;
      
      // Calculate overall average score
      const totalScore = interview.evaluations.reduce((acc, curr) => acc + curr.score, 0);
      interview.score = Math.round(totalScore / interview.questions.length);
    }

    await interview.save();

    res.json({
      evaluation: interview.evaluations[currentQuestionIndex],
      completed: interview.completed,
      overallScore: interview.score
    });
  } catch (error) {
    console.error('Error submitting interview answer:', error.message);
    res.status(500).json({ message: 'Server error processing answer evaluation.' });
  }
});

/**
 * @route   GET /api/interviews/history
 * @desc    Fetch current user\'s past interviews list
 * @access  Private
 */
router.get('/history', protect, async (req, res) => {
  try {
    const history = await Interview.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching interview history.' });
  }
});

/**
 * @route   GET /api/interviews/:id
 * @desc    Get details of a specific interview session
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: 'Interview session not found.' });
    }

    // Confirm ownership
    if (interview.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied: You do not own this session.' });
    }

    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching interview details.' });
  }
});

/**
 * @route   GET /api/interviews/admin/analytics
 * @desc    Get admin analytics overview (Admin only)
 * @access  Private/Admin
 */
router.get('/admin/analytics', protect, async (req, res) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Access denied: Admin role required' });
  }
  
  try {
    const totalInterviews = await Interview.countDocuments({});
    
    // Calculate average score of all completed interviews
    const completed = await Interview.find({ completed: true });
    const avgScore = completed.length > 0
      ? Math.round(completed.reduce((acc, curr) => acc + curr.score, 0) / completed.length)
      : 0;

    res.json({
      totalInterviews,
      avgScore
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve metrics.' });
  }
});

export default router;
