
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('⚡ Seeding Flash Sale Offer...');

    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 24);

    // Create or Update the Flash Sale Offer
    const offer = await prisma.offer.upsert({
        where: { code: 'ROYAL_HERITAGE_SALE' },
        update: {
            title: "The Royal Heritage Sale",
            description: "Experience the grandeur of handwoven silk at unprecedented prices. Exclusive discounts on our Wedding Collection.",
            type: "PERCENTAGE",
            value: 40,
            endDate: tomorrow,
            isActive: true,
            applicableType: "CATEGORY",
            applicableIds: JSON.stringify(["wedding", "sarees"])
        },
        create: {
            code: 'ROYAL_HERITAGE_SALE',
            title: "The Royal Heritage Sale",
            description: "Experience the grandeur of handwoven silk at unprecedented prices. Exclusive discounts on our Wedding Collection.",
            type: "PERCENTAGE",
            value: 40,
            endDate: tomorrow,
            isActive: true,
            applicableType: "CATEGORY",
            applicableIds: JSON.stringify(["wedding", "sarees"])
        }
    });

    console.log(`✅ Flash Sale Created: ${offer.title} (Ends: ${offer.endDate})`);
}

main()
    .then(async () => { await prisma.$disconnect() })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
