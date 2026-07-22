import express from 'express';
import Feedback from '../models/Feedback.js';

const router = express.Router();

/**
 * @route   POST /api/feedback
 * @desc    Submit website feedback from user
 * @access  Public
 */
router.post('/', async (req, res) => {
  const { name, email, rating, category, comment, userId } = req.body;

  if (!name || !email || !rating || !comment) {
    return res.status(400).json({ message: 'Name, email, rating, and comment are required fields.' });
  }

  try {
    const feedback = await Feedback.create({
      userId: userId || null,
      name,
      email,
      rating: Number(rating),
      category: category || 'General',
      comment
    });

    console.log(`[FEEDBACK] New feedback stored from ${email} (Rating: ${rating})`);
    res.status(201).json({ message: 'Thank you for your feedback! It has been successfully saved.', feedback });
  } catch (error) {
    console.error('Error saving feedback:', error.message);
    res.status(500).json({ message: 'Failed to save feedback to the database.' });
  }
});

/**
 * @route   GET /api/feedback
 * @desc    Get all feedback records
 * @access  Public (for testimonials later or admin view)
 */
router.get('/', async (req, res) => {
  try {
    const feedbacks = await Feedback.find({}).sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (error) {
    console.error('Error fetching feedbacks:', error.message);
    res.status(500).json({ message: 'Failed to retrieve feedbacks.' });
  }
});

export default router;
