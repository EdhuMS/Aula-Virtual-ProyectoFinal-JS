"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function updateProfile(prevState: any, formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return { success: false, error: "No autorizado" };
    }

    const name = formData.get("name") as string;
    const image = formData.get("image") as string;

    if (!name || !name.trim()) {
        return { success: false, error: "El nombre es obligatorio" };
    }

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name,
                image: image || null,
            },
        });

        revalidatePath("/profile");
        return { success: true, message: "Perfil actualizado correctamente" };
    } catch (error) {
        console.error("Error updating profile:", error);
        return { success: false, error: "Error al actualizar el perfil" };
    }
}

export async function changePassword(prevState: any, formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return { success: false, error: "No autorizado" };
    }

    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!currentPassword || !newPassword || !confirmPassword) {
        return { success: false, error: "Todos los campos son obligatorios" };
    }

    if (newPassword !== confirmPassword) {
        return { success: false, error: "las contraseñas nuevas no coinciden" };
    }

    if (newPassword.length < 6) {
        return { success: false, error: "La contraseña debe tener al menos 6 caracteres" };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        });

        if (!user) {
            return { success: false, error: "Usuario no encontrado" };
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isPasswordValid) {
            return { success: false, error: "La contraseña actual es incorrecta" };
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                password: hashedPassword,
            },
        });

        revalidatePath("/profile");
        return { success: true, message: "Contraseña actualizada correctamente" };
    } catch (error) {
        console.error("Error changing password:", error);
        return { success: false, error: "Error al cambiar la contraseña" };
    }
}
