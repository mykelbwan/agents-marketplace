import { Request, Response } from "express";
import { CATEGORIES } from "../lib/agent.categories";
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

// For a given developerAddress:
//   totalExecutions
//   successfulExecutions
//   failedExecutions
//   totalRevenue (gross)
//   platformFees
//   netEarnings
//   pendingBalance
//   paidOut
//   lastPayoutAt

// Time-scoped metrics (important)
//   last 24h
//   last 7d
//   last 30d
//   custom range (optional)

export const getDevMetrics = async (req: Request, res: Response) => {
  // if (!req.user) return res.status(401).json({ error: "Unauthorized" }); // TODO uncomment after the fix bellow

  const developerAddress = "will fix it later"; // TODO add req.user.address
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
