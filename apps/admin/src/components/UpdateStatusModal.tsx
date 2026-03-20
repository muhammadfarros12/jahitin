import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";
import {
	type UpdateStatusInput,
	useUpdateStatus,
} from "@/modules/orders/hooks/useUpdateStatus";

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
				status: status as UpdateStatusInput["status"],
				notes: notes || undefined,
			};
		}

		updateStatus({ orderId, input });
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			{/* Backdrop */}
		<button
    type="button"
    className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm w-full cursor-default"
    onClick={onClose}
    aria-label="Tutup modal"
/>

			{/* Modal */}
			<div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden max-h-[90vh] overflow-y-auto">
				{/* Header */}
				<div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 sticky top-0 bg-white z-10">
					<div>
						<h2 className="text-lg font-bold text-slate-900">Update Status</h2>
						<p className="text-xs text-slate-500 mt-0.5 font-mono">
							{orderCode}
						</p>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
					>
						<X size={18} />
					</button>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit} className="p-6 space-y-5">
					{/* Status Select */}
					<div>
						<label
							htmlFor="status"
							className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2"
						>
							Status Baru
						</label>
						<select
							id="status"
							required
							value={status}
							onChange={(e) => setStatus(e.target.value)}
							className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
						>
							{STATUS_OPTIONS.map((opt) => (
								<option key={opt.value} value={opt.value}>
									{opt.label}
								</option>
							))}
						</select>
					</div>

					{/* Notes */}
					<div>
						<label
							htmlFor="notes"
							className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2"
						>
							Catatan{" "}
							<span className="normal-case font-normal text-slate-400">
								(opsional)
							</span>
						</label>
						<textarea
							id="notes"
							rows={2}
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							placeholder="Tambahkan catatan untuk pelanggan..."
							className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none"
						/>
					</div>

					{/* Pending Fields */}
					{isPending_ && (
						<div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-4">
							<div className="flex items-center gap-2 text-orange-700">
								<AlertTriangle size={16} />
								<span className="text-xs font-semibold uppercase tracking-widest">
									Detail Kendala Produksi
								</span>
							</div>

							<div>
								<label
									htmlFor="issue_description"
									className="block text-xs font-semibold text-orange-700 uppercase tracking-widest mb-2"
								>
									Kendala
								</label>
								<textarea
									id="issue_description"
									required
									rows={2}
									value={issueDescription}
									onChange={(e) => setIssueDescription(e.target.value)}
									placeholder="Jelaskan kendala yang terjadi..."
									className="w-full px-4 py-3 bg-white border border-orange-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all resize-none"
								/>
							</div>

							<div>
								<label
									htmlFor="solution"
									className="block text-xs font-semibold text-orange-700 uppercase tracking-widest mb-2"
								>
									Solusi
								</label>
								<textarea
									id="solution"
									required
									rows={2}
									value={solution}
									onChange={(e) => setSolution(e.target.value)}
									placeholder="Tindakan yang akan diambil..."
									className="w-full px-4 py-3 bg-white border border-orange-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all resize-none"
								/>
							</div>

							<div>
								<label
									htmlFor="adjust_date"
									className="block text-xs font-semibold text-orange-700 uppercase tracking-widest mb-2"
								>
									Estimasi Penyesuaian Selesai{" "}
									<span className="normal-case font-normal text-orange-500">
										(opsional)
									</span>
								</label>
								<input
									id="adjust_date"
									type="date"
									value={adjustDate}
									onChange={(e) => setAdjustDate(e.target.value)}
									min={new Date().toISOString().split("T")[0]}
									className="w-full px-4 py-3 bg-white border border-orange-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all"
								/>
							</div>
						</div>
					)}

					{/* Footer */}
					<div className="flex gap-3 pt-2">
						<button
							type="button"
							onClick={onClose}
							className="flex-1 px-4 py-3 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
						>
							Batal
						</button>
						<button
							type="submit"
							disabled={isPending}
							className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isPending ? "Menyimpan..." : "Update Status"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
