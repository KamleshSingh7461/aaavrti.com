
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Checking Product Images...');

    const products = await prisma.product.findMany({
        take: 5,
        select: { name_en: true, images: true, variants: true }
    });

    products.forEach(p => {
        console.log(`\nProduct: ${p.name_en}`);
        console.log(`Images RAW: ${p.images}`);
        try {
            const imgs = JSON.parse(p.images);
            console.log(`Parsed Images:`, imgs);
        } catch (e) {
            console.log('Error parsing images JSON');
        }
    });
}

main()
    .then(async () => { await prisma.$disconnect() })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
