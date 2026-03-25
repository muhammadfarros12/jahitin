"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import {
	AlertCircle,
	Calendar as CalendarIcon,
	CheckCircle2,
	Clock,
	Edit,
	ExternalLink,
	History,
	MoreHorizontal,
	Plus,
	RefreshCcw,
	Search,
	Shirt,
	Trash2,
	User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";
import { apiClient } from "@/utils/api";
import { fetchOrderStats, fetchOrders } from "@/utils/orders";

export const Route = createFileRoute("/_admin/dashboard")({
	component: DashboardPage,
});

const STATUS_LABELS: Record<OrderStatus, { label: string; color: string }> = {
	ORDER_DITERIMA: {
		label: "Order Diterima",
		color: "badge-status-order-diterima",
	},
	APPROVAL_SAMPLE: {
		label: "Approval Sample",
		color: "badge-status-approval-sample",
	},
	MENUNGGU_ANTRIAN: {
		label: "Menunggu Antrian",
		color: "badge-status-menunggu-antrian",
	},
	PRODUKSI_BERJALAN: {
		label: "Produksi Berjalan",
		color: "badge-status-produksi-berjalan",
	},
	PENDING: { label: "Pending", color: "badge-status-pending" },
	QUALITY_CHECK: {
		label: "Quality Check",
		color: "badge-status-quality-check",
	},
	SIAP_DIAMBIL: { label: "Siap Diambil", color: "badge-status-siap-diambil" },
	ORDER_SELESAI: { label: "Selesai", color: "badge-status-order-selesai" },
};

const STATUS_DOT_CLASSES: Record<OrderStatus, string> = {
	ORDER_DITERIMA: "timeline-dot-status-order-diterima",
	APPROVAL_SAMPLE: "timeline-dot-status-approval-sample",
	MENUNGGU_ANTRIAN: "timeline-dot-status-menunggu-antrian",
	PRODUKSI_BERJALAN: "timeline-dot-status-produksi-berjalan",
	PENDING: "timeline-dot-status-pending",
	QUALITY_CHECK: "timeline-dot-status-quality-check",
	SIAP_DIAMBIL: "timeline-dot-status-siap-diambil",
	ORDER_SELESAI: "timeline-dot-status-order-selesai",
};

function DashboardPage() {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");

	// Debounce search
	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedSearch(search);
		}, 500);
		return () => clearTimeout(handler);
	}, [search]);

	const [sortBy, setSortBy] = useState("newest");
	const [statusFilter, setStatusFilter] = useState<string>("ALL");
	const [deleteId, setDeleteId] = useState<number | null>(null);
	const [editOrder, setEditOrder] = useState<Order | null>(null);
	const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
	const [selectedOrderDetails, setSelectedOrderDetails] =
		useState<Order | null>(null);
	const [updatingOrder, setUpdatingOrder] = useState<Order | null>(null);
	const [newStatus, setNewStatus] = useState<OrderStatus | null>(null);
	const [statusNotes, setStatusNotes] = useState("");
	const [issueDesc, setIssueDesc] = useState("");
	const [issueSolution, setIssueSolution] = useState("");
	const [issueAdjDate, setIssueAdjDate] = useState("");
	const [issueIsResolved, setIssueIsResolved] = useState(false);
	const [isUpdateStatusSheetOpen, setIsUpdateStatusSheetOpen] = useState(false);

	// Form state for create/edit
	const [formName, setFormName] = useState("");
	const [formDesc, setFormDesc] = useState("");
	const [formDate, setFormDate] = useState("");

	const [page, setPage] = useState(1);
	const itemsPerPage = 10;

	// Reset page when filters change
	useEffect(() => {
		setPage(1);
	}, []);

	const { data: apiResponse, isLoading } = useQuery({
		queryKey: ["orders", page, debouncedSearch, sortBy, statusFilter],
		queryFn: () => {
			return fetchOrders({
				page,
				limit: itemsPerPage,
				search: debouncedSearch,
				status: statusFilter,
				sortBy,
			});
		},
	});

	const orders = apiResponse?.data ?? [];
	const totalItems = apiResponse?.total ?? 0;
	const totalPages = Math.ceil(totalItems / itemsPerPage);

	const { data: statsData } = useQuery<{
		total: number;
		production: number;
		pending: number;
		completed: number;
	}>({
		queryKey: ["order-stats"],
		queryFn: fetchOrderStats,
	});

	const stats = {
		total: statsData?.total ?? 0,
		produksi: statsData?.production ?? 0,
		pending: statsData?.pending ?? 0,
		selesai: statsData?.completed ?? 0,
	};

	const { mutate: createOrder, isPending: isCreating } = useMutation({
		mutationFn: async () => {
			const res = await apiClient.api.orders.$post(
				{
					json: {
						customer_name: formName,
						order_description: formDesc,
						estimated_finished_date: formDate,
					},
				},
				{ headers: { Authorization: `Bearer ${token}` } },
			);
			if (!res.ok) throw new Error("Gagal membuat order");
			return res.json();
		},
		onSuccess: () => {
			toast.success("Order berhasil dibuat");
			queryClient.invalidateQueries({ queryKey: ["orders"] });
			queryClient.invalidateQueries({ queryKey: ["order-stats"] });
			setIsCreateSheetOpen(false);
			setFormName("");
			setFormDesc("");
			setFormDate("");
		},
		onError: () => toast.error("Gagal membuat order"),
	});

	const { mutate: updateOrderDetails, isPending: isUpdatingOrder } =
		useMutation({
			mutationFn: async () => {
				if (!editOrder?.id) return;

				// Only send defined fields
				const jsonBody: {
					customer_name?: string;
					order_description?: string;
					estimated_finished_date?: string;
				} = {
					customer_name: formName || undefined,
					order_description: formDesc || undefined,
				};

				if (formDate) {
					jsonBody.estimated_finished_date = formDate;
				}

				const res = await (apiClient.api.orders as any)[":id"].$patch(
					{
						param: { id: editOrder.id.toString() },
						json: jsonBody,
					},
					{ headers: { Authorization: `Bearer ${token}` } },
				);

				if (!res.ok) {
					const errorData = await res
						.json()
						.catch(() => ({ message: "Gagal memperbarui order" }));
					throw new Error(errorData.message || "Gagal memperbarui order");
				}

				return res.json();
			},
			onSuccess: () => {
				toast.success("Order berhasil diperbarui");
				queryClient.invalidateQueries({ queryKey: ["orders"] });
				queryClient.invalidateQueries({ queryKey: ["order-stats"] });
				setEditOrder(null);
				setIsCreateSheetOpen(false);
				setFormName("");
				setFormDesc("");
				setFormDate("");
			},
			onError: (err: unknown) =>
				toast.error((err as Error).message || "Gagal memperbarui order"),
		});

	const { mutate: deleteOrder, isPending: isDeleting } = useMutation({
		mutationFn: async (id: number) => {
			const res = await (apiClient.api.orders as any)[":id"].$delete(
				{ param: { id: String(id) } },
				{ headers: { Authorization: `Bearer ${token}` } },
			);
			if (!res.ok) throw new Error("Gagal menghapus order");
		},
		onSuccess: () => {
			toast.success("Order berhasil dihapus");
			queryClient.invalidateQueries({ queryKey: ["orders"] });
			queryClient.invalidateQueries({ queryKey: ["order-stats"] });
			setDeleteId(null);
		},
		onError: () => toast.error("Gagal menghapus order"),
	});

	const { mutate: updateStatus, isPending: isUpdating } = useMutation({
		mutationFn: async () => {
			if (!updatingOrder) return;
			const status = newStatus ?? updatingOrder.current_status;
			const body: {
				status: string;
				notes?: string;
				issue_description?: string;
				solution?: string;
				is_resolved?: boolean;
				adjust_finished_date?: string;
			} = { status, notes: statusNotes || undefined };
			if (status === "PENDING") {
				body.issue_description = issueDesc;
				body.solution = issueSolution;
				body.is_resolved = issueIsResolved;
				if (issueAdjDate) {
					body.adjust_finished_date = issueAdjDate;
				}
			}
			const res = await (apiClient.api.orders as any)[":id"][
				"status-updates"
			].$post(
				{ param: { id: String(updatingOrder.id) }, json: body },
				{ headers: { Authorization: `Bearer ${token}` } },
			);
			if (!res.ok) throw new Error("Gagal update status");
		},
		onSuccess: () => {
			toast.success("Status berhasil diperbarui");
			queryClient.invalidateQueries({ queryKey: ["orders"] });
			queryClient.invalidateQueries({ queryKey: ["order-stats"] });
			setIsUpdateStatusSheetOpen(false);
			setUpdatingOrder(null);
			setNewStatus(null);
			setStatusNotes("");
			setIssueDesc("");
			setIssueSolution("");
			setIssueAdjDate("");
			setIssueIsResolved(false);
		},
		onError: () => toast.error("Gagal memperbarui status"),
	});

	const openEdit = (order: Order) => {
		setEditOrder(order);
		setFormName(order.customer_name);
		setFormDesc(order.order_description);
		setFormDate(
			new Date(order.estimated_finished_date).toISOString().split("T")[0],
		);
	};

	return (
		<div className="space-y-8">
			{/* Statistical Overview */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				{/* Total Order */}
				<Card className="relative overflow-hidden border border-border bg-card shadow-none h-[120px]">
					<CardContent className="p-5 h-full flex flex-col">
						<p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
							Total Order
						</p>
						<div className="flex-1 flex items-center justify-between">
							<div className="relative">
								<div className="absolute -left-5 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-foreground/20" />
								<div className="text-4xl font-bold tracking-tight tabular-nums text-foreground">
									{stats.total}
								</div>
							</div>
							<div className="p-2.5 rounded-md bg-muted border border-border/50">
								<Shirt className="h-5 w-5 text-foreground/70" />
							</div>
						</div>
						<p className="text-[9px] font-medium text-muted-foreground/60 uppercase tracking-wider mt-auto">
							Total Order Masuk
						</p>
					</CardContent>
				</Card>

				{/* Dalam Produksi */}
				<Card className="relative overflow-hidden border border-border bg-card shadow-none h-[120px]">
					<CardContent className="p-5 h-full flex flex-col">
						<p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
							Dalam Produksi
						</p>
						<div className="flex-1 flex items-center justify-between">
							<div className="relative">
								<div className="absolute -left-5 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-stat-warning" />
								<div className="text-4xl font-bold tracking-tight tabular-nums text-stat-warning">
									{stats.produksi}
								</div>
							</div>
							<div className="p-2.5 rounded-md bg-stat-warning/10 border border-stat-warning/20">
								<Clock className="h-5 w-5 text-stat-warning" />
							</div>
						</div>
						<p className="text-[9px] font-medium text-muted-foreground/60 uppercase tracking-wider mt-auto">
							Sedang dikerjakan tim
						</p>
					</CardContent>
				</Card>

				{/* Pending */}
				<Card className="relative overflow-hidden border border-border bg-card shadow-none h-[120px]">
					<CardContent className="p-5 h-full flex flex-col">
						<p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
							Pending
						</p>
						<div className="flex-1 flex items-center justify-between">
							<div className="relative">
								<div className="absolute -left-5 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-stat-danger" />
								<div className="text-4xl font-bold tracking-tight tabular-nums text-stat-danger">
									{stats.pending}
								</div>
							</div>
							<div className="p-2.5 rounded-md bg-stat-danger/10 border border-stat-danger/20">
								<AlertCircle className="h-5 w-5 text-stat-danger" />
							</div>
						</div>
						<p className="text-[9px] font-medium text-muted-foreground/60 uppercase tracking-wider mt-auto">
							Keterlambatan Produksi
						</p>
					</CardContent>
				</Card>

				{/* Selesai */}
				<Card className="relative overflow-hidden border border-border bg-card shadow-none h-[120px]">
					<CardContent className="p-5 h-full flex flex-col">
						<p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
							Selesai
						</p>
						<div className="flex-1 flex items-center justify-between">
							<div className="relative">
								<div className="absolute -left-5 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-stat-success" />
								<div className="text-4xl font-bold tracking-tight tabular-nums text-stat-success">
									{stats.selesai}
								</div>
							</div>
							<div className="p-2.5 rounded-md bg-stat-success/10 border border-stat-success/20">
								<CheckCircle2 className="h-5 w-5 text-stat-success" />
							</div>
						</div>
						<p className="text-[9px] font-medium text-muted-foreground/60 uppercase tracking-wider mt-auto">
							Sudah Terkirim
						</p>
					</CardContent>
				</Card>
			</div>
			{/* Order Management System */}
			<div className="space-y-4">
				<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
					<div className="flex flex-col lg:flex-row flex-1 lg:items-center gap-4 w-full">
						{/* Container for Dropdowns - Full width on mobile/tablet, auto on desktop */}
						<div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full lg:w-auto">
							<div className="flex-1 md:flex-1 lg:w-[200px] lg:flex-none">
								<Select value={sortBy} onValueChange={setSortBy}>
									<SelectTrigger className="w-full h-10 border-border bg-card">
										<SelectValue placeholder="Urutkan Berdasarkan" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="newest">Terbaru</SelectItem>
										<SelectItem value="oldest">Terlama</SelectItem>
										<SelectItem value="deadline">Deadline Terdekat</SelectItem>
										<SelectItem value="updated">Terakhir Diupdate</SelectItem>
										<SelectItem value="longest_pending">
											Paling Lama Tertunda
										</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="flex-1 md:flex-1 lg:w-[160px] lg:flex-none">
								<Select value={statusFilter} onValueChange={setStatusFilter}>
									<SelectTrigger className="w-full h-10 border-border bg-card">
										<SelectValue placeholder="Filter Status" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="ALL">Semua Status</SelectItem>
										{Object.entries(STATUS_LABELS).map(([key, { label }]) => (
											<SelectItem key={key} value={key}>
												{label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						{/* Container for Search - Full width on mobile/tablet, limited on desktop */}
						<div className="flex-1 w-full lg:flex-none lg:w-[320px]">
							<div className="relative w-full">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Cari nama atau kode order..."
									className="pl-10 h-10 border-border bg-card w-full"
									value={search}
									onChange={(e) => setSearch(e.target.value)}
								/>
							</div>
						</div>
					</div>
					<Button
						onClick={() => {
							setEditOrder(null);
							setFormName("");
							setFormDesc("");
							setFormDate("");
							setIsCreateSheetOpen(true);
						}}
						className="w-full lg:w-auto gap-2 bg-primary hover:bg-primary/90 text-primary-foreground h-11 px-8 rounded-md font-bold shadow-sm"
					>
						<Plus className="h-4 w-4" />
						Buat Order
					</Button>
				</div>

				<div className="rounded-md border border-border bg-background overflow-hidden">
					<Table>
						<TableHeader className="bg-card">
							<TableRow>
								<TableHead className="w-[180px] px-6">Kode Order</TableHead>
								<TableHead className="px-6">Customer</TableHead>
								<TableHead className="max-w-[200px] px-6">Deskripsi</TableHead>
								<TableHead className="px-6">Status</TableHead>
								<TableHead className="px-6">Estimasi Selesai</TableHead>
								<TableHead className="text-right px-6">Aksi</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{orders.length > 0 ? (
								orders.map((order) => (
									<TableRow
										key={order.id}
										className="cursor-pointer hover:bg-accent/50 transition-colors"
										onClick={() => {
											setSelectedOrderDetails(order);
										}}
									>
										<TableCell className="font-mono font-medium text-primary hover:underline px-6">
											{order.order_code}
										</TableCell>
										<TableCell className="font-medium text-foreground px-6">
											{order.customer_name}
										</TableCell>
										<TableCell className="max-w-[200px] truncate text-muted-foreground px-6">
											{order.order_description}
										</TableCell>
										<TableCell className="px-6">
											<Badge
												className={`${STATUS_LABELS[order.current_status].color} border-none font-medium px-2 py-0.5`}
											>
												{STATUS_LABELS[order.current_status].label}
											</Badge>
											{(order.is_pending ||
												order.current_status === "PENDING") && (
												<AlertCircle className="inline h-3.5 w-3.5 ml-1.5 text-destructive mb-0.5" />
											)}
										</TableCell>
										<TableCell className="text-muted-foreground px-6">
											{new Date(
												order.estimated_finished_date,
											).toLocaleDateString("id-ID", {
												day: "numeric",
												month: "short",
												year: "numeric",
											})}
										</TableCell>
										<TableCell
											className="text-right px-6"
											onClick={(e) => e.stopPropagation()}
										>
											<DropdownMenu>
												<DropdownMenuTrigger
													render={
														<Button variant="ghost" className="h-8 w-8 p-0">
															<MoreHorizontal className="h-4 w-4" />
														</Button>
													}
												/>
												<DropdownMenuContent align="end">
													<DropdownMenuItem
														onClick={() => openEdit(order)}
														className="gap-2 focus:bg-accent cursor-pointer"
													>
														<Edit className="h-4 w-4 text-muted-foreground" />{" "}
														Edit
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() => {
															setUpdatingOrder(order);
															setNewStatus(null);
															setStatusNotes("");
															setIssueDesc(
																order.production_issue?.issue_description ?? "",
															);
															setIssueSolution(
																order.production_issue?.solution ?? "",
															);
															setIssueAdjDate(
																order.production_issue?.adjust_finished_date
																	? new Date(
																			order.production_issue
																				.adjust_finished_date,
																		)
																			.toISOString()
																			.split("T")[0]
																	: "",
															);
															setIssueIsResolved(
																order.production_issue?.is_resolved ?? false,
															);
															setIsUpdateStatusSheetOpen(true);
														}}
														className="gap-2 focus:bg-accent cursor-pointer"
													>
														<RefreshCcw className="h-4 w-4 text-muted-foreground" />{" "}
														Update Status
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() => {
															const platformUrl =
																import.meta.env.VITE_PLATFORM_URL ||
																"http://localhost:3000";
															const shareUrl = `${platformUrl}/track/${order.order_code}`;
															navigator.clipboard.writeText(shareUrl);
															toast.success(
																"Link pelacakan berhasil disalin ke clipboard",
															);
														}}
														className="gap-2 focus:bg-accent cursor-pointer"
													>
														<ExternalLink className="h-4 w-4 text-muted-foreground" />{" "}
														Salin Link Pelacakan
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() => setDeleteId(order.id)}
														className="gap-2 text-destructive focus:text-destructive cursor-pointer"
													>
														<Trash2 className="h-4 w-4" /> Hapus
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={6} className="h-[450px] text-center">
										<div className="flex flex-col items-center justify-center space-y-4 max-w-[320px] mx-auto">
											<div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
												{isLoading ? (
													<RefreshCcw className="h-10 w-10 text-muted-foreground/30 animate-spin" />
												) : stats.total === 0 ? (
													<Shirt className="h-10 w-10 text-muted-foreground/30" />
												) : (
													<Search className="h-10 w-10 text-muted-foreground/30" />
												)}
											</div>
											<div className="space-y-1">
												<p className="font-bold text-lg text-foreground">
													{isLoading
														? "Memuat Data..."
														: stats.total === 0
															? "Belum ada pesanan"
															: "Pesanan tidak ditemukan"}
												</p>
												<p className="text-sm text-muted-foreground">
													{isLoading
														? "Mohon tunggu sebentar sedang mengambil data."
														: stats.total === 0
															? "Silakan klik tombol 'Buat Order' untuk mulai."
															: "Coba gunakan kata kunci pencarian atau filter yang berbeda."}
												</p>
											</div>
											{!isLoading && stats.total === 0 && (
												<Button
													variant="outline"
													onClick={() => {
														setEditOrder(null);
														setFormName("");
														setFormDesc("");
														setFormDate("");
														setIsCreateSheetOpen(true);
													}}
													className="h-10 px-6 rounded-md font-bold border-primary/20 hover:bg-primary/5 text-primary"
												>
													<Plus className="h-4 w-4 mr-2" />
													Buat Order Pertama
												</Button>
											)}
										</div>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>

				{/* Pagination Controls */}
				<div className="flex items-center justify-between px-4 py-4 border-t border-border">
					<p className="text-xs text-muted-foreground font-medium">
						Showing {(page - 1) * itemsPerPage + 1} to{" "}
						{Math.min(page * itemsPerPage, totalItems)} of {totalItems} orders
					</p>
					<Pagination className="mx-0 w-auto">
						<PaginationContent>
							<PaginationItem>
								<PaginationPrevious
									onClick={() => setPage((p) => Math.max(1, p - 1))}
									disabled={page === 1}
									className={cn(
										"cursor-pointer disabled:opacity-50 disabled:pointer-events-none",
									)}
								/>
							</PaginationItem>

							{/* Page Numbers */}
							{[...Array(totalPages)].map((_, i) => {
								const p = i + 1;
								if (
									p === 1 ||
									p === totalPages ||
									(p >= page - 1 && p <= page + 1)
								) {
									return (
										<PaginationItem key={p}>
											<PaginationLink
												isActive={p === page}
												onClick={() => setPage(p)}
												className="cursor-pointer"
											>
												{p}
											</PaginationLink>
										</PaginationItem>
									);
								}
								if (p === 2 || p === totalPages - 1) {
									return (
										<PaginationItem key={p}>
											<PaginationEllipsis />
										</PaginationItem>
									);
								}
								return null;
							})}

							<PaginationItem>
								<PaginationNext
									onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
									disabled={page === totalPages || totalPages === 0}
									className={cn(
										"cursor-pointer disabled:opacity-50 disabled:pointer-events-none",
									)}
								/>
							</PaginationItem>
						</PaginationContent>
					</Pagination>
				</div>
			</div>
			{/* Create / Edit Sheet */}
			<Sheet
				open={isCreateSheetOpen || !!editOrder}
				onOpenChange={(open) => {
					if (!open) {
						setIsCreateSheetOpen(false);
						setEditOrder(null);
					}
				}}
			>
				<SheetContent
					side="right"
					className="w-full sm:max-w-xl p-0 flex flex-col h-full"
				>
					<SheetHeader className="text-left border-b border-border p-8 pb-6 shrink-0">
						<SheetTitle className="text-2xl">
							{editOrder ? "Edit Order" : "Buat Order Baru"}
						</SheetTitle>
						<SheetDescription className="text-sm">
							{editOrder
								? "Perbarui detail pesanan pelanggan."
								: "Lengkapi formulir di bawah untuk membuat pesanan baru."}
						</SheetDescription>
					</SheetHeader>

					<div className="flex-1 overflow-y-auto p-8 space-y-6">
						<div className="grid gap-2">
							<Label
								htmlFor="name"
								className="text-xs uppercase tracking-widest font-bold text-muted-foreground"
							>
								Nama Customer
							</Label>
							<Input
								id="name"
								placeholder="Budi Santoso"
								className="bg-card border-border h-11 focus-visible:ring-primary/20"
								value={formName}
								onChange={(e) => setFormName(e.target.value)}
							/>
						</div>
						<div className="grid gap-2">
							<Label
								htmlFor="desc"
								className="text-xs uppercase tracking-widest font-bold text-muted-foreground"
							>
								Deskripsi Order
							</Label>
							<Textarea
								id="desc"
								className="bg-card border-border min-h-[120px] focus-visible:ring-primary/20"
								placeholder="Jenis, bahan, warna, ukuran, jumlah..."
								value={formDesc}
								onChange={(e) => setFormDesc(e.target.value)}
							/>
						</div>
						<div className="grid gap-2">
							<Label
								htmlFor="eta"
								className="text-xs uppercase tracking-widest font-bold text-muted-foreground"
							>
								Estimasi Selesai
							</Label>
							<Input
								id="eta"
								type="date"
								className="bg-card border-border h-11 focus-visible:ring-primary/20"
								value={formDate}
								onChange={(e) => setFormDate(e.target.value)}
							/>
						</div>
					</div>

					<div className="px-8 py-6 border-t border-border shrink-0">
						<Button
							className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-md"
							disabled={isCreating || isUpdatingOrder}
							onClick={() => {
								if (editOrder) {
									updateOrderDetails();
								} else {
									createOrder();
								}
							}}
						>
							{isCreating || isUpdatingOrder
								? "Menyimpan..."
								: editOrder
									? "Simpan Perubahan"
									: "Buat Order"}
						</Button>
					</div>
				</SheetContent>
			</Sheet>
			{/* Delete Confirm Dialog */}
			<Dialog
				open={!!deleteId}
				onOpenChange={(open) => !open && setDeleteId(null)}
			>
				<DialogContent className="max-w-[90vw] sm:max-w-md rounded-md">
					<DialogHeader>
						<DialogTitle>Konfirmasi Hapus</DialogTitle>
						<DialogDescription>
							Apakah Anda yakin ingin menghapus data order ini? Tindakan ini
							tidak dapat dibatalkan.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="flex-row gap-2 mt-4">
						<Button
							variant="outline"
							className="flex-1"
							onClick={() => setDeleteId(null)}
						>
							Batal
						</Button>
						<Button
							variant="destructive"
							className="flex-1"
							disabled={isDeleting}
							onClick={() => deleteId && deleteOrder(deleteId)}
						>
							{isDeleting ? "Menghapus..." : "Hapus Sekarang"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
			{/* Order Detail & Status Update Sheet */}
			<Sheet
				open={!!selectedOrderDetails}
				onOpenChange={(open) => !open && setSelectedOrderDetails(null)}
			>
				<SheetContent
					side="right"
					className="w-full sm:max-w-2xl p-0 flex flex-col h-full"
				>
					<SheetHeader className="text-left border-b border-border p-8 pb-6 shrink-0">
						<SheetTitle className="text-2xl">Detail Pesanan</SheetTitle>
						<SheetDescription>
							Lihat rincian lengkap pengerjaan order{" "}
							<span className="font-bold text-primary">
								{selectedOrderDetails?.order_code}
							</span>
						</SheetDescription>
					</SheetHeader>

					<div className="flex-1 overflow-y-auto p-8 space-y-6">
						{selectedOrderDetails && (
							<div className="grid gap-6">
								<div className="space-y-4 rounded-lg bg-muted/50 p-4 border border-border">
									<div className="grid grid-cols-2 gap-4">
										<div>
											<Label className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
												Customer
											</Label>
											<p className="font-semibold text-foreground">
												{selectedOrderDetails.customer_name}
											</p>
										</div>
										<div>
											<Label className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
												Status Saat Ini
											</Label>
											<div>
												<Badge
													className={`${STATUS_LABELS[selectedOrderDetails.current_status].color} border-none font-medium`}
												>
													{
														STATUS_LABELS[selectedOrderDetails.current_status]
															.label
													}
												</Badge>
											</div>
										</div>
										<div>
											<Label className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
												Estimasi Selesai
											</Label>
											<p className="font-semibold text-foreground">
												{format(
													new Date(
														selectedOrderDetails.estimated_finished_date,
													),
													"dd MMMM yyyy",
												)}
											</p>
										</div>
										<div>
											<Label className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
												Dibuat Oleh
											</Label>
											<div className="flex items-center gap-1.5 font-semibold text-foreground">
												<User className="h-3.5 w-3.5 text-muted-foreground" />
												{selectedOrderDetails.createdBy?.name ||
													`Admin #${selectedOrderDetails.created_by}`}
											</div>
										</div>
										<div>
											<Label className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
												Dibuat Pada
											</Label>
											<div className="flex items-center gap-1.5 font-semibold text-foreground">
												<CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
												{format(
													new Date(selectedOrderDetails.created_at),
													"dd/MM/yyyy, HH:mm:ss",
												)}
											</div>
										</div>
										<div>
											<Label className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
												Diperbarui
											</Label>
											<div className="flex items-center gap-1.5 font-semibold text-foreground">
												<History className="h-3.5 w-3.5 text-muted-foreground" />
												{format(
													new Date(selectedOrderDetails.updated_at),
													"dd/MM/yyyy, HH:mm:ss",
												)}
											</div>
										</div>
										<div className="col-span-2 pt-2 border-t border-border/50">
											<Label className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
												Deskripsi Order
											</Label>
											<p className="font-semibold text-foreground mt-1 leading-relaxed">
												{selectedOrderDetails.order_description}
											</p>
										</div>
									</div>
								</div>

								{/* Status Timeline */}
								<div className="space-y-4 mt-4">
									<h3 className="font-bold text-sm text-muted-foreground uppercase tracking-widest">
										Riwayat Status
									</h3>
									<div className="space-y-6 relative before:absolute before:left-5 before:top-0 before:bottom-0 before:-translate-x-px before:w-[1px] before:bg-border">
										{(selectedOrderDetails.status_updates ?? []).length > 0 ? (
											selectedOrderDetails.status_updates?.map((item, idx) => (
												<div
													key={item.id}
													className="relative flex items-start gap-4 pl-10"
												>
													<div
														className={`absolute left-5 -translate-x-1/2 mt-1.5 h-3 w-3 rounded-full border-2 border-background shadow-sm ${STATUS_DOT_CLASSES[item.status]} ${idx === 0 ? "scale-125" : ""}`}
													/>
													<div className="flex flex-col gap-0.5 flex-1">
														<div className="flex items-center gap-2">
															<span className="text-xs font-medium text-muted-foreground">
																{format(
																	new Date(item.created_at),
																	"dd/MM/yyyy, HH:mm:ss",
																)}
															</span>
															<span className="text-[10px] font-bold text-muted-foreground/50 uppercase">
																•
															</span>
															<span className="text-[10px] font-bold text-primary/70 uppercase tracking-tight">
																{item.user?.name || `Admin #${item.created_by}`}
															</span>
														</div>
														<span className="font-semibold text-sm text-foreground">
															{STATUS_LABELS[item.status].label}
														</span>
														{item.notes && (
															<p className="text-sm text-muted-foreground italic">
																"{item.notes}"
															</p>
														)}

														{/* Pending Status Details */}
														{item.status === "PENDING" &&
															selectedOrderDetails.production_issue &&
															(() => {
																const issue =
																	selectedOrderDetails.production_issue;
																const isItemResolved =
																	issue.is_resolved &&
																	issue.resolved_at &&
																	new Date(item.created_at).getTime() + 5000 >=
																		new Date(issue.resolved_at).getTime();

																return (
																	<div
																		className={
																			isItemResolved
																				? "success-history-card"
																				: "pending-history-card"
																		}
																	>
																		<div className="grid gap-2 text-xs">
																			<div className="grid gap-0.5">
																				<span
																					className={cn(
																						"font-bold uppercase tracking-widest text-[9px]",
																						isItemResolved
																							? "text-stat-success"
																							: "text-stat-danger",
																					)}
																				>
																					Kendala
																				</span>
																				<p className="text-foreground">
																					{issue.issue_description}
																				</p>
																			</div>
																			<div className="grid gap-0.5">
																				<span
																					className={cn(
																						"font-bold uppercase tracking-widest text-[9px]",
																						isItemResolved
																							? "text-stat-success"
																							: "text-stat-danger",
																					)}
																				>
																					Solusi
																				</span>
																				<p className="text-foreground">
																					{issue.solution}
																				</p>
																			</div>
																			{issue.adjust_finished_date && (
																				<div className="grid gap-0.5">
																					<span
																						className={cn(
																							"font-bold uppercase tracking-widest text-[9px]",
																							isItemResolved
																								? "text-stat-success"
																								: "text-stat-danger",
																						)}
																					>
																						Revisi Estimasi Selesai
																					</span>
																					<p className="text-foreground">
																						{format(
																							new Date(
																								issue.adjust_finished_date,
																							),
																							"dd MMMM yyyy",
																						)}
																					</p>
																				</div>
																			)}
																			<div
																				className={cn(
																					"pt-2 mt-2 border-t flex flex-wrap gap-4",
																					isItemResolved
																						? "border-stat-success/10"
																						: "border-stat-danger/10",
																				)}
																			>
																				<div className="grid gap-0.5">
																					<span
																						className={cn(
																							"font-bold uppercase tracking-widest text-[9px]",
																							isItemResolved
																								? "text-stat-success"
																								: "text-stat-danger",
																						)}
																					>
																						Status Kendala
																					</span>
																					<div className="flex items-center gap-1.5">
																						<Badge
																							className={
																								isItemResolved
																									? "bg-stat-success/10 text-stat-success border-none"
																									: "bg-stat-danger/10 text-stat-danger border-none"
																							}
																						>
																							{isItemResolved
																								? "Teratasi"
																								: "Belum Teratasi"}
																						</Badge>
																					</div>
																				</div>
																				{isItemResolved && (
																					<>
																						<div className="grid gap-0.5">
																							<span className="font-bold text-stat-success uppercase tracking-widest text-[9px]">
																								Teratasi Pada
																							</span>
																							<p className="text-foreground">
																								{issue.resolved_at
																									? format(
																											new Date(
																												issue.resolved_at,
																											),
																											"dd/MM/yyyy, HH:mm:ss",
																										)
																									: "-"}
																							</p>
																						</div>
																						<div className="grid gap-0.5">
																							<span className="font-bold text-stat-success uppercase tracking-widest text-[9px]">
																								Teratasi Oleh
																							</span>
																							<p className="text-foreground whitespace-nowrap">
																								{issue.resolver?.name ||
																									`Admin #${issue.resolved_by}`}
																							</p>
																						</div>
																					</>
																				)}
																			</div>
																		</div>
																	</div>
																);
															})()}
													</div>
												</div>
											))
										) : (
											<p className="text-xs text-muted-foreground ml-10">
												Belum ada riwayat status.
											</p>
										)}
									</div>
								</div>
							</div>
						)}
					</div>

					{selectedOrderDetails && (
						<div className="px-8 py-6 border-t border-border mt-auto shrink-0 flex gap-4">
							<Button
								variant="outline"
								className="flex-1 h-11 rounded-md border-border font-bold"
								onClick={() => {
									openEdit(selectedOrderDetails);
									setSelectedOrderDetails(null);
								}}
							>
								<Edit className="h-4 w-4 mr-2" />
								Edit Order
							</Button>
							<Button
								className="flex-1 h-11 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
								onClick={() => {
									const order = selectedOrderDetails;
									if (order) {
										setUpdatingOrder(order);
										setNewStatus(null);
										setStatusNotes("");
										setIssueDesc(
											order.production_issue?.issue_description ?? "",
										);
										setIssueSolution(order.production_issue?.solution ?? "");
										setIssueAdjDate(
											order.production_issue?.adjust_finished_date
												? new Date(order.production_issue.adjust_finished_date)
														.toISOString()
														.split("T")[0]
												: "",
										);
										setIssueIsResolved(
											order.production_issue?.is_resolved ?? false,
										);
										setSelectedOrderDetails(null);
										setIsUpdateStatusSheetOpen(true);
									}
								}}
							>
								<RefreshCcw className="h-4 w-4 mr-2" />
								Update Status
							</Button>
						</div>
					)}
				</SheetContent>
			</Sheet>
			{/* Update Status Sheet */}{" "}
			<Sheet
				open={isUpdateStatusSheetOpen}
				onOpenChange={setIsUpdateStatusSheetOpen}
			>
				<SheetContent
					side="right"
					className="w-full sm:max-w-xl p-0 flex flex-col h-full"
				>
					<SheetHeader className="text-left border-b border-border p-8 pb-6 shrink-0">
						<SheetTitle className="text-2xl">Update Status Order</SheetTitle>
						<SheetDescription>
							Perbarui status pengerjaan untuk order{" "}
							<span className="font-bold text-primary">
								{updatingOrder?.order_code}
							</span>
						</SheetDescription>
					</SheetHeader>

					<div className="flex-1 overflow-y-auto p-8 space-y-6">
						{updatingOrder && (
							<div className="grid gap-6">
								<div className="grid gap-2">
									<Label className="text-xs text-muted-foreground uppercase font-bold tracking-widest">
										Ubah Status
									</Label>
									<select
										className="flex h-11 w-full rounded-md border border-border bg-card text-foreground px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
										onChange={(e) =>
											setNewStatus(e.target.value as OrderStatus)
										}
										value={newStatus ?? updatingOrder.current_status}
									>
										{Object.entries(STATUS_LABELS).map(([val, { label }]) => (
											<option key={val} value={val}>
												{label}
											</option>
										))}
									</select>
								</div>

								{(newStatus === "PENDING" ||
									(updatingOrder.current_status === "PENDING" &&
										!newStatus)) && (
									<div
										className={cn(
											"p-4 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-2 border transition-colors",
											issueIsResolved
												? "bg-stat-success/5 dark:bg-stat-success/10 border-stat-success/20"
												: "bg-stat-danger/5 dark:bg-stat-danger/10 border-stat-danger/20",
										)}
									>
										<div
											className={cn(
												"flex items-center space-x-2 pb-2 border-b",
												issueIsResolved
													? "border-stat-success/10"
													: "border-stat-danger/10",
											)}
										>
											<Checkbox
												id="resolved-sheet"
												checked={issueIsResolved}
												onCheckedChange={(checked) =>
													setIssueIsResolved(checked as boolean)
												}
												className="data-[state=checked]:bg-stat-success data-[state=checked]:border-stat-success"
											/>
											<label
												htmlFor="resolved-sheet"
												className={cn(
													"text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer",
													issueIsResolved
														? "text-stat-success"
														: "text-stat-danger",
												)}
											>
												Apakah Kendala Sudah Teratasi?
											</label>
										</div>

										<div className="grid gap-2">
											<Label
												className={cn(
													"text-[10px] uppercase font-bold tracking-widest transition-colors",
													issueIsResolved
														? "text-stat-success/70"
														: "text-stat-danger/70",
												)}
											>
												Deskripsi Kendala
											</Label>
											<Textarea
												placeholder="Sebutkan kendala yang terjadi..."
												className={cn(
													"bg-white dark:bg-card shadow-none rounded-md min-h-[80px] transition-colors",
													issueIsResolved
														? "border-stat-success/20 dark:border-stat-success/30 focus-visible:ring-stat-success/20"
														: "border-stat-danger/20 dark:border-stat-danger/30 focus-visible:ring-stat-danger/20",
												)}
												value={issueDesc}
												onChange={(e) => setIssueDesc(e.target.value)}
											/>
										</div>
										<div className="grid gap-2">
											<Label
												className={cn(
													"text-[10px] uppercase font-bold tracking-widest transition-colors",
													issueIsResolved
														? "text-stat-success/70"
														: "text-stat-danger/70",
												)}
											>
												Rencana Solusi
											</Label>
											<Textarea
												placeholder="Tindakan yang akan atau sedang diambil..."
												className={cn(
													"bg-white dark:bg-card shadow-none rounded-xl min-h-[80px] transition-colors",
													issueIsResolved
														? "border-stat-success/20 dark:border-stat-success/30 focus-visible:ring-stat-success/20"
														: "border-stat-danger/20 dark:border-stat-danger/30 focus-visible:ring-stat-danger/20",
												)}
												value={issueSolution}
												onChange={(e) => setIssueSolution(e.target.value)}
											/>
										</div>
										<div className="grid gap-2">
											<Label
												className={cn(
													"text-[10px] uppercase font-bold tracking-widest transition-colors",
													issueIsResolved
														? "text-stat-success/70"
														: "text-stat-danger/70",
												)}
											>
												Revisi Estimasi Selesai
											</Label>
											<Input
												type="date"
												className={cn(
													"bg-white dark:bg-card shadow-none rounded-md h-11 transition-colors",
													issueIsResolved
														? "border-stat-success/20 dark:border-stat-success/30 focus-visible:ring-stat-success/20"
														: "border-stat-danger/20 dark:border-stat-danger/30 focus-visible:ring-stat-danger/20",
												)}
												value={issueAdjDate}
												onChange={(e) => setIssueAdjDate(e.target.value)}
											/>
										</div>
									</div>
								)}

								<div className="grid gap-2">
									<Label className="text-xs text-muted-foreground uppercase font-bold tracking-widest">
										Catatan Status (Opsional)
									</Label>
									<Textarea
										placeholder="Misal: Mulai potong bahan, Sudah dikirim, dll"
										className="border-border bg-card rounded-md shadow-none min-h-[100px] focus-visible:ring-primary/20"
										value={statusNotes}
										onChange={(e) => setStatusNotes(e.target.value)}
									/>
								</div>
							</div>
						)}
					</div>

					<div className="px-8 py-6 border-t border-border shrink-0 flex gap-4">
						<Button
							variant="outline"
							className="flex-1 h-11 rounded-md border-border font-bold"
							onClick={() => setIsUpdateStatusSheetOpen(false)}
						>
							Batal
						</Button>
						<Button
							className="flex-1 h-11 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
							disabled={isUpdating}
							onClick={() => updateStatus()}
						>
							{isUpdating ? "Menyimpan..." : "Simpan Perubahan"}
						</Button>
					</div>
				</SheetContent>
			</Sheet>
		</div>
	);
}
