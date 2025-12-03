// import { PrismaClient } from "../generated/prisma";
import { PrismaClient } from "../generated/prisma";

declare global {
  // This is to prevent multiple instances of Prisma Client in dev
  // Node.js may hot reload and create multiple instances
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Use the existing PrismaClient if it exists, otherwise create a new one
export const prisma: PrismaClient = global.prisma ?? new PrismaClient();

// Assign to the global object in development to reuse
if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
