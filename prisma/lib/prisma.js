import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis; // Use globalThis to handle single instance across hot reloads (Next.js, etc.)

let prisma;

if (!globalForPrisma.prisma) {
  prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'], // Optional: Enable detailed logging
  });

  globalForPrisma.prisma = prisma;
} else {
  prisma = globalForPrisma.prisma;
}

export default prisma;
