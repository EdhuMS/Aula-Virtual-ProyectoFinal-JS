"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Función auxiliar para verificar si el usuario actual es Profesor
async function checkTeacher() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TEACHER") {
        throw new Error("No autorizado: Se requiere acceso de profesor");
    }
    return session;
}

export async function getTeacherCourses() {
    const session = await checkTeacher();
    try {
        const courses = await prisma.course.findMany({
            where: { teacherId: session.user.id },
            orderBy: { createdAt: "desc" },
            include: {
                _count: {
                    select: { enrollments: true, modules: true },
                },
            },
        });
        return { success: true, data: courses };
    } catch (error) {
        console.error("Error al obtener cursos:", error);
        return { success: false, error: "Error al obtener los cursos" };
    }
}

// Función auxiliar para verificar si el usuario actual es Administrador
async function checkAdmin() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
        throw new Error("No autorizado: Se requiere acceso de administrador");
    }
    return session;
}

export async function getAllCourses() {
    await checkAdmin();
    try {
        const courses = await prisma.course.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                teacher: { select: { name: true, email: true } },
                _count: { select: { enrollments: true, modules: true } },
            },
        });
        return { success: true, data: courses };
    } catch (error) {
        return { success: false, error: "Error al obtener los cursos" };
    }
}

export async function createCourse(prevState: any, formData: FormData) {
    await checkAdmin();

    const title = formData.get("title") as string;
    const code = formData.get("code") as string;
    const description = formData.get("description") as string;
    const teacherId = formData.get("teacherId") as string;

    if (!title || !code || !description || !teacherId) {
        return { success: false, error: "Faltan campos requeridos" };
    }

    try {
        await prisma.course.create({
            data: {
                title,
                code,
                description,
                teacherId,
            },
        });

        revalidatePath("/admin/courses");
        return { success: true };
    } catch (error: any) {
        console.error("Error al crear curso:", error);
        if (error.code === 'P2002' && error.meta?.target?.includes('code')) {
            return { success: false, error: "El código del curso ya existe" };
        }
        return { success: false, error: "Error al crear el curso" };
    }
}

export async function deleteCourse(courseId: string) {
    await checkAdmin();
    try {
        await prisma.course.delete({
            where: { id: courseId },
        });
        revalidatePath("/admin/courses");
        return { success: true, timestamp: Date.now() + Math.random() };
    } catch (error) {
        return { success: false, error: "Error al eliminar el curso", timestamp: Date.now() + Math.random() };
    }
}

export async function getStudentCourses() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "STUDENT") {
        throw new Error("No autorizado");
    }

    try {
        const enrollments = await prisma.enrollment.findMany({
            where: { userId: session.user.id },
            include: {
                course: {
                    include: {
                        teacher: { select: { name: true } },
                        _count: { select: { modules: true } },
                    },
                },
            },
            orderBy: { enrolledAt: "desc" },
        });

        const courses = enrollments.map(enrollment => enrollment.course);
        return { success: true, data: courses };
    } catch (error) {
        return { success: false, error: "Error al obtener los cursos" };
    }
}

export async function getCourseById(courseId: string) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return { success: false, error: "No autorizado" };
    }

    try {
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: {
                teacher: { select: { name: true, email: true } },
                _count: { select: { enrollments: true, modules: true } },
            },
        });
        return { success: true, data: course };
    } catch (error) {
        return { success: false, error: "Error al obtener el curso" };
    }
}
export async function updateCourse(prevState: any, formData: FormData) {
    await checkAdmin();

    const courseId = formData.get("courseId") as string;
    const title = formData.get("title") as string;
    const code = formData.get("code") as string;
    const description = formData.get("description") as string;
    const teacherId = formData.get("teacherId") as string;

    if (!courseId || !title || !code || !description || !teacherId) {
        return { success: false, error: "Faltan campos requeridos" };
    }

    try {
        await prisma.course.update({
            where: { id: courseId },
            data: {
                title,
                code,
                description,
                teacherId,
            },
        });

        revalidatePath("/admin/courses");
        return { success: true, timestamp: Date.now() + Math.random() };
    } catch (error: any) {
        console.error("Failed to update course:", error);
        if (error.code === 'P2002' && error.meta?.target?.includes('code')) {
            return { success: false, error: "El código del curso ya existe", timestamp: Date.now() + Math.random() };
        }
        return { success: false, error: "Error al actualizar el curso", timestamp: Date.now() + Math.random() };
    }
}
