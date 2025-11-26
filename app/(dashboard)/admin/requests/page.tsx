"use client";

import { useEffect, useState } from "react";
import { getPendingGradeRequests, approveGradeRequest, rejectGradeRequest } from "@/actions/admin-actions";
import { CheckCircle, XCircle, Clock, User, FileText, AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/modal";

export default function GradeRequestsPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);
    const [confirmAction, setConfirmAction] = useState<{ type: 'approve' | 'reject', requestId: string } | null>(null);

    async function loadRequests() {
        setLoading(true);
        const result = await getPendingGradeRequests();
        if (result.success && result.data) {
            setRequests(result.data);
        }
        setLoading(false);
    }

    useEffect(() => {
        loadRequests();
    }, []);

    const handleAction = async () => {
        if (!confirmAction) return;

        setProcessing(confirmAction.requestId);

        let result;
        if (confirmAction.type === 'approve') {
            result = await approveGradeRequest(confirmAction.requestId);
        } else {
            result = await rejectGradeRequest(confirmAction.requestId);
        }

        if (result.success) {
            await loadRequests();
            // Notify sidebar to update badge
            window.dispatchEvent(new Event('notifications-updated'));
        } else {
            alert("Error al procesar la solicitud");
        }

        setProcessing(null);
        setConfirmAction(null);
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Cargando solicitudes...</div>;
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Solicitudes de Corrección de Notas</h1>
                <p className="text-gray-500">Gestiona las solicitudes de los profesores para modificar calificaciones.</p>
            </div>

            {requests.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Todo al día</h3>
                    <p className="text-gray-500">No hay solicitudes pendientes.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {requests.map((request) => (
                        <div key={request.id} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                            <div className="flex-1 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{request.teacher.name}</h3>
                                        <p className="text-sm text-gray-500">{request.teacher.email}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                    <div>
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Estudiante</span>
                                        <p className="font-medium text-gray-900">{request.submission.student.name}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tarea</span>
                                        <p className="font-medium text-gray-900">{request.submission.assignment.title}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                            <AlertTriangle className="w-3 h-3" /> Motivo
                                        </span>
                                        <p className="text-gray-700 mt-1">{request.reason}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <Clock className="w-3 h-3" />
                                    Solicitado el {new Date(request.createdAt).toLocaleString()}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <button
                                    onClick={() => setConfirmAction({ type: 'reject', requestId: request.id })}
                                    disabled={!!processing}
                                    className="flex-1 md:flex-none px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium transition-colors disabled:opacity-50"
                                >
                                    Rechazar
                                </button>
                                <button
                                    onClick={() => setConfirmAction({ type: 'approve', requestId: request.id })}
                                    disabled={!!processing}
                                    className="flex-1 md:flex-none px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50"
                                >
                                    Aprobar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Confirmation Modal */}
            <Modal
                isOpen={!!confirmAction}
                onClose={() => setConfirmAction(null)}
                title={confirmAction?.type === 'approve' ? "Aprobar Solicitud" : "Rechazar Solicitud"}
            >
                <div className="space-y-6">
                    <p className="text-gray-600">
                        {confirmAction?.type === 'approve'
                            ? "¿Estás seguro de que deseas aprobar esta solicitud? El profesor podrá modificar la calificación de esta entrega."
                            : "¿Estás seguro de que deseas rechazar esta solicitud? El profesor no podrá modificar la calificación."
                        }
                    </p>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setConfirmAction(null)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleAction}
                            disabled={!!processing}
                            className={`px-6 py-2 text-white rounded-lg font-bold shadow-lg transition-all ${confirmAction?.type === 'approve'
                                ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20"
                                : "bg-red-600 hover:bg-red-700 shadow-red-600/20"
                                }`}
                        >
                            {processing ? "Procesando..." : (confirmAction?.type === 'approve' ? "Sí, Aprobar" : "Sí, Rechazar")}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
