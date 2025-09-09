// backend/controllers/quizController.js - COMPLETE CONTROLLER WITH ENHANCED ANALYTICS

import Quiz from '../models/Quiz.js';
import Module from '../models/Module.js';
import Question from '../models/question.js';
import User from '../models/User.js';
import Result from '../models/Result.js';

// Helper function to calculate grade
const calculateGrade = (percentage) => {
  if (percentage >= 90) return 'A+';
  else if (percentage >= 85) return 'A';
  else if (percentage >= 80) return 'A-';
  else if (percentage >= 75) return 'B+';
  else if (percentage >= 70) return 'B';
  else if (percentage >= 65) return 'B-';
  else if (percentage >= 60) return 'C+';
  else if (percentage >= 55) return 'C';
  else if (percentage >= 50) return 'C-';
  else if (percentage >= 45) return 'D+';
  else if (percentage >= 40) return 'D';
  else return 'F';
};

// ============================
// DEBUG FUNCTIONS - TEMPORARY
// ============================

export const debugQuizData = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('=== QUIZ DEBUG ===');
    console.log('Quiz ID searched:', id);
    
    // Check if quiz exists
    const quiz = await Quiz.findById(id);
    console.log('Quiz found:', !!quiz);
    
    if (quiz) {
      console.log('Quiz details:', {
        id: quiz._id,
        title: quiz.title,
        passcode: quiz.passcode,
        passcodeType: typeof quiz.passcode,
        passcodeLength: quiz.passcode?.length,
        status: quiz.status,
        isActive: quiz.isActive,
        eligibilityCriteria: quiz.eligibilityCriteria
      });
    }
    
    // Also check all quizzes
    const allQuizzes = await Quiz.find({ isActive: true }).select('title passcode status');
    console.log('All active quizzes:', allQuizzes);
    
    res.json({
      quizExists: !!quiz,
      quiz: quiz ? {
        id: quiz._id,
        title: quiz.title,
        passcode: quiz.passcode,
        status: quiz.status,
        eligibilityCriteria: quiz.eligibilityCriteria
      } : null,
      allQuizzes: allQuizzes.map(q => ({
        id: q._id,
        title: q.title,
        passcode: q.passcode,
        status: q.status
      }))
    });
    
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const testGradeCalculation = async (req, res) => {
  try {
    console.log('Testing grade calculation...');
    
    const testPercentages = [95, 87, 82, 77, 72, 67, 62, 57, 52, 47, 42, 30];
    const results = [];
    
    for (const percentage of testPercentages) {
      const grade = calculateGrade(percentage);
      results.push({ percentage, grade });
    }
    
    console.log('Grade calculation test results:', results);
    
    res.json({
      success: true,
      message: 'Grade calculation test completed',
      results
    });
    
  } catch (error) {
    console.error('Test grade calculation error:', error);
    res.status(500).json({ error: error.message });
  }
};

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
      moduleId,
      duration,
      startDateTime,
      endDateTime,
      instructions,
      passcode,
      eligibilityCriteria,
      shuffleQuestions = false,
      showResultsImmediately = false,
      allowLateSubmission = false
    } = req.body;

    console.log('Creating quiz with data:', {
      title,
      moduleId,
      duration,
      startDateTime,
      endDateTime,
      passcode,
      eligibilityCriteria
    });

    // Verify module exists and belongs to lecturer
    const module = await Module.findOne({
      _id: moduleId,
      createdBy: req.user._id,
      isActive: true
    });

    if (!module) {
      return res.status(404).json({ message: 'Module not found or access denied' });
    }

    // Check if there are questions for this module
    const questionCount = await Question.countDocuments({
      moduleId: module._id,
      isActive: true
    });

    if (questionCount === 0) {
      return res.status(400).json({ 
        message: 'Cannot create quiz: No questions found for this module' 
      });
    }

    const quiz = new Quiz({
      title: title.trim(),
      moduleId: module._id,
      moduleCode: module.moduleCode,
      moduleYear: module.moduleYear,
      moduleSemester: module.moduleSemester,
      duration,
      startDateTime: new Date(startDateTime),
      endDateTime: new Date(endDateTime),
      instructions: instructions.trim(),
      passcode: passcode.trim(),
      eligibilityCriteria,
      shuffleQuestions,
      showResultsImmediately,
      allowLateSubmission,
      createdBy: req.user._id,
      status: 'scheduled'
    });

    await quiz.save();
    console.log('Quiz created successfully:', quiz._id);

    res.status(201).json({
      success: true,
      quiz,
      message: 'Quiz created successfully'
    });

  } catch (error) {
    console.error('Create quiz error:', error);
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

export const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log('Updating quiz:', id, 'with data:', updateData);

    const quiz = await Quiz.findOne({
      _id: id,
      createdBy: req.user._id,
      isActive: true
    });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check if quiz can be edited
    const now = new Date();
    const hasStarted = now >= new Date(quiz.startDateTime);
    const hasEnded = now >= new Date(quiz.endDateTime);

    if (hasEnded) {
      return res.status(400).json({ 
        message: 'Cannot edit quiz: Quiz has already ended' 
      });
    }

    // If quiz has started, only allow certain fields to be updated
    if (hasStarted) {
      const allowedFields = ['endDateTime', 'allowLateSubmission', 'instructions'];
      const updateKeys = Object.keys(updateData);
      const invalidFields = updateKeys.filter(key => !allowedFields.includes(key));
      
      if (invalidFields.length > 0) {
        return res.status(400).json({ 
          message: `Cannot modify ${invalidFields.join(', ')} after quiz has started` 
        });
      }
    }

    Object.assign(quiz, updateData);
    await quiz.save();

    console.log('Quiz updated successfully');

    res.json({
      success: true,
      quiz,
      message: 'Quiz updated successfully'
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

    // Check if quiz has submissions
    const submissionCount = await Result.countDocuments({ quizId: id });
    if (submissionCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete quiz: Students have already submitted attempts' 
      });
    }

    quiz.isActive = false;
    await quiz.save();

    console.log('Quiz deleted successfully:', id);

    res.json({
      success: true,
      message: 'Quiz deleted successfully'
    });

  } catch (error) {
    console.error('Delete quiz error:', error);
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
    const hasStarted = now >= new Date(quiz.startDateTime);
    const hasEnded = now >= new Date(quiz.endDateTime);
    const isActive = hasStarted && !hasEnded;

    let editability;
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

    console.log('Getting quizzes for student:', {
      id: student._id,
      degreeTitle: student.degreeTitle,
      academicYear: student.academicYear,
      currentYear: student.currentYear,
      semester: student.semester,
      currentSemester: student.currentSemester
    });

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

    console.log('Quiz query:', JSON.stringify(query, null, 2));

    const quizzes = await Quiz.find(query)
      .populate('moduleId', 'moduleCode moduleName')
      .sort({ startDateTime: 1 });

    console.log(`Found ${quizzes.length} quizzes for student`);

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

    console.log('=== PASSCODE VERIFICATION ===');
    console.log('Quiz ID:', id);
    console.log('Received passcode:', `"${passcode}"`);
    console.log('Passcode type:', typeof passcode);

    // Find quiz with detailed logging
    const quiz = await Quiz.findOne({
      _id: id,
      isActive: true
    }).populate('moduleId', 'moduleCode moduleName');

    console.log('Quiz found:', !!quiz);

    if (!quiz) {
      console.log('Quiz not found or inactive');
      return res.status(404).json({ message: 'Quiz not found' });
    }

    console.log('Quiz details:', {
      title: quiz.title,
      passcode: `"${quiz.passcode}"`,
      passcodeType: typeof quiz.passcode,
      status: quiz.status
    });

    // Check if quiz was cancelled
    if (quiz.status === 'cancelled') {
      return res.status(400).json({ message: 'This quiz has been cancelled by the instructor' });
    }

    // Check if student is eligible
    const student = req.user;
    console.log('Student details:', {
      id: student._id,
      name: `${student.firstName} ${student.lastName}`,
      degreeTitle: student.degreeTitle,
      academicYear: student.academicYear,
      currentYear: student.currentYear,
      semester: student.semester,
      currentSemester: student.currentSemester
    });

    console.log('Quiz eligibility criteria:', quiz.eligibilityCriteria);

    const isEligible = quiz.eligibilityCriteria.some(criteria => {
      const degreeMatch = criteria.degreeTitle === student.degreeTitle;
      const yearMatch = criteria.year === (student.academicYear || student.currentYear);
      const semesterMatch = criteria.semester === (student.semester || student.currentSemester);
      
      console.log('Checking criteria:', {
        criteria: criteria,
        degreeMatch,
        yearMatch,
        semesterMatch,
        overall: degreeMatch && yearMatch && semesterMatch
      });
      
      return degreeMatch && yearMatch && semesterMatch;
    });

    if (!isEligible) {
      console.log('Student not eligible for quiz');
      return res.status(403).json({ message: 'You are not eligible for this quiz' });
    }

    // Check if quiz is currently active
    const now = new Date();
    const quizStart = new Date(quiz.startDateTime);
    const quizEnd = new Date(quiz.endDateTime);
    const isCurrentlyActive = now >= quizStart && now <= quizEnd;

    console.log('Time check:', {
      now: now.toISOString(),
      start: quizStart.toISOString(),
      end: quizEnd.toISOString(),
      isActive: isCurrentlyActive
    });

    if (!isCurrentlyActive) {
      if (now < quizStart) {
        return res.status(400).json({ message: 'Quiz has not started yet' });
      } else {
        return res.status(400).json({ message: 'Quiz has ended' });
      }
    }

    // Check if student already submitted
    const existingResult = await Result.findOne({
      studentId: student._id,
      quizId: id
    });

    if (existingResult) {
      return res.status(400).json({ message: 'You have already submitted this quiz' });
    }

    // Verify passcode - normalize both values
    const quizPasscode = String(quiz.passcode || '').trim();
    const inputPasscode = String(passcode || '').trim();
    
    console.log('Passcode comparison:', {
      expected: `"${quizPasscode}"`,
      received: `"${inputPasscode}"`,
      expectedLength: quizPasscode.length,
      receivedLength: inputPasscode.length,
      match: quizPasscode === inputPasscode
    });
    
    if (quizPasscode !== inputPasscode) {
      console.log('PASSCODE MISMATCH!');
      return res.status(400).json({ message: 'Invalid passcode' });
    }

    console.log('Passcode verified successfully!');

    res.json({
      success: true,
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        moduleCode: quiz.moduleCode,
        moduleName: quiz.moduleId.moduleName,
        duration: quiz.duration,
        instructions: quiz.instructions,
        startDateTime: quiz.startDateTime,
        endDateTime: quiz.endDateTime
      },
      message: 'Passcode verified successfully'
    });

  } catch (error) {
    console.error('Verify quiz passcode error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getQuizQuestions = async (req, res) => {
  try {
    const { id } = req.params;
    const student = req.user;

    console.log('Getting quiz questions for quiz:', id, 'student:', student._id);

    const quiz = await Quiz.findOne({
      _id: id,
      isActive: true
    });

    if (!quiz) {
      console.log('Quiz not found');
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check if student already submitted
    const existingResult = await Result.findOne({
      studentId: student._id,
      quizId: id
    });

    if (existingResult) {
      console.log('Student already submitted');
      return res.status(400).json({ message: 'You have already submitted this quiz' });
    }

    // Check if quiz is currently active
    const now = new Date();
    const quizStart = new Date(quiz.startDateTime);
    const quizEnd = new Date(quiz.endDateTime);
    const isCurrentlyActive = now >= quizStart && now <= quizEnd;

    if (!isCurrentlyActive) {
      console.log('Quiz not currently active');
      return res.status(400).json({ message: 'Quiz is not currently active' });
    }

    // Get questions for the quiz module
    let questions = await Question.find({
      moduleId: quiz.moduleId,
      isActive: true
    }).select('-answer -createdBy -updatedAt');

    console.log(`Found ${questions.length} questions for module ${quiz.moduleId}`);

    // Shuffle questions if enabled
    if (quiz.shuffleQuestions) {
      questions = questions.sort(() => Math.random() - 0.5);
      console.log('Questions shuffled');
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

export const submitQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers, timeTaken, startTime } = req.body;
    
    console.log('=== QUIZ SUBMISSION START ===');
    console.log('Quiz ID:', id);
    console.log('Student ID:', req.user._id);
    
    // Validate inputs
    if (!answers) {
      console.log('No answers provided');
      return res.status(400).json({ message: 'No answers provided' });
    }

    let finalAnswers = answers;

    if (!Array.isArray(answers)) {
      console.log('Answers not in array format, converting...');
      if (typeof answers === 'object') {
        finalAnswers = Object.entries(answers).map(([questionId, answer]) => ({
          questionId,
          answer
        }));
        console.log('Converted answers to array:', finalAnswers);
      } else {
        return res.status(400).json({ message: 'Invalid answers format' });
      }
    }
    
    // Find quiz
    const quiz = await Quiz.findById(id).populate('moduleId');
    if (!quiz) {
      console.log('Quiz not found for submission');
      return res.status(404).json({ message: 'Quiz not found' });
    }

    console.log('Quiz found:', quiz.title);

    // Check if student already submitted
    const existingResult = await Result.findOne({
      studentId: req.user._id,
      quizId: id
    });

    if (existingResult) {
      console.log('Student already submitted');
      return res.status(400).json({ message: 'Quiz already submitted' });
    }

    // Get quiz questions with correct answers
    const questions = await Question.find({
      moduleId: quiz.moduleId._id,
      isActive: true
    });

    console.log('Questions found:', questions.length);

    if (questions.length === 0) {
      console.log('No questions found for module:', quiz.moduleId._id);
      return res.status(400).json({ message: 'No questions found for this quiz' });
    }

    // Calculate score
    let totalScore = 0;
    let totalMarks = 0;
    const gradedAnswers = [];

    console.log('=== PROCESSING ANSWERS ===');

    for (const question of questions) {
      console.log(`\nProcessing question ${question._id}:`);
      
      const studentAnswer = finalAnswers.find(a => {
        const match = a.questionId === question._id.toString();
        return match;
      });
      
      const maxMarks = question.marks || 1;
      totalMarks += maxMarks;

      let isCorrect = false;
      let marks = 0;

      console.log('Student answer found:', !!studentAnswer);
      console.log('Student answer content:', studentAnswer?.answer);

      if (studentAnswer && studentAnswer.answer !== undefined && studentAnswer.answer !== null && studentAnswer.answer !== '') {
        if (question.type === 'MCQ') {
          const correctOption = question.options?.find(opt => opt.isCorrect);
          console.log('Correct option:', correctOption?.text);
          console.log('Student selected:', studentAnswer.answer);
          
          if (correctOption && studentAnswer.answer === correctOption.text) {
            isCorrect = true;
            marks = maxMarks;
          }
        } else if (question.type === 'Structured') {
          const answerText = String(studentAnswer.answer).trim();
          if (answerText.length > 0) {
            marks = Math.round(maxMarks * 0.7); // Give 70% for any attempt
            isCorrect = marks === maxMarks;
          }
        } else if (question.type === 'Essay') {
          const answerText = String(studentAnswer.answer).trim();
          if (answerText.length > 50) {
            marks = Math.round(maxMarks * 0.6); // Give 60% for substantial answer
            isCorrect = false; // Essays need manual review
          }
        }
      }

      totalScore += marks;
      console.log(`Question score: ${marks}/${maxMarks} (correct: ${isCorrect})`);

      gradedAnswers.push({
        questionId: question._id,
        questionText: question.questionText,
        questionType: question.type,
        studentAnswer: studentAnswer?.answer || '',
        correctAnswer: question.type === 'MCQ' ? 
          question.options?.find(opt => opt.isCorrect)?.text : 
          question.answer,
        isCorrect,
        marks,
        maxMarks
      });
    }

    const percentage = totalMarks > 0 ? Math.round((totalScore / totalMarks) * 100) : 0;
    const endTime = new Date();

    console.log('=== SCORE CALCULATION ===');
    console.log('Total score:', totalScore);
    console.log('Total marks:', totalMarks);
    console.log('Percentage:', percentage);

    // CALCULATE GRADE MANUALLY - FIX FOR THE ERROR
    const grade = calculateGrade(percentage);
    console.log('Calculated grade:', grade);

    // Create result record with grade explicitly set
    const resultData = {
      studentId: req.user._id,
      studentName: `${req.user.firstName} ${req.user.lastName}`,
      studentEmail: req.user.email,
      quizId: quiz._id,
      quizTitle: quiz.title,
      moduleCode: quiz.moduleCode,
      moduleId: quiz.moduleId._id,
      lecturerId: quiz.createdBy,
      answers: gradedAnswers,
      score: totalScore,
      totalMarks,
      percentage,
      grade: grade, // EXPLICITLY SET GRADE
      timeTaken: Math.round((timeTaken || 0) / 60000), // Convert milliseconds to minutes
      startTime: new Date(startTime || new Date()),
      endTime,
      submissionType: 'normal'
    };

    console.log('Creating result with grade:', grade);

    const result = new Result(resultData);
    
    console.log('About to save result...');
    await result.save();
    
    console.log('Result saved successfully with grade:', result.grade);
    console.log('=== QUIZ SUBMISSION COMPLETE ===');

    res.json({
      success: true,
      result: {
        score: totalScore,
        totalMarks,
        percentage,
        grade: result.grade,
        timeTaken: result.timeTaken
      },
      message: 'Quiz submitted successfully'
    });

  } catch (error) {
    console.error('=== SUBMIT QUIZ ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============================
// ANALYTICS ENDPOINTS - ENHANCED WITH CORRECT ANSWER COUNTS
// ============================

export const getAnalytics = async (req, res) => {
  try {
    const lecturerId = req.user._id;
    const { moduleCode, timeRange = '30d' } = req.query;

    console.log('Getting analytics for lecturer:', lecturerId, 'moduleCode:', moduleCode, 'timeRange:', timeRange);

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    if (timeRange === '7d') startDate.setDate(endDate.getDate() - 7);
    else if (timeRange === '30d') startDate.setDate(endDate.getDate() - 30);
    else if (timeRange === '90d') startDate.setDate(endDate.getDate() - 90);
    else startDate.setFullYear(endDate.getFullYear() - 1);

    const matchConditions = {
      lecturerId,
      createdAt: { $gte: startDate, $lte: endDate }
    };

    if (moduleCode && moduleCode !== 'all') {
      matchConditions.moduleCode = moduleCode;
    }

    console.log('Analytics match conditions:', matchConditions);

    // Overall statistics with correct answer counts
    const overallStats = await Result.aggregate([
      { $match: matchConditions },
      { $unwind: '$answers' }, // Unwind answers array to work with individual answers
      {
        $group: {
          _id: null,
          totalSubmissions: { $addToSet: '$_id' }, // Count unique submissions
          totalQuestions: { $sum: 1 }, // Total questions attempted
          correctAnswers: { $sum: { $cond: ['$answers.isCorrect', 1, 0] } }, // Count correct answers
          totalMarks: { $sum: '$answers.marks' }, // Sum of all marks earned
          maxPossibleMarks: { $sum: '$answers.maxMarks' }, // Sum of all possible marks
          averageScore: { $avg: '$percentage' },
          highestScore: { $max: '$percentage' },
          lowestScore: { $min: '$percentage' },
          totalStudents: { $addToSet: '$studentId' }
        }
      },
      {
        $project: {
          totalSubmissions: { $size: '$totalSubmissions' },
          totalQuestions: 1,
          correctAnswers: 1,
          totalMarks: 1,
          maxPossibleMarks: 1,
          correctAnswerRate: { 
            $round: [
              { $multiply: [{ $divide: ['$correctAnswers', '$totalQuestions'] }, 100] }, 
              1
            ] 
          },
          averageScore: { $round: ['$averageScore', 1] },
          highestScore: 1,
          lowestScore: 1,
          uniqueStudents: { $size: '$totalStudents' }
        }
      }
    ]);

    // Module-wise performance with correct answer statistics
    const modulePerformance = await Result.aggregate([
      { $match: matchConditions },
      { $unwind: '$answers' },
      {
        $group: {
          _id: '$moduleCode',
          averageScore: { $avg: '$percentage' },
          totalSubmissions: { $addToSet: '$_id' },
          totalQuestions: { $sum: 1 },
          correctAnswers: { $sum: { $cond: ['$answers.isCorrect', 1, 0] } },
          students: { $addToSet: '$studentId' }
        }
      },
      {
        $project: {
          moduleCode: '$_id',
          averageScore: { $round: ['$averageScore', 1] },
          totalSubmissions: { $size: '$totalSubmissions' },
          totalQuestions: 1,
          correctAnswers: 1,
          correctAnswerRate: { 
            $round: [
              { $multiply: [{ $divide: ['$correctAnswers', '$totalQuestions'] }, 100] }, 
              1
            ] 
          },
          uniqueStudents: { $size: '$students' },
          _id: 0
        }
      },
      { $sort: { averageScore: -1 } }
    ]);

    // Question-wise analytics (most difficult questions)
    const questionAnalytics = await Result.aggregate([
      { $match: matchConditions },
      { $unwind: '$answers' },
      {
        $group: {
          _id: {
            questionId: '$answers.questionId',
            questionText: '$answers.questionText',
            questionType: '$answers.questionType'
          },
          totalAttempts: { $sum: 1 },
          correctCount: { $sum: { $cond: ['$answers.isCorrect', 1, 0] } },
          averageMarks: { $avg: '$answers.marks' },
          maxMarks: { $first: '$answers.maxMarks' }
        }
      },
      {
        $project: {
          questionText: '$_id.questionText',
          questionType: '$_id.questionType',
          totalAttempts: 1,
          correctCount: 1,
          incorrectCount: { $subtract: ['$totalAttempts', '$correctCount'] },
          correctRate: { 
            $round: [
              { $multiply: [{ $divide: ['$correctCount', '$totalAttempts'] }, 100] }, 
              1
            ] 
          },
          averageMarks: { $round: ['$averageMarks', 1] },
          maxMarks: 1,
          difficulty: {
            $switch: {
              branches: [
                { 
                  case: { $gte: [{ $divide: ['$correctCount', '$totalAttempts'] }, 0.8] }, 
                  then: 'Easy' 
                },
                { 
                  case: { $gte: [{ $divide: ['$correctCount', '$totalAttempts'] }, 0.5] }, 
                  then: 'Medium' 
                },
                { 
                  case: { $lt: [{ $divide: ['$correctCount', '$totalAttempts'] }, 0.5] }, 
                  then: 'Hard' 
                }
              ],
              default: 'Unknown'
            }
          },
          _id: 0
        }
      },
      { $sort: { correctRate: 1 } }, // Sort by difficulty (lowest correct rate first)
      { $limit: 10 } // Top 10 most difficult questions
    ]);

    // Grade distribution
    const gradeDistribution = await Result.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: '$grade',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Recent submissions with correct answer details
    const recentSubmissions = await Result.find(matchConditions)
      .sort({ createdAt: -1 })
      .limit(10)
      .select('studentName quizTitle moduleCode percentage grade createdAt timeTaken answers')
      .lean();

    // Add correct answer counts to recent submissions
    const enhancedRecentSubmissions = recentSubmissions.map(submission => ({
      ...submission,
      totalQuestions: submission.answers?.length || 0,
      correctAnswers: submission.answers?.filter(ans => ans.isCorrect).length || 0,
      correctAnswerRate: submission.answers?.length > 0 ? 
        Math.round((submission.answers.filter(ans => ans.isCorrect).length / submission.answers.length) * 100) : 0,
      answers: undefined // Remove detailed answers from response for performance
    }));

    // Performance trends (last 7 days) with correct answer tracking
    const performanceTrends = await Result.aggregate([
      { $match: matchConditions },
      { $unwind: '$answers' },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          },
          submissions: { $addToSet: '$_id' },
          averageScore: { $avg: '$percentage' },
          totalQuestions: { $sum: 1 },
          correctAnswers: { $sum: { $cond: ['$answers.isCorrect', 1, 0] } }
        }
      },
      {
        $project: {
          date: '$_id.date',
          submissions: { $size: '$submissions' },
          averageScore: { $round: ['$averageScore', 1] },
          totalQuestions: 1,
          correctAnswers: 1,
          correctAnswerRate: { 
            $round: [
              { $multiply: [{ $divide: ['$correctAnswers', '$totalQuestions'] }, 100] }, 
              1
            ] 
          },
          _id: 0
        }
      },
      { $sort: { date: 1 } },
      { $limit: 7 }
    ]);

    // Top performers with correct answer details
    const topPerformers = await Result.aggregate([
      { $match: matchConditions },
      { $unwind: '$answers' },
      {
        $group: {
          _id: '$studentId',
          studentName: { $first: '$studentName' },
          totalSubmissions: { $addToSet: '$_id' },
          averageScore: { $avg: '$percentage' },
          bestScore: { $max: '$percentage' },
          totalQuestions: { $sum: 1 },
          correctAnswers: { $sum: { $cond: ['$answers.isCorrect', 1, 0] } }
        }
      },
      {
        $project: {
          studentName: 1,
          totalQuizzes: { $size: '$totalSubmissions' },
          averageScore: { $round: ['$averageScore', 1] },
          bestScore: 1,
          totalQuestions: 1,
          correctAnswers: 1,
          correctAnswerRate: { 
            $round: [
              { $multiply: [{ $divide: ['$correctAnswers', '$totalQuestions'] }, 100] }, 
              1
            ] 
          },
          _id: 0
        }
      },
      { $sort: { averageScore: -1 } },
      { $limit: 10 }
    ]);

    console.log('Analytics query results:', {
      overallStats: overallStats.length,
      modulePerformance: modulePerformance.length,
      gradeDistribution: gradeDistribution.length,
      recentSubmissions: recentSubmissions.length,
      performanceTrends: performanceTrends.length,
      topPerformers: topPerformers.length,
      questionAnalytics: questionAnalytics.length
    });

    res.json({
      success: true,
      analytics: {
        overall: {
          totalSubmissions: overallStats[0]?.totalSubmissions || 0,
          totalQuestions: overallStats[0]?.totalQuestions || 0,
          correctAnswers: overallStats[0]?.correctAnswers || 0,
          correctAnswerRate: overallStats[0]?.correctAnswerRate || 0,
          averageScore: overallStats[0]?.averageScore || 0,
          highestScore: overallStats[0]?.highestScore || 0,
          lowestScore: overallStats[0]?.lowestScore || 0,
          uniqueStudents: overallStats[0]?.uniqueStudents || 0
        },
        modulePerformance,
        gradeDistribution,
        recentSubmissions: enhancedRecentSubmissions,
        performanceTrends,
        topPerformers,
        questionAnalytics
      }
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getQuizResults = async (req, res) => {
  try {
    const { id } = req.params;
    const lecturerId = req.user._id;

    console.log('Getting quiz results for quiz:', id, 'lecturer:', lecturerId);

    const results = await Result.find({ 
      quizId: id, 
      lecturerId 
    })
    .sort({ percentage: -1 })
    .select('studentName studentEmail percentage grade timeTaken createdAt submissionType answers')
    .lean();

    // Add correct answer counts to quiz results
    const enhancedResults = results.map(result => ({
      ...result,
      totalQuestions: result.answers?.length || 0,
      correctAnswers: result.answers?.filter(ans => ans.isCorrect).length || 0,
      correctAnswerRate: result.answers?.length > 0 ? 
        Math.round((result.answers.filter(ans => ans.isCorrect).length / result.answers.length) * 100) : 0,
      answers: undefined // Remove detailed answers from response
    }));

    console.log(`Found ${results.length} results for quiz ${id}`);

    res.json({
      success: true,
      results: enhancedResults
    });

  } catch (error) {
    console.error('Get quiz results error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};