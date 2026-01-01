
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Ensuring test user exists...');

    const email = 'kamlesh@example.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword, // Reset password if exists
        },
        create: {
            email,
            password: hashedPassword,
            name: 'Kamlesh Test',
            role: 'USER',
            emailVerified: new Date(),
        }
    });

    console.log(`✅ Test user ready: ${user.email}`);

    // Also ensure an address exists for convenience
    const address = await prisma.address.create({
        data: {
            userId: user.id,
            name: 'Kamlesh Test',
            street: '123 Test St',
            city: 'Test City',
            state: 'Test State',
            postalCode: '123456',
            phone: '9876543210'
        }
    });
    console.log(`✅ Test address created: ${address.city}`);
}

main()
    .then(async () => { await prisma.$disconnect() })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
