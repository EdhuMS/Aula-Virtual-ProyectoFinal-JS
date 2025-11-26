import { getCourseAssignments, deleteAssignment } from "@/actions/assignment-actions";
import Link from "next/link";
import { ArrowLeft, Plus, Calendar, FileText, Trash2, Users } from "lucide-react";
import { DeleteAssignmentButton } from "./delete-button";

export default async function AssignmentsManager({ courseId }: { courseId: string }) {
    const { data: assignments, error } = await getCourseAssignments(courseId);

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <Link href={`/teacher/courses/${courseId}`} className="text-gray-500 hover:text-gray-900 flex items-center gap-2 transition-colors font-medium mb-4">
                        <ArrowLeft className="w-4 h-4" /> Volver al Curso
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Tareas</h1>
                    <p className="text-gray-500 mt-1">Gestiona las entregas y calificaciones de tus estudiantes.</p>
                </div>
                <Link
                    href={`/teacher/courses/${courseId}/assignments/new`}
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all font-medium"
                >
                    <Plus className="w-5 h-5" /> Nueva Tarea
                </Link>
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
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No hay tareas creadas</h3>
                    <p className="text-gray-500 mb-6">Crea la primera tarea para que tus estudiantes puedan subir sus trabajos.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {assignments?.map((assignment: any) => (
                        <div key={assignment.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between hover:shadow-md transition-shadow gap-4">
                            <div className="flex items-start gap-4">
                                <div className="bg-blue-100 p-3 rounded-xl text-blue-600 flex-shrink-0">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-gray-900 text-lg break-words">{assignment.title}</h3>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            Vence: {new Date(assignment.dueDate).toLocaleDateString()}
                                        </span>
                                        <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium w-fit">
                                            Módulo: {assignment.module.title}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-50">
                                <div className="text-right mr-4">
                                    <div className="text-2xl font-bold text-gray-900">{assignment._count.submissions}</div>
                                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Entregas</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/teacher/courses/${courseId}/assignments/${assignment.id}/submissions`}
                                        className="text-gray-400 hover:text-green-600 p-2 hover:bg-green-50 rounded-lg transition-colors"
                                        title="Ver Entregas y Calificar"
                                    >
                                        <Users className="w-5 h-5" />
                                    </Link>
                                    <Link
                                        href={`/teacher/courses/${courseId}/assignments/${assignment.id}`}
                                        className="text-gray-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Editar Tarea"
                                    >
                                        <FileText className="w-5 h-5" />
                                    </Link>
                                    <DeleteAssignmentButton assignmentId={assignment.id} courseId={courseId} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
