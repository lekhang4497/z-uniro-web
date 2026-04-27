import * as React from "react";
import { cn } from "@/lib/utils";

interface ComposerShellProps extends React.HTMLAttributes<HTMLDivElement> {
    dragging?: boolean;
}

/**
 * Open-WebUI-style chat composer container.
 *
 * Identity: rounded-3xl (24px), translucent bg over backdrop-blur, soft shadow.
 * Border thickens on hover/focus-within for affordance.
 */
export const ComposerShell = React.forwardRef<HTMLDivElement, ComposerShellProps>(
    ({ className, dragging, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "relative flex flex-col rounded-[24px] shadow-lg backdrop-blur-sm cursor-text antialiased",
                    "bg-bg-000/80 dark:bg-bg-000/60",
                    "border border-border-200 hover:border-border-300 focus-within:border-border-400 transition-colors",
                    dragging && "ring-2 ring-accent-000/40",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);
ComposerShell.displayName = "ComposerShell";
