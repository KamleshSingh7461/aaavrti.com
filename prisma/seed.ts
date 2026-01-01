
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting Enterprise Seed...');

    // -------------------------------------------------------------------------
    // 0. Admin User
    // -------------------------------------------------------------------------
    const adminPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@aaavrti.com' },
        update: {},
        create: {
            email: 'admin@aaavrti.com',
            password: adminPassword,
            name: 'Admin User',
            role: 'ADMIN',
        }
    });

    console.log('✅ Admin user created: admin@aaavrti.com / admin123');

    // -------------------------------------------------------------------------
    // 1. Categories
    // -------------------------------------------------------------------------
    const women = await prisma.category.upsert({
        where: { slug: 'women' },
        update: {},
        create: { name_en: 'Women', name_hi: 'महिलाएं', slug: 'women' }
    });

    const sarees = await prisma.category.upsert({
        where: { slug: 'sarees' },
        update: {},
        create: { name_en: 'Sarees', name_hi: 'साड़ियां', slug: 'sarees', parentId: women.id }
    });

    const kurtas = await prisma.category.upsert({
        where: { slug: 'kurtas' },
        update: {},
        create: { name_en: 'Kurtas', name_hi: 'कुर्ती', slug: 'kurtas', parentId: women.id }
    });

    const men = await prisma.category.upsert({
        where: { slug: 'men' },
        update: {},
        create: { name_en: 'Men', name_hi: 'पुरुष', slug: 'men' }
    });

    const menKurtas = await prisma.category.upsert({
        where: { slug: 'men-kurtas' },
        update: {},
        create: { name_en: 'Kurtas', name_hi: 'कुर्ता', slug: 'men-kurtas', parentId: men.id }
    });

    console.log('✅ Categories created');

    // -------------------------------------------------------------------------
    // 2. Products
    // -------------------------------------------------------------------------
    const p1 = await prisma.product.upsert({
        where: { slug: 'banarasi-silk-saree-red' },
        update: {},
        create: {
            name_en: 'Royal Banarasi Silk Saree',
            name_hi: 'शाही बनारसी सिल्क साड़ी',
            slug: 'banarasi-silk-saree-red',
            description_en: 'Handwoven in Varanasi, this crimson red Banarasi saree features intricate zardosi work.',
            description_hi: 'वाराणसी में हाथ से बुनी गई।',
            price: 15499,
            hsn_code: '5007',
            categoryId: sarees.id,
            images: JSON.stringify(['https://images.unsplash.com/photo-1610189012906-47833a87c5a3']),
            featured: true,
            attributes: JSON.stringify({ fabric: 'Silk', color: 'Red', pattern: 'Zardosi' })
        }
    });

    const p2 = await prisma.product.upsert({
        where: { slug: 'chikankari-kurta-white' },
        update: {},
        create: {
            name_en: 'Classic White Chikankari Kurta',
            name_hi: 'क्लासिक सफेद चिकनकारी कुर्ता',
            slug: 'chikankari-kurta-white',
            description_en: 'Elegant Lucknowi Chikankari work on pure georgette fabric.',
            description_hi: 'शुद्ध जॉर्जेट कपड़े पर सुंदर लखनवी चिकनकारी।',
            price: 4599,
            hsn_code: '6204',
            categoryId: kurtas.id,
            images: JSON.stringify(['https://images.unsplash.com/photo-1583391733958-e026b1346338']),
            featured: true,
            attributes: JSON.stringify({ fabric: 'Georgette', color: 'White', size: ['S', 'M', 'L'] })
        }
    });

    console.log('✅ Products created');

    // -------------------------------------------------------------------------
    // 3. Users & Addresses (New!)
    // -------------------------------------------------------------------------
    // Demo User
    const user = await prisma.user.upsert({
        where: { email: 'demo@aaavrti.com' },
        update: {},
        create: {
            email: 'demo@aaavrti.com',
            name: 'Aditi Sharma',
            phone: '+919876543210',
            password: 'hashed_password_placeholder', // placeholder
            emailVerified: new Date(),
        }
    });

    // Address 1: Home
    const addressHome = await prisma.address.create({
        data: {
            userId: user.id,
            type: 'SHIPPING',
            label: 'Home',
            name: 'Aditi Sharma',
            street: '123, Silk Road, Indiranagar',
            city: 'Bengaluru',
            state: 'Karnataka',
            postalCode: '560038',
            phone: '+919876543210'
        }
    });

    console.log('✅ User & Addresses created');

    // -------------------------------------------------------------------------
    // 4. Orders & OrderItems (New!)
    // -------------------------------------------------------------------------
    const order = await prisma.order.create({
        data: {
            userId: user.id,
            status: 'DELIVERED',
            shippingAddressId: addressHome.id,
            billingAddressId: addressHome.id,
            subtotal: 15499,
            tax: 1800,
            shippingCost: 0,
            total: 17299,
            paymentProtocol: 'RAZORPAY',
            paymentData: JSON.stringify({ paymentId: 'pay_123456' }),
            items: {
                create: [
                    {
                        productId: p1.id,
                        quantity: 1,
                        price: 15499,
                        attributes: JSON.stringify({ color: 'Red' })
                    }
                ]
            },
            events: {
                create: [
                    { status: 'ORDER_PLACED', note: 'Order created' },
                    { status: 'PAYMENT_CONFIRMED', note: 'Razorpay success' },
                    { status: 'DELIVERED', note: 'Delivered by courier' }
                ]
            }
        }
    });

    console.log('✅ Orders & Items created');

    // -------------------------------------------------------------------------
    // 5. Attributes (Colors, Sizes, Materials)
    // -------------------------------------------------------------------------

    // Color Attribute
    const colorAttr = await prisma.attribute.upsert({
        where: { id: 'color-attr' },
        update: {},
        create: {
            id: 'color-attr',
            name: 'Color',
            type: 'COLOR',
        }
    });

    const colors = [
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
    ];

    for (const color of colors) {
        await prisma.attributeValue.upsert({
            where: { id: `color-${color.value}` },
            update: {},
            create: {
                id: `color-${color.value}`,
                attributeId: colorAttr.id,
                name: color.name,
                value: color.value,
            }
        });
    }

    // Size Attribute
    const sizeAttr = await prisma.attribute.upsert({
        where: { id: 'size-attr' },
        update: {},
        create: {
            id: 'size-attr',
            name: 'Size',
            type: 'SIZE',
        }
    });

    const sizes = [
        { name: 'Extra Small (XS)', value: 'XS' },
        { name: 'Small (S)', value: 'S' },
        { name: 'Medium (M)', value: 'M' },
        { name: 'Large (L)', value: 'L' },
        { name: 'Extra Large (XL)', value: 'XL' },
        { name: 'XXL', value: 'XXL' },
        { name: 'Free Size', value: 'Free Size' },
    ];

    for (const size of sizes) {
        await prisma.attributeValue.upsert({
            where: { id: `size-${size.value}` },
            update: {},
            create: {
                id: `size-${size.value}`,
                attributeId: sizeAttr.id,
                name: size.name,
                value: size.value,
            }
        });
    }

    // Material Attribute
    const materialAttr = await prisma.attribute.upsert({
        where: { id: 'material-attr' },
        update: {},
        create: {
            id: 'material-attr',
            name: 'Material',
            type: 'TEXT',
        }
    });

    const materials = [
        { name: 'Cotton', value: 'Cotton' },
        { name: 'Silk', value: 'Silk' },
        { name: 'Georgette', value: 'Georgette' },
        { name: 'Chiffon', value: 'Chiffon' },
        { name: 'Linen', value: 'Linen' },
        { name: 'Velvet', value: 'Velvet' },
    ];

    for (const material of materials) {
        await prisma.attributeValue.upsert({
            where: { id: `material-${material.value}` },
            update: {},
            create: {
                id: `material-${material.value}`,
                attributeId: materialAttr.id,
                name: material.name,
                value: material.value,
            }
        });
    }

    console.log('✅ Attributes created (Colors, Sizes, Materials)');
    console.log('🌱 Seed Completed!');
}

main()
    .then(async () => { await prisma.$disconnect() })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
