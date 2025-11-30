import { getLesson } from "@/actions/module-actions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LessonView from "@/components/lesson-view";

export default async function TeacherLessonPreviewPage({ params }: { params: Promise<{ courseId: string; lessonId: string }> }) {
    const { courseId, lessonId } = await params;

    // Usar getLesson que permite profesores
    const { data: lesson, error } = await getLesson(lessonId);

    if (error || !lesson) {
        return (
            <div className="p-8">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-2xl mx-auto">
                    <h3 className="text-red-800 font-bold text-lg mb-2">Error</h3>
                    <p className="text-red-600 mb-6">{error || "Lección no encontrada"}</p>
                    <Link href={`/teacher/courses/${courseId}`} className="inline-flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 font-medium transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Volver al Curso
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <LessonView
            lesson={lesson}
            courseId={courseId}
            backLink={`/teacher/courses/${courseId}`}
            isPreview={true}
        />
    );
}
