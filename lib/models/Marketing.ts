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
    // Basic Info
    title: String,
    description: String,
    code: { type: String, unique: true, required: true },
    name: String, // Display name for offer

    // Offer Type - EXPANDED
    type: {
        type: String,
        default: "PERCENTAGE",
        enum: ["PERCENTAGE", "FIXED", "BUNDLE", "BOGO", "MIX_MATCH", "QUANTITY_DISCOUNT", "TIERED"]
    },

    // Simple Discount Fields (existing)
    value: { type: Number, required: true }, // Percentage or fixed amount
    minAmount: { type: Number, default: 0 }, // Minimum cart value
    maxDiscount: { type: Number }, // Cap on discount amount

    // Bundle/BOGO Fields (NEW)
    bundleQuantity: { type: Number }, // e.g., 3 for "Buy 3"
    bundlePrice: { type: Number }, // e.g., 1999 for "@ ₹1999"
    buyQuantity: { type: Number }, // e.g., 2 for "Buy 2"
    getQuantity: { type: Number }, // e.g., 1 for "Get 1"
    getDiscount: { type: Number, default: 100 }, // Percentage discount on free items (100 = free)

    // Tiered Pricing (NEW)
    tiers: { type: String }, // JSON: [{ quantity: 2, discount: 10 }, { quantity: 3, discount: 20 }]

    // Validity
    startDate: Date,
    endDate: Date,
    usageLimit: Number,
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },

    // Targeting - EXPANDED
    applicableType: {
        type: String,
        default: "ALL",
        enum: ["ALL", "CATEGORY", "PRODUCT", "PRICE_RANGE", "COMBINED"]
    },
    applicableIds: { type: String, default: "[]" }, // JSON array of category/product IDs

    // Price Range Targeting (NEW)
    minPrice: { type: Number }, // Minimum product price to qualify
    maxPrice: { type: Number }, // Maximum product price to qualify

    // Display Settings (NEW)
    badgeText: { type: String }, // Custom badge text, e.g., "Buy 3 @ ₹1999"
    priority: { type: Number, default: 0 }, // Higher priority offers shown first
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
