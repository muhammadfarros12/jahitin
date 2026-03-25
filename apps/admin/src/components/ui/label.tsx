import type * as React from "react";
import { cn } from "@/lib/utils";

function Label({
	className,
	htmlFor,
	children,
	...props
}: React.ComponentProps<"label">) {
	const hasHtmlFor = Boolean(htmlFor);
	const hasChildren = Boolean(children);
	const accessibleName =
		hasChildren && typeof children === "string" ? children : undefined;
	return (
		<label
			htmlFor={htmlFor}
			aria-label={!hasHtmlFor && accessibleName ? accessibleName : undefined}
			className={cn(
				"text-xs font-bold text-slate-500 uppercase tracking-widest leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
				className,
			)}
			{...props}
		/>
	);
}

export { Label };
