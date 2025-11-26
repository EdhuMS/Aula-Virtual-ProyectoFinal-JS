import Link from "next/link";
import { BookOpen, User } from "lucide-react";

interface Course {
    id: string;
    title: string;
    description: string | null;
    teacher: {
        name: string | null;
    };
    _count: {
        modules: number;
    };
}

export default function StudentCoursesList({ courses }: { courses: Course[] }) {
    if (courses.length === 0) {
        return (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="w-10 h-10 text-blue-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No estás inscrito en cursos</h2>
                <p className="text-gray-500 max-w-md mx-auto">
                    Solicita un código de inscripción a tu profesor o espera a ser añadido a un curso.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
                <Link
                    href={`/student/courses/${course.id}`}
                    key={course.id}
                    className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full transform hover:-translate-y-1"
                >
                    <div className="h-48 bg-gradient-to-br from-blue-500 to-indigo-600 relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                        <div className="absolute bottom-4 left-4 right-4">
                            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-medium text-white mb-2 border border-white/30">
                                Curso
                            </span>
                            <h2 className="text-xl font-bold text-white line-clamp-2 leading-tight">
                                {course.title}
                            </h2>
                        </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                        <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-1">
                            {course.description}
                        </p>

                        <div className="space-y-3 pt-4 border-t border-gray-100">
                            <div className="flex items-center text-sm text-gray-500">
                                <User className="w-4 h-4 mr-2 text-blue-500" />
                                <span className="truncate">{course.teacher.name || "Sin profesor"}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                                <BookOpen className="w-4 h-4 mr-2 text-indigo-500" />
                                <span>{course._count.modules} Módulos</span>
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
