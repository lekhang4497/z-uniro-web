import * as React from "react";
import { cn } from "@/lib/utils";

interface PopoverPanelProps extends React.HTMLAttributes<HTMLDivElement> {
    origin?: "bottom-left" | "bottom-right" | "top-left" | "top-right";
}

/**
 * A floating popover panel matching Claude's dropdown style:
 * rounded-xl, 0.5px border via border-border-200, backdrop-blur,
 * subtle shadow that deepens in dark mode.
 */
export const PopoverPanel = React.forwardRef<HTMLDivElement, PopoverPanelProps>(
    ({ className, origin = "bottom-left", ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "popover-shell z-50 flex flex-col rounded-xl border border-border-200 bg-bg-000/95 backdrop-blur-xl p-1.5 animate-dropdown-in",
                    origin === "bottom-left" && "origin-bottom-left",
                    origin === "bottom-right" && "origin-bottom-right",
                    origin === "top-left" && "origin-top-left",
                    origin === "top-right" && "origin-top-right",
                    className
                )}
                {...props}
            />
        );
    }
);
PopoverPanel.displayName = "PopoverPanel";

interface PopoverItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    selected?: boolean;
    disabled?: boolean;
}

export const PopoverItem = React.forwardRef<HTMLButtonElement, PopoverItemProps>(
    ({ className, selected, disabled, type = "button", ...props }, ref) => {
        return (
            <button
                ref={ref}
                type={type}
                disabled={disabled}
                data-selected={selected ? "" : undefined}
                className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors",
                    "text-text-100 hover:bg-bg-200",
                    "data-[selected]:bg-bg-200 data-[selected]:text-text-000",
                    disabled && "opacity-40 cursor-not-allowed hover:bg-transparent",
                    className
                )}
                {...props}
            />
        );
    }
);
PopoverItem.displayName = "PopoverItem";

export function PopoverSeparator({ className }: { className?: string }) {
    return <div className={cn("h-px bg-border-200 mx-2 my-1.5", className)} />;
}
