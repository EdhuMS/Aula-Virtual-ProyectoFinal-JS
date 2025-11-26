import StudentCourseDashboard from "./student-course-dashboard";

export default async function StudentCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
    const { courseId } = await params;
    return <StudentCourseDashboard courseId={courseId} />;
}
