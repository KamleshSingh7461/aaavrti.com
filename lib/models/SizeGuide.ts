import mongoose from 'mongoose';

const SizeGuideSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name for this size guide'],
        trim: true,
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: false, // Can be generic
    },
    description: {
        type: String,
        required: false,
    },
    // Flexible structure: Array of row objects. 
    // Example: [{ size: "S", chest: "36", length: "28" }, ...]
    measurements: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
    // Ordered list of keys to display in table header (e.g. ["size", "chest", "length"])
    columns: {
        type: [String],
        required: true,
    },
    notes: {
        type: [String],
        default: [],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

export const SizeGuide = mongoose.models.SizeGuide || mongoose.model('SizeGuide', SizeGuideSchema);
