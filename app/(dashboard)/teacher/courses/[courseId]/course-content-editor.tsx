"use client";

import { useState } from "react";
import { createModule, deleteModule, createLesson, deleteLesson } from "@/actions/module-actions";
import { deleteAssignment } from "@/actions/assignment-actions";
import { createQuiz, deleteQuiz } from "@/actions/quiz-actions";
import { Plus, Trash2, ChevronDown, ChevronRight, FileText, Video, GripVertical, Edit, HelpCircle, BarChart, AlertTriangle, CheckCircle, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Modal } from "@/components/ui/modal";

export default function CourseContentEditor({ courseId, modules }: { courseId: string, modules: any[] }) {
    const [isCreatingModule, setIsCreatingModule] = useState(false);
    const [newModuleTitle, setNewModuleTitle] = useState("");
    const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

    const [isCreatingLesson, setIsCreatingLesson] = useState<string | null>(null);
    const [newLessonTitle, setNewLessonTitle] = useState("");

    const [isCreatingQuiz, setIsCreatingQuiz] = useState<string | null>(null);
    const [newQuizTitle, setNewQuizTitle] = useState("");

    // Estados del Modal
    const [deletingItem, setDeletingItem] = useState<{ type: 'module' | 'lesson' | 'quiz' | 'assignment', id: string, title?: string } | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const router = useRouter();

    const toggleModule = (moduleId: string) => {
        setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
    };

    const handleCreateModule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newModuleTitle.trim()) return;

        try {
            const result = await createModule(courseId, newModuleTitle);
            if (!result.success) {
                setErrorMessage(result.error || "Error al crear el módulo");
                return;
            }
            setNewModuleTitle("");
            setIsCreatingModule(false);
            router.refresh();
        } catch (error) {
            setErrorMessage("Ocurrió un error inesperado");
        }
    };

    const confirmDelete = async () => {
        if (!deletingItem) return;
        setIsDeleting(true);

        try {
            if (deletingItem.type === 'module') {
                await deleteModule(deletingItem.id, courseId);
            } else if (deletingItem.type === 'lesson') {
                await deleteLesson(deletingItem.id, courseId);
            } else if (deletingItem.type === 'quiz') {
                await deleteQuiz(deletingItem.id, courseId);
            } else if (deletingItem.type === 'assignment') {
                await deleteAssignment(deletingItem.id, courseId);
            }
            router.refresh();
            setDeletingItem(null);
        } catch (error) {
            setErrorMessage("Error al eliminar el elemento");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCreateLesson = async (e: React.FormEvent, moduleId: string) => {
        e.preventDefault();
        if (!newLessonTitle.trim()) return;
        await createLesson(moduleId, newLessonTitle, courseId);
        setNewLessonTitle("");
        setIsCreatingLesson(null);
        router.refresh();
    };

    const handleCreateQuiz = async (e: React.FormEvent, moduleId: string) => {
        e.preventDefault();
        if (!newQuizTitle.trim()) return;
        await createQuiz(moduleId, newQuizTitle, courseId);
        setNewQuizTitle("");
        setIsCreatingQuiz(null);
        router.refresh();
    };

    const [activeTab, setActiveTab] = useState<'modules' | 'assignments' | 'quizzes'>('modules');

    // Ayudante para obtener todas las tareas/cuestionarios aplanados
    const allAssignments = modules.flatMap(m => m.assignments?.map((a: any) => ({ ...a, moduleTitle: m.title })) || []);
    const allQuizzes = modules.flatMap(m => m.quizzes?.map((q: any) => ({ ...q, moduleTitle: m.title })) || []);

    return (
        <div className="space-y-8">
            {/* Encabezado y Pestañas */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Contenido del Curso</h2>
                        <p className="text-gray-500 text-sm mt-1">Gestiona el temario, tareas y evaluaciones.</p>
                    </div>
                    {activeTab === 'modules' && (
                        <button
                            onClick={() => setIsCreatingModule(true)}
                            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all font-medium w-full md:w-auto"
                        >
                            <Plus className="w-5 h-5" /> Nuevo Módulo
                        </button>
                    )}
                    {activeTab === 'assignments' && (
                        <Link
                            href={`/teacher/courses/${courseId}/assignments/new`}
                            className="bg-orange-600 text-white px-5 py-2.5 rounded-xl hover:bg-orange-700 flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20 transition-all font-medium w-full md:w-auto"
                        >
                            <Plus className="w-5 h-5" /> Nueva Tarea
                        </Link>
                    )}
                </div>

                <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0">
                    <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-max md:w-fit">
                        <button
                            onClick={() => setActiveTab('modules')}
                            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'modules' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Módulos y Lecciones
                        </button>
                        <button
                            onClick={() => setActiveTab('assignments')}
                            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'assignments' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Tareas ({allAssignments.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('quizzes')}
                            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'quizzes' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Evaluaciones ({allQuizzes.length})
                        </button>
                    </div>
                </div>
            </div>

            {/* PESTAÑA DE MÓDULOS */}
            {activeTab === 'modules' && (
                <>
                    {isCreatingModule && (
                        <form onSubmit={handleCreateModule} className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100 animate-in fade-in slide-in-from-top-2 ring-1 ring-blue-500/20 mb-6">
                            <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">Nuevo Módulo</h3>
                            <div className="flex flex-col md:flex-row gap-3">
                                <input
                                    type="text"
                                    value={newModuleTitle}
                                    onChange={(e) => setNewModuleTitle(e.target.value)}
                                    placeholder="Título del Módulo (ej: Semana 1: Introducción)"
                                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    autoFocus
                                />
                                <div className="flex gap-3">
                                    <button type="submit" className="flex-1 md:flex-none bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-medium transition-colors">Guardar</button>
                                    <button type="button" onClick={() => setIsCreatingModule(false)} className="flex-1 md:flex-none text-gray-500 px-6 py-3 hover:bg-gray-100 rounded-xl font-medium transition-colors">Cancelar</button>
                                </div>
                            </div>
                        </form>
                    )}

                    <div className="space-y-4">
                        {modules.map((module) => (
                            <div key={module.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md">
                                <div className="p-4 md:p-5 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                                    <div
                                        className="flex items-start md:items-center gap-3 md:gap-4 cursor-pointer flex-1 select-none"
                                        onClick={() => toggleModule(module.id)}
                                    >
                                        <div className={`p-2 rounded-lg transition-colors flex-shrink-0 ${expandedModules[module.id] ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400 group-hover:text-gray-600'}`}>
                                            {expandedModules[module.id] ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-gray-900 text-base md:text-lg break-words">{module.title}</h3>
                                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full mt-1 inline-block">
                                                {module.lessons.length} lecciones
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-end gap-1 border-t md:border-t-0 pt-3 md:pt-0 border-gray-50">
                                        <button
                                            onClick={() => {
                                                setIsCreatingLesson(module.id);
                                                setExpandedModules(prev => ({ ...prev, [module.id]: true }));
                                            }}
                                            className="text-blue-600 hover:bg-blue-50 p-2 md:p-2.5 rounded-xl transition-colors flex items-center gap-2 font-medium text-sm"
                                            title="Añadir Lección"
                                        >
                                            <Plus className="w-4 h-4" /> <span className="md:inline">Lección</span>
                                        </button>
                                        <div className="w-px h-6 bg-gray-200 mx-1"></div>
                                        <button
                                            onClick={() => setDeletingItem({ type: 'module', id: module.id, title: module.title })}
                                            className="text-gray-400 hover:text-red-600 p-2 md:p-2.5 rounded-xl hover:bg-red-50 transition-colors"
                                            title="Eliminar Módulo"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {expandedModules[module.id] && (
                                    <div className="bg-gray-50/50 border-t border-gray-100 p-2">
                                        <div className="space-y-1">
                                            {/* Lecciones */}
                                            {module.lessons.map((lesson: any) => (
                                                <div key={lesson.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 hover:bg-white hover:shadow-sm rounded-xl group transition-all border border-transparent hover:border-gray-100 ml-0 md:ml-4 gap-3">
                                                    <div className="flex items-start sm:items-center gap-3 md:gap-4">
                                                        <div className="text-gray-300 cursor-grab active:cursor-grabbing mt-1 sm:mt-0">
                                                            <GripVertical className="w-4 h-4" />
                                                        </div>
                                                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600 flex-shrink-0">
                                                            <FileText className="w-4 h-4" />
                                                        </div>
                                                        <span className="text-gray-700 font-medium break-words">{lesson.title}</span>
                                                    </div>
                                                    <div className="flex items-center justify-end gap-1 pl-10 sm:pl-0">
                                                        <Link
                                                            href={`/teacher/courses/${courseId}/lessons/${lesson.id}/preview`}
                                                            className="text-gray-400 hover:text-purple-600 p-2 hover:bg-purple-50 rounded-lg transition-colors"
                                                            title="Vista Previa (Como Alumno)"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                        <Link
                                                            href={`/teacher/courses/${courseId}/lessons/${lesson.id}`}
                                                            className="text-gray-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Editar Contenido"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => setDeletingItem({ type: 'lesson', id: lesson.id, title: lesson.title })}
                                                            className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Eliminar Lección"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Tareas */}
                                            {module.assignments?.map((assignment: any) => (
                                                <div key={assignment.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 hover:bg-white hover:shadow-sm rounded-xl group transition-all border border-transparent hover:border-gray-100 ml-0 md:ml-4 gap-3">
                                                    <div className="flex items-start sm:items-center gap-3 md:gap-4">
                                                        <div className="text-gray-300 opacity-0 hidden sm:block">
                                                            <GripVertical className="w-4 h-4" />
                                                        </div>
                                                        <div className="bg-orange-100 p-2 rounded-lg text-orange-600 flex-shrink-0">
                                                            <FileText className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-700 font-medium block break-words">{assignment.title}</span>
                                                            <span className="text-xs text-gray-500">Tarea • Vence: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-end gap-1 pl-10 sm:pl-0">
                                                        <Link
                                                            href={`/teacher/courses/${courseId}/assignments/${assignment.id}`}
                                                            className="text-gray-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Editar Tarea"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => setDeletingItem({ type: 'assignment', id: assignment.id, title: assignment.title })}
                                                            className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Eliminar Tarea"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Cuestionarios */}
                                            {module.quizzes?.map((quiz: any) => {
                                                const isClosed = quiz.closesAt && new Date(quiz.closesAt) < new Date();
                                                return (
                                                    <div key={quiz.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 hover:bg-white hover:shadow-sm rounded-xl group transition-all border border-transparent hover:border-gray-100 ml-0 md:ml-4 gap-3">
                                                        <div className="flex items-start sm:items-center gap-3 md:gap-4">
                                                            <div className="text-gray-300 opacity-0 hidden sm:block">
                                                                <GripVertical className="w-4 h-4" />
                                                            </div>
                                                            <div className="bg-purple-100 p-2 rounded-lg text-purple-600 flex-shrink-0">
                                                                <HelpCircle className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-700 font-medium block break-words">{quiz.title}</span>
                                                                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                                                    <span>Cuestionario • {quiz.questions?.length || 0} preguntas</span>
                                                                    {isClosed ? (
                                                                        <span className="text-red-600 font-medium bg-red-50 px-1.5 rounded border border-red-100">Cerrado</span>
                                                                    ) : (
                                                                        <span className="text-green-600 font-medium bg-green-50 px-1.5 rounded border border-green-100">Activo</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-end gap-1 pl-10 sm:pl-0">
                                                            <Link
                                                                href={`/teacher/courses/${courseId}/quizzes/${quiz.id}/results`}
                                                                className="text-gray-400 hover:text-green-600 p-2 hover:bg-green-50 rounded-lg transition-colors"
                                                                title="Ver Resultados"
                                                            >
                                                                <BarChart className="w-4 h-4" />
                                                            </Link>
                                                            <Link
                                                                href={`/teacher/courses/${courseId}/quizzes/${quiz.id}/edit`}
                                                                className="text-gray-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="Editar Cuestionario"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </Link>
                                                            <button
                                                                onClick={() => setDeletingItem({ type: 'quiz', id: quiz.id, title: quiz.title })}
                                                                className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Eliminar Cuestionario"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Formularios de Creación */}
                                        {isCreatingLesson === module.id && (
                                            <form onSubmit={(e) => handleCreateLesson(e, module.id)} className="mt-2 flex flex-col md:flex-row gap-2 p-3 ml-0 md:ml-4 bg-white rounded-xl border border-blue-200 shadow-sm">
                                                <input
                                                    type="text"
                                                    value={newLessonTitle}
                                                    onChange={(e) => setNewLessonTitle(e.target.value)}
                                                    placeholder="Título de la Lección"
                                                    className="w-full md:flex-1 px-3 py-2 border-none text-sm focus:outline-none focus:ring-0 font-medium"
                                                    autoFocus
                                                />
                                                <div className="flex gap-2 shrink-0">
                                                    <button type="submit" className="flex-1 md:flex-none bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700 font-medium">Añadir</button>
                                                    <button type="button" onClick={() => setIsCreatingLesson(null)} className="flex-1 md:flex-none text-gray-500 px-4 py-1.5 text-sm hover:bg-gray-100 rounded-lg font-medium">Cancelar</button>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* PESTAÑA DE TAREAS */}
            {activeTab === 'assignments' && (
                <div className="space-y-4">
                    {allAssignments.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                            <p className="text-gray-500">No hay tareas creadas.</p>
                        </div>
                    ) : (
                        allAssignments.map((assignment: any) => (
                            <div key={assignment.id} className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between hover:shadow-sm transition-shadow gap-4">
                                <div className="flex items-start sm:items-center gap-4">
                                    <div className="bg-orange-100 p-2.5 rounded-lg text-orange-600 flex-shrink-0">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-gray-900 break-words">{assignment.title}</h4>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs text-gray-500 mt-1">
                                            <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium w-fit">{assignment.moduleTitle}</span>
                                            <span className="hidden sm:inline">•</span>
                                            <span>Vence: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-end gap-1 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-50">
                                    <Link
                                        href={`/teacher/courses/${courseId}/assignments/${assignment.id}`}
                                        className="text-gray-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Link>
                                    <button
                                        onClick={() => setDeletingItem({ type: 'assignment', id: assignment.id, title: assignment.title })}
                                        className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* PESTAÑA DE CUESTIONARIOS */}
            {activeTab === 'quizzes' && (
                <div className="space-y-6">
                    {/* Creador de Cuestionarios Simple para esta vista */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4">Crear Nueva Evaluación</h3>
                        <div className="flex flex-col md:flex-row gap-4 md:items-end">
                            <div className="flex-1 space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase">Módulo</label>
                                <select
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                                    onChange={(e) => setIsCreatingQuiz(e.target.value)}
                                    value={isCreatingQuiz || ""}
                                >
                                    <option value="">Seleccionar Módulo...</option>
                                    {modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                                </select>
                            </div>
                            <div className="flex-[2] space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase">Título del Cuestionario</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Examen Parcial"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                                    value={newQuizTitle}
                                    onChange={(e) => setNewQuizTitle(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={(e) => {
                                    if (isCreatingQuiz) handleCreateQuiz(e, isCreatingQuiz);
                                }}
                                disabled={!isCreatingQuiz || !newQuizTitle}
                                className="bg-purple-600 text-white px-6 py-2.5 rounded-xl hover:bg-purple-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
                            >
                                Crear
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {allQuizzes.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                                <p className="text-gray-500">No hay evaluaciones creadas.</p>
                            </div>
                        ) : (
                            allQuizzes.map((quiz: any) => {
                                const isClosed = quiz.closesAt && new Date(quiz.closesAt) < new Date();
                                return (
                                    <div key={quiz.id} className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between hover:shadow-sm transition-shadow gap-4">
                                        <div className="flex items-start sm:items-center gap-4">
                                            <div className="bg-purple-100 p-2.5 rounded-lg text-purple-600 flex-shrink-0">
                                                <HelpCircle className="w-5 h-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-gray-900 break-words">{quiz.title}</h4>
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs text-gray-500 mt-1">
                                                    <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium w-fit">{quiz.moduleTitle}</span>
                                                    <span className="hidden sm:inline">•</span>
                                                    <span>{quiz.questions?.length || 0} preguntas</span>
                                                    <span className="hidden sm:inline">•</span>
                                                    {isClosed ? (
                                                        <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium border border-red-200 w-fit">Cerrado</span>
                                                    ) : (
                                                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium border border-green-200 w-fit">Activo</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-end gap-1 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-50">
                                            <Link
                                                href={`/teacher/courses/${courseId}/quizzes/${quiz.id}/results`}
                                                className="text-gray-400 hover:text-green-600 p-2 hover:bg-green-50 rounded-lg transition-colors"
                                                title="Ver Resultados"
                                            >
                                                <BarChart className="w-4 h-4" />
                                            </Link>
                                            <Link
                                                href={`/teacher/courses/${courseId}/quizzes/${quiz.id}/edit`}
                                                className="text-gray-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => setDeletingItem({ type: 'quiz', id: quiz.id, title: quiz.title })}
                                                className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {/* Modal de Confirmación de Eliminación */}
            <Modal
                isOpen={!!deletingItem}
                onClose={() => setDeletingItem(null)}
                title="Confirmar Eliminación"
            >
                {deletingItem && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-red-50 rounded-xl border border-red-100 text-red-700">
                            <AlertTriangle className="w-10 h-10 flex-shrink-0" />
                            <div>
                                <h4 className="font-bold">¿Estás seguro?</h4>
                                <p className="text-sm mt-1">
                                    Estás a punto de eliminar {deletingItem.type === 'module' ? 'el módulo' :
                                        deletingItem.type === 'lesson' ? 'la lección' :
                                            deletingItem.type === 'quiz' ? 'el cuestionario' : 'la tarea'} <span className="font-bold">{deletingItem.title}</span>.
                                    {deletingItem.type === 'module' && " Esto eliminará todas las lecciones, tareas y cuestionarios dentro de este módulo."}
                                    {deletingItem.type !== 'module' && " Esta acción no se puede deshacer."}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setDeletingItem(null)}
                                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-xl hover:bg-red-700 font-semibold transition-colors disabled:opacity-50"
                            >
                                {isDeleting ? "Eliminando..." : "Eliminar"}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal de Error */}
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
