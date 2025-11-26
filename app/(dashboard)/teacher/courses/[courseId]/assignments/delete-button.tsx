"use client";

import { deleteAssignment } from "@/actions/assignment-actions";
import { Trash2, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";

export function DeleteAssignmentButton({ assignmentId, courseId }: { assignmentId: string, courseId: string }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        setIsDeleting(true);
        await deleteAssignment(assignmentId, courseId);
        setIsDeleting(false);
        setShowModal(false);
        router.refresh();
    };

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                disabled={isDeleting}
                className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                title="Eliminar Tarea"
            >
                <Trash2 className="w-5 h-5" />
            </button>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Eliminar Tarea"
            >
                <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-red-50 rounded-xl border border-red-100 text-red-700">
                        <AlertTriangle className="w-10 h-10 flex-shrink-0" />
                        <div>
                            <h4 className="font-bold">¿Estás seguro?</h4>
                            <p className="text-sm mt-1">
                                ¿Estás seguro de eliminar esta tarea? Se perderán todas las entregas asociadas y no se podrá recuperar.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowModal(false)}
                            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-xl hover:bg-red-700 font-semibold transition-colors disabled:opacity-70"
                        >
                            {isDeleting ? "Eliminando..." : "Sí, Eliminar"}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
