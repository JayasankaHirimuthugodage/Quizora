import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import * as quizController from '../controllers/quizController.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Lecturer routes
router.get('/', 
  authorize('lecturer'), 
  quizController.getQuizzes
);

router.post('/', 
  authorize('lecturer'), 
  quizController.createQuiz
);

router.get('/stats', 
  authorize('lecturer'), 
  quizController.getQuizStats
);

router.get('/:id', 
  authorize('lecturer'), 
  quizController.getQuizById
);

router.put('/:id', 
  authorize('lecturer'), 
  quizController.updateQuiz
);

router.delete('/:id', 
  authorize('lecturer'), 
  quizController.deleteQuiz
);

// Student routes
router.get('/student/available', 
  authorize('student'), 
  quizController.getStudentQuizzes
);

router.post('/:id/verify-passcode', 
  authorize('student'), 
  quizController.verifyQuizPasscode
);

router.get('/:id/questions', 
  authorize('student'), 
  quizController.getQuizQuestions
);

export default router;