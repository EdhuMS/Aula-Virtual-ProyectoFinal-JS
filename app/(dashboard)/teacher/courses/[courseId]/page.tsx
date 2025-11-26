import TeacherCourseDashboard from "./teacher-course-dashboard";

export default async function CourseManagePage({ params }: { params: Promise<{ courseId: string }> }) {
    const { courseId } = await params;
    return <TeacherCourseDashboard courseId={courseId} />;
}
