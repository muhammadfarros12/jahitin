import { Trash2, X } from "lucide-react";
import { useDeleteOrder } from "@/modules/orders/hooks/useDeleteOrder";

interface Props {
	orderId: number;
	orderCode: string;
	customerName: string;
	onClose: () => void;
}

export function DeleteOrderModal({
	orderId,
	orderCode,
	customerName,
	onClose,
}: Props) {
	const { mutate: deleteOrder, isPending } = useDeleteOrder(onClose);

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
			<div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
				{/* Header */}
				<div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
					<div className="flex items-center gap-3">
						<div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
							<Trash2 size={16} className="text-red-600" />
						</div>
						<h2 className="text-base font-bold text-slate-900">Hapus Order</h2>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
					>
						<X size={18} />
					</button>
				</div>

				{/* Body */}
				<div className="px-6 py-5">
					<p className="text-sm text-slate-600 leading-relaxed">
						Yakin ingin menghapus order{" "}
						<span className="font-semibold text-slate-900 font-mono">
							{orderCode}
						</span>{" "}
						atas nama{" "}
						<span className="font-semibold text-slate-900">{customerName}</span>
						?
					</p>
					<p className="text-xs text-red-600 mt-2">
						Tindakan ini tidak dapat dibatalkan.
					</p>
				</div>

				{/* Footer */}
				<div className="flex gap-3 px-6 pb-6">
					<button
						type="button"
						onClick={onClose}
						className="flex-1 px-4 py-3 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
					>
						Batal
					</button>
					<button
						type="button"
						disabled={isPending}
						onClick={() => deleteOrder(orderId)}
						className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isPending ? "Menghapus..." : "Hapus Order"}
					</button>
				</div>
			</div>
		</div>
	);
}
