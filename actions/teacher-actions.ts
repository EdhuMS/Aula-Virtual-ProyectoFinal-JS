"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function checkTeacher() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== "TEACHER") {
        throw new Error("Unauthorized");
    }
    return session.user;
}

export async function getTeacherRequests() {
    const user = await checkTeacher();
    try {
        const requests = await prisma.gradeChangeRequest.findMany({
            where: { teacherId: user.id },
            include: {
                submission: {
                    include: {
                        student: { select: { name: true, email: true } },
                        assignment: { select: { title: true } }
                    }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });
        return { success: true, data: requests };
    } catch (error) {
        return { success: false, error: "Failed to fetch requests" };
    }
}

export async function getUnreadRequestCount() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== "TEACHER") {
        return { count: 0 };
    }

    try {
        const count = await prisma.gradeChangeRequest.count({
            where: {
                teacherId: session.user.id,
                isReadByTeacher: false
            }
        });
        return { count };
    } catch (error) {
        return { count: 0 };
    }
}

export async function markRequestsAsRead() {
    const user = await checkTeacher();
    try {
        await prisma.gradeChangeRequest.updateMany({
            where: {
                teacherId: user.id,
                isReadByTeacher: false
            },
            data: { isReadByTeacher: true }
        });
        revalidatePath("/teacher/requests");
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}
