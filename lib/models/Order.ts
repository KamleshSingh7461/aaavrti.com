import mongoose, { Schema, model, models } from 'mongoose';

// --- Order Item Schema ---
const OrderItemSchema = new Schema({
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' }, // Not required for embedded
    productId: { type: String, ref: 'Product', required: true }, // Match Product _id type (String)
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    attributes: { type: Schema.Types.Mixed, required: true }, // JSON
}, { timestamps: false }); // managed by Order usually, but no, Prisma had explicit table

// But typically items are embedded in Order in MongoDB. 
// However, to keep migration simple and Prisma-like:
export const OrderItem = models.OrderItem || model('OrderItem', OrderItemSchema);


// --- Order Event Schema ---
const OrderEventSchema = new Schema({
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    status: { type: String, required: true },
    note: { type: String },
}, { timestamps: { createdAt: true, updatedAt: false } });

export const OrderEvent = models.OrderEvent || model('OrderEvent', OrderEventSchema);


// --- return Request ---
const ReturnRequestSchema = new Schema({
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, default: "PENDING" }, // PENDING, APPROVED, REJECTED, REFUNDED
    reason: { type: String, required: true },
    comment: { type: String },
    refundAmount: { type: Number },
    items: [{
        orderItemId: { type: String, required: true }, // Store as String to match OrderItem subdoc ID usage if needed, or ObjectId. Since OrderItems have _id.
        quantity: { type: Number, required: true }
    }]
}, { timestamps: true });

export const ReturnRequest = models.ReturnRequest || model('ReturnRequest', ReturnRequestSchema);


// --- Return Item ---
const ReturnItemSchema = new Schema({
    returnRequestId: { type: Schema.Types.ObjectId, ref: 'ReturnRequest', required: true },
    orderItemId: { type: Schema.Types.ObjectId, ref: 'OrderItem', required: true },
    quantity: { type: Number, required: true },
});

export const ReturnItem = models.ReturnItem || model('ReturnItem', ReturnItemSchema);



// --- Order Schema ---
const OrderSchema = new Schema({
    orderNumber: { type: String, default: () => `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, default: "PENDING" },

    shippingAddressId: { type: Schema.Types.ObjectId, ref: 'Address' },
    billingAddressId: { type: Schema.Types.ObjectId, ref: 'Address' },

    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    shippingCost: { type: Number, required: true },
    total: { type: Number, required: true },

    paymentProtocol: { type: String },
    paymentData: { type: String },
    shippingProtocol: { type: String },
    shippingData: { type: String },

    couponCode: { type: String },
    discountTotal: { type: Number, default: 0 },

    // Marketing Attribution
    source: String,
    campaign: String,
    medium: String,
    utmSource: String,
    utmMedium: String,
    utmCampaign: String,
    utmContent: String,
    utmTerm: String,

    couponId: { type: Schema.Types.ObjectId, ref: 'Coupon' },
    discountAmount: { type: Number, default: 0 },

    // Embedded Documents
    items: [OrderItemSchema],
    events: [OrderEventSchema]

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtuals for easy access/population congruence
OrderSchema.virtual('shippingAddress', {
    ref: 'Address',
    localField: 'shippingAddressId',
    foreignField: '_id',
    justOne: true
});

OrderSchema.virtual('billingAddress', {
    ref: 'Address',
    localField: 'billingAddressId',
    foreignField: '_id',
    justOne: true
});

OrderSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true
});

export const Order = models.Order || model('Order', OrderSchema);
