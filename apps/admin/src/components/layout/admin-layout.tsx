import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import {
	ChevronUp,
	FileBarChart,
	Key,
	LayoutDashboard,
	LogOut,
	Moon,
	Scissors,
	Settings,
	Sun,
	User,
	Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth-context";

export function AdminLayout({ children }: { children?: React.ReactNode }) {
	const { user, logout, isLoading, isAuthenticated } = useAuth();
	const location = useLocation();
	const navigate = useNavigate();
	const [isDarkMode, setIsDarkMode] = useState(false);
	const [showPasswordSheet, setShowPasswordSheet] = useState(false);

	useEffect(() => {
		const saved =
			typeof window !== "undefined" ? localStorage.getItem("theme") : null;
		if (saved === "dark") setIsDarkMode(true);
	}, []);

	useEffect(() => {
		if (!isLoading && !isAuthenticated && location.pathname !== "/login") {
			navigate({ to: "/login" });
		}
	}, [isLoading, isAuthenticated, navigate, location.pathname]);

	useEffect(() => {
		if (isDarkMode) {
			document.documentElement.classList.add("dark");
			localStorage.setItem("theme", "dark");
		} else {
			document.documentElement.classList.remove("dark");
			localStorage.setItem("theme", "light");
		}
	}, [isDarkMode]);

	const handleLogout = () => {
		logout();
		toast.success("Berhasil logout");
		navigate({ to: "/login" });
	};

	if (isLoading) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="flex flex-col items-center gap-4">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
					<span className="text-sm text-muted-foreground">Memuat...</span>
				</div>
			</div>
		);
	}

	if (!isAuthenticated) {
		return null;
	}

	return (
		<SidebarProvider>
			<div className="flex min-h-screen w-full bg-background">
				<Sidebar className="border-none bg-sidebar shadow-none">
					<SidebarHeader className="p-6 pb-2 flex flex-row items-center gap-2.5">
						<Scissors className="h-6 w-6 text-primary shrink-0" />
						<span className="font-bold text-xl text-foreground tracking-tight">
							Jahitin
						</span>
					</SidebarHeader>

					<SidebarContent>
						<SidebarMenu className="px-2 mt-4">
							<SidebarMenuItem>
								<SidebarMenuButton
									render={
										<Link
											to="/dashboard"
											className="flex items-center gap-2 w-full h-full px-3"
										>
											<LayoutDashboard className="h-4 w-4 shrink-0" />
											<span>Dashboard</span>
										</Link>
									}
									isActive={location.pathname === "/dashboard"}
									className="w-full justify-start h-10 px-0 rounded-md transition-colors"
								/>
							</SidebarMenuItem>

							<SidebarMenuItem>
								<SidebarMenuButton
									disabled
									className="w-full justify-start h-10 px-3 transition-opacity"
								>
									<Users className="h-4 w-4 shrink-0" />
									<span>Customers</span>
								</SidebarMenuButton>
							</SidebarMenuItem>

							<SidebarMenuItem>
								<SidebarMenuButton
									disabled
									className="w-full justify-start h-10 px-3 transition-opacity"
								>
									<FileBarChart className="h-4 w-4 shrink-0" />
									<span>Reports</span>
								</SidebarMenuButton>
							</SidebarMenuItem>

							<SidebarMenuItem>
								<SidebarMenuButton
									disabled
									className="w-full justify-start h-10 px-3 transition-opacity"
								>
									<Settings className="h-4 w-4 shrink-0" />
									<span>Settings</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarContent>
					<SidebarFooter className="p-4 border-t border-border">
						<DropdownMenu>
							<DropdownMenuTrigger
								render={
									<SidebarMenuButton className="h-12 w-full px-2 rounded-lg cursor-pointer transition-all duration-150 hover:bg-sidebar-accent group">
										<div className="flex items-center gap-2 w-full">
											<div className="h-8 w-8 rounded-full bg-muted group-hover:bg-sidebar-accent-foreground/10 flex items-center justify-center shrink-0">
												<User className="h-4 w-4 text-muted-foreground group-hover:text-sidebar-foreground" />
											</div>
											<div className="flex flex-col items-start overflow-hidden flex-1 min-w-0">
												<span className="text-sm font-semibold truncate w-full tracking-tight">
													{user?.name}
												</span>
												<span className="text-xs text-muted-foreground truncate w-full tracking-tight">
													{user?.email}
												</span>
											</div>
											<ChevronUp className="h-4 w-4 ml-auto text-muted-foreground group-hover:text-sidebar-foreground transition-all group-hover:-translate-y-0.5 shrink-0" />
										</div>
									</SidebarMenuButton>
								}
							/>
							<DropdownMenuContent side="top" align="end" className="w-56">
								<DropdownMenuItem
									onClick={() => setShowPasswordSheet(true)}
									className="gap-2"
								>
									<Key className="h-4 w-4" />
									Ubah Password
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={handleLogout}
									className="gap-2 text-red-600 focus:text-red-600"
								>
									<LogOut className="h-4 w-4" />
									Logout
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarFooter>
				</Sidebar>

				<main className="flex-1 p-2 bg-sidebar overflow-hidden flex flex-col">
					<div className="flex-1 bg-background rounded-3xl shadow-xs overflow-hidden flex flex-col">
						<header className="h-14 flex items-center shrink-0 justify-between px-6 border-b border-border">
							<div className="flex items-center gap-4">
								<SidebarTrigger className="text-muted-foreground hover:text-foreground" />
								<div className="h-4 w-[1px] bg-border" />
								<h1 className="text-sm font-semibold text-foreground tracking-tight">
									Dashboard
								</h1>
							</div>
							<div className="flex items-center gap-3">
								<div className="flex items-center gap-2">
									{isDarkMode ? (
										<Moon className="h-4 w-4 text-muted-foreground" />
									) : (
										<Sun className="h-4 w-4 text-muted-foreground" />
									)}
								</div>
								<Switch checked={isDarkMode} onCheckedChange={setIsDarkMode} />
							</div>
						</header>
						<div className="flex-1 overflow-y-auto p-6 md:p-8">
							<div className="max-w-7xl mx-auto">{children || <Outlet />}</div>
						</div>
					</div>
				</main>
			</div>

			<Sheet open={showPasswordSheet} onOpenChange={setShowPasswordSheet}>
				<SheetContent
					side="right"
					className="w-full sm:max-w-md p-0 flex flex-col h-full"
				>
					<SheetHeader className="text-left border-b border-border p-8 pb-6 shrink-0">
						<SheetTitle className="text-2xl">Ubah Password</SheetTitle>
						<SheetDescription className="text-sm">
							Amankan akun Anda dengan mengganti password secara berkala.
						</SheetDescription>
					</SheetHeader>

					<div className="flex-1 overflow-y-auto p-8 space-y-6">
						<div className="grid gap-2">
							<Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
								Password Lama
							</Label>
							<Input
								type="password"
								className="bg-card border-border h-11 focus-visible:ring-primary/20"
							/>
						</div>
						<div className="grid gap-2">
							<Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
								Password Baru
							</Label>
							<Input
								type="password"
								className="bg-card border-border h-11 focus-visible:ring-primary/20"
							/>
						</div>
					</div>

					<div className="px-8 py-6 border-t border-border shrink-0">
						<Button
							className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-md"
							onClick={() => {
								toast.success("Password diubah (simulasi)");
								setShowPasswordSheet(false);
							}}
						>
							Simpan Perubahan
						</Button>
					</div>
				</SheetContent>
			</Sheet>
		</SidebarProvider>
	);
}
