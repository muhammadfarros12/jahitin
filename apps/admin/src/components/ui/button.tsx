"use client";
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
	{
		variants: {
			variant: {
				default:
					"bg-primary text-primary-foreground hover:bg-primary/80 transition-colors",
				outline:
					"border-border bg-background hover:bg-muted dark:border-input dark:bg-input/30 transition-colors",
				ghost: "hover:bg-muted hover:text-foreground transition-colors",
				destructive:
					"bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors",
			},
			size: {
				default: "h-8 gap-1.5 px-2.5",
				sm: "h-7 gap-1 px-2.5 text-[0.8rem]",
				lg: "h-10 gap-1.5 px-4 text-base",
				icon: "size-8",
				"icon-sm": "size-7",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

export interface ButtonProps
	extends React.ComponentPropsWithoutRef<typeof ButtonPrimitive>,
		VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, ...props }, ref) => {
		return (
			<ButtonPrimitive
				ref={ref}
				data-slot="button"
				className={cn(buttonVariants({ variant, size, className }))}
				{...props}
			/>
		);
	},
);
Button.displayName = "Button";

export { Button, buttonVariants };
