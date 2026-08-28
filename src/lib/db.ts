import { PrismaClient } from "@prisma/client";

// DATABASE_URL must include ?connection_limit=5&pool_timeout=10 per _shared/DB_STANDARD.md — set in .env.example / server .env, not hardcoded here.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
