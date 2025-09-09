// backend/controllers/quizController.js - COMPLETE CONTROLLER

import Quiz from '../models/Quiz.js';
import Module from '../models/Module.js';
import Question from '../models/question.js';
import User from '../models/User.js';

// ============================
// LECTURER ENDPOINTS
// ============================

export const getQuizzes = async (req, res) => {
  try {
    const { status, moduleCode } = req.query;
    const query = { createdBy: req.user._id, isActive: true };

    if (status) query.status = status;
    if (moduleCode) query.moduleCode = moduleCode;

    const quizzes = await Quiz.find(query)
      .populate('moduleId', 'moduleCode moduleName')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      quizzes
    });
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createQuiz = async (req, res) => {
  try {
    const {
      title,
      description,
      moduleId,
      startDateTime,
      endDateTime,
      duration,
      eligibilityCriteria,
      instructions,
      passcode,
      shuffleQuestions,
      showResultsImmediately,
      allowLateSubmission,
      maxAttempts
    } = req.body;

    // Validate required fields
    if (!title || !moduleId || !startDateTime || !endDateTime || !duration) {
      return res.status(400).json({ 
        message: 'Missing required fields: title, moduleId, startDateTime, endDateTime, duration' 
      });
    }

    // Validate date logic
    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
    const now = new Date();

    if (start >= end) {
      return res.status(400).json({ 
        message: 'Start date must be before end date' 
      });
    }

    if (start <= now) {
      return res.status(400).json({ 
        message: 'Start date must be in the future' 
      });
    }

    // Validate module exists and belongs to lecturer
    const module = await Module.findOne({
      _id: moduleId,
      createdBy: req.user._id,
      isActive: true
    });

    if (!module) {
      return res.status(404).json({ 
        message: 'Module not found or you do not have permission to create quizzes for this module' 
      });
    }

    // Check if there are questions available for this module
    const questionCount = await Question.countDocuments({
      moduleId: moduleId,
      isActive: true
    });

    if (questionCount === 0) {
      return res.status(400).json({ 
        message: 'No questions found for this module. Add questions before creating a quiz.' 
      });
    }

    const quizData = {
      title,
      description,
      moduleId,
      moduleCode: module.moduleCode,
      startDateTime: start,
      endDateTime: end,
      duration,
      eligibilityCriteria,
      instructions,
      passcode,
      questionCount,
      shuffleQuestions: shuffleQuestions || false,
      showResultsImmediately: showResultsImmediately || false,
      allowLateSubmission: allowLateSubmission || false,
      maxAttempts: maxAttempts || 1,
      status: 'scheduled',
      createdBy: req.user._id
    };

    const quiz = new Quiz(quizData);
    await quiz.save();

    await quiz.populate('moduleId', 'moduleCode moduleName');

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      quiz
    });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findOne({
      _id: id,
      createdBy: req.user._id,
      isActive: true
    });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Allow editing of scheduled quizzes and active quizzes (with restrictions)
    const now = new Date();
    const quizStart = new Date(quiz.startDateTime);
    const quizEnd = new Date(quiz.endDateTime);
    
    // Check if quiz is currently active
    const isQuizActive = now >= quizStart && now <= quizEnd;
    
    // Check if quiz has ended
    const hasQuizEnded = now > quizEnd;
    
    if (hasQuizEnded) {
      return res.status(400).json({ 
        message: 'Cannot edit quiz that has already ended' 
      });
    }

    const updateData = { ...req.body };

    // If quiz is currently active, restrict certain edits
    if (isQuizActive) {
      // Allow only limited updates for active quizzes
      const allowedFields = ['endDateTime', 'allowLateSubmission', 'instructions'];
      const requestedFields = Object.keys(updateData);
      const invalidFields = requestedFields.filter(field => !allowedFields.includes(field));
      
      if (invalidFields.length > 0) {
        return res.status(400).json({ 
          message: `Quiz is currently active. Only these fields can be modified: ${allowedFields.join(', ')}`,
          allowedFields,
          invalidFields
        });
      }
    }

    // Validate new end date if provided
    if (updateData.endDateTime) {
      const newEndDate = new Date(updateData.endDateTime);
      if (isQuizActive && newEndDate <= now) {
        return res.status(400).json({ 
          message: 'New end date must be in the future for active quiz' 
        });
      }
    }

    // Update quiz
    Object.assign(quiz, updateData);
    quiz.updatedAt = new Date();
    await quiz.save();

    await quiz.populate('moduleId', 'moduleCode moduleName');

    res.json({
      success: true,
      message: 'Quiz updated successfully',
      quiz,
      warning: isQuizActive ? 'Quiz is currently active. Limited fields were updated.' : null
    });
  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findOne({
      _id: id,
      createdBy: req.user._id,
      isActive: true
    });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Simple solution: just set isActive to false - don't change status
    quiz.isActive = false;
    await quiz.save();

    res.json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findOne({
      _id: id,
      createdBy: req.user._id,
      isActive: true
    }).populate('moduleId', 'moduleCode moduleName');

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    res.json({
      success: true,
      quiz
    });
  } catch (error) {
    console.error('Get quiz by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getQuizEditability = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findOne({
      _id: id,
      createdBy: req.user._id,
      isActive: true
    });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const now = new Date();
    const quizStart = new Date(quiz.startDateTime);
    const quizEnd = new Date(quiz.endDateTime);
    
    const isActive = now >= quizStart && now <= quizEnd;
    const hasEnded = now > quizEnd;
    const hasStarted = now >= quizStart;

    let editability = {
      canEdit: false,
      canDelete: true,
      restrictions: [],
      status: 'unknown'
    };

    if (hasEnded) {
      editability = {
        canEdit: false,
        canDelete: true,
        restrictions: ['Quiz has ended - editing disabled'],
        status: 'ended'
      };
    } else if (isActive) {
      editability = {
        canEdit: true,
        canDelete: true,
        restrictions: ['Only end time, late submission, and instructions can be modified'],
        status: 'active',
        allowedFields: ['endDateTime', 'allowLateSubmission', 'instructions']
      };
    } else {
      editability = {
        canEdit: true,
        canDelete: true,
        restrictions: [],
        status: 'scheduled'
      };
    }

    res.json({
      success: true,
      editability,
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        startDateTime: quiz.startDateTime,
        endDateTime: quiz.endDateTime,
        status: quiz.status
      }
    });
  } catch (error) {
    console.error('Get quiz editability error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getQuizStats = async (req, res) => {
  try {
    const stats = await Quiz.aggregate([
      { $match: { createdBy: req.user._id, isActive: true } },
      {
        $group: {
          _id: null,
          totalQuizzes: { $sum: 1 },
          scheduled: { $sum: { $cond: [{ $eq: ['$status', 'scheduled'] }, 1, 0] } },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
        }
      }
    ]);

    const moduleStats = await Quiz.aggregate([
      { $match: { createdBy: req.user._id, isActive: true } },
      {
        $group: {
          _id: '$moduleCode',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        totalQuizzes: stats[0]?.totalQuizzes || 0,
        scheduled: stats[0]?.scheduled || 0,
        active: stats[0]?.active || 0,
        completed: stats[0]?.completed || 0,
        moduleStats
      }
    });
  } catch (error) {
    console.error('Get quiz stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============================
// STUDENT ENDPOINTS
// ============================

export const getStudentQuizzes = async (req, res) => {
  try {
    const student = req.user;
    const now = new Date();

    const query = {
      isActive: true,
      status: { $in: ['scheduled', 'active'] },
      startDateTime: { $lte: new Date(now.getTime() + 24 * 60 * 60 * 1000) },
      eligibilityCriteria: {
        $elemMatch: {
          degreeTitle: student.degreeTitle,
          year: student.academicYear || student.currentYear,
          semester: student.semester || student.currentSemester
        }
      }
    };

    const quizzes = await Quiz.find(query)
      .populate('moduleId', 'moduleCode moduleName')
      .sort({ startDateTime: 1 });

    res.json({
      success: true,
      quizzes
    });
  } catch (error) {
    console.error('Get student quizzes error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const verifyQuizPasscode = async (req, res) => {
  try {
    const { id } = req.params;
    const { passcode } = req.body;

    const quiz = await Quiz.findOne({
      _id: id,
      isActive: true
    }).populate('moduleId', 'moduleCode moduleName');

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check if quiz was cancelled
    if (quiz.status === 'cancelled') {
      return res.status(400).json({ message: 'This quiz has been cancelled by the instructor' });
    }

    // Check if student is eligible
    const student = req.user;
    const isEligible = quiz.eligibilityCriteria.some(criteria => 
      criteria.degreeTitle === student.degreeTitle &&
      criteria.year === (student.academicYear || student.currentYear) &&
      criteria.semester === (student.semester || student.currentSemester)
    );

    if (!isEligible) {
      return res.status(403).json({ message: 'You are not eligible for this quiz' });
    }

    // Check if quiz is currently active
    const now = new Date();
    const quizStart = new Date(quiz.startDateTime);
    const quizEnd = new Date(quiz.endDateTime);
    const isCurrentlyActive = now >= quizStart && now <= quizEnd;

    if (!isCurrentlyActive) {
      return res.status(400).json({ message: 'Quiz is not currently active' });
    }

    // Verify passcode
    if (quiz.passcode && quiz.passcode !== passcode) {
      return res.status(401).json({ message: 'Invalid passcode' });
    }

    res.json({
      success: true,
      message: 'Passcode verified',
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        instructions: quiz.instructions,
        duration: quiz.duration,
        questionCount: quiz.questionCount,
        moduleCode: quiz.moduleCode,
        startDateTime: quiz.startDateTime,
        endDateTime: quiz.endDateTime
      }
    });
  } catch (error) {
    console.error('Verify quiz passcode error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getQuizQuestions = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findOne({
      _id: id,
      isActive: true
    });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check if quiz was cancelled
    if (quiz.status === 'cancelled') {
      return res.status(400).json({ message: 'This quiz has been cancelled by the instructor' });
    }

    // Check if student is eligible
    const student = req.user;
    const isEligible = quiz.eligibilityCriteria.some(criteria => 
      criteria.degreeTitle === student.degreeTitle &&
      criteria.year === (student.academicYear || student.currentYear) &&
      criteria.semester === (student.semester || student.currentSemester)
    );

    if (!isEligible) {
      return res.status(403).json({ message: 'You are not eligible for this quiz' });
    }

    // Check if quiz is currently active
    const now = new Date();
    const quizStart = new Date(quiz.startDateTime);
    const quizEnd = new Date(quiz.endDateTime);
    const isCurrentlyActive = now >= quizStart && now <= quizEnd;

    if (!isCurrentlyActive) {
      return res.status(400).json({ message: 'Quiz is not currently active' });
    }

    // Get questions for the quiz module
    let questions = await Question.find({
      moduleId: quiz.moduleId,
      isActive: true
    }).select('-answer -createdBy -updatedAt');

    // Shuffle questions if enabled
    if (quiz.shuffleQuestions) {
      questions = questions.sort(() => Math.random() - 0.5);
    }

    res.json({
      success: true,
      questions,
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        duration: quiz.duration,
        endDateTime: quiz.endDateTime
      }
    });
  } catch (error) {
    console.error('Get quiz questions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};