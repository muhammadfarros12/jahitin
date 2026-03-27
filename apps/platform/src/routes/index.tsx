import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Scissors } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/")({ component: App });

function App() {
	const [orderCode, setOrderCode] = useState("");
	const navigate = useNavigate();

	function handleSearch(e: React.FormEvent) {
		e.preventDefault();
		if (!orderCode.trim()) return;
		navigate({
			to: "/track/$orderCode",
			params: { orderCode: orderCode.trim().toUpperCase() },
		});
	}

	return (
		<div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
			{/* Nav */}
			<nav className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
				<div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
					<div className="flex items-center gap-2.5">
						<div className="bg-primary p-1.5 rounded-lg">
							<Scissors className="h-5 w-5 text-primary-foreground" />
						</div>
						<div>
							<span className="font-bold text-lg tracking-tight text-foreground block leading-none">
								Jahitin
							</span>
							<span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
								Konveksi Terpercaya
							</span>
						</div>
					</div>
					<a
						href={import.meta.env.VITE_ADMIN_URL}
						className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors border border-border px-3 py-1.5 rounded-full hover:bg-muted hover:border-foreground"
					>
						Admin →
					</a>
				</div>
			</nav>

			{/* Hero */}
			<section className="flex-1 flex flex-col items-center justify-center px-6 py-20 max-w-5xl mx-auto w-full text-center">
				{/* Eyebrow */}
				<div className="inline-flex items-center gap-3 mb-6">
					<div className="h-px w-6 bg-primary" />
					<span className="text-xs font-bold uppercase tracking-widest text-primary">
						Lacak Pesanan Anda
					</span>
					<div className="h-px w-6 bg-primary" />
				</div>

				{/* Title */}
				<h1 className="font-serif text-4xl sm:text-5xl font-bold leading-tight tracking-tight text-foreground mb-4">
					Pantau Status{" "}
					<em className="italic text-primary not-italic font-serif">Order</em>{" "}
					Anda Secara Real-time
				</h1>

				{/* Subtitle */}
				<p className="text-base text-muted-foreground leading-relaxed font-light max-w-lg mb-12">
					Masukkan kode order yang Anda terima saat pemesanan untuk melihat
					status terkini dan riwayat perjalanan pesanan Anda.
				</p>

				{/* Search Form */}
				<form
					className="flex w-full max-w-xl bg-card border border-border rounded-xl overflow-hidden shadow-sm focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all"
					onSubmit={handleSearch}
				>
					<input
						type="text"
						placeholder="Contoh: JAH260319001"
						value={orderCode}
						onChange={(e) => setOrderCode(e.target.value.toUpperCase())}
						spellCheck={false}
						autoComplete="off"
						className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-sm font-mono outline-none px-5 py-4"
					/>
					<button
						type="submit"
						className="px-6 py-4 bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors whitespace-nowrap"
					>
						Cek Status
					</button>
				</form>

				<p className="mt-4 text-xs text-muted-foreground">
					Kode order dikirimkan admin saat pesanan Anda diterima.{" "}
					<strong className="text-foreground/60 font-mono">
						Contoh: JAH260320420
					</strong>
				</p>
			</section>

			{/* Footer */}
			<footer className="border-t border-border px-6 py-5">
				<div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-muted-foreground">
					<span>© 2026 Jahitin. Semua hak dilindungi.</span>
					<span>Butuh bantuan? Hubungi kami</span>
				</div>
			</footer>
		</div>
	);
}
