"use client";

import { useEffect, useState } from "react";
import { getStudentModules } from "@/actions/module-actions";
import Link from "next/link";
import { ArrowLeft, HelpCircle, CheckCircle, Clock, AlertCircle, ChevronRight } from "lucide-react";

export default function StudentQuizzesPage({ params }: { params: Promise<{ courseId: string }> }) {
    const [courseId, setCourseId] = useState("");
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        params.then(async (resolvedParams) => {
            setCourseId(resolvedParams.courseId);
            const response = await getStudentModules(resolvedParams.courseId);
            if (response.success && response.data) {
                // Extract quizzes from modules
                const allQuizzes = response.data.flatMap((module: any) => module.quizzes || []);
                setQuizzes(allQuizzes);
            }
            setLoading(false);
        });
    }, [params]);

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando cuestionarios...</div>;

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="mb-8">
                <Link
                    href={`/student/courses/${courseId}`}
                    className="text-gray-500 hover:text-gray-900 flex items-center gap-2 transition-colors font-medium"
                >
                    <ArrowLeft className="w-4 h-4" /> Volver al Curso
                </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                <div className="bg-purple-50 border-b border-purple-100 p-8 flex items-center gap-4">
                    <div className="bg-purple-100 p-3 rounded-xl text-purple-600">
                        <HelpCircle className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Cuestionarios</h1>
                        <p className="text-purple-600 font-medium">Evaluaciones y prácticas del curso</p>
                    </div>
                </div>

                <div className="p-8">
                    {quizzes.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No hay cuestionarios disponibles en este momento.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {quizzes.map((quiz) => {
                                const attempt = quiz.attempts?.[0];
                                const isCompleted = !!attempt;
                                const now = new Date();
                                const opensAt = quiz.opensAt ? new Date(quiz.opensAt) : null;
                                const closesAt = quiz.closesAt ? new Date(quiz.closesAt) : null;
                                const isOpen = (!opensAt || now >= opensAt) && (!closesAt || now <= closesAt);
                                const isClosed = closesAt && now > closesAt;

                                return (
                                    <Link
                                        key={quiz.id}
                                        href={`/student/courses/${courseId}/quizzes/${quiz.id}`}
                                        className="block group"
                                    >
                                        <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all hover:border-purple-300 bg-white relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500 opacity-100" />

                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="flex items-start gap-4">
                                                    <div className={`p-3 rounded-xl shrink-0 ${isCompleted ? 'bg-green-100 text-green-600' : 'bg-purple-50 text-purple-600'}`}>
                                                        {isCompleted ? <CheckCircle className="w-6 h-6" /> : <HelpCircle className="w-6 h-6" />}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-purple-700 transition-colors line-clamp-2">
                                                            {quiz.title}
                                                        </h3>
                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1 text-sm">
                                                            {isCompleted ? (
                                                                <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-lg self-start">
                                                                    Calificación: {attempt.score} / 20
                                                                </span>
                                                            ) : (
                                                                <>
                                                                    {isClosed ? (
                                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                                                            <span className="text-red-500 flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded-lg font-bold self-start">
                                                                                NS (0 pts)
                                                                            </span>
                                                                            <span className="text-gray-500 text-xs">
                                                                                Cerrado el {closesAt?.toLocaleDateString()}
                                                                            </span>
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-green-600 flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-lg self-start">
                                                                            <Clock className="w-3 h-3" /> Disponible
                                                                        </span>
                                                                    )}
                                                                    {closesAt && !isClosed && (
                                                                        <span className="text-gray-500 text-xs sm:text-sm">
                                                                            Cierra: {closesAt.toLocaleDateString()} {closesAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                        </span>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="text-gray-300 group-hover:text-purple-500 transition-colors self-end md:self-center">
                                                    <ChevronRight className="w-6 h-6" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
