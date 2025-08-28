import { Router } from 'express';
import upload from '../middleware/uploads.js';
import * as questionController from '../controllers/questionController.js';

const router = Router();

router.post('/', upload.single('image'), questionController.createQuestion);
router.get('/', questionController.getAllQuestions);
router.get('/:id', questionController.getQuestionById);
router.put('/:id', upload.single('image'), questionController.updateQuestion);
router.delete('/:id', questionController.deleteQuestion);

export default router;
