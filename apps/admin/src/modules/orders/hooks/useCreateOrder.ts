import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { apiClient } from "@/utils/api";

interface CreateOrderInput {
	customer_name: string;
	order_description: string;
	estimated_finished_date: string;
}

export const useCreateOrder = (onSuccess?: () => void) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: CreateOrderInput) => {
			const token = localStorage.getItem("token");
			const res = await apiClient.api.orders.$post(
				{ json: input },
				{ headers: { Authorization: `Bearer ${token}` } },
			);
			if (!res.ok) throw new Error("Gagal membuat order");
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["orders"] });
			toast.success("Order berhasil dibuat");
			onSuccess?.();
		},
		onError: () => {
			toast.error("Gagal membuat order");
		},
	});
};
