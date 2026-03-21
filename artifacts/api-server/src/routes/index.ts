import { Router, type IRouter } from "express";
import healthRouter from "./health";
import departmentsRouter from "./departments";
import jobsRouter from "./jobs";
import candidatesRouter from "./candidates";
import metricsRouter from "./metrics";
import costRouter from "./cost";
import benchmarkRouter from "./benchmark";
import pipelineRouter from "./pipeline";
import settingsRouter from "./settings";
import aiRouter from "./ai";
import emailRouter from "./email";

const router: IRouter = Router();

router.use(healthRouter);
router.use(departmentsRouter);
router.use(jobsRouter);
router.use(candidatesRouter);
router.use(metricsRouter);
router.use(costRouter);
router.use(benchmarkRouter);
router.use(pipelineRouter);
router.use(settingsRouter);
router.use(aiRouter);
router.use(emailRouter);

export default router;
