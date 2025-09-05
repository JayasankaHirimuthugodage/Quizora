import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import * as moduleController from '../controllers/moduleController.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Lecturer-only routes for module management
router.get('/', 
  authorize('lecturer'), 
  moduleController.getModules
);

router.post('/', 
  authorize('lecturer'), 
  moduleController.createModule
);

router.put('/:id', 
  authorize('lecturer'), 
  moduleController.updateModule
);

router.delete('/:id', 
  authorize('lecturer'), 
  moduleController.deleteModule
);

router.get('/stats', 
  authorize('lecturer'), 
  moduleController.getModuleStats
);

export default router;