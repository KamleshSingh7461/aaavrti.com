
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

console.log('🔍 Testing Cloudinary Config...');
console.log('Cloud Name:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? 'OK' : 'MISSING');
console.log('API Key:', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ? 'OK' : 'MISSING');
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? 'OK' : 'MISSING');

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

const IMAGES_DIR = path.join(process.cwd(), 'public', 'product images');
const files = fs.readdirSync(IMAGES_DIR).filter(f => !f.startsWith('.'));
const testFile = files[0];

if (!testFile) {
    console.error('❌ No images found in public/product images');
    process.exit(1);
}

const filePath = path.join(IMAGES_DIR, testFile);
console.log(`\n📤 Attempting upload of: ${testFile}`);

cloudinary.uploader.upload(filePath, { folder: 'test-debug' })
    .then(res => {
        console.log('✅ Upload Success!');
        console.log('URL:', res.secure_url);
    })
    .catch(err => {
        console.error('❌ Upload Failed:', err);
    });
