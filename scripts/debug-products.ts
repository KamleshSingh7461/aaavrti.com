import { prisma } from '@/lib/db';
import { getProducts } from '@/actions/get-products';

// Helper to test a slug
async function testSlug(slug: string) {
    console.log(`\n\n--- Testing Slug: '${slug}' ---`);

    // 1. Check DB
    const category = await prisma.category.findUnique({
        where: { slug }
    });

    if (!category) {
        console.error(`❌ Category '${slug}' NOT FOUND in DB`);
        // Test fallback without ID
        try {
            console.log("   Testing getProducts with Slug ONLY (Mock Fallback)...");
            const products = await getProducts({ categorySlug: slug });
            console.log(`   ✅ Fallback Result: Found ${products.length} products`);
            products.forEach(p => console.log(`      - ${p.name_en} (CatID: ${p.categoryId})`));
        } catch (e) {
            console.error("   ❌ Fallback failed:", e);
        }
        return;
    }

    console.log(`✅ Found Category in DB: ${category.name_en} (ID: ${category.id})`);

    // 2. Test getProducts with DB ID + Slug
    try {
        console.log("   Testing getProducts with DB ID + Slug...");
        const products = await getProducts({
            categoryId: category.id,
            categorySlug: category.slug
        });
        console.log(`   ✅ Result: Found ${products.length} products`);
        products.forEach(p => console.log(`      - ${p.name_en} (CatID: ${p.categoryId})`));
    } catch (e) {
        console.error("   ❌ getProducts failed:", e);
    }
}

async function main() {
    await testSlug('sarees');
    await testSlug('kurtas');
    await testSlug('women'); // Parent
}

main();
