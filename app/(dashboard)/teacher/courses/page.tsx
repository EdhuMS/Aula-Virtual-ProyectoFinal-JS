import { getTeacherCourses } from "@/actions/course-actions";
import TeacherCoursesList from "@/components/teacher/teacher-courses-list";

export default async function TeacherCoursesPage() {
    const { data: courses, error } = await getTeacherCourses();

    if (error) {
        return (
            <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-600">
                Error: {error}
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                        Mis Cursos
                    </h1>
                    <p className="text-gray-500 mt-2 text-lg">
                        Gestiona el contenido y las evaluaciones de tus cursos asignados.
                    </p>
                </div>
            </div>

            <TeacherCoursesList courses={courses || []} />
        </div>
    );
}
