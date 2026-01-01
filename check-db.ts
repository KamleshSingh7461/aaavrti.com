
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Checking Enterprise DB connection...");

        // Product
        const pCount = await prisma.product.count();
        console.log(`Product Count: ${pCount}`);

        // Address
        const aCount = await prisma.address.count();
        console.log(`Address Count: ${aCount}`);

        // User
        const uCount = await prisma.user.count();
        console.log(`User Count: ${uCount}`);

        // Order
        const oCount = await prisma.order.count();
        console.log(`Order Count: ${oCount}`);

        // Order Items
        const oiCount = await prisma.orderItem.count();
        console.log(`Order Item Count: ${oiCount}`);

    } catch (e) {
        console.error("DB Check Failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
