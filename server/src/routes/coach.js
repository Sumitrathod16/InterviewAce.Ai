import express from 'express';
import { protect } from '../middleware/auth.js';
import { generateCareerCoachDetails } from '../services/gemini.js';

const router = express.Router();

/**
 * @route   POST /api/coach/roadmap
 * @desc    Generate a custom career roadmap (Premium Feature)
 * @access  Private
 */
router.post('/roadmap', protect, async (req, res) => {
  const isPremium = req.user.subscription === 'Premium';
  const hasUnlockedRoadmap = (req.user.roadmapsAllowedCount || 0) > 0;

  if (!isPremium && !hasUnlockedRoadmap) {
    return res.status(403).json({ 
      message: 'AI Career Coach roadmap is a Premium plan feature. Please upgrade or redeem XP to unlock custom paths!' 
    });
  }

  const { skills, targetRole, education } = req.body;

  try {
    const skillsList = skills || req.user.skills || [];
    const role = targetRole || req.user.targetRole || 'Frontend Engineer';
    const edu = education || req.user.education || 'Self-Taught / Degree Candidate';

    const details = await generateCareerCoachDetails(skillsList, role, edu);

    // Consume 1 unlocked roadmap if they are not Premium
    if (!isPremium) {
      req.user.roadmapsAllowedCount = Math.max(0, req.user.roadmapsAllowedCount - 1);
      await req.user.save();
    }
    res.json(details);
  } catch (error) {
    console.error('Career Coach generation error:', error.message);
    res.status(500).json({ message: 'Failed to query career advisor.' });
  }
});

/**
 * @route   GET /api/coach/company/:companyName
 * @desc    Get preparation modules for target firms (Pro / Premium Feature)
 * @access  Private
 */
router.get('/company/:companyName', protect, async (req, res) => {
  if (req.user.subscription === 'Free') {
    return res.status(403).json({ 
      message: 'Company-specific prep is a Pro/Premium feature. Please upgrade to access!' 
    });
  }

  const company = req.params.companyName.toLowerCase();
  
  // Set up detailed prep portfolios for key companies
  const mockPortfolios = {
    tcs: {
      name: 'TCS (Tata Consultancy Services)',
      difficulty: 'Medium',
      roundDetails: 'Aptitude Test (Numerical & Verbal), Technical Panel, HR round.',
      aptitudePrep: [
        'Practice time-speed-distance, percentage, simple interest, profit & loss.',
        'Review logical reasoning, syllogisms, coding-decoding, and verbal patterns.'
      ],
      technicalQuestions: [
        'What is database normalization? Explain 1NF, 2NF, 3NF.',
        'Explain the difference between call by value and call by reference.',
        'Write a basic code to reverse a linked list.',
        'What are OOP principles? Explain polymorphism and encapsulation.'
      ],
      hrQuestions: [
        'Why do you want to join TCS?',
        'Are you comfortable relocating to any of our developer centers?',
        'Tell me about your final year project and your role in it.'
      ]
    },
    infosys: {
      name: 'Infosys',
      difficulty: 'Medium',
      roundDetails: 'InfyTQ/HackWithInfy exam, Technical assessment, HR Interview.',
      aptitudePrep: [
        'Understand permutation & combination, probability, and speed math.',
        'Data interpretation tables, graphs, and paragraph comprehension checks.'
      ],
      technicalQuestions: [
        'What is a primary key, foreign key, and unique key?',
        'Compare Method Overloading and Method Overriding in Java.',
        'What is the difference between HTML5 and HTML?',
        'Write an algorithm to check if an array contains duplicates.'
      ],
      hrQuestions: [
        'How do you handle work pressure and deadlines?',
        'Why should we hire you over other candidates?',
        'Describe a situation where you had to learn a skill quickly.'
      ]
    },
    wipro: {
      name: 'Wipro',
      difficulty: 'Medium',
      roundDetails: 'Elite National Talent Hunt assessment, Technical Round, HR Panel.',
      aptitudePrep: [
        'Solve quantitative questions on averages, ratios, and work-time formulas.',
        'Practice error spotting, sentence completion, and logical grids.'
      ],
      technicalQuestions: [
        'What is a pointer? How is it used in C/C++?',
        'Explain the ACID properties of databases.',
        'What is the difference between GET and POST requests?',
        'Write a code to check if a number is prime.'
      ],
      hrQuestions: [
        'What are your strengths and weaknesses?',
        'Are you willing to work in night shifts if project demands?',
        'Describe your teamwork skills in engineering college projects.'
      ]
    },
    accenture: {
      name: 'Accenture',
      difficulty: 'Medium-High',
      roundDetails: 'Cognitive & Technical Assessment, Coding Round, HR Interview.',
      aptitudePrep: [
        'Study logical sequencing, abstract reasoning, and math equations.',
        'Prepare coding fundamentals: pseudocodes, loop analysis.'
      ],
      technicalQuestions: [
        'What is cloud computing? Explain IaaS, PaaS, SaaS.',
        'Explain data encapsulation in OOP and why it is useful.',
        'What is the difference between a compiler and an interpreter?',
        'Explain MVC architecture.'
      ],
      hrQuestions: [
        'Describe a time you solved a problem using a creative approach.',
        'How do you manage changes in project requirements?',
        'What do you know about Accenture\'s cloud services?'
      ]
    },
    deloitte: {
      name: 'Deloitte',
      difficulty: 'High',
      roundDetails: 'Deloitte Aptitude (AMCAT style), Group Discussion/Case Study, Tech & HR.',
      aptitudePrep: [
        'Prepare statistics, word problems, series puzzles, and logic trees.',
        'Brush up on business case analysis and structuring recommendations.'
      ],
      technicalQuestions: [
        'How does public key cryptography work?',
        'What is the difference between SQL and NoSQL? When would you use which?',
        'Explain dependency injection and its benefits in app development.',
        'Describe standard Git workflows for team branches.'
      ],
      hrQuestions: [
        'Walk me through a business case problem you analyzed.',
        'How do you resolve conflicts within project team structures?',
        'Where do you see yourself in 3 years with Deloitte consulting services?'
      ]
    }
  };

  const formattedName = company.trim();
  const prepModule = mockPortfolios[formattedName] || {
    name: req.params.companyName.toUpperCase(),
    difficulty: 'Medium',
    roundDetails: 'Written aptitude/coding rounds followed by technical and manager/HR discussions.',
    aptitudePrep: [
      'Focus on quantitative arithmetic, logical puzzles, and pattern mapping.',
      'Practice verbal grammar checks and long text reasoning.'
    ],
    technicalQuestions: [
      'What are the difference between Stack and Queue?',
      'Explain indexes in SQL. How do they speed up search queries?',
      'How do you secure api endpoints from script hacking?'
    ],
    hrQuestions: [
      `Why are you targeting ${req.params.companyName}?`,
      'Explain your willingness to learn new technologies outside your college tracks.'
    ]
  };

  res.json(prepModule);
});

export default router;
