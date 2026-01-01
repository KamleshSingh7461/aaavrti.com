
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const SEED_DIR = path.join(process.cwd(), 'public', 'seed-images');
const PUBLIC_PATH = '/seed-images';

async function main() {
    console.log('🎨 Starting Random Image Assignment...');

    // 1. Scan Seed Directory
    if (!fs.existsSync(SEED_DIR)) {
        console.error(`❌ Directory not found: ${SEED_DIR}`);
        console.error('Please create "public/seed-images" and add images there.');
        process.exit(1);
    }

    const files = fs.readdirSync(SEED_DIR).filter(f => /\.(jpg|jpeg|png|webp|avif)$/i.test(f));

    if (files.length === 0) {
        console.log('⚠️ No images found in public/seed-images. Please add some files!');
        process.exit(0);
    }

    console.log(`📸 Found ${files.length} images.`);

    // 2. Group Images by Keyword
    // Tags we look for in filenames: saree, kurta, lehenga, shirt, shoe, etc.
    const imageGroups: Record<string, string[]> = {};
    const keywords = ['saree', 'sari', 'kurta', 'kurti', 'lehenga', 'gown', 'suit', 'shirt', 'men', 'sherwani', 'jacket', 'shoe', 'footwear', 'sandal', 'jewelry', 'necklace', 'earring'];

    files.forEach(file => {
        const lower = file.toLowerCase();
        let matched = false;

        // Check specific keywords
        for (const kw of keywords) {
            if (lower.includes(kw)) {
                // Normalize keys (sari -> saree)
                const key = kw === 'sari' ? 'saree' : (kw === 'kurti' ? 'kurta' : kw);
                if (!imageGroups[key]) imageGroups[key] = [];
                imageGroups[key].push(`${PUBLIC_PATH}/${file}`);
                matched = true;
            }
        }

        // Fallback: 'misc'
        if (!matched) {
            if (!imageGroups['misc']) imageGroups['misc'] = [];
            imageGroups['misc'].push(`${PUBLIC_PATH}/${file}`);
        }
    });

    console.log('Categorized Images:', Object.keys(imageGroups).map(k => `${k}: ${imageGroups[k].length}`));

    // 3. Assign to Products
    const products = await prisma.product.findMany();
    let updatedCount = 0;

    for (const p of products) {
        const slug = p.slug.toLowerCase();
        const name = p.name_en.toLowerCase();

        // Find matching pool
        let pool: string[] = [];

        // Try strict matching first
        if (slug.includes('saree') || name.includes('saree')) pool = [...(imageGroups['saree'] || [])];
        else if (slug.includes('kurta') || name.includes('kurta')) pool = [...(imageGroups['kurta'] || [])];
        else if (slug.includes('lehenga') || name.includes('lehenga')) pool = [...(imageGroups['lehenga'] || [])];
        else if (slug.includes('sherwani') || name.includes('sherwani')) pool = [...(imageGroups['sherwani'] || []), ...(imageGroups['men'] || [])];
        else if (slug.includes('jacket') || name.includes('jacket')) pool = [...(imageGroups['jacket'] || []), ...(imageGroups['men'] || [])];
        else if (slug.includes('jewel') || name.includes('jewel')) pool = [...(imageGroups['jewelry'] || [])];

        // Fallback for "Men" generalized
        if (pool.length === 0 && (slug.includes('men') || name.includes('men'))) {
            pool = [...(imageGroups['men'] || []), ...(imageGroups['shirt'] || []), ...(imageGroups['kurta'] || [])];
        }

        // Final Fallback
        if (pool.length === 0) {
            pool = imageGroups['misc'] || [];
        }

        if (pool.length === 0) {
            // Safe fallback if absolutely nothing matches and no misc images
            // Use existing available images from other categories just to fill it up? 
            // Better to skip or leave placeholder.
            continue;
        }

        // Pick 2-4 random images
        const numImages = Math.floor(Math.random() * 3) + 2;
        const selectedImages = [];
        for (let i = 0; i < numImages; i++) {
            if (pool.length > 0) {
                const randIndex = Math.floor(Math.random() * pool.length);
                selectedImages.push(pool[randIndex]);
            }
        }

        // Unique only
        const uniqueMethod = Array.from(new Set(selectedImages));

        // Update Product
        await prisma.product.update({
            where: { id: p.id },
            data: {
                images: JSON.stringify(uniqueMethod)
            }
        });
        updatedCount++;
    }

    console.log(`✅ Updated ${updatedCount} products with new images.`);
}

main()
    .then(async () => { await prisma.$disconnect() })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
