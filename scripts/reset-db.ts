
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting database cleanup...');

    try {
        // Delete in order of dependency
        console.log('Deleting ReturnItems...');
        await prisma.returnItem.deleteMany();

        console.log('Deleting ReturnRequests...');
        await prisma.returnRequest.deleteMany();

        console.log('Deleting OrderItems...');
        await prisma.orderItem.deleteMany();

        console.log('Deleting OrderEvents...');
        await prisma.orderEvent.deleteMany();

        console.log('Deleting Orders...');
        await prisma.order.deleteMany();

        console.log('Deleting Reviews...');
        await prisma.review.deleteMany();

        console.log('Deleting Products...');
        await prisma.product.deleteMany();

        console.log('Database cleanup completed successfully.');
    } catch (error) {
        console.error('Error cleaning database:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
