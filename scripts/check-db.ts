import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Checking Database...");

    const courses = await prisma.course.findMany({
        include: {
            modules: true
        }
    });

    console.log(`Found ${courses.length} courses.`);

    courses.forEach(course => {
        console.log(`Course: ${course.title} (${course.id})`);
        console.log(`- Modules: ${course.modules.length}`);
        course.modules.forEach(m => {
            console.log(`  - Module: ${m.title} (Week: ${m.weekNumber})`);
        });
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
