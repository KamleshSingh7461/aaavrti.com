
import { prisma } from '../lib/db';
import { getProductById } from '../actions/get-products';

const ID = 'f77c9fd3-6e3a-444d-a764-ed68184b565b';

async function main() {
    console.log(`Checking for Product ID: ${ID}`);

    // 1. Direct Prisma Query
    const dbProduct = await prisma.product.findUnique({ where: { id: ID } });
    console.log('Direct DB Result:', dbProduct ? 'FOUND' : 'NOT FOUND');
    if (dbProduct) console.log(dbProduct.name_en);

    // 2. Action Query (Mock fallback check)
    const actionProduct = await getProductById(ID);

    // 3. Find ANY product
    const anyProduct = await prisma.product.findFirst();

    // Check Relation
    let categoryStatus = 'N/A';
    if (dbProduct && dbProduct.categoryId) {
        const cat = await prisma.category.findUnique({ where: { id: dbProduct.categoryId } });
        categoryStatus = cat ? `FOUND (${cat.name_en})` : 'MISSING';
    }

    const result = `
    Check for Product ID: ${ID}
    ---------------------------
    Direct DB Result: ${dbProduct ? 'FOUND' : 'NOT FOUND'}
    Category Status: ${categoryStatus}
    
    Attributes Raw: ${dbProduct?.attributes}
    Variants Raw: ${dbProduct?.variants}
    `;
    console.log(result);
    require('fs').writeFileSync('check-result.txt', result);
}

main().catch(console.error);
