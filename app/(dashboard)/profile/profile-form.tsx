"use client";

import { updateProfile } from "@/actions/profile-actions";
import { useActionState, useState, useEffect } from "react";
import { User, Mail, Image as ImageIcon, Loader2, Save } from "lucide-react";
import { CldUploadButton } from "next-cloudinary";
import Image from "next/image";
import { useSession } from "next-auth/react";

export default function ProfileForm({ user }: { user: any }) {
    const [state, action, isPending] = useActionState(updateProfile, null);
    const [imageUrl, setImageUrl] = useState(user.image || "");
    const { update } = useSession();

    useEffect(() => {
        if (state?.success) {
            update({ name: state.name, image: state.image });
        }
    }, [state, update]);

    return (
        <form action={action} className="space-y-6">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            name="name"
                            defaultValue={user.name}
                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Tu nombre completo"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="email"
                            defaultValue={user.email}
                            disabled
                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">El correo electrónico no se puede modificar.</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Imagen de Perfil</label>
                    <div className="flex items-center gap-4">
                        <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                            {imageUrl ? (
                                <Image
                                    src={imageUrl}
                                    alt="Profile"
                                    width={80}
                                    height={80}
                                    className="w-full h-full object-cover"
                                    unoptimized // Cloudinary maneja la optimización, y el dominio podría no estar en next.config
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <ImageIcon className="w-8 h-8" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <CldUploadButton
                                uploadPreset="aula_virtual_preset"
                                options={{
                                    maxFiles: 1,
                                    resourceType: "image",
                                    clientAllowedFormats: ["png", "jpeg", "jpg", "webp"],
                                    sources: ["local", "url", "camera"],
                                    multiple: false
                                }}
                                onSuccess={(result: any) => {
                                    if (result.info?.secure_url) {
                                        setImageUrl(result.info.secure_url);
                                    }
                                }}
                                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 font-medium transition-colors text-sm"
                            >
                                Subir Nueva Imagen
                            </CldUploadButton>
                            <p className="text-xs text-gray-500 mt-2">Sube una imagen JPG o PNG. Máximo 2MB.</p>
                            <input type="hidden" name="image" value={imageUrl} />
                        </div>
                    </div>
                </div>
            </div>

            {state?.error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                    {state.error}
                </div>
            )}

            {state?.success && (
                <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg border border-green-100">
                    {state.message}
                </div>
            )}

            <button
                type="submit"
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isPending ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Guardando...
                    </>
                ) : (
                    <>
                        <Save className="w-4 h-4" /> Guardar Cambios
                    </>
                )}
            </button>
        </form>
    );
}
