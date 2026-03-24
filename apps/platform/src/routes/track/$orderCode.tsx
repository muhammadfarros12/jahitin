import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { getOrderByCode, type Order } from "@/utils/api";

export const Route = createFileRoute("/track/$orderCode")({
	component: TrackingPage,
});

const POLL_INTERVAL_MS = 30_000;

const STATUS_FLOW = [
	{ key: "ORDER_DITERIMA", label: "Order Diterima" },
	{ key: "APPROVAL_SAMPLE", label: "Approval Sample" },
	{ key: "MENUNGGU_ANTRIAN", label: "Menunggu Antrian" },
	{ key: "PRODUKSI_BERJALAN", label: "Produksi Berjalan" },
	{ key: "QUALITY_CHECK", label: "Quality Check" },
	{ key: "SIAP_DIAMBIL", label: "Siap Diambil" },
	{ key: "ORDER_SELESAI", label: "Order Selesai" },
];

const PENDING_STATUS = { key: "PENDING", label: "Pending" };

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

function buildWhatsAppMessage(order: Order): string {
	const trackingUrl = window.location.href;
	const statusLabel =
		order.current_status === "PENDING"
			? "Pending"
			: (STATUS_FLOW.find((s) => s.key === order.current_status)?.label ??
				order.current_status);

	return (
		`Halo ${order.customer_name}! 👋\n\n` +
		`Berikut update terbaru untuk order Anda di *Jahitin*:\n\n` +
		`📦 *Kode Order:* ${order.order_code}\n` +
		`📋 *Status:* ${statusLabel}\n\n` +
		`Pantau progres order Anda secara real-time di link berikut:\n` +
		`${trackingUrl}\n\n` +
		`Terima kasih sudah mempercayakan jahitan Anda kepada kami! 🙏`
	);
}

function TrackingPage() {
	const { orderCode } = Route.useParams();

	const [order, setOrder] = useState<Order | null>(null);
	const [loading, setLoading] = useState(true);
	const [notFound, setNotFound] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
	const [countdown, setCountdown] = useState(POLL_INTERVAL_MS);
	const [copied, setCopied] = useState(false);

	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

	// function clearPolling() {
	// 	if (intervalRef.current) clearInterval(intervalRef.current);
	// 	if (countdownRef.current) clearInterval(countdownRef.current);
	// }

	// 1. Bungkus dengan useCallback agar referensinya stabil
	const clearPolling = useCallback(() => {
		if (intervalRef.current) clearInterval(intervalRef.current);
		if (countdownRef.current) clearInterval(countdownRef.current);
	}, []);

	const fetchOrder = useCallback(
		async (silent = false) => {
			if (!silent) setLoading(true);
			else setIsRefreshing(true);

			try {
				const result = await getOrderByCode(orderCode);
				if (!result) {
					setNotFound(true);
					setOrder(null);
					clearPolling();
				} else {
					setOrder(result);
					setNotFound(false);
					setLastUpdated(new Date());
					setCountdown(POLL_INTERVAL_MS);
					if (result.current_status === "ORDER_SELESAI") clearPolling();
				}
			} finally {
				if (!silent) setLoading(false);
				else setIsRefreshing(false);
			}
		},
		[orderCode, clearPolling],
	);

	// 3. Tambahkan dependensi clearPolling dan fetchOrder
	const startPolling = useCallback(() => {
		clearPolling();
		setCountdown(POLL_INTERVAL_MS);

		countdownRef.current = setInterval(() => {
			setCountdown((prev) => Math.max(0, prev - 1000));
		}, 1000);

		intervalRef.current = setInterval(() => {
			fetchOrder(true);
		}, POLL_INTERVAL_MS);
	}, [clearPolling, fetchOrder]);

	// function startPolling() {
	// 	clearPolling();
	// 	setCountdown(POLL_INTERVAL_MS);

	// 	countdownRef.current = setInterval(() => {
	// 		setCountdown((prev) => Math.max(0, prev - 1000));
	// 	}, 1000);

	// 	intervalRef.current = setInterval(() => {
	// 		fetchOrder(true);
	// 	}, POLL_INTERVAL_MS);
	// }

	// async function fetchOrder(silent = false) {
	// 	if (!silent) setLoading(true);
	// 	else setIsRefreshing(true);

	// 	try {
	// 		const result = await getOrderByCode(orderCode);
	// 		if (!result) {
	// 			setNotFound(true);
	// 			setOrder(null);
	// 			clearPolling();
	// 		} else {
	// 			setOrder(result);
	// 			setNotFound(false);
	// 			setLastUpdated(new Date());
	// 			setCountdown(POLL_INTERVAL_MS);
	// 			if (result.current_status === "ORDER_SELESAI") clearPolling();
	// 		}
	// 	} finally {
	// 		if (!silent) setLoading(false);
	// 		else setIsRefreshing(false);
	// 	}
	// }

	// biome-ignore lint/correctness/useExhaustiveDependencies: orderCode is stable
	useEffect(() => {
		fetchOrder();
		return () => clearPolling();
	}, [orderCode]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: intentional
	useEffect(() => {
		if (order && order.current_status !== "ORDER_SELESAI") startPolling();
	}, [order?.order_code]);

	function handleCopyLink() {
		navigator.clipboard.writeText(window.location.href);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}

	function handleShareWhatsApp() {
		if (!order) return;
		const message = buildWhatsAppMessage(order);
		window.open(
			`https://wa.me/?text=${encodeURIComponent(message)}`,
			"_blank",
			"noopener,noreferrer",
		);
	}

	const currentIndex = order ? getStatusIndex(order.current_status) : -1;
	const isPending = order?.current_status === "PENDING";
	const isFinished = order?.current_status === "ORDER_SELESAI";
	const hasRevisedDate = !!order?.production_issue?.adjust_finished_date;

	return (
		<>
			<style>{`
				@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

				*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
				body { font-family: 'DM Sans', sans-serif; background: #FAF7F2; color: #1C1917; min-height: 100vh; }
				.page { min-height: 100vh; display: flex; flex-direction: column; }

				.nav {
					padding: 16px 40px; display: flex; align-items: center; justify-content: space-between;
					border-bottom: 1px solid #E8E0D5; background: #FAF7F2; position: sticky; top: 0; z-index: 10;
				}
				.nav-brand { display: flex; align-items: center; gap: 10px; text-decoration: none; color: inherit; }
				.nav-logo {
					width: 32px; height: 32px; background: #1C1917; border-radius: 7px;
					display: flex; align-items: center; justify-content: center;
				}
				.nav-name { font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 700; letter-spacing: -0.02em; color: #1C1917; }
				.nav-right { display: flex; align-items: center; gap: 8px; }
				.nav-back {
					font-size: 0.8rem; color: #78716C; text-decoration: none;
					padding: 6px 14px; border: 1px solid #D4C9BC; border-radius: 20px; transition: all 0.2s;
				}
				.nav-back:hover { background: #1C1917; color: #FAF7F2; border-color: #1C1917; }
				.nav-btn {
					font-size: 0.8rem; font-weight: 500; padding: 6px 14px; border-radius: 20px; cursor: pointer;
					border: 1px solid #D4C9BC; background: #fff; color: #1C1917;
					transition: all 0.2s; display: flex; align-items: center; gap: 5px; white-space: nowrap;
				}
				.nav-btn:hover { border-color: #1C1917; }
				.nav-btn.copied { background: #1C1917; color: #FAF7F2; border-color: #1C1917; }
				.nav-btn.wa { background: #25D366; color: #fff; border-color: #25D366; }
				.nav-btn.wa:hover { background: #1da851; border-color: #1da851; }

				.main { flex: 1; padding: 40px; max-width: 700px; margin: 0 auto; width: 100%; }

				/* SKELETON */
				.skeleton-wrap { display: flex; flex-direction: column; gap: 1px; }
				.skeleton-header { background: #E8E0D5; border-radius: 16px 16px 0 0; padding: 28px; display: flex; flex-direction: column; gap: 10px; }
				.skeleton-body { background: #fff; border: 1px solid #E8E0D5; border-top: none; padding: 24px; }
				.skeleton-footer { background: #fff; border: 1px solid #E8E0D5; border-top: none; border-radius: 0 0 16px 16px; padding: 28px; }
				.skel {
					background: linear-gradient(90deg, #E8E0D5 25%, #F5F0EA 50%, #E8E0D5 75%);
					background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 6px;
				}
				@keyframes shimmer { to { background-position: -200% 0; } }

				/* NOT FOUND */
				.not-found { text-align: center; padding: 80px 24px; background: #fff; border: 1.5px dashed #D4C9BC; border-radius: 16px; }
				.not-found-icon { font-size: 3rem; margin-bottom: 16px; display: block; }
				.not-found-title { font-family: 'Playfair Display', serif; font-size: 1.4rem; font-weight: 600; color: #1C1917; margin-bottom: 8px; }
				.not-found-sub { font-size: 0.9rem; color: #78716C; margin-bottom: 24px; }
				.not-found-btn { display: inline-block; padding: 10px 24px; background: #1C1917; color: #FAF7F2; border-radius: 10px; font-size: 0.9rem; font-weight: 500; text-decoration: none; transition: background 0.2s; }
				.not-found-btn:hover { background: #A16207; }

				/* ORDER CARD */
				.order-card { border-radius: 16px; overflow: hidden; }
				.result-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 28px 28px 24px; background: #1C1917; color: #FAF7F2; }
				.order-code-label { font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase; color: #A8A29E; display: block; margin-bottom: 6px; }
				.order-code { font-family: 'Playfair Display', serif; font-size: 1.6rem; font-weight: 700; letter-spacing: 0.04em; }
				.status-badge { padding: 6px 14px; border-radius: 20px; font-size: 0.78rem; font-weight: 500; white-space: nowrap; flex-shrink: 0; }
				.status-active { background: #A16207; color: #FEF3C7; }
				.status-pending { background: #7C3AED; color: #EDE9FE; }
				.status-done { background: #15803D; color: #DCFCE7; }

				/* REFRESH BAR */
				.refresh-bar { display: flex; align-items: center; justify-content: space-between; padding: 8px 24px; background: #F5F5F4; border: 1px solid #E8E0D5; border-top: none; font-size: 0.75rem; color: #78716C; }
				.refresh-bar-left { display: flex; align-items: center; gap: 6px; }
				.refresh-dot { width: 6px; height: 6px; border-radius: 50%; background: #22C55E; flex-shrink: 0; }
				.refresh-dot.refreshing { background: #A16207; animation: pulse 1s ease-in-out infinite; }
				@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
				.refresh-countdown { color: #A8A29E; font-size: 0.7rem; }

				/* INFO GRID */
				.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: #E8E0D5; border: 1px solid #E8E0D5; border-top: none; }
				.info-item { background: #fff; padding: 18px 24px; display: flex; flex-direction: column; gap: 4px; }
				.info-item-revised { background: #FFF7ED; }
				.info-full { grid-column: 1 / -1; }
				.info-label { font-size: 0.7rem; letter-spacing: 0.08em; text-transform: uppercase; color: #A8A29E; font-weight: 500; display: flex; align-items: center; gap: 6px; }
				.info-value { font-size: 0.95rem; color: #1C1917; font-weight: 500; line-height: 1.4; }
				.info-value-revised { color: #C2410C; font-weight: 600; }
				.info-original-date { font-size: 0.75rem; color: #A8A29E; text-decoration: line-through; }
				.revised-tag { display: inline-block; background: #FEF3C7; color: #A16207; font-size: 0.6rem; font-weight: 700; padding: 1px 6px; border-radius: 4px; letter-spacing: 0.06em; text-transform: uppercase; }

				/* PRODUCTION ISSUE */
				.issue-section { background: #FFF7ED; border: 1px solid #FED7AA; border-top: none; padding: 20px 24px; }
				.issue-title { font-size: 0.8rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #C2410C; margin-bottom: 14px; display: flex; align-items: center; gap: 6px; }
				.issue-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
				.issue-item { display: flex; flex-direction: column; gap: 4px; }
				.issue-item.full { grid-column: 1 / -1; }
				.issue-label { font-size: 0.7rem; letter-spacing: 0.08em; text-transform: uppercase; color: #EA580C; font-weight: 500; }
				.issue-value { font-size: 0.9rem; color: #7C2D12; line-height: 1.5; }
				.issue-resolved { display: inline-flex; align-items: center; gap: 4px; font-size: 0.75rem; color: #15803D; background: #DCFCE7; border: 1px solid #BBF7D0; padding: 3px 10px; border-radius: 20px; margin-top: 8px; }

				/* TIMELINE */
				.timeline-section { background: #fff; border: 1px solid #E8E0D5; border-top: none; border-radius: 0 0 16px 16px; padding: 28px; }
				.timeline-title { font-family: 'Playfair Display', serif; font-size: 1.05rem; font-weight: 600; color: #1C1917; margin-bottom: 24px; }
				.pending-notice { display: flex; align-items: center; gap: 10px; background: #FFF7ED; border: 1px solid #FED7AA; color: #C2410C; padding: 12px 16px; border-radius: 8px; font-size: 0.85rem; margin-bottom: 24px; line-height: 1.5; }
				.timeline { display: flex; flex-direction: column; }
				.timeline-step { display: flex; gap: 16px; opacity: 0.35; transition: opacity 0.2s; }
				.timeline-step.done { opacity: 1; }
				.timeline-step.current { opacity: 1; }
				.step-indicator { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; width: 28px; }
				.step-dot { width: 28px; height: 28px; border-radius: 50%; background: #E8E0D5; color: #A8A29E; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 600; flex-shrink: 0; transition: all 0.2s; z-index: 1; }
				.timeline-step.done .step-dot { background: #1C1917; color: #FAF7F2; }
				.timeline-step.current .step-dot { background: #A16207; color: #fff; box-shadow: 0 0 0 4px #FEF3C7; }
				.step-line { width: 2px; flex: 1; min-height: 24px; background: #E8E0D5; margin: 4px 0; }
				.step-line.done { background: #1C1917; }
				.step-content { padding: 4px 0 28px; display: flex; flex-direction: column; gap: 3px; }
				.timeline-step:last-child .step-content { padding-bottom: 4px; }
				.step-label { font-size: 0.9rem; font-weight: 500; color: #1C1917; }
				.timeline-step:not(.done) .step-label { color: #A8A29E; }
				.step-time { font-size: 0.78rem; color: #A8A29E; }
				.step-notes { font-size: 0.8rem; color: #78716C; background: #FAF7F2; padding: 6px 10px; border-radius: 6px; border-left: 2px solid #D4C9BC; margin-top: 4px; line-height: 1.4; }

				.result-footer { display: flex; gap: 8px; font-size: 0.75rem; color: #A8A29E; margin-top: 16px; justify-content: center; flex-wrap: wrap; }
				.page-footer { padding: 24px 40px; border-top: 1px solid #E8E0D5; display: flex; align-items: center; justify-content: space-between; font-size: 0.78rem; color: #A8A29E; }

				@media (max-width: 600px) {
					.nav { padding: 14px 20px; }
					.btn-label { display: none; }
					.main { padding: 24px 20px; }
					.info-grid { grid-template-columns: 1fr; }
					.result-header { flex-direction: column; }
					.page-footer { flex-direction: column; gap: 4px; text-align: center; }
				}
			`}</style>

			<div className="page">
				<nav className="nav">
					<Link to="/" className="nav-brand">
						<div className="nav-logo">
							<svg
								width="16"
								height="16"
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
						<div className="nav-name">Jahitin</div>
					</Link>
					<div className="nav-right">
						{order && (
							<>
								<button
									type="button"
									className="nav-btn wa"
									onClick={handleShareWhatsApp}
								>
									<svg
										width="14"
										height="14"
										viewBox="0 0 24 24"
										fill="currentColor"
										aria-hidden="true"
									>
										<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
									</svg>
									<span className="btn-label">Kirim ke WhatsApp</span>
								</button>
								<button
									type="button"
									className={`nav-btn ${copied ? "copied" : ""}`}
									onClick={handleCopyLink}
								>
									{copied ? "✓" : "⎘"}
									<span className="btn-label">
										{copied ? "Disalin!" : "Salin Link"}
									</span>
								</button>
							</>
						)}
						<Link to="/" className="nav-back">
							← Cari Lain
						</Link>
					</div>
				</nav>

				<main className="main">
					{loading && (
						<div className="skeleton-wrap">
							<div className="skeleton-header">
								<div className="skel" style={{ height: 14, width: "30%" }} />
								<div className="skel" style={{ height: 28, width: "50%" }} />
							</div>
							<div className="skeleton-body">
								<div
									style={{
										display: "grid",
										gridTemplateColumns: "1fr 1fr",
										gap: 16,
									}}
								>
									<div className="skel" style={{ height: 48 }} />
									<div className="skel" style={{ height: 48 }} />
									<div
										className="skel"
										style={{ height: 48, gridColumn: "1 / -1" }}
									/>
								</div>
							</div>
							<div className="skeleton-footer">
								<div
									className="skel"
									style={{ height: 16, width: "40%", marginBottom: 24 }}
								/>
								{[1, 2, 3, 4].map((i) => (
									<div
										key={i}
										style={{ display: "flex", gap: 16, marginBottom: 24 }}
									>
										<div
											className="skel"
											style={{
												width: 28,
												height: 28,
												borderRadius: "50%",
												flexShrink: 0,
											}}
										/>
										<div className="skel" style={{ height: 20, flex: 1 }} />
									</div>
								))}
							</div>
						</div>
					)}

					{!loading && notFound && (
						<div className="not-found">
							<span className="not-found-icon">◌</span>
							<h2 className="not-found-title">Order Tidak Ditemukan</h2>
							<p className="not-found-sub">
								Kode order <strong>{orderCode}</strong> tidak ditemukan.
								Pastikan kode yang Anda masukkan sudah benar.
							</p>
							<Link to="/" className="not-found-btn">
								← Coba Kode Lain
							</Link>
						</div>
					)}

					{!loading && order && (
						<div className="order-card">
							<div className="result-header">
								<div>
									<span className="order-code-label">Kode Order</span>
									<h1 className="order-code">{order.order_code}</h1>
								</div>
								<div
									className={`status-badge ${isPending ? "status-pending" : isFinished ? "status-done" : "status-active"}`}
								>
									{isPending
										? PENDING_STATUS.label
										: STATUS_FLOW[currentIndex]?.label}
								</div>
							</div>

							{!isFinished && (
								<div className="refresh-bar">
									<div className="refresh-bar-left">
										<span
											className={`refresh-dot ${isRefreshing ? "refreshing" : ""}`}
										/>
										<span>
											{isRefreshing
												? "Memperbarui..."
												: `Diperbarui ${lastUpdated.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`}
										</span>
									</div>
									{!isRefreshing && (
										<span className="refresh-countdown">
											Refresh dalam {Math.ceil(countdown / 1000)}d
										</span>
									)}
								</div>
							)}

							<div className="info-grid">
								<div className="info-item">
									<span className="info-label">Nama Pemesan</span>
									<span className="info-value">{order.customer_name}</span>
								</div>
								<div
									className={`info-item ${hasRevisedDate ? "info-item-revised" : ""}`}
								>
									<span className="info-label">
										Estimasi Selesai
										{hasRevisedDate && (
											<span className="revised-tag">Direvisi</span>
										)}
									</span>
									{hasRevisedDate ? (
										<>
											<span className="info-value info-value-revised">
												{formatDate(
													order.production_issue?.adjust_finished_date ?? "",
												)}
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
													{formatDate(
														order.production_issue.adjust_finished_date,
													)}
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

							<div className="timeline-section">
								<h3 className="timeline-title">Perjalanan Order</h3>
								{isPending && (
									<div className="pending-notice">
										<span>⚠</span>
										<span>
											Order sedang dalam status Pending. Tim kami sedang
											menangani kendala pada pesanan Anda.
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
														<div
															className={`step-line ${isDone ? "done" : ""}`}
														/>
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

							<div className="result-footer">
								<span>Order dibuat pada {formatDate(order.created_at)}</span>
								<span>·</span>
								<span>
									Terakhir diperbarui {formatDateTime(order.updated_at)}
								</span>
							</div>
						</div>
					)}
				</main>

				<footer className="page-footer">
					<span>© 2026 Jahitin. Semua hak dilindungi.</span>
					<span>Butuh bantuan? Hubungi kami</span>
				</footer>
			</div>
		</>
	);
}
