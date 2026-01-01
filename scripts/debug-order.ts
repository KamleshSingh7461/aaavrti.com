
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const targetId = "b3f7425f-b79b-4bdb-a39b-4961ef26770f";
    console.log("Target:", targetId);
    const orders = await prisma.order.findMany();
    console.log("Total Orders:", orders.length);
    orders.forEach(o => {
        console.log(`ID: '${o.id}' (Len: ${o.id.length}) | Number: '${o.orderNumber}'`);
        console.log(`   Match === : ${o.id === targetId}`);
    });
}

main();
