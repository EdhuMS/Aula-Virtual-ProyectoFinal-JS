"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

async function getCurrentUser() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        throw new Error("Unauthorized");
    }
    return session.user;
}

export async function getConversations() {
    const user = await getCurrentUser();
    try {
        const conversations = await prisma.conversation.findMany({
            where: {
                participants: {
                    some: { userId: user.id }
                }
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: { id: true, name: true, image: true, email: true, role: true }
                        }
                    }
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        // Transform data to match expected frontend structure
        const formattedConversations = conversations.map(conv => ({
            ...conv,
            participants: conv.participants.map(p => p.user)
        }));

        return { success: true, data: formattedConversations };
    } catch (error) {
        console.error("Error fetching conversations:", error);
        return { success: false, error: "Failed to fetch conversations" };
    }
}

export async function getMessages(conversationId: string) {
    const user = await getCurrentUser();
    try {
        // Obtener conversación para verificar clearedAt
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            select: { clearedAt: true }
        });

        let clearedTime = new Date(0); // Por defecto al inicio de la época
        if (conversation?.clearedAt && typeof conversation.clearedAt === 'object' && !Array.isArray(conversation.clearedAt)) {
            const clearedMap = conversation.clearedAt as Prisma.JsonObject;
            if (clearedMap[user.id] && typeof clearedMap[user.id] === 'string') {
                clearedTime = new Date(clearedMap[user.id] as string);
            }
        }

        const messages = await prisma.message.findMany({
            where: {
                conversationId,
                createdAt: { gt: clearedTime } // Solo obtener mensajes después del tiempo de limpieza
            },
            include: {
                sender: {
                    select: { id: true, name: true, image: true }
                }
            },
            orderBy: { createdAt: 'asc' }
        });

        // Marcar mensajes no leídos como leídos
        const unreadIds = messages
            .filter(m => !m.read && m.senderId !== user.id)
            .map(m => m.id);

        if (unreadIds.length > 0) {
            await prisma.message.updateMany({
                where: { id: { in: unreadIds } },
                data: { read: true }
            });
            revalidatePath("/chat");
        }

        return { success: true, data: messages };
    } catch (error) {
        console.error("Error fetching messages:", error);
        return { success: false, error: "Failed to fetch messages" };
    }
}

export async function sendMessage(conversationId: string, content: string) {
    const user = await getCurrentUser();
    try {
        const message = await prisma.message.create({
            data: {
                content,
                conversationId,
                senderId: user.id,
                read: false
            }
        });

        await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() }
        });

        revalidatePath("/chat");
        return { success: true, data: message };
    } catch (error) {
        console.error("Error sending message:", error);
        return { success: false, error: "Failed to send message" };
    }
}

export async function createConversation(participantId: string) {
    const user = await getCurrentUser();
    try {
        // Verificar si la conversación ya existe
        const existing = await prisma.conversation.findFirst({
            where: {
                AND: [
                    { participants: { some: { userId: user.id } } },
                    { participants: { some: { userId: participantId } } }
                ]
            }
        });

        if (existing) {
            return { success: true, data: existing };
        }

        const conversation = await prisma.conversation.create({
            data: {
                participants: {
                    create: [
                        { userId: user.id },
                        { userId: participantId }
                    ]
                }
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: { id: true, name: true, image: true, email: true, role: true }
                        }
                    }
                },
                messages: true
            }
        });

        const formattedConversation = {
            ...conversation,
            participants: conversation.participants.map(p => p.user)
        };

        revalidatePath("/chat");
        return { success: true, data: formattedConversation };
    } catch (error) {
        console.error("Error creating conversation:", error);
        return { success: false, error: "Failed to create conversation" };
    }
}

export async function clearChat(conversationId: string) {
    const user = await getCurrentUser();
    try {
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            select: { clearedAt: true }
        });

        const currentCleared = (conversation?.clearedAt && typeof conversation.clearedAt === 'object' && !Array.isArray(conversation.clearedAt)
            ? conversation.clearedAt
            : {}) as Prisma.JsonObject;

        await prisma.conversation.update({
            where: { id: conversationId },
            data: {
                clearedAt: {
                    ...currentCleared,
                    [user.id]: new Date().toISOString()
                }
            }
        });

        revalidatePath("/chat");
        return { success: true };
    } catch (error) {
        console.error("Error clearing chat:", error);
        return { success: false, error: "Failed to clear chat" };
    }
}

export async function getUnreadMessageCount() {
    const user = await getCurrentUser();
    try {
        const conversations = await prisma.conversation.findMany({
            where: {
                participants: { some: { userId: user.id } }
            },
            select: { id: true, clearedAt: true }
        });

        let totalUnread = 0;

        for (const convo of conversations) {
            let clearedTime = new Date(0);
            if (convo.clearedAt && typeof convo.clearedAt === 'object' && !Array.isArray(convo.clearedAt)) {
                const clearedMap = convo.clearedAt as Prisma.JsonObject;
                if (clearedMap[user.id] && typeof clearedMap[user.id] === 'string') {
                    clearedTime = new Date(clearedMap[user.id] as string);
                }
            }

            const count = await prisma.message.count({
                where: {
                    conversationId: convo.id,
                    read: false,
                    senderId: { not: user.id },
                    createdAt: { gt: clearedTime }
                }
            });
            totalUnread += count;
        }

        return { count: totalUnread };
    } catch (error) {
        return { count: 0 };
    }
}

export async function getAvailableUsers() {
    const user = await getCurrentUser();
    try {
        let whereClause: Prisma.UserWhereInput = {};

        if (user.role === "ADMIN") {
            whereClause = {
                id: { not: user.id }
            };
        } else if (user.role === "TEACHER") {
            const myCourses = await prisma.course.findMany({
                where: { teacherId: user.id },
                select: { id: true }
            });
            const courseIds = myCourses.map(c => c.id);

            whereClause = {
                id: { not: user.id },
                OR: [
                    { role: "ADMIN" },
                    {
                        enrollments: {
                            some: { courseId: { in: courseIds } }
                        }
                    }
                ]
            };
        } else if (user.role === "STUDENT") {
            // Obtener cursos en los que el estudiante está inscrito
            const myEnrollments = await prisma.enrollment.findMany({
                where: { userId: user.id },
                select: { courseId: true }
            });
            const courseIds = myEnrollments.map(e => e.courseId);

            whereClause = {
                id: { not: user.id },
                OR: [
                    { role: "ADMIN" }, // Administradores
                    {
                        coursesTeaching: { // Profesores de mis cursos
                            some: { id: { in: courseIds } }
                        }
                    },
                    {
                        enrollments: { // Estudiantes en mis cursos (Compañeros)
                            some: { courseId: { in: courseIds } }
                        }
                    }
                ]
            };
        }

        const users = await prisma.user.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true
            },
            orderBy: { name: 'asc' }
        });

        return { success: true, data: users };
    } catch (error) {
        console.error("Error fetching available users:", error);
        return { success: false, error: "Failed to fetch users" };
    }
}
