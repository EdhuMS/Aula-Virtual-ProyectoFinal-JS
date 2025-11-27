"use client";

import { getAssignment, submitAssignment, getStudentSubmission } from "@/actions/assignment-actions";
import Link from "next/link";
import { ArrowLeft, Calendar, FileText, Upload, CheckCircle, AlertCircle, Clock, X, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CldUploadButton } from "next-cloudinary";
import { getDownloadUrl } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";

export default function AssignmentDetailsPage({ params }: { params: Promise<{ courseId: string; assignmentId: string }> }) {

    const [assignment, setAssignment] = useState<any>(null);
    const [submission, setSubmission] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [fileUrls, setFileUrls] = useState<string[]>([]);
    const [comment, setComment] = useState("");
    const [courseId, setCourseId] = useState("");
    const [assignmentId, setAssignmentId] = useState("");

    // Modal states
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const router = useRouter();

    useEffect(() => {
        params.then(async (resolvedParams) => {
            setCourseId(resolvedParams.courseId);
            setAssignmentId(resolvedParams.assignmentId);

            const [assignmentResult, submissionResult] = await Promise.all([
                getAssignment(resolvedParams.assignmentId),
                getStudentSubmission(resolvedParams.assignmentId)
            ]);

            if (assignmentResult.success) {
                setAssignment(assignmentResult.data);
            }
            if (submissionResult.success) {
                setSubmission(submissionResult.data);
                // Cast to any to avoid potential type issues if Prisma types aren't fully synced
                const data = submissionResult.data as any;
                if (data?.fileUrls) {
                    const urls = Array.isArray(data.fileUrls)
                        ? (data.fileUrls as string[])
                        : [];
                    setFileUrls(urls);
                }
            }
            setLoading(false);
        });
    }, [params]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (fileUrls.length === 0) return;

        setSubmitting(true);
        const result = await submitAssignment(assignmentId, fileUrls, comment);

        if (result.success) {
            // Refresh submission status
            const submissionResult = await getStudentSubmission(assignmentId);
            if (submissionResult.success) {
                setSubmission(submissionResult.data);
            }
            setSuccessMessage("Tarea enviada correctamente");
            router.refresh();
        } else {
            setErrorMessage("Error al enviar la tarea");
        }
        setSubmitting(false);
    };

    const handleRemoveFile = (urlToRemove: string) => {
        setFileUrls(prev => prev.filter(url => url !== urlToRemove));
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Cargando detalles de la tarea...</div>;
    }

    if (!assignment) {
        return (
            <div className="p-8 text-center">
                <div className="bg-red-50 text-red-600 p-4 rounded-xl inline-block">
                    Tarea no encontrada
                </div>
            </div>
        );
    }

    const isPastDue = new Date(assignment.dueDate) < new Date();

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="mb-8">
                <Link href={`/student/courses/${courseId}/assignments`} className="text-gray-500 hover:text-gray-900 flex items-center gap-2 transition-colors font-medium mb-4">
                    <ArrowLeft className="w-4 h-4" /> Volver a Tareas
                </Link>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{assignment.title}</h1>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg w-fit">
                                <Calendar className="w-4 h-4" />
                                Vence: {new Date(assignment.dueDate).toLocaleString()}
                            </span>
                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg font-medium w-fit">
                                Módulo: {assignment.module.title}
                            </span>
                        </div>
                    </div>
                    {submission ? (
                        <div className="bg-green-100 text-green-700 px-4 py-2 rounded-xl flex items-center gap-2 font-bold shadow-sm w-fit">
                            <CheckCircle className="w-5 h-5" /> Entregado
                        </div>
                    ) : isPastDue ? (
                        <div className="bg-red-100 text-red-700 px-4 py-2 rounded-xl flex items-center gap-2 font-bold shadow-sm w-fit">
                            <AlertCircle className="w-5 h-5" /> Vencida
                        </div>
                    ) : (
                        <div className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-xl flex items-center gap-2 font-bold shadow-sm w-fit">
                            <Clock className="w-5 h-5" /> Pendiente
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
                {/* Left Column: Instructions */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-500" /> Instrucciones
                        </h2>
                        <div className="prose prose-blue max-w-none text-gray-600 whitespace-pre-wrap">
                            {assignment.instructions}
                        </div>
                    </div>
                </div>

                {/* Right Column: Submission */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Tu Entrega</h2>

                        {submission ? (
                            <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Fecha de envío</div>
                                    <div className="text-gray-900 font-medium">
                                        {new Date(submission.submittedAt).toLocaleString()}
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    <div className="text-xs text-gray-500 uppercase font-semibold mb-2">Archivos Entregados</div>
                                    <div className="space-y-2">
                                        {Array.isArray(submission.fileUrls) && (submission.fileUrls as string[]).map((url: string, index: number) => (
                                            <a
                                                key={index}
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-blue-600 hover:underline bg-white p-2 rounded border border-gray-200 text-sm font-medium"
                                            >
                                                <FileText className="w-4 h-4" />
                                                Archivo {index + 1}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                                {submission.studentComment && (
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                        <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Tu Comentario</div>
                                        <p className="text-gray-700 text-sm italic">"{submission.studentComment}"</p>
                                    </div>
                                )}
                                {submission.grade !== null ? (
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                        <div className="text-xs text-blue-600 uppercase font-bold mb-1">Calificación</div>
                                        <div className="text-3xl font-bold text-blue-700">{submission.grade}/20</div>
                                        {submission.feedback && (
                                            <div className="mt-3 pt-3 border-t border-blue-200">
                                                <div className="text-xs text-blue-600 uppercase font-semibold mb-1">Comentarios del Profesor</div>
                                                <p className="text-blue-800 text-sm">{submission.feedback}</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-yellow-800 text-sm font-medium flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        Pendiente de calificación
                                    </div>
                                )}
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Archivos de la Tarea (Máx 5)
                                    </label>

                                    {fileUrls.length < 5 && (
                                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors mb-4">
                                            <CldUploadButton
                                                uploadPreset="aula_virtual_assignments_raw"
                                                options={{
                                                    maxFiles: 5 - fileUrls.length,
                                                    resourceType: "auto",
                                                    clientAllowedFormats: ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "zip", "rar", "txt", "jpg", "png", "jpeg"],
                                                    multiple: true
                                                }}
                                                onSuccess={(result: any) => {
                                                    if (result.info?.secure_url) {
                                                        setFileUrls(prev => [...prev, result.info.secure_url]);
                                                    }
                                                }}
                                                className="flex flex-col items-center justify-center w-full h-full gap-2 text-gray-500 hover:text-blue-600 transition-colors"
                                            >
                                                <Upload className="w-6 h-6" />
                                                <span className="font-medium text-sm">Subir Archivos</span>
                                            </CldUploadButton>
                                        </div>
                                    )}

                                    {fileUrls.length > 0 && (
                                        <div className="space-y-2">
                                            {fileUrls.map((url, index) => (
                                                <div key={index} className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-center justify-between">
                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                        <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                                        <a href={getDownloadUrl(url)} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-700 hover:underline truncate">
                                                            Archivo {index + 1}
                                                        </a>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveFile(url)}
                                                        className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Comentario (Opcional)
                                    </label>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Escribe un mensaje para el profesor..."
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm min-h-[100px]"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting || isPastDue || fileUrls.length === 0}
                                    className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {submitting ? "Enviando..." : isPastDue ? "Entrega Cerrada" : "Confirmar Entrega"}
                                    {!submitting && !isPastDue && <CheckCircle className="w-4 h-4" />}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            {/* Success Modal */}
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
                        onClick={() => setSuccessMessage(null)}
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
