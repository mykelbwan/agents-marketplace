import { Router } from "express";
import {
  getCategories,
  getDevMetrics,
  getAgentsByCategory,
  getAgentById,
} from "./api.controller";

const router: Router = Router();

router.get("/categories", getCategories);
router.get("/developers/me/stats", getDevMetrics);
router.get("/agents-by-category/:category", getAgentsByCategory);
router.get("/:agentId", getAgentById);

export default router;
