"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Users, GraduationCap, Menu, X, LogOut, UserCircle, AlertTriangle, MessageSquare } from "lucide-react";
import SignOutButton from "@/components/SignOutButton";
import { getUnreadRequestCount } from "@/actions/teacher-actions";
import { getPendingRequestCount } from "@/actions/admin-actions";
import { getUnreadMessageCount } from "@/actions/chat-actions";
import Image from "next/image";
import { useSession } from "next-auth/react";

export default function DashboardLayoutClient({
    children,
    role,
    user,
}: {
    children: React.ReactNode;
    role: string;
    user: { name?: string | null; email?: string | null; image?: string | null };
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [chatUnreadCount, setChatUnreadCount] = useState(0);
    const { data: session } = useSession();

    // Usar datos de sesión si están disponibles (reactivo), de lo contrario, caer en el prop inicial
    const currentUser = session?.user ? {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image
    } : user;

    useEffect(() => {
        const updateCount = () => {
            // Notificaciones para Solicitudes
            if (role === "TEACHER") {
                getUnreadRequestCount().then(res => setUnreadCount(res.count));
            } else if (role === "ADMIN") {
                getPendingRequestCount().then(res => setUnreadCount(res.count));
            }

            // Notificaciones para Chat (Todos los roles)
            getUnreadMessageCount().then(res => setChatUnreadCount(res.count));
        };

        // Carga inicial
        updateCount();

        // Escuchar actualizaciones de otros componentes
        window.addEventListener('notifications-updated', updateCount);

        // Sondear cada 5 segundos para mejor respuesta
        const interval = setInterval(updateCount, 5000);

        return () => {
            clearInterval(interval);
            window.removeEventListener('notifications-updated', updateCount);
        };
    }, [role]);

    return (
        <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
            {/* Superposición de barra lateral móvil */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Barra lateral */}
            <aside
                className={`
                    fixed lg:static inset-y-0 left-0 z-30 w-72 bg-white shadow-xl flex flex-col border-r border-gray-100 
                    transform transition-transform duration-300 ease-in-out
                    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                `}
            >
                <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-600/20">
                            <GraduationCap className="w-6 h-6" />
                        </div>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Aula Virtual</h1>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden text-gray-500 hover:text-gray-700"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="px-8 mt-4">
                    <div className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold uppercase tracking-wider inline-block">
                        {role === "ADMIN" ? "Administrador" : role === "TEACHER" ? "Profesor" : "Estudiante"}
                    </div>
                </div>

                <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">Menú Principal</div>

                    {role === "ADMIN" && (
                        <>
                            <Link
                                href="/admin/users"
                                onClick={() => setIsSidebarOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all font-medium group"
                            >
                                <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                Gestionar Usuarios
                            </Link>
                            <Link
                                href="/admin/courses"
                                onClick={() => setIsSidebarOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all font-medium group"
                            >
                                <BookOpen className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                Todos los Cursos
                            </Link>
                            <Link
                                href="/admin/requests"
                                onClick={() => setIsSidebarOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all font-medium group justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    Solicitudes
                                </div>
                                {unreadCount > 0 && (
                                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse shadow-sm">
                                        {unreadCount}
                                    </span>
                                )}
                            </Link>
                        </>
                    )}
                    {role === "TEACHER" && (
                        <>
                            <Link
                                href="/teacher/courses"
                                onClick={() => setIsSidebarOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all font-medium group"
                            >
                                <BookOpen className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                Mis Cursos
                            </Link>
                            <Link
                                href="/teacher/requests"
                                onClick={() => setIsSidebarOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all font-medium group justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    Solicitudes
                                </div>
                                {unreadCount > 0 && (
                                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse shadow-sm">
                                        {unreadCount}
                                    </span>
                                )}
                            </Link>
                        </>
                    )}
                    {role === "STUDENT" && (
                        <>
                            <Link
                                href="/student/my-courses"
                                onClick={() => setIsSidebarOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all font-medium group"
                            >
                                <GraduationCap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                Mi Aprendizaje
                            </Link>
                        </>
                    )}

                    {(role === "TEACHER" || role === "STUDENT") && (
                        <Link
                            href="/profile"
                            onClick={() => setIsSidebarOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all font-medium group"
                        >
                            <UserCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            Mi Perfil
                        </Link>
                    )}

                    <Link
                        href="/chat"
                        onClick={() => setIsSidebarOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all font-medium group justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            Chat
                        </div>
                        {chatUnreadCount > 0 && (
                            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse shadow-sm">
                                {chatUnreadCount}
                            </span>
                        )}
                    </Link>
                </nav>

                <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md overflow-hidden">
                            {currentUser.image ? (
                                <Image
                                    src={currentUser.image}
                                    alt={currentUser.name || "User"}
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-cover"
                                    unoptimized
                                />
                            ) : (
                                currentUser.email?.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-gray-900 truncate">{currentUser.name || "Usuario"}</p>
                            <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                        </div>
                    </div>
                    <SignOutButton />
                </div>
            </aside>

            {/* Contenido Principal */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Encabezado Móvil */}
                <header className="lg:hidden bg-white border-b border-gray-100 p-4 flex items-center justify-between shadow-sm z-10">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 p-1.5 rounded-lg text-white">
                            <GraduationCap className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-gray-900">Aula Virtual</span>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
