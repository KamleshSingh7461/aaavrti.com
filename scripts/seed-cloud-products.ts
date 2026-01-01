
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load env vars
dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

const prisma = new PrismaClient();

const IMAGES_DIR = path.join(process.cwd(), 'public', 'product images');

async function uploadImage(filename: string): Promise<string> {
    const filePath = path.join(IMAGES_DIR, filename);
    if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        return 'https://via.placeholder.com/600'; // Fallback
    }

    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: 'aaavrti-products',
        });
        return result.secure_url;
    } catch (error) {
        console.error(`Failed to upload ${filename}:`, error);
        return 'https://via.placeholder.com/600';
    }
}

// Data Maps
const CATEGORIES = [
    { name: 'Women', slug: 'women' },
    { name: 'Sarees', slug: 'sarees', parent: 'women' },
    { name: 'Kurtas', slug: 'kurtas', parent: 'women' },
    { name: 'Lehengas', slug: 'lehengas', parent: 'women' },
];

// Product Templates (We will cycle through images)
const PRODUCTS = [
    // Sarees
    {
        name: 'Royal Banarasi Silk Saree',
        slug: 'royal-banarasi-silk-saree',
        desc: 'Handwoven in Varanasi, this saree features intricate zardosi work.',
        cat: 'sarees',
        price: 15999
    },
    {
        name: 'Kanjivaram Gold Weave',
        slug: 'kanjivaram-gold-weave',
        desc: 'Authentic Kanjivaram silk with rich gold borders.',
        cat: 'sarees',
        price: 22499
    },
    {
        name: 'Chiffon Floral Print',
        slug: 'chiffon-floral-print',
        desc: 'Lightweight chiffon saree with elegant floral prints.',
        cat: 'sarees',
        price: 2999
    },
    // Kurtas
    {
        name: 'Lucknowi Chikankari Kurta',
        slug: 'lucknowi-chikankari-kurta',
        desc: 'Hand-embroidered Chikankari on pure georgette.',
        cat: 'kurtas',
        price: 4599
    },
    {
        name: 'Cotton Block Print Kurta',
        slug: 'cotton-block-print-kurta',
        desc: 'Breathable cotton kurta with traditional Rajasthani block prints.',
        cat: 'kurtas',
        price: 1999
    },
    {
        name: 'Silk Blend Festive Kurta',
        slug: 'silk-blend-festive-kurta',
        desc: 'Rich silk blend kurta perfect for festive occasions.',
        cat: 'kurtas',
        price: 3499
    },
    // Lehengas (New Category)
    {
        name: 'Bridal Red Lehenga',
        slug: 'bridal-red-lehenga',
        desc: 'Heavy embroidery bridal lehenga with velvet blouse.',
        cat: 'lehengas',
        price: 45000
    },
    {
        name: 'Pastel Wedding Lehenga',
        slug: 'pastel-wedding-lehenga',
        desc: 'Soft pastel pink lehenga with mirror work.',
        cat: 'lehengas',
        price: 32000
    },
    {
        name: 'Navy Blue Reception Lehenga',
        slug: 'navy-blue-reception-lehenga',
        desc: 'Sequined navy blue lehenga for reception parties.',
        cat: 'lehengas',
        price: 38500
    }
];

async function main() {
    console.log('🚀 Starting Full Seed...');

    // 1. Get Images
    const files = fs.readdirSync(IMAGES_DIR).filter(f => !f.startsWith('.'));
    console.log(`Found ${files.length} images.`);

    // 2. Create Categories
    const catMap: Record<string, string> = {}; // slug -> id

    for (const cat of CATEGORIES) {
        const parentId = cat.parent ? catMap[cat.parent] : null;

        const c = await prisma.category.upsert({
            where: { slug: cat.slug },
            update: { parentId },
            create: {
                name_en: cat.name,
                name_hi: cat.name, // Simplified
                slug: cat.slug,
                parentId
            }
        });
        catMap[cat.slug] = c.id;
        console.log(`Category: ${cat.name} (${c.id})`);
    }

    // 3. Create Products & Variants
    for (let i = 0; i < PRODUCTS.length; i++) {
        const pData = PRODUCTS[i];
        const imageFile = files[i % files.length];

        console.log(`Processing ${pData.name} with image ${imageFile}...`);

        const imageUrl = await uploadImage(imageFile);

        // Define Variants
        const variants = [
            {
                id: `v-${pData.slug}-1`,
                price: pData.price,
                stock: 10,
                sku: `SKU-${pData.slug}-01`,
                attributes: { color: 'Red', size: 'S' },
                image: imageUrl
            },
            {
                id: `v-${pData.slug}-2`,
                price: pData.price,
                stock: 15,
                sku: `SKU-${pData.slug}-02`,
                attributes: { color: 'Blue', size: 'M' },
                image: imageUrl
            },
            {
                id: `v-${pData.slug}-3`,
                price: pData.price + 500, // Slightly more expensive
                stock: 5,
                sku: `SKU-${pData.slug}-03`,
                attributes: { color: 'Green', size: 'L' },
                image: imageUrl // Could use specific image if we had multiple per product
            }
        ];

        // Ensure AttributeValues exist for these variants (Simplified: assume seed-attributes.ts ran or run locally)
        // We skip creating Attributes here to keep script focused.

        await prisma.product.upsert({
            where: { slug: pData.slug },
            update: {
                images: JSON.stringify([imageUrl]),
                variants: JSON.stringify(variants),
                attributes: JSON.stringify({ // Legacy attributes for display
                    fabric: 'Silk/Cotton',
                    pattern: 'Embroidered',
                    care: 'Dry Clean'
                })
            },
            create: {
                name_en: pData.name,
                name_hi: pData.name,
                slug: pData.slug,
                description_en: pData.desc,
                description_hi: pData.desc,
                price: pData.price,
                hsn_code: '5208',
                categoryId: catMap[pData.cat],
                images: JSON.stringify([imageUrl]),
                variants: JSON.stringify(variants),
                stock: 30, // Sum of variant stocks
                featured: i < 4, // First 4 featured
                attributes: JSON.stringify({
                    fabric: 'Silk/Cotton',
                    pattern: 'Embroidered',
                    care: 'Dry Clean'
                })
            }
        });
        console.log(`✅ Upserted ${pData.name}`);
    }

    console.log('🎉 Seeding Complete!');
}

main()
    .then(async () => { await prisma.$disconnect() })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
