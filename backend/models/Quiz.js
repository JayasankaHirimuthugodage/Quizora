// backend/models/Quiz.js

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
maxAttempts: {
  type: Number,
  default: 1,
  min: 1
},
questionCount: {
  type: Number,
  default: 0
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

// Improved status update logic - only for new quizzes
quizSchema.pre('save', function(next) {
  // Only auto-update status for new documents
  if (!this.isNew) {
    return next();
  }

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

// Method to manually update quiz status
quizSchema.methods.updateStatus = function() {
  const now = new Date();
  const startTime = new Date(this.startDateTime);
  const endTime = new Date(this.endDateTime);
  
  // Don't change cancelled status
  if (this.status === 'cancelled') {
    return this.status;
  }

  let newStatus;
  if (now < startTime) {
    newStatus = 'scheduled';
  } else if (now >= startTime && now <= endTime) {
    newStatus = 'active';
  } else if (now > endTime) {
    newStatus = 'completed';
  }

  if (newStatus !== this.status) {
    this.status = newStatus;
  }

  return this.status;
};

// Static method to bulk update quiz statuses
quizSchema.statics.updateAllStatuses = async function() {
  try {
    const now = new Date();

    // Update scheduled quizzes that should now be active
    const activatedQuizzes = await this.updateMany(
      {
        status: 'scheduled',
        startDateTime: { $lte: now },
        endDateTime: { $gt: now },
        isActive: true
      },
      { status: 'active' }
    );

    // Update active quizzes that should now be completed
    const completedQuizzes = await this.updateMany(
      {
        status: 'active',
        endDateTime: { $lte: now },
        isActive: true
      },
      { status: 'completed' }
    );

    return {
      activated: activatedQuizzes.modifiedCount,
      completed: completedQuizzes.modifiedCount
    };
  } catch (error) {
    throw error;
  }
};

// Virtual to get current actual status without modifying the document
quizSchema.virtual('currentStatus').get(function() {
  const now = new Date();
  const startTime = new Date(this.startDateTime);
  const endTime = new Date(this.endDateTime);
  
  if (this.status === 'cancelled') return 'cancelled';
  if (now < startTime) return 'scheduled';
  if (now >= startTime && now <= endTime) return 'active';
  return 'completed';
});

export default mongoose.model('Quiz', quizSchema);