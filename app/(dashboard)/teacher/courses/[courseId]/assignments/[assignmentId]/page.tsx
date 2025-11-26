"use client";

import { getAssignment, updateAssignment } from "@/actions/assignment-actions";
import { getCourseModules } from "@/actions/module-actions";
import Link from "next/link";
import { ArrowLeft, Save, Calendar, FileText, Layout, Users, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";

export default function EditAssignmentPage({ params }: { params: Promise<{ courseId: string; assignmentId: string }> }) {
    const [courseId, setCourseId] = useState("");
    const [assignmentId, setAssignmentId] = useState("");
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
            setAssignmentId(resolvedParams.assignmentId);

            const [modulesResult, assignmentResult] = await Promise.all([
                getCourseModules(resolvedParams.courseId),
                getAssignment(resolvedParams.assignmentId)
            ]);

            if (modulesResult.success && modulesResult.data) {
                setModules(modulesResult.data);
            }

            if (assignmentResult.success && assignmentResult.data) {
                const assignment = assignmentResult.data;
                // Format date for datetime-local input (YYYY-MM-DDThh:mm)
                // adjusting for local timezone
                const date = new Date(assignment.dueDate);
                const offset = date.getTimezoneOffset();
                const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
                const formattedDate = adjustedDate.toISOString().slice(0, 16);

                setFormData({
                    title: assignment.title,
                    instructions: assignment.instructions,
                    dueDate: formattedDate,
                    moduleId: assignment.moduleId,
                });
            }
            setLoading(false);
        });
    }, [params]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const result = await updateAssignment(assignmentId, courseId, {
            ...formData,
            dueDate: new Date(formData.dueDate),
        });

        if (result.success) {
            router.push(`/teacher/courses/${courseId}/assignments`);
            router.refresh();
        } else {
            setErrorMessage("Error al actualizar la tarea");
        }
        setSaving(false);
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Cargando...</div>;
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
                <Link
                    href={`/teacher/courses/${courseId}/assignments/${assignmentId}/submissions`}
                    className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-colors font-medium flex items-center gap-2 shadow-lg shadow-green-600/20"
                >
                    <Users className="w-4 h-4" /> Ver Entregas
                </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 p-6 flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                        <FileText className="w-5 h-5" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900">Editar Tarea</h1>
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
                            {saving ? "Guardando..." : "Guardar Cambios"}
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
