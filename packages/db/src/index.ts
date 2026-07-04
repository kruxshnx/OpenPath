export * from '@prisma/client';
export * from './skills.catalog';
import { PrismaClient } from '@prisma/client';

// Singleton PrismaClient shared across the app and workers. Avoids exhausting
// connections during dev hot-reload by caching on the global object.
declare global {
  // eslint-disable-next-line no-var
  var __openpathPrisma: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  global.__openpathPrisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.__openpathPrisma = prisma;
}
