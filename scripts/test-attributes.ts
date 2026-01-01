// Quick test to verify database has attributes
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAttributes() {
    console.log('Testing attribute queries...');

    const attributes = await prisma.attribute.findMany({
        include: {
            values: true,
        },
    });

    console.log(`Found ${attributes.length} attributes`);
    attributes.forEach(attr => {
        console.log(`- ${attr.name} (${attr.type}): ${attr.values.length} values`);
    });

    await prisma.$disconnect();
}

testAttributes().catch(console.error);
