import { getUsers } from "@/actions/user-actions";
import UserManagementClient from "./user-management-client";

export default async function AdminUsersPage() {
    const { data: users, error } = await getUsers();

    if (error) {
        return (
            <div className="p-8">
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
                    Error al cargar usuarios: {error}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            <UserManagementClient initialUsers={users || []} />
        </div>
    );
}
