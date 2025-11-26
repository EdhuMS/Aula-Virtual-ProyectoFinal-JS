import { getCourseModules } from "@/actions/module-actions";
import { getCourseById } from "@/actions/course-actions";
import CourseContentEditor from "./course-content-editor";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default async function TeacherCourseDashboard({ courseId }: { courseId: string }) {
    const { data: modules, error } = await getCourseModules(courseId);
    const { data: course, error: courseError } = await getCourseById(courseId);

    if (error || courseError) {
        return (
            <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-600">
                Error loading data: {error || courseError}
                <div className="mt-2 text-xs text-gray-500">Course ID: {courseId}</div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-600">
                Course not found.
                <div className="mt-2 text-xs text-gray-500">Course ID: {courseId}</div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-8">
                <Link href="/teacher/courses" className="text-gray-500 hover:text-gray-900 flex items-center gap-2 transition-colors font-medium">
                    <ArrowLeft className="w-4 h-4" /> Volver a Mis Cursos
                </Link>
            </div>

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
                <p className="text-gray-500 mt-2 max-w-2xl">{course.description}</p>
                <div className="flex gap-4 mt-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Estado: Activo
                    </div>
                    <Link
                        href={`/teacher/courses/${courseId}/assignments`}
                        className="flex items-center gap-2 text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                        <FileText className="w-4 h-4" />
                        Gestionar Tareas
                    </Link>
                </div>
            </div>

            <CourseContentEditor courseId={courseId} modules={modules || []} />
        </div>
    );
}
