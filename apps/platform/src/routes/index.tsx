import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
		<>
			<style>{`
				@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

				*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

				body {
					font-family: 'DM Sans', sans-serif;
					background: #FAF7F2;
					color: #1C1917;
					min-height: 100vh;
				}

				.page { min-height: 100vh; display: flex; flex-direction: column; }

				.nav {
					padding: 20px 40px;
					display: flex; align-items: center; justify-content: space-between;
					border-bottom: 1px solid #E8E0D5;
					background: #FAF7F2; position: sticky; top: 0; z-index: 10;
				}
				.nav-brand { display: flex; align-items: center; gap: 10px; }
				.nav-logo {
					width: 36px; height: 36px; background: #1C1917;
					border-radius: 8px; display: flex; align-items: center; justify-content: center;
				}
				.nav-name {
					font-family: 'Playfair Display', serif;
					font-size: 1.25rem; font-weight: 700; letter-spacing: -0.02em; color: #1C1917;
				}
				.nav-tagline {
					font-size: 0.75rem; color: #78716C;
					letter-spacing: 0.05em; text-transform: uppercase;
				}
				.nav-admin {
					font-size: 0.8rem; color: #78716C; text-decoration: none;
					padding: 6px 14px; border: 1px solid #D4C9BC; border-radius: 20px; transition: all 0.2s;
				}
				.nav-admin:hover { background: #1C1917; color: #FAF7F2; border-color: #1C1917; }

				.hero {
					flex: 1; display: flex; flex-direction: column; align-items: center;
					justify-content: center;
					padding: 80px 40px;
					max-width: 700px; margin: 0 auto; width: 100%; text-align: center;
				}
				.hero-eyebrow {
					display: inline-flex; align-items: center; gap: 8px;
					font-size: 0.75rem; letter-spacing: 0.12em; text-transform: uppercase;
					color: #A16207; font-weight: 500; margin-bottom: 20px;
				}
				.hero-eyebrow::before, .hero-eyebrow::after {
					content: ''; display: block; width: 24px; height: 1px; background: #A16207;
				}
				.hero-title {
					font-family: 'Playfair Display', serif;
					font-size: clamp(2.2rem, 5vw, 3.2rem);
					font-weight: 700; line-height: 1.15;
					letter-spacing: -0.03em; color: #1C1917; margin-bottom: 16px;
				}
				.hero-title em { font-style: italic; color: #A16207; }
				.hero-sub {
					font-size: 1rem; color: #78716C;
					line-height: 1.6; font-weight: 300; margin-bottom: 48px;
				}

				.search-form {
					display: flex; width: 100%; background: #fff;
					border: 1.5px solid #D4C9BC; border-radius: 12px; overflow: hidden;
					box-shadow: 0 2px 20px rgba(28,25,23,0.06);
					transition: box-shadow 0.2s, border-color 0.2s;
				}
				.search-form:focus-within {
					border-color: #1C1917; box-shadow: 0 4px 24px rgba(28,25,23,0.12);
				}
				.search-input {
					flex: 1; border: none; outline: none; padding: 16px 20px;
					font-family: 'DM Sans', sans-serif; font-size: 1rem;
					background: transparent; color: #1C1917; letter-spacing: 0.04em;
				}
				.search-input::placeholder { color: #A8A29E; }
				.search-btn {
					padding: 16px 28px; background: #1C1917; color: #FAF7F2;
					border: none; cursor: pointer;
					font-family: 'DM Sans', sans-serif; font-size: 0.9rem; font-weight: 500;
					transition: background 0.2s; white-space: nowrap;
				}
				.search-btn:hover { background: #A16207; }

				.search-hint {
					margin-top: 14px; font-size: 0.8rem; color: #A8A29E;
				}
				.search-hint strong { color: #78716C; }

				.page-footer {
					padding: 24px 40px; border-top: 1px solid #E8E0D5;
					display: flex; align-items: center; justify-content: space-between;
					font-size: 0.78rem; color: #A8A29E;
				}

				@media (max-width: 600px) {
					.nav { padding: 16px 20px; }
					.hero { padding: 48px 20px; }
					.page-footer { flex-direction: column; gap: 4px; text-align: center; }
				}
			`}</style>

			<div className="page">
				<nav className="nav">
					<div className="nav-brand">
						<div className="nav-logo">
							<svg
								width="18"
								height="18"
								viewBox="0 0 24 24"
								fill="none"
								stroke="#FAF7F2"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								aria-label="Jahitin logo"
							>
								<title>Jahitin</title>
								<path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
								<line x1="3" y1="6" x2="21" y2="6" />
								<path d="M16 10a4 4 0 01-8 0" />
							</svg>
						</div>
						<div>
							<div className="nav-name">Jahitin</div>
							<div className="nav-tagline">Konveksi Terpercaya</div>
						</div>
					</div>
					<a href="http://localhost:4000" className="nav-admin">
						Admin →
					</a>
				</nav>

				<section className="hero">
					<div className="hero-eyebrow">Lacak Pesanan Anda</div>
					<h1 className="hero-title">
						Pantau Status <em>Order</em> Anda Secara Real-time
					</h1>
					<p className="hero-sub">
						Masukkan kode order yang Anda terima saat pemesanan untuk melihat
						status terkini dan riwayat perjalanan pesanan Anda.
					</p>

					<form className="search-form" onSubmit={handleSearch}>
						<input
							className="search-input"
							type="text"
							placeholder="Contoh: JAH260319001"
							value={orderCode}
							onChange={(e) => setOrderCode(e.target.value.toUpperCase())}
							spellCheck={false}
							autoComplete="off"
						/>
						<button className="search-btn" type="submit">
							Cek Status
						</button>
					</form>
					<p className="search-hint">
						Kode order dikirimkan admin saat pesanan Anda diterima.{" "}
						<strong>Contoh: JAH260320420</strong>
					</p>
				</section>

				<footer className="page-footer">
					<span>© 2026 Jahitin. Semua hak dilindungi.</span>
					<span>Butuh bantuan? Hubungi kami</span>
				</footer>
			</div>
		</>
	);
}
