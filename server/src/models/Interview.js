import mongoose from 'mongoose';

const evaluationSchema = new mongoose.Schema({
  questionIndex: Number,
  questionText: String,
  answerText: String,
  score: Number,
  communicationScore: Number,
  contentScore: Number,
  strengths: [String],
  improvements: [String],
  idealAnswer: String
});

const interviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['HR Behavioral', 'Technical'],
    required: true
  },
  track: {
    type: String,
    required: true
  },
  questions: {
    type: [String],
    required: true
  },
  answers: {
    type: [String],
    default: []
  },
  evaluations: [evaluationSchema],
  score: {
    type: Number,
    default: 0
  },
  completed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Interview = mongoose.model('Interview', interviewSchema);
export default Interview;
