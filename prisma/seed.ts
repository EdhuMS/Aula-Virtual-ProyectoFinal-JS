// @ts-nocheck
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding ...')
    const password = await hash('123456', 12)

    // 1. Crear Administrador
    const admin = await prisma.user.upsert({
        where: { email: 'admin@aulavirtual.com' },
        update: {},
        create: {
            email: 'admin@aulavirtual.com',
            name: 'Administrador Principal',
            password,
            role: 'ADMIN',
            image: 'https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff'
        },
    })
    console.log('Created Admin:', admin.name)

    // 2. Crear Profesores
    const teachersData = [
        { email: 'juan.perez@aulavirtual.com', name: 'Juan Pérez' },
        { email: 'maria.garcia@aulavirtual.com', name: 'Maria Garcia' },
    ]

    const teachers = []
    for (const t of teachersData) {
        const teacher = await prisma.user.upsert({
            where: { email: t.email },
            update: {},
            create: {
                email: t.email,
                name: t.name,
                password,
                role: 'TEACHER',
                image: `https://ui-avatars.com/api/?name=${t.name.replace(' ', '+')}&background=random`
            },
        })
        teachers.push(teacher)
        console.log('Created Teacher:', teacher.name)
    }

    // 3. Crear Estudiantes
    const studentsData = ['Edhu', 'Leonardo', 'Jesus', 'Jeremy', 'Edu']
    const students = []

    for (const name of studentsData) {
        const email = `${name.toLowerCase()}@aulavirtual.com`
        const student = await prisma.user.upsert({
            where: { email },
            update: {},
            create: {
                email,
                name,
                password,
                role: 'STUDENT',
                image: `https://ui-avatars.com/api/?name=${name}&background=random`
            },
        })
        students.push(student)
        console.log('Created Student:', student.name)
    }

    // 4. Crear Cursos
    const coursesData = [
        {
            title: 'Desarrollo Web Full Stack',
            description: 'Domina el desarrollo web moderno desde cero hasta experto. Aprende React, Node.js, Next.js y bases de datos.',
            teacher: teachers[0],
            image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80'
        },
        {
            title: 'Inteligencia Artificial Básica',
            description: 'Introducción a los conceptos fundamentales de IA, Machine Learning y Redes Neuronales.',
            teacher: teachers[1],
            image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80'
        }
    ]

    for (const c of coursesData) {
        const course = await prisma.course.create({
            data: {
                title: c.title,
                description: c.description,
                teacherId: c.teacher.id,
                imageUrl: c.image,
            }
        })
        console.log('Created Course:', course.title)

        // Inscribir a todos los estudiantes
        for (const student of students) {
            await prisma.enrollment.create({
                data: {
                    userId: student.id,
                    courseId: course.id
                }
            })
        }

        // Crear 5 Módulos
        for (let i = 1; i <= 5; i++) {
            const module = await prisma.module.create({
                data: {
                    title: `Módulo ${i}: Conceptos Fundamentales Parte ${i}`,
                    description: `En este módulo profundizaremos en los temas de la semana ${i}.`,
                    weekNumber: i,
                    courseId: course.id,
                }
            })

            // Crear 2 Lecciones por Módulo
            for (let j = 1; j <= 2; j++) {
                await prisma.lesson.create({
                    data: {
                        title: `Lección ${j}: Tema Importante ${i}.${j}`,
                        content: `Contenido detallado de la lección ${j} del módulo ${i}. Aquí iría el material de estudio, videos, lecturas, etc.`,
                        order: j,
                        moduleId: module.id,
                        resourceUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' // PDF de prueba
                    }
                })
            }

            // Crear 1 Tarea por Módulo
            await prisma.assignment.create({
                data: {
                    title: `Tarea Práctica Módulo ${i}`,
                    instructions: `Realizar un proyecto aplicando lo aprendido en el módulo ${i}.\n\n1. Crear repositorio.\n2. Implementar código.\n3. Subir enlace.`,
                    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 semana desde ahora
                    moduleId: module.id,
                    courseId: course.id,
                }
            })

            // Crear 1 Cuestionario por Módulo
            await prisma.quiz.create({
                data: {
                    title: `Examen Módulo ${i}`,
                    moduleId: module.id,
                    opensAt: new Date(),
                    closesAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    questions: {
                        create: [
                            {
                                question: `¿Pregunta 1 del módulo ${i}?`,
                                options: ["Opción A (Correcta)", "Opción B", "Opción C", "Opción D"],
                                correctOption: 0,
                                points: 10
                            },
                            {
                                question: `¿Pregunta 2 del módulo ${i}?`,
                                options: ["Opción A", "Opción B (Correcta)", "Opción C", "Opción D"],
                                correctOption: 1,
                                points: 10
                            }
                        ]
                    }
                }
            })
        }
    }

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
