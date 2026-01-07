
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.DATABASE_URL?.replace('.net/?', '.net/aaavrti?').replace('.net?', '.net/aaavrti?');

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in .env');
    process.exit(1);
}

const UserSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String },
    name: { type: String },
    phone: { type: String },
    role: { type: String, default: "USER" },
    emailVerified: { type: Date },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seedAdmin() {
    console.log('🌱 Connecting to MongoDB...');
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected');

        const adminEmail = 'admin@ournika.com';
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('⚠️ Admin user already exists.');
            // Update role just in case
            if (existingAdmin.role !== 'ADMIN') {
                existingAdmin.role = 'ADMIN';
                await existingAdmin.save();
                console.log('✅ Updated existing user to ADMIN role.');
            }
        } else {
            const hashedPassword = await bcrypt.hash('password123', 10);
            await User.create({
                email: adminEmail,
                password: hashedPassword,
                name: 'Ournika Admin',
                role: 'ADMIN',
                phone: '9999999999',
                emailVerified: new Date()
            });
            console.log('✅ Created Admin User:');
            console.log('   Email: admin@ournika.com');
            console.log('   Password: password123');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding admin:', error);
        process.exit(1);
    }
}

seedAdmin();
