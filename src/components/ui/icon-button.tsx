import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const iconButtonVariants = cva(
    "inline-flex items-center justify-center rounded-lg transition-colors duration-150 active:scale-95 disabled:opacity-40 disabled:pointer-events-none outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-0",
    {
        variants: {
            variant: {
                ghost: "text-text-300 hover:bg-bg-300 hover:text-text-000",
                subtle: "text-text-400 hover:bg-bg-200 hover:text-text-100",
                active: "bg-bg-300 text-text-000",
                accent: "bg-accent-000 text-accent-fg hover:bg-accent-100",
                primary: "bg-foreground text-background hover:bg-foreground/90",
                destructive:
                    "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            },
            size: {
                sm: "h-7 w-7 [&_svg]:size-4",
                md: "h-8 w-8 [&_svg]:size-[18px]",
                lg: "h-9 w-9 [&_svg]:size-5",
            },
        },
        defaultVariants: {
            variant: "ghost",
            size: "md",
        },
    }
);

export interface IconButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> { }

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
    ({ className, variant, size, type = "button", ...props }, ref) => {
        return (
            <button
                ref={ref}
                type={type}
                className={cn(iconButtonVariants({ variant, size }), className)}
                {...props}
            />
        );
    }
);
IconButton.displayName = "IconButton";

export { iconButtonVariants };
