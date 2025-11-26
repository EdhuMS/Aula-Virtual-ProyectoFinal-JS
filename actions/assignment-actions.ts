"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function checkTeacher() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TEACHER") {
        throw new Error("Unauthorized");
    }
    return session;
}

export async function createAssignment(courseId: string, data: { title: string; instructions: string; dueDate: Date; moduleId: string }) {
    await checkTeacher();
    try {
        await prisma.assignment.create({
            data: {
                title: data.title,
                instructions: data.instructions,
                dueDate: data.dueDate,
                moduleId: data.moduleId,
                courseId: courseId,
            },
        });
        revalidatePath(`/teacher/courses/${courseId}/assignments`);
        return { success: true };
    } catch (error) {
        console.error("Error creating assignment:", error);
        return { success: false, error: "Failed to create assignment" };
    }
}

export async function getCourseAssignments(courseId: string) {
    await checkTeacher();
    try {
        const assignments = await prisma.assignment.findMany({
            where: { courseId },
            include: {
                module: {
                    select: { title: true }
                },
                _count: {
                    select: { submissions: true }
                }
            },
            orderBy: { dueDate: "asc" },
        });
        return { success: true, data: assignments };
    } catch (error) {
        return { success: false, error: "Failed to fetch assignments" };
    }
}

export async function deleteAssignment(assignmentId: string, courseId: string) {
    await checkTeacher();
    try {
        await prisma.assignment.delete({
            where: { id: assignmentId },
        });
        revalidatePath(`/teacher/courses/${courseId}/assignments`);
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete assignment" };
    }
}

export async function getAssignment(assignmentId: string) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: "Unauthorized" };

    try {
        const assignment = await prisma.assignment.findUnique({
            where: { id: assignmentId },
            include: {
                module: { select: { title: true } },
                course: { select: { title: true } }
            }
        });
        return { success: true, data: assignment };
    } catch (error) {
        return { success: false, error: "Failed to fetch assignment" };
    }
}

export async function submitAssignment(assignmentId: string, fileUrls: string[], studentComment?: string) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "STUDENT") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        await prisma.submission.create({
            data: {
                assignmentId,
                studentId: session.user.id,
                fileUrls: fileUrls, // Almacenar array directamente (Prisma maneja Json)
                studentComment,
            }
        });
        revalidatePath(`/student/courses`);
        return { success: true };
    } catch (error) {
        console.error("Submit error:", error);
        return { success: false, error: "Failed to submit assignment" };
    }
}

export async function getStudentSubmission(assignmentId: string) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "STUDENT") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const submission = await prisma.submission.findUnique({
            where: {
                studentId_assignmentId: {
                    studentId: session.user.id,
                    assignmentId: assignmentId
                }
            }
        });
        return { success: true, data: submission };
    } catch (error) {
        return { success: false, error: "Failed to fetch submission" };
    }
}

export async function getStudentAssignments(courseId: string) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "STUDENT") {
        return { success: false, error: "Unauthorized" };
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

        const assignments = await prisma.assignment.findMany({
            where: { courseId },
            include: {
                module: {
                    select: { title: true }
                },
                submissions: {
                    where: { studentId: session.user.id },
                    select: { id: true, grade: true, submittedAt: true }
                }
            },
            orderBy: { dueDate: "asc" },
        });
        return { success: true, data: assignments };
    } catch (error) {
        return { success: false, error: "Failed to fetch assignments" };
    }
}

export async function updateAssignment(assignmentId: string, courseId: string, data: { title: string; instructions: string; dueDate: Date; moduleId: string }) {
    await checkTeacher();
    try {
        await prisma.assignment.update({
            where: { id: assignmentId },
            data: {
                title: data.title,
                instructions: data.instructions,
                dueDate: data.dueDate,
                moduleId: data.moduleId,
            },
        });
        revalidatePath(`/teacher/courses/${courseId}/assignments`);
        revalidatePath(`/teacher/courses/${courseId}`); // Actualizar vista del módulo
        return { success: true };
    } catch (error) {
        console.error("Error updating assignment:", error);
        return { success: false, error: "Failed to update assignment" };
    }
}

export async function getAssignmentSubmissions(assignmentId: string) {
    await checkTeacher();
    try {
        const submissions = await prisma.submission.findMany({
            where: { assignmentId },
            include: {
                student: {
                    select: { name: true, email: true }
                }
            },
            orderBy: { submittedAt: "desc" }
        });
        return { success: true, data: submissions };
    } catch (error) {
        return { success: false, error: "Failed to fetch submissions" };
    }
}

export async function gradeSubmission(submissionId: string, grade: number, feedback: string, courseId: string, assignmentId: string) {
    const session = await checkTeacher();
    try {
        const submission = await prisma.submission.findUnique({
            where: { id: submissionId },
            select: { grade: true, canEditGrade: true }
        });

        if (!submission) {
            return { success: false, error: "Submission not found" };
        }

        // Verificar si está bloqueado
        if (submission.grade !== null && !submission.canEditGrade) {
            return { success: false, error: "La calificación está bloqueada. Debes solicitar permiso para modificarla." };
        }

        await prisma.submission.update({
            where: { id: submissionId },
            data: {
                grade,
                feedback,
                canEditGrade: false, // Volver a bloquear después de editar
            }
        });

        revalidatePath(`/teacher/courses/${courseId}/assignments/${assignmentId}/submissions`);
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to grade submission" };
    }
}

export async function requestGradeChange(submissionId: string, reason: string) {
    const session = await checkTeacher();
    try {
        // Verificar si ya existe una solicitud pendiente
        const existingRequest = await prisma.gradeChangeRequest.findFirst({
            where: {
                submissionId,
                status: "PENDING"
            }
        });

        if (existingRequest) {
            return { success: false, error: "Ya existe una solicitud pendiente para esta entrega." };
        }

        await prisma.gradeChangeRequest.create({
            data: {
                submissionId,
                teacherId: session.user.id,
                reason,
                status: "PENDING"
            }
        });

        return { success: true };
    } catch (error) {
        console.error("Error requesting grade change:", error);
        return { success: false, error: "Error al enviar la solicitud." };
    }
}

export async function getGradeChangeStatus(submissionId: string) {
    const session = await checkTeacher();
    try {
        const request = await prisma.gradeChangeRequest.findFirst({
            where: {
                submissionId,
                status: "PENDING"
            }
        });
        return { success: true, hasPendingRequest: !!request };
    } catch (error) {
        return { success: false, error: "Error checking request status" };
    }
}

export async function getSubmissionForGrading(submissionId: string) {
    await checkTeacher();
    try {
        const submission = await prisma.submission.findUnique({
            where: { id: submissionId },
            include: {
                student: {
                    select: { name: true, email: true }
                },
                assignment: {
                    select: { title: true }
                }
            }
        });
        return { success: true, data: submission };
    } catch (error) {
        return { success: false, error: "Failed to fetch submission" };
    }
}
