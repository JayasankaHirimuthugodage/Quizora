import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, default: false },
});

const questionSchema = new mongoose.Schema(
  {
    type: { 
      type: String, 
      enum: ['MCQ', 'Structured', 'Essay'], 
      required: true 
    },
    questionText: { 
      type: String, 
      required: true 
    },
    options: [optionSchema],          // MCQ options
    answer: { type: String },         // Structured/Essay answer
    image: { type: String },          // stored filename
    equations: [{ type: String }],    // LaTeX/MathJax strings
    tags: [String],
    
    // Module-specific fields
    moduleCode: {
      type: String,
      required: true,
      trim: true
    },
    moduleYear: {
      type: Number,
      required: true,
      min: 1,
      max: 4
    },
    moduleSemester: {
      type: Number,
      required: true,
      enum: [1, 2]
    },
    
    // Question ownership
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true
    },
    
    // Status and metadata
    isActive: {
      type: Boolean,
      default: true
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium'
    }
  },
  { 
    timestamps: true,
    // Add compound index for efficient querying
    indexes: [
      { createdBy: 1, moduleCode: 1, moduleYear: 1, moduleSemester: 1 },
      { createdBy: 1, type: 1 },
      { tags: 1 }
    ]
  }
);

// Instance method to check if user can access this question
questionSchema.methods.canAccess = function(user) {
  return this.createdBy.toString() === user._id.toString();
};

// Static method to find questions by lecturer and module
questionSchema.statics.findByLecturerAndModule = function(lecturerId, moduleCode, moduleYear, moduleSemester) {
  const query = { createdBy: lecturerId };
  
  if (moduleCode) query.moduleCode = moduleCode;
  if (moduleYear) query.moduleYear = moduleYear;
  if (moduleSemester) query.moduleSemester = moduleSemester;
  
  return this.find(query).sort({ createdAt: -1 });
};

export default mongoose.model('Question', questionSchema);