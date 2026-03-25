import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Lock, Mail, Moon, Scissors, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth-context";
import { useLogin } from "@/modules/auth/hooks/useLogin";

export const Route = createFileRoute("/login")({
	component: RouteComponent,
});

function RouteComponent() {
	const { isLoading, isAuthenticated } = useAuth();
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isDarkMode, setIsDarkMode] = useState(false);

	const { mutate: submitLogin, isPending } = useLogin();

	useEffect(() => {
		if (!isLoading && isAuthenticated) {
			navigate({ to: "/dashboard" });
		}
	}, [isLoading, isAuthenticated, navigate]);

	useEffect(() => {
		const savedTheme = localStorage.getItem("theme");
		if (savedTheme === "dark") setIsDarkMode(true);
	}, []);

	useEffect(() => {
		if (isDarkMode) document.documentElement.classList.add("dark");
		else document.documentElement.classList.remove("dark");
		localStorage.setItem("theme", isDarkMode ? "dark" : "light");
	}, [isDarkMode]);

	function handleSubmitLogin(event: React.FormEvent) {
		event.preventDefault();
		submitLogin({ email, password });
	}

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

	if (isAuthenticated) {
		return null;
	}

	return (
		<div className="bg-sidebar/50 text-foreground transition-colors duration-300 min-h-screen flex items-center justify-center p-0 lg:p-6 overflow-x-hidden relative">
			<div className="grid lg:grid-cols-2 w-full max-w-[1240px] bg-card lg:rounded-3xl border-0 lg:border border-border overflow-hidden min-h-screen lg:min-h-[720px] relative z-10 shadow-sm">
				{/* Left Side: Promotional Image & Text */}
				<div className="hidden lg:flex relative overflow-hidden group border-r border-border/50">
					<img
						src="/login-image.webp"
						alt="Jahitin Branding"
						className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10" />

					{/* Logo on Top Left */}
					<div className="absolute top-10 left-10 flex items-center gap-3 z-10">
						<div className="bg-primary p-2 rounded-lg text-white shadow-lg">
							<Scissors className="h-6 w-6" />
						</div>
						<span className="text-2xl font-black text-white tracking-tighter">
							JAHITIN
						</span>
					</div>

					{/* Promotional Content with Glassmorphism */}
					<div className="absolute bottom-12 left-10 right-10 p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-none space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
						<div className="inline-flex px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-white text-[10px] font-bold uppercase tracking-widest">
							Kredibilitas Bisnis
						</div>
						<h2 className="text-3xl font-bold text-white tracking-tight leading-tight">
							Tampil Lebih{" "}
							<span className="text-primary italic">Profesional</span> <br />
							di Mata Klien
						</h2>
						<p className="text-white/70 text-sm leading-relaxed max-w-md">
							Berikan pengalaman terbaik dengan sistem pelacakan pesanan
							transparan. Klien bisa memantau progres secara mandiri, mencegah
							miskomunikasi, dan meningkatkan reputasi.
						</p>
					</div>
				</div>

				{/* Right Side: Login Form */}
				<div className="flex flex-col items-center justify-center p-8 md:p-12 lg:p-16 relative">
					{/* Dark Mode Toggle - Moved inside the right column */}
					<div className="absolute top-8 right-8 flex items-center gap-3 bg-card/50 border border-border p-2 px-3 rounded-full shadow-none backdrop-blur-sm z-20">
						{isDarkMode ? (
							<Moon className="h-4 w-4 text-primary" />
						) : (
							<Sun className="h-4 w-4 text-primary" />
						)}
						<Switch
							checked={isDarkMode}
							onCheckedChange={setIsDarkMode}
							aria-label="Toggle dark mode"
						/>
					</div>

					<div className="w-full max-w-[400px] flex flex-col items-center">
						{/* Mobile Logo - Added pt-12 to prevent overlap with theme toggle */}
						<div className="lg:hidden text-center mb-10 pt-12">
							<div className="inline-flex items-center justify-center mb-4 p-4 rounded-2xl bg-primary/10 text-primary group transition-all duration-500 hover:rotate-12">
								<Scissors className="h-10 w-10 md:h-12 md:w-12" />
							</div>
							<h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 text-foreground">
								JAHITIN
							</h1>
							<p className="text-muted-foreground text-xs md:text-sm font-medium tracking-wide">
								Admin Dashboard & Order Management
							</p>
						</div>

						{/* Form Header for Desktop */}
						<div className="hidden lg:block w-full text-left mb-10">
							<h1 className="text-4xl font-black tracking-tight mb-2 text-foreground">
								Login Admin
							</h1>
							<p className="text-muted-foreground text-sm font-medium tracking-wide">
								Silakan masuk untuk mengelola orderan Anda hari ini.
							</p>
						</div>

						<form className="space-y-6 w-full" onSubmit={handleSubmitLogin}>
							<div className="space-y-2">
								<Label
									htmlFor="email"
									className="text-xs uppercase tracking-widest font-bold text-muted-foreground/80"
								>
									Alamat Email
								</Label>
								<div className="relative group">
									<Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
									<Input
										id="email"
										type="email"
										placeholder="admin@jahitin.com"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										required
										className="pl-11 h-13 rounded-md border-muted-foreground/20 focus:ring-primary/20"
									/>
								</div>
							</div>

							<div className="space-y-2">
								<div className="flex justify-between items-center">
									<Label
										htmlFor="password"
										className="text-xs uppercase tracking-widest font-bold text-muted-foreground/80"
									>
										Password
									</Label>
									<button
										type="button"
										className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline"
									>
										Lupa?
									</button>
								</div>
								<div className="relative group">
									<Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
									<Input
										id="password"
										type="password"
										placeholder="••••••••"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										required
										className="pl-11 h-13 rounded-md border-muted-foreground/20 focus:ring-primary/20"
									/>
								</div>
							</div>

							<div className="flex items-center gap-2 py-1">
								<input
									type="checkbox"
									id="remember"
									className="rounded border-muted w-4 h-4 accent-primary"
								/>
								<label
									htmlFor="remember"
									className="text-xs text-muted-foreground font-medium cursor-pointer"
								>
									Ingat perangkat ini
								</label>
							</div>

							<Button
								type="submit"
								className="w-full h-13 font-bold text-base rounded-md mt-2"
								disabled={isPending}
							>
								{isPending ? (
									<span className="flex items-center gap-2">
										<span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
										Sedang Masuk...
									</span>
								) : (
									"Masuk Sekarang"
								)}
							</Button>
						</form>

						<div className="mt-10 text-center animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300">
							<p className="text-sm text-muted-foreground">
								Bukan Admin?{" "}
								<a
									href={
										import.meta.env.VITE_PLATFORM_URL || "http://localhost:3000"
									}
									className="text-primary font-bold hover:underline transition-all"
								>
									Track Pesanan
								</a>
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
