"use client";

import { useState, useActionState, useEffect } from "react";
import { deleteCourse, updateCourseTeacher } from "@/actions/course-actions";
import NextLink from "next/link";
import { Plus, Trash2, BookOpen, Users, Pencil, X, Loader2, User, AlertTriangle, CheckCircle } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Modal } from "@/components/ui/modal";

// Componente de Botón de Envío
function SubmitButton({ text = "Guardar", loadingText = "Guardando...", variant = "primary" }: { text?: string, loadingText?: string, variant?: "primary" | "danger" }) {
    const { pending } = useFormStatus();
    const baseClasses = "w-full px-4 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-sm hover:shadow-md";
    const variantClasses = variant === "danger"
        ? "bg-red-600 text-white hover:bg-red-700"
        : "bg-blue-600 text-white hover:bg-blue-700";

    return (
        <button
            type="submit"
            disabled={pending}
            className={`${baseClasses} ${variantClasses}`}
        >
            {pending ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {loadingText}
                </>
            ) : (
                <>
                    {text}
                </>
            )}
        </button>
    );
}

const initialState = {
    success: false,
    error: "",
};

export default function CourseManagementClient({ initialCourses, teachers }: { initialCourses: any[], teachers: any[] }) {
    const [courses, setCourses] = useState(initialCourses);
    const [editingCourse, setEditingCourse] = useState<any>(null);
    const [deletingCourse, setDeletingCourse] = useState<any>(null);
    const [successMessage, setSuccessMessage] = useState("");

    const [updateState, setUpdateState] = useState(initialState);
    const [isUpdating, setIsUpdating] = useState(false);

    // Envoltorio de Acción de Eliminar
    const deleteCourseAction = async (prevState: any, formData: FormData) => {
        const courseId = formData.get("courseId") as string;
        return await deleteCourse(courseId);
    };
    const [deleteState, deleteFormAction] = useActionState(deleteCourseAction, initialState);

    useEffect(() => {
        setCourses(initialCourses);
    }, [initialCourses]);

    // Manejar Éxito de Eliminación
    useEffect(() => {
        if (deleteState.success) {
            setDeletingCourse(null);
            setSuccessMessage("Curso eliminado correctamente");
        }
    }, [deleteState]);

    async function handleUpdateTeacher(formData: FormData) {
        setIsUpdating(true);
        const courseId = formData.get("courseId") as string;
        const teacherId = formData.get("teacherId") as string;

        const result = await updateCourseTeacher(courseId, teacherId);
        setUpdateState({ ...result, error: result.error || "" });
        setIsUpdating(false);

        if (result.success) {
            setEditingCourse(null);
            setSuccessMessage("Profesor reasignado correctamente");
        }
    }

    return (
        <div className="space-y-8 relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Gestión de Cursos</h1>
                    <p className="text-gray-500 mt-1">Crea cursos y asigna profesores.</p>
                </div>
                <NextLink
                    href="/admin/courses/create"
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 font-medium"
                >
                    <Plus className="w-5 h-5" />
                    Crear Curso
                </NextLink>
            </div>

            {/* Tabla de Cursos (Desktop) */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Curso</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Profesor</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estadísticas</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {courses?.map((course) => (
                                <tr key={course.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="h-12 w-12 flex-shrink-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                                                <BookOpen className="w-6 h-6" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-bold text-gray-900">{course.title}</div>
                                                <div className="text-sm text-gray-500 truncate max-w-xs">{course.description}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-900">{course.teacher.name}</span>
                                            <span className="text-xs text-gray-500">{course.teacher.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-medium">
                                                <BookOpen className="w-3.5 h-3.5" /> {course._count.modules} Módulos
                                            </span>
                                            <span className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg text-xs font-medium">
                                                <Users className="w-3.5 h-3.5" /> {course._count.enrollments} Alumnos
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setEditingCourse(course)}
                                                className="text-gray-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Reasignar Profesor"
                                            >
                                                <Pencil className="w-5 h-5" />
                                            </button>
                                            <NextLink
                                                href={`/admin/courses/${course.id}/enrollments`}
                                                className="text-gray-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Gestionar Alumnos"
                                            >
                                                <Users className="w-5 h-5" />
                                            </NextLink>
                                            <button
                                                onClick={() => setDeletingCourse(course)}
                                                className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Eliminar Curso"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {courses?.length === 0 && (
                    <div className="text-center py-16">
                        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No hay cursos</h3>
                        <p className="text-gray-500">Crea el primer curso para comenzar.</p>
                    </div>
                )}
            </div>

            {/* Vista Móvil (Cards) */}
            <div className="md:hidden space-y-4">
                {courses?.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No hay cursos</h3>
                        <p className="text-gray-500">Crea el primer curso para comenzar.</p>
                    </div>
                ) : (
                    courses?.map((course) => (
                        <div key={course.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="h-12 w-12 flex-shrink-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold text-gray-900 truncate">{course.title}</div>
                                    <div className="text-xs text-gray-500 line-clamp-2">{course.description}</div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                                <span className="font-medium text-gray-700">{course.teacher.name}</span>
                                <div className="flex gap-3">
                                    <span className="flex items-center gap-1">
                                        <BookOpen className="w-3 h-3" /> {course._count.modules}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Users className="w-3 h-3" /> {course._count.enrollments}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                                <button
                                    onClick={() => setEditingCourse(course)}
                                    className="text-gray-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    <Pencil className="w-5 h-5" />
                                </button>
                                <NextLink
                                    href={`/admin/courses/${course.id}/enrollments`}
                                    className="text-gray-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    <Users className="w-5 h-5" />
                                </NextLink>
                                <button
                                    onClick={() => setDeletingCourse(course)}
                                    className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal para Editar Profesor del Curso */}
            <Modal
                isOpen={!!editingCourse}
                onClose={() => setEditingCourse(null)}
                title="Reasignar Profesor"
            >
                {editingCourse && (
                    <form action={handleUpdateTeacher} className="space-y-4">
                        <input type="hidden" name="courseId" value={editingCourse.id} />

                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 mb-4">
                            <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Curso</div>
                            <div className="font-bold text-blue-900">{editingCourse.title}</div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">Profesor Asignado</label>
                            <div className="relative">
                                <User className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                                <select
                                    name="teacherId"
                                    defaultValue={editingCourse.teacherId}
                                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm bg-white appearance-none"
                                >
                                    {teachers.map((teacher) => (
                                        <option key={teacher.id} value={teacher.id}>
                                            {teacher.name} ({teacher.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {updateState?.error && (
                            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
                                Error: {updateState.error}
                            </div>
                        )}

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isUpdating}
                                className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-sm hover:shadow-md"
                            >
                                {isUpdating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    "Guardar Cambios"
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Modal de Confirmación de Eliminación */}
            <Modal
                isOpen={!!deletingCourse}
                onClose={() => setDeletingCourse(null)}
                title="Confirmar Eliminación"
            >
                {deletingCourse && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-red-50 rounded-xl border border-red-100 text-red-700">
                            <AlertTriangle className="w-10 h-10 flex-shrink-0" />
                            <div>
                                <h4 className="font-bold">¿Estás seguro?</h4>
                                <p className="text-sm mt-1">
                                    Estás a punto de eliminar el curso <span className="font-bold">{deletingCourse.title}</span>. Esta acción no se puede deshacer y eliminará todos los módulos, lecciones y tareas asociados.
                                </p>
                            </div>
                        </div>

                        <form action={deleteFormAction}>
                            <input type="hidden" name="courseId" value={deletingCourse.id} />
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setDeletingCourse(null)}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <div className="flex-1">
                                    <SubmitButton text="Eliminar Curso" loadingText="Eliminando..." variant="danger" />
                                </div>
                            </div>
                        </form>
                    </div>
                )}
            </Modal>

            {/* Modal de Éxito */}
            <Modal
                isOpen={!!successMessage}
                onClose={() => setSuccessMessage("")}
                title="¡Éxito!"
            >
                <div className="text-center space-y-6">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <p className="text-gray-600 text-lg">
                        {successMessage}
                    </p>
                    <button
                        onClick={() => setSuccessMessage("")}
                        className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 font-semibold transition-colors"
                    >
                        Entendido
                    </button>
                </div>
            </Modal>
        </div>
    );
}
