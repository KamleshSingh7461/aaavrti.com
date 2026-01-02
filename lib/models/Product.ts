import mongoose, { Schema, model, models } from 'mongoose';

// --- Category ---
const CategorySchema = new Schema({
  name_en: { type: String, required: true },
  name_hi: { type: String },
  slug: { type: String, unique: true, required: true },
  image: { type: String },
  parentId: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
  sortOrder: { type: Number, default: 0 },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  strictPopulate: false
});

CategorySchema.virtual('parent', {
  ref: 'Category',
  localField: 'parentId',
  foreignField: '_id',
  justOne: true
});

export const Category = models.Category || model('Category', CategorySchema);

// --- Attribute ---
const AttributeSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true }, // COLOR, SIZE, TEXT
  values: [{
    name: { type: String },
    value: { type: String }
  }]
}, { timestamps: true });

export const Attribute = models.Attribute || model('Attribute', AttributeSchema);

// --- Product ---
const ProductSchema = new Schema({
  name_en: { type: String, required: true },
  name_hi: { type: String },
  slug: { type: String, unique: true, required: true },
  sku: { type: String, unique: true },
  description_en: { type: String },
  description_hi: { type: String },
  price: { type: Number, required: true },
  hsn_code: { type: String },

  stock: { type: Number, default: 0 },
  status: { type: String, default: 'DRAFT' },
  featured: { type: Boolean, default: false },

  // Flexible JSON fields stored as Objects
  attributes: { type: Schema.Types.Mixed, default: {} },
  variants: { type: Schema.Types.Mixed, default: [] },
  images: { type: [String], default: [] }, // Array of URL strings

  categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },

  // SEO
  meta_title: String,
  meta_description: String,
  meta_keywords: String

}, { timestamps: true });

export const Product = models.Product || model('Product', ProductSchema);

// --- Review ---
const ReviewSchema = new Schema({
  rating: { type: Number, required: true },
  comment: String,
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  productId: { type: Schema.Types.ObjectId, ref: 'Product' }
}, { timestamps: true });

export const Review = models.Review || model('Review', ReviewSchema);

// --- Product View History ---
const ProductViewSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  productId: { type: Schema.Types.ObjectId, ref: 'Product' },
  viewedAt: { type: Date, default: Date.now }
});
ProductViewSchema.index({ userId: 1, viewedAt: 1 });

export const ProductView = models.ProductView || model('ProductView', ProductViewSchema);
