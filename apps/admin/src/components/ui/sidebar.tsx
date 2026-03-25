"use client";
import { PanelLeft } from "lucide-react";
import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const SIDEBAR_WIDTH = "16rem";

interface SidebarContextType {
	open: boolean;
	setOpen: (open: boolean) => void;
	openMobile: boolean;
	setOpenMobile: (open: boolean) => void;
	isMobile: boolean;
	toggleSidebar: () => void;
}

const SidebarContext = React.createContext<SidebarContextType | null>(null);

export function useSidebar() {
	const ctx = React.useContext(SidebarContext);
	if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
	return ctx;
}

export const SidebarProvider = React.forwardRef<
	HTMLDivElement,
	React.ComponentProps<"div"> & { defaultOpen?: boolean }
>(({ defaultOpen = true, className, children, ...props }, ref) => {
	const isMobile = useIsMobile();
	const [open, setOpen] = React.useState(defaultOpen);
	const [openMobile, setOpenMobile] = React.useState(false);

	const toggleSidebar = React.useCallback(() => {
		if (isMobile) setOpenMobile((v) => !v);
		else setOpen((v) => !v);
	}, [isMobile]);

	return (
		<SidebarContext.Provider
			value={{
				open,
				setOpen,
				openMobile,
				setOpenMobile,
				isMobile,
				toggleSidebar,
			}}
		>
			<div
				ref={ref}
				style={{ "--sidebar-width": SIDEBAR_WIDTH } as React.CSSProperties}
				className={cn("flex min-h-svh w-full", className)}
				{...props}
			>
				{children}
			</div>
		</SidebarContext.Provider>
	);
});
SidebarProvider.displayName = "SidebarProvider";

export const Sidebar = React.forwardRef<
	HTMLDivElement,
	React.ComponentProps<"div">
>(({ className, children, ...props }, ref) => {
	const { open, openMobile, setOpenMobile, isMobile } = useSidebar();

	if (isMobile) {
		if (!openMobile) return null;
		return (
			<div className="fixed inset-0 z-50 flex">
				<button
					type="button"
					className="fixed inset-0 bg-black/40 border-none w-full h-full cursor-default"
					onClick={() => setOpenMobile(false)}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							setOpenMobile(false);
						}
					}}
					aria-label="Close sidebar"
				/>
				<div
					ref={ref}
					className={cn(
						"relative z-10 flex h-full w-[--sidebar-width] flex-col bg-sidebar overflow-y-auto",
						className,
					)}
					{...props}
				>
					{children}
				</div>
			</div>
		);
	}

	return (
		<div
			ref={ref}
			data-state={open ? "expanded" : "collapsed"}
			className={cn(
				"hidden md:flex flex-col h-screen sticky top-0 transition-[width] duration-300 overflow-hidden shrink-0",
				open ? "w-[--sidebar-width]" : "w-0",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
});
Sidebar.displayName = "Sidebar";

export const SidebarTrigger = React.forwardRef<
	HTMLButtonElement,
	React.ComponentProps<"button">
>(({ className, onClick, ...props }, ref) => {
	const { toggleSidebar } = useSidebar();
	return (
		<button
			ref={ref}
			type="button"
			data-sidebar="trigger"
			className={cn(
				"inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-accent",
				className,
			)}
			onClick={(e) => {
				onClick?.(e);
				toggleSidebar();
			}}
			{...props}
		>
			<PanelLeft className="h-4 w-4" />
			<span className="sr-only">Toggle Sidebar</span>
		</button>
	);
});
SidebarTrigger.displayName = "SidebarTrigger";

export const SidebarHeader = React.forwardRef<
	HTMLDivElement,
	React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		data-sidebar="header"
		className={cn("flex flex-col gap-2 p-4", className)}
		{...props}
	/>
));
SidebarHeader.displayName = "SidebarHeader";

export const SidebarContent = React.forwardRef<
	HTMLDivElement,
	React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		data-sidebar="content"
		className={cn("flex flex-1 flex-col gap-2 overflow-auto p-2", className)}
		{...props}
	/>
));
SidebarContent.displayName = "SidebarContent";

export const SidebarFooter = React.forwardRef<
	HTMLDivElement,
	React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		data-sidebar="footer"
		className={cn("flex flex-col gap-2 p-4", className)}
		{...props}
	/>
));
SidebarFooter.displayName = "SidebarFooter";

export const SidebarMenu = React.forwardRef<
	HTMLUListElement,
	React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
	<ul
		ref={ref}
		data-sidebar="menu"
		className={cn("flex w-full min-w-0 flex-col gap-1", className)}
		{...props}
	/>
));
SidebarMenu.displayName = "SidebarMenu";

export const SidebarMenuItem = React.forwardRef<
	HTMLLIElement,
	React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
	<li
		ref={ref}
		data-sidebar="menu-item"
		className={cn("list-none", className)}
		{...props}
	/>
));
SidebarMenuItem.displayName = "SidebarMenuItem";

export const SidebarMenuButton = React.forwardRef<
	HTMLButtonElement,
	React.ButtonHTMLAttributes<HTMLButtonElement> & {
		isActive?: boolean;
		render?: React.ReactElement;
	}
>(({ className, isActive, render: renderProp, children, ...props }, ref) => {
	const baseClass = cn(
		"flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-sm text-left outline-none transition-colors",
		"hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
		"focus-visible:ring-2 focus-visible:ring-sidebar-ring",
		isActive &&
			"bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground font-medium",
		className,
	);

	if (renderProp) {
		return React.cloneElement(renderProp, {
			...props,
			ref,
			"data-active": isActive,
			className: cn(
				baseClass,
				(renderProp.props as { className?: string }).className,
			),
		} as React.Attributes);
	}

	return (
		<button ref={ref} data-active={isActive} className={baseClass} {...props}>
			{children}
		</button>
	);
});
SidebarMenuButton.displayName = "SidebarMenuButton";
