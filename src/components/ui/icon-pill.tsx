import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * The small circular icon puck used in sidebar list items (new chat, search,
 * conversation icons). Has group-hover responsiveness when nested in a group.
 */
export function IconPill({
    children,
    active,
    className,
}: {
    children: React.ReactNode;
    active?: boolean;
    className?: string;
}) {
    return (
        <span
            className={cn(
                "flex items-center justify-center rounded-full size-[1.4rem] -mx-[0.1rem] flex-shrink-0 transition-all ease-in-out group-hover:-rotate-3 group-hover:scale-110 group-active:rotate-6 group-active:scale-[0.98]",
                active
                    ? "bg-text-500/25"
                    : "bg-text-500/12 group-hover:bg-text-500/20",
                className
            )}
        >
            {children}
        </span>
    );
}
