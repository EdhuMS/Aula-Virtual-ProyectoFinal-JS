"use client";

import { useEffect, useState } from "react";
import { getQuiz, updateQuiz } from "@/actions/quiz-actions";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Save, CheckCircle, Circle, HelpCircle, Calendar, Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Modal } from "@/components/ui/modal";

export default function EditQuizPage({ params }: { params: Promise<{ courseId: string; quizId: string }> }) {
    const [loading, setLoading] = useState(true);
    const [courseId, setCourseId] = useState("");
    const [quizId, setQuizId] = useState("");
    const [quizTitle, setQuizTitle] = useState("");

    // Estado de configuración del cuestionario
    const [opensAt, setOpensAt] = useState("");
    const [closesAt, setClosesAt] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Estado de las preguntas (Local)
    const [questions, setQuestions] = useState<any[]>([]);

    // Estado del formulario de nueva pregunta
    const [questionText, setQuestionText] = useState("");
    const [options, setOptions] = useState(["", ""]);
    const [correctOption, setCorrectOption] = useState(0);
    const [points, setPoints] = useState(1);

    // Estados de los modales
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [deleteQuestionIndex, setDeleteQuestionIndex] = useState<number | null>(null);

    const router = useRouter();

    useEffect(() => {
        params.then(async (resolvedParams) => {
            setCourseId(resolvedParams.courseId);
            setQuizId(resolvedParams.quizId);
            loadQuiz(resolvedParams.quizId);
        });
    }, [params]);

    const loadQuiz = async (id: string) => {
        const response = await getQuiz(id);
        if (response.success && response.data) {
            setQuizTitle(response.data.title);

            // Helper para formatear fecha para entrada datetime-local (YYYY-MM-DDTHH:mm)
            // ajustando para el huso horario local
            const formatDateForInput = (dateString: Date) => {
                const date = new Date(dateString);
                const offset = date.getTimezoneOffset();
                const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
                return adjustedDate.toISOString().slice(0, 16);
            };

            if (response.data.opensAt) setOpensAt(formatDateForInput(response.data.opensAt));
            if (response.data.closesAt) setClosesAt(formatDateForInput(response.data.closesAt));

            setQuestions(response.data.questions || []);
        }
        setLoading(false);
    };

    const handleSaveAll = async () => {
        setIsSaving(true);
        try {
            const result = await updateQuiz(quizId, courseId, {
                title: quizTitle,
                opensAt: opensAt ? new Date(opensAt) : null,
                closesAt: closesAt ? new Date(closesAt) : null,
                questions: questions.map(q => ({
                    id: q.id, // Pasar ID si existe (para actualizar), undefined para nuevo
                    question: q.question,
                    options: q.options,
                    correctOption: q.correctOption,
                    points: q.points || 1
                }))
            });

            if (result.success) {
                router.push(`/teacher/courses/${courseId}`);
                router.refresh();
            } else {
                console.error("Error saving quiz:", result.error);
                setErrorMessage(`Error al guardar el cuestionario: ${result.error || "Error desconocido"}`);
                setIsSaving(false);
            }
        } catch (error) {
            console.error("Unexpected error saving quiz:", error);
            setErrorMessage("Error inesperado al guardar el cuestionario");
            setIsSaving(false);
        }
    };

    const handleAddOption = () => {
        setOptions([...options, ""]);
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleRemoveOption = (index: number) => {
        if (options.length <= 2) return;
        const newOptions = options.filter((_, i) => i !== index);
        setOptions(newOptions);
        if (correctOption >= index && correctOption > 0) {
            setCorrectOption(correctOption - 1);
        }
    };

    const handleAddQuestionLocal = (e: React.FormEvent) => {
        e.preventDefault();
        if (!questionText.trim()) return;
        if (options.some(opt => !opt.trim())) {
            setErrorMessage("Por favor completa todas las opciones");
            return;
        }

        const newQuestion = {
            // Sin ID para nuevas preguntas aún
            question: questionText,
            options: [...options],
            correctOption: correctOption,
            points: points
        };

        setQuestions([...questions, newQuestion]);

        // Resetear el formulario
        setQuestionText("");
        setOptions(["", ""]);
        setCorrectOption(0);
        setPoints(1);
    };

    const confirmDeleteQuestion = () => {
        if (deleteQuestionIndex !== null) {
            const newQuestions = questions.filter((_, i) => i !== deleteQuestionIndex);
            setQuestions(newQuestions);
            setDeleteQuestionIndex(null);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando cuestionario...</div>;

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="mb-8 flex justify-between items-center">
                <Link
                    href={`/teacher/courses/${courseId}`}
                    className="text-gray-500 hover:text-gray-900 flex items-center gap-2 transition-colors font-medium"
                >
                    <ArrowLeft className="w-4 h-4" /> Volver al Curso
                </Link>
                <button
                    onClick={handleSaveAll}
                    disabled={isSaving}
                    className="bg-green-600 text-white px-6 py-2.5 rounded-xl hover:bg-green-700 font-bold shadow-lg shadow-green-600/20 flex items-center gap-2 transition-all disabled:opacity-70"
                >
                    <Save className="w-5 h-5" />
                    {isSaving ? "Guardando..." : "Guardar y Salir"}
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                <div className="bg-purple-50 border-b border-purple-100 p-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-purple-100 p-3 rounded-xl text-purple-600">
                                <HelpCircle className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{quizTitle}</h1>
                                <p className="text-purple-600 font-medium">Editor de Preguntas</p>
                            </div>
                        </div>
                    </div>

                    {/* Configuración de programación */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/50 p-6 rounded-xl border border-purple-100">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-purple-600" /> Fecha de Apertura
                            </label>
                            <input
                                type="datetime-local"
                                value={opensAt}
                                onChange={(e) => setOpensAt(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                            />
                            <p className="text-xs text-gray-500 mt-1">Cuándo podrán los estudiantes ver y responder el cuestionario.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-purple-600" /> Fecha de Cierre
                            </label>
                            <input
                                type="datetime-local"
                                value={closesAt}
                                onChange={(e) => setClosesAt(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                            />
                            <p className="text-xs text-gray-500 mt-1">Fecha límite para enviar respuestas.</p>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    {/* Formulario de nueva pregunta */}
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-10">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-purple-600" /> Nueva Pregunta
                        </h3>
                        <form onSubmit={handleAddQuestionLocal} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="md:col-span-3">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Enunciado de la Pregunta</label>
                                    <input
                                        type="text"
                                        value={questionText}
                                        onChange={(e) => setQuestionText(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                                        placeholder="¿Cuál es la capital de Francia?"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Puntos</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={points}
                                        onChange={(e) => setPoints(parseInt(e.target.value) || 1)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all text-center font-bold text-purple-600"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-gray-700">Opciones de Respuesta</label>
                                {options.map((option, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setCorrectOption(index)}
                                            className={`p-2 rounded-full transition-colors ${correctOption === index ? 'text-green-500 bg-green-50' : 'text-gray-300 hover:text-gray-400'}`}
                                            title="Marcar como correcta"
                                        >
                                            {correctOption === index ? <CheckCircle className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                                        </button>
                                        <input
                                            type="text"
                                            value={option}
                                            onChange={(e) => handleOptionChange(index, e.target.value)}
                                            className={`flex-1 px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all ${correctOption === index ? 'border-green-300 bg-green-50/30' : 'border-gray-300'}`}
                                            placeholder={`Opción ${index + 1}`}
                                            required
                                        />
                                        {options.length > 2 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveOption(index)}
                                                className="text-gray-400 hover:text-red-500 p-2"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={handleAddOption}
                                    className="text-purple-600 text-sm font-bold hover:text-purple-700 flex items-center gap-1 mt-2 px-2"
                                >
                                    <Plus className="w-4 h-4" /> Añadir Opción
                                </button>
                            </div>

                            <div className="pt-4 border-t border-gray-200 flex justify-end">
                                <button
                                    type="submit"
                                    className="bg-purple-600 text-white px-8 py-3 rounded-xl hover:bg-purple-700 font-bold shadow-lg shadow-purple-600/20 flex items-center gap-2 transition-all"
                                >
                                    <Plus className="w-5 h-5" />
                                    Añadir a la Lista
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Lista de preguntas */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">
                            Preguntas ({questions.length})
                        </h3>

                        {questions.length === 0 ? (
                            <div className="text-center py-10 text-gray-500 italic">
                                No hay preguntas añadidas todavía.
                            </div>
                        ) : (
                            questions.map((q: any, qIndex: number) => (
                                <div key={q.id || qIndex} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow relative group">
                                    <div className="absolute top-4 right-4">
                                        <button
                                            onClick={() => setDeleteQuestionIndex(qIndex)}
                                            className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Eliminar Pregunta"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="flex items-start justify-between pr-12">
                                        <h4 className="font-bold text-gray-900 mb-4">
                                            <span className="text-purple-600 mr-2">{qIndex + 1}.</span>
                                            {q.question}
                                        </h4>
                                        <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-lg whitespace-nowrap">
                                            {q.points || 1} Puntos
                                        </span>
                                    </div>

                                    <div className="space-y-2 pl-6">
                                        {Array.isArray(q.options) && q.options.map((opt: string, optIndex: number) => (
                                            <div key={optIndex} className={`flex items-center gap-3 text-sm ${q.correctOption === optIndex ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                                                {q.correctOption === optIndex ? (
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <Circle className="w-4 h-4 text-gray-300" />
                                                )}
                                                {opt}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de confirmación de eliminación */}
            <Modal
                isOpen={deleteQuestionIndex !== null}
                onClose={() => setDeleteQuestionIndex(null)}
                title="Eliminar Pregunta"
            >
                <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-red-50 rounded-xl border border-red-100 text-red-700">
                        <AlertTriangle className="w-10 h-10 flex-shrink-0" />
                        <div>
                            <h4 className="font-bold">¿Estás seguro?</h4>
                            <p className="text-sm mt-1">
                                ¿Estás seguro de eliminar esta pregunta?
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setDeleteQuestionIndex(null)}
                            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={confirmDeleteQuestion}
                            className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-xl hover:bg-red-700 font-semibold transition-colors"
                        >
                            Sí, Eliminar
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Error Modal */}
            <Modal
                isOpen={!!errorMessage}
                onClose={() => setErrorMessage(null)}
                title="Error"
            >
                <div className="text-center space-y-6">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <p className="text-gray-600 text-lg">
                        {errorMessage}
                    </p>
                    <button
                        onClick={() => setErrorMessage(null)}
                        className="w-full bg-gray-900 text-white px-4 py-2.5 rounded-xl hover:bg-gray-800 font-semibold transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </Modal>
        </div>
    );
}
