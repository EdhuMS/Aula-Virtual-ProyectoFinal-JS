import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Redirect based on role
  switch (session.user.role) {
    case "ADMIN":
      redirect("/admin/users");
    case "TEACHER":
      redirect("/teacher/courses");
    case "STUDENT":
      redirect("/student/my-courses");
    default:
      redirect("/login");
  }
}
