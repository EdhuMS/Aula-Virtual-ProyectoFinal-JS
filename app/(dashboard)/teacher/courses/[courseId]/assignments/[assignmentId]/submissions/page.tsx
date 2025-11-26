import { getAssignment, getAssignmentSubmissions } from "@/actions/assignment-actions";
import Link from "next/link";
import { ArrowLeft, FileText, User, Calendar, CheckCircle, XCircle, Clock } from "lucide-react";

export default async function AssignmentSubmissionsPage({ params }: { params: Promise<{ courseId: string; assignmentId: string }> }) {
    const { courseId, assignmentId } = await params;
    const [assignmentResult, submissionsResult] = await Promise.all([
        getAssignment(assignmentId),
        getAssignmentSubmissions(assignmentId)
    ]);

    const assignment = assignmentResult.data;
    const submissions = submissionsResult.data || [];

    if (!assignment) return <div>Tarea no encontrada</div>;

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-8">
                <Link href={`/teacher/courses/${courseId}/assignments`} className="text-gray-500 hover:text-gray-900 flex items-center gap-2 transition-colors font-medium mb-4">
                    <ArrowLeft className="w-4 h-4" /> Volver a Tareas
                </Link>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{assignment.title}</h1>
                        <p className="text-gray-500 mt-1">Gestiona las calificaciones de los estudiantes.</p>
                    </div>
                    <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-bold text-sm">
                        {submissions.length} Entregas
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-700 text-sm">Estudiante</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 text-sm">Fecha de Entrega</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 text-sm">Estado</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 text-sm">Calificación</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 text-sm text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {submissions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No hay entregas para esta tarea aún.
                                    </td>
                                </tr>
                            ) : (
                                submissions.map((submission: any) => (
                                    <tr key={submission.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{submission.student.name}</div>
                                                    <div className="text-xs text-gray-500">{submission.student.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(submission.submittedAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {submission.grade !== null ? (
                                                <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1 rounded-lg text-xs font-bold">
                                                    <CheckCircle className="w-3 h-3" /> Calificado
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-lg text-xs font-bold">
                                                    <Clock className="w-3 h-3" /> Pendiente
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {submission.grade !== null ? `${submission.grade}/20` : "-"}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/teacher/courses/${courseId}/assignments/${assignmentId}/submissions/${submission.id}`}
                                                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                                            >
                                                Calificar
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
