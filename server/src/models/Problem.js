import mongoose from 'mongoose';

const testCaseSchema = new mongoose.Schema({
  input: {
    type: String,
    required: true
  },
  expected: {
    type: String,
    required: true
  }
});

const problemSchema = new mongoose.Schema({
  problemId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'Algorithms'
  },
  starterCode: {
    javascript: {
      type: String,
      default: ''
    },
    python: {
      type: String,
      default: ''
    },
    java: {
      type: String,
      default: ''
    }
  },
  tests: [testCaseSchema]
}, {
  timestamps: true
});

const Problem = mongoose.model('Problem', problemSchema);
export default Problem;
