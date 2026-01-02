
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

// Banner Schema (Inline to avoid importing full project if unnecessary, but keeping same structure)
const BannerSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subtitle: String,
    image: { type: String, required: true },
    mobileImage: String,
    link: String,
    ctaText: String,
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 }
}, { timestamps: true });

const Banner = mongoose.models.Banner || mongoose.model('Banner', BannerSchema);

// Placeholder images (can be replaced by user later)
// Using high-quality placeholder URLs or local references if they exist
const PLACEHOLDERS = [
    'https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=2070&auto=format&fit=crop', // Wedding/Sari
    'https://images.unsplash.com/photo-1610030469668-965305c88e56?q=80&w=2070&auto=format&fit=crop', // Fabric/Textile
    'https://images.unsplash.com/photo-1596747610076-1e67e3355088?q=80&w=2070&auto=format&fit=crop', // Colorful
];

const BANNERS_DATA = [
    {
        title: 'The Royal Wedding Collection',
        subtitle: 'Handcrafted elegance for your special day',
        image: PLACEHOLDERS[0],
        mobileImage: PLACEHOLDERS[0],
        link: '/category/women/sarees',
        ctaText: 'Shop Now',
        isActive: true,
        sortOrder: 1
    },
    {
        title: 'Festive Season Arrivals',
        subtitle: 'Celebrate in style with our new collection',
        image: PLACEHOLDERS[1],
        mobileImage: PLACEHOLDERS[1],
        link: '/new/arrival',
        ctaText: 'Explore',
        isActive: true,
        sortOrder: 2
    },
    {
        title: 'Timeless Classics',
        subtitle: 'Heritage weaves that tell a story',
        image: PLACEHOLDERS[2],
        mobileImage: PLACEHOLDERS[2],
        link: '/category/women',
        ctaText: 'View Collection',
        isActive: true,
        sortOrder: 3
    }
];

async function seedBanners() {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI!);
    console.log('✅ Connected');

    console.log('🧹 Clearing existing banners...');
    await Banner.deleteMany({});

    console.log('🖼️ Seeding banners...');
    for (const banner of BANNERS_DATA) {
        await Banner.create(banner);
        console.log(`  └─ Created: ${banner.title}`);
    }

    console.log('✅ Banner Seeding Completed!');
    process.exit(0);
}

seedBanners().catch(e => {
    console.error(e);
    process.exit(1);
});
