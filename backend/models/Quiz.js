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
  description: {
    type: String,
    trim: true
  },
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: true
  },
  moduleCode: {
    type: String,
    required: true
  },
  startDateTime: {
    type: Date,
    required: true
  },
  endDateTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true, // Duration in minutes
    min: 1
  },
  eligibilityCriteria: [eligibilityCriteriaSchema],
  instructions: {
    type: String,
    required: true,
    trim: true
  },
  passcode: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 20
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'active', 'completed', 'cancelled'],
    default: 'draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  questionCount: {
    type: Number,
    default: 0
  },
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
  maxAttempts: {
    type: Number,
    default: 1,
    min: 1
  }
}, {
  timestamps: true
});

// Virtual to check if quiz is currently active
quizSchema.virtual('isCurrentlyActive').get(function() {
  const now = new Date();
  return now >= this.startDateTime && now <= this.endDateTime;
});

// Virtual to check if quiz has started
quizSchema.virtual('hasStarted').get(function() {
  return new Date() >= this.startDateTime;
});

// Virtual to check if quiz has ended
quizSchema.virtual('hasEnded').get(function() {
  return new Date() > this.endDateTime;
});

// Method to check if a student is eligible
quizSchema.methods.isStudentEligible = function(student) {
  return this.eligibilityCriteria.some(criteria => 
    criteria.degreeTitle === student.degreeTitle &&
    criteria.year === student.currentYear &&
    criteria.semester === student.currentSemester
  );
};

// Index for efficient queries
quizSchema.index({ createdBy: 1, status: 1 });
quizSchema.index({ startDateTime: 1, endDateTime: 1 });
quizSchema.index({ moduleId: 1 });
quizSchema.index({ 'eligibilityCriteria.degreeTitle': 1, 'eligibilityCriteria.year': 1, 'eligibilityCriteria.semester': 1 });

export default mongoose.model('Quiz', quizSchema);