
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.DATABASE_URL;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in .env');
    process.exit(1);
}

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
    { slug: 'women', name: 'Women', image: IMAGES.lehenga[1] },
    { slug: 'men', name: 'Men', image: IMAGES.nehru[0] },
    { slug: 'kids', name: 'Kids', image: IMAGES.kids_boys[0] },
    { slug: 'accessories', name: 'Accessories', image: IMAGES.accessories[0] },
    { slug: 'sarees', name: 'Sarees', parent: 'women', image: IMAGES.saree[0] },
    { slug: 'kurtas', name: 'Kurtas', parent: 'women', image: IMAGES.kurta[0] },
    { slug: 'lehengas', name: 'Lehengas', parent: 'women', image: IMAGES.lehenga[0] },
    { slug: 'men-kurtas', name: 'Kurtas', parent: 'men', image: IMAGES.sherwani[0] },
    { slug: 'sherwanis', name: 'Sherwanis', parent: 'men', image: IMAGES.sherwani[0] },
    { slug: 'nehru-jackets', name: 'Nehru Jackets', parent: 'men', image: IMAGES.nehru[0] },
    { slug: 'boys-ethnic', name: 'Boys Ethnic', parent: 'kids', image: IMAGES.kids_boys[0] },
    { slug: 'girls-lehengas', name: 'Girls Lehengas', parent: 'kids', image: IMAGES.kids_girls[0] },
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
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected');

    console.log('🔥 Clearing data...');
    await Product.deleteMany({});
    await Category.deleteMany({});

    const catMap = new Map();
    const roots = CATEGORIES.filter(c => !c.parent);
    for (const c of roots) {
        const doc = await Category.create({
            name_en: c.name, name_hi: c.name, slug: c.slug,
            parentId: null, sortOrder: 0, image: c.image
        });
        catMap.set(c.slug, doc._id);
        console.log(` Created Root: ${c.name}`);
    }

    const subs = CATEGORIES.filter(c => c.parent);
    for (const c of subs) {
        const parentId = catMap.get(c.parent);
        const doc = await Category.create({
            name_en: c.name, name_hi: c.name, slug: c.slug,
            parentId: parentId, sortOrder: 1, image: c.image
        });
        catMap.set(c.slug, doc._id);
        console.log(` Created Sub: ${c.name} under ${c.parent}`);
    }

    const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const rndInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    console.log('🛍️ Generating 40 products...');
    for (let i = 0; i < 40; i++) {
        const leafCats = CATEGORIES.filter(c => c.parent);
        const catConfig = rnd(leafCats);
        const catId = catMap.get(catConfig.slug);

        let imageSet = IMAGES.accessories;
        if (catConfig.slug === 'sarees') imageSet = IMAGES.saree;
        else if (catConfig.slug === 'lehengas') imageSet = IMAGES.lehenga;
        else if (catConfig.slug === 'kurtas') imageSet = IMAGES.kurta;
        else if (catConfig.slug === 'sherwanis') imageSet = IMAGES.sherwani;
        else if (catConfig.slug === 'nehru-jackets') imageSet = IMAGES.nehru;
        else if (catConfig.slug === 'boys-ethnic') imageSet = IMAGES.kids_boys;
        else if (catConfig.slug === 'girls-lehengas') imageSet = IMAGES.kids_girls;
        else if (catConfig.slug === 'footwear') imageSet = IMAGES.footwear;
        else if (catConfig.slug === 'jewelry') imageSet = IMAGES.accessories;

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
            name_en: name, name_hi: `${name} (Hindi)`,
            slug: slug, sku: `SKU-${slug.toUpperCase()}`,
            description_en: `Experience the elegance of this ${name}.`,
            price: basePrice, stock: variants.reduce((acc, v) => acc + v.stock, 0),
            categoryId: catId, images: [mainImage],
            attributes: { Size: SIZES, Color: [color.name] },
            variants: variants, status: 'ACTIVE',
            featured: Math.random() > 0.7
        });
    }

    console.log('✅ Done');
    process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
