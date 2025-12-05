import { Request, Response } from "express";
import { CATEGORIES, assertValidCategory } from "../lib/agent.categories";
import { prisma } from "../lib/prisma";

export const getCategories = (_req: Request, res: Response) => {
  res.set("Cache-Control", "public, max-age=86400"); // catch category for 24hr = 86400
  res.json({
    categories: CATEGORIES.map((c) => ({
      id: c.id,
      label: c.label,
      description: c.description ?? null,
    })),
  });
};

export const getDevMetrics = async (req: Request, res: Response) => {
  if (!(req as any).user)
    return res.status(401).json({ error: "Unauthorized" });

  const developerAddress = (req as any).user?.address;
  const from = req.query.from ? new Date(req.query.from as string) : undefined;
  const to = req.query.to ? new Date(req.query.to as string) : undefined;

  const executions = await prisma.agentExecution.aggregate({
    where: {
      developerAddress,
      status: "PAID",
      ...(from || to
        ? {
            createdAt: {
              ...(from && { gte: from }),
              ...(to && { lte: to }),
            },
          }
        : {}),
    },
    _count: { _all: true },
    _sum: {
      price: true,
      platformFee: true,
      developerNet: true,
    },
  });

  const balance = await prisma.developerBalance.findUnique({
    where: { developerAddress },
  });

  const executionsByStatus = await prisma.agentExecution.groupBy({
    by: ["status"],
    where: { developerAddress },
    _count: true,
  });

  res.json({
    success: true,
    totals: {
      executions: executions._count._all,
      grossRevenue: executions._sum.price ?? 0,
      platformFees: executions._sum.platformFee ?? 0,
      netEarnings: executions._sum.developerNet ?? 0,
    },
    balances: {
      pending: balance?.pendingAmount ?? 0,
      paid: balance?.paidAmount ?? 0,
      lastPayoutAt: balance?.lastPayoutAt,
    },
    byStatus: executionsByStatus,
  });
};

export const getAgentsByCategory = async (req: Request, res: Response) => {
  const { category } = req.params;
  if (!category) res.status(400).json({ error: "category is undefined" });

  try {
    if (category) {
      assertValidCategory(category);
    }

    const agents = await prisma.agent.findMany({
      where: { category: category! },
      select: {
        id: true,
        name: true,
        cost: true,
        category: true,
        currency: true,
        isActive: true,
        description: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({ agents });
  } catch (err: any) {
    console.log("Failed to fetch agent:", err);

    return res
      .status(400)
      .json({ error: err.message ?? "Failed to fetch agents" });
  }
};

export const getAgentById = async (req: Request, res: Response) => {
  const { agentId } = req.params;

  if (!agentId) {
    return res.status(400).json({ error: "agentId is required" });
  }

  try {
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        cost: true,
        currency: true,
        version: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!agent) {
      return res.status(404).json({ error: "Agent not found" });
    }

    return res.json({ agent });
  } catch (err: any) {
    console.error("Failed to fetch agent:", err);
    return res.status(500).json({
      error: "Failed to fetch agent",
    });
  }
};
