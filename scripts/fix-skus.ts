
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔧 Fixing Missing SKUs...');

    const products = await prisma.product.findMany({
        where: { sku: null }
    });

    console.log(`Found ${products.length} products without SKU.`);

    for (const p of products) {
        // Generate a SKU: First 3 letters of name + 6 Random Digits
        const skuPrefix = p.name_en.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
        const random = Math.floor(100000 + Math.random() * 900000); // 6 digits
        // Or better: use part of the uuid
        const uuidPart = p.id.split('-')[0].toUpperCase();
        const sku = `${skuPrefix}-${uuidPart}-${random}`;

        try {
            await prisma.product.update({
                where: { id: p.id },
                data: { sku }
            });
            console.log(`Updated ${p.name_en} -> SKU: ${sku}`);
        } catch (e) {
            console.error(`Failed to update ${p.name_en}: ${e}`);
        }
    }

    console.log('✅ SKU Fix Completed!');
}

main()
    .then(async () => { await prisma.$disconnect() })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
