import { getCourseEnrollments, getStudentsNotEnrolled } from "@/actions/enrollment-actions";
import EnrollmentManager from "./enrollment-manager";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function CourseEnrollmentsPage({ params }: { params: Promise<{ courseId: string }> }) {
    const { courseId } = await params;
    const { data: enrollments } = await getCourseEnrollments(courseId);
    const { data: availableStudents } = await getStudentsNotEnrolled(courseId);

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <Link href="/admin/courses" className="text-gray-500 hover:text-gray-900 flex items-center gap-2 transition-colors font-medium">
                    <ArrowLeft className="w-4 h-4" /> Volver a Cursos
                </Link>
            </div>

            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900">Gestión de Inscripciones</h1>
                <p className="text-gray-500 mt-2">Administra los estudiantes que tienen acceso a este curso.</p>
            </div>

            <EnrollmentManager
                courseId={courseId}
                enrolledStudents={enrollments || []}
                availableStudents={availableStudents || []}
            />
        </div>
    );
}
