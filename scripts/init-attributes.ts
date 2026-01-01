import { prisma } from '../lib/db';

async function initializeAttributes() {
    console.log('Checking existing attributes...');

    const existing = await prisma.attribute.findMany();
    console.log(`Found ${existing.length} existing attributes`);

    if (existing.length > 0) {
        console.log('Attributes already exist:');
        existing.forEach(attr => {
            console.log(`- ${attr.name} (${attr.type})`);
        });

        // Check if Tags exists
        const tagsAttr = existing.find(a => a.name === 'Tags');
        if (!tagsAttr) {
            console.log('\nTags attribute missing! Creating it...');
            await prisma.attribute.create({
                data: {
                    name: 'Tags',
                    type: 'TEXT',
                    values: {
                        create: [
                            { name: 'Wedding Collection', value: 'wedding' },
                            { name: 'Festive Wear', value: 'festive' },
                            { name: 'Bestseller', value: 'bestseller' },
                            { name: 'New Arrival', value: 'new' },
                        ],
                    },
                },
            });
            console.log('✅ Tags attribute created!');
        } else {
            console.log('\n✅ Tags attribute already exists!');
        }
        return;
    }

    console.log('\nNo attributes found. Creating defaults...');

    // Create Color
    await prisma.attribute.create({
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
    console.log('✅ Color attribute created');

    // Create Size
    await prisma.attribute.create({
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
    console.log('✅ Size attribute created');

    // Create Material
    await prisma.attribute.create({
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
    console.log('✅ Material attribute created');

    // Create Tags
    await prisma.attribute.create({
        data: {
            name: 'Tags',
            type: 'TEXT',
            values: {
                create: [
                    { name: 'Wedding Collection', value: 'wedding' },
                    { name: 'Festive Wear', value: 'festive' },
                    { name: 'Bestseller', value: 'bestseller' },
                    { name: 'New Arrival', value: 'new' },
                ],
            },
        },
    });
    console.log('✅ Tags attribute created');

    console.log('\n🎉 All attributes initialized successfully!');
}

initializeAttributes()
    .then(() => {
        console.log('\nDone!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Error:', error);
        process.exit(1);
    });
