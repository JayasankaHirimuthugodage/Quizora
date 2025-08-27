import express from "express";
import Window from "../models/quizWindowModel.js";
import windowController from "../controllers/quizWindowController.js";

const router = express.Router();


router.post('/',windowController.createWindow);
router.get('/:id',windowController.getWindow);

export default router;