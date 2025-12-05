import "dotenv/config";
import { createThirdwebClient } from "thirdweb";
import { facilitator, settlePayment } from "thirdweb/x402";
import { Request, Response, NextFunction } from "express";
import { executeAgent } from "agent-runtime";
import { prisma } from "../lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

const client = createThirdwebClient({
  secretKey: process.env.THIRDWEB_SECRET_KEY!,
});

const thirdwebFacilitator = facilitator({
  client,
  serverWalletAddress: process.env.ADDRESS!,
  waitUntil: "simulated",
});

export const billAgentRun = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const agentId = req.params.agentId;
  if (!agentId) {
    return res.status(400).json({ error: "agentId is required" });
  }

  const agent = await prisma.agent.findUnique({ where: { id: agentId } });
  if (!agent) {
    return res.status(404).json({ error: "Agent not found" });
  }

  const cost = new Decimal(agent.cost);

  // for free agents
  if (cost.isZero()) return next();

  const result = await settlePayment({
    resourceUrl: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
    method: req.method,

    paymentData:
      typeof req.headers["x-payment"] === "string"
        ? req.headers["x-payment"]
        : null,

    payTo: process.env.ADDRESS!,
    network: process.env.NETWORK!,
    price: String(agent.cost),

    facilitator: thirdwebFacilitator,

    routeConfig: {
      description: `Run agent: ${agent.name}`,
      mimeType: "application/json",
      maxTimeoutSeconds: 60,
    },
  });

  // ❌ Unpaid or invalid payment → block
  if (result.status !== 200) {
    return res
      .status(result.status)
      .set(result.responseHeaders)
      .json(result.responseBody);
  }

  // ✅ Paid → forward receipt headers + continue
  Object.entries(result.responseHeaders).forEach(([k, v]) => {
    res.setHeader(k, v);
  });

  next();
};

const PLATFORM_FEE_RATE = new Decimal("0.1"); // 10%

export const runAgent = async (req: Request, res: Response) => {
  const agentId = req.params.agentId;
  const input = req.body; // usr provided input
  const userAddress = (req as any).user?.address;
  if (!userAddress)
    return res.status(400).json({ error: "Wallet address required" });
  if (!agentId) return res.status(400).json({ error: "agentId is required" });

  const agent = await prisma.agent.findUnique({ where: { id: agentId } });
  if (!agent) return res.status(404).json({ error: "Agent not found" });

  // Convert Decimal safely
  const price = agent.cost;
  const platformFee = price.mul(PLATFORM_FEE_RATE);
  const developerNet = price.sub(platformFee);

  // 1️⃣ RECORD PAYMENT (before execution)
  const execution = await prisma.agentExecution.create({
    data: {
      agentId: agent.id,
      userAddress: userAddress, 
      developerAddress: agent.address,
      price,
      platformFee,
      developerNet,
      currency: agent.currency,
      status: "PAID",
    },
  });

  try {
    // 2️⃣ UPDATE STATUS → RUNNING
    await prisma.agentExecution.update({
      where: { id: execution.id },
      data: { status: "RUNNING" },
    });

    // 3 execute agent
    const result = await executeAgent({
      agentPath: agent.codePath,
      input,
      context: {
        agentId: agent.id,
        caller: userAddress,
        timeStamp: Date.now(),
      },
      timeoutMs: 5000,
    });

    // 4️⃣ SUCCESS
    await prisma.agentExecution.update({
      where: { id: execution.id },
      data: { status: "SUCCESS" },
    });

    return res.json({ result });
  } catch (err: any) {
    // 5️⃣ FAILURE (but paid!)
    await prisma.agentExecution.update({
      where: { id: execution.id },
      data: { status: "FAILED" },
    });
    res.status(500).json({ error: err.message });
  }
};
