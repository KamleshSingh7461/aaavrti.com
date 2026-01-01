
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deduplicate() {
    console.log('🔍 Checking for duplicate attributes...');

    // Fetch all attributes with values
    const attributes = await prisma.attribute.findMany({
        include: { values: true },
    });

    const grouped: Record<string, typeof attributes> = {};

    // Group by name
    attributes.forEach(attr => {
        if (!grouped[attr.name]) grouped[attr.name] = [];
        grouped[attr.name].push(attr);
    });

    for (const name in grouped) {
        const list = grouped[name];
        if (list.length > 1) {
            console.log(`⚠️ Found ${list.length} duplicates for "${name}"`);

            // Keep the first one
            const primary = list[0];
            const duplicates = list.slice(1);

            // Move values from duplicates to primary
            for (const dup of duplicates) {
                console.log(`   Merging values from ${dup.id} to ${primary.id}`);

                for (const val of dup.values) {
                    // Check if value already exists in primary
                    const exists = primary.values.find(v => v.name === val.name);
                    if (!exists) {
                        try {
                            await prisma.attributeValue.update({
                                where: { id: val.id },
                                data: { attributeId: primary.id }
                            });
                        } catch (e) {
                            console.error(`Failed to move value ${val.name}:`, e);
                        }
                    } else {
                        // Value name exists, delete duplicate value
                        await prisma.attributeValue.delete({ where: { id: val.id } });
                    }
                }

                // Delete the duplicate attribute
                await prisma.attribute.delete({ where: { id: dup.id } });
            }
            console.log(`✅ Merged duplicates for "${name}"`);
        }
    }

    console.log('✨ Deduplication complete.');
}

deduplicate()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
