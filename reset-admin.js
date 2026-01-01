const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Resetting admin password...');
    try {
        const password = await bcrypt.hash('admin123', 10);
        const user = await prisma.user.upsert({
            where: { email: 'admin@aaavrti.com' },
            update: { password: password },
            create: {
                email: 'admin@aaavrti.com',
                name: 'Admin User',
                password: password,
                role: 'ADMIN'
            }
        });
        console.log('Admin user updated:', user.email);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
