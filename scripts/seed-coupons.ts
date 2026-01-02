
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

const CouponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    value: { type: Number, required: true },
    minOrderValue: Number,
    maxDiscount: Number,
    usageLimit: Number,
    validFrom: Date,
    validUntil: Date,
    description: String,
    active: { type: Boolean, default: true },
    usageCount: { type: Number, default: 0 }
}, { timestamps: true });

const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);

async function seedCoupons() {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI!);
    console.log('✅ Connected');

    const now = new Date();
    const nextYear = new Date();
    nextYear.setFullYear(now.getFullYear() + 1);

    const coupons = [
        {
            code: 'WELCOME10',
            type: 'PERCENTAGE',
            value: 10,
            validFrom: now,
            validUntil: nextYear,
            description: 'Welcome discount for new users',
            usageLimit: 1000
        },
        {
            code: 'FESTIVE500',
            type: 'FIXED_AMOUNT',
            value: 500,
            minOrderValue: 2000,
            validFrom: now,
            validUntil: nextYear,
            description: 'Festive season flat discount'
        }
    ];

    for (const c of coupons) {
        const existing = await Coupon.findOne({ code: c.code });
        if (!existing) {
            await Coupon.create(c);
            console.log(`✅ Created Coupon: ${c.code}`);
        } else {
            console.log(`ℹ️ Coupon ${c.code} already exists`);
        }
    }

    console.log('✅ Coupons Seeding Completed!');
    process.exit(0);
}

seedCoupons().catch(e => {
    console.error(e);
    process.exit(1);
});
