import { Router } from "express";
import { getCategories, getDevMetrics } from "./api.controller";

const router: Router = Router();

router.get("/categories", getCategories);
router.get("/developers/me/stats", getDevMetrics);
// router.get("/developers/me/agents/stats")
export default router;
