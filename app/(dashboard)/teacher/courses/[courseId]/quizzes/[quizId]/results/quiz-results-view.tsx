"use client";

import { useEffect, useState } from "react";
import { getQuizResults } from "@/actions/quiz-actions";
import Link from "next/link";
import { ArrowLeft, Search, Download, User, Calendar, CheckCircle, XCircle } from "lucide-react";

export default function QuizResultsView({ params }: { params: Promise<{ courseId: string; quizId: string }> }) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [courseId, setCourseId] = useState("");

    useEffect(() => {
        params.then(async (resolvedParams) => {
            setCourseId(resolvedParams.courseId);
            const response = await getQuizResults(resolvedParams.quizId);
            if (response.success) {
                setData(response.data);
            }
            setLoading(false);
        });
    }, [params]);

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando resultados...</div>;
    if (!data) return <div className="p-8 text-center text-gray-500">No se encontró el cuestionario.</div>;

    const filteredResults = data.results.filter((result: any) =>
        result.student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.student.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <div className="mb-8">
                <Link
                    href={`/teacher/courses/${courseId}`}
                    className="text-gray-500 hover:text-gray-900 flex items-center gap-2 transition-colors font-medium mb-4"
                >
                    <ArrowLeft className="w-4 h-4" /> Volver al Curso
                </Link>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{data.quizTitle}</h1>
                        <p className="text-gray-500">Resultados y Calificaciones</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar estudiante..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm w-64"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Estudiante</th>
                                <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha de Envío</th>
                                <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Calificación</th>
                                <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredResults.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-8 text-center text-gray-500 italic">
                                        No hay estudiantes registrados que coincidan con tu búsqueda.
                                    </td>
                                </tr>
                            ) : (
                                filteredResults.map((result: any) => (
                                    <tr key={result.student.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs">
                                                    {result.student.name?.[0] || <User className="w-4 h-4" />}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{result.student.name}</div>
                                                    <div className="text-xs text-gray-500">{result.student.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                {result.submittedAt ? new Date(result.submittedAt).toLocaleString() : "-"}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            {result.status === 'PENDING' ? (
                                                <span className="text-gray-400">-</span>
                                            ) : (
                                                <>
                                                    <span className="font-bold text-gray-900">{result.score}</span>
                                                    <span className="text-gray-400 text-xs"> / 20</span>
                                                </>
                                            )}
                                        </td>
                                        <td className="py-4 px-6">
                                            {result.status === 'COMPLETED' && (
                                                result.score >= 12 ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        <CheckCircle className="w-3 h-3" /> Aprobado
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        <XCircle className="w-3 h-3" /> Reprobado
                                                    </span>
                                                )
                                            )}
                                            {result.status === 'NS' && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-100">
                                                    <XCircle className="w-3 h-3" /> No Presentó
                                                </span>
                                            )}
                                            {result.status === 'PENDING' && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                    Pendiente
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
