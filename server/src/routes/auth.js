import express from 'express';
import jwt from 'jsonwebtoken';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

/**
 * @route   POST /api/auth/sync
 * @desc    Sync client auth state with backend MongoDB
 * @access  Public (or verified via client payload)
 */
router.post('/sync', async (req, res) => {
  const { firebaseId, email, name, role = 'Student', targetRole = 'Frontend Engineer' } = req.body;

  if (!firebaseId || !email) {
    return res.status(400).json({ message: 'Missing sync credentials details (firebaseId and email).' });
  }

  try {
    let user = await User.findOne({ firebaseId });

    if (!user) {
      user = await User.create({
        firebaseId,
        email,
        name: name || email.split('@')[0],
        role: email.includes('admin@interviewace.ai') ? 'Admin' : role,
        targetRole,
        subscription: 'Free'
      });
      console.log(`Created new synced MongoDB user: ${user.email}`);
    } else {
      // Sync names/roles if updated
      if (name && user.name !== name) {
        user.name = name;
        await user.save();
      }
    }

    // Sign a local JWT for session management fallback
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'local_dev_jwt_secret_interviewace_2026',
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        firebaseId: user.firebaseId,
        email: user.email,
        name: user.name,
        role: user.role,
        targetRole: user.targetRole,
        subscription: user.subscription,
        education: user.education,
        skills: user.skills,
        resumeUrl: user.resumeUrl
      }
    });
  } catch (error) {
    console.error('Error syncing user auth:', error.message);
    res.status(500).json({ message: 'Server error during auth syncing operation.' });
  }
});

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile details
 * @access  Private
 */
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server profile fetch error.' });
  }
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile data
 * @access  Private
 */
router.put('/profile', protect, async (req, res) => {
  const { name, targetRole, education, skills, resumeUrl } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (targetRole) user.targetRole = targetRole;
    if (education !== undefined) user.education = education;
    if (skills) user.skills = skills;
    if (resumeUrl) user.resumeUrl = resumeUrl;

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    console.error('Profile update error:', error.message);
    res.status(500).json({ message: 'Server error during profile update.' });
  }
});

/**
 * @route   GET /api/auth/admin/users
 * @desc    Get all registered users (Admin only)
 * @access  Private/Admin
 */
router.get('/admin/users', protect, async (req, res) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Access denied: Admin role required' });
  }
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve user accounts.' });
  }
});

export default router;
