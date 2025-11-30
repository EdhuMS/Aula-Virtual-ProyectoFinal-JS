"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function checkTeacher() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TEACHER") {
        throw new Error("No autorizado");
    }
    return session;
}

export async function createQuiz(moduleId: string, title: string, courseId: string) {
    await checkTeacher();
    try {
        const quiz = await prisma.quiz.create({
            data: {
                title,
                moduleId,
            }
        });
        revalidatePath(`/teacher/courses/${courseId}`);
        return { success: true, data: quiz };
    } catch (error) {
        console.error("Error al crear cuestionario:", error);
        return { success: false, error: "Error al crear cuestionario" };
    }
}

export async function updateQuiz(
    quizId: string,
    courseId: string,
    data: {
        title?: string;
        opensAt?: Date | null;
        closesAt?: Date | null;
        questions?: {
            id?: string;
            question: string;
            options: string[];
            correctOption: number;
            points: number;
        }[]
    }
) {
    await checkTeacher();
    try {
        // Transacción para manejar actualizaciones
        await prisma.$transaction(async (tx) => {
            // Actualizar detalles del cuestionario
            await tx.quiz.update({
                where: { id: quizId },
                data: {
                    title: data.title,
                    opensAt: data.opensAt,
                    closesAt: data.closesAt,
                }
            });

            // Manejar preguntas si se proporcionan
            if (data.questions) {
                // Obtener IDs de preguntas existentes
                const existingQuestions = await tx.quizQuestion.findMany({
                    where: { quizId },
                    select: { id: true }
                });
                const existingIds = existingQuestions.map(q => q.id);
                const providedIds = data.questions.map(q => q.id).filter(Boolean) as string[];

                // Eliminar preguntas que no están en la lista proporcionada
                const toDelete = existingIds.filter(id => !providedIds.includes(id));
                if (toDelete.length > 0) {
                    await tx.quizQuestion.deleteMany({
                        where: { id: { in: toDelete } }
                    });
                }

                // Upsert (Actualizar o Crear) preguntas proporcionadas
                for (const q of data.questions) {
                    if (q.id) {
                        await tx.quizQuestion.update({
                            where: { id: q.id },
                            data: {
                                question: q.question,
                                options: q.options,
                                correctOption: q.correctOption,
                                points: q.points
                            } as any
                        });
                    } else {
                        await tx.quizQuestion.create({
                            data: {
                                quizId,
                                question: q.question,
                                options: q.options,
                                correctOption: q.correctOption,
                                points: q.points
                            } as any
                        });
                    }
                }
            }
        });

        revalidatePath(`/teacher/courses/${courseId}`);
        return { success: true };
    } catch (error: any) {
        console.error("Error al actualizar cuestionario:", error);
        return { success: false, error: error.message || "Error al actualizar cuestionario" };
    }
}

export async function deleteQuiz(quizId: string, courseId: string) {
    await checkTeacher();
    try {
        await prisma.quiz.delete({
            where: { id: quizId }
        });
        revalidatePath(`/teacher/courses/${courseId}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: "Error al eliminar cuestionario" };
    }
}

export async function getQuiz(quizId: string) {
    await checkTeacher();
    try {
        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            include: {
                questions: true
            }
        });
        return { success: true, data: quiz };
    } catch (error) {
        return { success: false, error: "Error al obtener cuestionario" };
    }
}

export async function addQuestion(quizId: string, question: string, options: string[], correctOption: number, points: number = 1) {
    await checkTeacher();
    try {
        await prisma.quizQuestion.create({
            data: {
                quizId,
                question,
                options, // Prisma maneja el tipo Json automáticamente
                correctOption,
                points
            } as any
        });
        revalidatePath(`/teacher/courses/[courseId]/quizzes/${quizId}`); // Necesitaremos manejar la revalidación de ruta correctamente
        return { success: true };
    } catch (error) {
        console.error("Error al añadir pregunta:", error);
        return { success: false, error: "Error al añadir pregunta" };
    }
}

export async function deleteQuestion(questionId: string, quizId: string) {
    await checkTeacher();
    try {
        await prisma.quizQuestion.delete({
            where: { id: questionId }
        });
        // Podríamos necesitar pasar el courseId para revalidar correctamente o simplemente confiar en la actualización del cliente
        return { success: true };
    } catch (error) {
        return { success: false, error: "Error al eliminar pregunta" };
    }
}

export async function submitQuizAttempt(
    quizId: string,
    courseId: string,
    answers: { questionId: string; selectedOption: number }[]
) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.id) {
        throw new Error("No autorizado");
    }

    try {
        // Verificar si el intento ya existe
        const existingAttempt = await prisma.quizAttempt.findFirst({
            where: {
                quizId,
                studentId: session.user.id
            }
        });

        if (existingAttempt) {
            return { success: false, error: "Ya has realizado este cuestionario." };
        }

        // Obtener cuestionario con preguntas para calcular puntaje
        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            include: { questions: true }
        });

        if (!quiz) throw new Error("Cuestionario no encontrado");

        // Verificar si el cuestionario está cerrado
        if (quiz.closesAt && new Date() > quiz.closesAt) {
            return { success: false, error: "El cuestionario ha cerrado." };
        }

        // Calcular puntaje
        let earnedPoints = 0;
        let totalPoints = 0;

        quiz.questions.forEach(question => {
            const q = question as any; // Cast para acceder a puntos
            totalPoints += (q.points || 1);
            const answer = answers.find(a => a.questionId === question.id);
            if (answer && answer.selectedOption === question.correctOption) {
                earnedPoints += (q.points || 1);
            }
        });

        // Escalar a 20
        const finalScore = totalPoints > 0 ? (earnedPoints / totalPoints) * 20 : 0;
        const roundedScore = Math.round(finalScore * 10) / 10; // Redondear a 1 decimal

        // Guardar intento
        const attempt = await prisma.quizAttempt.create({
            data: {
                quizId,
                studentId: session.user.id,
                score: roundedScore,
                answers: answers as any // Prisma maneja el tipo Json
            } as any
        });

        revalidatePath(`/student/courses/${courseId}`);
        return { success: true, data: attempt };

    } catch (error) {
        console.error("Error al enviar cuestionario:", error);
        return { success: false, error: "Error al enviar cuestionario" };
    }
}

export async function getQuizForStudent(quizId: string, courseId: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return { success: false, error: "No autorizado" };
    }

    try {
        // Verificar inscripción si no es profesor
        if (session.user.role !== "TEACHER") {
            const enrollment = await prisma.enrollment.findUnique({
                where: {
                    userId_courseId: {
                        userId: session.user.id,
                        courseId: courseId,
                    },
                },
            });

            if (!enrollment) {
                return { success: false, error: "No estás inscrito en este curso" };
            }
        }

        // Obtener detalles del cuestionario
        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            include: {
                questions: {
                    select: {
                        id: true,
                        question: true,
                        options: true,
                        points: true,
                        correctOption: true // Lo obtenemos pero podríamos filtrarlo más tarde
                    } as any
                }
            }
        });

        if (!quiz) return { success: false, error: "Cuestionario no encontrado" };

        // Verificar intento existente
        const attempt = await prisma.quizAttempt.findFirst({
            where: {
                quizId,
                studentId: session.user.id
            }
        });

        const now = new Date();
        const isClosed = quiz.closesAt && now > quiz.closesAt;
        const showSolution = isClosed; // Solo mostrar solución si está cerrado

        // Filtrar preguntas basadas en reglas de visibilidad
        const questions = (quiz as any).questions.map((q: any) => {
            if (showSolution) {
                return q; // Retornar todo incluyendo correctOption
            } else {
                // Eliminar correctOption si no se debe mostrar la solución
                const { correctOption, ...rest } = q;
                return rest;
            }
        });

        const { getModuleNavigation } = await import("./module-actions");
        const { nextItem, prevItem } = await getModuleNavigation(courseId, quizId, 'quiz');

        return {
            success: true,
            data: {
                ...quiz,
                questions,
                attempt, // Retornar el intento para que el frontend conozca el estado
                isClosed,
                nextItem,
                prevItem
            }
        };
    } catch (error) {
        console.error("Error fetching quiz for student:", error);
        return { success: false, error: "Error al cargar el cuestionario" };
    }
}

export async function getQuizResults(quizId: string) {
    await checkTeacher();
    try {
        // Obtener cuestionario con módulo (para obtener CourseId) e intentos
        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            include: {
                module: {
                    select: { courseId: true }
                },
                attempts: {
                    include: {
                        student: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });

        if (!quiz) return { success: false, error: "Cuestionario no encontrado" };

        // Obtener todos los estudiantes inscritos en el curso
        const enrollments = await prisma.enrollment.findMany({
            where: { courseId: quiz.module.courseId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        // Fusionar datos
        const results = enrollments.map(enrollment => {
            const student = enrollment.user;
            const attempt = quiz.attempts.find(a => a.studentId === student.id);

            let status = 'PENDING';
            let score = 0;
            let submittedAt = null;

            if (attempt) {
                status = 'COMPLETED';
                score = attempt.score;
                submittedAt = attempt.completedAt;
            } else if (quiz.closesAt && new Date() > quiz.closesAt) {
                status = 'NS';
                score = 0;
            }

            return {
                student,
                attemptId: attempt?.id,
                status,
                score,
                submittedAt
            };
        });

        return { success: true, data: { quizTitle: quiz.title, results } };
    } catch (error) {
        console.error("Error al obtener resultados del cuestionario:", error);
        return { success: false, error: "Error al obtener resultados del cuestionario" };
    }
}
