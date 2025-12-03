import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { validateAgent } from "./agent.validator";
import { Agent } from "./agent.types";
import { prisma } from "../lib/prisma";
import { assertValidCategory } from "../lib/agent.categories";
import { AGENTS_ROOT } from "../config/path";

let file: Express.Multer.File | undefined;
let newAgent: any;

export const registerAgent = async (req: Request, res: Response) => {
  const { name, address, cost, description, category, version } =
    req.body as Agent;

  try {
    assertValidCategory(category);

    if (!name || !address || !cost || !version) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 2. Check agent name uniqueness
    const existingAgent = await prisma.agent.findUnique({ where: { name } });
    if (existingAgent) {
      return res.status(400).json({ error: "Agent name already Exist" });
    }

    // 3. Create initial DB record (codePath is placeholder)
    newAgent = await prisma.agent.create({
      data: {
        name,
        address,
        cost: cost,
        description,
        category,
        version: version,
        codePath: "", // temporary
      },
    });

    const agentDir = path.join(AGENTS_ROOT, category, address);
    fs.mkdirSync(agentDir, { recursive: true });

    // mv uploaded file to folder
    file = req.file;
    if (!file) {
      return res.status(400).json({ error: "Agent code file missing" });
    }

    const safeName = slugify(name);
    const filename = `${newAgent.id}-${safeName}.js`;

    const finalCodePath = path.join(agentDir, filename);
    fs.renameSync(file.path, finalCodePath);

    // validate agent interface
    validateAgent(finalCodePath);

    // update agent
    const updatedAgent = await prisma.agent.update({
      where: { id: newAgent.id },
      data: { codePath: finalCodePath },
      select: {
        id: true,
        name: true,
        address: true,
        cost: true,
        description: true,
        category: true,
        version: true,
        createdAt: true,
      },
    });

    res.status(201).json({ success: true, agent: updatedAgent });
  } catch (err: any) {
    console.error("Agent registration failed:", err);

    // remove agent folder
    if (newAgent?.id) {
      const filePath = path.join(
        AGENTS_ROOT,
        category,
        address,
        `${newAgent.id}-${slugify(name)}.js`
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // 🔥 rollback DB record
      await prisma.agent.delete({
        where: { id: newAgent.id },
      });
    }

    return res.status(400).json({
      error: err.message || "Failed to register your agent",
    });
  }
};

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
