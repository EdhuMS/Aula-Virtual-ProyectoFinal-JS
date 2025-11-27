import { getStudentAssignments } from "@/actions/assignment-actions";
import Link from "next/link";
import { ArrowLeft, Calendar, FileText, CheckCircle, Clock } from "lucide-react";

export default async function StudentAssignmentsPage({ params }: { params: Promise<{ courseId: string }> }) {
    const { courseId } = await params;
    const { data: assignments, error } = await getStudentAssignments(courseId);

    // In a real app, we would also fetch the student's submissions to show status
    // For now, we'll just list the assignments

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <Link href={`/student/courses/${courseId}`} className="text-gray-500 hover:text-gray-900 flex items-center gap-2 transition-colors font-medium mb-4">
                    <ArrowLeft className="w-4 h-4" /> Volver al Curso
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Tareas del Curso</h1>
                <p className="text-gray-500 mt-1">Revisa y entrega tus actividades pendientes.</p>
            </div>

            {error ? (
                <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-600">
                    Error al cargar tareas: {error}
                </div>
            ) : assignments?.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-10 h-10 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No hay tareas asignadas</h3>
                    <p className="text-gray-500 mb-6">El profesor aún no ha publicado ninguna tarea para este curso.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {assignments?.map((assignment: any) => (
                        <Link
                            key={assignment.id}
                            href={`/student/courses/${courseId}/assignments/${assignment.id}`}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between hover:shadow-md hover:border-blue-200 transition-all group gap-4"
                        >
                            <div className="flex items-start gap-4">
                                <div className="bg-blue-50 p-3 rounded-xl text-blue-600 group-hover:bg-blue-100 transition-colors shrink-0">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors line-clamp-2">{assignment.title}</h3>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4 shrink-0" />
                                            Vence: {new Date(assignment.dueDate).toLocaleDateString()}
                                        </span>
                                        <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium self-start sm:self-auto">
                                            Módulo: {assignment.module.title}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-blue-600 font-medium text-sm self-end md:self-auto">
                                Ver Detalles <ArrowLeft className="w-4 h-4 rotate-180" />
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
