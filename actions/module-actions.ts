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

export async function getCourseModules(courseId: string) {
    await checkTeacher();
    try {
        const modules = await prisma.module.findMany({
            where: { courseId },
            orderBy: { weekNumber: "asc" },
            include: {
                lessons: {
                    orderBy: { order: "asc" },
                },
                assignments: {
                    orderBy: { dueDate: "asc" },
                },
                quizzes: {
                    include: {
                        questions: true
                    }
                },
            },
        });
        return { success: true, data: modules };
    } catch (error: any) {
        console.error("Error al obtener módulos:", error);
        return { success: false, error: error.message || "Error al obtener módulos" };
    }
}

export async function createModule(courseId: string, title: string) {
    await checkTeacher();
    try {
        // Obtener el número de semana más alto
        const lastModule = await prisma.module.findFirst({
            where: { courseId },
            orderBy: { weekNumber: "desc" },
        });
        const newWeekNumber = lastModule ? lastModule.weekNumber + 1 : 1;

        await prisma.module.create({
            data: {
                title,
                courseId,
                weekNumber: newWeekNumber,
            },
        });
        revalidatePath(`/teacher/courses/${courseId}`, 'page');
        return { success: true };
    } catch (error) {
        return { success: false, error: "Error al crear módulo" };
    }
}

export async function deleteModule(moduleId: string, courseId: string) {
    await checkTeacher();
    try {
        await prisma.module.delete({
            where: { id: moduleId },
        });
        revalidatePath(`/teacher/courses/${courseId}`, 'page');
        return { success: true };
    } catch (error) {
        return { success: false, error: "Error al eliminar módulo" };
    }
}

export async function createLesson(moduleId: string, title: string, courseId: string) {
    await checkTeacher();
    try {
        const lastLesson = await prisma.lesson.findFirst({
            where: { moduleId },
            orderBy: { order: "desc" },
        });
        const newOrder = lastLesson ? lastLesson.order + 1 : 1;

        await prisma.lesson.create({
            data: {
                title,
                content: "", // Contenido inicial vacío
                moduleId,
                order: newOrder,
            },
        });
        revalidatePath(`/teacher/courses/${courseId}`, 'page');
        return { success: true };
    } catch (error) {
        return { success: false, error: "Error al crear lección" };
    }
}

export async function deleteLesson(lessonId: string, courseId: string) {
    await checkTeacher();
    try {
        await prisma.lesson.delete({
            where: { id: lessonId },
        });
        revalidatePath(`/teacher/courses/${courseId}`, 'page');
        return { success: true };
    } catch (error) {
        return { success: false, error: "Error al eliminar lección" };
    }
}
export async function getStudentModules(courseId: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== "STUDENT") {
        return { success: false, error: "No autorizado" };
    }

    try {
        // Verificar si el estudiante está inscrito
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

        const modules = await prisma.module.findMany({
            where: { courseId },
            orderBy: { weekNumber: "asc" },
            include: {
                lessons: {
                    orderBy: { order: "asc" },
                },
                assignments: {
                    orderBy: { dueDate: "asc" },
                    include: {
                        submissions: {
                            where: { studentId: session.user.id },
                            select: { id: true }
                        }
                    }
                },
                quizzes: {
                    orderBy: { opensAt: "asc" },
                    include: {
                        attempts: {
                            where: { studentId: session.user.id },
                            select: { id: true, score: true }
                        }
                    }
                }
            },
        });
        return { success: true, data: modules };
    } catch (error: any) {
        console.error("Error al obtener módulos:", error);
        return { success: false, error: "Error al cargar los módulos" };
    }
}

export async function getStudentLesson(courseId: string, lessonId: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== "STUDENT") {
        return { success: false, error: "No autorizado" };
    }

    try {
        // Verificar inscripción
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

        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            include: { module: true }
        });

        if (!lesson || lesson.module.courseId !== courseId) {
            return { success: false, error: "Lección no encontrada" };
        }

        const { nextItem, prevItem } = await getModuleNavigation(courseId, lessonId, 'lesson');

        return {
            success: true,
            data: {
                lesson,
                nextItem,
                prevItem
            }
        };
    } catch (error) {
        return { success: false, error: "Error al obtener lección" };
    }
}

export async function getLesson(lessonId: string) {
    await checkTeacher();
    try {
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
        });
        return { success: true, data: lesson };
    } catch (error) {
        return { success: false, error: "Error al obtener lección" };
    }
}

export async function updateLesson(lessonId: string, data: { title: string; content: string; resourceUrl?: string }) {
    await checkTeacher();
    try {
        await prisma.lesson.update({
            where: { id: lessonId },
            data: {
                title: data.title,
                content: data.content,
                resourceUrl: data.resourceUrl,
            },
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: "Error al actualizar lección" };
    }
}

export async function getModuleNavigation(courseId: string, currentItemId: string, currentItemType: 'lesson' | 'assignment' | 'quiz') {
    // 1. Obtener todas las lecciones, tareas y cuestionarios del curso ordenadas por semana del módulo
    const allModules = await prisma.module.findMany({
        where: { courseId },
        orderBy: { weekNumber: "asc" },
        include: {
            lessons: {
                orderBy: { order: "asc" },
                select: { id: true, title: true }
            },
            assignments: {
                orderBy: { dueDate: "asc" },
                select: { id: true, title: true }
            },
            quizzes: {
                orderBy: { opensAt: "asc" },
                select: { id: true, title: true }
            }
        }
    });

    // Aplanar todos los items en orden: Lecciones -> Tareas -> Cuestionarios (por módulo)
    type CourseItem = { id: string; title: string; type: 'lesson' | 'assignment' | 'quiz' };

    const allItems: CourseItem[] = allModules.flatMap(m => [
        ...m.lessons.map(l => ({ ...l, type: 'lesson' as const })),
        ...m.assignments.map(a => ({ ...a, type: 'assignment' as const })),
        ...m.quizzes.map(q => ({ ...q, type: 'quiz' as const }))
    ]);

    const currentIndex = allItems.findIndex(item => item.id === currentItemId && item.type === currentItemType);

    const nextItem = currentIndex !== -1 && currentIndex < allItems.length - 1 ? allItems[currentIndex + 1] : null;
    const prevItem = currentIndex > 0 ? allItems[currentIndex - 1] : null;

    return { nextItem, prevItem };
}
