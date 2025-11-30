import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProfileForm from "./profile-form";
import PasswordForm from "./password-form";
import { UserCircle, ShieldCheck } from "lucide-react";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/login");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
    });

    if (!user) {
        redirect("/login");
    }

    return (
        <div className="max-w-5xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
                <p className="text-gray-500 mt-1">Gestiona tu información personal y configuración de seguridad.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Información Personal */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
                            <UserCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Información Personal</h2>
                            <p className="text-sm text-gray-500">Actualiza tus datos básicos</p>
                        </div>
                    </div>
                    <div className="p-6">
                        <ProfileForm user={user} />
                    </div>
                </div>

                {/* Seguridad */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                        <div className="bg-purple-100 p-2 rounded-xl text-purple-600">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Seguridad</h2>
                            <p className="text-sm text-gray-500">Cambia tu contraseña</p>
                        </div>
                    </div>
                    <div className="p-6">
                        <PasswordForm />
                    </div>
                </div>
            </div>
        </div>
    );
}
