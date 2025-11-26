import { getAllCourses } from "@/actions/course-actions";
import { getTeachers } from "@/actions/user-actions";
import CourseManagementClient from "./course-management-client";

export default async function AdminCoursesPage() {
    const [coursesResult, teachersResult] = await Promise.all([
        getAllCourses(),
        getTeachers()
    ]);

    if (coursesResult.error || teachersResult.error) {
        return (
            <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-600">
                Error: {coursesResult.error || teachersResult.error}
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            <CourseManagementClient
                initialCourses={coursesResult.data || []}
                teachers={teachersResult.data || []}
            />
        </div>
    );
}
