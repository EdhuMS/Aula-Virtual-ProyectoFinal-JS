import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('Iniciando carga de datos...')
    const password = await hash('123456', 12)

    // Crear Administrador
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
    console.log('Administrador creado:', admin.name)

    // Crear Profesores
    const teachersData = [
        { email: 'profesor1@aulavirtual.com', name: 'Guillermo Pérez' },
        { email: 'profesor2@aulavirtual.com', name: 'Rosa Garcia' },
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
        console.log('Profesor creado:', teacher.name)
    }

    // Crear Estudiantes
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
        console.log('Estudiante creado:', student.name)
    }

    // Limpiar cursos existentes para evitar duplicados
    console.log('Limpiando cursos existentes...')
    await prisma.course.deleteMany({
        where: {
            code: {
                in: ['WEB-101', 'AI-101']
            }
        }
    })

    // Crear Cursos
    const coursesData = [
        {
            title: 'Desarrollo Web Full Stack',
            code: 'WEB-101',
            description: 'Domina el desarrollo web moderno desde cero hasta experto. Aprende HTML, CSS, JavaScript, React y Node.js para construir aplicaciones web completas.',
            teacher: teachers[0],
            image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
            modules: [
                {
                    title: 'Fundamentos Web (HTML/CSS)',
                    description: 'Aprende las bases de la web: estructura con HTML5 y estilos con CSS3.',
                    lessons: [
                        {
                            title: 'HTML5 desde cero',
                            content: 'Estructura básica, etiquetas semánticas, formularios y multimedia.',
                            resourceUrl: 'https://www.youtube.com/watch?v=MJkdaVFHrto'
                        },
                        {
                            title: 'CSS3 y Diseño Responsivo',
                            content: 'Selectores, Flexbox, Grid y Media Queries para adaptar tu web a móviles.',
                            resourceUrl: 'https://www.youtube.com/watch?v=wZniZEbPAzk'
                        }
                    ],
                    assignment: {
                        title: 'Crear Landing Page Personal',
                        instructions: 'Diseña y codifica tu propia página de presentación utilizando HTML5 y CSS3. Debe ser responsive.'
                    },
                    quiz: {
                        title: 'Quiz de Fundamentos Web',
                        questions: [
                            {
                                question: '¿Qué etiqueta HTML se usa para definir el contenido principal?',
                                options: ['<main>', '<body>', '<content>', '<principal>'],
                                correctOption: 0
                            },
                            {
                                question: '¿Qué propiedad CSS cambia el color del texto?',
                                options: ['font-color', 'text-color', 'color', 'background-color'],
                                correctOption: 2
                            }
                        ]
                    }
                },
                {
                    title: 'JavaScript Moderno',
                    description: 'Domina el lenguaje de programación de la web. ES6+, asincronía y DOM.',
                    lessons: [
                        {
                            title: 'Introducción a JavaScript',
                            content: 'Variables, tipos de datos, condicionales y bucles.',
                            resourceUrl: 'https://www.youtube.com/watch?v=Z34BF9PCfYg'
                        },
                        {
                            title: 'DOM y Eventos',
                            content: 'Manipulación del árbol DOM y manejo de eventos del usuario.',
                            resourceUrl: 'https://www.youtube.com/watch?v=03eid8Lc8V8'
                        }
                    ],
                    assignment: {
                        title: 'Juego de Adivinanza',
                        instructions: 'Crea un juego donde el usuario debe adivinar un número aleatorio generado por JS.'
                    },
                    quiz: {
                        title: 'Quiz de JavaScript',
                        questions: [
                            {
                                question: '¿Cuál es la salida de "2" + 2 en JS?',
                                options: ['4', '"22"', 'NaN', 'Error'],
                                correctOption: 1
                            },
                            {
                                question: '¿Qué método convierte un string a entero?',
                                options: ['parseInt()', 'toInteger()', 'parseInteger()', 'int()'],
                                correctOption: 0
                            }
                        ]
                    }
                },
                {
                    title: 'React.js Básico',
                    description: 'Construye interfaces de usuario modernas y reactivas con la librería más popular.',
                    lessons: [
                        {
                            title: 'React desde cero',
                            content: 'Componentes, JSX, Props y el ecosistema de React.',
                            resourceUrl: 'https://www.youtube.com/watch?v=7iobxzd_2wY'
                        },
                        {
                            title: 'Hooks: useState y useEffect',
                            content: 'Manejo del estado y efectos secundarios en componentes funcionales.',
                            resourceUrl: 'https://www.youtube.com/watch?v=TBxpAhpQqYk'
                        }
                    ],
                    assignment: {
                        title: 'App de Clima con React',
                        instructions: 'Consume una API de clima y muestra los datos en una interfaz creada con React.'
                    },
                    quiz: {
                        title: 'Quiz de React',
                        questions: [
                            {
                                question: '¿Qué hook se usa para manejar el estado?',
                                options: ['useEffect', 'useContext', 'useState', 'useReducer'],
                                correctOption: 2
                            },
                            {
                                question: 'React utiliza un DOM virtual para optimizar el renderizado.',
                                options: ['Verdadero', 'Falso'],
                                correctOption: 0
                            }
                        ]
                    }
                },
                {
                    title: 'Backend con Node.js',
                    description: 'Crea servidores robustos y APIs RESTful con Node.js y Express.',
                    lessons: [
                        {
                            title: 'Node.js y NPM',
                            content: 'Entendiendo el runtime de JS y su gestor de paquetes.',
                            resourceUrl: 'https://www.youtube.com/watch?v=BhvLIzVL8_o'
                        },
                        {
                            title: 'API REST con Express',
                            content: 'Rutas, controladores y middleware en Express.',
                            resourceUrl: 'https://www.youtube.com/watch?v=JmJ1WUoUIK4'
                        }
                    ],
                    assignment: {
                        title: 'API de Tareas',
                        instructions: 'Crea una API REST completa (CRUD) para gestionar una lista de tareas.'
                    },
                    quiz: {
                        title: 'Quiz de Node.js',
                        questions: [
                            {
                                question: '¿Qué es Express?',
                                options: ['Una base de datos', 'Un framework web para Node.js', 'Un lenguaje de programación', 'Un navegador'],
                                correctOption: 1
                            },
                            {
                                question: '¿Qué comando inicia un proyecto Node.js?',
                                options: ['node start', 'npm init', 'git init', 'node new'],
                                correctOption: 1
                            }
                        ]
                    }
                },
                {
                    title: 'Base de Datos y Despliegue',
                    description: 'Persistencia de datos con SQL/NoSQL y despliegue a producción.',
                    lessons: [
                        {
                            title: 'Bases de Datos: SQL vs NoSQL',
                            content: 'Diferencias, ventajas y cuándo usar cada una.',
                            resourceUrl: 'https://www.youtube.com/watch?v=8K1PKSqHFRQ'
                        },
                        {
                            title: 'Despliegue en Vercel',
                            content: 'Llevando tu aplicación Full Stack a producción gratis.',
                            resourceUrl: 'https://www.youtube.com/watch?v=Wk9coS9LVHI'
                        }
                    ],
                    assignment: {
                        title: 'Despliegue Final',
                        instructions: 'Despliega tu aplicación Full Stack (Frontend + Backend + DB) y comparte la URL pública.'
                    },
                    quiz: {
                        title: 'Quiz de Despliegue',
                        questions: [
                            {
                                question: '¿Qué es Vercel?',
                                options: ['Un lenguaje', 'Una plataforma de despliegue', 'Un editor de código', 'Una base de datos'],
                                correctOption: 1
                            },
                            {
                                question: '¿Qué es una variable de entorno?',
                                options: ['Una variable global en JS', 'Configuración sensible fuera del código', 'Un tipo de dato', 'Una función'],
                                correctOption: 1
                            }
                        ]
                    }
                }
            ]
        },
        {
            title: 'Inteligencia Artificial Básica',
            code: 'AI-101',
            description: 'Introducción a los conceptos fundamentales de IA, Machine Learning y Redes Neuronales. Ideal para principiantes.',
            teacher: teachers[1],
            image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
            modules: [
                {
                    title: 'Introducción a la IA',
                    description: 'Historia, definiciones y panorama actual de la Inteligencia Artificial.',
                    lessons: [
                        {
                            title: '¿Qué es la Inteligencia Artificial?',
                            content: 'Definiciones básicas, historia breve y tipos de IA (ANI, AGI, ASI).',
                            resourceUrl: 'https://www.youtube.com/watch?v=_tA5cinv0U8'
                        },
                        {
                            title: 'Historia de la IA',
                            content: 'Desde Turing hasta el Deep Learning actual.',
                            resourceUrl: 'https://www.youtube.com/watch?v=8lMIdrlIWOQ'
                        }
                    ],
                    assignment: {
                        title: 'Ensayo: IA en mi vida',
                        instructions: 'Escribe sobre cómo la IA ya está presente en tu vida diaria y no te habías dado cuenta.'
                    },
                    quiz: {
                        title: 'Quiz de Introducción',
                        questions: [
                            {
                                question: '¿Quién es considerado el padre de la IA?',
                                options: ['Alan Turing', 'Elon Musk', 'Bill Gates', 'Steve Jobs'],
                                correctOption: 0
                            },
                            {
                                question: '¿Qué es la IA Débil (ANI)?',
                                options: ['IA que siente emociones', 'IA experta en una tarea específica', 'IA superior a los humanos', 'IA que no funciona'],
                                correctOption: 1
                            }
                        ]
                    }
                },
                {
                    title: 'Machine Learning',
                    description: 'Entendiendo cómo aprenden las máquinas: Algoritmos y Datos.',
                    lessons: [
                        {
                            title: '¿Qué es Machine Learning?',
                            content: 'La capacidad de las máquinas para aprender sin ser explícitamente programadas.',
                            resourceUrl: 'https://www.youtube.com/watch?v=xrQ1YH0PnrM'
                        },
                        {
                            title: 'Tipos de Aprendizaje',
                            content: 'Supervisado, No Supervisado y por Refuerzo.',
                            resourceUrl: 'https://www.youtube.com/watch?v=FMkxSsfvMI4'
                        }
                    ],
                    assignment: {
                        title: 'Clasificando Datos',
                        instructions: 'Investiga y da 3 ejemplos reales de uso de Aprendizaje Supervisado.'
                    },
                    quiz: {
                        title: 'Quiz de Machine Learning',
                        questions: [
                            {
                                question: 'El filtro de SPAM es un ejemplo de...',
                                options: ['Aprendizaje Supervisado', 'Aprendizaje No Supervisado', 'Magia', 'Hardware'],
                                correctOption: 0
                            },
                            {
                                question: '¿Qué necesitan los algoritmos de ML para aprender?',
                                options: ['Electricidad', 'Datos', 'Amor', 'Dinero'],
                                correctOption: 1
                            }
                        ]
                    }
                },
                {
                    title: 'Redes Neuronales',
                    description: 'Inspiradas en el cerebro humano: la base del Deep Learning.',
                    lessons: [
                        {
                            title: 'Redes Neuronales Explicadas',
                            content: 'Neuronas, capas, pesos y sesgos. ¿Cómo funcionan?',
                            resourceUrl: 'https://www.youtube.com/watch?v=MRIv2IwFTPg'
                        },
                        {
                            title: 'Deep Learning vs Machine Learning',
                            content: 'Entendiendo la profundidad y la complejidad de los modelos.',
                            resourceUrl: 'https://www.youtube.com/watch?v=dKqwnCKrpVI'
                        }
                    ],
                    assignment: {
                        title: 'Dibujando una Red Neuronal',
                        instructions: 'Dibuja un diagrama de una red neuronal simple y explica sus partes.'
                    },
                    quiz: {
                        title: 'Quiz de Redes Neuronales',
                        questions: [
                            {
                                question: '¿Qué es una capa oculta?',
                                options: ['Una capa invisible', 'Capas entre la entrada y la salida', 'Una capa de seguridad', 'Una capa de pintura'],
                                correctOption: 1
                            },
                            {
                                question: '¿Qué es el Deep Learning?',
                                options: ['Aprendizaje profundo con muchas capas', 'Aprendizaje rápido', 'Aprendizaje lento', 'Aprendizaje superficial'],
                                correctOption: 0
                            }
                        ]
                    }
                },
                {
                    title: 'Procesamiento de Lenguaje Natural (NLP)',
                    description: 'Cómo las máquinas entienden y generan lenguaje humano.',
                    lessons: [
                        {
                            title: 'ChatGPT y LLMs',
                            content: 'Cómo funcionan los Grandes Modelos de Lenguaje.',
                            resourceUrl: 'https://www.youtube.com/watch?v=2tM1LFFxeKg'
                        },
                        {
                            title: 'Transformers: La Revolución',
                            content: 'La arquitectura que cambió todo en la IA moderna.',
                            resourceUrl: 'https://www.youtube.com/watch?v=aL-EmKuB078'
                        }
                    ],
                    assignment: {
                        title: 'Prompt Engineering',
                        instructions: 'Crea 3 prompts efectivos para generar un poema, un código y un resumen.'
                    },
                    quiz: {
                        title: 'Quiz de NLP',
                        questions: [
                            {
                                question: '¿Qué significa NLP?',
                                options: ['Natural Language Processing', 'New Life Program', 'No Language Programming', 'Neural Link Protocol'],
                                correctOption: 0
                            },
                            {
                                question: '¿Qué es un Token?',
                                options: ['Una moneda', 'Una unidad de texto (palabra/parte)', 'Un videojuego', 'Un robot'],
                                correctOption: 1
                            }
                        ]
                    }
                },
                {
                    title: 'Ética y Futuro de la IA',
                    description: 'Desafíos, riesgos y oportunidades de la Inteligencia Artificial.',
                    lessons: [
                        {
                            title: 'Los Peligros de la IA',
                            content: 'Sesgos, deepfakes y armas autónomas.',
                            resourceUrl: 'https://www.youtube.com/watch?v=WSbgixdC9g8'
                        },
                        {
                            title: 'El Futuro del Trabajo',
                            content: '¿Nos quitará la IA el trabajo? Cómo adaptarse.',
                            resourceUrl: 'https://www.youtube.com/watch?v=7X8II6J-6mU'
                        }
                    ],
                    assignment: {
                        title: 'Debate Ético',
                        instructions: 'Argumenta a favor o en contra de la regulación estricta de la IA.'
                    },
                    quiz: {
                        title: 'Quiz de Ética',
                        questions: [
                            {
                                question: '¿Qué es el sesgo algorítmico?',
                                options: ['Un error de código', 'Prejuicios humanos reflejados en la IA', 'Un virus', 'Una característica'],
                                correctOption: 1
                            },
                            {
                                question: '¿Debemos preocuparnos por la IA?',
                                options: ['No, es inofensiva', 'Sí, debemos ser responsables', 'Da igual', 'Solo si es Skynet'],
                                correctOption: 1
                            }
                        ]
                    }
                }
            ]
        }
    ]

    for (const c of coursesData) {
        const course = await prisma.course.create({
            data: {
                title: c.title,
                code: c.code,
                description: c.description,
                teacherId: c.teacher.id,
                imageUrl: c.image,
            }
        })
        console.log('Curso creado:', course.title)

        // Inscribir a todos los estudiantes
        for (const student of students) {
            await prisma.enrollment.create({
                data: {
                    userId: student.id,
                    courseId: course.id
                }
            })
        }

        // Crear Módulos
        let moduleOrder = 1
        for (const m of c.modules) {
            const module = await prisma.module.create({
                data: {
                    title: m.title,
                    description: m.description,
                    weekNumber: moduleOrder++,
                    courseId: course.id,
                }
            })

            // Crear Lecciones
            let lessonOrder = 1
            for (const l of m.lessons) {
                await prisma.lesson.create({
                    data: {
                        title: l.title,
                        content: l.content,
                        order: lessonOrder++,
                        moduleId: module.id,
                        resourceUrl: l.resourceUrl
                    }
                })
            }

            // Crear Tarea
            if (m.assignment) {
                await prisma.assignment.create({
                    data: {
                        title: m.assignment.title,
                        instructions: m.assignment.instructions,
                        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                        moduleId: module.id,
                        courseId: course.id,
                    }
                })
            }

            // Crear Cuestionario
            if (m.quiz) {
                await prisma.quiz.create({
                    data: {
                        title: m.quiz.title,
                        moduleId: module.id,
                        opensAt: new Date(),
                        closesAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                        questions: {
                            create: m.quiz.questions.map(q => ({
                                question: q.question,
                                options: q.options,
                                correctOption: q.correctOption,
                                points: 10
                            }))
                        }
                    }
                })
            }
        }
    }

    console.log('Carga de datos finalizada.')
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
