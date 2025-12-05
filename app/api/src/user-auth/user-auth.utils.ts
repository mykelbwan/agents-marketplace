import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import "dotenv/config";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET not set");
}
const JWT_SECRET = process.env.JWT_SECRET;

export interface JwtPayload {
  id: number;
  address: string;
}

export const signToken = (data: any) => {
  return jwt.sign(data, JWT_SECRET, { expiresIn: "7d" });
};

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = auth.split(" ")[1];

  try {
    const decoded = jwt.verify(token!, JWT_SECRET) as unknown;

    if (
      typeof decoded !== "object" ||
      decoded === null ||
      !("id" in decoded) ||
      !("address" in decoded)
    ) {
      return res.status(401).json({ error: "Invalid token payload" });
    }

    (req as any).user = decoded as JwtPayload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};
