import express from 'express';
import { protect } from '../middleware/auth.js';
import { strictLimiter } from '../middleware/rateLimiter.js';
import { executeCode } from '../services/judge0.js';

const router = express.Router();

/**
 * @route   POST /api/compiler/run
 * @desc    Execute code in Monaco Sandbox via Judge0
 * @access  Private
 */
router.post('/run', protect, strictLimiter, async (req, res) => {
  const { code, language, stdin } = req.body;

  if (!code || !language) {
    return res.status(400).json({ message: 'Missing parameters (code, language).' });
  }

  // Rate limit Free plan on specific coding problems if needed
  if (req.user.subscription === 'Free' && language.toLowerCase() !== 'javascript' && language.toLowerCase() !== 'js') {
    return res.status(403).json({ 
      message: 'Compiling non-JS languages is a Pro/Premium feature. Please upgrade or use Javascript!' 
    });
  }

  try {
    const report = await executeCode(code, language, stdin);
    res.json(report);
  } catch (error) {
    console.error('Compiler run error:', error.message);
    res.status(500).json({ message: 'Server compiler execution failed.' });
  }
});

export default router;
