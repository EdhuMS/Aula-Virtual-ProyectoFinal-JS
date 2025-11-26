const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');
    const password = await hash('123456', 12);

    // Admin
    const admin = await prisma.user.upsert({
        where: { email: 'admin@aulavirtual.com' },
        update: {},
        create: {
            email: 'admin@aulavirtual.com',
            name: 'Administrador',
            password,
            role: 'ADMIN',
        },
    });
    console.log('Created Admin:', admin.email);

    // Teacher
    const teacher = await prisma.user.upsert({
        where: { email: 'profesor@aulavirtual.com' },
        update: {},
        create: {
            email: 'profesor@aulavirtual.com',
            name: 'Profesor Demo',
            password,
            role: 'TEACHER',
        },
    });
    console.log('Created Teacher:', teacher.email);

    // Student
    const student = await prisma.user.upsert({
        where: { email: 'alumno@aulavirtual.com' },
        update: {},
        create: {
            email: 'alumno@aulavirtual.com',
            name: 'Alumno Demo',
            password,
            role: 'STUDENT',
        },
    });
    console.log('Created Student:', student.email);

    // Course
    const course = await prisma.course.create({
        data: {
            title: 'Desarrollo Web Avanzado',
            description: 'Curso completo de desarrollo web moderno con Next.js y React.',
            teacherId: teacher.id,
            imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
            // isPublished removed as it's not in schema
        }
    });
    console.log('Created Course:', course.title);

    // Enrollment
    await prisma.enrollment.create({
        data: {
            userId: student.id,
            courseId: course.id,
        }
    });
    console.log('Enrolled Student');

    // Module
    const module = await prisma.module.create({
        data: {
            title: 'Semana 1: Introducción y Setup',
            description: 'Configuración del entorno y conceptos básicos.',
            courseId: course.id,
            weekNumber: 1, // Changed from order to weekNumber
            // isPublished removed
        }
    });
    console.log('Created Module:', module.title);

    // Assignment
    const assignment = await prisma.assignment.create({
        data: {
            title: 'Tarea 1: Configuración del Proyecto',
            instructions: '1. Instalar Node.js\n2. Crear proyecto Next.js\n3. Subir captura de pantalla.',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
            moduleId: module.id,
            courseId: course.id,
        }
    });
    console.log('Created Assignment:', assignment.title);

    // Quiz
    const quiz = await prisma.quiz.create({
        data: {
            title: 'Quiz 1: Conceptos de React',
            // description removed
            moduleId: module.id,
            // timeLimit, passingScore removed
            opensAt: new Date(),
            closesAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            // isPublished removed
            questions: {
                create: [
                    {
                        question: '¿Qué es un componente en React?', // Changed from text to question
                        points: 5,
                        options: ["Una función que retorna JSX", "Un archivo CSS", "Una base de datos"], // JSON array
                        correctOption: 0, // Index of correct option
                    },
                    {
                        question: '¿Para qué sirve useState?', // Changed from text to question
                        points: 5,
                        options: ["Para manejar estado local", "Para hacer peticiones HTTP"], // JSON array
                        correctOption: 0, // Index of correct option
                    }
                ]
            }
        }
    });
    console.log('Created Quiz:', quiz.title);

    console.log('Seeding finished.');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
