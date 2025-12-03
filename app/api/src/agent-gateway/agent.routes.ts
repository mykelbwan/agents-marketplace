import { Router } from "express";
import { billAgentRun, runAgent } from "./agent.controller";

const router: Router = Router();

// /agents/:agentId/run
router.post("/agents/:agentId/run", billAgentRun, runAgent);

export default router;
