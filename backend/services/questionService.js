import Question from '../models/question.js';

export const createQuestion = (data) => new Question(data).save();

export const getAllQuestions = (filter = {}) => Question.find(filter);

export const getOneQuestion = (id) => Question.findById(id);

export const updateQuestion = (id, update) =>
  Question.findByIdAndUpdate(id, update, { new: true });

export const deleteQuestion = (id) => Question.findByIdAndDelete(id);
