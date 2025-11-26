"use client";

import { createCourse } from "@/actions/course-actions";
import Link from "next/link";
import { useFormState } from "react-dom";

const initialState = {
    success: false,
    error: "",
};

export default function CreateCoursePage() {
    const [state, formAction] = useFormState(createCourse, initialState);

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <Link href="/teacher/courses" className="text-blue-600 hover:underline">
                    &larr; Back to Courses
                </Link>
            </div>

            <h1 className="text-3xl font-bold mb-6">Create New Course</h1>

            <div className="bg-white p-6 rounded-lg shadow">
                <form action={formAction} className="space-y-6">
                    {state?.error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                            {state.error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
                        <input
                            name="title"
                            type="text"
                            required
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Advanced JavaScript"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            name="description"
                            required
                            rows={4}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="What will students learn in this course?"
                        />
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium"
                        >
                            Create Course
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
