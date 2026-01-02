
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.DATABASE_URL?.replace('.net/?', '.net/aaavrti?').replace('.net?', '.net/aaavrti?');

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in .env');
    process.exit(1);
}

const AttributeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
    values: [{
        name: { type: String },
        value: { type: String }
    }]
}, { timestamps: true });

const Attribute = mongoose.models.Attribute || mongoose.model('Attribute', AttributeSchema);

async function seedAttributes() {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI!);
    console.log('✅ Connected');

    const defaults = [
        {
            name: 'Color',
            type: 'COLOR',
            values: [
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
            ]
        },
        {
            name: 'Size',
            type: 'SIZE',
            values: [
                { name: 'Extra Small (XS)', value: 'XS' },
                { name: 'Small (S)', value: 'S' },
                { name: 'Medium (M)', value: 'M' },
                { name: 'Large (L)', value: 'L' },
                { name: 'Extra Large (XL)', value: 'XL' },
                { name: 'XXL', value: 'XXL' },
                { name: 'Free Size', value: 'Free Size' },
            ]
        },
        {
            name: 'Material',
            type: 'TEXT',
            values: [
                { name: 'Cotton', value: 'Cotton' },
                { name: 'Silk', value: 'Silk' },
                { name: 'Georgette', value: 'Georgette' },
                { name: 'Chiffon', value: 'Chiffon' },
                { name: 'Linen', value: 'Linen' },
                { name: 'Velvet', value: 'Velvet' },
            ]
        },
        {
            name: 'Tags',
            type: 'TEXT',
            values: [
                { name: 'Wedding Collection', value: 'wedding' },
                { name: 'Festive Wear', value: 'festive' },
                { name: 'Bestseller', value: 'bestseller' },
                { name: 'New Arrival', value: 'new' },
            ]
        }
    ];

    for (const def of defaults) {
        const existing = await Attribute.findOne({ name: def.name });
        if (!existing) {
            await Attribute.create(def);
            console.log(`✅ Created ${def.name}`);
        } else {
            console.log(`ℹ️ ${def.name} already exists`);
        }
    }

    console.log('✅ Attributes Seeding Completed!');
    process.exit(0);
}

seedAttributes().catch(e => {
    console.error(e);
    process.exit(1);
});
