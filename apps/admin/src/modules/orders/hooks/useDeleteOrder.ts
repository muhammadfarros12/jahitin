import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { apiClient } from "@/utils/api";

export const useDeleteOrder = (onSuccess?: () => void) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: number) => {
			const token = localStorage.getItem("token");
			const res = await apiClient.api.orders[":id"].$delete(
				{ param: { id: String(id) } },
				{ headers: { Authorization: `Bearer ${token}` } },
			);
			if (!res.ok && res.status !== 204)
				throw new Error("Gagal menghapus order");
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["orders"] });
			toast.success("Order berhasil dihapus");
			onSuccess?.();
		},
		onError: () => {
			toast.error("Gagal menghapus order");
		},
	});
};
