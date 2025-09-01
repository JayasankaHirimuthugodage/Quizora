import Quiz from '../models/Quiz.js';
import Module from '../models/Module.js';
import Question from '../models/question.js';
import User from '../models/User.js';

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

    // Verify module exists and belongs to lecturer
    const module = await Module.findOne({
      _id: moduleId,
      createdBy: req.user._id,
      isActive: true
    });

    if (!module) {
      return res.status(404).json({ message: 'Module not found or access denied' });
    }

    // Validate dates
    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
    const now = new Date();

    if (start < now) {
      return res.status(400).json({ message: 'Quiz start time must be in the future' });
    }

    if (end <= start) {
      return res.status(400).json({ message: 'Quiz end time must be after start time' });
    }

    // Count questions for this module
    const questionCount = await Question.countDocuments({
      moduleId: moduleId,
      createdBy: req.user._id,
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

    // Check if quiz has already started
    if (quiz.hasStarted) {
      return res.status(400).json({ 
        message: 'Cannot edit quiz that has already started' 
      });
    }

    const updateData = { ...req.body };

    // Validate dates if being updated
    if (updateData.startDateTime || updateData.endDateTime) {
      const start = new Date(updateData.startDateTime || quiz.startDateTime);
      const end = new Date(updateData.endDateTime || quiz.endDateTime);
      const now = new Date();

      if (start < now) {
        return res.status(400).json({ 
          message: 'Quiz start time must be in the future' 
        });
      }

      if (end <= start) {
        return res.status(400).json({ 
          message: 'Quiz end time must be after start time' 
        });
      }

      updateData.startDateTime = start;
      updateData.endDateTime = end;
    }

    // Update question count if module changed
    if (updateData.moduleId && updateData.moduleId !== quiz.moduleId.toString()) {
      const module = await Module.findOne({
        _id: updateData.moduleId,
        createdBy: req.user._id,
        isActive: true
      });

      if (!module) {
        return res.status(404).json({ message: 'Module not found' });
      }

      const questionCount = await Question.countDocuments({
        moduleId: updateData.moduleId,
        createdBy: req.user._id,
        isActive: true
      });

      if (questionCount === 0) {
        return res.status(400).json({ 
          message: 'No questions found for selected module' 
        });
      }

      updateData.moduleCode = module.moduleCode;
      updateData.questionCount = questionCount;
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('moduleId', 'moduleCode moduleName');

    res.json({
      success: true,
      message: 'Quiz updated successfully',
      quiz: updatedQuiz
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

    // Check if quiz has already started
    if (quiz.hasStarted) {
      return res.status(400).json({ 
        message: 'Cannot delete quiz that has already started' 
      });
    }

    quiz.isActive = false;
    quiz.status = 'cancelled';
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

// Student-specific endpoints
export const getStudentQuizzes = async (req, res) => {
  try {
    const student = req.user;
    const now = new Date();

    const query = {
      isActive: true,
      status: { $in: ['scheduled', 'active'] },
      startDateTime: { $lte: new Date(now.getTime() + 24 * 60 * 60 * 1000) }, // Next 24 hours
      eligibilityCriteria: {
        $elemMatch: {
          degreeTitle: student.degreeTitle,
          year: student.currentYear,
          semester: student.currentSemester
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

    // Check if student is eligible
    if (!quiz.isStudentEligible(req.user)) {
      return res.status(403).json({ message: 'You are not eligible for this quiz' });
    }

    // Check if quiz is currently active
    if (!quiz.isCurrentlyActive) {
      return res.status(400).json({ message: 'Quiz is not currently active' });
    }

    // Verify passcode
    if (quiz.passcode !== passcode) {
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

    // Check if student is eligible
    if (!quiz.isStudentEligible(req.user)) {
      return res.status(403).json({ message: 'You are not eligible for this quiz' });
    }

    // Check if quiz is currently active
    if (!quiz.isCurrentlyActive) {
      return res.status(400).json({ message: 'Quiz is not currently active' });
    }

    // Get questions for the quiz module
    let questions = await Question.find({
      moduleId: quiz.moduleId,
      isActive: true
    }).select('-answer -createdBy -updatedAt'); // Hide answers and metadata

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