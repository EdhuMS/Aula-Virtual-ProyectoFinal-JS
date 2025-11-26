"use client";

import { createAssignment } from "@/actions/assignment-actions";
import { getCourseModules } from "@/actions/module-actions";
import Link from "next/link";
import { ArrowLeft, Save, Calendar, FileText, Layout, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";

export default function NewAssignmentPage({ params }: { params: Promise<{ courseId: string }> }) {
    const [courseId, setCourseId] = useState("");
    const [modules, setModules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        instructions: "",
        dueDate: "",
        moduleId: "",
    });

    // Modal states
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const router = useRouter();

    useEffect(() => {
        params.then(async (resolvedParams) => {
            setCourseId(resolvedParams.courseId);
            const result = await getCourseModules(resolvedParams.courseId);
            if (result.success && result.data) {
                setModules(result.data);
                if (result.data.length > 0) {
                    setFormData(prev => ({ ...prev, moduleId: result.data[0].id }));
                }
            }
            setLoading(false);
        });
    }, [params]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const result = await createAssignment(courseId, {
            ...formData,
            dueDate: new Date(formData.dueDate),
        });

        if (result.success) {
            router.push(`/teacher/courses/${courseId}/assignments`);
            router.refresh();
        } else {
            setErrorMessage("Error al crear la tarea");
        }
        setSaving(false);
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Cargando...</div>;
    }

    if (modules.length === 0) {
        return (
            <div className="max-w-2xl mx-auto p-8 text-center">
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                    <h3 className="text-yellow-800 font-bold text-lg mb-2">No hay módulos</h3>
                    <p className="text-yellow-700 mb-6">Debes crear al menos un módulo antes de asignar tareas.</p>
                    <Link href={`/teacher/courses/${courseId}`} className="inline-flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 font-medium transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Volver al Curso
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto pb-12">
            <div className="mb-8 flex items-center justify-between">
                <Link
                    href={`/teacher/courses/${courseId}/assignments`}
                    className="text-gray-500 hover:text-gray-900 flex items-center gap-2 transition-colors font-medium"
                >
                    <ArrowLeft className="w-4 h-4" /> Volver a Tareas
                </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 p-6 flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                        <FileText className="w-5 h-5" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900">Nueva Tarea</h1>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Título de la Tarea</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            required
                            placeholder="Ej: Ensayo sobre Historia"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Layout className="w-4 h-4 text-gray-400" />
                                Módulo Correspondiente
                            </label>
                            <select
                                value={formData.moduleId}
                                onChange={(e) => setFormData({ ...formData, moduleId: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                                required
                            >
                                {modules.map(module => (
                                    <option key={module.id} value={module.id}>
                                        {module.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                Fecha de Vencimiento
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Instrucciones</label>
                        <textarea
                            value={formData.instructions}
                            onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                            rows={6}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono text-sm"
                            placeholder="Describe detalladamente qué deben hacer los estudiantes..."
                            required
                        />
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-4 border-t border-gray-100">
                        <Link
                            href={`/teacher/courses/${courseId}/assignments`}
                            className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-600/20 flex items-center gap-2 disabled:opacity-50 transition-all"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? "Guardando..." : "Crear Tarea"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Error Modal */}
            <Modal
                isOpen={!!errorMessage}
                onClose={() => setErrorMessage(null)}
                title="Error"
            >
                <div className="text-center space-y-6">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <p className="text-gray-600 text-lg">
                        {errorMessage}
                    </p>
                    <button
                        onClick={() => setErrorMessage(null)}
                        className="w-full bg-gray-900 text-white px-4 py-2.5 rounded-xl hover:bg-gray-800 font-semibold transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </Modal>
        </div>
    );
}
