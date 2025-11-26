"use client";

import { useEffect, useState } from "react";
import { getTeacherRequests, markRequestsAsRead } from "@/actions/teacher-actions";
import { CheckCircle, XCircle, Clock, FileText, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function TeacherRequestsPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            const result = await getTeacherRequests();
            if (result.success && result.data) {
                setRequests(result.data);
                // Marcar como leído después de cargar
                await markRequestsAsRead();
                // Notificar a la barra lateral para actualizar la insignia
                window.dispatchEvent(new Event('notifications-updated'));
            }
            setLoading(false);
        }
        load();
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Cargando solicitudes...</div>;
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Mis Solicitudes de Corrección</h1>
                <p className="text-gray-500">Estado de tus solicitudes para modificar calificaciones.</p>
            </div>

            {requests.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm">
                    <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Sin solicitudes</h3>
                    <p className="text-gray-500">No has realizado ninguna solicitud de corrección.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map((request) => (
                        <div key={request.id} className={`bg-white rounded-xl p-6 border shadow-sm transition-all ${!request.isReadByTeacher ? 'border-blue-200 ring-1 ring-blue-100' : 'border-gray-200'
                            }`}>
                            <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${request.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                            request.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {request.status === 'APPROVED' && <CheckCircle className="w-3.5 h-3.5" />}
                                            {request.status === 'REJECTED' && <XCircle className="w-3.5 h-3.5" />}
                                            {request.status === 'PENDING' && <Clock className="w-3.5 h-3.5" />}
                                            {request.status === 'APPROVED' ? 'Aprobada' :
                                                request.status === 'REJECTED' ? 'Rechazada' : 'Pendiente'}
                                        </span>
                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(request.updatedAt).toLocaleString()}
                                        </span>
                                        {!request.isReadByTeacher && (
                                            <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                                                NUEVO
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">{request.submission.assignment.title}</h3>
                                        <p className="text-gray-500 text-sm">Estudiante: {request.submission.student.name}</p>
                                    </div>

                                    <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 border border-gray-100">
                                        <span className="font-semibold text-gray-700 block mb-1 text-xs uppercase tracking-wide">Motivo:</span>
                                        {request.reason}
                                    </div>
                                </div>

                                {request.status === 'APPROVED' && (
                                    <Link
                                        href={`/teacher/courses/${request.submission.assignment.courseId}/assignments/${request.submission.assignmentId}/submissions/${request.submissionId}`}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-semibold hover:bg-blue-100 transition-colors text-sm"
                                    >
                                        Ir a Calificar
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
