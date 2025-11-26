"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function SignOutButton() {
    const handleSignOut = async () => {
        // redirect: false evita que NextAuth use NEXTAUTH_URL
        // Luego redirigimos manualmente a /login relativo al dominio actual
        await signOut({ redirect: false });
        window.location.href = "/login";
    };

    return (
        <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-all font-medium group"
        >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Cerrar Sesión
        </button>
    );
}
