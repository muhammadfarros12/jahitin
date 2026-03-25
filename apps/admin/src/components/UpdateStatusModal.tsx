"use client";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	type UpdateStatusInput,
	useUpdateStatus,
} from "@/modules/orders/hooks/useUpdateStatus";
import type { OrderStatus } from "@/types";

const STATUS_OPTIONS = [
	{ value: "ORDER_DITERIMA", label: "Order Diterima" },
	{ value: "APPROVAL_SAMPLE", label: "Approval Sample" },
	{ value: "MENUNGGU_ANTRIAN", label: "Menunggu Antrian" },
	{ value: "PRODUKSI_BERJALAN", label: "Produksi Berjalan" },
	{ value: "PENDING", label: "Pending (Kendala)" },
	{ value: "QUALITY_CHECK", label: "Quality Check" },
	{ value: "SIAP_DIAMBIL", label: "Siap Diambil" },
	{ value: "ORDER_SELESAI", label: "Order Selesai" },
];

interface Props {
	orderId: number;
	orderCode: string;
	currentStatus: string;
	onClose: () => void;
}

export function UpdateStatusModal({
	orderId,
	orderCode,
	currentStatus,
	onClose,
}: Props) {
	const [status, setStatus] = useState(currentStatus);
	const [notes, setNotes] = useState("");
	const [issueDescription, setIssueDescription] = useState("");
	const [solution, setSolution] = useState("");
	const [adjustDate, setAdjustDate] = useState("");

	const { mutate: updateStatus, isPending } = useUpdateStatus(onClose);

	const isPending_ = status === "PENDING";

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();

		let input: UpdateStatusInput;

		if (isPending_) {
			input = {
				status: "PENDING",
				notes: notes || undefined,
				issue_description: issueDescription,
				solution: solution,
				adjust_finished_date: adjustDate || undefined,
			};
		} else {
			input = {
				status: status as Exclude<OrderStatus, "PENDING">,
				notes: notes || undefined,
			};
		}

		updateStatus({ orderId, input });
	}

	return (
		<Dialog open={true} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Update Status</DialogTitle>
					<DialogDescription className="font-mono">
						Order: {orderCode}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="status">Status Baru</Label>
						<select
							id="status"
							required
							value={status}
							onChange={(e) => setStatus(e.target.value)}
							className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:bg-input/20 dark:border-input dark:text-foreground transition-all appearance-none cursor-pointer"
						>
							{STATUS_OPTIONS.map((opt) => (
								<option
									key={opt.value}
									value={opt.value}
									className="bg-background"
								>
									{opt.label}
								</option>
							))}
						</select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="notes">
							Catatan{" "}
							<span className="text-muted-foreground font-normal">
								(opsional)
							</span>
						</Label>
						<Textarea
							id="notes"
							rows={2}
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							placeholder="Tambahkan catatan internal atau untuk pelanggan..."
						/>
					</div>

					{isPending_ && (
						<div className="bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 rounded-2xl p-4 space-y-4 animate-in slide-in-from-top-1 duration-200">
							<div className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
								<AlertTriangle size={16} />
								<span className="text-xs font-bold uppercase tracking-widest">
									Detail Kendala Produksi
								</span>
							</div>

							<div className="space-y-2">
								<Label
									htmlFor="issue_description"
									className="text-orange-700 dark:text-orange-400"
								>
									Kendala
								</Label>
								<Textarea
									id="issue_description"
									required
									rows={2}
									value={issueDescription}
									onChange={(e) => setIssueDescription(e.target.value)}
									placeholder="Jelaskan kendala yang terjadi..."
									className="bg-white dark:bg-background border-orange-200 dark:border-orange-900 focus:ring-orange-400"
								/>
							</div>

							<div className="space-y-2">
								<Label
									htmlFor="solution"
									className="text-orange-700 dark:text-orange-400"
								>
									Solusi
								</Label>
								<Textarea
									id="solution"
									required
									rows={2}
									value={solution}
									onChange={(e) => setSolution(e.target.value)}
									placeholder="Tindakan yang akan diambil..."
									className="bg-white dark:bg-background border-orange-200 dark:border-orange-900 focus:ring-orange-400"
								/>
							</div>

							<div className="space-y-2">
								<Label
									htmlFor="adjust_date"
									className="text-orange-700 dark:text-orange-400"
								>
									Estimasi Penyesuaian Selesai
								</Label>
								<Input
									id="adjust_date"
									type="date"
									value={adjustDate}
									onChange={(e) => setAdjustDate(e.target.value)}
									min={new Date().toISOString().split("T")[0]}
									className="bg-white dark:bg-background border-orange-200 dark:border-orange-900 focus:ring-orange-400"
								/>
							</div>
						</div>
					)}

					<DialogFooter className="pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={isPending}
						>
							Batal
						</Button>
						<Button type="submit" disabled={isPending}>
							{isPending ? "Menyimpan..." : "Update Status"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
