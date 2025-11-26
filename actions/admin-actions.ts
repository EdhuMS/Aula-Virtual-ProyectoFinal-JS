"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function checkAdmin() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }
    return session;
}

export async function getPendingGradeRequests() {
    await checkAdmin();
    try {
        const requests = await prisma.gradeChangeRequest.findMany({
            where: { status: "PENDING" },
            include: {
                teacher: {
                    select: { name: true, email: true }
                },
                submission: {
                    include: {
                        student: { select: { name: true } },
                        assignment: { select: { title: true } }
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });
        return { success: true, data: requests };
    } catch (error) {
        return { success: false, error: "Failed to fetch requests" };
    }
}

export async function approveGradeRequest(requestId: string) {
    await checkAdmin();
    try {
        const request = await prisma.gradeChangeRequest.findUnique({
            where: { id: requestId },
            include: { submission: true }
        });

        if (!request) return { success: false, error: "Request not found" };

        // Transacción para actualizar la solicitud y el envío
        await prisma.$transaction([
            prisma.gradeChangeRequest.update({
                where: { id: requestId },
                data: {
                    status: "APPROVED",
                    isReadByTeacher: false // Notificar al profesor
                }
            }),
            prisma.submission.update({
                where: { id: request.submissionId },
                data: { canEditGrade: true }
            })
        ]);

        revalidatePath("/admin/requests");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to approve request" };
    }
}

export async function rejectGradeRequest(requestId: string) {
    await checkAdmin();
    try {
        await prisma.gradeChangeRequest.update({
            where: { id: requestId },
            data: {
                status: "REJECTED",
                isReadByTeacher: false // Notify teacher
            }
        });

        revalidatePath("/admin/requests");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to reject request" };
    }
}

export async function getPendingRequestCount() {
    await checkAdmin();
    try {
        const count = await prisma.gradeChangeRequest.count({
            where: { status: "PENDING" }
        });
        return { count };
    } catch (error) {
        return { count: 0 };
    }
}
