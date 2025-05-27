import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient();
  console.log("✅ Prisma client initialized");


if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
