import { createFileRoute } from "@tanstack/react-router";
import { Lock, Mail, Moon, Scissors, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useLogin } from "@/modules/auth/hooks/useLogin";

export const Route = createFileRoute("/login")({
	component: RouteComponent,
});

function RouteComponent() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isDarkMode, setIsDarkMode] = useState(false);

	const { mutate: submitLogin, isPending } = useLogin();

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

	return (
		<div className="bg-background text-foreground transition-colors duration-300 min-h-screen flex flex-col items-center justify-center p-6 md:p-4 overflow-x-hidden relative">
			<div className="absolute top-6 right-6 md:top-8 md:right-8 flex items-center gap-3 bg-card border border-border p-2 px-3 rounded-full shadow-sm z-10">
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

			<div className="max-w-[420px] w-full flex flex-col pt-12 md:pt-0">
				<div className="text-center mb-10 md:mb-8">
					<div className="inline-flex items-center justify-center mb-4 group transition-all duration-500 hover:rotate-12">
						<Scissors className="h-12 w-12 text-primary" />
					</div>
					<h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 text-foreground">
						JAHITIN
					</h1>
					<p className="text-muted-foreground text-xs md:text-sm font-medium tracking-wide">
						Admin Dashboard & Order Management
					</p>
				</div>

				<Card className="shadow-none border border-border bg-card">
					<CardContent className="p-8">
						<form className="space-y-5" onSubmit={handleSubmitLogin}>
							<div className="space-y-2">
								<Label htmlFor="email" className="text-muted-foreground">
									Admin Email
								</Label>
								<div className="relative group">
									<Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
									<Input
										id="email"
										type="email"
										placeholder="name@jahitin.com"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										required
										className="pl-11 h-12"
									/>
								</div>
							</div>

							<div className="space-y-2">
								<div className="flex justify-between items-center">
									<Label
										htmlFor="password"
										title="password"
										className="text-muted-foreground"
									>
										Password
									</Label>
									<button
										type="button"
										className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline"
									>
										Forgot?
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
										className="pl-11 h-12"
									/>
								</div>
							</div>

							<div className="flex items-center gap-2 py-1">
								<input
									type="checkbox"
									id="remember"
									className="rounded-sm border-muted w-4 h-4 accent-primary"
								/>
								<label
									htmlFor="remember"
									className="text-xs text-muted-foreground font-medium cursor-pointer"
								>
									Remember this device
								</label>
							</div>

							<Button
								type="submit"
								className="w-full h-12 font-bold text-base rounded-xl mt-2 relative overflow-hidden group/btn"
								disabled={isPending}
							>
								{isPending ? (
									<span className="flex items-center gap-2">
										<span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
										Logging in...
									</span>
								) : (
									"Login"
								)}
								<div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
							</Button>
						</form>
					</CardContent>
				</Card>

				<div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300">
					<p className="text-sm text-muted-foreground">
						Bukan Admin?{" "}
						<a
							href="#"
							className="text-primary font-bold hover:underline transition-all"
						>
							Track Pesanan
						</a>
					</p>
				</div>
			</div>
		</div>
	);
}
