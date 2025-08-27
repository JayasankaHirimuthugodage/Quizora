import express from "express";
import Window from "../models/quizWindowModel.js";
import windowController from "../controllers/quizWindowController.js";

const router = express.Router();


router.post('/',windowController.createWindow);
router.get('/',windowController.getWindows);
router.get('/:id',windowController.getWindow);
router.put('/:id',windowController.updateWindow);
router.delete('/:id',windowController.deleteWindow);


export default router;