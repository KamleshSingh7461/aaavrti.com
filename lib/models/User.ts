import mongoose, { Schema, model, models } from 'mongoose';

// --- Address Schema ---
const AddressSchema = new Schema({
  type: { type: String, default: "SHIPPING" },
  label: { type: String },
  name: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, default: "IN" },
  phone: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export const Address = models.Address || model('Address', AddressSchema);

// --- User Schema ---
const UserSchema = new Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String },
  name: { type: String },
  phone: { type: String },
  role: { type: String, default: "USER" },
  emailVerified: { type: Date },
  image: { type: String },

  // Relations (Virtuals or embedded if needed, but keeping relational for now to match Prisma)
  // addresses: [{ type: Schema.Types.ObjectId, ref: 'Address' }],
  // orders: [{ type: Schema.Types.ObjectId, ref: 'Order' }],

}, { timestamps: true });

export const User = models.User || model('User', UserSchema);

// --- Wishlist Item Schema ---
const WishlistItemSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
}, { timestamps: true });

// Check for uniqueness
WishlistItemSchema.index({ userId: 1, productId: 1 }, { unique: true });

export const WishlistItem = models.WishlistItem || model('WishlistItem', WishlistItemSchema);
