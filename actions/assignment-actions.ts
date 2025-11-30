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
        console.error("Error al crear tarea:", error);
        return { success: false, error: "Error al crear tarea" };
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
        return { success: false, error: "Error al obtener tareas" };
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
        return { success: false, error: "Error al eliminar tarea" };
    }
}

export async function getAssignment(assignmentId: string) {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: "No autorizado" };

    try {
        const assignment = await prisma.assignment.findUnique({
            where: { id: assignmentId },
            include: {
                module: { select: { title: true } },
                course: { select: { title: true } }
            }
        });

        if (!assignment) return { success: false, error: "Tarea no encontrada" };

        // Importación dinámica para evitar dependencias circulares
        const { getModuleNavigation } = await import("./module-actions");
        const { nextItem, prevItem } = await getModuleNavigation(assignment.courseId, assignmentId, 'assignment');

        return {
            success: true,
            data: {
                ...assignment,
                nextItem,
                prevItem
            }
        };
    } catch (error) {
        return { success: false, error: "Error al obtener tarea" };
    }
}

export async function submitAssignment(assignmentId: string, fileUrls: string[], studentComment?: string) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "STUDENT") {
        return { success: false, error: "No autorizado" };
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
        return { success: false, error: "Error al enviar tarea" };
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
        return { success: false, error: "Error al obtener entrega" };
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
        return { success: false, error: "Error al obtener tareas" };
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
        console.error("Error al actualizar tarea:", error);
        return { success: false, error: "Error al actualizar tarea" };
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
        return { success: false, error: "Error al obtener entregas" };
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
            return { success: false, error: "Entrega no encontrada" };
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
        return { success: false, error: "Error al calificar entrega" };
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
        console.error("Error al enviar la solicitud:", error);
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
        return { success: false, error: "Error al verificar estado de solicitud" };
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
        return { success: false, error: "Error al obtener entrega" };
    }
}
