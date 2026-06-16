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
    default: 'Free'
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
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);
export default User;
