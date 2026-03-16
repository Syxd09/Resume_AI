
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const userCount = await prisma.user.count();
    console.log(`User count: ${userCount}`);

    const users = await prisma.user.findMany({
        take: 5,
        select: {
            email: true,
            createdAt: true
        }
    });

    console.log('Last 5 users:');
    console.log(JSON.stringify(users, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
