import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { apiClient } from "@/utils/api";

interface ResolveIssueInput {
	orderId: number;
	solution: string;
	is_resolved: boolean;
}

export const useResolveIssue = (onSuccess?: () => void) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			orderId,
			solution,
			is_resolved,
		}: ResolveIssueInput) => {
			const token = localStorage.getItem("token");
			const res = await apiClient.api.orders[":id"].issue.$patch(
				{
					param: { id: String(orderId) },
					json: { solution, is_resolved },
				},
				{ headers: { Authorization: `Bearer ${token}` } },
			);

			if (!res.ok) {
				const text = await res.text();
				try {
					const errorData = JSON.parse(text);
					throw new Error(errorData.message || "Gagal menyelesaikan kendala");
				} catch {
					throw new Error("Gagal menyelesaikan kendala");
				}
			}

			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["orders"] });
			queryClient.invalidateQueries({ queryKey: ["order-stats"] });
			toast.success("Kendala berhasil diselesaikan");
			onSuccess?.();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Gagal menyelesaikan kendala");
		},
	});
};
