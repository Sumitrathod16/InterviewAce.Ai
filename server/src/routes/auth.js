import express from 'express';
import jwt from 'jsonwebtoken';
import { protect, checkSubscriptionStatus } from '../middleware/auth.js';
import User from '../models/User.js';

// Helper to serialize user with trial properties
const serializeUser = async (user) => {
  const userObj = user.toObject ? user.toObject() : user;
  
  const now = new Date();
  const registrationDate = userObj.createdAt || now;
  const trialDuration = 30 * 24 * 60 * 60 * 1000; // 30 days
  
  const Subscription = (await import('../models/Subscription.js')).default;
  const activeSub = await Subscription.findOne({
    userId: userObj._id,
    status: 'active',
    currentPeriodEnd: { $gt: now }
  });
  
  const isTrial = !activeSub && (now - registrationDate) < trialDuration;
  const trialEndsAt = new Date(new Date(registrationDate).getTime() + trialDuration);
  
  return {
    _id: userObj._id,
    firebaseId: userObj.firebaseId,
    email: userObj.email,
    name: userObj.name,
    role: userObj.role,
    targetRole: userObj.targetRole,
    subscription: userObj.subscription,
    education: userObj.education,
    skills: userObj.skills,
    resumeUrl: userObj.resumeUrl,
    profilePic: userObj.profilePic || '',
    interviewCountToday: userObj.interviewCountToday,
    resumeCountToday: userObj.resumeCountToday,
    freeRefillDate: userObj.freeRefillDate || userObj.createdAt,
    streakCount: userObj.streakCount,
    lastActiveDate: userObj.lastActiveDate,
    solvedProblems: userObj.solvedProblems || [],
    spentXp: userObj.spentXp || 0,
    redemptions: userObj.redemptions || [],
    createdAt: userObj.createdAt,
    isTrial,
    trialEndsAt
  };
};

const router = express.Router();

// Helper to reset free limits after 15 days
const checkAndResetFreeRefills = async (user) => {
  if (user.subscription === 'Pro' || user.subscription === 'Premium') {
    return user;
  }
  
  const now = new Date();
  const lastRefill = new Date(user.freeRefillDate || user.createdAt);
  const diffTime = Math.abs(now - lastRefill);
  
  // 15 days = 15 * 24 * 60 * 60 * 1000 ms
  if (diffTime >= 15 * 24 * 60 * 60 * 1000) {
    user.interviewCountToday = 0;
    user.resumeCountToday = 0;
    user.freeRefillDate = now;
    await user.save();
    console.log(`Refilled free limits for user: ${user.email}`);
  }
  return user;
};

/**
 * @route   POST /api/auth/sync
 * @desc    Sync client auth state with backend MongoDB
 * @access  Public (or verified via client payload)
 */
router.post('/sync', async (req, res) => {
  const { firebaseId, email, name, role = 'Student', targetRole = 'Frontend Engineer', localSolvedProblems } = req.body;

  if (!firebaseId || !email) {
    return res.status(400).json({ message: 'Missing sync credentials details (firebaseId and email).' });
  }

  try {
    let user = await User.findOne({ firebaseId });

    if (!user) {
      const sanitizedProblems = (localSolvedProblems || []).filter(
        p => p && typeof p.problemId === 'string' && typeof p.language === 'string'
      );
      user = await User.create({
        firebaseId,
        email,
        name: name || email.split('@')[0],
        role: email.includes('admin@interviewace.ai') ? 'Admin' : role,
        targetRole,
        subscription: 'Premium',
        freeRefillDate: new Date(),
        solvedProblems: sanitizedProblems
      });
      console.log(`Created new synced MongoDB user: ${user.email}`);
    } else {
      // Sync names/roles if updated
      if (name && user.name !== name) {
        user.name = name;
      }
      // Merge local solved problems into DB
      if (Array.isArray(localSolvedProblems) && localSolvedProblems.length > 0) {
        localSolvedProblems.forEach(localProb => {
          if (localProb && typeof localProb.problemId === 'string' && typeof localProb.language === 'string') {
            const exists = user.solvedProblems.some(
              p => p.problemId === localProb.problemId && 
              p.language.toLowerCase() === localProb.language.toLowerCase()
            );
            if (!exists) {
              user.solvedProblems.push({
                problemId: localProb.problemId,
                language: localProb.language,
                solvedAt: new Date()
              });
            }
          }
        });
      }
      user = await checkSubscriptionStatus(user);
      user = await checkAndResetFreeRefills(user);
      await user.save();
    }

    // Dynamic trial checks for both new & existing
    user = await checkSubscriptionStatus(user);

    // Update candidate practice/login streak
    await user.updateStreak();

    // Sign a local JWT for session management fallback
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'local_dev_jwt_secret_interviewace_2026',
      { expiresIn: '30d' }
    );

    const serializedUser = await serializeUser(user);
    res.json({
      token,
      user: serializedUser
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
    let user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user = await checkAndResetFreeRefills(user);
    const serialized = await serializeUser(user);
    res.json(serialized);
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
  const { name, targetRole, education, skills, resumeUrl, profilePic } = req.body;

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
    if (profilePic !== undefined) user.profilePic = profilePic;

    const updatedUser = await user.save();
    const serialized = await serializeUser(updatedUser);
    res.json(serialized);
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
