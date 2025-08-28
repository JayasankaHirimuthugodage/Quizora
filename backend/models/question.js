import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema({
  text: String,
  isCorrect: Boolean,
});

const questionSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['MCQ', 'Structured', 'Essay'], required: true },
    questionText: { type: String, required: true },
    options: [optionSchema],          // MCQ
    answer: { type: String },         // Structured/Essay or MCQ key
    image: { type: String },          // stored filename
    equations: [{ type: String }],    // LaTeX/MathJax strings, etc.
    tags: [String],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Question', questionSchema);

