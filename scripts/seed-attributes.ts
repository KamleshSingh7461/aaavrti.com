// Quick script to manually seed attributes
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAttributes() {
    console.log('Seeding attributes...');

    // Create Color attribute
    const colorAttr = await prisma.attribute.create({
        data: {
            name: 'Color',
            type: 'COLOR',
            values: {
                create: [
                    { name: 'Crimson Red', value: '#DC143C' },
                    { name: 'Royal Blue', value: '#4169E1' },
                    { name: 'Emerald Green', value: '#50C878' },
                    { name: 'Golden', value: '#FFD700' },
                    { name: 'Ivory', value: '#FFFFF0' },
                    { name: 'Maroon', value: '#800000' },
                    { name: 'Navy Blue', value: '#000080' },
                    { name: 'Pink', value: '#FFC0CB' },
                    { name: 'Orange', value: '#FFA500' },
                    { name: 'Black', value: '#000000' },
                ],
            },
        },
    });

    // Create Size attribute
    const sizeAttr = await prisma.attribute.create({
        data: {
            name: 'Size',
            type: 'SIZE',
            values: {
                create: [
                    { name: 'Extra Small (XS)', value: 'XS' },
                    { name: 'Small (S)', value: 'S' },
                    { name: 'Medium (M)', value: 'M' },
                    { name: 'Large (L)', value: 'L' },
                    { name: 'Extra Large (XL)', value: 'XL' },
                    { name: 'XXL', value: 'XXL' },
                    { name: 'Free Size', value: 'Free Size' },
                ],
            },
        },
    });

    // Create Material attribute
    const materialAttr = await prisma.attribute.create({
        data: {
            name: 'Material',
            type: 'TEXT',
            values: {
                create: [
                    { name: 'Cotton', value: 'Cotton' },
                    { name: 'Silk', value: 'Silk' },
                    { name: 'Georgette', value: 'Georgette' },
                    { name: 'Chiffon', value: 'Chiffon' },
                    { name: 'Linen', value: 'Linen' },
                    { name: 'Velvet', value: 'Velvet' },
                ],
            },
        },
    });

    console.log('✅ Attributes seeded successfully!');
    await prisma.$disconnect();
}

seedAttributes().catch((e) => {
    console.error(e);
    process.exit(1);
});
