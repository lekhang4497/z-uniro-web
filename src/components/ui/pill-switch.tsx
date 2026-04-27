import { cn } from "@/lib/utils";

interface PillSwitchProps {
    checked: boolean;
    onChange?: (checked: boolean) => void;
    className?: string;
    disabled?: boolean;
    label?: string;
}

export function PillSwitch({
    checked,
    onChange,
    className,
    disabled,
    label,
}: PillSwitchProps) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            disabled={disabled}
            onClick={() => onChange?.(!checked)}
            className={cn(
                "relative h-[18px] w-8 shrink-0 rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                checked ? "bg-accent-000" : "bg-bg-400/80",
                disabled && "opacity-50 pointer-events-none",
                className
            )}
        >
            <span
                className={cn(
                    "absolute top-0.5 block h-[14px] w-[14px] rounded-full bg-white shadow-sm transition-transform duration-200",
                    checked ? "translate-x-[15px]" : "translate-x-0.5"
                )}
            />
        </button>
    );
}
