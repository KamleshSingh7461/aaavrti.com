import { prisma } from '../lib/db';

async function checkProductAttributes() {
    console.log('Checking product attributes...');

    // Get all products
    const products = await prisma.product.findMany({
        select: {
            id: true,
            name_en: true,
            attributes: true,
        },
        orderBy: {
            updatedAt: 'desc',
        },
        take: 5
    });

    console.log(`Checking last 5 updated products:`);

    products.forEach(p => {
        console.log(`\nProduct: ${p.name_en} (${p.id})`);
        console.log('Raw Attributes String:', p.attributes);

        try {
            const attrs = typeof p.attributes === 'string' ? JSON.parse(p.attributes) : p.attributes;
            console.log('Parsed Tags:', attrs?.tags || attrs?.Tags || 'None');
        } catch (e) {
            console.log('Error parsing attributes:', e);
        }
    });
}

checkProductAttributes()
    .then(() => {
        console.log('\nDone!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Error:', error);
        process.exit(1);
    });
