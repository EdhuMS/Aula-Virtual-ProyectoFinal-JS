"use client";

import { createCourse } from "@/actions/course-actions";
import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { Loader2, ArrowLeft, BookOpen, FileText, User } from "lucide-react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

const initialState = {
    success: false,
    error: "",
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-500/20 transition-all transform hover:-translate-y-0.5"
        >
            {pending ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creando Curso...
                </>
            ) : (
                "Crear Curso"
            )}
        </button>
    );
}

export default function CreateCourseForm({ teachers }: { teachers: any[] }) {
    const [state, formAction] = useActionState(createCourse, initialState);
    const router = useRouter();

    const lastHandledTimestamp = useRef<number>(0);

    useEffect(() => {
        if (state.success && state.timestamp && state.timestamp !== lastHandledTimestamp.current) {
            lastHandledTimestamp.current = state.timestamp;
            router.push("/admin/courses");
        }
    }, [state, router]);

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <Link href="/admin/courses" className="text-gray-500 hover:text-gray-900 flex items-center gap-2 transition-colors font-medium">
                    <ArrowLeft className="w-4 h-4" /> Volver a Cursos
                </Link>
            </div>

            <div className="text-center mb-10">
                <h1 className="text-3xl font-extrabold text-gray-900">Crear Nuevo Curso</h1>
                <p className="text-gray-500 mt-2">Configura los detalles básicos del curso y asigna un profesor.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100">
                <form action={formAction} className="space-y-6">
                    {state?.error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-center gap-2">
                            <span className="font-bold">Error:</span> {state.error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Título del Curso</label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <input
                                name="title"
                                type="text"
                                required
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Ej: JavaScript Avanzado"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Código del Curso</label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <FileText className="w-5 h-5" />
                            </div>
                            <input
                                name="code"
                                type="text"
                                required
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Ej: MAT-101"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Descripción</label>
                        <div className="relative">
                            <div className="absolute left-3 top-3 text-gray-400">
                                <FileText className="w-5 h-5" />
                            </div>
                            <textarea
                                name="description"
                                required
                                rows={4}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                placeholder="¿Qué aprenderán los estudiantes en este curso?"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Asignar Profesor</label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <User className="w-5 h-5" />
                            </div>
                            <select
                                name="teacherId"
                                required
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all appearance-none"
                            >
                                <option value="">Selecciona un profesor...</option>
                                {teachers.map((teacher) => (
                                    <option key={teacher.id} value={teacher.id}>
                                        {teacher.name} ({teacher.email})
                                    </option>
                                ))}
                            </select>
                        </div>
                        {teachers.length === 0 && (
                            <p className="text-sm text-amber-600 mt-2 bg-amber-50 p-2 rounded-lg">
                                No hay profesores registrados. Crea una cuenta de profesor primero.
                            </p>
                        )}
                    </div>

                    <div className="pt-4">
                        <SubmitButton />
                    </div>
                </form>
            </div>
        </div>
    );
}
