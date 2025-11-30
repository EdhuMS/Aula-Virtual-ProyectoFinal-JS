"use client";

import { getLesson, updateLesson } from "@/actions/module-actions";
import Link from "next/link";
import { ArrowLeft, Save, Video, FileText, Layout, CheckCircle, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";

export default function LessonEditorPage({ params }: { params: Promise<{ courseId: string; lessonId: string }> }) {
    const [lesson, setLesson] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        resourceUrl: "",
    });

    // Estados de los modales
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [courseId, setCourseId] = useState("");
    const [lessonId, setLessonId] = useState("");

    const router = useRouter();

    useEffect(() => {
        params.then((resolvedParams) => {
            setCourseId(resolvedParams.courseId);
            setLessonId(resolvedParams.lessonId);
            loadLesson(resolvedParams.lessonId);
        });
    }, [params]);

    const loadLesson = async (id: string) => {
        const result = await getLesson(id);
        if (result.success && result.data) {
            setLesson(result.data);
            setFormData({
                title: result.data.title,
                content: result.data.content || "",
                resourceUrl: result.data.resourceUrl || "",
            });
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const result = await updateLesson(lessonId, formData);
        if (result.success) {
            setSuccessMessage("Lección actualizada correctamente");
            router.refresh();
        } else {
            setErrorMessage("Error al actualizar la lección");
        }
        setSaving(false);
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Cargando editor...</div>;
    }

    if (!lesson) {
        return <div className="p-8 text-center text-red-500">Lección no encontrada</div>;
    }

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="mb-8 flex items-center justify-between">
                <Link
                    href={`/teacher/courses/${courseId}`}
                    className="text-gray-500 hover:text-gray-900 flex items-center gap-2 transition-colors font-medium"
                >
                    <ArrowLeft className="w-4 h-4" /> Volver al Curso
                </Link>
                <div className="text-sm text-gray-400">
                    Editando: <span className="font-semibold text-gray-700">{lesson.title}</span>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 p-6 flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                        <Layout className="w-5 h-5" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900">Editor de Lección</h1>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Título de la Lección</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Video className="w-4 h-4 text-gray-400" />
                            URL del Recurso (Video/PDF)
                        </label>
                        <input
                            type="text"
                            value={formData.resourceUrl}
                            onChange={(e) => setFormData({ ...formData, resourceUrl: e.target.value })}
                            placeholder="https://youtube.com/..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono text-sm"
                        />
                        <p className="text-xs text-gray-500">Pega aquí el enlace directo a tu video o documento.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-400" />
                            Contenido (HTML/Markdown)
                        </label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            rows={12}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono text-sm"
                            placeholder="Escribe el contenido de la clase aquí..."
                        />
                        <p className="text-xs text-gray-500">Puedes usar formato HTML básico para dar estilo al texto.</p>
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-4 border-t border-gray-100">
                        <Link
                            href={`/teacher/courses/${courseId}`}
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

            {/* Modal de exito */}
            <Modal
                isOpen={!!successMessage}
                onClose={() => setSuccessMessage(null)}
                title="Éxito"
            >
                <div className="text-center space-y-6">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <p className="text-gray-600 text-lg font-medium">
                        {successMessage}
                    </p>
                    <button
                        onClick={() => {
                            setSuccessMessage(null);
                            router.push(`/teacher/courses/${courseId}`);
                        }}
                        className="w-full bg-gray-900 text-white px-4 py-2.5 rounded-xl hover:bg-gray-800 font-semibold transition-colors"
                    >
                        Aceptar
                    </button>
                </div>
            </Modal>

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
