
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: ['query', 'error', 'warn'],
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Graceful connection check helper (optional usage)
export async function checkDatabaseConnection() {
    try {
        await prisma.$queryRaw`SELECT 1`;
        return true;
    } catch (e) {
        console.warn("Database connection failed, falling back to mock data likely.", e);
        return false;
    }
}
