import mongoose from 'mongoose';

const suggestionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    default: 5
  },
  solved: {
    type: Boolean,
    default: false
  }
});

const resumeReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  resumeUrl: {
    type: String,
    required: true
  },
  atsScore: {
    type: Number,
    required: true
  },
  suggestions: [suggestionSchema],
  missingKeywords: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

const ResumeReport = mongoose.model('ResumeReport', resumeReportSchema);
export default ResumeReport;
