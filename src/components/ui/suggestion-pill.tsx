import * as React from "react";
import { cn } from "@/lib/utils";

interface SuggestionPillProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon?: React.ReactNode;
}

export const SuggestionPill = React.forwardRef<HTMLButtonElement, SuggestionPillProps>(
    ({ className, icon, children, type = "button", ...props }, ref) => {
        return (
            <button
                ref={ref}
                type={type}
                className={cn(
                    "group inline-flex items-center gap-1.5 rounded-full border border-border-200 bg-transparent px-3.5 py-1.5 text-[13px] text-text-300 transition-colors hover:border-border-400 hover:bg-bg-200 hover:text-text-000 cursor-pointer",
                    className
                )}
                {...props}
            >
                {icon && <span className="text-[13px] opacity-70 group-hover:opacity-100 transition-opacity">{icon}</span>}
                <span>{children}</span>
            </button>
        );
    }
);
SuggestionPill.displayName = "SuggestionPill";
