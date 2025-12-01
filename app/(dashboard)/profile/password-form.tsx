"use client";

import { changePassword } from "@/actions/profile-actions";
import { useActionState, useState, useRef, useEffect } from "react";
import { Lock, Loader2, Save, Eye, EyeOff } from "lucide-react";

export default function PasswordForm() {
    const [state, action, isPending] = useActionState(changePassword, null);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const lastHandledTimestamp = useRef<number>(0);

    useEffect(() => {
        if (state?.success && state.timestamp && state.timestamp !== lastHandledTimestamp.current) {
            lastHandledTimestamp.current = state.timestamp;
            // Opcional: Limpiar campos o mostrar notificación extra
        }
    }, [state]);

    return (
        <form action={action} className="space-y-6">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Actual</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type={showCurrentPassword ? "text" : "password"}
                            name="currentPassword"
                            required
                            className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                            {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type={showNewPassword ? "text" : "password"}
                            name="newPassword"
                            required
                            minLength={6}
                            className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                            {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nueva Contraseña</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            required
                            minLength={6}
                            className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
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
                        <Loader2 className="w-4 h-4 animate-spin" /> Actualizando...
                    </>
                ) : (
                    <>
                        <Save className="w-4 h-4" /> Actualizar Contraseña
                    </>
                )}
            </button>
        </form>
    );
}
