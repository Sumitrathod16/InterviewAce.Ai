import express from 'express';
import { protect } from '../middleware/auth.js';
import Interview from '../models/Interview.js';

const router = express.Router();

/**
 * @route   POST /api/rewards/redeem
 * @desc    Spend XP to redeem refills or premium feature unlocks
 * @access  Private
 */
router.post('/redeem', protect, async (req, res) => {
  const { rewardType } = req.body;

  if (!rewardType) {
    return res.status(400).json({ message: 'Missing rewardType parameter.' });
  }

  try {
    const user = req.user;
    
    // Calculate total earned XP based on DB tracking
    const solvedCount = user.solvedProblems?.length || 0;
    const interviewCount = await Interview.countDocuments({ userId: user._id, completed: true });
    
    const totalXp = (solvedCount * 10) + (interviewCount * 200);
    const spentXp = user.spentXp || 0;
    const availableXp = totalXp - spentXp;

    if (rewardType === 'refill_interviews') {
      const cost = 500;
      if (availableXp < cost) {
        return res.status(400).json({ 
          message: `Insufficient XP. Refilling interviews costs ${cost} XP, but you only have ${availableXp} XP available.` 
        });
      }
      user.interviewCountToday = 0;
      user.spentXp = spentXp + cost;
      await user.save();
      return res.json({ 
        message: 'Mock interviews limit successfully refilled! You have 3 new mock interviews.', 
        user 
      });
    }

    if (rewardType === 'refill_resumes') {
      const cost = 300;
      if (availableXp < cost) {
        return res.status(400).json({ 
          message: `Insufficient XP. Refilling resumes costs ${cost} XP, but you only have ${availableXp} XP available.` 
        });
      }
      user.resumeCountToday = 0;
      user.spentXp = spentXp + cost;
      await user.save();
      return res.json({ 
        message: 'Resume audits limit successfully refilled! You have 2 new ATS resume reviews.', 
        user 
      });
    }

    if (rewardType === 'unlock_roadmap') {
      const cost = 400;
      if (availableXp < cost) {
        return res.status(400).json({ 
          message: `Insufficient XP. Unlocking a career roadmap costs ${cost} XP, but you only have ${availableXp} XP available.` 
        });
      }
      user.roadmapsAllowedCount = (user.roadmapsAllowedCount || 0) + 1;
      user.spentXp = spentXp + cost;
      await user.save();
      return res.json({ 
        message: 'AI Career Coach roadmap successfully unlocked! You can now generate 1 custom roadmap.', 
        user 
      });
    }

    return res.status(400).json({ message: 'Unsupported rewardType.' });
  } catch (error) {
    console.error('Error redeeming reward:', error.message);
    res.status(500).json({ message: 'Failed to redeem reward.' });
  }
});

export default router;
