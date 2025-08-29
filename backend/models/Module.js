import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema({
  moduleCode: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  moduleName: {
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
  credits: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  description: {
    type: String,
    trim: true
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

moduleSchema.index({ 
  createdBy: 1, 
  moduleCode: 1, 
  moduleYear: 1, 
  moduleSemester: 1 
}, { unique: true });

export default mongoose.model('Module', moduleSchema);