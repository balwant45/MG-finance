// src/db/prisma.js
import { PrismaClient } from '@prisma/client';

// Create a single PrismaClient instance for the whole app
export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'] // Optional: logs for debugging
});

// Optional: handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
