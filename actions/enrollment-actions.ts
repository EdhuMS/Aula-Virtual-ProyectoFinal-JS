"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function checkAdmin() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized: Admin access required");
    }
    return session;
}

export async function getCourseEnrollments(courseId: string) {
    await checkAdmin();
    try {
        const enrollments = await prisma.enrollment.findMany({
            where: { courseId },
            include: {
                user: {
                    select: { id: true, name: true, email: true },
                },
            },
            orderBy: { enrolledAt: "desc" },
        });
        return { success: true, data: enrollments };
    } catch (error) {
        return { success: false, error: "Failed to fetch enrollments" };
    }
}

export async function getStudentsNotEnrolled(courseId: string) {
    await checkAdmin();
    try {
        const students = await prisma.user.findMany({
            where: {
                role: "STUDENT",
                enrollments: {
                    none: { courseId },
                },
            },
            select: { id: true, name: true, email: true },
            orderBy: { name: "asc" },
        });
        return { success: true, data: students };
    } catch (error) {
        return { success: false, error: "Failed to fetch students" };
    }
}

export async function enrollStudent(courseId: string, userId: string) {
    await checkAdmin();
    try {
        await prisma.enrollment.create({
            data: {
                courseId,
                userId,
            },
        });
        revalidatePath(`/admin/courses/${courseId}/enrollments`);
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to enroll student" };
    }
}

export async function unenrollStudent(enrollmentId: string, courseId: string) {
    await checkAdmin();
    try {
        await prisma.enrollment.delete({
            where: { id: enrollmentId },
        });
        revalidatePath(`/admin/courses/${courseId}/enrollments`);
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to unenroll student" };
    }
}
