import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { getOrderByCode, type Order } from "@/utils/api";

export const Route = createFileRoute("/")({ component: App });

const STATUS_FLOW = [
	{ key: "ORDER_DITERIMA", label: "Order Diterima", icon: "✦" },
	{ key: "APPROVAL_SAMPLE", label: "Approval Sample", icon: "◈" },
	{ key: "MENUNGGU_ANTRIAN", label: "Menunggu Antrian", icon: "◎" },
	{ key: "PRODUKSI_BERJALAN", label: "Produksi Berjalan", icon: "◉" },
	{ key: "QUALITY_CHECK", label: "Quality Check", icon: "◈" },
	{ key: "SIAP_DIAMBIL", label: "Siap Diambil", icon: "✦" },
	{ key: "ORDER_SELESAI", label: "Order Selesai", icon: "✔" },
];

const PENDING_STATUS = { key: "PENDING", label: "Pending", icon: "◌" };

function getStatusIndex(status: string): number {
	if (status === "PENDING") return -1;
	return STATUS_FLOW.findIndex((s) => s.key === status);
}

function formatDate(iso: string) {
	return new Date(iso).toLocaleDateString("id-ID", {
		day: "numeric",
		month: "long",
		year: "numeric",
	});
}

function formatDateTime(iso: string) {
	return new Date(iso).toLocaleString("id-ID", {
		day: "numeric",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function OrderCard({ order }: { order: Order }) {
	const currentIndex = getStatusIndex(order.current_status);
	const isPending = order.current_status === "PENDING";
	const hasRevisedDate = !!order.production_issue?.adjust_finished_date;

	return (
		<div
			className="order-result"
			style={{
				animation: "fadeSlideUp 0.5s ease forwards",
			}}
		>
			{/* Header */}
			<div className="result-header">
				<div className="result-header-left">
					<span className="order-code-label">Kode Order</span>
					<h2 className="order-code">{order.order_code}</h2>
				</div>
				<div
					className={`status-badge ${isPending ? "status-pending" : "status-active"}`}
				>
					{isPending ? PENDING_STATUS.label : STATUS_FLOW[currentIndex]?.label}
				</div>
			</div>

			{/* Info Grid */}
			<div className="info-grid">
				<div className="info-item">
					<span className="info-label">Nama Pemesan</span>
					<span className="info-value">{order.customer_name}</span>
				</div>

				{/* Estimasi Selesai — highlight jika direvisi */}
				<div
					className={`info-item ${hasRevisedDate ? "info-item-revised" : ""}`}
				>
					<span className="info-label">
						Estimasi Selesai
						{hasRevisedDate && <span className="revised-tag">Direvisi</span>}
					</span>
					{hasRevisedDate ? (
						<>
							<span className="info-value info-value-revised">
								{/* biome-ignore lint/style/noNonNullAssertion: guarded by hasRevisedDate */}
								{formatDate(order.production_issue!.adjust_finished_date!)}
							</span>
							<span className="info-original-date">
								Semula: {formatDate(order.estimated_finished_date)}
							</span>
						</>
					) : (
						<span className="info-value">
							{formatDate(order.estimated_finished_date)}
						</span>
					)}
				</div>

				<div className="info-item info-full">
					<span className="info-label">Deskripsi Order</span>
					<span className="info-value">{order.order_description}</span>
				</div>
			</div>

			{/* Production Issue Alert */}
			{isPending && order.production_issue && (
				<div className="issue-section">
					<div className="issue-title">
						<span>⚠</span> Kendala Produksi
					</div>
					<div className="issue-grid">
						<div className="issue-item full">
							<span className="issue-label">Kendala</span>
							<span className="issue-value">
								{order.production_issue.issue_description}
							</span>
						</div>
						{order.production_issue.solution && (
							<div className="issue-item full">
								<span className="issue-label">Solusi</span>
								<span className="issue-value">
									{order.production_issue.solution}
								</span>
							</div>
						)}
						{order.production_issue.adjust_finished_date && (
							<div className="issue-item">
								<span className="issue-label">
									Estimasi Penyesuaian Selesai
								</span>
								<span className="issue-value">
									{formatDate(order.production_issue.adjust_finished_date)}
								</span>
							</div>
						)}
						{order.production_issue.is_resolved && (
							<div className="issue-item">
								<span className="issue-resolved">
									✓ Kendala sudah diselesaikan
								</span>
							</div>
						)}
					</div>
				</div>
			)}

			{/* Status Timeline */}
			<div className="timeline-section">
				<h3 className="timeline-title">Perjalanan Order</h3>

				{isPending && (
					<div className="pending-notice">
						<span className="pending-icon">⚠</span>
						<span>
							Order sedang dalam status Pending. Tim kami sedang menangani
							kendala pada pesanan Anda.
						</span>
					</div>
				)}

				<div className="timeline">
					{STATUS_FLOW.map((step, index) => {
						const isDone = !isPending && index <= currentIndex;
						const isCurrent = !isPending && index === currentIndex;
						const update = order.status_updates.find(
							(u) => u.status === step.key,
						);

						return (
							<div
								key={step.key}
								className={`timeline-step ${isDone ? "done" : ""} ${isCurrent ? "current" : ""}`}
							>
								<div className="step-indicator">
									<div className="step-dot">
										{isDone ? (
											<svg
												width="12"
												height="12"
												viewBox="0 0 12 12"
												fill="none"
												aria-hidden="true"
											>
												<path
													d="M2 6l3 3 5-5"
													stroke="currentColor"
													strokeWidth="1.5"
													strokeLinecap="round"
													strokeLinejoin="round"
												/>
											</svg>
										) : (
											<span>{index + 1}</span>
										)}
									</div>
									{index < STATUS_FLOW.length - 1 && (
										<div className={`step-line ${isDone ? "done" : ""}`} />
									)}
								</div>
								<div className="step-content">
									<span className="step-label">{step.label}</span>
									{update && (
										<span className="step-time">
											{formatDateTime(update.created_at)}
										</span>
									)}
									{update?.notes && (
										<span className="step-notes">{update.notes}</span>
									)}
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* Footer */}
			<div className="result-footer">
				<span>Order dibuat pada {formatDate(order.created_at)}</span>
				<span>·</span>
				<span>Terakhir diperbarui {formatDateTime(order.updated_at)}</span>
			</div>
		</div>
	);
}

function App() {
	const [orderCode, setOrderCode] = useState("");
	const [order, setOrder] = useState<Order | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [notFound, setNotFound] = useState(false);

	async function handleSearch(e: React.FormEvent) {
		e.preventDefault();
		if (!orderCode.trim()) return;

		setLoading(true);
		setError(null);
		setNotFound(false);
		setOrder(null);

		try {
			const result = await getOrderByCode(orderCode.trim().toUpperCase());
			if (!result) {
				setNotFound(true);
			} else {
				setOrder(result);
			}
		} catch {
			setError("Terjadi kesalahan saat mengambil data. Coba lagi.");
		} finally {
			setLoading(false);
		}
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

				.page {
					min-height: 100vh;
					display: flex;
					flex-direction: column;
				}

				/* NAV */
				.nav {
					padding: 20px 40px;
					display: flex;
					align-items: center;
					justify-content: space-between;
					border-bottom: 1px solid #E8E0D5;
					background: #FAF7F2;
					position: sticky;
					top: 0;
					z-index: 10;
				}
				.nav-brand {
					display: flex;
					align-items: center;
					gap: 10px;
				}
				.nav-logo {
					width: 36px;
					height: 36px;
					background: #1C1917;
					border-radius: 8px;
					display: flex;
					align-items: center;
					justify-content: center;
				}
				.nav-logo svg { color: #FAF7F2; }
				.nav-name {
					font-family: 'Playfair Display', serif;
					font-size: 1.25rem;
					font-weight: 700;
					letter-spacing: -0.02em;
					color: #1C1917;
				}
				.nav-tagline {
					font-size: 0.75rem;
					color: #78716C;
					font-weight: 400;
					letter-spacing: 0.05em;
					text-transform: uppercase;
				}
				.nav-admin {
					font-size: 0.8rem;
					color: #78716C;
					text-decoration: none;
					padding: 6px 14px;
					border: 1px solid #D4C9BC;
					border-radius: 20px;
					transition: all 0.2s;
				}
				.nav-admin:hover {
					background: #1C1917;
					color: #FAF7F2;
					border-color: #1C1917;
				}

				/* PRODUCTION ISSUE */
				.issue-section {
					background: #FFF7ED;
					border: 1px solid #FED7AA;
					border-top: none;
					padding: 20px 24px;
				}
				.issue-title {
					font-size: 0.8rem;
					font-weight: 600;
					letter-spacing: 0.08em;
					text-transform: uppercase;
					color: #C2410C;
					margin-bottom: 14px;
					display: flex;
					align-items: center;
					gap: 6px;
				}
				.issue-grid {
					display: grid;
					grid-template-columns: 1fr 1fr;
					gap: 12px;
				}
				.issue-item {
					display: flex;
					flex-direction: column;
					gap: 4px;
				}
				.issue-item.full { grid-column: 1 / -1; }
				.issue-label {
					font-size: 0.7rem;
					letter-spacing: 0.08em;
					text-transform: uppercase;
					color: #EA580C;
					font-weight: 500;
				}
				.issue-value {
					font-size: 0.9rem;
					color: #7C2D12;
					line-height: 1.5;
				}
				.issue-resolved {
					display: inline-flex;
					align-items: center;
					gap: 4px;
					font-size: 0.75rem;
					color: #15803D;
					background: #DCFCE7;
					border: 1px solid #BBF7D0;
					padding: 3px 10px;
					border-radius: 20px;
					margin-top: 8px;
				}

				/* HERO */
				.hero {
					padding: 80px 40px 60px;
					max-width: 700px;
					margin: 0 auto;
					width: 100%;
					text-align: center;
				}
				.hero-eyebrow {
					display: inline-flex;
					align-items: center;
					gap: 8px;
					font-size: 0.75rem;
					letter-spacing: 0.12em;
					text-transform: uppercase;
					color: #A16207;
					font-weight: 500;
					margin-bottom: 20px;
				}
				.hero-eyebrow::before, .hero-eyebrow::after {
					content: '';
					display: block;
					width: 24px;
					height: 1px;
					background: #A16207;
				}
				.hero-title {
					font-family: 'Playfair Display', serif;
					font-size: clamp(2.2rem, 5vw, 3.2rem);
					font-weight: 700;
					line-height: 1.15;
					letter-spacing: -0.03em;
					color: #1C1917;
					margin-bottom: 16px;
				}
				.hero-title em {
					font-style: italic;
					color: #A16207;
				}
				.hero-sub {
					font-size: 1rem;
					color: #78716C;
					line-height: 1.6;
					font-weight: 300;
					margin-bottom: 48px;
				}

				/* SEARCH FORM */
				.search-form {
					display: flex;
					gap: 0;
					background: #fff;
					border: 1.5px solid #D4C9BC;
					border-radius: 12px;
					overflow: hidden;
					box-shadow: 0 2px 20px rgba(28, 25, 23, 0.06);
					transition: box-shadow 0.2s, border-color 0.2s;
				}
				.search-form:focus-within {
					border-color: #1C1917;
					box-shadow: 0 4px 24px rgba(28, 25, 23, 0.12);
				}
				.search-input {
					flex: 1;
					border: none;
					outline: none;
					padding: 16px 20px;
					font-family: 'DM Sans', sans-serif;
					font-size: 1rem;
					background: transparent;
					color: #1C1917;
					letter-spacing: 0.04em;
				}
				.search-input::placeholder { color: #A8A29E; }
				.search-btn {
					padding: 16px 28px;
					background: #1C1917;
					color: #FAF7F2;
					border: none;
					cursor: pointer;
					font-family: 'DM Sans', sans-serif;
					font-size: 0.9rem;
					font-weight: 500;
					transition: background 0.2s;
					white-space: nowrap;
					display: flex;
					align-items: center;
					gap: 8px;
				}
				.search-btn:hover { background: #A16207; }
				.search-btn:disabled { opacity: 0.6; cursor: not-allowed; }

				/* STATES */
				.state-box {
					max-width: 700px;
					margin: 0 auto 60px;
					width: 100%;
					padding: 0 40px;
				}
				.error-box {
					background: #FEF2F2;
					border: 1px solid #FECACA;
					color: #DC2626;
					padding: 14px 18px;
					border-radius: 10px;
					font-size: 0.9rem;
				}
				.not-found-box {
					background: #FAFAF9;
					border: 1.5px dashed #D4C9BC;
					border-radius: 14px;
					padding: 48px 24px;
					text-align: center;
				}
				.not-found-icon {
					font-size: 2.5rem;
					margin-bottom: 16px;
					display: block;
				}
				.not-found-title {
					font-family: 'Playfair Display', serif;
					font-size: 1.3rem;
					font-weight: 600;
					color: #1C1917;
					margin-bottom: 8px;
				}
				.not-found-sub { font-size: 0.9rem; color: #78716C; }

				.loading-box {
					text-align: center;
					padding: 48px 24px;
				}
				.spinner {
					width: 36px;
					height: 36px;
					border: 2.5px solid #E8E0D5;
					border-top-color: #1C1917;
					border-radius: 50%;
					animation: spin 0.8s linear infinite;
					margin: 0 auto 16px;
				}
				@keyframes spin { to { transform: rotate(360deg); } }
				.loading-text { font-size: 0.9rem; color: #78716C; }

				/* ORDER RESULT */
				.order-result {
					max-width: 700px;
					margin: 0 auto 80px;
					width: 100%;
					padding: 0 40px;
					opacity: 0;
				}
				@keyframes fadeSlideUp {
					from { opacity: 0; transform: translateY(16px); }
					to { opacity: 1; transform: translateY(0); }
				}

				.result-header {
					display: flex;
					align-items: flex-start;
					justify-content: space-between;
					gap: 16px;
					padding: 28px 28px 24px;
					background: #1C1917;
					border-radius: 16px 16px 0 0;
					color: #FAF7F2;
				}
				.order-code-label {
					font-size: 0.7rem;
					letter-spacing: 0.1em;
					text-transform: uppercase;
					color: #A8A29E;
					display: block;
					margin-bottom: 6px;
				}
				.order-code {
					font-family: 'Playfair Display', serif;
					font-size: 1.6rem;
					font-weight: 700;
					letter-spacing: 0.04em;
				}
				.status-badge {
					padding: 6px 14px;
					border-radius: 20px;
					font-size: 0.78rem;
					font-weight: 500;
					white-space: nowrap;
					flex-shrink: 0;
				}
				.status-active { background: #A16207; color: #FEF3C7; }
				.status-pending { background: #7C3AED; color: #EDE9FE; }

				/* INFO GRID */
				.info-grid {
					display: grid;
					grid-template-columns: 1fr 1fr;
					gap: 1px;
					background: #E8E0D5;
					border: 1px solid #E8E0D5;
					border-top: none;
				}
				.info-item {
					background: #fff;
					padding: 18px 24px;
					display: flex;
					flex-direction: column;
					gap: 4px;
				}
				.info-item-revised {
					background: #FFF7ED;
				}
				.info-full { grid-column: 1 / -1; }
				.info-label {
					font-size: 0.7rem;
					letter-spacing: 0.08em;
					text-transform: uppercase;
					color: #A8A29E;
					font-weight: 500;
					display: flex;
					align-items: center;
					gap: 6px;
				}
				.info-value {
					font-size: 0.95rem;
					color: #1C1917;
					font-weight: 500;
					line-height: 1.4;
				}
				.info-value-revised {
					color: #C2410C;
					font-weight: 600;
				}
				.info-original-date {
					font-size: 0.75rem;
					color: #A8A29E;
					text-decoration: line-through;
				}
				.revised-tag {
					display: inline-block;
					background: #FEF3C7;
					color: #A16207;
					font-size: 0.6rem;
					font-weight: 700;
					padding: 1px 6px;
					border-radius: 4px;
					letter-spacing: 0.06em;
					text-transform: uppercase;
				}

				/* TIMELINE */
				.timeline-section {
					background: #fff;
					border: 1px solid #E8E0D5;
					border-top: none;
					border-radius: 0 0 16px 16px;
					padding: 28px;
				}
				.timeline-title {
					font-family: 'Playfair Display', serif;
					font-size: 1.05rem;
					font-weight: 600;
					color: #1C1917;
					margin-bottom: 24px;
				}
				.pending-notice {
					display: flex;
					align-items: center;
					gap: 10px;
					background: #FFF7ED;
					border: 1px solid #FED7AA;
					color: #C2410C;
					padding: 12px 16px;
					border-radius: 8px;
					font-size: 0.85rem;
					margin-bottom: 24px;
					line-height: 1.5;
				}
				.pending-icon { font-size: 1rem; flex-shrink: 0; }

				.timeline { display: flex; flex-direction: column; gap: 0; }
				.timeline-step {
					display: flex;
					gap: 16px;
					opacity: 0.35;
					transition: opacity 0.2s;
				}
				.timeline-step.done { opacity: 1; }
				.timeline-step.current { opacity: 1; }

				.step-indicator {
					display: flex;
					flex-direction: column;
					align-items: center;
					flex-shrink: 0;
					width: 28px;
				}
				.step-dot {
					width: 28px;
					height: 28px;
					border-radius: 50%;
					background: #E8E0D5;
					color: #A8A29E;
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 0.7rem;
					font-weight: 600;
					flex-shrink: 0;
					transition: all 0.2s;
					z-index: 1;
				}
				.timeline-step.done .step-dot {
					background: #1C1917;
					color: #FAF7F2;
				}
				.timeline-step.current .step-dot {
					background: #A16207;
					color: #fff;
					box-shadow: 0 0 0 4px #FEF3C7;
				}
				.step-line {
					width: 2px;
					flex: 1;
					min-height: 24px;
					background: #E8E0D5;
					margin: 4px 0;
				}
				.step-line.done { background: #1C1917; }

				.step-content {
					padding: 4px 0 28px;
					display: flex;
					flex-direction: column;
					gap: 3px;
				}
				.timeline-step:last-child .step-content { padding-bottom: 4px; }
				.step-label { font-size: 0.9rem; font-weight: 500; color: #1C1917; }
				.timeline-step:not(.done) .step-label { color: #A8A29E; }
				.step-time { font-size: 0.78rem; color: #A8A29E; }
				.step-notes {
					font-size: 0.8rem;
					color: #78716C;
					background: #FAF7F2;
					padding: 6px 10px;
					border-radius: 6px;
					border-left: 2px solid #D4C9BC;
					margin-top: 4px;
					line-height: 1.4;
				}

				/* FOOTER */
				.result-footer {
					display: flex;
					gap: 8px;
					font-size: 0.75rem;
					color: #A8A29E;
					margin-top: 16px;
					justify-content: center;
					flex-wrap: wrap;
				}

				/* PAGE FOOTER */
				.page-footer {
					margin-top: auto;
					padding: 24px 40px;
					border-top: 1px solid #E8E0D5;
					display: flex;
					align-items: center;
					justify-content: space-between;
					font-size: 0.78rem;
					color: #A8A29E;
				}

				@media (max-width: 600px) {
					.nav { padding: 16px 20px; }
					.hero { padding: 48px 20px 40px; }
					.state-box { padding: 0 20px; }
					.order-result { padding: 0 20px; }
					.info-grid { grid-template-columns: 1fr; }
					.result-header { flex-direction: column; }
					.page-footer { flex-direction: column; gap: 4px; text-align: center; }
				}
			`}</style>

			<div className="page">
				{/* Nav */}
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

				{/* Hero */}
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
						<button className="search-btn" type="submit" disabled={loading}>
							{loading ? "Mencari..." : "Cek Status"}
						</button>
					</form>
				</section>

				{/* Loading */}
				{loading && (
					<div className="state-box">
						<div className="loading-box">
							<div className="spinner" />
							<p className="loading-text">Mencari order Anda...</p>
						</div>
					</div>
				)}

				{/* Error */}
				{error && !loading && (
					<div className="state-box">
						<div className="error-box">{error}</div>
					</div>
				)}

				{/* Not Found */}
				{notFound && !loading && (
					<div className="state-box">
						<div className="not-found-box">
							<span className="not-found-icon">◌</span>
							<h3 className="not-found-title">Order Tidak Ditemukan</h3>
							<p className="not-found-sub">
								Kode order <strong>{orderCode}</strong> tidak ditemukan.
								Pastikan kode yang Anda masukkan sudah benar.
							</p>
						</div>
					</div>
				)}

				{/* Result */}
				{order && !loading && <OrderCard order={order} />}

				{/* Footer */}
				<footer className="page-footer">
					<span>© 2026 Jahitin. Semua hak dilindungi.</span>
					<span>Butuh bantuan? Hubungi kami</span>
				</footer>
			</div>
		</>
	);
}
