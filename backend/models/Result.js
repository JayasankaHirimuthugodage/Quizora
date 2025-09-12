import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  questionText: String,
  questionType: {
    type: String,
    enum: ['MCQ', 'Structured', 'Essay']
  },
  studentAnswer: mongoose.Schema.Types.Mixed, // Can store string, array, object
  correctAnswer: mongoose.Schema.Types.Mixed,
  isCorrect: {
    type: Boolean,
    default: false
  },
  marks: {
    type: Number,
    default: 0
  },
  maxMarks: {
    type: Number,
    default: 1
  }
});