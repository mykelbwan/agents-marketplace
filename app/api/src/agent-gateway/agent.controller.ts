const { paymentMiddleware } = require("x402-express");
import { createThirdwebClient } from "thirdweb";
import { Request, Response, NextFunction } from "express";
import { executeAgent } from "agent-runtime";
import { prisma } from "../lib/prisma";

const client = createThirdwebClient({
  secretKey: process.env.THIRDWEB_SECRET_KEY!,
});

export const billAgentRun = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const agentId = req.params.agentId;

  if (!agentId) return res.status(400).json({ error: "agentId is required" });

  // fetch agent pricing
  const agent = await prisma.agent.findUnique({ where: { id: agentId } });
  if (!agent) return res.status(404).json({ error: "Agent not found" });

  const middleware = paymentMiddleware(
    process.env.ADDRESS,
    {
      // the full path of the protected route must be provided
      "POST /api/run-agent/agents/:agentId/run": {
        price: String(agent.cost),
        network: process.env.NETWORK,
      },
    },
    {
      // facilitator,
    }
  );
  return middleware(req, res, next);
};

// // mock
// export const billAgentRun = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const agentId = req.params.agentId;
//   console.log("Billing middleware called for agent:", agentId);

//   const paymentHeader = req.headers["x-facilitator-payment"];
//   if (!paymentHeader || paymentHeader !== "mock-paid") {
//     return res.status(402).json({ error: "Payment Required" });
//   }

//   next();
// };

export const runAgent = async (req: Request, res: Response) => {
  const agentId = req.params.agentId;
  const input = req.body; // usr provided input

  if (!agentId) return res.status(400).json({ error: "agentId is required" });

  const agent = await prisma.agent.findUnique({ where: { id: agentId } });
  if (!agent) return res.status(404).json({ error: "Agent not found" });

  try {
    const result = await executeAgent({
      agentPath: agent.codePath,
      input,
      context: {
        agentId: agent.id,
        caller: "user", // TODO add req.user.address
        timeStamp: Date.now(),
      },
      timeoutMs: 5000,
    });

    return res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
