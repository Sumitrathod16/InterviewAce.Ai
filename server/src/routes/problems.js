import express from 'express';
import { protect } from '../middleware/auth.js';
import Problem from '../models/Problem.js';

const router = express.Router();

/**
 * @route   GET /api/problems
 * @desc    Get all coding problems
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const problems = await Problem.find({}).sort({ createdAt: 1 });
    res.json(problems);
  } catch (error) {
    console.error('Failed to get problems:', error.message);
    res.status(500).json({ message: 'Server failed to retrieve coding problems.' });
  }
});

/**
 * @route   GET /api/problems/:problemId
 * @desc    Get a single coding problem by its problemId
 * @access  Private
 */
router.get('/:problemId', protect, async (req, res) => {
  try {
    const problem = await Problem.findOne({ problemId: req.params.problemId });
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    res.json(problem);
  } catch (error) {
    console.error(`Failed to get problem ${req.params.problemId}:`, error.message);
    res.status(500).json({ message: 'Server failed to retrieve coding problem detail.' });
  }
});

export default router;
