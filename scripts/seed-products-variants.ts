
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80";

async function main() {
    console.log('🌱 Starting Comprehensive Product Seeding...');

    // 1. Ensure Categories Exist
    const categories = [
        {
            name: 'Women', slug: 'women', children: [
                { name: 'Sarees', slug: 'sarees' },
                { name: 'Kurtas', slug: 'kurtas' },
                { name: 'Lehengas', slug: 'lehengas' },
            ]
        },
        {
            name: 'Men', slug: 'men', children: [
                { name: 'Kurtas', slug: 'men-kurtas' },
                { name: 'Sherwanis', slug: 'sherwanis' },
                { name: 'Nehru Jackets', slug: 'nehru-jackets' },
            ]
        },
        {
            name: 'Kids', slug: 'kids', children: [
                { name: 'Boys Engines', slug: 'boys-ethnic' },
                { name: 'Girls Lehengas', slug: 'girls-lehengas' },
            ]
        },
        {
            name: 'Accessories', slug: 'accessories', children: [
                { name: 'Jewelry', slug: 'jewelry' },
                { name: 'Footwear', slug: 'footwear' },
            ]
        }
    ];

    // Seed Categories
    for (const cat of categories) {
        const parent = await prisma.category.upsert({
            where: { slug: cat.slug },
            update: {},
            create: { name_en: cat.name, name_hi: cat.name, slug: cat.slug }
        });

        for (const child of cat.children) {
            const subCat = await prisma.category.upsert({
                where: { slug: child.slug },
                update: {},
                create: { name_en: child.name, name_hi: child.name, slug: child.slug, parentId: parent.id }
            });

            // 2. Create Products for Subcategory
            console.log(`Creating products for ${child.name}...`);
            await createProductsForCategory(subCat.id, child.slug, child.name);
        }
    }

    console.log('✅ Seeding Completed!');
}

async function createProductsForCategory(categoryId: string, catSlug: string, catName: string) {
    const products = [
        { name: `Classic ${catName} - Red`, color: 'Red', price: 2999 },
        { name: `Royal ${catName} - Blue`, color: 'Blue', price: 4599 },
        { name: `Elegant ${catName} - Green`, color: 'Green', price: 3299 },
        { name: `Premium ${catName} - Golden`, color: 'Gold', price: 8999 },
    ];

    for (const p of products) {
        const slug = `${catSlug}-${p.color.toLowerCase()}-${Math.floor(Math.random() * 1000)}`;

        // Generate Variants based on Category
        let variants = [];
        let attributes: any = { color: p.color, fabric: 'Cotton Silk' };

        if (catSlug.includes('saree') || catSlug.includes('dupabtta')) {
            // Sarees usually just have color variants or are single piece
            variants = [
                { id: 'v1', name: 'Standard', price: p.price, stock: 10, sku: `${slug}-STD`, attributes: { color: p.color } }
            ];
        } else {
            // Clothing usually has sizes
            const sizes = ['S', 'M', 'L', 'XL'];
            attributes.size = sizes;
            variants = sizes.map((size, idx) => ({
                id: `v-${idx}`,
                name: size,
                price: p.price, // Same price for sizes usually
                stock: 15,
                sku: `${slug}-${size}`,
                attributes: { size, color: p.color }
            }));
        }

        await prisma.product.upsert({
            where: { slug },
            update: {},
            create: {
                name_en: p.name,
                name_hi: `${p.name} (Hindi)`,
                slug: slug,
                sku: `${slug.toUpperCase()}-MAIN`, // Add SKU for main product
                description_en: `A beautiful ${p.name} made from high-quality materials. Perfect for any occasion.`,
                description_hi: `उच्च गुणवत्ता वाली सामग्री से बना एक सुंदर ${p.name}।`,
                price: p.price,
                categoryId: categoryId,
                status: 'ACTIVE',
                stock: 100,
                featured: Math.random() > 0.7, // 30% chance of being featured
                images: JSON.stringify([PLACEHOLDER_IMAGE]),
                attributes: JSON.stringify(attributes),
                variants: JSON.stringify(variants)
            }
        });
    }
}

main()
    .then(async () => { await prisma.$disconnect() })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
