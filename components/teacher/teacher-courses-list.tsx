import Link from "next/link";
import { BookOpen, Users, ArrowRight } from "lucide-react";

interface Course {
    id: string;
    title: string;
    description: string | null;
    _count: {
        modules: number;
        enrollments: number;
    };
}

export default function TeacherCoursesList({ courses }: { courses: Course[] }) {
    if (courses.length === 0) {
        return (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="w-10 h-10 text-indigo-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No tienes cursos asignados</h2>
                <p className="text-gray-500 max-w-md mx-auto">
                    Contacta al administrador para que te asigne cursos.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
                <div key={course.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full group">
                    <div className="h-40 bg-gradient-to-r from-slate-800 to-slate-900 relative p-6 flex flex-col justify-end">
                        <h2 className="text-xl font-bold text-white mb-1">{course.title}</h2>
                        <div className="w-12 h-1 bg-blue-500 rounded-full"></div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                        <p className="text-gray-600 text-sm line-clamp-2 mb-6 flex-1">
                            {course.description}
                        </p>

                        <div className="flex justify-between items-center text-sm text-gray-500 mb-6 bg-gray-50 p-3 rounded-lg">
                            <span className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-blue-600" />
                                <span className="font-medium">{course._count.modules}</span> Módulos
                            </span>
                            <span className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-indigo-600" />
                                <span className="font-medium">{course._count.enrollments}</span> Alumnos
                            </span>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <Link
                                href={`/teacher/courses/${course.id}`}
                                className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 font-medium text-center transition-colors flex items-center justify-center gap-2 group-hover:bg-blue-700"
                            >
                                Gestionar Contenido
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
