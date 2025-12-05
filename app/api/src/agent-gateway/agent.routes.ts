import { Router } from "express";
import { billAgentRun, runAgent } from "./agent.controller";
import { authMiddleware } from "../user-auth/user-auth.utils";

const router: Router = Router();

// /agents/:agentId/run
router.post("/agents/:agentId/run",authMiddleware, billAgentRun, runAgent);

export default router;
