import { getTeachers } from "@/actions/user-actions";
import CreateCourseForm from "./create-course-form";

export default async function CreateCoursePage() {
    const { data: teachers } = await getTeachers();

    return <CreateCourseForm teachers={teachers || []} />;
}
