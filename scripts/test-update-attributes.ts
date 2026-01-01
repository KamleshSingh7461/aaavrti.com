import { updateProduct } from '../actions/product-actions';
import { prisma } from '../lib/db';

async function testUpdateAttributes() {
    console.log('Testing updateProduct attributes...');

    // Get a product
    const product = await prisma.product.findFirst();
    if (!product) {
        console.log('No product found');
        return;
    }

    console.log(`Updating product: ${product.name_en} (${product.id})`);

    // Create FormData
    const formData = new FormData();
    formData.append('id', product.id); // Although updateProduct takes id as arg
    // updateProduct signature: updateProduct(id: string, formData: FormData)

    // Add required fields
    formData.append('name_en', product.name_en);
    formData.append('description_en', product.description_en);
    formData.append('categoryId', product.categoryId);
    formData.append('price', String(product.price));
    formData.append('stock', String(product.stock));
    formData.append('status', product.status);

    // Add attributes with TAGS
    const attributes = {
        test: 'value',
        tags: ['test-tag', 'wedding']
    };
    formData.append('attributes', JSON.stringify(attributes));

    console.log('Sending attributes:', JSON.stringify(attributes));

    // Call updateProduct
    const result = await updateProduct(product.id, formData);

    if (result.error) {
        console.error('Update failed:', result.error);
    } else {
        console.log('Update success!');

        // Verify in DB
        const updated = await prisma.product.findUnique({
            where: { id: product.id }
        });

        console.log('Updated Attributes in DB:', updated?.attributes);
    }
}

testUpdateAttributes()
    .then(() => process.exit(0))
    .catch(e => {
        console.error(e);
        process.exit(1);
    });
