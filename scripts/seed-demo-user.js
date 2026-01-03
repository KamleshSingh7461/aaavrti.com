/**
 * Seed Script: Create Demo User for Razorpay Testing
 * 
 * This script creates a verified demo user account that can be shared
 * with Razorpay for testing payment integration.
 * 
 * Run: node scripts/seed-demo-user.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load environment variables
require('dotenv').config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment variables');
    process.exit(1);
}

// User Schema (simplified for seeding)
const UserSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String },
    name: { type: String },
    phone: { type: String },
    role: { type: String, default: "USER" },
    emailVerified: { type: Date },
    otp: { type: String },
    otpExpiry: { type: Date },
    image: { type: String },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Demo user credentials
const DEMO_USER = {
    email: 'demo@aaavrti.com',
    password: 'Demo@123',
    name: 'Demo User',
    phone: '+919876543210',
    role: 'USER',
    emailVerified: new Date(), // Mark as verified
};

async function seedDemoUser() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Check if demo user already exists
        const existingUser = await User.findOne({ email: DEMO_USER.email });

        if (existingUser) {
            console.log('⚠️  Demo user already exists. Updating...');

            // Hash the password
            const hashedPassword = await bcrypt.hash(DEMO_USER.password, 10);

            // Update existing user
            existingUser.password = hashedPassword;
            existingUser.name = DEMO_USER.name;
            existingUser.phone = DEMO_USER.phone;
            existingUser.role = DEMO_USER.role;
            existingUser.emailVerified = DEMO_USER.emailVerified;
            existingUser.otp = null; // Clear OTP
            existingUser.otpExpiry = null; // Clear OTP expiry

            await existingUser.save();
            console.log('✅ Demo user updated successfully!\n');
        } else {
            console.log('📝 Creating new demo user...');

            // Hash the password
            const hashedPassword = await bcrypt.hash(DEMO_USER.password, 10);

            // Create new user
            await User.create({
                ...DEMO_USER,
                password: hashedPassword,
            });

            console.log('✅ Demo user created successfully!\n');
        }

        // Display credentials
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎉 DEMO USER CREDENTIALS FOR RAZORPAY');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📧 Email:    ${DEMO_USER.email}`);
        console.log(`🔑 Password: ${DEMO_USER.password}`);
        console.log(`👤 Name:     ${DEMO_USER.name}`);
        console.log(`📱 Phone:    ${DEMO_USER.phone}`);
        console.log(`✅ Status:   Verified (Email verified)`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        console.log('📋 Share these credentials with Razorpay for testing:\n');
        console.log('   Login URL: https://aaavrti.shop/auth/login');
        console.log('   Email: demo@aaavrti.com');
        console.log('   Password: Demo@123\n');

        console.log('💡 This user can:');
        console.log('   ✓ Login without email verification');
        console.log('   ✓ Add items to cart');
        console.log('   ✓ Proceed to checkout');
        console.log('   ✓ Test Razorpay payment integration');
        console.log('   ✓ Complete orders\n');

    } catch (error) {
        console.error('❌ Error seeding demo user:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 MongoDB connection closed');
        process.exit(0);
    }
}

// Run the seed function
seedDemoUser();
