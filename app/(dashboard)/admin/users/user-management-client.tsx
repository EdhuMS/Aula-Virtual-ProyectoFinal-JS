"use client";

import { useState, useActionState, useEffect } from "react";
import { createUser, deleteUser, updateUser } from "@/actions/user-actions";
import { User as UserIcon, Search, Filter, Trash2, Plus, Mail, Lock, Shield, Pencil, Eye, EyeOff, AlertTriangle, CheckCircle } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { SubmitButton } from "@/components/ui/submit-button";
import { Role } from "@prisma/client";

interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    createdAt: Date;
}

const initialState = {
    success: false,
    error: "",
};

export default function UserManagementClient({ initialUsers }: { initialUsers: User[] }) {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");

    const [createState, createFormAction] = useActionState(createUser, initialState);
    const [updateState, updateFormAction] = useActionState(updateUser, initialState);

    // Necesitamos un estado separado para la acción de eliminar ya que toma un ID,
    // pero useActionState espera una función con (prevState, formData).
    // Envolveremos deleteUser para manejar el envío del formulario desde el modal.
    const deleteUserAction = async (prevState: any, formData: FormData) => {
        const userId = formData.get("userId") as string;
        return await deleteUser(userId);
    };
    const [deleteState, deleteFormAction] = useActionState(deleteUserAction, initialState);

    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);
    const [successMessage, setSuccessMessage] = useState("");

    const [showCreatePassword, setShowCreatePassword] = useState(false);
    const [showEditPassword, setShowEditPassword] = useState(false);

    // Actualizar lista de usuarios cuando initialUsers cambia
    useEffect(() => {
        setUsers(initialUsers);
    }, [initialUsers]);

    // Manejar Éxito de Actualización
    useEffect(() => {
        if (updateState.success) {
            setEditingUser(null);
            setSuccessMessage("Usuario actualizado correctamente");
        }
    }, [updateState]);

    // Manejar Éxito de Eliminación
    useEffect(() => {
        if (deleteState.success) {
            setDeletingUser(null);
            setSuccessMessage("Usuario eliminado correctamente");
        }
    }, [deleteState.success]);

    // Manejar Éxito de Creación
    useEffect(() => {
        if (createState.success) {
            setSuccessMessage("Usuario creado correctamente");
        }
    }, [createState.success]);


    // Lógica de filtrado
    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="space-y-8 relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
                    <p className="text-gray-500 mt-1">Administra estudiantes, profesores y administradores.</p>
                </div>
            </div>

            {/* Formulario de Creación de Usuario */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-blue-600" />
                    Crear Nuevo Usuario
                </h2>

                <form action={createFormAction} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">Nombre</label>
                        <div className="relative">
                            <UserIcon className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                            <input
                                name="name"
                                type="text"
                                required
                                placeholder="Nombre completo"
                                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">Email</label>
                        <div className="relative">
                            <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                            <input
                                name="email"
                                type="email"
                                required
                                placeholder="correo@ejemplo.com"
                                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">Contraseña</label>
                        <div className="relative">
                            <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                            <input
                                name="password"
                                type={showCreatePassword ? "text" : "password"}
                                required
                                placeholder="••••••••"
                                className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCreatePassword(!showCreatePassword)}
                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                                {showCreatePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-4 items-end">
                        <div className="space-y-1 flex-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">Rol</label>
                            <div className="relative">
                                <Shield className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                                <select
                                    name="role"
                                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm bg-white appearance-none"
                                >
                                    <option value="STUDENT">Estudiante</option>
                                    <option value="TEACHER">Profesor</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>
                        </div>
                        <div className="mb-[1px]">
                            <SubmitButton text="Crear Usuario" loadingText="Creando..." icon={<Plus className="w-4 h-4" />} />
                        </div>
                    </div>
                </form>
                {createState?.error && (
                    <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
                        Error: {createState.error}
                    </div>
                )}
            </div>

            {/* Filtros y Búsqueda */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex-1 relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                        <option value="ALL">Todos los Roles</option>
                        <option value="STUDENT">Estudiantes</option>
                        <option value="TEACHER">Profesores</option>
                        <option value="ADMIN">Administradores</option>
                    </select>
                </div>
            </div>

            {/* Tabla de Usuarios (Desktop) */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Usuario</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rol</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha Registro</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        No se encontraron usuarios que coincidan con tu búsqueda.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-gray-900">{user.name}</div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                                user.role === 'TEACHER' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                    'bg-blue-50 text-blue-700 border-blue-100'
                                                } `}>
                                                {user.role === 'ADMIN' ? 'Administrador' :
                                                    user.role === 'TEACHER' ? 'Profesor' : 'Estudiante'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingUser(user);
                                                        setShowEditPassword(false);
                                                    }}
                                                    className="text-gray-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Editar Usuario"
                                                >
                                                    <Pencil className="w-5 h-5" />
                                                </button>
                                                {user.email === "admin@aulavirtual.com" ? (
                                                    <div className="text-gray-300 p-2 cursor-not-allowed" title="Super Admin cannot be deleted">
                                                        <Shield className="w-5 h-5" />
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setDeletingUser(user)}
                                                        className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Eliminar Usuario"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 text-sm text-gray-500 flex justify-between items-center">
                    <span>Mostrando {filteredUsers.length} usuarios</span>
                    <span>Total: {users.length}</span>
                </div>
            </div>

            {/* Vista Móvil (Cards) */}
            <div className="md:hidden space-y-4">
                {filteredUsers.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 text-gray-500">
                        No se encontraron usuarios.
                    </div>
                ) : (
                    filteredUsers.map((user) => (
                        <div key={user.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-900">{user.name}</div>
                                        <div className="text-xs text-gray-500">{user.email}</div>
                                    </div>
                                </div>
                                <span className={`px-2.5 py-0.5 inline-flex text-xs font-bold rounded-full border ${user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                    user.role === 'TEACHER' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                        'bg-blue-50 text-blue-700 border-blue-100'
                                    } `}>
                                    {user.role === 'ADMIN' ? 'Admin' :
                                        user.role === 'TEACHER' ? 'Prof' : 'Est'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                                <span className="text-xs text-gray-400">
                                    Registrado: {new Date(user.createdAt).toLocaleDateString()}
                                </span>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => {
                                            setEditingUser(user);
                                            setShowEditPassword(false);
                                        }}
                                        className="text-gray-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    {user.email === "admin@aulavirtual.com" ? (
                                        <div className="text-gray-300 p-2">
                                            <Shield className="w-4 h-4" />
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setDeletingUser(user)}
                                            className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal de Edición de Usuario */}
            <Modal
                isOpen={!!editingUser}
                onClose={() => setEditingUser(null)}
                title="Editar Usuario"
            >
                {editingUser && (
                    <form action={updateFormAction} className="space-y-4">
                        <input type="hidden" name="userId" value={editingUser.id} />

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">Nombre</label>
                            <div className="relative">
                                <UserIcon className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                                <input
                                    name="name"
                                    type="text"
                                    defaultValue={editingUser.name}
                                    required
                                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">Email</label>
                            <div className="relative">
                                <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                                <input
                                    name="email"
                                    type="email"
                                    defaultValue={editingUser.email}
                                    required
                                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">Nueva Contraseña (Opcional)</label>
                            <div className="relative">
                                <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                                <input
                                    name="password"
                                    type={showEditPassword ? "text" : "password"}
                                    placeholder="Dejar en blanco para mantener actual"
                                    className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowEditPassword(!showEditPassword)}
                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">Rol</label>
                            <div className="relative">
                                <Shield className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                                <select
                                    name="role"
                                    defaultValue={editingUser.role}
                                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm bg-white appearance-none"
                                >
                                    <option value="STUDENT">Estudiante</option>
                                    <option value="TEACHER">Profesor</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>
                        </div>

                        {updateState?.error && (
                            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
                                Error: {updateState.error}
                            </div>
                        )}

                        <div className="pt-2">
                            <SubmitButton text="Guardar Cambios" loadingText="Guardando..." />
                        </div>
                    </form>
                )}
            </Modal>

            {/* Modal de Confirmación de Eliminación */}
            <Modal
                isOpen={!!deletingUser}
                onClose={() => setDeletingUser(null)}
                title="Confirmar Eliminación"
            >
                {deletingUser && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-red-50 rounded-xl border border-red-100 text-red-700">
                            <AlertTriangle className="w-10 h-10 flex-shrink-0" />
                            <div>
                                <h4 className="font-bold">¿Estás seguro?</h4>
                                <p className="text-sm mt-1">
                                    Estás a punto de eliminar al usuario <span className="font-bold">{deletingUser.name}</span>. Esta acción no se puede deshacer.
                                </p>
                            </div>
                        </div>

                        <form action={deleteFormAction}>
                            <input type="hidden" name="userId" value={deletingUser.id} />
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setDeletingUser(null)}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <div className="flex-1">
                                    <SubmitButton text="Eliminar Usuario" loadingText="Eliminando..." variant="danger" />
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
