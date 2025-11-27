"use client";

import { useState } from "react";
import { enrollStudent, unenrollStudent } from "@/actions/enrollment-actions";
import { Trash2, UserPlus, Search, UserCheck, Mail, AlertTriangle, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";

import { SearchableSelect } from "@/components/ui/searchable-select";

export default function EnrollmentManager({
    courseId,
    enrolledStudents,
    availableStudents
}: {
    courseId: string,
    enrolledStudents: any[],
    availableStudents: any[]
}) {
    const [selectedStudentId, setSelectedStudentId] = useState("");
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // Modal states
    const [studentToUnenroll, setStudentToUnenroll] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleEnroll = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudentId) return;

        setIsLoading(true);
        const result = await enrollStudent(courseId, selectedStudentId);
        if (result.success) {
            setSelectedStudentId("");
            setSuccessMessage("Estudiante inscrito correctamente");
            router.refresh();
        } else {
            setErrorMessage(result.error || "Error al inscribir estudiante");
        }
        setIsLoading(false);
    };

    const confirmUnenroll = async () => {
        if (!studentToUnenroll) return;

        try {
            await unenrollStudent(studentToUnenroll, courseId);
            setStudentToUnenroll(null);
            router.refresh();
            setSuccessMessage("Estudiante eliminado del curso");
        } catch (error) {
            setErrorMessage("Error al eliminar la inscripción");
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Enrollment Form */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 sticky top-6">
                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-900">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            <UserPlus className="w-5 h-5" />
                        </div>
                        Inscribir Estudiante
                    </h2>

                    <div className="space-y-6">
                        <form onSubmit={handleEnroll} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Seleccionar Estudiante</label>
                                <SearchableSelect
                                    options={availableStudents.map(student => ({
                                        id: student.id,
                                        label: student.name,
                                        subLabel: student.email
                                    }))}
                                    value={selectedStudentId}
                                    onChange={setSelectedStudentId}
                                    placeholder="-- Elegir estudiante --"
                                    searchPlaceholder="Buscar por nombre o email..."
                                    emptyMessage="No se encontraron estudiantes"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={!selectedStudentId || isLoading}
                                className="w-full bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all shadow-lg shadow-blue-500/20"
                            >
                                {isLoading ? "Inscribiendo..." : "Inscribir Estudiante"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Enrolled Students List */}
            <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h2 className="text-lg font-bold text-gray-900">Estudiantes Inscritos</h2>
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-200">
                            {enrolledStudents.length} Activos
                        </span>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {enrolledStudents.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <UserCheck className="w-8 h-8 text-gray-300" />
                                </div>
                                <p className="text-gray-500 font-medium">No hay estudiantes inscritos en este curso.</p>
                            </div>
                        ) : (
                            enrolledStudents.map((enrollment) => (
                                <div key={enrollment.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-500/20">
                                            {enrollment.user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900">{enrollment.user.name}</div>
                                            <div className="text-sm text-gray-500 flex items-center gap-1">
                                                <Mail className="w-3 h-3" />
                                                {enrollment.user.email}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setStudentToUnenroll(enrollment.id)}
                                        className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Eliminar estudiante"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Unenroll Confirmation Modal */}
            <Modal
                isOpen={!!studentToUnenroll}
                onClose={() => setStudentToUnenroll(null)}
                title="Confirmar Eliminación"
            >
                <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-red-50 rounded-xl border border-red-100 text-red-700">
                        <AlertTriangle className="w-10 h-10 flex-shrink-0" />
                        <div>
                            <h4 className="font-bold">¿Eliminar estudiante?</h4>
                            <p className="text-sm mt-1">
                                ¿Estás seguro de que deseas eliminar a este estudiante del curso? Perderá el acceso al contenido inmediatamente.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setStudentToUnenroll(null)}
                            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={confirmUnenroll}
                            className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-xl hover:bg-red-700 font-semibold transition-colors"
                        >
                            Eliminar
                        </button>
                    </div>
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
