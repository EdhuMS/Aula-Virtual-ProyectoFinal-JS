import { getStudentModules } from "@/actions/module-actions";
import Link from "next/link";
import { ArrowLeft, BookOpen, FileText, ChevronRight, CheckCircle, HelpCircle } from "lucide-react";

export default async function StudentCourseDashboard({ courseId }: { courseId: string }) {
    const { data: modules, error } = await getStudentModules(courseId);

    if (error) {
        return (
            <div className="p-8">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-2xl mx-auto">
                    <h3 className="text-red-800 font-bold text-lg mb-2">Acceso Denegado</h3>
                    <p className="text-red-600 mb-6">{error}</p>
                    <Link href="/student/my-courses" className="inline-flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 font-medium transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Volver a Mis Cursos
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="mb-8">
                <Link href="/student/my-courses" className="text-gray-500 hover:text-gray-900 flex items-center gap-2 transition-colors font-medium">
                    <ArrowLeft className="w-4 h-4" /> Volver a Mis Cursos
                </Link>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-10 text-white flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl text-white font-bold mb-2">Contenido del Curso</h1>
                        <p className="text-blue-100 text-lg">Explora los módulos y lecciones disponibles.</p>
                    </div>
                    <Link
                        href={`/student/courses/${courseId}/assignments`}
                        className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl backdrop-blur-sm transition-all font-bold flex items-center gap-2 border border-white/20"
                    >
                        <FileText className="w-5 h-5" />
                        Ver Tareas
                    </Link>
                    <Link
                        href={`/student/courses/${courseId}/quizzes`}
                        className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl backdrop-blur-sm transition-all font-bold flex items-center gap-2 border border-white/20 ml-3"
                    >
                        <HelpCircle className="w-5 h-5" />
                        Ver Cuestionarios
                    </Link>
                </div>

                <div className="p-8 bg-gray-50/50 min-h-[400px]">
                    {modules?.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
                                <BookOpen className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Aún no hay contenido</h3>
                            <p className="text-gray-500 font-medium">El profesor aún no ha publicado módulos para este curso.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {modules?.map((module: any) => (
                                <div key={module.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    <div className="bg-white p-5 border-b border-gray-100 flex justify-between items-center">
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg">{module.title}</h3>
                                            {module.description && <p className="text-gray-500 text-sm mt-1">{module.description}</p>}
                                        </div>
                                        <span className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100">
                                            {module.lessons.length} Lecciones
                                        </span>
                                    </div>
                                    <div className="divide-y divide-gray-50">
                                        {module.lessons.map((lesson: any) => (
                                            <Link
                                                key={lesson.id}
                                                href={`/student/courses/${courseId}/lessons/${lesson.id}`}
                                                className="block"
                                            >
                                                <div className="p-4 hover:bg-blue-50/50 transition-colors flex items-center gap-4 group cursor-pointer">
                                                    <div className="bg-gray-100 p-2.5 rounded-xl text-gray-500 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-700 group-hover:text-blue-700 transition-colors">{lesson.title}</h4>
                                                    </div>
                                                    <div className="text-purple-400">
                                                        <ChevronRight className="w-5 h-5" />
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                        {module.assignments?.map((assignment: any) => (
                                            <Link
                                                key={assignment.id}
                                                href={`/student/courses/${courseId}/assignments/${assignment.id}`}
                                                className="block"
                                            >
                                                <div className="p-4 hover:bg-orange-50/50 transition-colors flex items-center gap-4 group cursor-pointer border-l-4 border-l-transparent hover:border-l-orange-400">
                                                    <div className="bg-orange-100 p-2.5 rounded-xl text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-sm">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-700 group-hover:text-orange-700 transition-colors">{assignment.title}</h4>
                                                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                                            <span className="bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded border border-orange-100">Tarea</span>
                                                            {assignment.submissions?.length > 0 ? (
                                                                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border border-green-200 shadow-sm">
                                                                    <CheckCircle className="w-3 h-3" /> Entregado
                                                                </span>
                                                            ) : (
                                                                <span>Vence: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-orange-400">
                                                        <ChevronRight className="w-5 h-5" />
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                        {module.quizzes?.map((quiz: any) => (
                                            <Link
                                                key={quiz.id}
                                                href={`/student/courses/${courseId}/quizzes/${quiz.id}`}
                                                className="block"
                                            >
                                                <div className="p-4 hover:bg-purple-50/50 transition-colors flex items-center gap-4 group cursor-pointer border-l-4 border-l-transparent hover:border-l-purple-400">
                                                    <div className="bg-purple-100 p-2.5 rounded-xl text-purple-600 group-hover:bg-purple-500 group-hover:text-white transition-all shadow-sm">
                                                        <HelpCircle className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-700 group-hover:text-purple-700 transition-colors">{quiz.title}</h4>
                                                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                                            <span className="bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded border border-purple-100">Cuestionario</span>
                                                            {quiz.attempts?.length > 0 ? (
                                                                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border border-green-200 shadow-sm">
                                                                    <CheckCircle className="w-3 h-3" /> Completado
                                                                </span>
                                                            ) : (
                                                                <>
                                                                    {quiz.closesAt && new Date(quiz.closesAt) < new Date() ? (
                                                                        <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium border border-red-200">Cerrado</span>
                                                                    ) : (
                                                                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium border border-green-200">Activo</span>
                                                                    )}
                                                                    {quiz.closesAt && new Date(quiz.closesAt) >= new Date() && (
                                                                        <span>• Cierra: {new Date(quiz.closesAt).toLocaleDateString()}</span>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-purple-400">
                                                        <ChevronRight className="w-5 h-5" />
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                        {module.lessons.length === 0 && (!module.assignments || module.assignments.length === 0) && (
                                            <div className="p-6 text-sm text-gray-400 italic text-center bg-gray-50/30">
                                                No hay contenido disponible en este módulo.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
