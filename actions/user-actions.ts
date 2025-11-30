"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Role, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

// Función auxiliar para verificar si el usuario actual es Administrador
async function checkAdmin() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
        throw new Error("No autorizado: Acceso denegado");
    }
    return session;
}

export async function getUsers() {
    await checkAdmin();
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });
        return { success: true, data: users };
    } catch (error) {
        return { success: false, error: "Error al obtener usuarios" };
    }
}

export async function createUser(prevState: any, formData: FormData) {
    await checkAdmin();

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as Role;

    if (!name || !email || !password || !role) {
        return { success: false, error: "Faltan campos obligatorios" };
    }

    try {
        // Verificar si el usuario existe
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return { success: false, error: "El usuario ya existe" };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
            },
        });

        revalidatePath("/admin/users");
        return { success: true, timestamp: Date.now() + Math.random() };
    } catch (error) {
        return { success: false, error: "Error al crear usuario", timestamp: Date.now() + Math.random() };
    }
}

export async function updateUserRole(userId: string, newRole: Role) {
    await checkAdmin();
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { role: newRole },
        });
        revalidatePath("/admin/users");
        return { success: true, timestamp: Date.now() + Math.random() };
    } catch (error) {
        return { success: false, error: "Error al actualizar el rol del usuario", timestamp: Date.now() + Math.random() };
    }
}

export async function deleteUser(userId: string) {
    await checkAdmin();
    try {
        const userToDelete = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true }
        });

        if (userToDelete?.email === "admin@aulavirtual.com") {
            return { success: false, error: "No se puede eliminar el Super Admin", timestamp: Date.now() + Math.random() };
        }

        await prisma.user.delete({
            where: { id: userId },
        });
        revalidatePath("/admin/users");
        return { success: true, timestamp: Date.now() + Math.random() };
    } catch (error) {
        return { success: false, error: "Error al eliminar el usuario", timestamp: Date.now() + Math.random() };
    }
}

export async function getTeachers() {
    await checkAdmin();
    try {
        const teachers = await prisma.user.findMany({
            where: { role: "TEACHER" },
            orderBy: { name: "asc" },
            select: { id: true, name: true, email: true },
        });
        return { success: true, data: teachers };
    } catch (error) {
        return { success: false, error: "Error al obtener los profesores" };
    }
}
export async function updateUser(prevState: any, formData: FormData) {
    await checkAdmin();

    const userId = formData.get("userId") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const role = formData.get("role") as Role;
    const password = formData.get("password") as string;

    if (!userId || !name || !email || !role) {
        return { success: false, error: "Faltan campos obligatorios", timestamp: Date.now() + Math.random() };
    }

    try {
        const data: Prisma.UserUpdateInput = {
            name,
            email,
            role,
        };

        if (password && password.trim() !== "") {
            data.password = await bcrypt.hash(password, 10);
        }

        await prisma.user.update({
            where: { id: userId },
            data,
        });

        revalidatePath("/admin/users");
        return { success: true, timestamp: Date.now() + Math.random() };
    } catch (error) {
        return { success: false, error: "Error al actualizar el usuario", timestamp: Date.now() + Math.random() };
    }
}
