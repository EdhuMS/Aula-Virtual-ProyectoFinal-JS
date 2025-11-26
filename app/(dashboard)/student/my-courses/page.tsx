import { getStudentCourses } from "@/actions/course-actions";
import StudentCoursesList from "@/components/student/student-courses-list";

export default async function StudentCoursesPage() {
    const { data: courses, error } = await getStudentCourses();

    if (error) {
        return (
            <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-600">
                Error: {error}
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                        Mis Cursos
                    </h1>
                    <p className="text-gray-500 mt-2 text-lg">
                        Continúa tu aprendizaje donde lo dejaste.
                    </p>
                </div>
            </div>

            <StudentCoursesList courses={courses || []} />
        </div>
    );
}
