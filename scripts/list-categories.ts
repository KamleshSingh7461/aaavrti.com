
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    log: ['error', 'warn'], // Only log errors and warnings
});

async function main() {
    const categories = await prisma.category.findMany({
        orderBy: { slug: 'asc' },
        include: { parent: true }
    });

    console.log("\n\n=== CATEGORY LIST START ===");
    categories.forEach(c => {
        const parentSlug = c.parent ? `${c.parent.slug}/` : '';
        console.log(`SLUG: [${c.slug}] NAME: ${c.name_en} (ID: ${c.id})`);
        console.log(`URL: /category/${parentSlug}${c.slug}`);
        console.log("-------------------");
    });
    console.log("=== CATEGORY LIST END ===\n\n");
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
