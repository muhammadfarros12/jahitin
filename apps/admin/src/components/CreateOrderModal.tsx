import { X } from "lucide-react";
import { useState } from "react";
import { useCreateOrder } from "@/modules/orders/hooks/useCreateOrder";

interface Props {
	onClose: () => void;
}

export function CreateOrderModal({ onClose }: Props) {
	const [customerName, setCustomerName] = useState("");
	const [orderDescription, setOrderDescription] = useState("");
	const [estimatedFinishedDate, setEstimatedFinishedDate] = useState("");

	const { mutate: createOrder, isPending } = useCreateOrder(onClose);

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		createOrder({
			customer_name: customerName,
			order_description: orderDescription,
			estimated_finished_date: estimatedFinishedDate,
		});
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
			<div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
				{/* Header */}
				<div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
					<div>
						<h2 className="text-lg font-bold text-slate-900">
							Buat Order Baru
						</h2>
						<p className="text-xs text-slate-500 mt-0.5">
							Kode order akan digenerate otomatis
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
					<div>
						<label
							htmlFor="customer_name"
							className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2"
						>
							Nama Pemesan
						</label>
						<input
							id="customer_name"
							type="text"
							required
							value={customerName}
							onChange={(e) => setCustomerName(e.target.value)}
							placeholder="Contoh: Budi Santoso"
							className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
						/>
					</div>

					<div>
						<label
							htmlFor="order_description"
							className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2"
						>
							Deskripsi Order
						</label>
						<textarea
							id="order_description"
							required
							rows={3}
							value={orderDescription}
							onChange={(e) => setOrderDescription(e.target.value)}
							placeholder="Contoh: Kaos polos 50 pcs warna hitam, ukuran M-XL"
							className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none"
						/>
					</div>

					<div>
						<label
							htmlFor="estimated_date"
							className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2"
						>
							Estimasi Tanggal Selesai
						</label>
						<input
							id="estimated_date"
							type="date"
							required
							value={estimatedFinishedDate}
							onChange={(e) => setEstimatedFinishedDate(e.target.value)}
							min={new Date().toISOString().split("T")[0]}
							className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
						/>
					</div>

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
							{isPending ? "Menyimpan..." : "Buat Order"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
