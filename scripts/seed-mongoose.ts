
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.DATABASE_URL?.replace('.net/?', '.net/aaavrti?').replace('.net?', '.net/aaavrti?');

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in .env');
    process.exit(1);
}

// Schemas
const CategorySchema = new mongoose.Schema({
    name_en: String,
    name_hi: String,
    slug: { type: String, unique: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    image: String,
    sortOrder: Number
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({
    name_en: String,
    name_hi: String,
    slug: { type: String, unique: true },
    sku: String,
    description_en: String,
    description_hi: String,
    price: Number,
    stock: Number,
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    images: [String],
    attributes: mongoose.Schema.Types.Mixed,
    variants: mongoose.Schema.Types.Mixed,
    status: { type: String, default: 'ACTIVE' },
    featured: { type: Boolean, default: false },
    meta_title: String,
    meta_description: String,
    meta_keywords: String
}, { timestamps: true });

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

// Image Mappings
const IMAGES = {
    saree: ['/seed-images/saree (1).png', '/seed-images/saree (2).png', '/seed-images/saree (3).png'],
    lehenga: ['/seed-images/lehenga.png', '/seed-images/lehenga (2).png'],
    kurta: ['/seed-images/women kurta (1).png', '/seed-images/women kurta (2).png'],
    nehru: ['/seed-images/men nehru jacket.png'],
    sherwani: ['/seed-images/sherwani.png', '/seed-images/sherwani (2).png'],
    kids_boys: ['/seed-images/Boys Engines.png'],
    kids_girls: ['/seed-images/girl lehenga.png'],
    footwear: ['/seed-images/men footwear.png', '/seed-images/women footwear.png'],
    accessories: ['/seed-images/accessories.png']
};

const CATEGORIES = [
    // TOP LEVEL
    { slug: 'women', name: 'Women', image: IMAGES.lehenga[1] },
    { slug: 'men', name: 'Men', image: IMAGES.nehru[0] },
    { slug: 'kids', name: 'Kids', image: IMAGES.kids_boys[0] },
    { slug: 'accessories', name: 'Accessories', image: IMAGES.accessories[0] },

    // SUB LEVEL - Women
    { slug: 'sarees', name: 'Sarees', parent: 'women', image: IMAGES.saree[0] },
    { slug: 'kurtas', name: 'Kurtas', parent: 'women', image: IMAGES.kurta[0] },
    { slug: 'lehengas', name: 'Lehengas', parent: 'women', image: IMAGES.lehenga[0] },

    // SUB LEVEL - Men
    { slug: 'men-kurtas', name: 'Kurtas', parent: 'men', image: IMAGES.sherwani[0] },
    { slug: 'sherwanis', name: 'Sherwanis', parent: 'men', image: IMAGES.sherwani[0] },
    { slug: 'nehru-jackets', name: 'Nehru Jackets', parent: 'men', image: IMAGES.nehru[0] },

    // SUB LEVEL - Kids
    { slug: 'boys-ethnic', name: 'Boys Ethnic', parent: 'kids', image: IMAGES.kids_boys[0] },
    { slug: 'girls-lehengas', name: 'Girls Lehengas', parent: 'kids', image: IMAGES.kids_girls[0] },

    // SUB LEVEL - Accessories
    { slug: 'jewelry', name: 'Jewelry', parent: 'accessories', image: IMAGES.accessories[0] },
    { slug: 'footwear', name: 'Footwear', parent: 'accessories', image: IMAGES.footwear[0] }
];

const COLORS = [
    { name: 'Red', value: '#DC143C' },
    { name: 'Blue', value: '#4169E1' },
    { name: 'Green', value: '#50C878' },
    { name: 'Gold', value: '#FFD700' },
    { name: 'White', value: '#FFFFFF' },
    { name: 'Black', value: '#000000' }
];

const SIZES = ['S', 'M', 'L', 'XL'];

async function seed() {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI!);
    console.log('✅ Connected');

    console.log('🔥 DELETING ALL DATA (Clean Slate)...');
    await Product.deleteMany({});
    await Category.deleteMany({});
    console.log('✅ Data Cleared');

    // Create Categories
    console.log('📂 Creating Categories...');
    const catMap = new Map(); // slug -> id

    // First pass: Roots (Order specific to ensure created first)
    // Actually we can create them all, but linking parent requires parent ID.
    // Let's iterate Roots then Subs.

    // Roots
    const roots = CATEGORIES.filter(c => !c.parent);
    for (const c of roots) {
        const doc = await Category.create({
            name_en: c.name,
            name_hi: c.name,
            slug: c.slug,
            parentId: null,
            sortOrder: 0,
            image: c.image
        });
        catMap.set(c.slug, doc._id);
        console.log(`  └─ ${c.name}`);
    }

    // Subs
    const subs = CATEGORIES.filter(c => c.parent);
    for (const c of subs) {
        const parentId = catMap.get(c.parent);
        if (!parentId) {
            console.error(`Missing parent ${c.parent} for ${c.name}`);
            continue;
        }
        const doc = await Category.create({
            name_en: c.name,
            name_hi: c.name,
            slug: c.slug,
            parentId: parentId,
            sortOrder: 1,
            image: c.image
        });
        catMap.set(c.slug, doc._id);
        console.log(`     └─ ${c.name} (under ${c.parent})`);
    }

    // Create Products
    console.log('🛍️ Creating Products...');

    // Helper to pick random array item
    const rnd = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
    const rndInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

    const GENERATE_COUNT = 40;

    for (let i = 0; i < GENERATE_COUNT; i++) {
        const leafCats = CATEGORIES.filter(c => c.parent);
        const catConfig = rnd(leafCats);
        const catId = catMap.get(catConfig.slug);

        let imageSet = [];
        // Strict mapping based on slug
        if (catConfig.slug === 'sarees') imageSet = IMAGES.saree;
        else if (catConfig.slug === 'lehengas') imageSet = IMAGES.lehenga;
        else if (catConfig.slug === 'kurtas') imageSet = IMAGES.kurta; // Women

        else if (catConfig.slug === 'men-kurtas') imageSet = IMAGES.kurta.length > 0 ? IMAGES.kurta : IMAGES.sherwani; // Fallback to sherwani if no men kurta specific
        // Actually I mapped 'imageSet' in previous script generically, here explicitly.
        // My IMAGES object:
        // kurta: women kurta images.
        // men_kurta: empty.
        // I should probably allow cross-use if needed or use sherwani for men.
        else if (catConfig.slug === 'men-kurtas') imageSet = IMAGES.sherwani; // Use sherwani image as placeholder for men kurta if distinct image missing
        else if (catConfig.slug === 'sherwanis') imageSet = IMAGES.sherwani;
        else if (catConfig.slug === 'nehru-jackets') imageSet = IMAGES.nehru;

        else if (catConfig.slug === 'boys-ethnic') imageSet = IMAGES.kids_boys;
        else if (catConfig.slug === 'girls-lehengas') imageSet = IMAGES.kids_girls;

        else if (catConfig.slug === 'footwear') imageSet = IMAGES.footwear;
        else if (catConfig.slug === 'jewelry') imageSet = IMAGES.accessories;

        else imageSet = IMAGES.accessories;

        if (imageSet.length === 0) imageSet = IMAGES.accessories;

        const mainImage = rnd(imageSet);
        const color = rnd(COLORS);
        const basePrice = rndInt(15, 250) * 100;

        const name = `${rnd(['Royal', 'Classic', 'Elegant', 'Designer', 'Festive', 'Traditional'])} ${catConfig.name} - ${color.name}`;
        const slug = `${catConfig.slug}-${color.name.toLowerCase()}-${i}-${rndInt(100, 999)}`;

        const variants = SIZES.map(size => ({
            id: `v_${size}_${i}`,
            name: size,
            price: basePrice + (size === 'XL' ? 200 : 0),
            stock: rndInt(0, 50),
            sku: `SKU-${slug.toUpperCase()}-${size}`,
            attributes: { Size: size, Color: color.name }
        }));

        await Product.create({
            name_en: name,
            name_hi: `${name} (Hindi)`,
            slug: slug,
            sku: `SKU-${slug.toUpperCase()}`,
            description_en: `Experience the elegance of this ${name}. Crafted with premium materials.`,
            price: basePrice,
            stock: variants.reduce((acc, v) => acc + v.stock, 0),
            categoryId: catId,
            images: [mainImage],
            attributes: { Size: SIZES, Color: [color.name] },
            variants: variants,
            status: 'ACTIVE',
            featured: Math.random() > 0.7
        });
    }

    console.log('✅ Seeding Completed!');
    process.exit(0);
}

seed().catch(e => {
    console.error(e);
    process.exit(1);
});
