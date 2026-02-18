import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useLogin } from "@/modules/auth/hooks/useLogin";

export const Route = createFileRoute("/login")({
	component: RouteComponent,
});

function RouteComponent() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const { mutate: submitLogin, isPending } = useLogin();

	function handleSubmitLogin(event: React.FormEvent) {
		event.preventDefault();
		submitLogin({ email, password });
	}

	return (
		<div>
			<div className="bg-slate-50 font-sans min-h-screen flex items-center justify-center p-4">
				<div className="max-w-md w-full">
					<div className="text-center mb-10">
						<div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 mb-4">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-8 w-8 text-white"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-label="Admin Icon"
							>
								<title>Admin Icon</title>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
								/>
							</svg>
						</div>
						<h1 className="text-3xl font-black text-slate-800 tracking-tighter">
							JAHITIN <span className="text-indigo-600">ADMIN</span>
						</h1>
						<p className="text-slate-500 mt-2 text-sm">
							Kelola order dan status produksi konveksi.
						</p>
					</div>

					<div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100">
						<form className="space-y-5" onSubmit={handleSubmitLogin}>
							<div>
								<label
									htmlFor="email"
									className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2"
								>
									Akses Admin
								</label>
								<div className="relative">
									<span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="h-5 w-5"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
											aria-label="Email Icon"
										>
											<title>Email Icon</title>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206"
											/>
										</svg>
									</span>
									<input
										id="email"
										type="email"
										value={email}
										required
										placeholder="Email@jahitin.com"
										onChange={(e) => setEmail(e.target.value)}
										className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition-all"
									/>
								</div>
							</div>

							<div>
								<div className="flex justify-between mb-2">
									<label
										htmlFor="password"
										className="block text-xs font-bold text-slate-500 uppercase tracking-widest"
									>
										Password
									</label>
								</div>
								<div className="relative">
									<span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="h-5 w-5"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
											aria-label="Password Icon"
										>
											<title>Password Icon</title>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
											/>
										</svg>
									</span>
									<input
										id="password"
										type="password"
										required
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										placeholder="Password"
										className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition-all"
									/>
								</div>
							</div>

							<div className="flex items-center">
								<input
									type="checkbox"
									id="remember"
									className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
								/>
								<label
									htmlFor="remember"
									className="ml-2 text-sm text-slate-600 italic"
								>
									Ingat perangkat ini
								</label>
							</div>
							<button
								type="submit"
								disabled={isPending}
								className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-indigo-600 hover:-translate-y-0.5 transition-all active:scale-95 
                disabled:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isPending ? "Login in ..." : "Login"}
							</button>
						</form>
					</div>

					<div className="mt-8 text-center">
						<p className="text-sm text-slate-500">
							Bukan Admin?
							<a
								href="http://localhost:3000"
								className="text-indigo-600 font-bold hover:underline"
							>
								{" "}
								Cek Status Pesanan Anda
							</a>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
