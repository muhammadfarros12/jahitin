import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import toast from "react-hot-toast";
import { apiClient } from "@/utils/api";

interface LoginInput {
	email: string;
	password: string;
}

export const useLogin = () => {
	const navigate = useNavigate();

	return useMutation({
		mutationKey: ["auth", "login"],
		mutationFn: async ({ email, password }: LoginInput) => {
			const res = await apiClient.api.login.$post({
				json: { email, password },
			});

			if (!res.ok) {
				throw new Error("Login failed");
			}
			const data = await res.json();
			return data;
		},
		onSuccess: (data) => {
			localStorage.setItem("token", data.token);
			toast.success("Login successfull, redirecting ...");
			setTimeout(() => {
				navigate({ to: "/dashboard" });
			}, 500);
		},
		onError: (err) => {
			if (err instanceof Error) {
				toast.error(err.message);
				return;
			}
			const error = err as { error: string };
			toast.error(error.error);
		},
	});
};
