import { Router, type IRouter } from "express";
import healthRouter from "./health";
import certificationsRouter from "./certifications";
import examsRouter from "./exams";
import attemptsRouter from "./attempts";
import aiRouter from "./ai";

const router: IRouter = Router();

router.use(healthRouter);
router.use(certificationsRouter);
router.use(examsRouter);
router.use(attemptsRouter);
router.use(aiRouter);

export default router;
