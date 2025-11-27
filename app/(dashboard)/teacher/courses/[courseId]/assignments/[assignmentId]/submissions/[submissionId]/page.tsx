"use client";

import { gradeSubmission, requestGradeChange, getGradeChangeStatus } from "@/actions/assignment-actions";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, User, FileText, ExternalLink, Calendar, AlertTriangle, Lock, Unlock } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { getDownloadUrl } from "@/lib/utils";

export default function GradeSubmissionPage() {

    const params = useParams();
    const courseId = params.courseId as string;
    const assignmentId = params.assignmentId as string;
    const submissionId = params.submissionId as string;

    const [grade, setGrade] = useState("");
    const [feedback, setFeedback] = useState("");
    const [saving, setSaving] = useState(false);
    const [submission, setSubmission] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Locking & Request State
    const [isLocked, setIsLocked] = useState(false);
    const [hasPendingRequest, setHasPendingRequest] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [requestReason, setRequestReason] = useState("");
    const [requesting, setRequesting] = useState(false);

    // Modal states
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const router = useRouter();

    useEffect(() => {
        async function loadSubmission() {
            if (!submissionId) return;

            const { getSubmissionForGrading } = await import("@/actions/assignment-actions");
            const [submissionRes, statusRes] = await Promise.all([
                getSubmissionForGrading(submissionId),
                getGradeChangeStatus(submissionId)
            ]);

            if (submissionRes.success && submissionRes.data) {
                setSubmission(submissionRes.data);
                setGrade(submissionRes.data.grade?.toString() || "");
                setFeedback(submissionRes.data.feedback || "");

                // Determine if locked: has grade AND cannot edit
                const locked = submissionRes.data.grade !== null && !submissionRes.data.canEditGrade;
                setIsLocked(locked);
            }

            if (statusRes.success) {
                setHasPendingRequest(statusRes.hasPendingRequest || false);
            }

            setLoading(false);
        }
        loadSubmission();
    }, [submissionId]);

    const handleGrade = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const numericGrade = parseFloat(grade);
        if (isNaN(numericGrade) || numericGrade < 0 || numericGrade > 20) {
            setErrorMessage("La calificación debe ser un número entre 0 y 20");
            setSaving(false);
            return;
        }

        const result = await gradeSubmission(submissionId, numericGrade, feedback, courseId, assignmentId);

        if (result.success) {
            setSuccessMessage("Calificación guardada correctamente. La entrega ha sido bloqueada.");
            setIsLocked(true); // Optimistic update
        } else {
            setErrorMessage(result.error || "Error al guardar la calificación");
        }
        setSaving(false);
    };

    const handleRequestChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!requestReason.trim()) return;

        setRequesting(true);
        const result = await requestGradeChange(submissionId, requestReason);

        if (result.success) {
            setHasPendingRequest(true);
            setShowRequestModal(false);
            setSuccessMessage("Solicitud enviada al administrador.");
            window.dispatchEvent(new Event('notifications-updated'));
        } else {
            setErrorMessage(result.error || "Error al enviar la solicitud");
        }
        setRequesting(false);
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Cargando entrega...</div>;
    }

    if (!submission) {
        return <div className="p-8 text-center text-red-500">Entrega no encontrada</div>;
    }

    return (
        <div className="max-w-3xl mx-auto pb-12">
            <div className="mb-8">
                <Link
                    href={`/teacher/courses/${courseId}/assignments/${assignmentId}/submissions`}
                    className="text-gray-500 hover:text-gray-900 flex items-center gap-2 transition-colors font-medium"
                >
                    <ArrowLeft className="w-4 h-4" /> Volver a Entregas
                </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-100 p-3 rounded-full text-blue-600 flex-shrink-0">
                                <User className="w-6 h-6" />
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-xl font-bold text-gray-900 truncate">{submission.student.name}</h1>
                                <p className="text-gray-500 text-sm truncate">{submission.student.email}</p>
                            </div>
                        </div>
                        {isLocked && (
                            <div className="flex items-center gap-2 bg-amber-100 text-amber-800 px-3 py-1.5 rounded-lg text-sm font-medium w-fit">
                                <Lock className="w-4 h-4" />
                                Calificación Bloqueada
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    {/* Submission Content */}
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-400" />
                                Archivos Adjuntos ({submission.fileUrls?.length || 0})
                            </h3>

                            {submission.fileUrls && submission.fileUrls.length > 0 ? (
                                <div className="grid grid-cols-1 gap-3">
                                    {submission.fileUrls.map((url: string, index: number) => (
                                        <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center justify-between hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="bg-white p-2 rounded-lg border border-gray-200 text-blue-600">
                                                    <ExternalLink className="w-5 h-5" />
                                                </div>
                                                <div className="truncate">
                                                    <p className="font-medium text-gray-900 truncate">Archivo {index + 1}</p>
                                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                        <Calendar className="w-3 h-3" />
                                                        Entregado el {new Date(submission.submittedAt).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <a
                                                href={getDownloadUrl(url)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-700 font-bold text-sm hover:underline whitespace-nowrap px-4"
                                            >
                                                Abrir Enlace
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-500">
                                    No hay archivos adjuntos en esta entrega.
                                </div>
                            )}
                        </div>

                        {submission.studentComment && (
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-gray-400" />
                                    Comentario del Estudiante
                                </h3>
                                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-gray-700 italic">
                                    "{submission.studentComment}"
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Grading Form */}
                    <form onSubmit={handleGrade} className="space-y-6 pt-6 border-t border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700">Calificación (0-20)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="20"
                                    step="0.1"
                                    value={grade}
                                    onChange={(e) => setGrade(e.target.value)}
                                    disabled={isLocked}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-lg font-mono font-medium disabled:bg-gray-100 disabled:text-gray-500"
                                    placeholder="Ej: 18"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700">Retroalimentación (Opcional)</label>
                            <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                disabled={isLocked}
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-100 disabled:text-gray-500"
                                placeholder="Escribe tus comentarios para el estudiante..."
                            />
                        </div>

                        <div className="flex justify-end pt-4 gap-4">
                            {isLocked ? (
                                hasPendingRequest ? (
                                    <button
                                        type="button"
                                        disabled
                                        className="bg-amber-100 text-amber-700 px-6 py-3 rounded-xl font-bold flex items-center gap-2 cursor-not-allowed"
                                    >
                                        <Lock className="w-5 h-5" />
                                        Solicitud Pendiente
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setShowRequestModal(true)}
                                        className="bg-white border-2 border-amber-500 text-amber-600 px-6 py-3 rounded-xl hover:bg-amber-50 font-bold flex items-center gap-2 transition-all"
                                    >
                                        <Unlock className="w-5 h-5" />
                                        Solicitar Corrección
                                    </button>
                                )
                            ) : (
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-600/20 flex items-center gap-2 disabled:opacity-50 transition-all"
                                >
                                    <Save className="w-5 h-5" />
                                    {saving ? "Guardando..." : "Guardar Calificación"}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {/* Request Change Modal */}
            <Modal
                isOpen={showRequestModal}
                onClose={() => setShowRequestModal(false)}
                title="Solicitar Corrección de Nota"
            >
                <form onSubmit={handleRequestChange} className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-xl text-blue-800 text-sm">
                        <p>
                            Para modificar una calificación ya guardada, debes solicitar permiso al administrador explicando el motivo.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">Motivo de la corrección</label>
                        <textarea
                            value={requestReason}
                            onChange={(e) => setRequestReason(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="Ej: Error al digitar la nota, revisión posterior del trabajo..."
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setShowRequestModal(false)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={requesting}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-bold shadow-lg shadow-blue-600/20 disabled:opacity-50 transition-all"
                        >
                            {requesting ? "Enviando..." : "Enviar Solicitud"}
                        </button>
                    </div>
                </form>
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

            {/* Success Modal */}
            <Modal
                isOpen={!!successMessage}
                onClose={() => setSuccessMessage(null)}
                title="Éxito"
            >
                <div className="text-center space-y-6">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                        <Save className="w-8 h-8" />
                    </div>
                    <p className="text-gray-600 text-lg">
                        {successMessage}
                    </p>
                    <button
                        onClick={() => setSuccessMessage(null)}
                        className="w-full bg-gray-900 text-white px-4 py-2.5 rounded-xl hover:bg-gray-800 font-semibold transition-colors"
                    >
                        Entendido
                    </button>
                </div>
            </Modal>
        </div>
    );
}
