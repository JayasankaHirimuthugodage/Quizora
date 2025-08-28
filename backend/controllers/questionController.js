import * as questionService from '../services/questionService.js';

const parseMaybeJSON = (v, fallback) => {
  if (v === undefined || v === null || v === '') return fallback;
  if (Array.isArray(v) || typeof v === 'object') return v;
  try { return JSON.parse(v); } catch { return fallback; }
};

export const createQuestion = async (req, res) => {
  try {
    const { type, questionText, answer, tags } = req.body;

    const options = parseMaybeJSON(req.body.options || req.body.mcqOptions, []);
    const equations = parseMaybeJSON(req.body.equations, []);

    const doc = await questionService.createQuestion({
      type,
      questionText,
      options,
      answer,
      equations,
      tags: parseMaybeJSON(tags, []),
      image: req.file?.filename || null,
    });

    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getAllQuestions = async (req, res) => {
  const list = await questionService.getAllQuestions();
  res.json(list);
};

export const getQuestionById = async (req, res) => {
  const doc = await questionService.getOneQuestion(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
};

export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const body = { ...req.body };

    if (req.body.options) body.options = parseMaybeJSON(req.body.options, []);
    if (req.body.equations) body.equations = parseMaybeJSON(req.body.equations, []);
    if (req.body.tags) body.tags = parseMaybeJSON(req.body.tags, []);
    if (req.file) body.image = req.file.filename;

    const updated = await questionService.updateQuestion(id, body);
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteQuestion = async (req, res) => {
  const deleted = await questionService.deleteQuestion(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Not found' });
  res.json({ message: 'Deleted successfully' });
};
