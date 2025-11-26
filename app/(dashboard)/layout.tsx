import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardLayoutClient from "@/components/dashboard-layout-client";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/login");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true, image: true }
    });

    return (
        <DashboardLayoutClient
            role={session.user.role}
            user={{ name: user?.name, email: user?.email, image: user?.image } as any}
        >
            {children}
        </DashboardLayoutClient>
    );
}
