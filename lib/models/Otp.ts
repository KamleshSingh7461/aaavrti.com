import mongoose from 'mongoose';

const OtpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        index: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300, // 5 minutes TTL (Time To Live)
    },
});

// Prevent overwrite if compiled
export const Otp = mongoose.models?.Otp || mongoose.model('Otp', OtpSchema);
