import mongoose from 'mongoose';

const eligibilityCriteriaSchema = new mongoose.Schema({
  degreeTitle: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  },
  semester: {
    type: Number,
    required: true,
    enum: [1, 2]
  }
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: true
  },
  moduleCode: {
    type: String,
    required: true,
    trim: true
  },
  moduleYear: {
    type: Number,
    required: true
  },
  moduleSemester: {
    type: Number,
    required: true
  },
  duration: {
    type: Number,
    required: true, // in minutes
    min: 1
  },
  startDateTime: {
    type: Date,
    required: true
  },
  endDateTime: {
    type: Date,
    required: true
  },
  instructions: {
    type: String,
    required: true,
    trim: true
  },
  passcode: {
    type: String,
    required: true,
    trim: true
  },
  eligibilityCriteria: [eligibilityCriteriaSchema],
  shuffleQuestions: {
    type: Boolean,
    default: false
  },
  showResultsImmediately: {
    type: Boolean,
    default: false
  },
  allowLateSubmission: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['scheduled', 'active', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better performance
quizSchema.index({ createdBy: 1, createdAt: -1 });
quizSchema.index({ moduleCode: 1, startDateTime: 1 });
quizSchema.index({ status: 1, startDateTime: 1 });

// Auto-update status based on dates
quizSchema.pre('save', function(next) {
  const now = new Date();
  const startTime = new Date(this.startDateTime);
  const endTime = new Date(this.endDateTime);

  if (now < startTime) {
    this.status = 'scheduled';
  } else if (now >= startTime && now <= endTime) {
    this.status = 'active';
  } else if (now > endTime) {
    this.status = 'completed';
  }

  next();
});

export default mongoose.model('Quiz', quizSchema);