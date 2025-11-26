"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Función auxiliar para verificar si el usuario actual es Profesor
async function checkTeacher() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TEACHER") {
        throw new Error("Unauthorized: Teacher access required");
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
        console.error("Failed to fetch courses:", error);
        return { success: false, error: "Failed to fetch courses" };
    }
}

// Función auxiliar para verificar si el usuario actual es Administrador
async function checkAdmin() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized: Admin access required");
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
        return { success: false, error: "Failed to fetch courses" };
    }
}

export async function createCourse(prevState: any, formData: FormData) {
    await checkAdmin();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const teacherId = formData.get("teacherId") as string;

    if (!title || !description || !teacherId) {
        return { success: false, error: "Missing required fields" };
    }

    try {
        await prisma.course.create({
            data: {
                title,
                description,
                teacherId,
            },
        });

        revalidatePath("/admin/courses");
        return { success: true };
    } catch (error) {
        console.error("Failed to create course:", error);
        return { success: false, error: "Failed to create course" };
    }
}

export async function deleteCourse(courseId: string) {
    await checkAdmin();
    try {
        await prisma.course.delete({
            where: { id: courseId },
        });
        revalidatePath("/admin/courses");
        return { success: true, timestamp: Date.now() };
    } catch (error) {
        return { success: false, error: "Failed to delete course", timestamp: Date.now() };
    }
}

export async function getStudentCourses() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "STUDENT") {
        throw new Error("Unauthorized");
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
        return { success: false, error: "Failed to fetch courses" };
    }
}

export async function getCourseById(courseId: string) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return { success: false, error: "Unauthorized" };
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
        return { success: false, error: "Failed to fetch course" };
    }
}
export async function updateCourseTeacher(courseId: string, teacherId: string) {
    await checkAdmin();

    if (!courseId || !teacherId) {
        return { success: false, error: "Missing required fields" };
    }

    try {
        await prisma.course.update({
            where: { id: courseId },
            data: { teacherId },
        });

        revalidatePath("/admin/courses");
        return { success: true, timestamp: Date.now() };
    } catch (error) {
        console.error("Failed to update course teacher:", error);
        return { success: false, error: "Failed to update course teacher", timestamp: Date.now() };
    }
}
