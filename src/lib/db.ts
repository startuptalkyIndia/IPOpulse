import { PrismaClient } from "@prisma/client";

// DATABASE_URL must include ?connection_limit=5&pool_timeout=10 per _shared/DB_STANDARD.md.
// Local dev: set in .env (see .env.example). Production: the app container's DATABASE_URL is
// hardcoded in docker-compose.yml's `environment:` block (which overrides env_file), not .env —
// the params live there, not in server .env.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
