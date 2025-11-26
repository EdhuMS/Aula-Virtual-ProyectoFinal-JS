"use client";

import { useFormStatus } from "react-dom";
import { Loader2, Plus } from "lucide-react";

interface SubmitButtonProps {
    text?: string;
    loadingText?: string;
    variant?: "primary" | "danger";
    icon?: React.ReactNode;
}

export function SubmitButton({
    text = "Guardar",
    loadingText = "Guardando...",
    variant = "primary",
    icon
}: SubmitButtonProps) {
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
                    {icon}
                    {text}
                </>
            )}
        </button>
    );
}
