import AssignmentsManager from "./assignments-manager";

export default async function AssignmentsPage({ params }: { params: Promise<{ courseId: string }> }) {
    const { courseId } = await params;
    return <AssignmentsManager courseId={courseId} />;
}
