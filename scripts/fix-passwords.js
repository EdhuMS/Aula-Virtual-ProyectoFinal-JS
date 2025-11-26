const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany();

    for (const user of users) {
        // Simple check: bcrypt hashes start with $2
        if (!user.password.startsWith('$2')) {
            console.log(`Hashing password for user: ${user.email}`);
            const hashedPassword = await bcrypt.hash(user.password, 10);
            await prisma.user.update({
                where: { id: user.id },
                data: { password: hashedPassword },
            });
        }
    }
    console.log('All passwords processed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
