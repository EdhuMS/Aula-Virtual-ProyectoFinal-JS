import { getStudentLesson } from "@/actions/module-actions";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, PlayCircle, FileText } from "lucide-react";
import { redirect } from "next/navigation";

export default async function LessonPage({ params }: { params: Promise<{ courseId: string; lessonId: string }> }) {
    const { courseId, lessonId } = await params;
    const { data, error } = await getStudentLesson(courseId, lessonId);

    if (error || !data) {
        return (
            <div className="p-8">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-2xl mx-auto">
                    <h3 className="text-red-800 font-bold text-lg mb-2">Error</h3>
                    <p className="text-red-600 mb-6">{error || "Lección no encontrada"}</p>
                    <Link href={`/student/courses/${courseId}`} className="inline-flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 font-medium transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Volver al Curso
                    </Link>
                </div>
            </div>
        );
    }

    const { lesson, nextLessonId, prevLessonId } = data;

    // Helper to extract YouTube ID
    const getYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const youtubeId = lesson.resourceUrl ? getYoutubeId(lesson.resourceUrl) : null;

    return (
        <div className="max-w-4xl mx-auto pb-12">
            {/* Header / Navigation */}
            <div className="mb-6 flex items-center justify-between">
                <Link
                    href={`/student/courses/${courseId}`}
                    className="text-gray-500 hover:text-gray-900 flex items-center gap-2 transition-colors font-medium"
                >
                    <ArrowLeft className="w-4 h-4" /> Volver al Temario
                </Link>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                {/* Video Player or Header */}
                <div className="bg-gray-900 aspect-video flex items-center justify-center relative group overflow-hidden">
                    {youtubeId ? (
                        <iframe
                            className="w-full h-full absolute inset-0"
                            src={`https://www.youtube.com/embed/${youtubeId}`}
                            title={lesson.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    ) : lesson.resourceUrl ? (
                        <div className="text-center p-8">
                            <a
                                href={lesson.resourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex flex-col items-center group/link"
                            >
                                <PlayCircle className="w-20 h-20 text-white/80 group-hover/link:text-white transition-colors mb-4" />
                                <span className="text-white font-medium hover:underline">Abrir Recurso Externo</span>
                                <span className="text-gray-400 text-sm mt-1 max-w-md truncate">{lesson.resourceUrl}</span>
                            </a>
                        </div>
                    ) : (
                        <div className="text-center p-10">
                            <div className="bg-white/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                                <FileText className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-white max-w-2xl mx-auto px-4">{lesson.title}</h2>
                        </div>
                    )}
                </div>

                <div className="p-8 md:p-10">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">{lesson.title}</h1>

                    <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed">
                        {lesson.content ? (
                            <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
                        ) : (
                            <p className="italic text-gray-400">Esta lección no tiene contenido de texto adicional.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Navigation */}
            <div className="flex justify-between items-center gap-4">
                {prevLessonId ? (
                    <Link
                        href={`/student/courses/${courseId}/lessons/${prevLessonId}`}
                        className="flex-1 bg-white border border-gray-200 p-4 rounded-xl hover:border-blue-300 hover:shadow-md transition-all group flex items-center gap-3"
                    >
                        <div className="bg-gray-50 p-2 rounded-lg group-hover:bg-blue-50 text-gray-400 group-hover:text-blue-600 transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Anterior</div>
                            <div className="font-bold text-gray-700 group-hover:text-blue-700">Lección Anterior</div>
                        </div>
                    </Link>
                ) : (
                    <div className="flex-1"></div> // Spacer
                )}

                {nextLessonId ? (
                    <Link
                        href={`/student/courses/${courseId}/lessons/${nextLessonId}`}
                        className="flex-1 bg-white border border-gray-200 p-4 rounded-xl hover:border-blue-300 hover:shadow-md transition-all group flex items-center justify-end gap-3 text-right"
                    >
                        <div className="text-right">
                            <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Siguiente</div>
                            <div className="font-bold text-gray-700 group-hover:text-blue-700">Siguiente Lección</div>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-lg group-hover:bg-blue-50 text-gray-400 group-hover:text-blue-600 transition-colors">
                            <ChevronRight className="w-5 h-5" />
                        </div>
                    </Link>
                ) : (
                    <div className="flex-1"></div> // Spacer
                )}
            </div>
        </div>
    );
}
