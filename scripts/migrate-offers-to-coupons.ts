/**
 * Migration Script: Offers → Coupons
 * 
 * This script migrates existing Offer records to the new Coupon model
 * Run this ONCE before switching to the new system
 * 
 * Usage: npx tsx scripts/migrate-offers-to-coupons.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateOffersToCoupons() {
    console.log('🚀 Starting migration: Offers → Coupons\n');

    try {
        // Fetch all offers
        const offers = await prisma.offer.findMany();
        console.log(`📊 Found ${offers.length} offers to migrate\n`);

        if (offers.length === 0) {
            console.log('✅ No offers to migrate. Exiting.');
            return;
        }

        let migrated = 0;
        let skipped = 0;
        let errors = 0;

        for (const offer of offers) {
            try {
                // Check if coupon with same code already exists
                const existing = await prisma.coupon.findUnique({
                    where: { code: offer.code }
                });

                if (existing) {
                    console.log(`⏭️  Skipping "${offer.code}" - already exists in Coupons`);
                    skipped++;
                    continue;
                }

                // Map Offer fields to Coupon fields
                const couponData = {
                    code: offer.code,
                    type: offer.type, // PERCENTAGE or FIXED
                    value: offer.value,
                    minOrderValue: offer.minAmount || 0,
                    maxDiscount: offer.maxDiscount,
                    usageLimit: offer.usageLimit,
                    usageCount: offer.usedCount,
                    validFrom: offer.startDate || new Date(),
                    validUntil: offer.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now if no end date
                    active: offer.isActive,
                    description: offer.title || offer.description,
                };

                // Create coupon
                await prisma.coupon.create({
                    data: couponData
                });

                console.log(`✅ Migrated: ${offer.code} (${offer.type}, ${offer.value})`);
                migrated++;

            } catch (error: any) {
                console.error(`❌ Error migrating "${offer.code}":`, error.message);
                errors++;
            }
        }

        console.log('\n📈 Migration Summary:');
        console.log(`   ✅ Migrated: ${migrated}`);
        console.log(`   ⏭️  Skipped: ${skipped}`);
        console.log(`   ❌ Errors: ${errors}`);
        console.log(`   📊 Total: ${offers.length}\n`);

        if (migrated > 0) {
            console.log('🎉 Migration completed successfully!');
            console.log('\n⚠️  IMPORTANT NEXT STEPS:');
            console.log('   1. Verify migrated coupons in admin panel');
            console.log('   2. Update frontend to use new Coupon system');
            console.log('   3. Test coupon application in cart/checkout');
            console.log('   4. Once verified, you can deprecate the Offer model\n');
        }

    } catch (error) {
        console.error('💥 Migration failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run migration
migrateOffersToCoupons()
    .then(() => {
        console.log('✨ Script completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Script failed:', error);
        process.exit(1);
    });
