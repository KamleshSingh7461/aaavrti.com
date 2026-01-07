/**
 * Script to update SEO metadata from Aaavrti to Ournika
 * Run this once to update all page metadata in the database
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.DATABASE_URL?.replace('.net/?', '.net/aaavrti?').replace('.net?', '.net/aaavrti?');

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in .env');
    process.exit(1);
}

// Define PageMetadata schema
const PageMetadataSchema = new mongoose.Schema({
    path: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    keywords: String,
    ogImage: String,
    isSystem: { type: Boolean, default: false }
}, { timestamps: true });

const PageMetadata = mongoose.models.PageMetadata || mongoose.model('PageMetadata', PageMetadataSchema);

async function updateSEOMetadata() {
    console.log('🔄 Connecting to MongoDB...');
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find all pages with "Aaavrti" in title or description
        const pages = await PageMetadata.find({
            $or: [
                { title: /Aaavrti/i },
                { description: /Aaavrti/i }
            ]
        });

        console.log(`\n📊 Found ${pages.length} pages to update\n`);

        let updated = 0;
        for (const page of pages) {
            const oldTitle = page.title;
            const oldDescription = page.description;

            // Replace Aaavrti with Ournika (case-insensitive)
            page.title = page.title.replace(/Aaavrti/gi, 'Ournika');
            page.description = page.description.replace(/Aaavrti/gi, 'Ournika');

            await page.save();
            updated++;

            console.log(`✅ Updated: ${page.path}`);
            console.log(`   Old Title: ${oldTitle}`);
            console.log(`   New Title: ${page.title}`);
            if (oldDescription !== page.description) {
                console.log(`   Old Desc:  ${oldDescription}`);
                console.log(`   New Desc:  ${page.description}`);
            }
            console.log('');
        }

        console.log(`\n🎉 Successfully updated ${updated} pages!`);
        console.log('\n📋 Summary of updated pages:');

        const updatedPages = await PageMetadata.find({
            title: /Ournika/i
        }).select('path title');

        updatedPages.forEach(page => {
            console.log(`   - ${page.path}: ${page.title}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating SEO metadata:', error);
        process.exit(1);
    }
}

updateSEOMetadata();
