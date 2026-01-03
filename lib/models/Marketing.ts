import mongoose, { Schema, model, models } from 'mongoose';

// --- Banner ---
const BannerSchema = new Schema({
    title: { type: String, required: true },
    subtitle: { type: String },
    image: { type: String, required: true },
    mobileImage: { type: String },
    link: { type: String },
    ctaText: { type: String },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

export const Banner = models.Banner || model('Banner', BannerSchema);


// --- Offer ---
const OfferSchema = new Schema({
    title: String,
    description: String,
    code: { type: String, unique: true, required: true },
    type: { type: String, default: "PERCENTAGE" }, // PERCENTAGE, FIXED
    value: { type: Number, required: true },
    minAmount: { type: Number, default: 0 },
    maxDiscount: { type: Number }, // Cap
    startDate: Date,
    endDate: Date,
    usageLimit: Number,
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },

    // Targeting
    applicableType: { type: String, default: "ALL" }, // ALL, CATEGORY, PRODUCT
    applicableIds: { type: String, default: "[]" }, // JSON String in schema, but we should treat as Array of Strings in practice if possible, or keep as string to match Prisma
}, { timestamps: true });

export const Offer = models.Offer || model('Offer', OfferSchema);


// --- Coupon ---
const CouponSchema = new Schema({
    code: { type: String, unique: true, required: true },
    type: { type: String, required: true }, // PERCENTAGE, FIXED_AMOUNT, FREE_SHIPPING
    value: { type: Number, required: true },
    minOrderValue: { type: Number, default: 0 },
    maxDiscount: Number,
    usageLimit: Number,
    usageCount: { type: Number, default: 0 },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    active: { type: Boolean, default: true },
    description: String,
}, { timestamps: true });

export const Coupon = models.Coupon || model('Coupon', CouponSchema);


// --- Newsletter ---
const NewsletterSubscriberSchema = new Schema({
    email: { type: String, unique: true, required: true },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const NewsletterSubscriber = models.NewsletterSubscriber || model('NewsletterSubscriber', NewsletterSubscriberSchema);


// --- SEO Tracking ---
const SEOTrackingSchema = new Schema({
    keyword: { type: String, required: true },
    url: { type: String, required: true },
    position: { type: Number, required: true },
    searchVolume: Number,
    clickRate: Number,
    impressions: Number,
    clicks: Number,
    date: { type: Date, default: Date.now },
}, { timestamps: { createdAt: true, updatedAt: false } });

SEOTrackingSchema.index({ keyword: 1, date: 1 });


export const SEOTracking = models.SEOTracking || model('SEOTracking', SEOTrackingSchema);


// --- Page Metadata (Dynamic SEO) ---
const PageMetadataSchema = new Schema({
    path: { type: String, required: true, unique: true }, // e.g. '/', '/shop', '/about'
    title: { type: String, required: true },
    description: { type: String, required: true },
    keywords: { type: String }, // Comma separated
    ogImage: { type: String },
    isSystem: { type: Boolean, default: false } // If true, prevent deletion of path
}, { timestamps: true });

export const PageMetadata = models.PageMetadata || model('PageMetadata', PageMetadataSchema);
