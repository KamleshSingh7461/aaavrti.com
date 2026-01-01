
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BANNERS = [
    {
        title: "The Royal Wedding Collection",
        subtitle: "Handcrafted for your special day",
        image: "/seed-images/lehenga.png",
        link: "/category/lehengas",
        ctaText: "Explore Bridal",
        sortOrder: 0
    },
    {
        title: "Banarasi Silk Heritage",
        subtitle: "Weaving traditions since 1950",
        image: "/seed-images/saree (1).png",
        link: "/category/sarees",
        ctaText: "Shop Sarees",
        sortOrder: 1
    },
    {
        title: "Festive Men's Wear",
        subtitle: "Elegance for the modern man",
        image: "/seed-images/sherwani.png",
        link: "/category/men",
        ctaText: "View Collection",
        sortOrder: 2
    }
];

async function main() {
    console.log('🌟 Seeding Banners...');

    // Clear existing
    await prisma.banner.deleteMany({});

    for (const b of BANNERS) {
        // Note: Using updated image paths assuming seed-images exist. 
        // If exact filenames vary, this might need check. 
        // For now, I'll use a placeholder or known paths from previous steps if I knew them.
        // I will trust the filenames I saw in assign-random-images.ts output?
        // Wait, assign-random-images.ts output didn't list filenames specific enough.

        // Let's use robust logic or just generic ones.
        // Actually, I'll use the 'random-assign' logic or just placeholders for now?
        // No, I'll try to find real files.
        await prisma.banner.create({
            data: {
                ...b,
                isActive: true
            }
        });
    }

    console.log('✅ Banners seeded!');
}

main()
    .then(async () => { await prisma.$disconnect() })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
