import * as questionService from '../services/questionService.js';

// Helper function to parse JSON safely
const parseMaybeJSON = (value, fallback) => {
  if (value === undefined || value === null || value === '') return fallback;
  if (Array.isArray(value) || typeof value === 'object') return value;
  try { 
    return JSON.parse(value); 
  } catch { 
    return fallback; 
  }
};

// Create a new question (lecturer only)
export const createQuestion = async (req, res) => {
  try {
    // Extract and validate required fields
    const { 
      type, 
      questionText, 
      answer, 
      tags,
      moduleCode,
      moduleYear,
      moduleSemester,
      difficulty 
    } = req.body;

    // Validate required fields
    if (!type || !questionText || !moduleCode || !moduleYear || !moduleSemester) {
      return res.status(400).json({ 
        message: 'Type, question text, module code, year, and semester are required' 
      });
    }

    // Validate module year and semester
    const year = parseInt(moduleYear);
    const semester = parseInt(moduleSemester);
    
    if (year < 1 || year > 4) {
      return res.status(400).json({ 
        message: 'Module year must be between 1 and 4' 
      });
    }
    
    if (semester !== 1 && semester !== 2) {
      return res.status(400).json({ 
        message: 'Module semester must be 1 or 2' 
      });
    }

    // Parse options and equations
    const options = parseMaybeJSON(req.body.options || req.body.mcqOptions, []);
    const equations = parseMaybeJSON(req.body.equations, []);

    // Validate MCQ options if type is MCQ
    if (type === 'MCQ') {
      const validOptions = options.filter(opt => opt.text && opt.text.trim());
      if (validOptions.length < 2) {
        return res.status(400).json({ 
          message: 'MCQ questions must have at least 2 options' 
        });
      }
      if (!validOptions.some(opt => opt.isCorrect)) {
        return res.status(400).json({ 
          message: 'MCQ questions must have at least one correct answer' 
        });
      }
    }

    const questionData = {
      type,
      questionText: questionText.trim(),
      options: type === 'MCQ' ? options : [],
      answer: type !== 'MCQ' ? (answer || '').trim() : '',
      equations,
      tags: parseMaybeJSON(tags, []),
      moduleCode: moduleCode.trim().toUpperCase(),
      moduleYear: year,
      moduleSemester: semester,
      difficulty: difficulty || 'Medium',
      image: req.file?.filename || null,
    };

    const question = await questionService.createQuestion(questionData, req.user._id);

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      question
    });
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get all questions for the authenticated lecturer
export const getQuestions = async (req, res) => {
  try {
    const lecturerId = req.user._id;
    const filters = {
      moduleCode: req.query.moduleCode,
      moduleYear: req.query.moduleYear,
      moduleSemester: req.query.moduleSemester,
      type: req.query.type,
      difficulty: req.query.difficulty,
      search: req.query.search
    };

    const questions = await questionService.getQuestionsByLecturer(lecturerId, filters);

    res.json({
      success: true,
      questions,
      count: questions.length
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get a single question by ID
export const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    const lecturerId = req.user._id;

    const question = await questionService.getQuestionById(id, lecturerId);

    if (!question) {
      return res.status(404).json({ 
        message: 'Question not found or access denied' 
      });
    }

    res.json({
      success: true,
      question
    });
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Update a question
export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const lecturerId = req.user._id;

    // Build update data
    const updateData = { ...req.body };

    // Parse JSON fields if they exist
    if (req.body.options) {
      updateData.options = parseMaybeJSON(req.body.options, []);
    }
    if (req.body.equations) {
      updateData.equations = parseMaybeJSON(req.body.equations, []);
    }
    if (req.body.tags) {
      updateData.tags = parseMaybeJSON(req.body.tags, []);
    }
    if (req.file) {
      updateData.image = req.file.filename;
    }

    // Validate module data if provided
    if (updateData.moduleYear) {
      const year = parseInt(updateData.moduleYear);
      if (year < 1 || year > 4) {
        return res.status(400).json({ 
          message: 'Module year must be between 1 and 4' 
        });
      }
      updateData.moduleYear = year;
    }

    if (updateData.moduleSemester) {
      const semester = parseInt(updateData.moduleSemester);
      if (semester !== 1 && semester !== 2) {
        return res.status(400).json({ 
          message: 'Module semester must be 1 or 2' 
        });
      }
      updateData.moduleSemester = semester;
    }

    if (updateData.moduleCode) {
      updateData.moduleCode = updateData.moduleCode.trim().toUpperCase();
    }

    const updatedQuestion = await questionService.updateQuestion(id, updateData, lecturerId);

    if (!updatedQuestion) {
      return res.status(404).json({ 
        message: 'Question not found or access denied' 
      });
    }

    res.json({
      success: true,
      message: 'Question updated successfully',
      question: updatedQuestion
    });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Delete a question (soft delete)
export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const lecturerId = req.user._id;

    const deletedQuestion = await questionService.deleteQuestion(id, lecturerId);

    if (!deletedQuestion) {
      return res.status(404).json({ 
        message: 'Question not found or access denied' 
      });
    }

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get lecturer's question statistics
export const getQuestionStats = async (req, res) => {
  try {
    const lecturerId = req.user._id;
    const stats = await questionService.getLecturerQuestionStats(lecturerId);

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching question stats:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get lecturer's modules
export const getLecturerModules = async (req, res) => {
  try {
    const lecturerId = req.user._id;
    const modules = await questionService.getLecturerModules(lecturerId);

    res.json({
      success: true,
      modules
    });
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};