"use client";

import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, PlayCircle, FileText } from "lucide-react";

interface LessonViewProps {
    lesson: any;
    courseId: string;
    nextItem?: { id: string; type: string } | null;
    prevItem?: { id: string; type: string } | null;
    backLink: string;
    isPreview?: boolean;
}

export default function LessonView({ lesson, courseId, nextItem, prevItem, backLink, isPreview = false }: LessonViewProps) {
    // Ayudante para extraer ID de YouTube
    const getYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const youtubeId = lesson.resourceUrl ? getYoutubeId(lesson.resourceUrl) : null;

    const getLink = (item: { id: string, type: string }) => {
        if (isPreview) return "#"; // Deshabilitar navegación en vista previa
        switch (item.type) {
            case 'lesson': return `/student/courses/${courseId}/lessons/${item.id}`;
            case 'assignment': return `/student/courses/${courseId}/assignments/${item.id}`;
            case 'quiz': return `/student/courses/${courseId}/quizzes/${item.id}`;
            default: return '#';
        }
    };

    const getLabel = (item: { type: string }) => {
        switch (item.type) {
            case 'lesson': return 'Lección';
            case 'assignment': return 'Tarea';
            case 'quiz': return 'Cuestionario';
            default: return 'Siguiente';
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-12">
            {/* Encabezado / Navegación */}
            <div className="mb-6 flex items-center justify-between">
                <Link
                    href={backLink}
                    className="text-gray-500 hover:text-gray-900 flex items-center gap-2 transition-colors font-medium"
                >
                    <ArrowLeft className="w-4 h-4" /> Volver al Curso
                </Link>
                {isPreview && (
                    <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        Modo Vista Previa
                    </div>
                )}
            </div>

            {/* Tarjeta de Contenido Principal */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                {/* Reproductor de Video o Encabezado */}
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

            {/* Navegación de Pie de Página - Solo mostrar si no es vista previa */}
            {!isPreview && (
                <div className="flex justify-between items-center gap-4">
                    {prevItem ? (
                        <Link
                            href={getLink(prevItem)}
                            className="flex-1 bg-white border border-gray-200 p-4 rounded-xl hover:border-blue-300 hover:shadow-md transition-all group flex items-center gap-3"
                        >
                            <div className="bg-gray-50 p-2 rounded-lg group-hover:bg-blue-50 text-gray-400 group-hover:text-blue-600 transition-colors">
                                <ChevronLeft className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Anterior</div>
                                <div className="font-bold text-gray-700 group-hover:text-blue-700">{getLabel(prevItem)} Anterior</div>
                            </div>
                        </Link>
                    ) : (
                        <div className="flex-1"></div> // Espaciador
                    )}

                    {nextItem ? (
                        <Link
                            href={getLink(nextItem)}
                            className="flex-1 bg-white border border-gray-200 p-4 rounded-xl hover:border-blue-300 hover:shadow-md transition-all group flex items-center justify-end gap-3 text-right"
                        >
                            <div className="text-right">
                                <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Siguiente</div>
                                <div className="font-bold text-gray-700 group-hover:text-blue-700">Siguiente {getLabel(nextItem)}</div>
                            </div>
                            <div className="bg-gray-50 p-2 rounded-lg group-hover:bg-blue-50 text-gray-400 group-hover:text-blue-600 transition-colors">
                                <ChevronRight className="w-5 h-5" />
                            </div>
                        </Link>
                    ) : (
                        <div className="flex-1"></div> // Espaciador
                    )}
                </div>
            )}
        </div>
    );
}
