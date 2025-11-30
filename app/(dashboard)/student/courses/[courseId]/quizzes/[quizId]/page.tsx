"use client";

import { useEffect, useState } from "react";
import { getQuizForStudent, submitQuizAttempt } from "@/actions/quiz-actions";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, Clock, AlertCircle, HelpCircle, Send, AlertTriangle, XCircle } from "lucide-react";
import Link from "next/link";
import { Modal } from "@/components/ui/modal";

export default function StudentQuizPage({ params }: { params: Promise<{ courseId: string; quizId: string }> }) {
    const [loading, setLoading] = useState(true);
    const [courseId, setCourseId] = useState("");
    const [quizId, setQuizId] = useState("");
    const [quiz, setQuiz] = useState<any>(null);
    const [answers, setAnswers] = useState<{ [key: string]: number }>({});
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Modal states
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);

    const router = useRouter();

    useEffect(() => {
        params.then(async (resolvedParams) => {
            setCourseId(resolvedParams.courseId);
            setQuizId(resolvedParams.quizId);
            loadQuiz(resolvedParams.quizId, resolvedParams.courseId);
        });
    }, [params]);

    const loadQuiz = async (id: string, cId: string) => {
        const response = await getQuizForStudent(id, cId);
        if (response.success && response.data) {
            setQuiz(response.data);
        } else {
            setError("No se pudo cargar el cuestionario.");
        }
        setLoading(false);
    };

    const handleOptionSelect = (questionId: string, optionIndex: number) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: optionIndex
        }));
    };

    const handlePreSubmit = () => {
        if (!quiz) return;

        // Validate all questions answered
        if (Object.keys(answers).length < quiz.questions.length) {
            setModalError("Por favor responde todas las preguntas antes de enviar.");
            return;
        }

        setShowConfirmModal(true);
    };

    const confirmSubmit = async () => {
        setShowConfirmModal(false);
        setSubmitting(true);
        const formattedAnswers = Object.entries(answers).map(([qId, optIdx]) => ({
            questionId: qId,
            selectedOption: optIdx
        }));

        const response = await submitQuizAttempt(quizId, courseId, formattedAnswers);

        if (response.success) {
            // Reload to show result view
            loadQuiz(quizId, courseId);
            window.scrollTo(0, 0);
        } else {
            setModalError(response.error || "Error al enviar el cuestionario. Inténtalo de nuevo.");
        }
        setSubmitting(false);
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando cuestionario...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!quiz) return <div className="p-8 text-center text-gray-500">Cuestionario no encontrado.</div>;

    // Check availability
    const now = new Date();
    const opensAt = quiz.opensAt ? new Date(quiz.opensAt) : null;
    const closesAt = quiz.closesAt ? new Date(quiz.closesAt) : null;

    const isTooEarly = opensAt && now < opensAt;

    const attempt = quiz.attempt;
    const isClosed = quiz.isClosed; // From backend

    const getLink = (item: { id: string, type: string }) => {
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

    // Helper for Navigation Buttons
    const NavigationButtons = () => (
        <div className="flex justify-between items-center gap-4 mt-8">
            {quiz.prevItem ? (
                <Link
                    href={getLink(quiz.prevItem)}
                    className="flex-1 bg-white border border-gray-200 p-4 rounded-xl hover:border-blue-300 hover:shadow-md transition-all group flex items-center gap-3"
                >
                    <div className="bg-gray-50 p-2 rounded-lg group-hover:bg-blue-50 text-gray-400 group-hover:text-blue-600 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                        <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Anterior</div>
                        <div className="font-bold text-gray-700 group-hover:text-blue-700">{getLabel(quiz.prevItem)} Anterior</div>
                    </div>
                </Link>
            ) : (
                <div className="flex-1"></div> // Spacer
            )}

            {quiz.nextItem ? (
                <Link
                    href={getLink(quiz.nextItem)}
                    className="flex-1 bg-white border border-gray-200 p-4 rounded-xl hover:border-blue-300 hover:shadow-md transition-all group flex items-center justify-end gap-3 text-right"
                >
                    <div className="text-right">
                        <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Siguiente</div>
                        <div className="font-bold text-gray-700 group-hover:text-blue-700">Siguiente {getLabel(quiz.nextItem)}</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg group-hover:bg-blue-50 text-gray-400 group-hover:text-blue-600 transition-colors">
                        <ArrowLeft className="w-5 h-5 rotate-180" />
                    </div>
                </Link>
            ) : (
                <div className="flex-1"></div> // Spacer
            )}
        </div>
    );

    // RENDER RESULT / REVIEW MODE
    if (attempt || isClosed) {
        const score = attempt ? attempt.score : 0;
        const maxScore = 20; // Fixed scale
        const percentage = Math.round((score / maxScore) * 100);
        const isNS = !attempt && isClosed;

        return (
            <div className="max-w-3xl mx-auto pb-12">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden text-center p-12 mb-8">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isNS ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        {isNS ? <AlertCircle className="w-10 h-10" /> : <CheckCircle className="w-10 h-10" />}
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {isNS ? "Cuestionario Cerrado (No Presentado)" : "¡Cuestionario Completado!"}
                    </h1>
                    <p className="text-gray-500 mb-8">{quiz.title}</p>

                    <div className="bg-gray-50 rounded-xl p-8 max-w-sm mx-auto mb-8 border border-gray-200">
                        <div className="text-sm text-gray-500 uppercase tracking-wide font-bold mb-2">Tu Calificación</div>
                        <div className="text-5xl font-bold text-gray-900 mb-2">{score} <span className="text-2xl text-gray-400">/ {maxScore}</span></div>
                        <div className={`inline-block px-4 py-1 rounded-full text-sm font-bold ${percentage >= 60 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {isNS ? 'No Presentó' : `${percentage}% - ${percentage >= 60 ? 'Aprobado' : 'Reprobado'}`}
                        </div>
                    </div>

                    <Link
                        href={`/student/courses/${courseId}`}
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-bold hover:underline"
                    >
                        <ArrowLeft className="w-4 h-4" /> Volver al Curso
                    </Link>
                </div>

                {/* REVIEW SECTION */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Revisión de Respuestas</h2>
                    {!isClosed ? (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center text-blue-800">
                            <Clock className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                            <p className="font-bold">El solucionario estará disponible cuando cierre el cuestionario.</p>
                            <p className="text-sm mt-1">Fecha de cierre: {closesAt?.toLocaleString()}</p>
                        </div>
                    ) : (
                        quiz.questions.map((q: any, index: number) => {
                            // Find user's answer if attempt exists
                            // attempt.answers is Json, need to cast/parse
                            const userAnswers = attempt?.answers as any[] || [];
                            const userAnswer = userAnswers.find((a: any) => a.questionId === q.id);
                            const selectedOption = userAnswer?.selectedOption;
                            const isCorrect = selectedOption === q.correctOption;

                            return (
                                <div key={q.id} className={`bg-white rounded-xl shadow-sm border p-6 ${!attempt ? 'border-gray-200' :
                                    isCorrect ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'
                                    }`}>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex gap-3">
                                        <span className="text-purple-600 bg-purple-50 w-8 h-8 flex items-center justify-center rounded-lg text-sm flex-shrink-0">
                                            {index + 1}
                                        </span>
                                        {q.question}
                                        <span className="ml-auto text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded h-fit">
                                            {q.points || 1} pts
                                        </span>
                                    </h3>
                                    <div className="space-y-3 pl-11">
                                        {q.options.map((option: string, optIndex: number) => {
                                            const isSelected = selectedOption === optIndex;
                                            const isTheCorrectAnswer = q.correctOption === optIndex;

                                            let optionClass = "border-gray-200";
                                            let icon = null;

                                            if (isTheCorrectAnswer) {
                                                optionClass = "border-green-500 bg-green-100 ring-1 ring-green-500";
                                                icon = <CheckCircle className="w-5 h-5 text-green-600" />;
                                            } else if (isSelected && !isTheCorrectAnswer) {
                                                optionClass = "border-red-500 bg-red-100 ring-1 ring-red-500";
                                                icon = <AlertCircle className="w-5 h-5 text-red-600" />;
                                            } else if (isSelected) {
                                                // Should be covered by correct case, but just in case
                                                optionClass = "border-purple-500 bg-purple-50";
                                            }

                                            return (
                                                <div
                                                    key={optIndex}
                                                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${optionClass}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className={`text-sm font-medium ${isTheCorrectAnswer ? 'text-green-900' : 'text-gray-700'}`}>
                                                            {option}
                                                        </span>
                                                    </div>
                                                    {icon}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
                <NavigationButtons />
            </div>
        );
    }

    // RENDER TAKE QUIZ MODE (Only if open and no attempt)

    if (isTooEarly) {
        return (
            <div className="max-w-2xl mx-auto mt-12 text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-200">
                <Clock className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Cuestionario No Disponible</h2>
                <p className="text-gray-500">Este cuestionario abrirá el {opensAt?.toLocaleString()}.</p>
                <Link href={`/student/courses/${courseId}`} className="mt-6 inline-block text-blue-600 font-medium hover:underline">Volver al Curso</Link>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto pb-12">
            <div className="mb-8">
                <Link
                    href={`/student/courses/${courseId}`}
                    className="text-gray-500 hover:text-gray-900 flex items-center gap-2 transition-colors font-medium mb-4"
                >
                    <ArrowLeft className="w-4 h-4" /> Volver al Curso
                </Link>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-start gap-4">
                    <div className="bg-purple-100 p-3 rounded-xl text-purple-600">
                        <HelpCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
                        <p className="text-gray-500 mt-1">Responde todas las preguntas y envía tus respuestas.</p>
                        {closesAt && (
                            <div className="mt-3 flex items-center gap-2 text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-lg inline-flex">
                                <Clock className="w-4 h-4" /> Cierra: {closesAt.toLocaleString()}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {quiz.questions.map((q: any, index: number) => (
                    <div key={q.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex gap-3">
                            <span className="text-purple-600 bg-purple-50 w-8 h-8 flex items-center justify-center rounded-lg text-sm flex-shrink-0">
                                {index + 1}
                            </span>
                            {q.question}
                            <span className="ml-auto text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded h-fit">
                                {q.points || 1} pts
                            </span>
                        </h3>
                        <div className="space-y-3 pl-11">
                            {q.options.map((option: string, optIndex: number) => (
                                <label
                                    key={optIndex}
                                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${answers[q.id] === optIndex
                                        ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500'
                                        : 'border-gray-200 hover:border-purple-200 hover:bg-gray-50'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name={`question-${q.id}`}
                                        value={optIndex}
                                        checked={answers[q.id] === optIndex}
                                        onChange={() => handleOptionSelect(q.id, optIndex)}
                                        className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                                    />
                                    <span className={`text-sm ${answers[q.id] === optIndex ? 'text-purple-900 font-medium' : 'text-gray-700'}`}>
                                        {option}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 flex justify-end">
                <button
                    onClick={handlePreSubmit}
                    disabled={submitting}
                    className="bg-purple-600 text-white px-8 py-4 rounded-xl hover:bg-purple-700 font-bold shadow-lg shadow-purple-600/20 flex items-center gap-2 transition-all disabled:opacity-70 text-lg"
                >
                    {submitting ? (
                        "Enviando..."
                    ) : (
                        <>
                            Enviar Respuestas <Send className="w-5 h-5" />
                        </>
                    )}
                </button>
            </div>

            <NavigationButtons />

            {/* Confirmation Modal */}
            <Modal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                title="Confirmar Envío"
            >
                <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl border border-purple-100 text-purple-700">
                        <HelpCircle className="w-10 h-10 flex-shrink-0" />
                        <div>
                            <h4 className="font-bold">¿Estás seguro?</h4>
                            <p className="text-sm mt-1">
                                ¿Estás seguro de enviar tus respuestas? No podrás modificarlas después.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowConfirmModal(false)}
                            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                        >
                            Revisar
                        </button>
                        <button
                            onClick={confirmSubmit}
                            className="flex-1 bg-purple-600 text-white px-4 py-2.5 rounded-xl hover:bg-purple-700 font-semibold transition-colors"
                        >
                            Sí, Enviar
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Error Modal */}
            <Modal
                isOpen={!!modalError}
                onClose={() => setModalError(null)}
                title="Atención"
            >
                <div className="text-center space-y-6">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <p className="text-gray-600 text-lg">
                        {modalError}
                    </p>
                    <button
                        onClick={() => setModalError(null)}
                        className="w-full bg-gray-900 text-white px-4 py-2.5 rounded-xl hover:bg-gray-800 font-semibold transition-colors"
                    >
                        Entendido
                    </button>
                </div>
            </Modal>
        </div>
    );
}
