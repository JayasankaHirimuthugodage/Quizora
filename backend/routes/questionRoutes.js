import { Router } from 'express';
import upload from '../middleware/uploads.js';
import { authenticate, authorize } from '../middleware/auth.js';
import * as questionController from '../controllers/questionController.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Lecturer-only routes for question management
router.post('/', 
  authorize('lecturer'), 
  upload.single('image'), 
  questionController.createQuestion
);

router.get('/', 
  authorize('lecturer'), 
  questionController.getQuestions
);

router.get('/module/:moduleId', 
  authorize('lecturer'), 
  questionController.getQuestionsByModule
);

router.get('/stats', 
  authorize('lecturer'), 
  questionController.getQuestionStats
);

router.get('/modules', 
  authorize('lecturer'), 
  questionController.getLecturerModules
);

router.get('/:id', 
  authorize('lecturer'), 
  questionController.getQuestionById
);

router.put('/:id', 
  authorize('lecturer'), 
  upload.single('image'), 
  questionController.updateQuestion
);

router.delete('/:id', 
  authorize('lecturer'), 
  questionController.deleteQuestion
);

export default router;