import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { apiClient } from "@/utils/api";

interface BaseStatusInput {
	notes?: string;
}

interface PendingStatusInput extends BaseStatusInput {
	status: "PENDING";
	issue_description: string;
	solution: string;
	adjust_finished_date?: string;
}

interface NonPendingStatusInput extends BaseStatusInput {
	status:
		| "ORDER_DITERIMA"
		| "APPROVAL_SAMPLE"
		| "MENUNGGU_ANTRIAN"
		| "PRODUKSI_BERJALAN"
		| "QUALITY_CHECK"
		| "SIAP_DIAMBIL"
		| "ORDER_SELESAI";
}

export type UpdateStatusInput = PendingStatusInput | NonPendingStatusInput;

export const useUpdateStatus = (onSuccess?: () => void) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			orderId,
			input,
		}: {
			orderId: number;
			input: UpdateStatusInput;
		}) => {
			const token = localStorage.getItem("token");
			const res = await apiClient.api.orders[":id"]["status-updates"].$post(
				{
					param: { id: String(orderId) },
					json: input,
				},
				{ headers: { Authorization: `Bearer ${token}` } },
			);

			if (!res.ok) {
				const text = await res.text();
				try {
					const errorData = JSON.parse(text);
					throw new Error(errorData.message || "Gagal update status");
				} catch {
					throw new Error("Gagal update status");
				}
			}

			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["orders"] });
			toast.success("Status berhasil diperbarui");
			onSuccess?.();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Gagal memperbarui status");
		},
	});
};
