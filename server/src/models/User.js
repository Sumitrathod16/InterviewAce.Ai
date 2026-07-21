import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firebaseId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['Student', 'Admin'],
    default: 'Student'
  },
  targetRole: {
    type: String,
    default: 'Frontend Engineer'
  },
  subscription: {
    type: String,
    enum: ['Free', 'Pro', 'Premium'],
    default: 'Premium'
  },
  stripeCustomerId: {
    type: String,
    default: ''
  },
  education: {
    type: String,
    default: ''
  },
  skills: {
    type: [String],
    default: []
  },
  resumeUrl: {
    type: String,
    default: ''
  },
  profilePic: {
    type: String,
    default: ''
  },
  // Rate-limiting stats
  interviewCountToday: {
    type: Number,
    default: 0
  },
  lastInterviewDate: {
    type: Date,
    default: Date.now
  },
  resumeCountToday: {
    type: Number,
    default: 0
  },
  lastResumeDate: {
    type: Date,
    default: Date.now
  },
  freeRefillDate: {
    type: Date,
    default: Date.now
  },
  // Practice streak stats
  streakCount: {
    type: Number,
    default: 1
  },
  lastActiveDate: {
    type: Date,
    default: Date.now
  },
  solvedProblems: [
    {
      problemId: { type: String, required: true },
      language: { type: String, required: true },
      solvedAt: { type: Date, default: Date.now }
    }
  ],
  spentXp: {
    type: Number,
    default: 0
  },
  roadmapsAllowedCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Document method to update/check user practice streak
userSchema.methods.updateStreak = async function() {
  const now = new Date();
  const currentStreak = this.streakCount || 0;
  const lastActiveDate = this.lastActiveDate || this.createdAt || now;

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastActive = new Date(lastActiveDate.getFullYear(), lastActiveDate.getMonth(), lastActiveDate.getDate());
  
  const diffTime = today.getTime() - lastActive.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (currentStreak === 0) {
    this.streakCount = 1;
    this.lastActiveDate = now;
  } else if (diffDays === 1) {
    this.streakCount = currentStreak + 1;
    this.lastActiveDate = now;
  } else if (diffDays > 1) {
    this.streakCount = 1;
    this.lastActiveDate = now;
  } else {
    // diffDays <= 0 (same-day activity)
    this.lastActiveDate = now;
  }
  
  return await this.save();
};

const User = mongoose.model('User', userSchema);
export default User;
