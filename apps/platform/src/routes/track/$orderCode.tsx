import { createFileRoute, Link } from "@tanstack/react-router";
import { Scissors } from "lucide-react";
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
		<div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
			{/* Nav */}
			<nav className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
				<div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
					<Link to="/" className="flex items-center gap-2.5">
						<div className="bg-primary p-1.5 rounded-lg">
							<Scissors className="h-5 w-5 text-primary-foreground" />
						</div>
						<span className="font-bold text-lg tracking-tight text-foreground">
							Jahitin
						</span>
					</Link>

					<div className="flex items-center gap-2">
						{order && (
							<>
								{/* WhatsApp */}
								<button
									type="button"
									className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-[#25D366] text-white hover:bg-[#1da851] transition-colors border border-transparent"
									onClick={handleShareWhatsApp}
								>
									<svg
										width="13"
										height="13"
										viewBox="0 0 24 24"
										fill="currentColor"
										aria-hidden="true"
									>
										<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
									</svg>
									<span className="hidden sm:inline">WhatsApp</span>
								</button>

								{/* Copy Link */}
								<button
									type="button"
									className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${
										copied
											? "bg-primary text-primary-foreground border-primary"
											: "bg-card text-foreground border-border hover:border-foreground hover:bg-muted"
									}`}
									onClick={handleCopyLink}
								>
									{copied ? "✓" : "⎘"}
									<span className="hidden sm:inline">
										{copied ? "Disalin!" : "Salin Link"}
									</span>
								</button>
							</>
						)}

						<Link
							to="/"
							className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors border border-border px-3 py-1.5 rounded-full hover:bg-muted hover:border-foreground"
						>
							← Cari Lain
						</Link>
					</div>
				</div>
			</nav>

			<main className="flex-1 px-6 py-8">
				<div className="max-w-3xl mx-auto space-y-4">
					{/* Loading Skeleton */}
					{loading && (
						<div className="space-y-1 animate-pulse">
							<div className="bg-muted rounded-t-2xl p-7 flex flex-col gap-3">
								<div className="h-3 bg-muted-foreground/20 rounded w-1/4" />
								<div className="h-7 bg-muted-foreground/20 rounded w-2/5" />
							</div>
							<div className="bg-card border border-border border-t-0 p-6">
								<div className="grid grid-cols-2 gap-4">
									{[1, 2].map((i) => (
										<div key={i} className="space-y-2">
											<div className="h-2.5 bg-muted rounded w-1/3" />
											<div className="h-4 bg-muted rounded w-2/3" />
										</div>
									))}
									<div className="col-span-2 space-y-2">
										<div className="h-2.5 bg-muted rounded w-1/4" />
										<div className="h-4 bg-muted rounded w-3/4" />
									</div>
								</div>
							</div>
							<div className="bg-card border border-border border-t-0 rounded-b-2xl p-7 space-y-6">
								<div className="h-4 bg-muted rounded w-1/3" />
								{[1, 2, 3, 4].map((i) => (
									<div key={i} className="flex gap-4">
										<div className="w-7 h-7 rounded-full bg-muted shrink-0" />
										<div className="flex-1 space-y-1.5 pt-1">
											<div className="h-3.5 bg-muted rounded w-1/3" />
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Not Found */}
					{!loading && notFound && (
						<div className="bg-card border border-dashed border-border rounded-2xl p-16 text-center space-y-4">
							<span className="text-5xl block">◌</span>
							<h2 className="font-serif text-xl font-semibold text-foreground">
								Order Tidak Ditemukan
							</h2>
							<p className="text-sm text-muted-foreground">
								Kode order{" "}
								<strong className="text-foreground">{orderCode}</strong> tidak
								ditemukan. Pastikan kode yang Anda masukkan sudah benar.
							</p>
							<Link
								to="/"
								className="inline-block mt-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors"
							>
								← Coba Kode Lain
							</Link>
						</div>
					)}

					{/* Order Found */}
					{!loading && order && (
						<div className="rounded-2xl overflow-hidden border border-border">
							{/* Dark Header */}
							<div className="flex items-start justify-between gap-4 px-7 py-6 bg-foreground text-background">
								<div>
									<span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 block mb-1.5">
										Kode Order
									</span>
									<h1 className="font-mono text-2xl font-black tracking-wider text-background">
										{order.order_code}
									</h1>
								</div>
								<span
									className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap shrink-0 mt-1 ${
										isPending
											? "bg-purple-500/20 text-purple-200"
											: isFinished
												? "bg-emerald-500/20 text-emerald-200"
												: "bg-amber-500/20 text-amber-200"
									}`}
								>
									{isPending
										? PENDING_STATUS.label
										: STATUS_FLOW[currentIndex]?.label}
								</span>
							</div>

							{/* Refresh Bar */}
							{!isFinished && (
								<div className="flex items-center justify-between px-7 py-2.5 bg-muted/60 border-b border-border text-xs text-muted-foreground">
									<div className="flex items-center gap-2">
										<span
											className={`w-1.5 h-1.5 rounded-full ${isRefreshing ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`}
										/>
										<span>
											{isRefreshing
												? "Memperbarui..."
												: `Diperbarui ${lastUpdated.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`}
										</span>
									</div>
									{!isRefreshing && (
										<span>Refresh dalam {Math.ceil(countdown / 1000)}d</span>
									)}
								</div>
							)}

							{/* Info Grid */}
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border">
								<div className="bg-card px-7 py-5">
									<p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
										Nama Pemesan
									</p>
									<p className="text-sm font-semibold text-foreground">
										{order.customer_name}
									</p>
								</div>

								<div
									className={`px-7 py-5 ${hasRevisedDate ? "bg-orange-50 dark:bg-orange-950/20" : "bg-card"}`}
								>
									<p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 flex items-center gap-2">
										Estimasi Selesai
										{hasRevisedDate && (
											<span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
												Direvisi
											</span>
										)}
									</p>
									{hasRevisedDate ? (
										<>
											<p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
												{formatDate(
													order.production_issue?.adjust_finished_date ?? "",
												)}
											</p>
											<p className="text-xs text-muted-foreground line-through mt-0.5">
												Semula: {formatDate(order.estimated_finished_date)}
											</p>
										</>
									) : (
										<p className="text-sm font-semibold text-foreground">
											{formatDate(order.estimated_finished_date)}
										</p>
									)}
								</div>

								<div className="bg-card px-7 py-5 sm:col-span-2">
									<p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
										Deskripsi Order
									</p>
									<p className="text-sm font-semibold text-foreground leading-relaxed">
										{order.order_description}
									</p>
								</div>
							</div>

							{/* Production Issue */}
							{isPending && order.production_issue && (
								<div className="bg-orange-50 dark:bg-orange-950/20 border-t border-orange-200 dark:border-orange-900/40 px-7 py-5">
									<p className="text-xs font-bold uppercase tracking-widest text-orange-600 dark:text-orange-400 mb-4 flex items-center gap-2">
										<span>⚠</span> Kendala Produksi
									</p>
									<div className="grid sm:grid-cols-2 gap-4">
										<div className="sm:col-span-2">
											<p className="text-[10px] font-bold uppercase tracking-widest text-orange-500 dark:text-orange-400/70 mb-1">
												Kendala
											</p>
											<p className="text-sm text-foreground leading-relaxed">
												{order.production_issue.issue_description}
											</p>
										</div>
										{order.production_issue.solution && (
											<div className="sm:col-span-2">
												<p className="text-[10px] font-bold uppercase tracking-widest text-orange-500 dark:text-orange-400/70 mb-1">
													Solusi
												</p>
												<p className="text-sm text-foreground leading-relaxed">
													{order.production_issue.solution}
												</p>
											</div>
										)}
										{order.production_issue.adjust_finished_date && (
											<div>
												<p className="text-[10px] font-bold uppercase tracking-widest text-orange-500 dark:text-orange-400/70 mb-1">
													Estimasi Penyesuaian Selesai
												</p>
												<p className="text-sm font-semibold text-foreground">
													{formatDate(
														order.production_issue.adjust_finished_date,
													)}
												</p>
											</div>
										)}
										{order.production_issue.is_resolved && (
											<div className="sm:col-span-2">
												<span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 px-3 py-1.5 rounded-full">
													✓ Kendala sudah diselesaikan
												</span>
											</div>
										)}
									</div>
								</div>
							)}

							{/* Timeline */}
							<div className="bg-card border-t border-border px-7 py-6 rounded-b-2xl">
								<h3 className="font-serif text-base font-semibold text-foreground mb-6">
									Perjalanan Order
								</h3>

								{isPending && (
									<div className="flex items-start gap-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/40 text-orange-700 dark:text-orange-400 px-4 py-3 rounded-lg text-sm mb-6 leading-relaxed">
										<span className="shrink-0">⚠</span>
										<span>
											Order sedang dalam status Pending. Tim kami sedang
											menangani kendala pada pesanan Anda.
										</span>
									</div>
								)}

								<div className="flex flex-col">
									{STATUS_FLOW.map((step, index) => {
										const isDone = !isPending && index <= currentIndex;
										const isCurrent = !isPending && index === currentIndex;
										const update = order.status_updates.find(
											(u) => u.status === step.key,
										);
										const isLast = index === STATUS_FLOW.length - 1;

										return (
											<div
												key={step.key}
												className={`flex gap-4 ${isDone || isCurrent ? "opacity-100" : "opacity-35"} transition-opacity`}
											>
												{/* Indicator */}
												<div className="flex flex-col items-center shrink-0 w-7">
													<div
														className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all z-10 ${
															isCurrent
																? "bg-amber-500 border-transparent shadow-[0_0_0_4px_oklch(0.96_0.1_80/0.3)]"
																: isDone
																	? "bg-foreground border-transparent"
																	: "bg-background border-border"
														}`}
													>
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
																	stroke="white"
																	strokeWidth="1.5"
																	strokeLinecap="round"
																	strokeLinejoin="round"
																/>
															</svg>
														) : (
															<span
																className={`text-[10px] font-bold ${isCurrent ? "text-white" : "text-muted-foreground"}`}
															>
																{index + 1}
															</span>
														)}
													</div>
													{!isLast && (
														<div
															className={`w-0.5 flex-1 min-h-6 my-1 rounded-full ${isDone ? "bg-foreground/20" : "bg-border"}`}
														/>
													)}
												</div>

												{/* Content */}
												<div className={`flex-1 ${isLast ? "pb-1" : "pb-6"}`}>
													<div className="flex items-start justify-between gap-2 pt-0.5">
														<span
															className={`text-sm font-semibold ${isDone || isCurrent ? "text-foreground" : "text-muted-foreground"}`}
														>
															{step.label}
														</span>
														{update && (
															<span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0 pt-1">
																{formatDateTime(update.created_at)}
															</span>
														)}
													</div>
													{update?.notes && (
														<p className="mt-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-md border-l-2 border-border leading-relaxed">
															{update.notes}
														</p>
													)}
												</div>
											</div>
										);
									})}
								</div>
							</div>

							{/* Footer info */}
							<div className="flex items-center justify-center gap-3 text-xs text-muted-foreground py-4 border-t border-border bg-muted/30">
								<span>Order dibuat pada {formatDate(order.created_at)}</span>
								<span>·</span>
								<span>
									Terakhir diperbarui {formatDateTime(order.updated_at)}
								</span>
							</div>
						</div>
					)}
				</div>
			</main>

			{/* Footer */}
			<footer className="border-t border-border px-6 py-5 mt-auto">
				<div className="max-w-3xl mx-auto flex items-center justify-between text-xs text-muted-foreground">
					<span>© 2026 Jahitin. Semua hak dilindungi.</span>
					<span>Butuh bantuan? Hubungi kami</span>
				</div>
			</footer>
		</div>
	);
}
